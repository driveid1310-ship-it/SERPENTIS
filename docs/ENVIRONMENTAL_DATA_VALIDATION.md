# SERPENTIS — Environmental Data Integrity Validation Report

**Audit Baseline:** `C:\projects\SERPENTIS` (`serpentis-autonomous-development`)  
**Pilot Coordinates:** Badlapur, Maharashtra (`lat: 19.1668, lon: 73.2355`)

---

## 1. Air Quality Index (CPCB NAQI) Provenance & Rules

| Verification Item | Result | Observed Evidence |
| :--- | :--- | :--- |
| Official CPCB Breakpoint Interpolation (8 pollutants) | **PASS** | `server/tests/cpcbAqi.test.ts` asserts breakpoints & sub-indices across `pm25`, `pm10`, `no2`, `so2`, `co`, `o3`, `nh3`, `pb` (`14/14` pre-existing + `17/17` full suite passed). |
| Aggregation Rule (`max` sub-index, never mean) | **PASS** | Verified dominant pollutant selection and non-averaging calculation in `CpcbAqiCalculator.ts`. |
| Minimum-Three-Pollutant + PM Rule | **PASS** | Official AQI eligibility (`isOfficialAqi: true`) requires >= 3 valid pollutants AND at least one particulate matter metric (`pm25` or `pm10`). |
| Modeled Estimate Isolation (Open-Meteo) | **PASS** | Live `GET /api/environment/aqi?lat=19.1668&lon=73.2355` returned `overallAqi: 208`, `aqiCategory: "Poor (Modeled Estimate)"`, `isOfficialAqi: false`, `station: null`. Modeled sources never set `isOfficialAqi: true`. |
| Pollutant Averaging Period Attribution | **PASS** | Open-Meteo `1h` modeled pollutant series report `averagingPeriod: '1h'` uniformly (`Object.values(pollutants).every(p => p.averagingPeriod === '1h')`). |
| Suspect / Negative Value Filtering | **PASS** | Negative and physically impossible inputs are marked `suspect` and excluded from AQI calculation. |
| Official CPCB (`data.gov.in`) & OpenAQ v3 Ground Feeds | **BLOCKED** | `CpcbDataGovProvider.isConfigured()` and `OpenAqAirQualityProvider.isConfigured()` return `false` when `DATA_GOV_IN_API_KEY` / `OPENAQ_API_KEY` are absent; adapters throw explicit unconfigured errors rather than fabricating stations. |

---

## 2. Meteorological Data Verification

| Verification Item | Result | Observed Evidence |
| :--- | :--- | :--- |
| Live Weather Retrieval (`Open-Meteo`) | **PASS** | Live `GET /api/environment/weather?lat=19.1668&lon=73.2355` returned `provider: "Open-Meteo"`, `current.temperatureC: 33.3`, `isMockFallback: false`. |
| Unit Conversions & Scientific Indicators | **PASS** | `°C`/`°F`, `km/h`/`m/s`, humidity, precipitation, heat index, dew point, wind chill, sunrise/sunset validated in `environmentalValidation.test.ts`. |
| TTL Cache Behavior | **PASS** | Sequential API calls verified `cacheHit: false` on cold request followed by `cacheHit: true` within TTL; unit test verified concurrent fetch deduplication & TTL expiry. |
| IMD Official Feed & Warning Integration | **BLOCKED** | `ImdWeatherProvider.isConfigured()` returns `false` without `IMD_API_KEY` / `IMD_JWT_TOKEN`. |

---

## 3. Outage, Invalid Response & Degraded State Matrix

Tested via `verify_phase2_backend.ts` against `WeatherService` and `AirQualityService` plus live Express `/health`:

| Scenario | Expected Behavior | Actual Observed Result | Verdict |
| :--- | :--- | :--- | :--- |
| Provider Timeout (`ENVIRONMENTAL_ALLOW_MOCK_FALLBACK=false`) | Propagate timeout error; do not silently return fake metrics | Rejected with `TimeoutError` (`aborted`/`timeout`) | **PASS** |
| Upstream 429 Rate Limit (`ENVIRONMENTAL_ALLOW_MOCK_FALLBACK=false`) | Propagate upstream failure cleanly | Rejected `getAirQuality` call cleanly | **PASS** |
| Malformed JSON + `ENVIRONMENTAL_ALLOW_MOCK_FALLBACK=true` | Label synthetic fallback explicitly (`isMockFallback: true`, `isStale: true`, `isOfficialAqi: false`) | Returned explicit `"Demo Fallback"` with `isMockFallback: true`, `isStale: true`, `isOfficialAqi: false` | **PASS** |
| Unconfigured Keyed Provider Call | Explicit error, `isConfigured(): false` | Returned `false`; threw unconfigured error | **PASS** |
| No Ground Station Found | `station: null`, no fabricated station names | `station: null` on Open-Meteo modeled responses | **PASS** |
| Database Disconnected (`/health`) | Report `database.state: "disconnected"` without process crash | Verified `disconnected` state cleanly when Mongoose disconnected | **PASS** |
| Live CPCB/OpenAQ/IMD Rate Limit & Production Outage | Verify live keyed provider rate-limit headers | External keys unavailable in local environment | **BLOCKED** |
