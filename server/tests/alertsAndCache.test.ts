import test from 'node:test';
import assert from 'node:assert/strict';
import { EnvironmentalCacheService } from '../src/services/environmental/EnvironmentalCacheService.js';
import { EnvironmentalAlertService } from '../src/services/environmental/EnvironmentalAlertService.js';
import type { AirQualityDataResult, LocationContext, WeatherDataResult } from '../src/services/data-providers/types.js';

const BADLAPUR: LocationContext = {
  slug: 'badlapur-maharashtra',
  name: 'Badlapur',
  city: 'Badlapur',
  district: 'Thane',
  state: 'Maharashtra',
  locality: 'Badlapur Central',
  latitude: 19.1668,
  longitude: 73.2355,
};

test('EnvironmentalCacheService deduplicates concurrent fetches and respects TTL', async () => {
  const cache = new EnvironmentalCacheService();
  let fetchCount = 0;

  const fetcher = async () => {
    fetchCount++;
    await new Promise((r) => setTimeout(r, 20));
    return { temp: 31 };
  };

  const [r1, r2, r3] = await Promise.all([
    cache.getOrFetch('weather:badlapur', 5000, fetcher),
    cache.getOrFetch('weather:badlapur', 5000, fetcher),
    cache.getOrFetch('weather:badlapur', 5000, fetcher),
  ]);

  assert.equal(fetchCount, 1);
  assert.equal(r1.data.temp, 31);
  assert.equal(r2.cacheHit, true);
  assert.equal(r3.cacheHit, true);

  cache.invalidate('weather:');
  assert.equal(cache.get('weather:badlapur'), null);
});

test('EnvironmentalAlertService detects heatwave, poor AQI, extreme UV, and waterlogging clusters', () => {
  const service = new EnvironmentalAlertService();

  const weather: WeatherDataResult = {
    location: BADLAPUR,
    provider: 'Open-Meteo',
    attribution: 'Open-Meteo',
    dataType: 'modeled',
    dataQualityStatus: 'valid',
    isStale: false,
    isMockFallback: false,
    observationTimestamp: new Date().toISOString(),
    retrievalTimestamp: new Date().toISOString(),
    current: {
      temperatureC: 41.5,
      feelsLikeC: 44.0,
      condition: 'Clear Sky',
      weatherCode: 0,
      humidityPct: 45,
      windSpeedKmh: 12,
      windDirectionDeg: 270,
      windGustsKmh: 18,
      pressureHpa: 1005,
      visibilityMeters: 9000,
      cloudCoverPct: 5,
      precipitationMm: 0,
      uvIndex: 9.5,
      heatIndexC: 45,
      dewPointC: 27,
      windChillC: null,
      sunrise: null,
      sunset: null,
      daylightDurationHours: null,
      solarRadiationWm2: 750,
      soilMoistureM3M3: null,
    },
    hourly24h: [],
    daily7d: [],
  };

  const airQuality: AirQualityDataResult = {
    location: BADLAPUR,
    provider: 'CPCB',
    attribution: 'CPCB',
    methodology: 'CPCB_INDIA_NAQI',
    dataType: 'observed',
    dataQualityStatus: 'valid',
    isOfficialAqi: true,
    isStale: false,
    isMockFallback: false,
    observationTimestamp: new Date().toISOString(),
    retrievalTimestamp: new Date().toISOString(),
    overallAqi: 245,
    aqiCategory: 'Poor',
    aqiColorHex: '#F97316',
    dominantPollutant: 'pm25',
    healthAdvisory: 'Limit outdoor exertion',
    reliabilityNote: 'Official station',
    station: null,
    pollutants: {} as AirQualityDataResult['pollutants'],
    hourlyTrend: [],
  };

  const alerts = service.evaluateConditionAlerts({
    location: BADLAPUR,
    weather,
    airQuality,
    recentWaterloggingCount: 4,
  });

  const categories = new Set(alerts.map((a) => a.category));
  assert.ok(categories.has('heatwave'));
  assert.ok(categories.has('poor-aqi'));
  assert.ok(categories.has('extreme-uv'));
  assert.ok(categories.has('waterlogging'));
});
