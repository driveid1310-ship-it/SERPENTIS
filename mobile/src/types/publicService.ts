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

export interface ServiceCategoryOption {
  key: ServiceCategory;
  label: string;
}

export const SERVICE_CATEGORY_OPTIONS: ServiceCategoryOption[] = [
  { key: 'hospital', label: 'Hospital' },
  { key: 'police', label: 'Police' },
  { key: 'fire-station', label: 'Fire Station' },
  { key: 'government-office', label: 'Govt. Office' },
  { key: 'pharmacy', label: 'Pharmacy' },
  { key: 'bank', label: 'Bank' },
  { key: 'atm', label: 'ATM' },
  { key: 'bus-stop', label: 'Bus Stop' },
  { key: 'railway-station', label: 'Railway Station' },
  { key: 'parking', label: 'Parking' },
  { key: 'public-toilet', label: 'Public Toilet' },
  { key: 'other', label: 'Other' },
];

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface PublicService {
  _id: string;
  name: string;
  description: string;
  category: ServiceCategory;
  address: string;
  phone: string;
  email: string;
  website: string;
  openingHours: string;
  isEmergency: boolean;
  images: string[];
  location: GeoJSONPoint;
  createdAt: string;
  updatedAt: string;
}

export interface PublicServicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
