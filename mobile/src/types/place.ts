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

export interface PlaceCategoryOption {
  key: PlaceCategory;
  label: string;
}

export const PLACE_CATEGORY_OPTIONS: PlaceCategoryOption[] = [
  { key: 'fort', label: 'Fort' },
  { key: 'temple', label: 'Temple' },
  { key: 'museum', label: 'Museum' },
  { key: 'park', label: 'Park' },
  { key: 'lake', label: 'Lake' },
  { key: 'waterfall', label: 'Waterfall' },
  { key: 'viewpoint', label: 'Viewpoint' },
  { key: 'food', label: 'Food' },
  { key: 'event', label: 'Event' },
  { key: 'other', label: 'Other' },
];

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface Place {
  _id: string;
  name: string;
  description: string;
  history: string;
  category: PlaceCategory;
  images: string[];
  address: string;
  location: GeoJSONPoint;
  visitingHours: string;
  averageRating: number;
  totalReviews: number;
  favorites: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlacePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PlaceFavorite {
  _id: string;
  user: string;
  place: Place;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceReview {
  _id: string;
  place: string | Place;
  rating: number;
  comment: string;
  createdAt: string;
}
