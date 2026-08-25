export type ReportCategory =
  | 'pothole'
  | 'garbage'
  | 'water-leakage'
  | 'streetlight'
  | 'traffic'
  | 'pollution'
  | 'stray-animals'
  | 'other';

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
}

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  images: string[];
  location: GeoJSONPoint;
  priority: ReportSeverity;
  createdAt: string;
}
