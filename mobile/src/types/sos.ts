export type SOSType =
  | 'accident'
  | 'medical'
  | 'fire'
  | 'crime'
  | 'flood'
  | 'gas-leak'
  | 'other';

export type SOSStatus = 'active' | 'resolved';

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface SOSAlert {
  _id: string;
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
