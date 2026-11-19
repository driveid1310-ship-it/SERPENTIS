import EnvironmentalLocation, {
  type ExpansionStage,
  type IDataCoverage,
} from '../../models/EnvironmentalLocation.js';
import type { LocationContext } from '../data-providers/types.js';
import { haversineDistanceKm, isValidCoordinates } from '../environmental/EnvironmentalValidationService.js';

export interface CityCatalogEntry {
  slug: string;
  name: string;
  city: string;
  district: string;
  state: string;
  locality: string;
  latitude: number;
  longitude: number;
  expansionStage: ExpansionStage;
  isPilot: boolean;
  aliases: string[];
  climateZone: string;
  elevationMeters: number;
  coverage: IDataCoverage;
}

export const DEFAULT_PILOT_CITY_SLUG = 'badlapur-maharashtra';

/**
 * Curated Pan-India geographic registry organized across the 3 rollout stages:
 * Stage 1 (Pilot): Badlapur (Central, East, West)
 * Stage 2 (Maharashtra): Thane, Kalyan-Dombivli, Ambernath, Ulhasnagar, Mumbai, Navi Mumbai, Pune, Nashik, Nagpur, Chhatrapati Sambhajinagar
 * Stage 3 (Pan-India): Representative capitals & major cities across Indian states and UTs
 */
export const INDIA_CITY_CATALOG: CityCatalogEntry[] = [
  // Stage 1: Badlapur Pilot (Thane District, Maharashtra)
  {
    slug: 'badlapur-maharashtra',
    name: 'Badlapur',
    city: 'Badlapur',
    district: 'Thane',
    state: 'Maharashtra',
    locality: 'Badlapur Central',
    latitude: 19.1668,
    longitude: 73.2355,
    expansionStage: 'pilot',
    isPilot: true,
    aliases: ['kulgaon-badlapur', 'badlapur'],
    climateZone: 'Tropical Wet & Dry (Konkan Foothills)',
    elevationMeters: 44,
    coverage: {
      weather: true,
      airQualityModeled: true,
      airQualityStations: false,
      civicReports: true,
      officialAlerts: false,
      greenSpaces: true,
    },
  },
  {
    slug: 'badlapur-east-maharashtra',
    name: 'Badlapur East',
    city: 'Badlapur',
    district: 'Thane',
    state: 'Maharashtra',
    locality: 'Badlapur East (Kulgaon / Katrap)',
    latitude: 19.1684,
    longitude: 73.2442,
    expansionStage: 'pilot',
    isPilot: true,
    aliases: ['kulgaon', 'katrap', 'shirgaon', 'badlapur east'],
    climateZone: 'Tropical Wet & Dry (Konkan Foothills)',
    elevationMeters: 46,
    coverage: {
      weather: true,
      airQualityModeled: true,
      airQualityStations: false,
      civicReports: true,
      officialAlerts: false,
      greenSpaces: true,
    },
  },
  {
    slug: 'badlapur-west-maharashtra',
    name: 'Badlapur West',
    city: 'Badlapur',
    district: 'Thane',
    state: 'Maharashtra',
    locality: 'Badlapur West (Belavali / Manjarli)',
    latitude: 19.1649,
    longitude: 73.2266,
    expansionStage: 'pilot',
    isPilot: true,
    aliases: ['belavali', 'manjarli', 'badlapur west'],
    climateZone: 'Tropical Wet & Dry (Konkan Foothills)',
    elevationMeters: 42,
    coverage: {
      weather: true,
      airQualityModeled: true,
      airQualityStations: false,
      civicReports: true,
      officialAlerts: false,
      greenSpaces: true,
    },
  },

  // Stage 2: Maharashtra Expansion
  {
    slug: 'ambernath-maharashtra',
    name: 'Ambernath',
    city: 'Ambernath',
    district: 'Thane',
    state: 'Maharashtra',
    locality: 'Ambernath Central',
    latitude: 19.2091,
    longitude: 73.1865,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['ambarnath'],
    climateZone: 'Tropical Wet & Dry',
    elevationMeters: 35,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: false, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'ulhasnagar-maharashtra',
    name: 'Ulhasnagar',
    city: 'Ulhasnagar',
    district: 'Thane',
    state: 'Maharashtra',
    locality: 'Ulhasnagar',
    latitude: 19.2215,
    longitude: 73.1645,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['ulhasnagar'],
    climateZone: 'Tropical Wet & Dry',
    elevationMeters: 28,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'kalyan-dombivli-maharashtra',
    name: 'Kalyan-Dombivli',
    city: 'Kalyan-Dombivli',
    district: 'Thane',
    state: 'Maharashtra',
    locality: 'Kalyan',
    latitude: 19.2403,
    longitude: 73.1305,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['kalyan', 'dombivli', 'kdmt'],
    climateZone: 'Tropical Wet & Dry',
    elevationMeters: 16,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'thane-maharashtra',
    name: 'Thane',
    city: 'Thane',
    district: 'Thane',
    state: 'Maharashtra',
    locality: 'Thane West',
    latitude: 19.2183,
    longitude: 72.9781,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['thane'],
    climateZone: 'Tropical Monsoon',
    elevationMeters: 11,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'mumbai-maharashtra',
    name: 'Mumbai',
    city: 'Mumbai',
    district: 'Mumbai Suburban',
    state: 'Maharashtra',
    locality: 'Sion / Central Mumbai',
    latitude: 19.0434,
    longitude: 72.8633,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['bombay', 'sion', 'mumbai'],
    climateZone: 'Tropical Coastal Monsoon',
    elevationMeters: 14,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'navi-mumbai-maharashtra',
    name: 'Navi Mumbai',
    city: 'Navi Mumbai',
    district: 'Thane',
    state: 'Maharashtra',
    locality: 'Vashi',
    latitude: 19.033,
    longitude: 73.0297,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['vashi', 'nerul', 'kharghar', 'navi mumbai'],
    climateZone: 'Tropical Coastal Monsoon',
    elevationMeters: 14,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'pune-maharashtra',
    name: 'Pune',
    city: 'Pune',
    district: 'Pune',
    state: 'Maharashtra',
    locality: 'Shivajinagar',
    latitude: 18.5204,
    longitude: 73.8567,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['poona', 'pune'],
    climateZone: 'Semi-Arid / Deccan Plateau',
    elevationMeters: 560,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'nashik-maharashtra',
    name: 'Nashik',
    city: 'Nashik',
    district: 'Nashik',
    state: 'Maharashtra',
    locality: 'Nashik City',
    latitude: 19.9975,
    longitude: 73.7898,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['nasik', 'nashik'],
    climateZone: 'Semi-Arid Tropical',
    elevationMeters: 584,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'nagpur-maharashtra',
    name: 'Nagpur',
    city: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    locality: 'Sitabuldi',
    latitude: 21.1458,
    longitude: 79.0882,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['nagpur'],
    climateZone: 'Tropical Savanna',
    elevationMeters: 310,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'chhatrapati-sambhajinagar-maharashtra',
    name: 'Chhatrapati Sambhajinagar',
    city: 'Chhatrapati Sambhajinagar',
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    locality: 'Aurangabad Central',
    latitude: 19.8762,
    longitude: 75.3433,
    expansionStage: 'state',
    isPilot: false,
    aliases: ['aurangabad', 'sambhajinagar'],
    climateZone: 'Semi-Arid',
    elevationMeters: 568,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: false },
  },

  // Stage 3: Pan-India Expansion
  {
    slug: 'new-delhi-delhi',
    name: 'New Delhi',
    city: 'New Delhi',
    district: 'New Delhi',
    state: 'Delhi',
    locality: 'Connaught Place',
    latitude: 28.6139,
    longitude: 77.209,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['delhi', 'ncr', 'new delhi'],
    climateZone: 'Humid Subtropical / Semi-Arid',
    elevationMeters: 216,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'bengaluru-karnataka',
    name: 'Bengaluru',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    locality: 'MG Road / Central',
    latitude: 12.9716,
    longitude: 77.5946,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['bangalore', 'bengaluru'],
    climateZone: 'Tropical Savanna',
    elevationMeters: 920,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'chennai-tamil-nadu',
    name: 'Chennai',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    locality: 'Central Chennai',
    latitude: 13.0827,
    longitude: 80.2707,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['madras', 'chennai'],
    climateZone: 'Tropical Wet & Dry (Coastal)',
    elevationMeters: 6,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'hyderabad-telangana',
    name: 'Hyderabad',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    locality: 'Banjara Hills / Central',
    latitude: 17.385,
    longitude: 78.4867,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['hyderabad'],
    climateZone: 'Tropical Wet & Dry',
    elevationMeters: 542,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'kolkata-west-bengal',
    name: 'Kolkata',
    city: 'Kolkata',
    district: 'Kolkata',
    state: 'West Bengal',
    locality: 'Esplanade',
    latitude: 22.5726,
    longitude: 88.3639,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['calcutta', 'kolkata'],
    climateZone: 'Tropical Wet & Dry',
    elevationMeters: 9,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'ahmedabad-gujarat',
    name: 'Ahmedabad',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    state: 'Gujarat',
    locality: 'Navrangpura',
    latitude: 23.0225,
    longitude: 72.5714,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['ahmedabad', 'amdavad'],
    climateZone: 'Hot Semi-Arid',
    elevationMeters: 53,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'jaipur-rajasthan',
    name: 'Jaipur',
    city: 'Jaipur',
    district: 'Jaipur',
    state: 'Rajasthan',
    locality: 'MI Road',
    latitude: 26.9124,
    longitude: 75.7873,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['jaipur'],
    climateZone: 'Hot Semi-Arid',
    elevationMeters: 431,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'lucknow-uttar-pradesh',
    name: 'Lucknow',
    city: 'Lucknow',
    district: 'Lucknow',
    state: 'Uttar Pradesh',
    locality: 'Hazratganj',
    latitude: 26.8467,
    longitude: 80.9462,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['lucknow'],
    climateZone: 'Humid Subtropical',
    elevationMeters: 123,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'kochi-kerala',
    name: 'Kochi',
    city: 'Kochi',
    district: 'Ernakulam',
    state: 'Kerala',
    locality: 'Ernakulam',
    latitude: 9.9312,
    longitude: 76.2673,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['cochin', 'kochi'],
    climateZone: 'Tropical Monsoon',
    elevationMeters: 0,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'bhopal-madhya-pradesh',
    name: 'Bhopal',
    city: 'Bhopal',
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    locality: 'New Market',
    latitude: 23.2599,
    longitude: 77.4126,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['bhopal'],
    climateZone: 'Humid Subtropical',
    elevationMeters: 527,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'guwahati-assam',
    name: 'Guwahati',
    city: 'Guwahati',
    district: 'Kamrup Metropolitan',
    state: 'Assam',
    locality: 'Dispur',
    latitude: 26.1445,
    longitude: 91.7362,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['guwahati'],
    climateZone: 'Humid Subtropical',
    elevationMeters: 55,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'chandigarh-chandigarh',
    name: 'Chandigarh',
    city: 'Chandigarh',
    district: 'Chandigarh',
    state: 'Chandigarh',
    locality: 'Sector 17',
    latitude: 30.7333,
    longitude: 76.7794,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['chandigarh'],
    climateZone: 'Humid Subtropical',
    elevationMeters: 321,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
  {
    slug: 'patna-bihar',
    name: 'Patna',
    city: 'Patna',
    district: 'Patna',
    state: 'Bihar',
    locality: 'Gandhi Maidan',
    latitude: 25.5941,
    longitude: 85.1376,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['patna'],
    climateZone: 'Humid Subtropical',
    elevationMeters: 53,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: false },
  },
  {
    slug: 'bhubaneswar-odisha',
    name: 'Bhubaneswar',
    city: 'Bhubaneswar',
    district: 'Khordha',
    state: 'Odisha',
    locality: 'Master Canteen',
    latitude: 20.2961,
    longitude: 85.8245,
    expansionStage: 'national',
    isPilot: false,
    aliases: ['bhubaneswar'],
    climateZone: 'Tropical Savanna',
    elevationMeters: 45,
    coverage: { weather: true, airQualityModeled: true, airQualityStations: true, civicReports: true, officialAlerts: false, greenSpaces: true },
  },
];

export const INDIA_STATES_AND_UTS: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export class IndiaLocationService {
  private seeded = false;

  async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    try {
      const count = await EnvironmentalLocation.countDocuments();
      if (count === 0) {
        const ops = INDIA_CITY_CATALOG.map((entry) => ({
          updateOne: {
            filter: { slug: entry.slug },
            update: {
              $setOnInsert: {
                slug: entry.slug,
                name: entry.name,
                country: 'India',
                state: entry.state,
                district: entry.district,
                city: entry.city,
                locality: entry.locality,
                expansionStage: entry.expansionStage,
                isPilot: entry.isPilot,
                location: {
                  type: 'Point' as const,
                  coordinates: [entry.longitude, entry.latitude] as [number, number],
                },
                aliases: entry.aliases,
                climateZone: entry.climateZone,
                elevationMeters: entry.elevationMeters,
                coverage: entry.coverage,
                isActive: true,
              },
            },
            upsert: true,
          },
        }));
        await EnvironmentalLocation.bulkWrite(ops);
      }
      this.seeded = true;
    } catch {
      // Allow fallback to in-memory catalog when DB isn't connected (e.g., unit tests)
    }
  }

  toLocationContext(entry: CityCatalogEntry): LocationContext {
    return {
      slug: entry.slug,
      name: entry.name,
      city: entry.city,
      district: entry.district,
      state: entry.state,
      locality: entry.locality,
      latitude: entry.latitude,
      longitude: entry.longitude,
    };
  }

  getDefaultPilotLocation(): LocationContext {
    const pilot = INDIA_CITY_CATALOG.find((c) => c.slug === DEFAULT_PILOT_CITY_SLUG)!;
    return this.toLocationContext(pilot);
  }

  findInCatalogBySlugOrName(query: string): CityCatalogEntry | null {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return (
      INDIA_CITY_CATALOG.find(
        (c) =>
          c.slug === q ||
          c.name.toLowerCase() === q ||
          c.city.toLowerCase() === q ||
          c.aliases.some((a) => a.toLowerCase() === q),
      ) ?? null
    );
  }

  findNearestCatalogEntry(latitude: number, longitude: number): { entry: CityCatalogEntry; distanceKm: number } {
    let best = INDIA_CITY_CATALOG[0]!;
    let bestDist = Infinity;
    for (const candidate of INDIA_CITY_CATALOG) {
      const d = haversineDistanceKm(latitude, longitude, candidate.latitude, candidate.longitude);
      if (d < bestDist) {
        bestDist = d;
        best = candidate;
      }
    }
    return { entry: best, distanceKm: bestDist };
  }

  async resolveLocation(params: {
    city?: string | undefined;
    slug?: string | undefined;
    lat?: number | undefined;
    lon?: number | undefined;
  }): Promise<LocationContext> {
    if (params.slug) {
      const fromCatalog = this.findInCatalogBySlugOrName(params.slug);
      if (fromCatalog) return this.toLocationContext(fromCatalog);

      try {
        const dbLoc = await EnvironmentalLocation.findOne({ slug: params.slug.toLowerCase(), isActive: true }).lean();
        if (dbLoc) {
          return {
            slug: dbLoc.slug,
            name: dbLoc.name,
            city: dbLoc.city,
            district: dbLoc.district,
            state: dbLoc.state,
            locality: dbLoc.locality,
            latitude: dbLoc.location.coordinates[1],
            longitude: dbLoc.location.coordinates[0],
          };
        }
      } catch {
        // ignore if DB unavailable
      }
    }

    if (params.city) {
      const fromCatalog = this.findInCatalogBySlugOrName(params.city);
      if (fromCatalog) return this.toLocationContext(fromCatalog);

      try {
        const escaped = params.city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const dbLoc = await EnvironmentalLocation.findOne({
          $or: [
            { name: new RegExp(`^${escaped}$`, 'i') },
            { city: new RegExp(`^${escaped}$`, 'i') },
          ],
          isActive: true,
        }).lean();
        if (dbLoc) {
          return {
            slug: dbLoc.slug,
            name: dbLoc.name,
            city: dbLoc.city,
            district: dbLoc.district,
            state: dbLoc.state,
            locality: dbLoc.locality,
            latitude: dbLoc.location.coordinates[1],
            longitude: dbLoc.location.coordinates[0],
          };
        }
      } catch {
        // ignore if DB unavailable
      }
    }

    if (
      params.lat !== undefined &&
      params.lon !== undefined &&
      isValidCoordinates(params.lat, params.lon)
    ) {
      const { entry, distanceKm } = this.findNearestCatalogEntry(params.lat, params.lon);
      if (distanceKm <= 35) {
        return {
          ...this.toLocationContext(entry),
          latitude: Number(params.lat.toFixed(4)),
          longitude: Number(params.lon.toFixed(4)),
        };
      }
      return {
        slug: `coord-${params.lat.toFixed(2)}-${params.lon.toFixed(2)}`,
        name: `Near ${entry.city} (${params.lat.toFixed(2)}°N, ${params.lon.toFixed(2)}°E)`,
        city: entry.city,
        district: entry.district,
        state: entry.state,
        locality: 'Custom GPS Location',
        latitude: Number(params.lat.toFixed(4)),
        longitude: Number(params.lon.toFixed(4)),
      };
    }

    return this.getDefaultPilotLocation();
  }

  listCities(filters?: {
    state?: string | undefined;
    district?: string | undefined;
    stage?: ExpansionStage | undefined;
    q?: string | undefined;
  }): CityCatalogEntry[] {
    let results = [...INDIA_CITY_CATALOG];
    if (filters?.state) {
      const s = filters.state.trim().toLowerCase();
      results = results.filter((c) => c.state.toLowerCase() === s);
    }
    if (filters?.district) {
      const d = filters.district.trim().toLowerCase();
      results = results.filter((c) => c.district.toLowerCase() === d);
    }
    if (filters?.stage) {
      results = results.filter((c) => c.expansionStage === filters.stage);
    }
    if (filters?.q) {
      const q = filters.q.trim().toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.district.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.locality.toLowerCase().includes(q) ||
          c.aliases.some((a) => a.toLowerCase().includes(q)),
      );
    }
    return results;
  }
}

export const indiaLocationService = new IndiaLocationService();
