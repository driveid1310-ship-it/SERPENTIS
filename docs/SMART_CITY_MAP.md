# SERPENTIS — Smart City Map (`MapScreen` & `SerpentisMap`)

## 1. MapLibre Preservation & Extension
- Preserves `@maplibre/maplibre-react-native` v11 with `OPENFREEMAP_STYLE_URL` (`https://tiles.openfreemap.org/styles/positron`), current location `GeoJSONSource` circle layer, and existing civic report/place/service press handlers.
- Default initial coordinate updated from New Delhi to **Badlapur, Maharashtra** (`[73.2355, 19.1668]`), dynamically synced with `CityContext`.

## 2. Toggleable Layers & Visual Distinction
Controlled via the **Layers & Legend** modal in `mobile/src/screens/MapScreen.tsx` backed by `GET /api/environment/map-layers`:
1. **Weather & Modeled AQI Pill** (`climatePin`): High-contrast dark pill displaying live temperature and modeled AQI.
2. **Official AQI Monitoring Stations** (`aqiStations`): Cyan **square** markers with white border (`stationMarker`).
3. **Air / Industrial / Open Burning Hotspots** (`pollution`): Orange circles (`#F97316`).
4. **Garbage / Dumping Hotspots** (`garbage`): Amber circles (`#EAB308`).
5. **Water Contamination Reports** (`water`): Cyan circles (`#06B6D4`).
6. **Waterlogging / Drainage Reports** (`waterlogging`): Blue circles (`#3B82F6`).
7. **Parks & Green Spaces** (`greenSpaces`): Emerald circles (`#22C55E`).
8. **Civic Reports** (`civicReports`), **Public Services / Hospitals** (`publicServices`), and **Heritage Locations** (`heritage`).
