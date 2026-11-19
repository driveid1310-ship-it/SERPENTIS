/**
 * Local Heritage & Places Types
 */

import type { GeoJSONPoint } from './sos.js';

export type PlaceCategory =
  | 'fort'
  | 'temple'
  | 'museum'
  | 'park'
  | 'lake'
  | 'waterfall'
  | 'viewpoint'
  | 'food'
  | 'event'
  | 'other';

export interface PlaceSummary {
  id: string;
  name: string;
  description: string;
  history?: string;
  category: PlaceCategory;
  images: string[];
  address: string;
  location: GeoJSONPoint;
  visitingHours?: string;
  averageRating: number;
  totalReviews: number;
  favorites: number;
  views: number;
  createdAt: string;
}

