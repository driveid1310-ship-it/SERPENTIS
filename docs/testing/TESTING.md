# SERPENTIS — Testing & Quality Assurance

## 1. Test Suites Implemented

### Backend (`server/tests/`) — Executed via `npm test` (`tsx --test`)
1. `cpcbAqi.test.ts`: Official CPCB breakpoints interpolation, max sub-index (never averaged), dominant pollutant identification, Minimum-Three Rule rejection (< 3 pollutants or missing PM2.5/PM10), modeled vs official flag (`isOfficialAqi`), invalid/negative value rejection, and all 6 CPCB AQI category bounds.
2. `environmentalValidation.test.ts`: °C/°F and km/h↔m/s conversions, Rothfusz heat index, Magnus-Tetens dew point, wind chill, daylight duration, coordinate validation, stale-reading checks, and Haversine distance.
3. `alertsAndCache.test.ts`: Concurrent in-flight request deduplication, TTL cache invalidation, and heatwave / poor AQI / extreme UV / waterlogging alert evaluation.
4. `indiaLocationAndSmartCity.test.ts`: Badlapur East/West pilot, Maharashtra cities, Pan-India 36 states/UTs resolution, coordinate nearest-city resolution, and educational carbon footprint calculator.
5. `apiIntegration.test.ts`: Live Express HTTP integration tests for `/health`, `/api/environment/locations`, `/api/environment/carbon-estimate`, `401` auth enforcement, and structured `404` handling.

### Mobile (`mobile/__tests__/`) — Executed via `npm test -- --watchAll=false` (Jest)
1. `environment.test.ts`: Badlapur pilot coordinates (`DEFAULT_PILOT_CITY`, `MAP_TEST_INITIAL_COORDINATE`) and combined civic + environmental report category coverage.
2. `componentsAndScreens.test.tsx`: `MiniBarChart` empty state, `WeatherScreen` live data rendering, `AirQualityScreen` modeled vs official badge & CPCB NAQI display, `EnvironmentalAlertsScreen` alerts & precautions, and `CitySelectorScreen` city list.

## 2. Verification Commands
```powershell
# Backend build & tests
cd server
npm run build
npm test

# Mobile type-check, lint & tests
cd mobile
npx tsc --noEmit
npx eslint src
npm test -- --watchAll=false
```
