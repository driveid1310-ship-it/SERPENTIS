# SERPENTIS — System Architecture

## 1. Platform Overview
SERPENTIS integrates **Civic Intelligence** (existing reporting, MapLibre civic pins, SOS, community groups, Socket.IO chat, heritage/public services, badges, trust score) with **Environmental & Climate Intelligence** (weather, CPCB National AQI, monitoring, risk alerts, analytics, AI city assistant, and city intelligence scores) in one unified platform.

## 2. Layered Backend Architecture (`server/src/`)
- **HTTP & Realtime Layer:** `app.ts`, `server.ts`, `socket.ts`, `middleware/` (`authMiddleware`, `roleMiddleware`, `adminMiddleware`, `uploadMiddleware`, `rateLimitMiddleware`, `errorMiddleware`).
- **Route & Controller Layer:** Preserved 10 civic routes (`/api/auth`, `/api/admin`, `/api/reports`, `/api/comments`, `/api/sos`, `/api/users`, `/api/notifications`, `/api/places`, `/api/public-services`, `/api/groups`) + new `/api/environment` (`environmentalRoutes.ts`, `environmentalController.ts`).
- **Domain Service Layer (`server/src/services/`):**
  - `data-providers/`: `types.ts` interfaces (`WeatherProvider`, `AirQualityProvider`, `AlertProvider`, `AIProvider`), `OpenMeteoWeatherProvider`, `ImdWeatherProvider`.
  - `weather/`: `WeatherService` (caching, fallback chain, scientific indicators, snapshot persistence).
  - `air-quality/`: `CpcbAqiCalculator`, `CpcbDataGovProvider`, `OpenAqAirQualityProvider`, `OpenMeteoAirQualityProvider`, `AirQualityService`.
  - `environmental/`: `EnvironmentalCacheService` (TTL + in-flight deduplication), `EnvironmentalValidationService`, `EnvironmentalMonitoringService`, `EnvironmentalAlertService`.
  - `analytics/`: `ClimateAnalyticsService`.
  - `ai/`: `CityIntelligenceAIService` (`OpenAIProvider`, `GeminiAIProvider`, `DeterministicFallbackAIProvider`).
  - `intelligence/`: `CityIntelligenceScoreService`.
  - `smartcity/`: `SmartCityCapabilitiesService`.
  - `location/`: `IndiaLocationService` (Badlapur East/West pilot -> Maharashtra -> Pan-India hierarchy).

## 3. Mobile Architecture (`mobile/src/`)
- **Providers (`AppProvider.tsx`):** `ThemeProvider` -> `CityProvider` (persisted selected city & °C/°F unit) -> `AuthProvider`.
- **Navigation (`AppNavigator.tsx`):** Preserved `MainTabs` (`HomeTab`, `Map`, `ReportIssue`, `Community`, `Profile`) + `RootStackParamList` extended with `Weather`, `AirQuality`, `EnvironmentalMonitoring`, `EnvironmentalAlerts`, `EnvironmentalAnalytics`, `CityAssistant`, `CityIntelligence`, `CitySelector`.
- **Data Integrity Rule:** Observed measurements, modeled estimates, forecasts, citizen-submitted estimates, and experimental predictions are explicitly typed and visually distinguished across backend payloads and mobile screens.
