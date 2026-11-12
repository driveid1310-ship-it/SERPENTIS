import axiosInstance from '../config/axios';
import type { ApiResponse } from '../types/api';
import type {
  AirQualityData,
  CityCatalogItem,
  CityIntelligenceScores,
  EnvironmentalAlertItem,
  EnvironmentalLocationContext,
  MapLayersData,
  UnifiedOverviewData,
  WeatherData,
} from '../types/environment';

export async function listLocationsRequest(params?: {
  state?: string;
  stage?: 'pilot' | 'state' | 'national';
  q?: string;
}): Promise<ApiResponse<{ cities: CityCatalogItem[]; statesAndUTs: string[]; total: number }>> {
  const res = await axiosInstance.get<
    ApiResponse<{ cities: CityCatalogItem[]; statesAndUTs: string[]; total: number }>
  >('/environment/locations', { params });
  return res.data;
}

export async function resolveLocationRequest(params: {
  slug?: string;
  city?: string;
  lat?: number;
  lon?: number;
}): Promise<ApiResponse<{ location: EnvironmentalLocationContext }>> {
  const res = await axiosInstance.get<ApiResponse<{ location: EnvironmentalLocationContext }>>(
    '/environment/locations/resolve',
    { params },
  );
  return res.data;
}

export async function getWeatherRequest(params: {
  slug?: string;
  lat?: number;
  lon?: number;
  unit?: 'C' | 'F';
  windUnit?: 'kmh' | 'ms';
  refresh?: boolean;
}): Promise<ApiResponse<WeatherData>> {
  const res = await axiosInstance.get<ApiResponse<WeatherData>>('/environment/weather', {
    params,
  });
  return res.data;
}

export async function getAirQualityRequest(params: {
  slug?: string;
  lat?: number;
  lon?: number;
  refresh?: boolean;
}): Promise<ApiResponse<AirQualityData>> {
  const res = await axiosInstance.get<ApiResponse<AirQualityData>>('/environment/aqi', {
    params,
  });
  return res.data;
}

export async function getUnifiedOverviewRequest(params: {
  slug?: string;
  lat?: number;
  lon?: number;
  unit?: 'C' | 'F';
  refresh?: boolean;
}): Promise<ApiResponse<UnifiedOverviewData>> {
  const res = await axiosInstance.get<ApiResponse<UnifiedOverviewData>>('/environment/overview', {
    params,
  });
  return res.data;
}

export async function getMonitoringOverviewRequest(params: {
  slug?: string;
  lat?: number;
  lon?: number;
  radiusMeters?: number;
}): Promise<ApiResponse<any>> {
  const res = await axiosInstance.get<ApiResponse<any>>('/environment/monitoring', { params });
  return res.data;
}

export async function submitEnvironmentalReadingRequest(payload: {
  metricName: string;
  numericValue: number;
  unit?: string;
  latitude: number;
  longitude: number;
  citySlug?: string;
  notes?: string;
}): Promise<ApiResponse<any>> {
  const res = await axiosInstance.post<ApiResponse<any>>('/environment/readings', payload);
  return res.data;
}

export async function getAlertsRequest(params: {
  slug?: string;
  lat?: number;
  lon?: number;
}): Promise<
  ApiResponse<{
    location: EnvironmentalLocationContext;
    activeAlerts: EnvironmentalAlertItem[];
    count: number;
    retrievedAt: string;
  }>
> {
  const res = await axiosInstance.get('/environment/alerts', { params });
  return res.data;
}

export async function getAlertHistoryRequest(params: {
  slug?: string;
  limit?: number;
}): Promise<ApiResponse<{ location: EnvironmentalLocationContext; alerts: EnvironmentalAlertItem[] }>> {
  const res = await axiosInstance.get('/environment/alerts/history', { params });
  return res.data;
}

export async function getAnalyticsRequest(params: {
  slug?: string;
  days?: number;
}): Promise<ApiResponse<any>> {
  const res = await axiosInstance.get('/environment/analytics', { params });
  return res.data;
}

export async function getMapLayersRequest(params: {
  slug?: string;
  lat?: number;
  lon?: number;
  radiusMeters?: number;
}): Promise<ApiResponse<MapLayersData>> {
  const res = await axiosInstance.get<ApiResponse<MapLayersData>>('/environment/map-layers', {
    params,
  });
  return res.data;
}

export async function askAssistantRequest(payload: {
  question: string;
  slug?: string;
  lat?: number;
  lon?: number;
}): Promise<
  ApiResponse<{
    location: EnvironmentalLocationContext;
    answer: string;
    provider: string;
    isAiGenerated: boolean;
    disclaimer: string;
    sources: string[];
    generatedAt: string;
  }>
> {
  const res = await axiosInstance.post('/environment/assistant/ask', payload);
  return res.data;
}

export async function getAssistantSummaryRequest(params: {
  slug?: string;
}): Promise<ApiResponse<any>> {
  const res = await axiosInstance.get('/environment/assistant/summary', { params });
  return res.data;
}

export async function getScoresRequest(params: {
  slug?: string;
}): Promise<ApiResponse<CityIntelligenceScores>> {
  const res = await axiosInstance.get<ApiResponse<CityIntelligenceScores>>(
    '/environment/scores',
    { params },
  );
  return res.data;
}

export async function getSmartCityCapabilitiesRequest(params: {
  slug?: string;
}): Promise<ApiResponse<any>> {
  const res = await axiosInstance.get('/environment/smart-city', { params });
  return res.data;
}

export async function estimateCarbonFootprintRequest(payload: {
  carKmPerWeek?: number;
  twoWheelerKmPerWeek?: number;
  busTrainKmPerWeek?: number;
  monthlyElectricityKwh?: number;
  lpgCylindersPerMonth?: number;
}): Promise<ApiResponse<any>> {
  const res = await axiosInstance.post('/environment/carbon-estimate', payload);
  return res.data;
}
