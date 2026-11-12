import EnvironmentalReading from '../../models/EnvironmentalReading.js';
import MonitoringStation from '../../models/MonitoringStation.js';
import Place from '../../models/Place.js';
import Report from '../../models/Report.js';
import type { LocationContext } from '../data-providers/types.js';
import { isValidCoordinates } from './EnvironmentalValidationService.js';

export type MonitoringDomain = 'noise' | 'water' | 'waste' | 'green-cover' | 'waterlogging';

export interface SubmitReadingInput {
  metricName: string;
  numericValue: number;
  unit: string;
  latitude: number;
  longitude: number;
  location: LocationContext;
  userId: string;
  notes?: string | undefined;
  isCalibratedSensor?: boolean | undefined;
}

const ALLOWED_CITIZEN_METRICS: Record<string, { unit: string; min: number; max: number }> = {
  'noise-db': { unit: 'dBA', min: 10, max: 160 },
  'water-ph': { unit: 'pH', min: 0, max: 14 },
  'water-tds': { unit: 'ppm', min: 0, max: 10000 },
  'water-turbidity': { unit: 'NTU', min: 0, max: 2000 },
  'water-dissolved-oxygen': { unit: 'mg/L', min: 0, max: 25 },
  'water-conductivity': { unit: 'µS/cm', min: 0, max: 50000 },
  'waterlogging-depth-cm': { unit: 'cm', min: 0, max: 500 },
};

export class EnvironmentalMonitoringService {
  async submitCitizenReading(input: SubmitReadingInput) {
    const metricKey = input.metricName.trim().toLowerCase();
    const spec = ALLOWED_CITIZEN_METRICS[metricKey];
    if (!spec) {
      throw new Error(
        `Unsupported environmental metric "${input.metricName}". Supported: ${Object.keys(ALLOWED_CITIZEN_METRICS).join(', ')}.`,
      );
    }

    if (
      typeof input.numericValue !== 'number' ||
      !Number.isFinite(input.numericValue) ||
      input.numericValue < spec.min ||
      input.numericValue > spec.max
    ) {
      throw new Error(
        `Metric "${metricKey}" must be between ${spec.min} and ${spec.max} ${spec.unit}.`,
      );
    }

    if (!isValidCoordinates(input.latitude, input.longitude)) {
      throw new Error('Valid GPS coordinates are required.');
    }

    const now = new Date();
    const isCalibrated = Boolean(input.isCalibratedSensor);

    const reading = await EnvironmentalReading.create({
      metricName: metricKey,
      numericValue: Number(input.numericValue.toFixed(2)),
      unit: spec.unit,
      location: {
        type: 'Point',
        coordinates: [input.longitude, input.latitude],
      },
      locationName: input.location.name,
      locality: input.location.locality,
      city: input.location.city,
      district: input.location.district,
      state: input.location.state,
      observationTimestamp: now,
      retrievalTimestamp: now,
      provider: isCalibrated ? 'Registered Sensor' : 'Citizen Observation',
      dataQualityStatus: isCalibrated ? 'valid' : 'uncalibrated',
      dataType: isCalibrated ? 'observed' : 'citizen-reported',
      classification: 'observation',
      confidence: isCalibrated ? 0.85 : 0.45,
      reportedBy: input.userId,
      notes: input.notes?.trim().slice(0, 500),
      metadata: {
        verificationNotice: isCalibrated
          ? 'Calibrated sensor reading'
          : 'Citizen-submitted estimate — not a laboratory-confirmed or official regulatory measurement.',
      },
    });

    return reading;
  }

  async getMonitoringOverview(location: LocationContext, radiusMeters = 15000) {
    const centerPoint = {
      type: 'Point' as const,
      coordinates: [location.longitude, location.latitude],
    };

    const [
      noiseReadings,
      waterReadings,
      noiseReports,
      waterReports,
      wasteReports,
      waterloggingReports,
      greenSpaces,
      stations,
    ] = await Promise.all([
      EnvironmentalReading.find({
        metricName: 'noise-db',
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .sort({ observationTimestamp: -1 })
        .limit(30)
        .lean(),
      EnvironmentalReading.find({
        metricName: {
          $in: [
            'water-ph',
            'water-tds',
            'water-turbidity',
            'water-dissolved-oxygen',
            'water-conductivity',
          ],
        },
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .sort({ observationTimestamp: -1 })
        .limit(40)
        .lean(),
      Report.find({
        category: 'noise-pollution',
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .sort({ createdAt: -1 })
        .limit(25)
        .select('title description status priority location createdAt environmentalDetails verified')
        .lean(),
      Report.find({
        category: { $in: ['water-contamination', 'water-leakage'] },
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .sort({ createdAt: -1 })
        .limit(25)
        .select('title description status priority location createdAt environmentalDetails verified')
        .lean(),
      Report.find({
        category: 'garbage',
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .sort({ createdAt: -1 })
        .limit(40)
        .select('title description status priority location createdAt verified')
        .lean(),
      Report.find({
        category: { $in: ['waterlogging', 'drainage-blockage'] },
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .sort({ createdAt: -1 })
        .limit(25)
        .select('title description status priority location createdAt verified')
        .lean(),
      Place.find({
        category: { $in: ['park', 'lake', 'waterfall', 'viewpoint'] },
        location: { $near: { $geometry: centerPoint, $maxDistance: radiusMeters } },
      })
        .limit(30)
        .select('name category address location averageRating visitingHours')
        .lean(),
      MonitoringStation.find({
        location: { $near: { $geometry: centerPoint, $maxDistance: 35000 } },
        isActive: true,
      })
        .limit(15)
        .lean(),
    ]);

    const calibratedNoise = noiseReadings.filter((r) => r.dataType === 'observed');
    const citizenNoise = noiseReadings.filter((r) => r.dataType === 'citizen-reported');

    const avgCitizenNoiseDb =
      citizenNoise.length > 0
        ? Number(
            (
              citizenNoise.reduce((acc, r) => acc + r.numericValue, 0) /
              citizenNoise.length
            ).toFixed(1),
          )
        : null;

    const avgCalibratedNoiseDb =
      calibratedNoise.length > 0
        ? Number(
            (
              calibratedNoise.reduce((acc, r) => acc + r.numericValue, 0) /
              calibratedNoise.length
            ).toFixed(1),
          )
        : null;

    const unresolvedWaste = wasteReports.filter((r) => r.status !== 'resolved').length;
    const resolvedWaste = wasteReports.filter((r) => r.status === 'resolved').length;

    return {
      location,
      radiusMeters,
      retrievedAt: new Date().toISOString(),
      noise: {
        calibratedSensorCount: calibratedNoise.length,
        avgCalibratedDb: avgCalibratedNoiseDb,
        citizenEstimateCount: citizenNoise.length,
        avgCitizenEstimateDb: avgCitizenNoiseDb,
        noiseComplaintsCount: noiseReports.length,
        recentReadings: noiseReadings.slice(0, 10),
        recentComplaints: noiseReports.slice(0, 10),
        dataNote:
          'Calibrated sensor measurements and citizen-reported noise estimates are tracked separately and never conflated.',
      },
      waterQuality: {
        readingsCount: waterReadings.length,
        suspectedContaminationReportsCount: waterReports.length,
        recentReadings: waterReadings.slice(0, 12),
        recentReports: waterReports.slice(0, 10),
        dataNote:
          'Citizen-reported water contamination complaints and uncalibrated field estimates are NOT laboratory-confirmed results.',
      },
      greenCover: {
        spacesCount: greenSpaces.length,
        spaces: greenSpaces,
      },
      wasteMonitoring: {
        totalReports: wasteReports.length,
        unresolvedHotspots: unresolvedWaste,
        cleanupResolvedCount: resolvedWaste,
        recentHotspots: wasteReports.slice(0, 15),
      },
      waterlogging: {
        reportsCount: waterloggingReports.length,
        recentReports: waterloggingReports.slice(0, 10),
      },
      monitoringStations: stations,
    };
  }
}

export const environmentalMonitoringService = new EnvironmentalMonitoringService();
