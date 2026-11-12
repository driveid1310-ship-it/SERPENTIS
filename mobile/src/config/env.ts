interface EnvConfig {
  API_BASE_URL: string;
}

/**
 * SERPENTIS API Environment Configuration
 *
 * Development Options:
 * - Android Emulator host loopback: 'http://10.0.2.2:5000/api'
 * - Physical Android device on local Wi-Fi: 'http://<LAN_IP>:5000/api'
 *
 * Production:
 * - Secure HTTPS production API endpoint
 */

// Toggle between Android Emulator loopback and physical device LAN IP for development
const DEV_MODE: 'physical_device' | 'emulator' = 'physical_device';
const DEV_LAN_IP = '192.168.0.103';

const DEV_API_URL =
  DEV_MODE === 'physical_device'
    ? `http://${DEV_LAN_IP}:5000/api`
    : 'http://10.0.2.2:5000/api';

const ENV: Record<'development' | 'production', EnvConfig> = {
  development: {
    API_BASE_URL: DEV_API_URL,
  },
  production: {
    API_BASE_URL: DEV_API_URL,
  },
};

const currentEnv: EnvConfig = __DEV__ ? ENV.development : ENV.production;

export const API_BASE_URL = currentEnv.API_BASE_URL;

export default currentEnv;
