import EnvironmentalMetricHistory from '../../models/EnvironmentalMetricHistory.js';
import EnvironmentalReading from '../../models/EnvironmentalReading.js';
import Report from '../../models/Report.js';
import type { LocationContext } from '../data-providers/types.js';

export class ClimateAnalyticsService {
  async getCityAnalytics(location: LocationContext, days = 14) {
    const clampedDays = Math.min(Math.max(days, 1), 90);
    const since = new Date(Date.now() - clampedDays * 24 * 60 * 60 * 1000);

    const [historyRows, reportStatsAgg, categoryAgg, resolutionAgg, noiseReadings, hotspotAgg] =
      await Promise.all([
        EnvironmentalMetricHistory.find({
          city: location.city,
          periodStart: { $gte: since },
        })
          .sort({ periodStart: 1 })
          .lean(),

        Report.aggregate([
          {
            $match: {
              $or: [
                { 'locationMeta.city': location.city },
                { 'locationMeta.city': { $exists: false } },
              ],
            },
          },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ]),

        Report.aggregate([
          {
            $group: {
              _id: '$category',
              total: { $sum: 1 },
              resolved: {
                $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] },
              },
            },
          },
          { $sort: { total: -1 } },
        ]),

        Report.aggregate([
          { $match: { status: 'resolved' } },
          {
            $project: {
              resolutionHours: {
                $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 1000 * 60 * 60],
              },
            },
          },
          {
            $group: {
              _id: null,
              avgResolutionHours: { $avg: '$resolutionHours' },
              count: { $sum: 1 },
            },
          },
        ]),

        EnvironmentalReading.find({
          city: location.city,
          metricName: 'noise-db',
          observationTimestamp: { $gte: since },
        })
          .sort({ observationTimestamp: 1 })
          .limit(50)
          .lean(),

        Report.aggregate([
          {
            $match: {
              category: {
                $in: [
                  'garbage',
                  'pollution',
                  'air-pollution',
                  'water-contamination',
                  'waterlogging',
                  'noise-pollution',
                  'open-burning',
                  'industrial-pollution',
                ],
              },
              createdAt: { $gte: since },
            },
          },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              unresolved: {
                $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] },
              },
            },
          },
          { $sort: { count: -1 } },
        ]),
      ]);

    const statusCounts: Record<string, number> = {
      pending: 0,
      'in-progress': 0,
      resolved: 0,
      rejected: 0,
    };
    let totalReports = 0;
    for (const row of reportStatsAgg) {
      statusCounts[String(row._id)] = Number(row.count);
      totalReports += Number(row.count);
    }

    const resolutionRatePct =
      totalReports > 0
        ? Number((((statusCounts.resolved ?? 0) / totalReports) * 100).toFixed(1))
        : 0;

    const avgResolutionHours =
      resolutionAgg[0]?.avgResolutionHours !== undefined
        ? Number(Number(resolutionAgg[0].avgResolutionHours).toFixed(1))
        : null;

    const weatherTrends = historyRows
      .filter((r) => r.temperatureAvgC !== undefined)
      .map((r) => ({
        date: r.periodStart.toISOString().slice(0, 10),
        tempAvgC: r.temperatureAvgC,
        tempMinC: r.temperatureMinC ?? null,
        tempMaxC: r.temperatureMaxC ?? null,
        humidityAvgPct: r.humidityAvgPct ?? null,
        rainfallTotalMm: r.rainfallTotalMm ?? null,
        windSpeedAvgKmh: r.windSpeedAvgKmh ?? null,
        dataType: r.dataType,
      }));

    const aqiTrends = historyRows
      .filter((r) => r.aqiAvg !== undefined)
      .map((r) => ({
        date: r.periodStart.toISOString().slice(0, 10),
        aqiAvg: r.aqiAvg,
        aqiMax: r.aqiMax ?? r.aqiAvg,
        pm25Avg: r.pm25Avg ?? null,
        pm10Avg: r.pm10Avg ?? null,
        dominantPollutant: r.dominantPollutant ?? null,
        dataType: r.dataType,
      }));

    return {
      location,
      periodDays: clampedDays,
      generatedAt: new Date().toISOString(),
      coverageNotice:
        historyRows.length === 0
          ? 'No multi-day historical snapshots are stored in MongoDB for this city yet. Historical trends populate automatically as weather and AQI observations are retrieved over time.'
          : `${historyRows.length} recorded daily environmental snapshot(s) available for the last ${clampedDays} days.`,
      weatherAnalytics: {
        hasHistoricalData: weatherTrends.length > 0,
        dataPointsCount: weatherTrends.length,
        dailyTrends: weatherTrends,
      },
      aqiAnalytics: {
        hasHistoricalData: aqiTrends.length > 0,
        dataPointsCount: aqiTrends.length,
        dailyTrends: aqiTrends,
      },
      civicAnalytics: {
        totalReports,
        pending: statusCounts.pending ?? 0,
        inProgress: statusCounts['in-progress'] ?? 0,
        resolved: statusCounts.resolved ?? 0,
        rejected: statusCounts.rejected ?? 0,
        resolutionRatePct,
        avgResolutionHours,
        byCategory: categoryAgg.map((c) => ({
          category: String(c._id),
          total: Number(c.total),
          resolved: Number(c.resolved),
        })),
      },
      environmentalAnalytics: {
        hotspotCategories: hotspotAgg.map((h) => ({
          category: String(h._id),
          count: Number(h.count),
          unresolved: Number(h.unresolved),
        })),
        noiseSamplesCount: noiseReadings.length,
        noiseTrend: noiseReadings.map((n) => ({
          timestamp: n.observationTimestamp,
          valueDb: n.numericValue,
          dataType: n.dataType,
        })),
      },
    };
  }
}

export const climateAnalyticsService = new ClimateAnalyticsService();
