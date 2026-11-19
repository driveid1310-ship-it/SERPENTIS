import type {
  DailyWeatherPoint,
  HourlyWeatherPoint,
  LocationContext,
  WeatherDataResult,
  WeatherProvider,
} from '../data-providers/types.js';
import {
  computeDaylightDurationHours,
  computeDewPointC,
  computeHeatIndexC,
  computeWindChillC,
  isReadingStale,
} from '../environmental/EnvironmentalValidationService.js';

const WMO_WEATHER_LABELS: Record<number, string> = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Light Freezing Drizzle',
  57: 'Dense Freezing Drizzle',
  61: 'Slight Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Slight Snowfall',
  73: 'Moderate Snowfall',
  75: 'Heavy Snowfall',
  80: 'Slight Rain Showers',
  81: 'Moderate Rain Showers',
  82: 'Violent Rain Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with Slight Hail',
  99: 'Thunderstorm with Heavy Hail',
};

export function describeWmoWeatherCode(code: number | null | undefined): string {
  if (code === null || code === undefined || !Number.isFinite(code)) {
    return 'Unknown';
  }
  return WMO_WEATHER_LABELS[code] ?? `Weather Code ${code}`;
}

export class OpenMeteoWeatherProvider implements WeatherProvider {
  public readonly name = 'Open-Meteo';

  isConfigured(): boolean {
    return true; // Open-Meteo free non-commercial tier requires no API key
  }

  private getBaseUrl(): string {
    return process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';
  }

  async fetchWeather(location: LocationContext): Promise<WeatherDataResult> {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      timezone: 'Asia/Kolkata',
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'weather_code',
        'cloud_cover',
        'pressure_msl',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'uv_index',
        'visibility',
        'shortwave_radiation',
      ].join(','),
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation_probability',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'uv_index',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'uv_index_max',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
      ].join(','),
      forecast_days: '7',
    });

    const url = `${this.getBaseUrl()}/forecast?${params.toString()}`;
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
          throw new Error(`Open-Meteo HTTP ${response.status}`);
        }

        const data = (await response.json()) as Record<string, any>;
        return this.mapResponse(location, data);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Open-Meteo weather fetch failed.');
  }

  private mapResponse(
    location: LocationContext,
    data: Record<string, any>,
  ): WeatherDataResult {
    const current = data.current || {};
    const hourly = data.hourly || {};
    const daily = data.daily || {};

    const tempC = Number(current.temperature_2m ?? 0);
    const humidityPct = Number(current.relative_humidity_2m ?? 0);
    const windSpeedKmh = Number(current.wind_speed_10m ?? 0);
    const weatherCode = Number(current.weather_code ?? 0);

    const sunriseToday: string | null = Array.isArray(daily.sunrise)
      ? (daily.sunrise[0] ?? null)
      : null;
    const sunsetToday: string | null = Array.isArray(daily.sunset)
      ? (daily.sunset[0] ?? null)
      : null;

    const observationTimestamp = current.time
      ? new Date(current.time).toISOString()
      : new Date().toISOString();

    const hourlyTimes: string[] = Array.isArray(hourly.time) ? hourly.time : [];
    const nowMs = Date.now();
    const hourly24h: HourlyWeatherPoint[] = [];

    for (let i = 0; i < hourlyTimes.length && hourly24h.length < 24; i++) {
      const tStr = hourlyTimes[i]!;
      const tMs = new Date(tStr).getTime();
      if (Number.isFinite(tMs) && tMs < nowMs - 60 * 60 * 1000) {
        continue;
      }
      const hCode = Number(hourly.weather_code?.[i] ?? 0);
      hourly24h.push({
        time: tStr,
        temperatureC: Number(hourly.temperature_2m?.[i] ?? tempC),
        apparentTemperatureC:
          hourly.apparent_temperature?.[i] !== undefined
            ? Number(hourly.apparent_temperature[i])
            : undefined,
        humidityPct:
          hourly.relative_humidity_2m?.[i] !== undefined
            ? Number(hourly.relative_humidity_2m[i])
            : undefined,
        precipitationMm:
          hourly.precipitation?.[i] !== undefined
            ? Number(hourly.precipitation[i])
            : undefined,
        precipitationProbabilityPct:
          hourly.precipitation_probability?.[i] !== undefined
            ? Number(hourly.precipitation_probability[i])
            : undefined,
        weatherCode: hCode,
        condition: describeWmoWeatherCode(hCode),
        windSpeedKmh:
          hourly.wind_speed_10m?.[i] !== undefined
            ? Number(hourly.wind_speed_10m[i])
            : undefined,
        uvIndex:
          hourly.uv_index?.[i] !== undefined
            ? Number(hourly.uv_index[i])
            : undefined,
        dataType: 'forecast',
      });
    }

    const dailyDates: string[] = Array.isArray(daily.time) ? daily.time : [];
    const daily7d: DailyWeatherPoint[] = dailyDates.slice(0, 7).map((date, i) => {
      const dCode = Number(daily.weather_code?.[i] ?? 0);
      const sr = daily.sunrise?.[i] as string | undefined;
      const ss = daily.sunset?.[i] as string | undefined;
      const dl = computeDaylightDurationHours(sr, ss);
      return {
        date,
        tempMinC: Number(daily.temperature_2m_min?.[i] ?? 0),
        tempMaxC: Number(daily.temperature_2m_max?.[i] ?? 0),
        precipitationSumMm:
          daily.precipitation_sum?.[i] !== undefined
            ? Number(daily.precipitation_sum[i])
            : undefined,
        precipitationProbabilityMaxPct:
          daily.precipitation_probability_max?.[i] !== undefined
            ? Number(daily.precipitation_probability_max[i])
            : undefined,
        weatherCode: dCode,
        condition: describeWmoWeatherCode(dCode),
        sunrise: sr,
        sunset: ss,
        daylightDurationHours: dl ?? undefined,
        uvIndexMax:
          daily.uv_index_max?.[i] !== undefined
            ? Number(daily.uv_index_max[i])
            : undefined,
        windSpeedMaxKmh:
          daily.wind_speed_10m_max?.[i] !== undefined
            ? Number(daily.wind_speed_10m_max[i])
            : undefined,
        dataType: 'forecast',
      };
    });

    const stale = isReadingStale(observationTimestamp, 120);

    return {
      location,
      provider: this.name,
      attribution: 'Weather data by Open-Meteo.com (CC BY 4.0)',
      dataType: 'modeled',
      dataQualityStatus: stale ? 'stale' : 'valid',
      isStale: stale,
      isMockFallback: false,
      observationTimestamp,
      retrievalTimestamp: new Date().toISOString(),
      current: {
        temperatureC: tempC,
        feelsLikeC: Number(current.apparent_temperature ?? tempC),
        condition: describeWmoWeatherCode(weatherCode),
        weatherCode,
        humidityPct,
        windSpeedKmh,
        windDirectionDeg: Number(current.wind_direction_10m ?? 0),
        windGustsKmh:
          current.wind_gusts_10m !== undefined && current.wind_gusts_10m !== null
            ? Number(current.wind_gusts_10m)
            : null,
        pressureHpa:
          current.pressure_msl !== undefined && current.pressure_msl !== null
            ? Number(current.pressure_msl)
            : null,
        visibilityMeters:
          current.visibility !== undefined && current.visibility !== null
            ? Number(current.visibility)
            : null,
        cloudCoverPct:
          current.cloud_cover !== undefined && current.cloud_cover !== null
            ? Number(current.cloud_cover)
            : null,
        precipitationMm: Number(current.precipitation ?? 0),
        uvIndex:
          current.uv_index !== undefined && current.uv_index !== null
            ? Number(current.uv_index)
            : null,
        heatIndexC: computeHeatIndexC(tempC, humidityPct),
        dewPointC: computeDewPointC(tempC, humidityPct),
        windChillC: computeWindChillC(tempC, windSpeedKmh),
        sunrise: sunriseToday,
        sunset: sunsetToday,
        daylightDurationHours: computeDaylightDurationHours(sunriseToday, sunsetToday),
        solarRadiationWm2:
          current.shortwave_radiation !== undefined && current.shortwave_radiation !== null
            ? Number(current.shortwave_radiation)
            : null,
        soilMoistureM3M3: null,
      },
      hourly24h,
      daily7d,
    };
  }
}
