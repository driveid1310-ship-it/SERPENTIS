import { REPORT_CATEGORY_OPTIONS } from '../src/types/report';
import { MAP_TEST_INITIAL_COORDINATE } from '../src/config/map';
import { DEFAULT_PILOT_CITY } from '../src/context/CityContext';
import { resolveEnvironmentConfig, validateProductionApiUrl } from '../src/config/env';
import { ensureNotificationPermissionOnce } from '../src/utils/notificationPermission';
import { PermissionsAndroid } from 'react-native';

const mockStore: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string) => mockStore[key] ?? null),
  setItem: jest.fn(async (key: string, val: string) => {
    mockStore[key] = val;
  }),
  removeItem: jest.fn(async (key: string) => {
    delete mockStore[key];
  }),
}));

describe('SERPENTIS Mobile Environmental Configuration & Types', () => {
  it('defaults to Badlapur, Maharashtra pilot coordinates', () => {
    expect(DEFAULT_PILOT_CITY.city).toBe('Badlapur');
    expect(DEFAULT_PILOT_CITY.district).toBe('Thane');
    expect(DEFAULT_PILOT_CITY.state).toBe('Maharashtra');
    expect(MAP_TEST_INITIAL_COORDINATE).toEqual([73.2355, 19.1668]);
  });

  it('includes both civic and environmental report categories', () => {
    const keys = REPORT_CATEGORY_OPTIONS.map((c) => c.key);
    expect(keys).toContain('pothole');
    expect(keys).toContain('food-safety');
    expect(keys).toContain('air-pollution');
    expect(keys).toContain('water-contamination');
    expect(keys).toContain('noise-pollution');
    expect(keys).toContain('waterlogging');
    expect(keys).toContain('open-burning');
  });

  it('rejects empty, HTTP, localhost, and developer LAN IPs in production config', () => {
    expect(validateProductionApiUrl('').valid).toBe(false);
    expect(validateProductionApiUrl('http://api.serpentis.app/api').valid).toBe(false);
    expect(validateProductionApiUrl('https://localhost:5000/api').valid).toBe(false);
    expect(validateProductionApiUrl('https://10.0.2.2:5000/api').valid).toBe(false);
    expect(validateProductionApiUrl('https://192.168.0.103:5000/api').valid).toBe(false);

    const unconfiguredProd = resolveEnvironmentConfig({
      isDev: false,
      nativeApiBaseUrl: '',
    });
    expect(unconfiguredProd.IS_PRODUCTION).toBe(true);
    expect(unconfiguredProd.CONFIG_ERROR).toBeTruthy();
    expect(unconfiguredProd.API_BASE_URL).not.toContain('192.168.');
    expect(unconfiguredProd.API_BASE_URL).not.toContain('10.0.2.2');

    const validProd = resolveEnvironmentConfig({
      isDev: false,
      nativeApiBaseUrl: 'https://api.serpentis.app/api/',
    });
    expect(validProd.CONFIG_ERROR).toBeNull();
    expect(validProd.API_BASE_URL).toBe('https://api.serpentis.app/api');
  });

  it('supports emulator, physical device, and custom dev overrides cleanly', () => {
    const emu = resolveEnvironmentConfig({ isDev: true, devTarget: 'emulator' });
    expect(emu.API_BASE_URL).toBe('http://10.0.2.2:5000/api');
    expect(emu.CONFIG_ERROR).toBeNull();

    const physMissing = resolveEnvironmentConfig({
      isDev: true,
      devTarget: 'physical_device',
      devLanHost: 'YOUR_LOCAL_LAN_IP',
    });
    expect(physMissing.CONFIG_ERROR).toBeTruthy();

    const physValid = resolveEnvironmentConfig({
      isDev: true,
      devTarget: 'physical_device',
      devLanHost: '192.168.1.44',
    });
    expect(physValid.API_BASE_URL).toBe('http://192.168.1.44:5000/api');
    expect(physValid.CONFIG_ERROR).toBeNull();

    const custom = resolveEnvironmentConfig({
      isDev: true,
      nativeApiBaseUrl: 'http://192.168.0.104:5000/api',
    });
    expect(custom.API_BASE_URL).toBe('http://192.168.0.104:5000/api');
    expect(custom.BUILD_TARGET).toBe('custom_dev');
  });

  it('requests Android notification permission at most once when denied', async () => {
    delete mockStore['@serpentis/notification_permission_asked_v1'];
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');

    const first = await ensureNotificationPermissionOnce();
    const second = await ensureNotificationPermissionOnce();

    expect(first).toBe('denied');
    expect(second).toBe('denied');
    expect(PermissionsAndroid.request).toHaveBeenCalledTimes(1);
  });
});
