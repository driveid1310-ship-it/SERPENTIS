import { NativeModules } from 'react-native';

export interface EnvConfig {
  API_BASE_URL: string;
  BUILD_TARGET: 'emulator' | 'physical_device' | 'custom_dev' | 'production';
  IS_PRODUCTION: boolean;
  CONFIG_ERROR: string | null;
}

/**
 * SERPENTIS API Environment Configuration
 *
 * Development targets (`__DEV__ === true`):
 * 1. Override via Gradle property/env at build time:
 *      -PSERPENTIS_API_URL=http://<LAN_IP>:5000/api
 * 2. Emulator loopback default: http://10.0.2.2:5000/api
 * 3. Physical device: toggle DEV_TARGET to 'physical_device' and supply
 *    DEV_LAN_HOST locally (or pass -PSERPENTIS_API_URL), never in release builds.
 *
 * Production builds (`__DEV__ === false`):
 * - Must provide an explicit HTTPS API URL at build time via Gradle
 *   `-PSERPENTIS_API_URL=https://api.example.com/api` or `SERPENTIS_API_BASE_URL`.
 * - Never falls back to localhost, 10.0.2.2, or RFC1918 developer LAN IPs.
 */

type DevTarget = 'emulator' | 'physical_device';

const DEV_TARGET: DevTarget = 'emulator';
const DEV_LAN_HOST = 'YOUR_LOCAL_LAN_IP';

const DEFAULT_EMULATOR_API_URL = 'http://10.0.2.2:5000/api';
const UNCONFIGURED_PRODUCTION_SENTINEL = 'https://unconfigured-production-api.invalid/api';

const PRIVATE_OR_LOCAL_HOST_REGEX =
  /^(localhost|127\.0\.0\.1|10\.0\.2\.2|0\.0\.0\.0|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})$/i;

export function validateProductionApiUrl(rawUrl: string | undefined | null): {
  valid: boolean;
  normalizedUrl: string | null;
  error: string | null;
} {
  const trimmed = (rawUrl ?? '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    return {
      valid: false,
      normalizedUrl: null,
      error:
        'Production API_BASE_URL is not configured. Rebuild release with -PSERPENTIS_API_URL=https://<your-api-host>/api.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      normalizedUrl: null,
      error: `Invalid production API_BASE_URL "${trimmed}". A valid https:// URL is required.`,
    };
  }

  if (parsed.protocol !== 'https:') {
    return {
      valid: false,
      normalizedUrl: null,
      error: `Insecure production API_BASE_URL "${trimmed}". Production builds require HTTPS.`,
    };
  }

  if (
    PRIVATE_OR_LOCAL_HOST_REGEX.test(parsed.hostname) ||
    parsed.hostname.includes('YOUR_LOCAL_LAN_IP')
  ) {
    return {
      valid: false,
      normalizedUrl: null,
      error: `Invalid production host "${parsed.hostname}". Production builds cannot point to local or LAN developer addresses.`,
    };
  }

  return {
    valid: true,
    normalizedUrl: trimmed,
    error: null,
  };
}

export function resolveEnvironmentConfig(options: {
  isDev: boolean;
  nativeApiBaseUrl?: string | null;
  devTarget?: DevTarget;
  devLanHost?: string;
}): EnvConfig {
  const nativeUrl = (options.nativeApiBaseUrl ?? '').trim().replace(/\/+$/, '');

  if (!options.isDev) {
    const check = validateProductionApiUrl(nativeUrl);
    if (!check.valid || !check.normalizedUrl) {
      return {
        API_BASE_URL: UNCONFIGURED_PRODUCTION_SENTINEL,
        BUILD_TARGET: 'production',
        IS_PRODUCTION: true,
        CONFIG_ERROR: check.error,
      };
    }

    return {
      API_BASE_URL: check.normalizedUrl,
      BUILD_TARGET: 'production',
      IS_PRODUCTION: true,
      CONFIG_ERROR: null,
    };
  }

  if (nativeUrl) {
    return {
      API_BASE_URL: nativeUrl,
      BUILD_TARGET: 'custom_dev',
      IS_PRODUCTION: false,
      CONFIG_ERROR: null,
    };
  }

  const devTarget = options.devTarget ?? DEV_TARGET;
  const devLanHost = (options.devLanHost ?? DEV_LAN_HOST).trim();

  if (devTarget === 'physical_device') {
    if (!devLanHost || devLanHost === 'YOUR_LOCAL_LAN_IP') {
      return {
        API_BASE_URL: DEFAULT_EMULATOR_API_URL,
        BUILD_TARGET: 'physical_device',
        IS_PRODUCTION: false,
        CONFIG_ERROR:
          'Physical device DEV_LAN_HOST is not set. Pass -PSERPENTIS_API_URL=http://<LAN_IP>:5000/api or set DEV_LAN_HOST in src/config/env.ts.',
      };
    }
    return {
      API_BASE_URL: `http://${devLanHost}:5000/api`,
      BUILD_TARGET: 'physical_device',
      IS_PRODUCTION: false,
      CONFIG_ERROR: null,
    };
  }

  return {
    API_BASE_URL: DEFAULT_EMULATOR_API_URL,
    BUILD_TARGET: 'emulator',
    IS_PRODUCTION: false,
    CONFIG_ERROR: null,
  };
}

const nativeConfig = NativeModules?.SerpentisConfig as
  | { API_BASE_URL?: string; BUILD_TYPE?: string; IS_DEBUG?: boolean }
  | undefined;

const isDevRuntime = typeof __DEV__ !== 'undefined' ? __DEV__ : false;

const currentEnv: EnvConfig = resolveEnvironmentConfig({
  isDev: isDevRuntime,
  nativeApiBaseUrl: nativeConfig?.API_BASE_URL,
});

export const API_BASE_URL = currentEnv.API_BASE_URL;
export const ENV_CONFIG_ERROR = currentEnv.CONFIG_ERROR;
export const IS_PRODUCTION_BUILD = currentEnv.IS_PRODUCTION;

export default currentEnv;
