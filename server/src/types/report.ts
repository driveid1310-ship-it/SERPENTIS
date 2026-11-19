/**
 * Civic & Environmental Grievance Report Types
 */

export type ReportCategory =
  | 'pothole'
  | 'garbage'
  | 'water-leakage'
  | 'streetlight'
  | 'traffic'
  | 'pollution'
  | 'stray-animals'
  | 'food-safety'
  | 'air-pollution'
  | 'water-contamination'
  | 'noise-pollution'
  | 'tree-cutting'
  | 'waterlogging'
  | 'drainage-blockage'
  | 'industrial-pollution'
  | 'open-burning'
  | 'environmental-other'
  | 'other';

export type ReportStatus =
  | 'submitted'
  | 'in-progress'
  | 'resolved'
  | 'rejected';

export type ReportSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface EnvironmentalReportDetails {
  suspectedSource?: string;
  noiseDecibelsEstimate?: number;
  waterPhEstimate?: number;
  waterTurbidityNote?: string;
  affectedRadiusMeters?: number;
  isCitizenEstimate?: boolean;
}

export interface ReportLocationMeta {
  city?: string;
  district?: string;
  state?: string;
  locality?: string;
}

export type FoodSafetyConcernType =
  | 'hygiene'
  | 'adulteration'
  | 'expired'
  | 'foreign-object'
  | 'food-poisoning'
  | 'misbranding'
  | 'other';

export type OfficialFilingStatus = 'not_filed' | 'filed_by_citizen';

export interface FoodSafetyOfficialFiling {
  status: OfficialFilingStatus;
  docketNumber?: string;
  filingDate?: string;
  channelName?: string;
}

export interface FoodSafetyDetails {
  establishmentName?: string;
  foodItem?: string;
  incidentDate?: string;
  concernType?: FoodSafetyConcernType;
  officialFiling?: FoodSafetyOfficialFiling;
}

