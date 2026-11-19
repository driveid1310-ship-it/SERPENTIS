/**
 * Environmental & Climate Intelligence Domain Types
 */

export type {
  LocationContext,
  PollutantKey,
  AirQualityDataResult,
  WeatherDataResult,
  AIAssistantRequest,
  AIAssistantResponse,
  AIImageAnalysisResult,
} from '../services/data-providers/types.js';

export type {
  CpcbCalculationInput,
  CpcbCalculationResult,
  CpcbCategoryInfo,
} from '../services/air-quality/CpcbAqiCalculator.js';

export type {
  CityCatalogEntry,
  CityCatalogEntry as CityCatalogItem,
} from '../services/location/IndiaLocationService.js';

export interface CarbonEstimateRequest {
  monthlyElectricityKwh?: number;
  busTrainKmPerWeek?: number;
  carBikeKmPerWeek?: number;
  lpgCylindersPerMonth?: number;
}

export interface CarbonEstimateResponse {
  totalKgCo2PerYear: number;
  breakdown: {
    electricityKg: number;
    transitKg: number;
    fuelKg: number;
  };
  treesNeededToOffset: number;
  perCapitaComparison: string;
}
