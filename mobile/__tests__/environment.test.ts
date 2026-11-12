import { REPORT_CATEGORY_OPTIONS } from '../src/types/report';
import { MAP_TEST_INITIAL_COORDINATE } from '../src/config/map';
import { DEFAULT_PILOT_CITY } from '../src/context/CityContext';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
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
});
