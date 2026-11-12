# SERPENTIS — Weather Module

## 1. Capabilities
- **Current Weather:** Temperature, feels-like temperature, WMO weather condition label, humidity, wind speed, wind direction, wind gusts, MSL atmospheric pressure, visibility, cloud cover, precipitation, shortwave solar radiation.
- **Scientific Indicators (`EnvironmentalValidationService`):**
  - **Heat Index** (Rothfusz equation, computed when T ≥ 27°C and RH ≥ 40%).
  - **Dew Point** (Magnus-Tetens approximation).
  - **Wind Chill** (computed when T ≤ 10°C and wind > 4.8 km/h).
  - **Daylight Duration** (hours between sunrise and sunset).
- **Forecasts:** 24-hour hourly forecast and 7-day daily forecast (min/max temperature, rainfall sum, rain probability, UV max, wind max).
- **Units & Preferences:** Supports °C / °F and km/h / m/s via `CityContext` and `WeatherService`.

## 2. Caching & Freshness
- `WeatherService` caches responses per `(lat, lon)` grid cell (2 decimal places) for 15 minutes with in-flight deduplication (`EnvironmentalCacheService`).
- Persists `WeatherObservation` snapshots (2h TTL) and `EnvironmentalMetricHistory` daily rollups in MongoDB.
- Stale readings (> 120 minutes old) are flagged `isStale: true`.

## 3. Mobile Screen
- `mobile/src/screens/WeatherScreen.tsx`: City selector trigger, °C/°F unit toggle, manual refresh, current hero card, 6-tile scientific metrics grid, 24h temperature bar chart (`MiniBarChart`), horizontal hourly cards, and 7-day daily forecast list.
