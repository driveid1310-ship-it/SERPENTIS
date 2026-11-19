import type {
  LocationContext,
  WeatherDataResult,
  WeatherProvider,
} from './types.js';
import {
  computeDewPointC,
  computeHeatIndexC,
  computeWindChillC,
} from '../environmental/EnvironmentalValidationService.js';

/**
 * India Meteorological Department (IMD) API Adapter.
 * Requires registered static server IP + IMD_API_KEY + IMD_JWT_TOKEN from https://api.imd.gov.in/.
 */
export class ImdWeatherProvider implements WeatherProvider {
  public readonly name = 'IMD (India Meteorological Department)';

  isConfigured(): boolean {
    return Boolean(process.env.IMD_API_KEY && process.env.IMD_JWT_TOKEN);
  }

  async fetchWeather(location: LocationContext): Promise<WeatherDataResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'IMD API credentials (IMD_API_KEY, IMD_JWT_TOKEN) are not configured.',
      );
    }

    const baseUrl = process.env.IMD_API_BASE_URL || 'https://api.imd.gov.in';
    const url = `${baseUrl}/api/weather/forecast?lat=${location.latitude}&lon=${location.longitude}`;

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.IMD_JWT_TOKEN}`,
        'x-api-key': process.env.IMD_API_KEY as string,
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`IMD API HTTP ${response.status}`);
    }

    const raw = (await response.json()) as Record<string, any>;
    const tempC = Number(raw.temp ?? raw.temperature ?? 30);
    const humidityPct = Number(raw.humidity ?? 60);
    const windSpeedKmh = Number(raw.windSpeed ?? 10);

    return {
      location,
      provider: this.name,
      attribution: 'India Meteorological Department (IMD)',
      dataType: 'observed',
      dataQualityStatus: 'valid',
      isStale: false,
      isMockFallback: false,
      observationTimestamp: new Date().toISOString(),
      retrievalTimestamp: new Date().toISOString(),
      current: {
        temperatureC: tempC,
        feelsLikeC: Number(raw.feelsLike ?? tempC),
        condition: String(raw.weather ?? 'Observed'),
        weatherCode: 0,
        humidityPct,
        windSpeedKmh,
        windDirectionDeg: Number(raw.windDirection ?? 0),
        windGustsKmh: null,
        pressureHpa: raw.pressure ? Number(raw.pressure) : null,
        visibilityMeters: null,
        cloudCoverPct: null,
        precipitationMm: Number(raw.rainfall ?? 0),
        uvIndex: null,
        heatIndexC: computeHeatIndexC(tempC, humidityPct),
        dewPointC: computeDewPointC(tempC, humidityPct),
        windChillC: computeWindChillC(tempC, windSpeedKmh),
        sunrise: null,
        sunset: null,
        daylightDurationHours: null,
        solarRadiationWm2: null,
        soilMoistureM3M3: null,
      },
      hourly24h: [],
      daily7d: [],
    };
  }
}
