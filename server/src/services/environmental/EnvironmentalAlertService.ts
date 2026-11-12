import EnvironmentalAlert, {
  type AlertCategory,
  type AlertSeverity,
  type IEnvironmentalAlert,
} from '../../models/EnvironmentalAlert.js';
import EnvironmentalPreference from '../../models/EnvironmentalPreference.js';
import Notification from '../../models/Notification.js';
import Report from '../../models/Report.js';
import type {
  AirQualityDataResult,
  LocationContext,
  ProviderAlertItem,
  WeatherDataResult,
} from '../data-providers/types.js';

export interface AlertEvaluationInput {
  location: LocationContext;
  weather: WeatherDataResult;
  airQuality: AirQualityDataResult;
  recentWaterloggingCount?: number | undefined;
}

export class EnvironmentalAlertService {
  /**
   * Evaluates live environmental observations & forecasts against Indian
   * meteorological / CPCB thresholds to produce transparent threshold advisories.
   * Official IMD alerts are marked `official`; local threshold evaluations are marked `threshold-advisory`.
   */
  evaluateConditionAlerts(input: AlertEvaluationInput): ProviderAlertItem[] {
    const { location, weather, airQuality, recentWaterloggingCount = 0 } = input;
    const now = new Date();
    const validFrom = now.toISOString();
    const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
    const alerts: ProviderAlertItem[] = [];

    const tempC = weather.current.temperatureC;
    const heatIndexC = weather.current.heatIndexC;
    const windKmh = weather.current.windSpeedKmh;
    const uv = weather.current.uvIndex;
    const code = weather.current.weatherCode;
    const rainTodayMm = weather.daily7d[0]?.precipitationSumMm ?? weather.current.precipitationMm;

    // 1. Heatwave / Extreme Temperature
    if (tempC >= 40 || (heatIndexC !== null && heatIndexC >= 42)) {
      const severity: AlertSeverity = tempC >= 44 ? 'extreme' : 'severe';
      alerts.push({
        category: 'heatwave',
        severity,
        title: `Heat Stress Advisory in ${location.city} (${tempC.toFixed(1)}°C)`,
        description: `Ambient temperature is ${tempC.toFixed(1)}°C${heatIndexC ? ` with a heat index of ${heatIndexC.toFixed(1)}°C` : ''}. Prolonged outdoor exposure increases heat-illness risk.`,
        precautions: [
          'Avoid direct sun exposure between 12:00 PM and 4:00 PM.',
          'Stay hydrated with water, ORS, or buttermilk; avoid dehydrating drinks.',
          'Wear lightweight, light-colored cotton clothing and check on elderly neighbors.',
        ],
        provider: weather.provider,
        source: 'SERPENTIS Threshold Engine (IMD Heat Criteria Reference)',
        verificationStatus: 'threshold-advisory',
        issuedAt: now.toISOString(),
        validFrom,
        expiresAt,
        metricsSnapshot: { temperatureC: tempC, heatIndexC },
      });
    } else if (tempC >= 37) {
      alerts.push({
        category: 'extreme-temperature',
        severity: 'moderate',
        title: `High Daytime Heat in ${location.city} (${tempC.toFixed(1)}°C)`,
        description: `Temperatures have reached ${tempC.toFixed(1)}°C. Plan strenuous outdoor tasks for early morning or evening.`,
        precautions: [
          'Carry drinking water when commuting.',
          'Take shaded breaks during outdoor work.',
        ],
        provider: weather.provider,
        source: 'SERPENTIS Threshold Engine',
        verificationStatus: 'threshold-advisory',
        issuedAt: now.toISOString(),
        validFrom,
        expiresAt,
        metricsSnapshot: { temperatureC: tempC },
      });
    }

    // 2. Heavy Rainfall
    if (rainTodayMm >= 64.5 || weather.current.precipitationMm >= 15) {
      alerts.push({
        category: 'heavy-rainfall',
        severity: rainTodayMm >= 115.5 ? 'extreme' : 'severe',
        title: `Heavy Rainfall Warning for ${location.city}`,
        description: `Forecast/observed rainfall accumulation is ${rainTodayMm.toFixed(1)} mm. Low-lying roads and underpasses may experience waterlogging.`,
        precautions: [
          'Avoid flooded underpasses and waterlogged stretches.',
          'Keep emergency contacts and power banks ready.',
          'Report blocked storm drains via SERPENTIS Environmental Reporting.',
        ],
        provider: weather.provider,
        source: 'SERPENTIS Threshold Engine (IMD Heavy Rain Scale)',
        verificationStatus: 'threshold-advisory',
        issuedAt: now.toISOString(),
        validFrom,
        expiresAt,
        metricsSnapshot: { rainfallMm: rainTodayMm },
      });
    }

    // 3. Thunderstorm / Lightning (WMO 95, 96, 99)
    if (code === 95 || code === 96 || code === 99) {
      alerts.push({
        category: 'thunderstorm',
        severity: code === 99 ? 'severe' : 'moderate',
        title: `Thunderstorm Activity in ${location.city}`,
        description: `Convective thunderstorm conditions (${weather.current.condition}) detected.`,
        precautions: [
          'Seek shelter indoors away from open fields, tall trees, and metal poles.',
          'Unplug sensitive electronics during active lightning.',
        ],
        provider: weather.provider,
        source: 'SERPENTIS Threshold Engine',
        verificationStatus: 'threshold-advisory',
        issuedAt: now.toISOString(),
        validFrom,
        expiresAt,
        metricsSnapshot: { weatherCode: code },
      });
    }

    // 4. Strong Winds
    if (windKmh >= 40 || (weather.current.windGustsKmh ?? 0) >= 55) {
      alerts.push({
        category: 'strong-winds',
        severity: windKmh >= 60 ? 'severe' : 'moderate',
        title: `Strong Wind Advisory in ${location.city}`,
        description: `Sustained winds at ${windKmh.toFixed(1)} km/h${weather.current.windGustsKmh ? ` (gusts up to ${weather.current.windGustsKmh.toFixed(1)} km/h)` : ''}.`,
        precautions: [
          'Secure loose rooftop items, tarpaulins, and signage.',
          'Exercise caution near trees and overhead power lines.',
        ],
        provider: weather.provider,
        source: 'SERPENTIS Threshold Engine',
        verificationStatus: 'threshold-advisory',
        issuedAt: now.toISOString(),
        validFrom,
        expiresAt,
        metricsSnapshot: { windSpeedKmh: windKmh, windGustsKmh: weather.current.windGustsKmh },
      });
    }

    // 5. Poor AQI (CPCB Poor >= 201, Very Poor >= 301, Severe >= 401)
    if (airQuality.overallAqi !== null && airQuality.overallAqi >= 201) {
      const aqi = airQuality.overallAqi;
      const severity: AlertSeverity =
        aqi >= 401 ? 'extreme' : aqi >= 301 ? 'severe' : 'moderate';
      alerts.push({
        category: 'poor-aqi',
        severity,
        title: `Poor Air Quality Alert in ${location.city} (AQI ${aqi})`,
        description: `${airQuality.isOfficialAqi ? 'Observed' : 'Modeled'} CPCB-scale AQI is ${aqi} (${airQuality.aqiCategory ?? 'Poor'}). Dominant pollutant: ${airQuality.dominantPollutant?.toUpperCase() ?? 'PM'}.`,
        precautions: [
          'Reduce prolonged or heavy outdoor exertion, especially for children, seniors, and asthma patients.',
          'Wear a well-fitted N95/KN95 mask outdoors if air quality remains Poor or worse.',
          'Keep indoor windows closed during peak traffic/evening inversion hours.',
        ],
        provider: airQuality.provider,
        source: airQuality.isOfficialAqi
          ? 'CPCB / Ground Station Threshold'
          : 'Modeled Air Quality Threshold Advisory',
        verificationStatus: airQuality.isOfficialAqi ? 'official' : 'threshold-advisory',
        issuedAt: now.toISOString(),
        validFrom,
        expiresAt,
        metricsSnapshot: {
          overallAqi: aqi,
          dominantPollutant: airQuality.dominantPollutant,
          isOfficialAqi: airQuality.isOfficialAqi,
        },
      });
    }

    // 6. Extreme UV
    if (uv !== null && uv >= 8) {
      alerts.push({
        category: 'extreme-uv',
        severity: uv >= 11 ? 'severe' : 'moderate',
        title: `High UV Radiation in ${location.city} (UV ${uv.toFixed(1)})`,
        description: `UV Index is ${uv.toFixed(1)} (${uv >= 11 ? 'Extreme' : 'Very High'}). Unprotected skin can burn quickly.`,
        precautions: [
          'Use SPF 30+ sunscreen, UV-protective sunglasses, and a wide-brimmed hat.',
          'Seek shade during midday solar peak.',
        ],
        provider: weather.provider,
        source: 'SERPENTIS Threshold Engine',
        verificationStatus: 'threshold-advisory',
        issuedAt: now.toISOString(),
        validFrom,
        expiresAt,
        metricsSnapshot: { uvIndex: uv },
      });
    }

    // 7. Citizen Waterlogging Cluster
    if (recentWaterloggingCount >= 3) {
      alerts.push({
        category: 'waterlogging',
        severity: recentWaterloggingCount >= 6 ? 'severe' : 'moderate',
        title: `Localized Waterlogging Reports in ${location.city}`,
        description: `${recentWaterloggingCount} citizen waterlogging/drainage blockage reports have been logged nearby in the last 24 hours.`,
        precautions: [
          'Check the SERPENTIS Smart City Map before choosing low-lying routes.',
          'Avoid driving through standing water of unknown depth.',
        ],
        provider: 'SERPENTIS Civic Reports',
        source: 'Citizen Waterlogging Cluster Detection',
        verificationStatus: 'threshold-advisory',
        issuedAt: now.toISOString(),
        validFrom,
        expiresAt,
        metricsSnapshot: { recentWaterloggingCount },
      });
    }

    return alerts;
  }

  async syncAndGetActiveAlerts(input: AlertEvaluationInput): Promise<IEnvironmentalAlert[]> {
    const now = new Date();

    // Expire outdated alerts cleanly
    await EnvironmentalAlert.updateMany(
      { isActive: true, expiresAt: { $lte: now } },
      { $set: { isActive: false } },
    ).catch(() => {});

    // Check recent citizen waterlogging reports near location (last 24h)
    let waterloggingCount = input.recentWaterloggingCount ?? 0;
    if (input.recentWaterloggingCount === undefined) {
      try {
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        waterloggingCount = await Report.countDocuments({
          category: { $in: ['waterlogging', 'drainage-blockage'] },
          createdAt: { $gte: yesterday },
          status: { $ne: 'resolved' },
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [input.location.longitude, input.location.latitude],
              },
              $maxDistance: 15000,
            },
          },
        });
      } catch {
        waterloggingCount = 0;
      }
    }

    const candidates = this.evaluateConditionAlerts({
      ...input,
      recentWaterloggingCount: waterloggingCount,
    });

    const dayKey = now.toISOString().slice(0, 10);

    for (const item of candidates) {
      const fingerprint = `${item.category}:${input.location.slug}:${dayKey}`;
      try {
        const existing = await EnvironmentalAlert.findOne({ fingerprint });
        if (!existing) {
          const created = await EnvironmentalAlert.create({
            fingerprint,
            category: item.category,
            severity: item.severity,
            title: item.title,
            description: item.description,
            precautions: item.precautions,
            provider: item.provider,
            source: item.source,
            verificationStatus: item.verificationStatus,
            city: input.location.city,
            district: input.location.district,
            state: input.location.state,
            coverageRadiusKm: 15,
            location: {
              type: 'Point',
              coordinates: [input.location.longitude, input.location.latitude],
            },
            issuedAt: new Date(item.issuedAt),
            validFrom: new Date(item.validFrom),
            expiresAt: new Date(item.expiresAt),
            isActive: true,
            metricsSnapshot: item.metricsSnapshot,
          });

          // Deliver in-app notifications once per unique alert fingerprint (duplicate suppressed)
          await this.notifySubscribedUsers(created).catch(() => {});
        }
      } catch {
        // Ignore duplicate race errors (unique fingerprint index)
      }
    }

    try {
      return await EnvironmentalAlert.find({
        city: input.location.city,
        isActive: true,
        expiresAt: { $gt: now },
      })
        .sort({ issuedAt: -1 })
        .limit(20)
        .lean() as unknown as IEnvironmentalAlert[];
    } catch {
      return candidates.map((c, idx) => ({
        _id: `eval-${idx}`,
        fingerprint: `${c.category}:${input.location.slug}:${dayKey}`,
        ...c,
        city: input.location.city,
        district: input.location.district,
        state: input.location.state,
        coverageRadiusKm: 15,
        isActive: true,
      })) as unknown as IEnvironmentalAlert[];
    }
  }

  async getAlertHistory(city?: string, limit = 30) {
    const query: Record<string, unknown> = {};
    if (city) query.city = city;
    return EnvironmentalAlert.find(query)
      .sort({ issuedAt: -1 })
      .limit(Math.min(limit, 100))
      .lean();
  }

  private async notifySubscribedUsers(alert: IEnvironmentalAlert): Promise<void> {
    const prefFieldMap: Partial<Record<AlertCategory, string>> = {
      heatwave: 'alertPreferences.heatwave',
      'extreme-temperature': 'alertPreferences.heatwave',
      'heavy-rainfall': 'alertPreferences.heavyRainfall',
      'poor-aqi': 'alertPreferences.poorAqi',
      'extreme-uv': 'alertPreferences.extremeUv',
      waterlogging: 'alertPreferences.waterlogging',
      thunderstorm: 'alertPreferences.thunderstorm',
    };

    const prefKey = prefFieldMap[alert.category];
    const query: Record<string, unknown> = {
      primaryLocationSlug: new RegExp(`^${alert.city.toLowerCase()}`, 'i'),
    };
    if (prefKey) {
      query[prefKey] = true;
    }

    const subscribers = await EnvironmentalPreference.find(query)
      .select('user')
      .limit(200)
      .lean();

    if (subscribers.length === 0) return;

    const docs = subscribers.map((sub) => ({
      user: sub.user,
      title: alert.title.slice(0, 100),
      message: alert.description.slice(0, 500),
      type: 'environmental-alert' as const,
      metadata: {
        alertId: alert._id,
        category: alert.category,
        severity: alert.severity,
        city: alert.city,
      },
    }));

    await Notification.insertMany(docs);
  }
}

export const environmentalAlertService = new EnvironmentalAlertService();
