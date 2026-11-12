# SERPENTIS — API Documentation

Base URL: `http://localhost:5000`
All existing endpoints under `/api/auth`, `/api/admin`, `/api/reports`, `/api/comments`, `/api/sos`, `/api/users`, `/api/notifications`, `/api/places`, `/api/public-services`, and `/api/groups` remain backward-compatible.

## 1. Health Endpoint
- **GET `/health`**: Returns service status, MongoDB connection state, configured provider status (no secrets), and environmental cache stats.

## 2. Environmental Intelligence Endpoints (`/api/environment`)
Rate limit: 60 req/min (`ai`: 20 req/min). Location query params supported across GET routes: `?slug=badlapur-maharashtra` OR `?city=Badlapur` OR `?lat=19.1668&lon=73.2355`.

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/environment/locations` | Public | List/search India cities (`?state=&district=&stage=pilot\|state\|national&q=`). |
| `GET` | `/api/environment/locations/resolve` | Public | Normalize city name, slug, or GPS coordinates to an India `LocationContext`. |
| `GET` | `/api/environment/weather` | Public | Current weather + 24h hourly + 7d daily forecast (`?unit=C\|F&windUnit=kmh\|ms&refresh=true`). Cached 15 min. |
| `GET` | `/api/environment/aqi` | Public | CPCB National AQI + 8 pollutants + station metadata + hourly trend (`?refresh=true`). Cached 20 min. |
| `GET` | `/api/environment/overview` | Public | Unified Weather + AQI + Alerts + Scores + Civic Summary for Dashboard/Home. |
| `GET` | `/api/environment/monitoring` | Public | Noise (calibrated vs citizen), water quality, green spaces, waste & waterlogging hotspots (`?radiusMeters=15000`). |
| `POST` | `/api/environment/readings` | Bearer JWT | Submit citizen/sensor reading (`metricName`, `numericValue`, `latitude`, `longitude`, optional `notes`). |
| `GET` | `/api/environment/alerts` | Public | Evaluate & return active climate/AQI/waterlogging alerts (duplicate suppressed). |
| `GET` | `/api/environment/alerts/history` | Public | Historical alerts for city (`?limit=30`). |
| `GET` | `/api/environment/analytics` | Public | Historical weather/AQI trends + civic resolution metrics (`?days=14`). |
| `GET` | `/api/environment/map-layers` | Public | Smart City Map layer payload (`weatherPin`, `airQualityGrid`, `aqiStations`, `pollutionHotspots`, `garbageHotspots`, `waterContamination`, `waterlogging`, `civicReports`, `hospitals`, `publicServices`, `greenSpaces`, `heritage`). |
| `POST` | `/api/environment/assistant/ask` | Public | Natural-language Q&A grounded in live retrieved data (`{ question, slug?, lat?, lon? }`). |
| `GET` | `/api/environment/assistant/summary` | Public | Daily city summary & recurring hotspot pattern detection. |
| `POST` | `/api/environment/assistant/analyze-image` | Bearer JWT | Assistive environmental photo check (`{ imageUrl, description? }`). Always returns `isVerifiedEvidence: false`. |
| `GET` | `/api/environment/scores` | Public | SERPENTIS Environmental Health Score & Civic Health Score with transparent weights. |
| `GET` | `/api/environment/smart-city` | Public | Disaster helplines/hospitals, solar potential, sustainable mobility, green spaces, citizen challenges. |
| `POST` | `/api/environment/carbon-estimate` | Public | Educational carbon footprint estimator (`carKmPerWeek`, `monthlyElectricityKwh`, etc.). |
| `GET` | `/api/environment/preferences` | Bearer JWT | Fetch user unit, location, and alert preferences. |
| `PUT` | `/api/environment/preferences` | Bearer JWT | Update user unit, location, alert thresholds, and consent. |

## 3. Standard Error Responses
- `400 Bad Request`: `{ "success": false, "message": "..." }`
- `401 Unauthorized`: `{ "success": false, "message": "Authentication token is missing." }`
- `404 Not Found`: `{ "success": false, "message": "Route not found: ..." }`
- `429 Too Many Requests`: `{ "success": false, "message": "Too many requests..." }` with `Retry-After` header.
