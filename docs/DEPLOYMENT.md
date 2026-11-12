# SERPENTIS — Deployment Guide

## 1. Backend Deployment
1. Set `NODE_ENV=production` and strong random values for `JWT_SECRET` and `PASSWORD_RESET_SECRET`.
2. Restrict `CORS_ORIGIN` to trusted origins (comma-separated) instead of `*`.
3. Configure managed MongoDB (`MONGO_URI`) and ensure `2dsphere` and TTL indexes are synced.
4. Build and start:
   ```bash
   cd server
   npm ci
   npm run build
   npm start
   ```
5. Monitor `GET /health` via your reverse proxy / load balancer (Nginx, Caddy, AWS ALB, or Railway).
6. For commercial deployment using Open-Meteo, obtain a commercial Open-Meteo subscription and set `OPEN_METEO_BASE_URL` / `OPEN_METEO_AQ_BASE_URL` to your customer endpoint.
7. Register a static outbound server IP on `api.imd.gov.in` if enabling official IMD feeds (`IMD_API_KEY`, `IMD_JWT_TOKEN`).

## 2. Mobile Release Build (Android)
1. Point `mobile/src/config/env.ts` `production.API_BASE_URL` to your HTTPS API domain.
2. Generate a production Android release keystore (never ship `debug.keystore` to Play Store) and configure `signingConfigs.release` in `mobile/android/app/build.gradle`.
3. Set `usesCleartextTraffic` to `"false"` for production HTTPS builds.
4. Run `cd mobile/android && ./gradlew bundleRelease` to generate the Play Store `.aab`.
