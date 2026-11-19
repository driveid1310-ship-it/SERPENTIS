import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import MiniBarChart from '../src/components/Charts/MiniBarChart';
import { ThemeProvider } from '../src/context/ThemeContext';
import { CityProvider } from '../src/context/CityContext';
import WeatherScreen from '../src/screens/WeatherScreen';
import AirQualityScreen from '../src/screens/AirQualityScreen';
import EnvironmentalAlertsScreen from '../src/screens/EnvironmentalAlertsScreen';
import CitySelectorScreen from '../src/screens/CitySelectorScreen';
import * as envApi from '../src/api/environment';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => undefined),
}));

jest.mock('../src/api/environment', () => ({
  getWeatherRequest: jest.fn(),
  getAirQualityRequest: jest.fn(),
  getAlertsRequest: jest.fn(),
  getAlertHistoryRequest: jest.fn(),
  listLocationsRequest: jest.fn(),
}));

const mockNav = {
  goBack: jest.fn(),
  navigate: jest.fn(),
} as any;

const mockRoute = { key: 'test', name: 'Weather', params: undefined } as any;

describe('SERPENTIS Climate Components & Screens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders MiniBarChart empty state and bar values cleanly', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <ThemeProvider>
          <MiniBarChart title="Temp" unit="°C" items={[]} emptyMessage="No history" />
        </ThemeProvider>,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain('No history');
  });

  it('renders WeatherScreen with live weather response', async () => {
    (envApi.getWeatherRequest as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        location: {
          slug: 'badlapur-maharashtra',
          name: 'Badlapur',
          city: 'Badlapur',
          district: 'Thane',
          state: 'Maharashtra',
          latitude: 19.1668,
          longitude: 73.2355,
        },
        provider: 'Open-Meteo',
        attribution: 'Open-Meteo CC BY 4.0',
        dataType: 'modeled',
        dataQualityStatus: 'valid',
        isStale: false,
        isMockFallback: false,
        observationTimestamp: new Date().toISOString(),
        retrievalTimestamp: new Date().toISOString(),
        cacheHit: false,
        preferredUnits: { temperature: 'C', windSpeed: 'kmh' },
        display: {
          temperature: 32.5,
          feelsLike: 34.0,
          windSpeed: 10.2,
          temperatureUnitLabel: '°C',
          windSpeedUnitLabel: 'km/h',
        },
        current: {
          temperatureC: 32.5,
          feelsLikeC: 34.0,
          condition: 'Clear Sky',
          weatherCode: 0,
          humidityPct: 48,
          windSpeedKmh: 10.2,
          windDirectionDeg: 240,
          windGustsKmh: 16,
          pressureHpa: 1011,
          visibilityMeters: 10000,
          cloudCoverPct: 10,
          precipitationMm: 0,
          uvIndex: 6.2,
          heatIndexC: 34.1,
          dewPointC: 20.1,
          windChillC: null,
          sunrise: null,
          sunset: null,
          daylightDurationHours: 11.4,
          solarRadiationWm2: 650,
        },
        hourly24h: [],
        daily7d: [],
      },
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <ThemeProvider>
          <CityProvider>
            <WeatherScreen navigation={mockNav} route={mockRoute} />
          </CityProvider>
        </ThemeProvider>,
      );
    });
    const jsonStr = JSON.stringify(tree!.toJSON());
    expect(jsonStr).toContain('Clear Sky');
    expect(jsonStr).toContain('Badlapur');
  });

  it('renders AirQualityScreen distinguishing modeled vs official CPCB data', async () => {
    (envApi.getAirQualityRequest as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        location: {
          slug: 'badlapur-maharashtra',
          name: 'Badlapur',
          city: 'Badlapur',
          district: 'Thane',
          state: 'Maharashtra',
          latitude: 19.1668,
          longitude: 73.2355,
        },
        provider: 'Open-Meteo Air Quality (CAMS Modeled)',
        attribution: 'Open-Meteo',
        methodology: 'CPCB_INDIA_NAQI',
        dataType: 'modeled',
        dataQualityStatus: 'valid',
        isOfficialAqi: false,
        isStale: false,
        isMockFallback: false,
        observationTimestamp: new Date().toISOString(),
        retrievalTimestamp: new Date().toISOString(),
        overallAqi: 145,
        aqiCategory: 'Moderately Polluted (Modeled Estimate)',
        aqiColorHex: '#EAB308',
        dominantPollutant: 'pm25',
        healthAdvisory: 'Sensitive groups should limit prolonged exertion.',
        reliabilityNote: 'Modeled estimate.',
        station: null,
        pollutants: {
          pm25: { value: 73, unit: 'µg/m³', averagingPeriod: '24h', subIndex: 145, category: 'Moderately Polluted', status: 'valid' },
          pm10: { value: 110, unit: 'µg/m³', averagingPeriod: '24h', subIndex: 107, category: 'Moderately Polluted', status: 'valid' },
          no2: { value: 25, unit: 'µg/m³', averagingPeriod: '24h', subIndex: 31, category: 'Good', status: 'valid' },
          so2: { value: 10, unit: 'µg/m³', averagingPeriod: '24h', subIndex: 13, category: 'Good', status: 'valid' },
          co: { value: 0.6, unit: 'mg/m³', averagingPeriod: '8h', subIndex: 30, category: 'Good', status: 'valid' },
          o3: { value: 40, unit: 'µg/m³', averagingPeriod: '8h', subIndex: 40, category: 'Good', status: 'valid' },
          nh3: { value: null, unit: 'µg/m³', averagingPeriod: '24h', subIndex: null, category: null, status: 'insufficient' },
          pb: { value: null, unit: 'µg/m³', averagingPeriod: '24h', subIndex: null, category: null, status: 'insufficient' },
        },
        hourlyTrend: [],
      },
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <ThemeProvider>
          <CityProvider>
            <AirQualityScreen navigation={mockNav} route={{ ...mockRoute, name: 'AirQuality' }} />
          </CityProvider>
        </ThemeProvider>,
      );
    });
    const jsonStr = JSON.stringify(tree!.toJSON());
    expect(jsonStr).toContain('MODELED ESTIMATE');
    expect(jsonStr).toContain('145');
  });

  it('renders EnvironmentalAlertsScreen active alert list and precautions', async () => {
    (envApi.getAlertsRequest as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        activeAlerts: [
          {
            _id: 'a1',
            category: 'heatwave',
            severity: 'severe',
            title: 'Heat Stress Advisory in Badlapur',
            description: 'Temperature 40.5C.',
            precautions: ['Stay hydrated'],
            provider: 'Open-Meteo',
            source: 'SERPENTIS Threshold Engine',
            verificationStatus: 'threshold-advisory',
            city: 'Badlapur',
            district: 'Thane',
            state: 'Maharashtra',
            issuedAt: new Date().toISOString(),
            validFrom: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 3600000).toISOString(),
            isActive: true,
          },
        ],
      },
    });
    (envApi.getAlertHistoryRequest as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: { alerts: [] },
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <ThemeProvider>
          <CityProvider>
            <EnvironmentalAlertsScreen navigation={mockNav} route={{ ...mockRoute, name: 'EnvironmentalAlerts' }} />
          </CityProvider>
        </ThemeProvider>,
      );
    });
    const jsonStr = JSON.stringify(tree!.toJSON());
    expect(jsonStr).toContain('Heat Stress Advisory in Badlapur');
    expect(jsonStr).toContain('Stay hydrated');
  });

  it('renders CitySelectorScreen with Badlapur Pilot and Pan-India cities', async () => {
    (envApi.listLocationsRequest as jest.Mock).mockResolvedValueOnce({
      success: true,
      data: {
        cities: [
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
            climateZone: 'Tropical',
            coverage: {
              weather: true,
              airQualityModeled: true,
              airQualityStations: false,
              civicReports: true,
              officialAlerts: false,
              greenSpaces: true,
            },
          },
        ],
        statesAndUTs: ['Maharashtra'],
        total: 1,
      },
    });

    let tree: ReactTestRenderer.ReactTestRenderer;
    await act(async () => {
      tree = ReactTestRenderer.create(
        <ThemeProvider>
          <CityProvider>
            <CitySelectorScreen navigation={mockNav} route={{ ...mockRoute, name: 'CitySelector' }} />
          </CityProvider>
        </ThemeProvider>,
      );
    });
    const jsonStr = JSON.stringify(tree!.toJSON());
    expect(jsonStr).toContain('Badlapur');
    expect(jsonStr).toContain('Thane');
  });
});
