# SERPENTIS — Environment & Configuration Strategy (Phase 2 Hardening)

**Applies to:** Mobile App (`mobile/`) & Backend Server (`server/`)  
**Git Baseline:** `serpentis-autonomous-development`

---

## 1. Configuration Targets & Behavior

| Mode | API Base URL Resolution | Cleartext HTTP | Security / Startup Validation |
| :--- | :--- | :--- | :--- |
| **Android Emulator (`__DEV__`)** | `http://10.0.2.2:5000/api` (default `DEV_TARGET = 'emulator'` in `mobile/src/config/env.ts`) or `http://localhost:5000/api` via `adb reverse` + `-PSERPENTIS_API_URL` | Allowed (`debug` manifest placeholder `usesCleartextTraffic="true"`) | Resolves cleanly without touching developer LAN IP |
| **Physical Android Device (`__DEV__`)** | Local build override `-PSERPENTIS_API_URL=http://<LAN_IP>:5000/api` (preferred) or temporary `DEV_TARGET = 'physical_device'` + local `DEV_LAN_HOST` | Allowed in `debug` build type only | Rejects placeholder `'YOUR_LOCAL_LAN_IP'` with an explicit `ENV_CONFIG_ERROR` |
| **Production Android (`release`)** | Gradle build-time `SERPENTIS_API_URL` / `SERPENTIS_API_BASE_URL` -> `BuildConfig.API_BASE_URL` -> bridged via `SerpentisConfigModule` | Blocked (`release` manifest placeholder `usesCleartextTraffic="false"`) | Rejects empty URL, `http://`, `localhost`, `10.0.2.2`, `127.0.0.1`, `192.168.*`, `10.*`, `172.16-31.*` |
| **Local Backend (`NODE_ENV=development`)** | `server/.env` (`PORT`, `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN=*`) | HTTP on `localhost` | Requires `MONGO_URI` and `JWT_SECRET`; logs config warnings cleanly |
| **Production Backend (`NODE_ENV=production`)** | Host/container environment variables (no `.env` committed) | Behind HTTPS reverse proxy/TLS termination | `assertValidServerEnvironment()` refuses missing `MONGO_URI`, weak/placeholder/short (<32 byte) `JWT_SECRET`, or `CORS_ORIGIN=*`/empty |

---

## 2. Mobile Build-Time Configuration Bridge

Previously, `mobile/src/config/env.ts` hardcoded `DEV_LAN_IP = '192.168.0.103'` and assigned `ENV.production.API_BASE_URL = DEV_API_URL`.

Phase 2 replaces this with a zero-dependency native configuration bridge:
1. **`mobile/android/app/build.gradle`**:
   - Enables `buildFeatures { buildConfig true }`.
   - Reads `SERPENTIS_API_URL` Gradle property or `SERPENTIS_API_BASE_URL` / `SERPENTIS_API_URL` environment variable into `BuildConfig.API_BASE_URL`.
   - Enforces `usesCleartextTraffic: "false"` in `buildTypes.release`.
2. **`SerpentisConfigModule.kt` & `SerpentisConfigPackage.kt`**:
   - Exposes `NativeModules.SerpentisConfig` (`API_BASE_URL`, `BUILD_TYPE`, `IS_DEBUG`) synchronously via `getConstants()`.
3. **`mobile/src/config/env.ts` + `mobile/src/config/axios.ts` + `mobile/App.tsx`**:
   - `validateProductionApiUrl()` enforces `https:` and blocks private/local hosts when `!__DEV__`.
   - If a release build lacks a valid HTTPS `API_BASE_URL`, `ENV_CONFIG_ERROR` is set, Axios rejects requests before sending network traffic, and `App.tsx` displays `"SERPENTIS Configuration Required"` rather than silently calling a developer machine.

### Supplying Production URL at Release Build Time
```powershell
cd mobile\android
.\gradlew.bat assembleRelease -PSERPENTIS_API_URL=https://api.serpentis.example.com/api
```

---

## 3. Server Startup Environment Validation (`server/src/config/envValidation.ts`)

Called via `assertValidServerEnvironment()` in `server/src/server.ts` before `connectDB()`:
- **Hard failures (throw at startup):**
  - Missing `MONGO_URI`
  - Missing `JWT_SECRET`
  - In `NODE_ENV=production`: `JWT_SECRET` shorter than 32 bytes or matching known placeholders (`replace_with_*`, `changeme`, `secret`, `your_jwt_secret`, `serpentis-secret`)
  - In `NODE_ENV=production`: `CORS_ORIGIN` empty or `'*'` (applied uniformly to both Express in `app.ts` and Socket.IO in `socket.ts` via `getCorsOrigins()`)
- **Non-fatal warnings:**
  - Missing/short `PASSWORD_RESET_SECRET` (OTP password reset endpoints fail closed with HTTP `503`)
  - Missing SMTP credentials or Cloudinary credentials in production
  - `ENVIRONMENTAL_ALLOW_MOCK_FALLBACK=true` enabled in production
  - Production `MONGO_URI` pointing to `localhost` / `127.0.0.1`

---

## 4. Credential Inventory for Live Production (Never Bundled in Mobile)

All external API keys reside strictly on the Node.js server (`server/.env` / platform secret manager):
- **Core Auth & DB:** `MONGO_URI`, `JWT_SECRET`, `PASSWORD_RESET_SECRET`, `CORS_ORIGIN`
- **SMTP Email:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
- **Cloudinary Media:** `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Environmental Feeds:** `DATA_GOV_IN_API_KEY`, `OPENAQ_API_KEY`, `IMD_API_KEY`, `IMD_JWT_TOKEN`
- **AI Assistant (optional):** `AI_PROVIDER`, `OPENAI_API_KEY` / `GEMINI_API_KEY`
