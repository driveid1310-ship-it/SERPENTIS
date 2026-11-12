import type {
  AirQualityDataResult,
  AirQualityProvider,
  LocationContext,
  PollutantKey,
} from '../data-providers/types.js';
import { calculateCpcbNaqi } from './CpcbAqiCalculator.js';
import {
  haversineDistanceKm,
  isReadingStale,
} from '../environmental/EnvironmentalValidationService.js';

/**
 * OpenAQ v3 Provider Adapter for ground monitoring stations in India.
 * Requires OPENAQ_API_KEY (X-API-Key header) from https://explore.openaq.org/.
 */
export class OpenAqAirQualityProvider implements AirQualityProvider {
  public readonly name = 'OpenAQ v3';

  isConfigured(): boolean {
    return Boolean(process.env.OPENAQ_API_KEY && process.env.OPENAQ_API_KEY.trim().length > 0);
  }

  private getBaseUrl(): string {
    return process.env.OPENAQ_API_BASE_URL || 'https://api.openaq.org/v3';
  }

  async fetchAirQuality(location: LocationContext): Promise<AirQualityDataResult> {
    const apiKey = process.env.OPENAQ_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAQ_API_KEY is not configured.');
    }

    const headers = {
      Accept: 'application/json',
      'X-API-Key': apiKey,
    };

    const locUrl = `${this.getBaseUrl()}/locations?coordinates=${location.latitude},${location.longitude}&radius=25000&iso=IN&limit=5`;
    const locRes = await fetch(locUrl, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!locRes.ok) {
      throw new Error(`OpenAQ locations HTTP ${locRes.status}`);
    }

    const locData = (await locRes.json()) as { results?: Array<Record<string, any>> };
    const stations = locData.results ?? [];
    if (stations.length === 0) {
      throw new Error(`No OpenAQ monitoring stations found within 25 km of ${location.name}.`);
    }

    const nearest = stations[0]!;
    const stationId = String(nearest.id);
    const stationName = String(nearest.name || `OpenAQ Station ${stationId}`);
    const stLat = Number(nearest.coordinates?.latitude ?? location.latitude);
    const stLon = Number(nearest.coordinates?.longitude ?? location.longitude);
    const distanceKm = haversineDistanceKm(location.latitude, location.longitude, stLat, stLon);

    const latestUrl = `${this.getBaseUrl()}/locations/${stationId}/latest`;
    const latestRes = await fetch(latestUrl, {
      headers,
      signal: AbortSignal.timeout(10000),
    });

    if (!latestRes.ok) {
      throw new Error(`OpenAQ latest HTTP ${latestRes.status}`);
    }

    const latestData = (await latestRes.json()) as { results?: Array<Record<string, any>> };
    const sensorMap = new Map<number, { parameter: string; units: string }>();
    if (Array.isArray(nearest.sensors)) {
      for (const s of nearest.sensors) {
        if (s?.id && s?.parameter?.name) {
          sensorMap.set(Number(s.id), {
            parameter: String(s.parameter.name).toLowerCase(),
            units: String(s.parameter.units || ''),
          });
        }
      }
    }

    const values: Partial<Record<PollutantKey, number>> = {};
    let latestIso = new Date().toISOString();

    for (const item of latestData.results ?? []) {
      const sensorMeta = sensorMap.get(Number(item.sensorsId));
      const paramName = (sensorMeta?.parameter || '').replace('.', '').toLowerCase();
      const val = Number(item.value);
      if (!Number.isFinite(val)) continue;

      if (item.datetime?.utc) {
        latestIso = String(item.datetime.utc);
      }

      if (paramName === 'pm25') values.pm25 = val;
      else if (paramName === 'pm10') values.pm10 = val;
      else if (paramName === 'no2') values.no2 = val;
      else if (paramName === 'so2') values.so2 = val;
      else if (paramName === 'o3') values.o3 = val;
      else if (paramName === 'nh3') values.nh3 = val;
      else if (paramName === 'co') {
        // OpenAQ often reports CO in ppm or µg/m³; convert µg/m³ -> mg/m³ if > 50
        values.co = sensorMeta?.units?.toLowerCase().includes('µg') || val > 50 ? val / 1000 : val;
      }
    }

    const calc = calculateCpcbNaqi({
      values,
      isOfficialStationMeasurement: true,
    });
    const stale = isReadingStale(latestIso, 240);

    return {
      location,
      provider: this.name,
      attribution: 'Ground station observations via OpenAQ v3',
      methodology: 'CPCB_INDIA_NAQI',
      dataType: 'observed',
      dataQualityStatus: !calc.isOfficialAqi
        ? 'insufficient'
        : stale
          ? 'stale'
          : 'valid',
      isOfficialAqi: calc.isOfficialAqi,
      insufficientReason: calc.insufficientReason,
      isStale: stale,
      isMockFallback: false,
      observationTimestamp: latestIso,
      retrievalTimestamp: new Date().toISOString(),
      overallAqi: calc.overallAqi,
      aqiCategory: calc.aqiCategory,
      aqiColorHex: calc.aqiColorHex,
      dominantPollutant: calc.dominantPollutant,
      healthAdvisory: calc.healthAdvisory,
      reliabilityNote: calc.isOfficialAqi
        ? `Measured at ground station "${stationName}" (${distanceKm} km away).`
        : calc.insufficientReason || 'Station observation did not meet CPCB 3-pollutant requirement.',
      station: {
        stationId,
        stationName,
        provider: String(nearest.provider?.name || 'OpenAQ'),
        distanceKm,
        coordinates: [stLon, stLat],
        isOfficialStation: true,
      },
      pollutants: calc.pollutants,
      hourlyTrend: [],
    };
  }
}
