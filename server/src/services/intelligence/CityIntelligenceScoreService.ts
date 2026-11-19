import PublicService from '../../models/PublicService.js';
import Report from '../../models/Report.js';
import type {
  AirQualityDataResult,
  LocationContext,
  WeatherDataResult,
} from '../data-providers/types.js';

export interface ScoreComponentBreakdown {
  indicator: string;
  rawValue: string;
  weightPct: number;
  subScore: number | null;
  available: boolean;
  note: string;
}

export class CityIntelligenceScoreService {
  /**
   * Computes a transparent, reproducible Environmental Health Score (0-100)
   * and Civic Health Score (0-100). Never claims medical certainty or masquerades
   * as an official government health index.
   */
  async computeCityIntelligenceOverview(
    location: LocationContext,
    weather: WeatherDataResult,
    airQuality: AirQualityDataResult,
  ) {
    // 1. Environmental Health Score Components
    const components: ScoreComponentBreakdown[] = [];

    // AQI component (weight 45%)
    const aqiVal = airQuality.overallAqi;
    const aqiSub =
      aqiVal !== null
        ? Math.max(0, Math.min(100, Math.round(100 - (aqiVal / 500) * 100)))
        : null;
    components.push({
      indicator: 'Air Quality (CPCB Scale)',
      rawValue: aqiVal !== null ? `${aqiVal} (${airQuality.aqiCategory})` : 'Unavailable',
      weightPct: 45,
      subScore: aqiSub,
      available: aqiSub !== null,
      note: airQuality.isOfficialAqi ? 'Official ground station' : 'Modeled estimate',
    });

    // Thermal Comfort / Heat Stress (weight 25%): optimal 20-28°C -> 100; degrades above 32°C or below 12°C
    const temp = weather.current.temperatureC;
    let tempSub = 100;
    if (temp > 28) {
      tempSub = Math.max(0, Math.round(100 - (temp - 28) * 5.5));
    } else if (temp < 18) {
      tempSub = Math.max(0, Math.round(100 - (18 - temp) * 5));
    }
    components.push({
      indicator: 'Thermal Comfort',
      rawValue: `${temp.toFixed(1)}°C (Feels ${weather.current.feelsLikeC.toFixed(1)}°C)`,
      weightPct: 25,
      subScore: tempSub,
      available: !weather.isMockFallback,
      note: 'Optimal comfort band 18–28°C',
    });

    // Humidity Comfort (weight 15%): optimal 35-65%
    const rh = weather.current.humidityPct;
    let rhSub = 100;
    if (rh > 65) rhSub = Math.max(20, Math.round(100 - (rh - 65) * 2.2));
    else if (rh < 35) rhSub = Math.max(20, Math.round(100 - (35 - rh) * 2.2));
    components.push({
      indicator: 'Humidity Balance',
      rawValue: `${rh}%`,
      weightPct: 15,
      subScore: rhSub,
      available: !weather.isMockFallback,
      note: 'Optimal comfort band 35–65%',
    });

    // UV & Precipitation Stress (weight 15%)
    const uv = weather.current.uvIndex;
    const rain = weather.current.precipitationMm;
    let uvRainSub: number | null = null;
    if (uv !== null) {
      uvRainSub = Math.max(0, Math.min(100, Math.round(100 - Math.max(0, uv - 2) * 8 - rain * 2)));
    }
    components.push({
      indicator: 'UV & Rain Stress',
      rawValue: uv !== null ? `UV ${uv.toFixed(1)}, Rain ${rain.toFixed(1)} mm` : 'Unavailable',
      weightPct: 15,
      subScore: uvRainSub,
      available: uvRainSub !== null && !weather.isMockFallback,
      note: 'Lower UV and light/no rain score higher',
    });

    const availableComponents = components.filter((c) => c.available && c.subScore !== null);
    const totalAvailableWeight = availableComponents.reduce((s, c) => s + c.weightPct, 0);
    const coveragePct = Math.round(
      (availableComponents.reduce((s, c) => s + c.weightPct, 0) / 100) * 100,
    );

    const environmentalHealthScore =
      totalAvailableWeight > 0
        ? Math.round(
            availableComponents.reduce(
              (s, c) => s + (c.subScore as number) * (c.weightPct / totalAvailableWeight),
              0,
            ),
          )
        : null;

    // 2. Civic Health Score Components
    let totalReports = 0;
    let resolvedReports = 0;
    let unresolvedEnvReports = 0;
    let publicServicesCount = 0;

    try {
      const [tot, resCount, envOpen, svcCount] = await Promise.all([
        Report.countDocuments(),
        Report.countDocuments({ status: 'resolved' }),
        Report.countDocuments({
          status: { $ne: 'resolved' },
          category: {
            $in: [
              'pollution',
              'garbage',
              'air-pollution',
              'water-contamination',
              'noise-pollution',
              'waterlogging',
              'drainage-blockage',
              'open-burning',
            ],
          },
        }),
        PublicService.countDocuments({
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
              $maxDistance: 25000,
            },
          },
        }),
      ]);
      totalReports = tot;
      resolvedReports = resCount;
      unresolvedEnvReports = envOpen;
      publicServicesCount = svcCount;
    } catch {
      // fallback if DB unavailable
    }

    const resolutionRatePct =
      totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : null;
    const backlogPenalty = Math.min(40, unresolvedEnvReports * 2);
    const serviceBonus = Math.min(20, publicServicesCount * 2);

    const civicHealthScore =
      totalReports > 0
        ? Math.max(
            0,
            Math.min(100, Math.round((resolutionRatePct ?? 50) * 0.8 + serviceBonus - backlogPenalty * 0.3)),
          )
        : publicServicesCount > 0
          ? 70
          : null;

    return {
      location,
      generatedAt: new Date().toISOString(),
      observationTimestamp: weather.observationTimestamp,
      environmentalHealth: {
        score: environmentalHealthScore,
        band:
          environmentalHealthScore === null
            ? 'Insufficient Data'
            : environmentalHealthScore >= 75
              ? 'Favorable'
              : environmentalHealthScore >= 50
                ? 'Moderate'
                : 'Stressed',
        dataCoveragePct: coveragePct,
        methodology:
          'Weighted composite of CPCB-scale AQI (45%), Thermal Comfort (25%), Humidity Balance (15%), and UV/Rain Stress (15%), re-normalized across available indicators.',
        disclaimer:
          'SERPENTIS Environmental Health Score is an informational composite indicator, NOT an official government index or medical risk assessment.',
        components,
      },
      civicHealth: {
        score: civicHealthScore,
        dataCompletenessPct: totalReports > 0 ? 100 : publicServicesCount > 0 ? 50 : 0,
        metrics: {
          totalReports,
          resolvedReports,
          resolutionRatePct,
          unresolvedEnvironmentalBacklog: unresolvedEnvReports,
          nearbyPublicServicesMapped: publicServicesCount,
        },
        methodology:
          'Derived from civic complaint resolution rate (80% weight), mapped public service availability bonus (up to +20), and unresolved environmental backlog penalty.',
      },
    };
  }
}

export const cityIntelligenceScoreService = new CityIntelligenceScoreService();
