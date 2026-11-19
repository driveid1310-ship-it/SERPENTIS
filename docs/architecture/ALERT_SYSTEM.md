# SERPENTIS — Climate Risk & Alert System

## 1. Alert Categories & Evaluation (`EnvironmentalAlertService`)
Evaluates live weather, CPCB AQI, and 24-hour citizen waterlogging clusters:
- `heatwave` (≥ 40°C or Heat Index ≥ 42°C) and `extreme-temperature` (≥ 37°C)
- `heavy-rainfall` (≥ 64.5 mm/day or ≥ 15 mm/hr)
- `thunderstorm` (WMO codes 95, 96, 99)
- `strong-winds` (≥ 40 km/h sustained or ≥ 55 km/h gusts)
- `poor-aqi` (CPCB AQI ≥ 201 Poor / ≥ 301 Very Poor / ≥ 401 Severe)
- `extreme-uv` (UV Index ≥ 8)
- `waterlogging` (≥ 3 unresolved waterlogging/drainage reports within 15 km in 24h)

## 2. Duplicate Suppression, Expiry & Notification Delivery
- **Fingerprint Deduplication:** Each alert generates a deterministic unique `fingerprint` (`category:citySlug:YYYY-MM-DD`). Re-evaluating on refresh will not recreate alerts or send duplicate notifications.
- **Verification Labels:** Threshold-evaluated alerts are labeled `threshold-advisory`; official provider alerts are labeled `official`.
- **Expiry Cleanup:** Alerts past `expiresAt` (6-hour window) are automatically marked `isActive: false`.
- **Notifications:** Subscribed users (`EnvironmentalPreference`) receive an in-app `Notification` of type `'environmental-alert'` once per new alert.
