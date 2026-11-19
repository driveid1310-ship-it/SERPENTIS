import type { DataQualityStatus } from '../../models/EnvironmentalReading.js';

export function isValidCoordinates(latitude: number, longitude: number): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export function celsiusToFahrenheit(tempC: number): number {
  return Number(((tempC * 9) / 5 + 32).toFixed(1));
}

export function fahrenheitToCelsius(tempF: number): number {
  return Number((((tempF - 32) * 5) / 9).toFixed(1));
}

export function kmhToMs(kmh: number): number {
  return Number((kmh / 3.6).toFixed(2));
}

export function msToKmh(ms: number): number {
  return Number((ms * 3.6).toFixed(2));
}

/**
 * Rothfusz Heat Index equation (applicable when T >= 27°C and RH >= 40%).
 * Returns null when conditions are outside the Heat Index valid domain.
 */
export function computeHeatIndexC(tempC: number, humidityPct: number): number | null {
  if (!Number.isFinite(tempC) || !Number.isFinite(humidityPct)) return null;
  if (tempC < 27 || humidityPct < 40) return null;

  const tF = (tempC * 9) / 5 + 32;
  const rh = Math.min(Math.max(humidityPct, 0), 100);

  const hiF =
    -42.379 +
    2.04901523 * tF +
    10.14333127 * rh -
    0.22475541 * tF * rh -
    0.00683783 * tF * tF -
    0.05481717 * rh * rh +
    0.00122874 * tF * tF * rh +
    0.00085282 * tF * rh * rh -
    0.00000199 * tF * tF * rh * rh;

  return Number((((hiF - 32) * 5) / 9).toFixed(1));
}

/**
 * Magnus-Tetens approximation for Dew Point (°C).
 */
export function computeDewPointC(tempC: number, humidityPct: number): number | null {
  if (!Number.isFinite(tempC) || !Number.isFinite(humidityPct) || humidityPct <= 0) {
    return null;
  }
  const rh = Math.min(Math.max(humidityPct, 1), 100);
  const a = 17.625;
  const b = 243.04;
  const alpha = Math.log(rh / 100) + (a * tempC) / (b + tempC);
  const dewPoint = (b * alpha) / (a - alpha);
  return Number(dewPoint.toFixed(1));
}

/**
 * Standard Wind Chill (applicable when T <= 10°C and wind > 4.8 km/h).
 */
export function computeWindChillC(tempC: number, windSpeedKmh: number): number | null {
  if (!Number.isFinite(tempC) || !Number.isFinite(windSpeedKmh)) return null;
  if (tempC > 10 || windSpeedKmh <= 4.8) return null;

  const vPow = Math.pow(windSpeedKmh, 0.16);
  const wc = 13.12 + 0.6215 * tempC - 11.37 * vPow + 0.3965 * tempC * vPow;
  return Number(wc.toFixed(1));
}

export function computeDaylightDurationHours(
  sunriseIso: string | null | undefined,
  sunsetIso: string | null | undefined,
): number | null {
  if (!sunriseIso || !sunsetIso) return null;
  const rise = new Date(sunriseIso).getTime();
  const set = new Date(sunsetIso).getTime();
  if (!Number.isFinite(rise) || !Number.isFinite(set) || set <= rise) return null;
  return Number(((set - rise) / (1000 * 60 * 60)).toFixed(2));
}

export function isReadingStale(
  observationTimestamp: string | Date,
  maxAgeMinutes = 180,
): boolean {
  const ts =
    observationTimestamp instanceof Date
      ? observationTimestamp.getTime()
      : new Date(observationTimestamp).getTime();
  if (!Number.isFinite(ts)) return true;
  return Date.now() - ts > maxAgeMinutes * 60 * 1000;
}

export function validatePollutantReading(
  pollutant: string,
  value: unknown,
): { valid: boolean; sanitized: number | null; status: DataQualityStatus } {
  if (value === null || value === undefined || value === '') {
    return { valid: false, sanitized: null, status: 'insufficient' };
  }
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return { valid: false, sanitized: null, status: 'suspect' };
  }

  // Physical upper sanity bounds to reject sensor spikes/corrupt payloads
  const upperBounds: Record<string, number> = {
    pm25: 2500,
    pm10: 3500,
    no2: 2000,
    so2: 5000,
    co: 150, // mg/m3
    o3: 2000,
    nh3: 5000,
    pb: 50,
  };

  const maxBound = upperBounds[pollutant] ?? 10000;
  if (num > maxBound) {
    return { valid: false, sanitized: null, status: 'suspect' };
  }

  return { valid: true, sanitized: Number(num.toFixed(2)), status: 'valid' };
}

export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}
