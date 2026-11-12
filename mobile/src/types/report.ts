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

export type ReportSeverity = 'low' | 'medium' | 'high';

export type ReportStatus = 'pending' | 'in-progress' | 'resolved' | 'rejected';

export interface ReportCategoryOption {
  key: ReportCategory;
  label: string;
}

export const REPORT_CATEGORY_OPTIONS: ReportCategoryOption[] = [
  { key: 'pothole', label: 'Pothole' },
  { key: 'garbage', label: 'Garbage' },
  { key: 'water-leakage', label: 'Water Leakage' },
  { key: 'streetlight', label: 'Streetlight' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'pollution', label: 'Pollution' },
  { key: 'stray-animals', label: 'Stray Animals' },
  { key: 'food-safety', label: 'Food Safety & Hygiene' },
  { key: 'air-pollution', label: 'Air Pollution' },
  { key: 'water-contamination', label: 'Water Contamination' },
  { key: 'noise-pollution', label: 'Noise Pollution' },
  { key: 'tree-cutting', label: 'Tree Cutting' },
  { key: 'waterlogging', label: 'Waterlogging' },
  { key: 'drainage-blockage', label: 'Drainage Blockage' },
  { key: 'industrial-pollution', label: 'Industrial Pollution' },
  { key: 'open-burning', label: 'Open Burning' },
  { key: 'environmental-other', label: 'Other Environmental' },
  { key: 'other', label: 'Other' },
];

export interface ReportSeverityOption {
  key: ReportSeverity;
  label: string;
}

export const REPORT_SEVERITY_OPTIONS: ReportSeverityOption[] = [
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
];

/**
 * GeoJSON Point, matching the backend Report model's `location` field.
 * coordinates are [longitude, latitude].
 */
export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface CreateReportPayload {
  title: string;
  description: string;
  category: ReportCategory;
  images: string[];
  location: GeoJSONPoint;
  priority: ReportSeverity;
  isAnonymous: boolean;
  foodSafetyDetails?: FoodSafetyDetails;
  environmentalDetails?: EnvironmentalReportDetails;
  locationMeta?: ReportLocationMeta;
}

export interface Report {
  _id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  images: string[];
  location: GeoJSONPoint;
  priority: ReportSeverity;
  upvotes: string[];
  personallyObserved: string[];
  createdAt: string;
  reportedBy?: UserReference;
  verified?: boolean;
  isDuplicate?: boolean;
  moderatorRemark?: string;
  foodSafetyDetails?: FoodSafetyDetails;
  environmentalDetails?: EnvironmentalReportDetails;
  locationMeta?: ReportLocationMeta;
}
export interface UserReference {
  _id: string;
  fullName: string;
  email?: string;
}
