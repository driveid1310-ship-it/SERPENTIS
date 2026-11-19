/**
 * Civic & Public Services Directory Types
 */

import type { GeoJSONPoint } from './sos.js';

export type ServiceCategory =
  | 'hospital'
  | 'police'
  | 'fire-station'
  | 'government-office'
  | 'pharmacy'
  | 'bank'
  | 'atm'
  | 'bus-stop'
  | 'railway-station'
  | 'parking'
  | 'public-toilet'
  | 'other';

export interface PublicServiceSummary {
  id: string;
  name: string;
  description?: string;
  category: ServiceCategory;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  openingHours?: string;
  isEmergency: boolean;
  location: GeoJSONPoint;
  createdAt: string;
}

