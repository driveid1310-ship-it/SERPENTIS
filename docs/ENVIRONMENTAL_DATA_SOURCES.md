# SERPENTIS — Environmental Data Sources & Provider Policy

## 1. Weather Providers
| Provider | Endpoint / Access | Credentials Required | Data Classification | License / Constraints |
|---|---|---|---|---|
| **Open-Meteo Weather API** (Active Live Default) | `https://api.open-meteo.com/v1/forecast` | None (Free tier) | `modeled` (current grid) / `forecast` (hourly & 7-day) | CC BY 4.0 attribution required. Non-commercial free tier (10,000 req/day). Commercial apps require paid plan. |
| **India Meteorological Department (IMD)** (Adapter Ready) | `https://api.imd.gov.in` | `IMD_API_KEY`, `IMD_JWT_TOKEN` + static IP registration | `observed` / `official` warnings | Restricted government/registered access; falls back to Open-Meteo when unconfigured. |

## 2. Air Quality Providers
| Provider | Endpoint / Access | Credentials Required | Data Classification | Notes |
|---|---|---|---|---|
| **CPCB / data.gov.in** (Adapter Ready) | `https://api.data.gov.in/resource/...` | `DATA_GOV_IN_API_KEY` | `observed` (Official CAAQMS ground stations) | Official Indian ground station data when key is configured. |
| **OpenAQ v3** (Adapter Ready) | `https://api.openaq.org/v3/locations` (`iso=IN`) | `OPENAQ_API_KEY` (`X-API-Key` header) | `observed` (Ground stations) | Free account key available via explore.openaq.org. |
| **Open-Meteo Air Quality** (Active Modeled Fallback) | `https://air-quality-api.open-meteo.com/v1/air-quality` | None (Free tier) | `modeled` (CAMS global model) | Explicitly marked `isOfficialAqi: false` and labeled `Modeled Estimate`. Never presented as official CPCB station measurement. |

## 3. Geographic & Civic Sources
- **MapLibre Tiles:** OpenFreeMap Positron (`https://tiles.openfreemap.org/styles/positron`).
- **Hospitals, Transit, Green Spaces, Heritage:** Stored in MongoDB (`PublicService`, `Place`) seeded from OpenStreetMap Overpass scripts (`server/src/scripts/seedMumbai.ts`, etc.).

## 4. Data Integrity Rules
1. Live data is never silently replaced with fabricated numbers.
2. If all upstream providers fail and `ENVIRONMENTAL_ALLOW_MOCK_FALLBACK=true`, responses explicitly set `isMockFallback: true` and `dataQualityStatus: 'insufficient'`.
3. API keys remain strictly on the backend (`server/.env`) and are never embedded in the mobile bundle.
