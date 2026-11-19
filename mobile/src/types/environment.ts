export interface EnvironmentalLocationContext {
  slug: string;
  name: string;
  city: string;
  district: string;
  state: string;
  locality?: string;
  latitude: number;
  longitude: number;
}

export interface CityCatalogItem {
  slug: string;
  name: string;
  city: string;
  district: string;
  state: string;
  locality: string;
  latitude: number;
  longitude: number;
  expansionStage: 'pilot' | 'state' | 'national';
  isPilot: boolean;
  climateZone: string;
  coverage: {
    weather: boolean;
    airQualityModeled: boolean;
    airQualityStations: boolean;
    civicReports: boolean;
    officialAlerts: boolean;
    greenSpaces: boolean;
  };
}

export interface HourlyWeatherPoint {
  time: string;
  temperatureC: number;
  apparentTemperatureC?: number;
  humidityPct?: number;
  precipitationMm?: number;
  precipitationProbabilityPct?: number;
  weatherCode: number;
  condition: string;
  windSpeedKmh?: number;
  uvIndex?: number;
  dataType: 'forecast' | 'modeled';
}

export interface DailyWeatherPoint {
  date: string;
  tempMinC: number;
  tempMaxC: number;
  precipitationSumMm?: number;
  precipitationProbabilityMaxPct?: number;
  weatherCode: number;
  condition: string;
  sunrise?: string;
  sunset?: string;
  daylightDurationHours?: number;
  uvIndexMax?: number;
  windSpeedMaxKmh?: number;
  dataType: 'forecast';
}

export interface WeatherData {
  location: EnvironmentalLocationContext;
  provider: string;
  attribution: string;
  dataType: string;
  dataQualityStatus: string;
  isStale: boolean;
  isMockFallback: boolean;
  unavailableReason?: string;
  observationTimestamp: string;
  retrievalTimestamp: string;
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
  current: {
    temperatureC: number;
    feelsLikeC: number;
    condition: string;
    weatherCode: number;
    humidityPct: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    windGustsKmh: number | null;
    pressureHpa: number | null;
    visibilityMeters: number | null;
    cloudCoverPct: number | null;
    precipitationMm: number;
    uvIndex: number | null;
    heatIndexC: number | null;
    dewPointC: number | null;
    windChillC: number | null;
    sunrise: string | null;
    sunset: string | null;
    daylightDurationHours: number | null;
    solarRadiationWm2: number | null;
  };
  hourly24h: HourlyWeatherPoint[];
  daily7d: DailyWeatherPoint[];
}

export type PollutantKey = 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3' | 'nh3' | 'pb';

export interface PollutantConcentration {
  value: number | null;
  unit: string;
  averagingPeriod: string;
  subIndex: number | null;
  category: string | null;
  status: string;
}

export interface AirQualityData {
  location: EnvironmentalLocationContext;
  provider: string;
  attribution: string;
  methodology: string;
  dataType: string;
  dataQualityStatus: string;
  isOfficialAqi: boolean;
  insufficientReason?: string;
  isStale: boolean;
  isMockFallback: boolean;
  observationTimestamp: string;
  retrievalTimestamp: string;
  overallAqi: number | null;
  aqiCategory: string | null;
  aqiColorHex: string;
  dominantPollutant: PollutantKey | null;
  healthAdvisory: string;
  reliabilityNote: string;
  station: {
    stationId: string;
    stationName: string;
    provider: string;
    distanceKm: number | null;
    coordinates: [number, number] | null;
    isOfficialStation: boolean;
  } | null;
  pollutants: Record<PollutantKey, PollutantConcentration>;
  hourlyTrend: Array<{
    time: string;
    pm25: number | null;
    pm10: number | null;
    no2: number | null;
    o3: number | null;
    indicativeAqi: number | null;
    dataType: string;
  }>;
}

export interface EnvironmentalAlertItem {
  _id: string;
  category: string;
  severity: 'advisory' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  precautions: string[];
  provider: string;
  source: string;
  verificationStatus: 'official' | 'threshold-advisory' | 'experimental';
  city: string;
  district: string;
  state: string;
  issuedAt: string;
  validFrom: string;
  expiresAt: string;
  isActive: boolean;
}

export interface CityIntelligenceScores {
  location: EnvironmentalLocationContext;
  generatedAt: string;
  observationTimestamp: string;
  environmentalHealth: {
    score: number | null;
    band: string;
    dataCoveragePct: number;
    methodology: string;
    disclaimer: string;
    components: Array<{
      indicator: string;
      rawValue: string;
      weightPct: number;
      subScore: number | null;
      available: boolean;
      note: string;
    }>;
  };
  civicHealth: {
    score: number | null;
    dataCompletenessPct: number;
    metrics: {
      totalReports: number;
      resolvedReports: number;
      resolutionRatePct: number | null;
      unresolvedEnvironmentalBacklog: number;
      nearbyPublicServicesMapped: number;
    };
    methodology: string;
  };
}

export interface UnifiedOverviewData {
  location: EnvironmentalLocationContext;
  weather: WeatherData;
  airQuality: AirQualityData;
  alerts: EnvironmentalAlertItem[];
  scores: CityIntelligenceScores;
  civicSummary: {
    totalReports: number;
    activeReports: number;
    pendingReports: number;
    inProgressReports: number;
    resolvedReports: number;
    nearbyPublicServices: number;
  };
  generatedAt: string;
}

export interface MapLayersData {
  location: EnvironmentalLocationContext;
  weatherPin: {
    coordinates: [number, number];
    temperatureC: number;
    condition: string;
    humidityPct: number;
    dataType: string;
    provider: string;
  };
  airQualityGrid: {
    coordinates: [number, number];
    overallAqi: number | null;
    aqiCategory: string | null;
    aqiColorHex: string;
    isOfficialAqi: boolean;
    dataType: string;
    provider: string;
  };
  layers: {
    aqiStations: Array<{
      _id: string;
      stationCode: string;
      name: string;
      provider: string;
      reliabilityTier: string;
      location: { type: 'Point'; coordinates: [number, number] };
    }>;
    pollutionHotspots: any[];
    garbageHotspots: any[];
    waterContamination: any[];
    waterlogging: any[];
    civicReports: any[];
    hospitals: any[];
    publicServices: any[];
    greenSpaces: any[];
    heritage: any[];
  };
  retrievedAt: string;
}
