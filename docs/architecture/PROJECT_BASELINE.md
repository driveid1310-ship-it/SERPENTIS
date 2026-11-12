# SERPENTIS — Project Baseline

**Audit Date:** 2026-11-12
**Git Branch Created:** `serpentis-autonomous-development` (from `main`)
**Recoverable Baseline Backup:** `zip/baseline-pre-autonomous.zip` (excludes `node_modules`, `.env`, keys, and native build caches)

## 1. Repository Layout

Active application directories:
- `server/` — Express 5 + TypeScript + Mongoose 9 + Socket.IO 4 backend (`"type": "module"`, `"moduleResolution": "Node16"`).
- `mobile/` — React Native 0.86 + TypeScript 5.8 + MapLibre RN 11.4.1 + React Navigation 7 mobile app.

Legacy / non-active / academic report directories (preserved untouched):
- `backend/`, `mobile-old/`, `mobilebackup/`, `server-old/`, `zip/`, `documentation/`, `documentation - Copy/`, `report_final/`, `report_source_code/`, `charts/`, and root Python/CJS utility scripts.

## 2. Technology Stack (Verified from Package Manifests)

### Backend (`server/package.json`)
- **Runtime / Language:** Node.js `v22.17.0`, TypeScript `^5.9.3`, `tsx` `^4.23.1`
- **Framework:** `express` `^5.2.1`, `cors` `^2.8.6`, `dotenv` `^17.4.2`
- **Database:** `mongoose` `^9.7.4` (Local MongoDB Server service observed `Running`)
- **Realtime:** `socket.io` `^4.8.4`
- **Auth & Media:** `jsonwebtoken` `^9.0.3`, `bcrypt` `^6.0.0`, `multer` `^2.2.0`, `cloudinary` `^2.10.0`, `streamifier` `^0.1.1`, `nodemailer` `^10.0.12`
- **Scripts:** `dev`, `build` (`tsc`), `start` (`node dist/server.js`). No `test` or `lint` scripts present at baseline.

### Mobile (`mobile/package.json`)
- **Framework:** `react-native` `0.86.0`, `react` `19.2.3`, `typescript` `^5.8.3`
- **Navigation:** `@react-navigation/native` `^7.3.8`, `@react-navigation/bottom-tabs` `^7.20.0`, `@react-navigation/native-stack` `^7.17.10`
- **Maps & Location:** `@maplibre/maplibre-react-native` `11.4.1`, `@react-native-community/geolocation` `^3.4.0`
- **Storage & Auth:** `@react-native-async-storage/async-storage` `^3.1.1`, `react-native-keychain` `^10.0.0`
- **Networking & Media:** `axios` `^1.19.0`, `socket.io-client` `^4.8.4`, `react-native-image-picker` `^8.2.1`
- **UI & Animation:** `react-native-reanimated` `^4.5.1`, `react-native-gesture-handler` `^3.0.2`, `react-native-safe-area-context` `^5.8.0`, `react-native-screens` `^4.26.1`

## 3. Baseline Build, Lint, and Test Results

| Check | Command | Outcome | Details |
|---|---|---|---|
| Server TypeScript Build | `cd server; npm run build` | PASS (exit 0) | Compiled `server/src` to `server/dist` cleanly. |
| Mobile TypeScript Check | `cd mobile; npx tsc --noEmit` | PASS (exit 0) | 0 TypeScript compilation errors. |
| Mobile ESLint (`src/`) | `cd mobile; npx eslint src` | PASS w/ warnings (exit 0) | 0 errors, 116 warnings (mostly `react-native/no-inline-styles` and `react/no-unstable-nested-components` in `AppNavigator.tsx`). |
| Mobile ESLint (`.`) | `cd mobile; npm run lint` | PASS w/ warnings | 0 errors, 131 warnings (includes `mobile/scratch/` scripts). |
| Mobile Jest Suite | `cd mobile; npm test -- --watchAll=false` | FAIL (exit 1) | `No tests found, exiting with code 1` across 301 checked files. |
| Server Test Suite | N/A | NOT PRESENT | No test runner or test files configured in `server/`. |

## 4. Environment & Android Configuration

- `server/.env` exists locally (contents intentionally not read or logged).
- `server/.env.example` exists with keys for `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `SMTP_*`, `PASSWORD_RESET_SECRET`, `CLOUDINARY_*`.
- `mobile/src/config/env.ts` configures `DEV_MODE` (`'physical_device' | 'emulator'`) and `DEV_LAN_IP` (`192.168.0.103`).
- `mobile/android/app/build.gradle` configures `applicationId "com.serpentis.app"`, Hermes enabled, `usesCleartextTraffic: "true"` in debug/release placeholders, and debug keystore signing.
- `mobile/android/app/src/main/AndroidManifest.xml` declares `INTERNET`, `CAMERA`, `ACCESS_FINE_LOCATION`, and `ACCESS_COARSE_LOCATION`.
