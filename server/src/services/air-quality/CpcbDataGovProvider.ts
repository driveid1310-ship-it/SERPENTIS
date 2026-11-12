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
 * CPCB / data.gov.in Real-Time Air Quality Resource Adapter.
 * Requires DATA_GOV_IN_API_KEY from https://data.gov.in/.
 */
export class CpcbDataGovProvider implements AirQualityProvider {
  public readonly name = 'CPCB (data.gov.in)';

  isConfigured(): boolean {
    return Boolean(
      process.env.DATA_GOV_IN_API_KEY &&
        process.env.DATA_GOV_IN_API_KEY.trim().length > 0,
    );
  }

  async fetchAirQuality(location: LocationContext): Promise<AirQualityDataResult> {
    const apiKey = process.env.DATA_GOV_IN_API_KEY;
    if (!apiKey) {
      throw new Error('DATA_GOV_IN_API_KEY is not configured.');
    }

    const resourceId =
      process.env.DATA_GOV_IN_AQI_RESOURCE_ID ||
      '3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69';
    const params = new URLSearchParams({
      'api-key': apiKey,
      format: 'json',
      limit: '50',
      'filters[state]': location.state,
    });

    const url = `https://api.data.gov.in/resource/${resourceId}?${params.toString()}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`data.gov.in HTTP ${response.status}`);
    }

    const payload = (await response.json()) as { records?: Array<Record<string, any>> };
    const records = payload.records ?? [];

    // Filter records matching city or nearest coordinates
    const cityRecords = records.filter(
      (r) =>
        String(r.city || '').toLowerCase() === location.city.toLowerCase() ||
        String(r.station || '').toLowerCase().includes(location.city.toLowerCase()),
    );

    const targetRecords = cityRecords.length > 0 ? cityRecords : records;
    if (targetRecords.length === 0) {
      throw new Error(`No CPCB station records found for ${location.city}.`);
    }

    // Group by nearest station
    let bestStation = targetRecords[0]!;
    let bestDist = Infinity;
    for (const rec of targetRecords) {
      const lat = Number(rec.latitude);
      const lon = Number(rec.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const d = haversineDistanceKm(location.latitude, location.longitude, lat, lon);
        if (d < bestDist) {
          bestDist = d;
          bestStation = rec;
        }
      }
    }

    const stationName = String(bestStation.station || `${location.city} CPCB`);
    const stationRecords = targetRecords.filter(
      (r) => String(r.station) === String(bestStation.station),
    );

    const values: Partial<Record<PollutantKey, number>> = {};
    let obsTime = new Date().toISOString();

    for (const rec of stationRecords) {
      const pId = String(rec.pollutant_id || '').toLowerCase();
      const avg = Number(rec.avg_value ?? rec.pollutant_avg);
      if (!Number.isFinite(avg)) continue;
      if (rec.last_update) obsTime = new Date(rec.last_update).toISOString();

      if (pId === 'pm2.5' || pId === 'pm25') values.pm25 = avg;
      else if (pId === 'pm10') values.pm10 = avg;
      else if (pId === 'no2') values.no2 = avg;
      else if (pId === 'so2') values.so2 = avg;
      else if (pId === 'co') values.co = avg;
      else if (pId === 'o3' || pId === 'ozone') values.o3 = avg;
      else if (pId === 'nh3') values.nh3 = avg;
    }

    const calc = calculateCpcbNaqi({
      values,
      isOfficialStationMeasurement: true,
    });

    const stLat = Number(bestStation.latitude);
    const stLon = Number(bestStation.longitude);
    const stale = isReadingStale(obsTime, 240);

    return {
      location,
      provider: this.name,
      attribution: 'Central Pollution Control Board (CPCB) via data.gov.in',
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
      observationTimestamp: obsTime,
      retrievalTimestamp: new Date().toISOString(),
      overallAqi: calc.overallAqi,
      aqiCategory: calc.aqiCategory,
      aqiColorHex: calc.aqiColorHex,
      dominantPollutant: calc.dominantPollutant,
      healthAdvisory: calc.healthAdvisory,
      reliabilityNote: `Official CPCB CAAQMS station "${stationName}"${Number.isFinite(bestDist) ? ` (${bestDist} km away)` : ''}.`,
      station: {
        stationId: stationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        stationName,
        provider: 'CPCB / MPCB',
        distanceKm: Number.isFinite(bestDist) ? bestDist : null,
        coordinates:
          Number.isFinite(stLon) && Number.isFinite(stLat)
            ? [stLon, stLat]
            : null,
        isOfficialStation: true,
      },
      pollutants: calc.pollutants,
      hourlyTrend: [],
    };
  }
}
