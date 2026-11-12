import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import type { ExpansionStage } from '../models/EnvironmentalLocation.js';
import EnvironmentalPreference from '../models/EnvironmentalPreference.js';
import MonitoringStation from '../models/MonitoringStation.js';
import Place from '../models/Place.js';
import PublicService from '../models/PublicService.js';
import Report from '../models/Report.js';
import { cityIntelligenceAIService } from '../services/ai/CityIntelligenceAIService.js';
import { airQualityService } from '../services/air-quality/AirQualityService.js';
import { climateAnalyticsService } from '../services/analytics/ClimateAnalyticsService.js';
import { environmentalAlertService } from '../services/environmental/EnvironmentalAlertService.js';
import { environmentalMonitoringService } from '../services/environmental/EnvironmentalMonitoringService.js';
import { cityIntelligenceScoreService } from '../services/intelligence/CityIntelligenceScoreService.js';
import {
  INDIA_STATES_AND_UTS,
  indiaLocationService,
} from '../services/location/IndiaLocationService.js';
import { smartCityCapabilitiesService } from '../services/smartcity/SmartCityCapabilitiesService.js';
import { weatherService } from '../services/weather/WeatherService.js';

function parseOptionalNumber(val: unknown): number | undefined {
  if (val === undefined || val === null || val === '') return undefined;
  const num = Number(val);
  return Number.isFinite(num) ? num : undefined;
}

async function resolveTargetLocation(req: Request) {
  await indiaLocationService.ensureSeeded();
  const q = req.query;
  return indiaLocationService.resolveLocation({
    slug: typeof q.slug === 'string' ? q.slug : undefined,
    city: typeof q.city === 'string' ? q.city : undefined,
    lat: parseOptionalNumber(q.lat ?? q.latitude),
    lon: parseOptionalNumber(q.lon ?? q.lng ?? q.longitude),
  });
}

export async function listLocations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await indiaLocationService.ensureSeeded();
    const state = typeof req.query.state === 'string' ? req.query.state : undefined;
    const district = typeof req.query.district === 'string' ? req.query.district : undefined;
    const stageRaw = typeof req.query.stage === 'string' ? req.query.stage : undefined;
    const stage: ExpansionStage | undefined =
      stageRaw === 'pilot' || stageRaw === 'state' || stageRaw === 'national'
        ? stageRaw
        : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;

    const cities = indiaLocationService.listCities({ state, district, stage, q });
    res.status(200).json({
      success: true,
      data: {
        cities,
        statesAndUTs: INDIA_STATES_AND_UTS,
        total: cities.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveLocationEndpoint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    res.status(200).json({
      success: true,
      data: { location },
    });
  } catch (error) {
    next(error);
  }
}

export async function getWeather(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const forceRefresh = req.query.refresh === 'true';
    const temperatureUnit = req.query.unit === 'F' ? 'F' : 'C';
    const windSpeedUnit = req.query.windUnit === 'ms' ? 'ms' : 'kmh';

    const weather = await weatherService.getWeather(location, {
      forceRefresh,
      temperatureUnit,
      windSpeedUnit,
    });

    res.status(200).json({
      success: true,
      data: weather,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAirQuality(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const forceRefresh = req.query.refresh === 'true';
    const airQuality = await airQualityService.getAirQuality(location, { forceRefresh });

    res.status(200).json({
      success: true,
      data: airQuality,
    });
  } catch (error) {
    next(error);
  }
}

export async function getUnifiedOverview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const forceRefresh = req.query.refresh === 'true';
    const temperatureUnit = req.query.unit === 'F' ? 'F' : 'C';

    const [weather, airQuality] = await Promise.all([
      weatherService.getWeather(location, { forceRefresh, temperatureUnit }),
      airQualityService.getAirQuality(location, { forceRefresh }),
    ]);

    const [alerts, scores, civicTotals] = await Promise.all([
      environmentalAlertService.syncAndGetActiveAlerts({
        location,
        weather,
        airQuality,
      }),
      cityIntelligenceScoreService.computeCityIntelligenceOverview(
        location,
        weather,
        airQuality,
      ),
      Promise.all([
        Report.countDocuments(),
        Report.countDocuments({ status: 'pending' }),
        Report.countDocuments({ status: 'in-progress' }),
        Report.countDocuments({ status: 'resolved' }),
        PublicService.countDocuments({
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [location.longitude, location.latitude],
              },
              $maxDistance: 25000,
            },
          },
        }),
      ]).catch(() => [0, 0, 0, 0, 0] as [number, number, number, number, number]),
    ]);

    const [totalReports, pendingReports, inProgressReports, resolvedReports, nearbyServices] =
      civicTotals;

    res.status(200).json({
      success: true,
      data: {
        location,
        weather,
        airQuality,
        alerts,
        scores,
        civicSummary: {
          totalReports,
          activeReports: pendingReports + inProgressReports,
          pendingReports,
          inProgressReports,
          resolvedReports,
          nearbyPublicServices: nearbyServices,
        },
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMonitoringOverview(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const radiusMeters = Math.min(
      Math.max(parseOptionalNumber(req.query.radiusMeters) ?? 15000, 1000),
      50000,
    );
    const data = await environmentalMonitoringService.getMonitoringOverview(
      location,
      radiusMeters,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
}

export async function submitEnvironmentalReading(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { metricName, numericValue, unit, latitude, longitude, notes, isCalibratedSensor, citySlug } =
      req.body ?? {};

    if (typeof metricName !== 'string' || typeof numericValue !== 'number') {
      res.status(400).json({
        success: false,
        message: 'metricName (string) and numericValue (number) are required.',
      });
      return;
    }

    const location = await indiaLocationService.resolveLocation({
      slug: typeof citySlug === 'string' ? citySlug : undefined,
      lat: typeof latitude === 'number' ? latitude : undefined,
      lon: typeof longitude === 'number' ? longitude : undefined,
    });

    const reading = await environmentalMonitoringService.submitCitizenReading({
      metricName,
      numericValue,
      unit: typeof unit === 'string' ? unit : '',
      latitude: typeof latitude === 'number' ? latitude : location.latitude,
      longitude: typeof longitude === 'number' ? longitude : location.longitude,
      location,
      userId: req.userId,
      notes: typeof notes === 'string' ? notes : undefined,
      isCalibratedSensor: Boolean(isCalibratedSensor),
    });

    res.status(201).json({
      success: true,
      message: 'Environmental observation recorded.',
      data: { reading },
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Unsupported environmental metric')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    if (error instanceof Error && error.message.includes('must be between')) {
      res.status(400).json({ success: false, message: error.message });
      return;
    }
    next(error);
  }
}

export async function getAlerts(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const [weather, airQuality] = await Promise.all([
      weatherService.getWeather(location),
      airQualityService.getAirQuality(location),
    ]);
    const activeAlerts = await environmentalAlertService.syncAndGetActiveAlerts({
      location,
      weather,
      airQuality,
    });

    res.status(200).json({
      success: true,
      data: {
        location,
        activeAlerts,
        count: activeAlerts.length,
        retrievedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAlertHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const limit = parseOptionalNumber(req.query.limit) ?? 30;
    const history = await environmentalAlertService.getAlertHistory(location.city, limit);
    res.status(200).json({
      success: true,
      data: { location, alerts: history },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const days = parseOptionalNumber(req.query.days) ?? 14;
    const analytics = await climateAnalyticsService.getCityAnalytics(location, days);
    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMapLayers(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const radiusMeters = Math.min(
      Math.max(parseOptionalNumber(req.query.radiusMeters) ?? 15000, 1000),
      50000,
    );
    const centerPoint = {
      type: 'Point' as const,
      coordinates: [location.longitude, location.latitude],
    };

    const [weather, airQuality, reports, services, places, stations] = await Promise.all([
      weatherService.getWeather(location),
      airQualityService.getAirQuality(location),
      Report.find({
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .sort({ createdAt: -1 })
        .limit(120)
        .select('title description category status priority location verified createdAt isAnonymous')
        .lean(),
      PublicService.find({
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .limit(100)
        .select('name category address phone location isEmergency')
        .lean(),
      Place.find({
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .limit(100)
        .select('name category address location averageRating visitingHours')
        .lean(),
      MonitoringStation.find({
        location: { $near: { $geometry: centerPoint, $maxDistance: 40000 } },
        isActive: true,
      })
        .limit(20)
        .lean(),
    ]);

    const pollutionCategories = new Set(['pollution', 'air-pollution', 'industrial-pollution', 'open-burning']);
    const waterCategories = new Set(['water-contamination', 'water-leakage']);
    const waterloggingCategories = new Set(['waterlogging', 'drainage-blockage']);

    res.status(200).json({
      success: true,
      data: {
        location,
        weatherPin: {
          coordinates: [location.longitude, location.latitude],
          temperatureC: weather.current.temperatureC,
          condition: weather.current.condition,
          humidityPct: weather.current.humidityPct,
          dataType: weather.dataType,
          provider: weather.provider,
        },
        airQualityGrid: {
          coordinates: [location.longitude, location.latitude],
          overallAqi: airQuality.overallAqi,
          aqiCategory: airQuality.aqiCategory,
          aqiColorHex: airQuality.aqiColorHex,
          isOfficialAqi: airQuality.isOfficialAqi,
          dataType: airQuality.dataType,
          provider: airQuality.provider,
        },
        layers: {
          aqiStations: stations,
          pollutionHotspots: reports.filter((r) => pollutionCategories.has(r.category)),
          garbageHotspots: reports.filter((r) => r.category === 'garbage'),
          waterContamination: reports.filter((r) => waterCategories.has(r.category)),
          waterlogging: reports.filter((r) => waterloggingCategories.has(r.category)),
          civicReports: reports,
          hospitals: services.filter((s) => s.category === 'hospital'),
          publicServices: services,
          greenSpaces: places.filter((p) =>
            ['park', 'lake', 'waterfall', 'viewpoint'].includes(p.category),
          ),
          heritage: places.filter((p) =>
            ['fort', 'temple', 'museum'].includes(p.category),
          ),
        },
        retrievedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function askAssistant(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const question =
      typeof req.body?.question === 'string' ? req.body.question.trim() : '';
    if (!question || question.length < 3 || question.length > 500) {
      res.status(400).json({
        success: false,
        message: 'Question must be between 3 and 500 characters.',
      });
      return;
    }

    const location = await indiaLocationService.resolveLocation({
      slug: typeof req.body?.slug === 'string' ? req.body.slug : undefined,
      city: typeof req.body?.city === 'string' ? req.body.city : undefined,
      lat: parseOptionalNumber(req.body?.lat),
      lon: parseOptionalNumber(req.body?.lon),
    });

    const [weather, airQuality] = await Promise.all([
      weatherService.getWeather(location),
      airQualityService.getAirQuality(location),
    ]);
    const alerts = await environmentalAlertService.syncAndGetActiveAlerts({
      location,
      weather,
      airQuality,
    });

    const response = await cityIntelligenceAIService.answerQuestion(
      question,
      location,
      weather,
      airQuality,
      alerts,
    );

    res.status(200).json({
      success: true,
      data: {
        location,
        ...response,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAssistantSummary(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const [weather, airQuality] = await Promise.all([
      weatherService.getWeather(location),
      airQualityService.getAirQuality(location),
    ]);
    const alerts = await environmentalAlertService.syncAndGetActiveAlerts({
      location,
      weather,
      airQuality,
    });
    const summary = await cityIntelligenceAIService.detectPatternsAndSummarize(
      location,
      weather,
      airQuality,
      alerts,
    );
    res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
}

export async function analyzeEnvironmentalImage(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }
    const imageUrl = typeof req.body?.imageUrl === 'string' ? req.body.imageUrl.trim() : '';
    const description =
      typeof req.body?.description === 'string' ? req.body.description.trim() : undefined;

    if (!imageUrl) {
      res.status(400).json({ success: false, message: 'imageUrl is required.' });
      return;
    }

    const result = await cityIntelligenceAIService.analyzeImage(imageUrl, description);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getScores(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const [weather, airQuality] = await Promise.all([
      weatherService.getWeather(location),
      airQualityService.getAirQuality(location),
    ]);
    const scores = await cityIntelligenceScoreService.computeCityIntelligenceOverview(
      location,
      weather,
      airQuality,
    );
    res.status(200).json({ success: true, data: scores });
  } catch (error) {
    next(error);
  }
}

export async function getSmartCityCapabilities(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const location = await resolveTargetLocation(req);
    const [weather, disasterPreparedness, mobilityAndGreen] = await Promise.all([
      weatherService.getWeather(location),
      smartCityCapabilitiesService.getDisasterPreparedness(location),
      smartCityCapabilitiesService.getMobilityAndGreenSpaces(location),
    ]);

    const solarPotential = smartCityCapabilitiesService.getSolarPotential(location, weather);
    const challenges = smartCityCapabilitiesService.getCitizenChallenges(location);

    res.status(200).json({
      success: true,
      data: {
        location,
        disasterPreparedness,
        solarPotential,
        mobilityAndGreen,
        challenges,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function estimateCarbonFootprint(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const body = req.body ?? {};
    const result = smartCityCapabilitiesService.calculateEducationalCarbonFootprint({
      carKmPerWeek: parseOptionalNumber(body.carKmPerWeek),
      twoWheelerKmPerWeek: parseOptionalNumber(body.twoWheelerKmPerWeek),
      busTrainKmPerWeek: parseOptionalNumber(body.busTrainKmPerWeek),
      monthlyElectricityKwh: parseOptionalNumber(body.monthlyElectricityKwh),
      lpgCylindersPerMonth: parseOptionalNumber(body.lpgCylindersPerMonth),
    });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getPreferences(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    let pref = await EnvironmentalPreference.findOne({ user: req.userId }).lean();
    if (!pref) {
      pref = await EnvironmentalPreference.create({ user: req.userId });
    }
    res.status(200).json({ success: true, data: { preferences: pref } });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const update: Record<string, unknown> = {};
    const body = req.body ?? {};

    if (body.temperatureUnit === 'C' || body.temperatureUnit === 'F') {
      update.temperatureUnit = body.temperatureUnit;
    }
    if (body.windSpeedUnit === 'kmh' || body.windSpeedUnit === 'ms') {
      update.windSpeedUnit = body.windSpeedUnit;
    }
    if (typeof body.primaryLocationSlug === 'string' && body.primaryLocationSlug.trim()) {
      update.primaryLocationSlug = body.primaryLocationSlug.trim().toLowerCase();
    }
    if (typeof body.locationConsentGranted === 'boolean') {
      update.locationConsentGranted = body.locationConsentGranted;
    }
    if (body.alertPreferences && typeof body.alertPreferences === 'object') {
      update.alertPreferences = body.alertPreferences;
    }
    if (Array.isArray(body.savedLocations)) {
      update.savedLocations = body.savedLocations.slice(0, 10);
    }

    const preferences = await EnvironmentalPreference.findOneAndUpdate(
      { user: req.userId },
      { $set: update },
      { new: true, upsert: true },
    ).lean();

    res.status(200).json({
      success: true,
      message: 'Environmental preferences updated.',
      data: { preferences },
    });
  } catch (error) {
    next(error);
  }
}
