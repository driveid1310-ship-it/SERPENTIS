import type {
  DataQualityStatus,
  EnvironmentalDataType,
} from '../../models/EnvironmentalReading.js';
import type {
  AlertCategory,
  AlertSeverity,
  AlertVerificationStatus,
} from '../../models/EnvironmentalAlert.js';

export interface LocationContext {
  slug: string;
  name: string;
  city: string;
  district: string;
  state: string;
  locality?: string | undefined;
  latitude: number;
  longitude: number;
}

export interface HourlyWeatherPoint {
  time: string;
  temperatureC: number;
  apparentTemperatureC?: number | undefined;
  humidityPct?: number | undefined;
  precipitationMm?: number | undefined;
  precipitationProbabilityPct?: number | undefined;
  weatherCode: number;
  condition: string;
  windSpeedKmh?: number | undefined;
  uvIndex?: number | undefined;
  dataType: 'forecast' | 'modeled';
}

export interface DailyWeatherPoint {
  date: string;
  tempMinC: number;
  tempMaxC: number;
  precipitationSumMm?: number | undefined;
  precipitationProbabilityMaxPct?: number | undefined;
  weatherCode: number;
  condition: string;
  sunrise?: string | undefined;
  sunset?: string | undefined;
  daylightDurationHours?: number | undefined;
  uvIndexMax?: number | undefined;
  windSpeedMaxKmh?: number | undefined;
  dataType: 'forecast';
}

export interface WeatherCurrentSnapshot {
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
  soilMoistureM3M3: number | null;
}

export interface WeatherDataResult {
  location: LocationContext;
  provider: string;
  attribution: string;
  dataType: EnvironmentalDataType;
  dataQualityStatus: DataQualityStatus;
  isStale: boolean;
  isMockFallback: boolean;
  unavailableReason?: string | undefined;
  observationTimestamp: string;
  retrievalTimestamp: string;
  current: WeatherCurrentSnapshot;
  hourly24h: HourlyWeatherPoint[];
  daily7d: DailyWeatherPoint[];
}

export interface PollutantConcentration {
  value: number | null;
  unit: string;
  averagingPeriod: '24h' | '8h' | '1h' | 'instant';
  subIndex: number | null;
  category: string | null;
  status: DataQualityStatus;
}

export type PollutantKey =
  | 'pm25'
  | 'pm10'
  | 'no2'
  | 'so2'
  | 'co'
  | 'o3'
  | 'nh3'
  | 'pb';

export interface AirQualityStationInfo {
  stationId: string;
  stationName: string;
  provider: string;
  distanceKm: number | null;
  coordinates: [number, number] | null; // [lon, lat]
  isOfficialStation: boolean;
}

export interface AirQualityHourlyPoint {
  time: string;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
  indicativeAqi: number | null;
  dataType: 'observed' | 'modeled' | 'forecast';
}

export interface AirQualityDataResult {
  location: LocationContext;
  provider: string;
  attribution: string;
  methodology: 'CPCB_INDIA_NAQI';
  dataType: EnvironmentalDataType;
  dataQualityStatus: DataQualityStatus;
  isOfficialAqi: boolean;
  insufficientReason?: string | undefined;
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
  station: AirQualityStationInfo | null;
  pollutants: Record<PollutantKey, PollutantConcentration>;
  hourlyTrend: AirQualityHourlyPoint[];
}

export interface ProviderAlertItem {
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  precautions: string[];
  provider: string;
  source: string;
  verificationStatus: AlertVerificationStatus;
  issuedAt: string;
  validFrom: string;
  expiresAt: string;
  metricsSnapshot?: Record<string, unknown> | undefined;
}

export interface WeatherProvider {
  readonly name: string;
  isConfigured(): boolean;
  fetchWeather(location: LocationContext): Promise<WeatherDataResult>;
}

export interface AirQualityProvider {
  readonly name: string;
  isConfigured(): boolean;
  fetchAirQuality(location: LocationContext): Promise<AirQualityDataResult>;
}

export interface AlertProvider {
  readonly name: string;
  isConfigured(): boolean;
  fetchAlerts(location: LocationContext): Promise<ProviderAlertItem[]>;
}

export interface AIAssistantRequest {
  question: string;
  location: LocationContext;
  contextSnapshot: Record<string, unknown>;
}

export interface AIAssistantResponse {
  answer: string;
  provider: string;
  isAiGenerated: boolean;
  disclaimer: string;
  sources: string[];
  generatedAt: string;
}

export interface AIImageAnalysisResult {
  detectedIssues: string[];
  suggestedCategory: string | null;
  confidenceNote: string;
  isVerifiedEvidence: false;
  provider: string;
  isAiGenerated: boolean;
}

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  answerEnvironmentalQuestion(req: AIAssistantRequest): Promise<AIAssistantResponse>;
  analyzeEnvironmentalImage(imageUrl: string, description?: string): Promise<AIImageAnalysisResult>;
}
