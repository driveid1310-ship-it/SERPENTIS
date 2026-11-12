# SERPENTIS — Database Architecture

MongoDB via Mongoose 9 (`server/src/models/`). All existing civic collections and relationships are preserved untouched; `Report` and `Notification` are extended backward-compatibly.

## 1. Preserved Civic Models (Backward-Compatibly Extended)
- `User`, `Comment`, `Group`, `GroupMember`, `GroupMessage`, `PasswordReset`, `Place` (`2dsphere`), `PlaceFavorite`, `PlaceReview`, `PublicService` (`2dsphere`), `SOS` (`2dsphere`).
- `Report`: Extended `category` enum with 9 environmental categories (`air-pollution`, `water-contamination`, `noise-pollution`, `tree-cutting`, `waterlogging`, `drainage-blockage`, `industrial-pollution`, `open-burning`, `environmental-other`) and optional `environmentalDetails` (`isCitizenEstimate: true`) and `locationMeta` (`city`, `district`, `state`, `locality`), indexed on `{ 'locationMeta.city': 1, category: 1 }` and `{ location: '2dsphere' }`.
- `Notification`: Extended `type` enum with `'environmental-alert'` and optional `metadata`.

## 2. New Environmental Models
| Model | Purpose | Key Indexes |
|---|---|---|
| `EnvironmentalLocation` | Pan-India geographic hierarchy (`India -> State -> District -> City -> Locality`) with coverage flags & expansion stage. | `slug` (unique), `location` (`2dsphere`), `{ state, district, city }`, `{ expansionStage, isActive }` |
| `MonitoringStation` | Official CPCB/MPCB/OpenAQ/IMD reference stations vs community/modeled grid nodes. | `stationCode` (unique), `location` (`2dsphere`), `{ city, stationType }` |
| `EnvironmentalReading` | Standardized reading (`metricName`, `numericValue`, `unit`, `observationTimestamp`, `retrievalTimestamp`, `provider`, `dataQualityStatus`, `dataType`, `classification`, `confidence`). | `location` (`2dsphere`), `{ metricName, city, observationTimestamp }`, `{ dataType, observationTimestamp }` |
| `WeatherObservation` | TTL-cached normalized weather snapshots. | `location` (`2dsphere`), `expiresAt` (TTL `0`), `{ locationKey, retrievalTimestamp }` |
| `AirQualityObservation` | TTL-cached normalized CPCB NAQI snapshots & pollutant breakdowns. | `location` (`2dsphere`), `expiresAt` (TTL `0`), `{ locationKey, retrievalTimestamp }` |
| `EnvironmentalAlert` | Weather/AQI/waterlogging alerts with `fingerprint` duplicate suppression & expiry timestamps. | `fingerprint` (unique), `location` (`2dsphere`), `{ city, isActive, expiresAt }` |
| `EnvironmentalMetricHistory` | Daily/hourly aggregated city metrics for Climate Analytics. | `{ locationSlug, granularity, periodStart, dataType }` (unique), `{ city, periodStart }` |
| `EnvironmentalPreference` | User saved locations, °C/°F unit, km/h vs m/s, alert thresholds, location consent flag. | `user` (unique) |
