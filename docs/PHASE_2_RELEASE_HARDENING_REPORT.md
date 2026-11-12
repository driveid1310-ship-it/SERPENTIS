# SERPENTIS — Phase 2 Release Hardening & Release Candidate 1 Report

**Project Root:** `C:\projects\SERPENTIS`  
**Git Branch:** `serpentis-autonomous-development`  
**Baseline Audit Commit:** `d45d1e5`  
**Phase 2 Scope:** End-to-end configuration, Android native release readiness, environmental data provenance & outage resilience, civic regression verification, security hardening, and Release Candidate 1 artifact generation (without adding new product features).

---

## A. Executive Summary

Inspected and hardened the full SERPENTIS stack (`mobile/`, `mobile/android/`, `server/`):
- **Environment & Production Guardrails (`mobile/src/config/env.ts`, `BuildConfig` native bridge, `server/src/config/envValidation.ts`):** Eliminated the hardcoded developer LAN IP fallback in `ENV.production`, implemented `SerpentisConfigModule` (`API_BASE_URL` baked via Gradle at build time), enforced HTTPS-only release builds (`usesCleartextTraffic="false"`), added server startup secret & CORS validation, and unified Express + Socket.IO CORS configuration.
- **Android Native Readiness (`AndroidManifest.xml`, `build.gradle`, `AuthContext.tsx`, `GroupChatScreen.tsx`):** Added `POST_NOTIFICATIONS` permission with a single-prompt runtime utility (`notificationPermission.ts`), separated `signingConfigs.release` cleanly from `signingConfigs.debug` (producing an unsigned RC APK rather than a misleading debug-signed release), preserved offline Keychain sessions across transient startup network failures, disconnected Socket.IO on logout, and added auto-rejoin + disconnect status feedback in group chat. Identified Firebase Cloud Messaging (FCM) push delivery as unimplemented and **BLOCKED** pending Firebase credentials.
- **Security Hardening (`server/src/controllers/`, `sosRoutes.ts`):** Escaped user search inputs (`escapeRegex`) across Reports, Groups, Places, and Public Services to block ReDoS/invalid-regex 500s; redacted citizen `email`/`phone` from citizen-facing `SOS` and public `Report` feeds; added `SOS_TYPES` validation + 15-min rate limiting on `POST /api/sos`; replaced remaining Mongoose 9 `{ new: true }` deprecations with `{ returnDocument: 'after' }`.
- **Verification & Build Artifacts:** Passed `server` build + `17/17` tests, `mobile` `tsc` (`0` errors) + `eslint` (`0` errors, `108` pre-existing warnings) + Jest (`10/10`), `13/13` live MongoDB + Open-Meteo + Socket.IO backend regression checks, clean Android `assembleDebug` (`8m 30s`) + `assembleRelease` (`12m 34s`), and live `SERPENTIS_PRES` (Android 15) runtime + offline cold-start + recovery + `adb logcat` validation (`0` native crashes / `0` unhandled RN runtime errors).

---

## B. Test Results Summary

| Verification Suite / Scenario | Status | Details & Evidence |
| :--- | :--- | :--- |
| Server TypeScript Build (`tsc`) & Test Suite (`tsx --test`) | **PASS** | `17` tests run, `17` passed, `0` failed, `0` skipped (`cpcbAqi`, `environmentalValidation`, `alertsAndCache`, `apiIntegration`, `indiaLocationAndSmartCity`, `securityAndEnv`) |
| Mobile TypeScript (`npx tsc --noEmit`) | **PASS** | `0` errors |
| Mobile ESLint (`npx eslint src`) | **PASS** | `0` errors, `108` warnings (pre-existing `react-native/no-inline-styles`; `0` new warnings introduced) |
| Mobile Jest Suite (`npm test -- --watchAll=false`) | **PASS** | `2` suites passed, `10` tests passed (with RN mocks in `__tests__/mocks/`) |
| Live Environmental & Provider Outage Tests (Badlapur `19.1668, 73.2355`) | **PASS** | Verified live Open-Meteo weather (`33.3°C`, cache hit/miss), modeled AQI (`208 Poor (Modeled Estimate)`, `isOfficialAqi: false`, `station: null`, `1h` periods), unconfigured keyed providers (`isConfigured(): false`), timeout/429 strict error throw (`fallback=false`), malformed fallback markers (`fallback=true`), and `/health` DB disconnect |
| Live Civic Regression & Security Matrix (`verify_phase2_backend.ts`) | **PASS** | `13/13` live integration suites passed (register, login, invalid pwd `401`, expired JWT `401`, `/auth/me` GET/PATCH, OTP bad-code rejection `400`, reports/comments/upvotes, public report email redaction, ReDoS query `200`, Places/Favorites/Reviews, Groups + Socket.IO connect/send/disconnect/reconnect/leave, Notifications CRUD, SOS privacy/validation/RBAC, Admin `403`/`200`) |
| Android Clean & Debug APK Build (`gradlew.bat assembleDebug`) | **PASS** | `BUILD SUCCESSFUL in 8m 30s` (`436` tasks); Note: `clean` and `assembleDebug` must be invoked separately due to RN Reanimated prefab directory ordering |
| Android Unsigned Release APK Build (`gradlew.bat assembleRelease`) | **PASS** | `BUILD SUCCESSFUL in 12m 34s` (`548` tasks), including Hermes release JS bundle and `lintVitalRelease` |
| Emulator `SERPENTIS_PRES` Runtime Walkthrough & Lifecycle | **PASS** | Verified fresh install, Splash -> Login, Android 15 `POST_NOTIFICATIONS` runtime prompt (`Allow`), Home Dashboard, Notifications, Weather, AQI, Alerts, Monitoring, Analytics, AI Assistant (`33.1°C`, AQI `188` daily briefing), Smart Hub, Dashboard, City Selector, MapScreen (Location prompt + MapLibre + `33°C \| AQI 188`), Report, Community, Profile, SOS screen, Background -> Foreground resume, offline API cold-start Keychain session preservation, live recovery (`32.9°C`), and `logcat` (`0` native/RN crashes) |
| Live Official CPCB / OpenAQ / IMD / OpenAI / Gemini / SMTP / Cloudinary | **BLOCKED** | Blocked by absent live third-party API keys & SMTP/Cloudinary secrets in local environment |
| Firebase Cloud Messaging (FCM) Live Push Delivery | **BLOCKED** | Not implemented (`google-services.json`, Firebase project credentials, and server FCM device token endpoint absent) |
| Production Signed Release APK / AAB | **BLOCKED** | Unsigned RC APK built cleanly; final signed APK/AAB blocked pending project owner's release keystore & HTTPS production `SERPENTIS_API_URL` |
| Physical Android Device Runtime Validation | **NOT TESTED** | No physical Android device attached (`adb devices` showed only `SERPENTIS_PRES` emulator) |
| Play Store Signed Release Runtime / `Pixel_7` AVD | **NOT TESTED** | `Pixel_7` AVD previously failed host memory check (`16091 MiB` < `16384 MiB`); unsigned release APK cannot install until signed or deployed |

---

## C. Defects Fixed During Phase 2

| Defect | Root Cause | Change Applied | Test Evidence |
| :--- | :--- | :--- | :--- |
| **Production mobile config pointed to dev LAN IP** (`mobile/src/config/env.ts`) | `ENV.production.API_BASE_URL` aliased `DEV_API_URL` (`192.168.0.103`) | Added Gradle `BuildConfig.API_BASE_URL` + `SerpentisConfigModule.kt` bridge, `validateProductionApiUrl()` HTTPS/non-private guard, Axios request gate, and `App.tsx` error UI | `mobile/__tests__/environment.test.ts` (`10/10`) |
| **Release APK debug-signed & allowed cleartext HTTP** (`mobile/android/app/build.gradle`) | `buildTypes.release` used `signingConfigs.debug` and `usesCleartextTraffic: "true"` | Removed debug signing fallback (uses `keystore.properties` / `SERPENTIS_UPLOAD_*` env vars when present) and set release `usesCleartextTraffic: "false"` | `gradlew.bat assembleRelease` (`app-release-unsigned.apk` compiled) |
| **Missing Android 13+ notification permission flow** (`AndroidManifest.xml`, `notificationPermission.ts`) | Manifest omitted `POST_NOTIFICATIONS`; no runtime permission handling | Added `POST_NOTIFICATIONS` permission, single-prompt `ensureNotificationPermissionOnce()`, and denial recovery card in `NotificationsScreen.tsx` | Verified live `"Allow SERPENTIS to send you notifications?"` prompt once on `SERPENTIS_PRES` + unit tests |
| **Server missing startup secret/CORS checks & Socket.IO wildcard CORS** (`server.ts`, `socket.ts`) | `server.ts` skipped env validation; `socket.ts` hardcoded `origin: '*'` | Created `envValidation.ts` enforcing `MONGO_URI`, non-placeholder `JWT_SECRET` (>=32B in prod), non-`*` `CORS_ORIGIN` in prod, unified CORS helper for Express & Socket.IO | `server/tests/securityAndEnv.test.ts` |
| **Unescaped MongoDB search `$regex` inputs** (`groupController.ts`, `placeController.ts`, `publicServiceController.ts`, `reportController.ts`) | Raw query parameter passed to `$regex` | Added `escapeRegex()` (`server/src/utils/regex.ts`) escaping metacharacters & capping query length to `100` | `securityAndEnv.test.ts` + live `(a+)+$` / `[Badlapur).*` requests returning `200` |
| **Citizen PII leaked via public reports & SOS feed** (`reportController.ts`, `sosController.ts`, `sosRoutes.ts`) | Public reports & citizen SOS queries returned reporter `email`/`phone`; `POST /api/sos` lacked rate limit & enum guard | Redacted reporter `email`/`phone` for non-staff/non-owner callers; added `SOS_TYPES` check + rate limiter (`10/15m`) on `POST /api/sos` | `verify_phase2_backend.ts` verified `email`/`phone === undefined` for citizen callers & `400`/`403`/`200` |
| **Remaining Mongoose 9 `{ new: true }` deprecations** (`authController.ts`, `notificationController.ts`, `placeController.ts`, `publicServiceController.ts`) | Deprecated option emitted warnings | Updated all `findByIdAndUpdate`/`findOneAndUpdate` calls to `{ returnDocument: 'after' }` | Clean server logs across `13/13` live checks |
| **Offline cold start wiped JWT session & logout left socket open** (`AuthContext.tsx`) | Any `getCurrentUser()` error called `clearSession()` | Clear session only on `401`/`403`; cache sanitized profile cleanly across transient network outages; call `disconnectSocket()` on logout | `28_offline_after_timeout.png` preserved `Hello, Phase2` when Express was stopped |
| **Socket.IO chat lost room membership on reconnect** (`GroupChatScreen.tsx`) | No `connect`/`disconnect` listeners or disconnect guard on send | Re-emit `joinGroup` on `connect`, display connection status banner, guard `handleSend` while disconnected | Live Socket.IO connect/send/disconnect/reconnect test + `npm test` |

---

## D. Remaining Blockers

1. **Production Release Keystore & Signing Passwords:** Required to convert `app-release-unsigned.apk` into a Play Store signed APK/AAB.
2. **Production HTTPS API Base URL:** Must be passed via `-PSERPENTIS_API_URL=https://...` during signed release build.
3. **Firebase Cloud Messaging (FCM) Credentials:** `google-services.json`, Firebase SDK integration, and backend device-token registration endpoint are required for background/killed-state OS push notifications.
4. **Live Government/Third-Party & Infrastructure Secrets:** `CPCB` (`DATA_GOV_IN_API_KEY`), `OPENAQ_API_KEY`, `IMD_API_KEY`, `OPENAI_API_KEY`/`GEMINI_API_KEY`, `CLOUDINARY_*`, and SMTP credentials on the server.
5. **Physical Android Device Testing:** Needs a physical USB/Wi-Fi device for sensor/GPS/camera/physical network validation.
6. **Gradle Clean Ordering Note:** Run `gradlew.bat clean` and `gradlew.bat assembleDebug` as separate commands rather than combined in one Gradle invocation to avoid Reanimated's CMake prefab race condition.

---

## E. Release Readiness Verdicts

| Dimension | Verdict | Basis |
| :--- | :--- | :--- |
| **Code Readiness** | **PASS** | Clean TypeScript builds (`server` + `mobile`), `0` ESLint errors, `17/17` server tests & `10/10` mobile tests passing. |
| **Backend Readiness** | **PASS (Core / Local DB)** / **BLOCKED (External Paid/Govt APIs)** | Startup env validation, RBAC, rate limits, regex safety, PII redaction, Express + Socket.IO + MongoDB verified live. |
| **Environmental Data Readiness** | **PASS (Open-Meteo Modeled + CPCB Engine)** / **BLOCKED (Official Station Keys)** | Modeled provenance, `'1h'` periods, CPCB 8-pollutant math, PM/3-pollutant gate, and outage fallbacks verified. |
| **Android Debug Readiness** | **PASS** | `app-debug.apk` built cleanly and verified end-to-end on `SERPENTIS_PRES` (Android 15). |
| **Android Release Readiness** | **PARTIAL / SIGNING BLOCKED** | Unsigned RC APK (`app-release-unsigned.apk`) compiled and linted cleanly with HTTPS-only manifest (`usesCleartextTraffic="false"`), awaiting upload keystore & production `SERPENTIS_API_URL`. |
| **Android Runtime Readiness** | **PASS (Emulator)** / **NOT TESTED (Physical Device & FCM)** | All core UI flows, OS permissions (`POST_NOTIFICATIONS` + Location), MapLibre, lifecycle resume, offline session retention, and recovery verified on `SERPENTIS_PRES` with `0` crashes in logcat. |
| **Security Readiness** | **PASS (Application & Config Controls)** | Hardened API config, CORS, startup secret checks, regex escaping, SOS/report PII redaction, upload MIME/size enforcement, Keychain JWT storage. |
| **Production Deployment Readiness** | **NOT READY / BLOCKED** | Blocked pending upload keystore signing, live HTTPS backend domain, FCM credentials/integration, external provider API keys, and physical-device QA. |

---

## F. Release Candidate & Supporting Artifacts

| Artifact | Path | Size | Verification / SHA-256 |
| :--- | :--- | :--- | :--- |
| **Android Debug APK** | `mobile/android/app/build/outputs/apk/debug/app-debug.apk` | `258,731,542` bytes | `B35317FBDD337D27A8B28227CC5735CE746F34CCC8F0C067827F1591D8609413` |
| **Android Release RC1 APK (Unsigned)** | `mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk` | `127,688,270` bytes | `58FB5DE7A6196DE0E5DB4568495C690F23638174CF64AA5C2A23A575F18C175C` |
| **Baseline Backup Archive (Intact)** | `zip/baseline-pre-autonomous.zip` | `635,113` bytes | Untouched baseline source archive (`mobile`, `server`) |
| **Final Delivery Archive** | `zip/final-autonomous-delivery.zip` | Refreshed post-Phase 2 | Verified excluding `node_modules`, build intermediates, `.env`, keystores, and temporary emulator data |
| **Phase 2 Deliverables (`docs/`)** | `PHASE_2_RELEASE_HARDENING_REPORT.md`, `ENVIRONMENT_CONFIGURATION.md`, `ENVIRONMENTAL_DATA_VALIDATION.md`, `CIVIC_REGRESSION_TESTS.md`, `RELEASE_SECURITY_AUDIT.md`, `ANDROID_RELEASE_GUIDE.md` | — | Committed in Phase 2 release-hardening commit |

---

## G. Git Baseline & Final Repository State

- **Branch:** `serpentis-autonomous-development`
- **Prior Baseline Commits:** `d45d1e5` (Post-Implementation Audit), `4e98836` (Test artifact cleanup), `43c4a43` (M1–M14 Smart City + Climate Platform)
- **Preserved Pre-Existing Workspace Changes:** Uncommitted deletions in `documentation/`, `.gitignore` (`/screens/`), `mobile/android/.kotlin/sessions/*.salive`, and untracked root report/script files were preserved untouched and excluded from Phase 2 commits.
- **Phase 2 Commit:** Recorded cleanly with verified `docs/`, `mobile/`, and `server/` hardening changes only (excluding build outputs, keystores, and secrets).
