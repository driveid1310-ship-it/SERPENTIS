# SERPENTIS — Climate & Smart City Expansion Roadmap

## Vision & Geographic Strategy
Evolve SERPENTIS into a unified **Smart City + Climate Intelligence Platform** combining Civic Intelligence and Environmental & Climate Intelligence:
- **Stage 1 (Pilot):** Badlapur, Maharashtra (Thane District; Badlapur East & West localities).
- **Stage 2 (State):** Thane, Mumbai, Navi Mumbai, Pune, Nashik, and remaining Maharashtra districts.
- **Stage 3 (National):** Pan-India hierarchy (`India -> State -> District -> City -> Locality -> Coordinates`) with city-agnostic business logic and explicit data-coverage indicators.

## Execution Milestones

| Milestone | Scope | Key Deliverables |
|---|---|---|
| **M0** | Baseline, Backup & Audit | Branch `serpentis-autonomous-development`, `zip/baseline-pre-autonomous.zip`, baseline docs (`PROJECT_BASELINE.md`, `EXISTING_FEATURE_AUDIT.md`, `KNOWN_ISSUES.md`, `CLIMATE_EXPANSION_ROADMAP.md`). |
| **M1** | Environmental Architecture Foundation | Backend domains (`environmental`, `location`, `data-providers`), standardized data models (`EnvironmentalLocation`, `MonitoringStation`, `WeatherObservation`, `AirQualityObservation`, `EnvironmentalReading`, `EnvironmentalAlert`, `EnvironmentalMetricHistory`, `EnvironmentalConfig`), India location hierarchy & Badlapur/Maharashtra/India seed data, caching & validation services, `/health` & error handler. |
| **M2** | Weather Intelligence | `WeatherProvider` interface, Open-Meteo live adapter, IMD adapter (credential-gated + graceful fallback), WeatherService (heat index, dew point, wind chill, daylight duration, C/F conversion), `/api/environment/weather`, mobile `WeatherScreen`. |
| **M3** | Air Quality & CPCB National AQI | Exact CPCB National AQI calculator (8 pollutants, linear interpolation, minimum-3 + PM requirement, dominant pollutant, insufficient/invalid handling), OpenAQ v3 adapter, CPCB/data.gov.in adapter, Open-Meteo modeled AQ fallback (clearly marked `modeled`), `/api/environment/aqi`, mobile `AirQualityScreen`. |
| **M4** | Environmental Monitoring & Reporting | Noise, water quality, green cover, waste hotspots, solar/waterlogging monitoring models & endpoints; extend `Report` model & `ReportIssueScreen` with environmental categories (`air-pollution`, `water-contamination`, `noise-pollution`, `tree-cutting`, `waterlogging`, `drainage-blockage`, `industrial-pollution`, `open-burning`, `environmental-other`) and validation. |
| **M5** | Unified Smart City Dashboard | Extend `HomeScreen` and `DashboardScreen` into unified Civic + Climate Intelligence overview with selected city/area, live weather & AQI, alerts banner, quick actions, and civic/environmental stats. |
| **M6** | Unified Smart City Map | Extend `SerpentisMap` & `MapScreen` with toggleable layers (weather, temperature, AQI stations, pollution hotspots, civic reports, garbage, water contamination, waterlogging, flood-risk, hospitals, public services, parks/green spaces, heritage), distinct visual markers by source type, clustering/filtering, legends, and detail sheets. |
| **M7** | Climate Risk & Alert System | `EnvironmentalAlertService` evaluating heatwave, heavy rain, thunderstorm, severe AQI, extreme UV, waterlogging/flood warnings; duplicate suppression, expiry cleanup, notification integration (`environmental-alert` type), alert preferences, mobile `EnvironmentalAlertsScreen`. |
| **M8** | Historical Environmental Analytics | `ClimateAnalyticsService` aggregating weather trends, AQI trends, hotspot rankings, civic resolution rate/time; mobile `EnvironmentalAnalyticsScreen` with labeled charts and honest data-coverage messaging. |
| **M9** | AI-Powered City Intelligence | Provider-agnostic `AIProvider` interface + OpenAI/Gemini optional adapter + transparent deterministic non-AI fallback using live retrieved environmental data; assistant Q&A, image classification advisory, pattern detection, daily/weekly summaries; mobile `CityAssistantScreen`. |
| **M10** | Environmental & Civic Intelligence Score | Transparent, reproducible SERPENTIS Environmental Health Score + Civic Health Score + City Intelligence Overview with coverage %, methodology explanation, observation timestamp, and non-medical disclaimer. |
| **M11** | Additional Smart City Capabilities | Disaster preparedness (emergency directory, nearby hospitals, safety guides), carbon footprint estimator, solar potential indicator, sustainable mobility discovery, green-space finder, environmental citizen challenges. |
| **M12** | Geographic Expansion Architecture | Pan-India location selector (`CitySelectorScreen`), Badlapur East/West + Maharashtra + major Indian cities registry, coverage-aware UI, location persistence. |
| **M13** | Security, Performance & QA | Helmet/security headers, rate limiting, input validation, upload checks, comprehensive backend unit/integration tests (CPCB AQI, units, alerts, cache, geo, auth) and mobile Jest tests, `tsc`, `eslint`. |
| **M14** | Documentation & Final Delivery | Complete 17-doc suite in `docs/`, `server/.env.example`, final recoverable backup, commit on `serpentis-autonomous-development`, final delivery report. |
