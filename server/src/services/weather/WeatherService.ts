import WeatherObservation from '../../models/WeatherObservation.js';
import EnvironmentalMetricHistory from '../../models/EnvironmentalMetricHistory.js';
import type { LocationContext, WeatherDataResult } from '../data-providers/types.js';
import { OpenMeteoWeatherProvider } from '../data-providers/OpenMeteoWeatherProvider.js';
import { ImdWeatherProvider } from '../data-providers/ImdWeatherProvider.js';
import { environmentalCache } from '../environmental/EnvironmentalCacheService.js';
import { celsiusToFahrenheit, kmhToMs } from '../environmental/EnvironmentalValidationService.js';

const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export interface WeatherResponseWithUnits extends WeatherDataResult {
  cacheHit: boolean;
  preferredUnits: {
    temperature: 'C' | 'F';
    windSpeed: 'kmh' | 'ms';
  };
  display: {
    temperature: number;
    feelsLike: number;
    windSpeed: number;
    temperatureUnitLabel: '°C' | '°F';
    windSpeedUnitLabel: 'km/h' | 'm/s';
  };
  providerStatus: {
    imdConfigured: boolean;
    openMeteoAvailable: boolean;
  };
}

export class WeatherService {
  private readonly openMeteo = new OpenMeteoWeatherProvider();
  private readonly imd = new ImdWeatherProvider();

  getProviderStatus() {
    return {
      imdConfigured: this.imd.isConfigured(),
      openMeteoAvailable: this.openMeteo.isConfigured(),
    };
  }

  async getWeather(
    location: LocationContext,
    options?: {
      forceRefresh?: boolean | undefined;
      temperatureUnit?: 'C' | 'F' | undefined;
      windSpeedUnit?: 'kmh' | 'ms' | undefined;
    },
  ): Promise<WeatherResponseWithUnits> {
    const cacheKey = `weather:${location.latitude.toFixed(2)}:${location.longitude.toFixed(2)}`;
    if (options?.forceRefresh) {
      environmentalCache.invalidate(cacheKey);
    }

    const { data, cacheHit } = await environmentalCache.getOrFetch(
      cacheKey,
      WEATHER_CACHE_TTL_MS,
      () => this.fetchFromProvidersWithFallback(location),
    );

    const tempUnit = options?.temperatureUnit === 'F' ? 'F' : 'C';
    const windUnit = options?.windSpeedUnit === 'ms' ? 'ms' : 'kmh';

    return {
      ...data,
      cacheHit,
      preferredUnits: {
        temperature: tempUnit,
        windSpeed: windUnit,
      },
      display: {
        temperature:
          tempUnit === 'F'
            ? celsiusToFahrenheit(data.current.temperatureC)
            : data.current.temperatureC,
        feelsLike:
          tempUnit === 'F'
            ? celsiusToFahrenheit(data.current.feelsLikeC)
            : data.current.feelsLikeC,
        windSpeed:
          windUnit === 'ms'
            ? kmhToMs(data.current.windSpeedKmh)
            : data.current.windSpeedKmh,
        temperatureUnitLabel: tempUnit === 'F' ? '°F' : '°C',
        windSpeedUnitLabel: windUnit === 'ms' ? 'm/s' : 'km/h',
      },
      providerStatus: this.getProviderStatus(),
    };
  }

  private async fetchFromProvidersWithFallback(
    location: LocationContext,
  ): Promise<WeatherDataResult> {
    let result: WeatherDataResult | null = null;

    if (this.imd.isConfigured()) {
      try {
        result = await this.imd.fetchWeather(location);
      } catch (err) {
        console.warn('[WeatherService] IMD provider failed, falling back to Open-Meteo:', err);
      }
    }

    if (!result) {
      try {
        result = await this.openMeteo.fetchWeather(location);
      } catch (err) {
        const allowMock = process.env.ENVIRONMENTAL_ALLOW_MOCK_FALLBACK !== 'false';
        if (!allowMock) {
          throw err;
        }
        result = this.buildDegradedMockFallback(
          location,
          err instanceof Error ? err.message : 'Upstream weather provider unreachable.',
        );
      }
    }

    // Persist observation & daily history asynchronously (never block response on DB failure)
    this.persistWeatherSnapshot(location, result).catch(() => {});

    return result;
  }

  private async persistWeatherSnapshot(
    location: LocationContext,
    result: WeatherDataResult,
  ): Promise<void> {
    if (result.isMockFallback) return;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    await WeatherObservation.create({
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
      observationTimestamp: new Date(result.observationTimestamp),
      retrievalTimestamp: new Date(result.retrievalTimestamp),
      payload: result as unknown as Record<string, unknown>,
      expiresAt,
    });

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
          temperatureAvgC: result.current.temperatureC,
          temperatureMinC: result.daily7d[0]?.tempMinC ?? result.current.temperatureC,
          temperatureMaxC: result.daily7d[0]?.tempMaxC ?? result.current.temperatureC,
          humidityAvgPct: result.current.humidityPct,
          rainfallTotalMm: result.daily7d[0]?.precipitationSumMm ?? result.current.precipitationMm,
          windSpeedAvgKmh: result.current.windSpeedKmh,
        },
        $inc: { sampleCount: 1 },
      },
      { upsert: true },
    );
  }

  private buildDegradedMockFallback(
    location: LocationContext,
    reason: string,
  ): WeatherDataResult {
    const now = new Date();
    const hourly24h = Array.from({ length: 12 }, (_, idx) => {
      const t = new Date(now.getTime() + idx * 2 * 60 * 60 * 1000);
      return {
        time: t.toISOString(),
        temperatureC: 30,
        humidityPct: 55,
        precipitationMm: 0,
        precipitationProbabilityPct: 10,
        weatherCode: 1,
        condition: 'Demo Fallback (Upstream Unavailable)',
        windSpeedKmh: 8,
        uvIndex: 5,
        dataType: 'modeled' as const,
      };
    });

    return {
      location,
      provider: 'SERPENTIS Demo Fallback (Offline)',
      attribution: 'Fallback placeholder — live provider unreachable',
      dataType: 'modeled',
      dataQualityStatus: 'insufficient',
      isStale: true,
      isMockFallback: true,
      unavailableReason: reason,
      observationTimestamp: now.toISOString(),
      retrievalTimestamp: now.toISOString(),
      current: {
        temperatureC: 30,
        feelsLikeC: 32,
        condition: 'Demo Fallback (Live Data Unavailable)',
        weatherCode: 1,
        humidityPct: 55,
        windSpeedKmh: 8,
        windDirectionDeg: 250,
        windGustsKmh: 12,
        pressureHpa: 1012,
        visibilityMeters: 8000,
        cloudCoverPct: 25,
        precipitationMm: 0,
        uvIndex: 5,
        heatIndexC: 32.1,
        dewPointC: 19.8,
        windChillC: null,
        sunrise: null,
        sunset: null,
        daylightDurationHours: null,
        solarRadiationWm2: null,
        soilMoistureM3M3: null,
      },
      hourly24h,
      daily7d: [],
    };
  }
}

export const weatherService = new WeatherService();
