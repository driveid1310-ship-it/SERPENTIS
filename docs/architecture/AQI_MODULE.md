# SERPENTIS — Air Quality (CPCB National AQI) Module

## 1. Methodology (`server/src/services/air-quality/CpcbAqiCalculator.ts`)
Implements the official **Central Pollution Control Board (CPCB) Indian National AQI (NAQI)** methodology:
- **Supported Pollutants:** PM2.5 (µg/m³, 24h), PM10 (µg/m³, 24h), NO2 (µg/m³, 24h), SO2 (µg/m³, 24h), CO (mg/m³, 8h), O3 (µg/m³, 8h), NH3 (µg/m³, 24h), Pb (µg/m³, 24h).
- **Sub-Index Linear Interpolation:**
  $$I_p = \text{round}\left(\frac{I_{hi} - I_{lo}}{C_{hi} - C_{lo}} (C_p - C_{lo}) + I_{lo}\right)$$
- **Overall AQI:** Maximum of all valid pollutant sub-indices (never averaged); the pollutant with the highest sub-index is the **dominant pollutant**.
- **CPCB Minimum-Three Rule:** Official AQI requires ≥ 3 valid pollutants AND at least one particulate matter metric (PM2.5 or PM10). Missing/negative/out-of-bounds readings are flagged `insufficient` or `suspect`.
- **Modeled vs Official Distinction:** Ground station readings meeting the minimum-3 rule set `isOfficialAqi: true`; modeled CAMS/Open-Meteo data sets `isOfficialAqi: false` and appends `(Modeled Estimate)`.

## 2. Categories & Health Advisories
- `0–50`: Good (`#22C55E`)
- `51–100`: Satisfactory (`#84CC16`)
- `101–200`: Moderately Polluted (`#EAB308`)
- `201–300`: Poor (`#F97316`)
- `301–400`: Very Poor (`#EF4444`)
- `401–500`: Severe (`#A855F7`)

## 3. Mobile Screen
- `mobile/src/screens/AirQualityScreen.tsx`: Displays NAQI score & category badge, `OFFICIAL CPCB STATION` vs `MODELED ESTIMATE` tag, dominant pollutant, health advisory, station distance & reliability note, 8-pollutant cards with individual sub-indices, and 24h trend chart.
