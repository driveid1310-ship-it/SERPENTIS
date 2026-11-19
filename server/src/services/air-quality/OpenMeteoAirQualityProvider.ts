import type {
  AirQualityDataResult,
  AirQualityHourlyPoint,
  AirQualityProvider,
  LocationContext,
} from '../data-providers/types.js';
import { calculateCpcbNaqi } from './CpcbAqiCalculator.js';
import { isReadingStale } from '../environmental/EnvironmentalValidationService.js';

/**
 * Open-Meteo Air Quality Provider (CAMS Global Atmospheric Model).
 * Free for non-commercial use (CC BY 4.0), no API key required.
 * IMPORTANT: Returns modeled atmospheric estimates (`dataType: 'modeled'`, `isOfficialAqi: false`),
 * never masquerading as official CPCB ground monitoring station measurements.
 */
export class OpenMeteoAirQualityProvider implements AirQualityProvider {
  public readonly name = 'Open-Meteo Air Quality (CAMS Modeled)';

  isConfigured(): boolean {
    return true;
  }

  private getBaseUrl(): string {
    return (
      process.env.OPEN_METEO_AQ_BASE_URL ||
      'https://air-quality-api.open-meteo.com/v1'
    );
  }

  async fetchAirQuality(location: LocationContext): Promise<AirQualityDataResult> {
    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      timezone: 'Asia/Kolkata',
      current: [
        'pm2_5',
        'pm10',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
      ].join(','),
      hourly: ['pm2_5', 'pm10', 'nitrogen_dioxide', 'ozone'].join(','),
      forecast_days: '2',
    });

    const url = `${this.getBaseUrl()}/air-quality?${params.toString()}`;
    let lastError: unknown;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) {
          throw new Error(`Open-Meteo AQ HTTP ${res.status}`);
        }
        const data = (await res.json()) as Record<string, any>;
        return this.mapResponse(location, data);
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error('Open-Meteo Air Quality fetch failed.');
  }

  private mapResponse(
    location: LocationContext,
    data: Record<string, any>,
  ): AirQualityDataResult {
    const current = data.current || {};
    const hourly = data.hourly || {};

    // Open-Meteo returns CO in µg/m³; CPCB breakpoints use mg/m³ -> divide by 1000
    const coMgM3 =
      current.carbon_monoxide !== undefined && current.carbon_monoxide !== null
        ? Number((Number(current.carbon_monoxide) / 1000).toFixed(3))
        : undefined;

    const calc = calculateCpcbNaqi({
      values: {
        pm25: current.pm2_5 !== null && current.pm2_5 !== undefined ? Number(current.pm2_5) : undefined,
        pm10: current.pm10 !== null && current.pm10 !== undefined ? Number(current.pm10) : undefined,
        no2: current.nitrogen_dioxide !== null && current.nitrogen_dioxide !== undefined ? Number(current.nitrogen_dioxide) : undefined,
        so2: current.sulphur_dioxide !== null && current.sulphur_dioxide !== undefined ? Number(current.sulphur_dioxide) : undefined,
        co: coMgM3,
        o3: current.ozone !== null && current.ozone !== undefined ? Number(current.ozone) : undefined,
      },
      isOfficialStationMeasurement: false,
      averagingPeriodOverride: '1h',
    });

    const obsTime = current.time
      ? new Date(current.time).toISOString()
      : new Date().toISOString();

    const times: string[] = Array.isArray(hourly.time) ? hourly.time : [];
    const nowMs = Date.now();
    const hourlyTrend: AirQualityHourlyPoint[] = [];

    for (let i = 0; i < times.length && hourlyTrend.length < 24; i++) {
      const tStr = times[i]!;
      const tMs = new Date(tStr).getTime();
      if (Number.isFinite(tMs) && tMs < nowMs - 12 * 60 * 60 * 1000) continue;

      const hPm25 = hourly.pm2_5?.[i] ?? null;
      const hPm10 = hourly.pm10?.[i] ?? null;
      const hNo2 = hourly.nitrogen_dioxide?.[i] ?? null;
      const hO3 = hourly.ozone?.[i] ?? null;

      const hCalc = calculateCpcbNaqi({
        values: {
          pm25: hPm25 !== null ? Number(hPm25) : undefined,
          pm10: hPm10 !== null ? Number(hPm10) : undefined,
          no2: hNo2 !== null ? Number(hNo2) : undefined,
          o3: hO3 !== null ? Number(hO3) : undefined,
        },
        isOfficialStationMeasurement: false,
      });

      hourlyTrend.push({
        time: tStr,
        pm25: hPm25 !== null ? Number(hPm25) : null,
        pm10: hPm10 !== null ? Number(hPm10) : null,
        no2: hNo2 !== null ? Number(hNo2) : null,
        o3: hO3 !== null ? Number(hO3) : null,
        indicativeAqi: hCalc.overallAqi,
        dataType: Number.isFinite(tMs) && tMs > nowMs ? 'forecast' : 'modeled',
      });
    }

    const stale = isReadingStale(obsTime, 180);

    return {
      location,
      provider: this.name,
      attribution: 'Modeled atmospheric estimate via Open-Meteo / CAMS (CC BY 4.0)',
      methodology: 'CPCB_INDIA_NAQI',
      dataType: 'modeled',
      dataQualityStatus: stale ? 'stale' : 'valid',
      isOfficialAqi: false,
      insufficientReason:
        'Modeled CAMS grid estimate mapped to CPCB breakpoints. Connect CPCB or OpenAQ v3 credentials for official ground-station readings.',
      isStale: stale,
      isMockFallback: false,
      observationTimestamp: obsTime,
      retrievalTimestamp: new Date().toISOString(),
      overallAqi: calc.overallAqi,
      aqiCategory: calc.aqiCategory,
      aqiColorHex: calc.aqiColorHex,
      dominantPollutant: calc.dominantPollutant,
      healthAdvisory: calc.healthAdvisory,
      reliabilityNote:
        'Modeled satellite/reanalysis grid estimate (~10–40 km resolution), not an official CPCB ground station measurement.',
      station: null,
      pollutants: calc.pollutants,
      hourlyTrend,
    };
  }
}
