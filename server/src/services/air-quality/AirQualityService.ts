import AirQualityObservation from '../../models/AirQualityObservation.js';
import EnvironmentalMetricHistory from '../../models/EnvironmentalMetricHistory.js';
import MonitoringStation from '../../models/MonitoringStation.js';
import type { AirQualityDataResult, LocationContext } from '../data-providers/types.js';
import { environmentalCache } from '../environmental/EnvironmentalCacheService.js';
import { calculateCpcbNaqi } from './CpcbAqiCalculator.js';
import { CpcbDataGovProvider } from './CpcbDataGovProvider.js';
import { OpenAqAirQualityProvider } from './OpenAqAirQualityProvider.js';
import { OpenMeteoAirQualityProvider } from './OpenMeteoAirQualityProvider.js';

const AQI_CACHE_TTL_MS = 20 * 60 * 1000; // 20 minutes

export interface AirQualityResponse extends AirQualityDataResult {
  cacheHit: boolean;
  providerStatus: {
    cpcbConfigured: boolean;
    openAqConfigured: boolean;
    openMeteoAqAvailable: boolean;
  };
}

export class AirQualityService {
  private readonly cpcb = new CpcbDataGovProvider();
  private readonly openAq = new OpenAqAirQualityProvider();
  private readonly openMeteoAq = new OpenMeteoAirQualityProvider();

  getProviderStatus() {
    return {
      cpcbConfigured: this.cpcb.isConfigured(),
      openAqConfigured: this.openAq.isConfigured(),
      openMeteoAqAvailable: this.openMeteoAq.isConfigured(),
    };
  }

  async getAirQuality(
    location: LocationContext,
    options?: { forceRefresh?: boolean | undefined },
  ): Promise<AirQualityResponse> {
    const cacheKey = `aqi:${location.latitude.toFixed(2)}:${location.longitude.toFixed(2)}`;
    if (options?.forceRefresh) {
      environmentalCache.invalidate(cacheKey);
    }

    const { data, cacheHit } = await environmentalCache.getOrFetch(
      cacheKey,
      AQI_CACHE_TTL_MS,
      () => this.fetchFromProvidersWithFallback(location),
    );

    return {
      ...data,
      cacheHit,
      providerStatus: this.getProviderStatus(),
    };
  }

  private async fetchFromProvidersWithFallback(
    location: LocationContext,
  ): Promise<AirQualityDataResult> {
    let result: AirQualityDataResult | null = null;

    // 1. Official CPCB / data.gov.in if configured
    if (this.cpcb.isConfigured()) {
      try {
        result = await this.cpcb.fetchAirQuality(location);
      } catch (err) {
        console.warn('[AirQualityService] CPCB provider failed:', err);
      }
    }

    // 2. OpenAQ v3 ground station if configured
    if (!result && this.openAq.isConfigured()) {
      try {
        result = await this.openAq.fetchAirQuality(location);
      } catch (err) {
        console.warn('[AirQualityService] OpenAQ provider failed:', err);
      }
    }

    // 3. Open-Meteo CAMS modeled air quality (clearly flagged as modeled, non-official)
    if (!result) {
      try {
        result = await this.openMeteoAq.fetchAirQuality(location);
      } catch (err) {
        const allowMock = process.env.ENVIRONMENTAL_ALLOW_MOCK_FALLBACK !== 'false';
        if (!allowMock) {
          throw err;
        }
        result = this.buildDegradedMockFallback(
          location,
          err instanceof Error ? err.message : 'Air quality providers unavailable.',
        );
      }
    }

    this.persistAirQualitySnapshot(location, result).catch(() => {});

    return result;
  }

  private async persistAirQualitySnapshot(
    location: LocationContext,
    result: AirQualityDataResult,
  ): Promise<void> {
    if (result.isMockFallback) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    await AirQualityObservation.create({
      locationKey: location.slug,
      city: location.city,
      district: location.district,
      state: location.state,
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
      },
      provider: result.provider,
      dataType: result.dataType === 'observed' ? 'observed' : 'modeled',
      methodology: result.methodology,
      overallAqi: result.overallAqi,
      aqiCategory: result.aqiCategory,
      isOfficialAqi: result.isOfficialAqi,
      dominantPollutant: result.dominantPollutant,
      observationTimestamp: new Date(result.observationTimestamp),
      retrievalTimestamp: new Date(result.retrievalTimestamp),
      payload: result as unknown as Record<string, unknown>,
      expiresAt,
    });

    if (result.station && result.station.coordinates) {
      await MonitoringStation.findOneAndUpdate(
        { stationCode: result.station.stationId },
        {
          $set: {
            name: result.station.stationName,
            provider: result.station.provider,
            stationType: result.station.isOfficialStation ? 'cpcb' : 'modeled-grid',
            reliabilityTier: result.station.isOfficialStation
              ? 'official-reference'
              : 'modeled-estimate',
            location: {
              type: 'Point',
              coordinates: result.station.coordinates,
            },
            city: location.city,
            district: location.district,
            state: location.state,
            locality: location.locality || '',
            supportedParameters: Object.entries(result.pollutants)
              .filter(([, p]) => p.status === 'valid')
              .map(([k]) => k),
            isActive: true,
            lastReportedAt: new Date(result.observationTimestamp),
          },
        },
        { upsert: true },
      );
    }

    if (result.overallAqi !== null) {
      const periodStart = new Date(now);
      periodStart.setUTCHours(0, 0, 0, 0);

      await EnvironmentalMetricHistory.findOneAndUpdate(
        {
          locationSlug: location.slug,
          granularity: 'daily',
          periodStart,
          dataType: result.dataType === 'observed' ? 'observed' : 'modeled',
        },
        {
          $set: {
            city: location.city,
            district: location.district,
            state: location.state,
            provider: result.provider,
            aqiAvg: result.overallAqi,
            pm25Avg: result.pollutants.pm25.value ?? undefined,
            pm10Avg: result.pollutants.pm10.value ?? undefined,
            dominantPollutant: result.dominantPollutant ?? undefined,
          },
          $max: { aqiMax: result.overallAqi },
          $inc: { sampleCount: 1 },
        },
        { upsert: true },
      );
    }
  }

  private buildDegradedMockFallback(
    location: LocationContext,
    reason: string,
  ): AirQualityDataResult {
    const now = new Date();
    const calc = calculateCpcbNaqi({
      values: { pm25: 42, pm10: 78, no2: 28, so2: 11, co: 0.7, o3: 45 },
      isOfficialStationMeasurement: false,
    });

    return {
      location,
      provider: 'SERPENTIS Demo Fallback (Offline)',
      attribution: 'Offline fallback placeholder — upstream air quality provider unavailable',
      methodology: 'CPCB_INDIA_NAQI',
      dataType: 'modeled',
      dataQualityStatus: 'insufficient',
      isOfficialAqi: false,
      insufficientReason: `Upstream unavailable: ${reason}`,
      isStale: true,
      isMockFallback: true,
      observationTimestamp: now.toISOString(),
      retrievalTimestamp: now.toISOString(),
      overallAqi: calc.overallAqi,
      aqiCategory: 'Demo Fallback (Live Data Unavailable)',
      aqiColorHex: calc.aqiColorHex,
      dominantPollutant: calc.dominantPollutant,
      healthAdvisory: calc.healthAdvisory,
      reliabilityNote: 'Demo fallback values shown because external providers were unreachable.',
      station: null,
      pollutants: calc.pollutants,
      hourlyTrend: [],
    };
  }
}

export const airQualityService = new AirQualityService();
