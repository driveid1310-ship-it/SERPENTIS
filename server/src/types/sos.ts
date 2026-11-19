/**
 * Emergency SOS Dispatch Types
 */

export type SOSType =
  | 'accident'
  | 'medical'
  | 'fire'
  | 'crime'
  | 'flood'
  | 'gas-leak'
  | 'other';

export type SOSStatus = 'active' | 'resolved' | 'false-alarm';

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface SOSAlertSummary {
  id: string;
  userId: string;
  emergencyType: SOSType;
  message: string;
  status: SOSStatus;
  location: GeoJSONPoint;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSOSPayload {
  emergencyType: SOSType;
  message: string;
  location: GeoJSONPoint;
}

