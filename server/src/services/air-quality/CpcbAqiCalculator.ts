import type {
  PollutantConcentration,
  PollutantKey,
} from '../data-providers/types.js';
import { validatePollutantReading } from '../environmental/EnvironmentalValidationService.js';

interface BreakpointRange {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

/**
 * Official CPCB Indian National Air Quality Index (NAQI) Breakpoints.
 * Sources: Central Pollution Control Board (CPCB), Ministry of Environment, Forest & Climate Change, India.
 * Note: Continuous lower bounds prevent boundary gaps between consecutive integer tiers
 * (e.g., 30.4 ug/m3 for PM2.5 maps into the second tier rather than failing lookup).
 */
const CPCB_BREAKPOINTS: Record<PollutantKey, BreakpointRange[]> = {
  pm25: [
    { cLow: 0, cHigh: 30, iLow: 0, iHigh: 50 },
    { cLow: 30, cHigh: 60, iLow: 51, iHigh: 100 },
    { cLow: 60, cHigh: 90, iLow: 101, iHigh: 200 },
    { cLow: 90, cHigh: 120, iLow: 201, iHigh: 300 },
    { cLow: 120, cHigh: 250, iLow: 301, iHigh: 400 },
    { cLow: 250, cHigh: 350, iLow: 401, iHigh: 500 },
  ],
  pm10: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 100, cHigh: 250, iLow: 101, iHigh: 200 },
    { cLow: 250, cHigh: 350, iLow: 201, iHigh: 300 },
    { cLow: 350, cHigh: 430, iLow: 301, iHigh: 400 },
    { cLow: 430, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  no2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 40, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 80, cHigh: 180, iLow: 101, iHigh: 200 },
    { cLow: 180, cHigh: 280, iLow: 201, iHigh: 300 },
    { cLow: 280, cHigh: 400, iLow: 301, iHigh: 400 },
    { cLow: 400, cHigh: 500, iLow: 401, iHigh: 500 },
  ],
  o3: [
    { cLow: 0, cHigh: 50, iLow: 0, iHigh: 50 },
    { cLow: 50, cHigh: 100, iLow: 51, iHigh: 100 },
    { cLow: 100, cHigh: 168, iLow: 101, iHigh: 200 },
    { cLow: 168, cHigh: 208, iLow: 201, iHigh: 300 },
    { cLow: 208, cHigh: 748, iLow: 301, iHigh: 400 },
    { cLow: 748, cHigh: 950, iLow: 401, iHigh: 500 },
  ],
  co: [
    { cLow: 0, cHigh: 1.0, iLow: 0, iHigh: 50 },
    { cLow: 1.0, cHigh: 2.0, iLow: 51, iHigh: 100 },
    { cLow: 2.0, cHigh: 10.0, iLow: 101, iHigh: 200 },
    { cLow: 10.0, cHigh: 17.0, iLow: 201, iHigh: 300 },
    { cLow: 17.0, cHigh: 34.0, iLow: 301, iHigh: 400 },
    { cLow: 34.0, cHigh: 50.0, iLow: 401, iHigh: 500 },
  ],
  so2: [
    { cLow: 0, cHigh: 40, iLow: 0, iHigh: 50 },
    { cLow: 40, cHigh: 80, iLow: 51, iHigh: 100 },
    { cLow: 80, cHigh: 380, iLow: 101, iHigh: 200 },
    { cLow: 380, cHigh: 800, iLow: 201, iHigh: 300 },
    { cLow: 800, cHigh: 1600, iLow: 301, iHigh: 400 },
    { cLow: 1600, cHigh: 2100, iLow: 401, iHigh: 500 },
  ],
  nh3: [
    { cLow: 0, cHigh: 200, iLow: 0, iHigh: 50 },
    { cLow: 200, cHigh: 400, iLow: 51, iHigh: 100 },
    { cLow: 400, cHigh: 800, iLow: 101, iHigh: 200 },
    { cLow: 800, cHigh: 1200, iLow: 201, iHigh: 300 },
    { cLow: 1200, cHigh: 1800, iLow: 301, iHigh: 400 },
    { cLow: 1800, cHigh: 2400, iLow: 401, iHigh: 500 },
  ],
  pb: [
    { cLow: 0, cHigh: 0.5, iLow: 0, iHigh: 50 },
    { cLow: 0.5, cHigh: 1.0, iLow: 51, iHigh: 100 },
    { cLow: 1.0, cHigh: 2.0, iLow: 101, iHigh: 200 },
    { cLow: 2.0, cHigh: 3.0, iLow: 201, iHigh: 300 },
    { cLow: 3.0, cHigh: 3.5, iLow: 301, iHigh: 400 },
    { cLow: 3.5, cHigh: 5.0, iLow: 401, iHigh: 500 },
  ],
};

const POLLUTANT_UNITS: Record<PollutantKey, { unit: string; averagingPeriod: '24h' | '8h' }> = {
  pm25: { unit: 'µg/m³', averagingPeriod: '24h' },
  pm10: { unit: 'µg/m³', averagingPeriod: '24h' },
  no2: { unit: 'µg/m³', averagingPeriod: '24h' },
  so2: { unit: 'µg/m³', averagingPeriod: '24h' },
  co: { unit: 'mg/m³', averagingPeriod: '8h' },
  o3: { unit: 'µg/m³', averagingPeriod: '8h' },
  nh3: { unit: 'µg/m³', averagingPeriod: '24h' },
  pb: { unit: 'µg/m³', averagingPeriod: '24h' },
};

export interface CpcbCategoryInfo {
  category: string;
  colorHex: string;
  healthAdvisory: string;
}

export function getCpcbCategoryInfo(aqi: number | null): CpcbCategoryInfo {
  if (aqi === null || !Number.isFinite(aqi) || aqi < 0) {
    return {
      category: 'Unavailable',
      colorHex: '#6B7280',
      healthAdvisory: 'Insufficient verified pollutant data to determine an official CPCB AQI health advisory.',
    };
  }
  if (aqi <= 50) {
    return {
      category: 'Good',
      colorHex: '#22C55E',
      healthAdvisory: 'Minimal health impact. Air quality is satisfactory for outdoor activities.',
    };
  }
  if (aqi <= 100) {
    return {
      category: 'Satisfactory',
      colorHex: '#84CC16',
      healthAdvisory: 'Minor breathing discomfort may occur in unusually sensitive individuals.',
    };
  }
  if (aqi <= 200) {
    return {
      category: 'Moderately Polluted',
      colorHex: '#EAB308',
      healthAdvisory: 'May cause breathing discomfort to people with lung disease, asthma, heart disease, children, and older adults.',
    };
  }
  if (aqi <= 300) {
    return {
      category: 'Poor',
      colorHex: '#F97316',
      healthAdvisory: 'May cause breathing discomfort to most people on prolonged exposure. Limit strenuous outdoor exertion.',
    };
  }
  if (aqi <= 400) {
    return {
      category: 'Very Poor',
      colorHex: '#EF4444',
      healthAdvisory: 'May cause respiratory illness on prolonged exposure. Sensitive groups should stay indoors and use air filtration if available.',
    };
  }
  return {
    category: 'Severe',
    colorHex: '#A855F7',
    healthAdvisory: 'Affects healthy people and seriously impacts those with existing respiratory or cardiovascular conditions. Avoid outdoor exertion.',
  };
}

export function computePollutantSubIndex(
  pollutant: PollutantKey,
  concentration: number,
): number | null {
  if (!Number.isFinite(concentration) || concentration < 0) {
    return null;
  }

  const ranges = CPCB_BREAKPOINTS[pollutant];
  if (!ranges || ranges.length === 0) return null;

  for (const bp of ranges) {
    if (concentration <= bp.cHigh) {
      const ratio = (bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow);
      const subIndex = ratio * (concentration - bp.cLow) + bp.iLow;
      return Math.min(500, Math.max(0, Math.round(subIndex)));
    }
  }

  // Above top breakpoint -> cap at 500 on CPCB 0–500 NAQI scale
  return 500;
}

export interface CpcbCalculationInput {
  values: Partial<Record<PollutantKey, number | null | undefined>>;
  isOfficialStationMeasurement: boolean;
}

export interface CpcbCalculationResult {
  overallAqi: number | null;
  aqiCategory: string | null;
  aqiColorHex: string;
  healthAdvisory: string;
  dominantPollutant: PollutantKey | null;
  isOfficialAqi: boolean;
  insufficientReason?: string | undefined;
  validPollutantCount: number;
  pollutants: Record<PollutantKey, PollutantConcentration>;
}

export function calculateCpcbNaqi(input: CpcbCalculationInput): CpcbCalculationResult {
  const keys: PollutantKey[] = ['pm25', 'pm10', 'no2', 'so2', 'co', 'o3', 'nh3', 'pb'];
  const pollutants = {} as Record<PollutantKey, PollutantConcentration>;

  let validCount = 0;
  let maxSubIndex = -1;
  let dominantPollutant: PollutantKey | null = null;

  for (const key of keys) {
    const rawVal = input.values[key];
    const meta = POLLUTANT_UNITS[key];
    const validated = validatePollutantReading(key, rawVal);

    if (validated.valid && validated.sanitized !== null) {
      const subIndex = computePollutantSubIndex(key, validated.sanitized);
      const cat = subIndex !== null ? getCpcbCategoryInfo(subIndex).category : null;
      validCount++;
      if (subIndex !== null && subIndex > maxSubIndex) {
        maxSubIndex = subIndex;
        dominantPollutant = key;
      }
      pollutants[key] = {
        value: validated.sanitized,
        unit: meta.unit,
        averagingPeriod: meta.averagingPeriod,
        subIndex,
        category: cat,
        status: 'valid',
      };
    } else {
      pollutants[key] = {
        value: null,
        unit: meta.unit,
        averagingPeriod: meta.averagingPeriod,
        subIndex: null,
        category: null,
        status: validated.status,
      };
    }
  }

  const hasPm =
    pollutants.pm25.status === 'valid' || pollutants.pm10.status === 'valid';
  const meetsMinimumThreeRule = validCount >= 3 && hasPm;

  if (!meetsMinimumThreeRule || maxSubIndex < 0) {
    const reason = !hasPm
      ? 'CPCB official AQI requires at least PM2.5 or PM10 plus two additional pollutants (minimum 3 total).'
      : `Insufficient valid pollutants (${validCount}/3 minimum required for CPCB AQI).`;
    return {
      overallAqi: null,
      aqiCategory: null,
      aqiColorHex: '#6B7280',
      healthAdvisory:
        'Official CPCB AQI cannot be computed due to insufficient pollutant coverage. Review individual available measurements below.',
      dominantPollutant,
      isOfficialAqi: false,
      insufficientReason: reason,
      validPollutantCount: validCount,
      pollutants,
    };
  }

  const overallAqi = maxSubIndex;
  const catInfo = getCpcbCategoryInfo(overallAqi);

  // Only observed ground station readings meeting the minimum-3 rule qualify as official AQI.
  // Modeled estimates provide an indicative CPCB-scale index clearly flagged isOfficialAqi: false.
  const isOfficialAqi = input.isOfficialStationMeasurement && meetsMinimumThreeRule;

  return {
    overallAqi,
    aqiCategory: isOfficialAqi ? catInfo.category : `${catInfo.category} (Modeled Estimate)`,
    aqiColorHex: catInfo.colorHex,
    healthAdvisory: catInfo.healthAdvisory,
    dominantPollutant,
    isOfficialAqi,
    insufficientReason: isOfficialAqi
      ? undefined
      : 'Computed from modeled atmospheric data rather than an official CPCB ground monitoring station.',
    validPollutantCount: validCount,
    pollutants,
  };
}
