# SERPENTIS — Release Security Audit (Phase 2)

**Audit Scope:** `server/src/`, `mobile/src/`, `mobile/android/`  
**Outcome:** Critical hardening gaps identified and fixed; automated security tests added in `server/tests/securityAndEnv.test.ts`.

---

## 1. Findings & Verified Remediations

| Area | Severity Before Fix | Finding | Remediation Applied | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Production API Routing** | **HIGH** | `mobile/src/config/env.ts` pointed `ENV.production` to `DEV_API_URL` (`http://192.168.0.103:5000/api`) | Replaced with native Gradle `BuildConfig.API_BASE_URL` bridge + `validateProductionApiUrl()` rejecting HTTP, localhost, `10.0.2.2`, and RFC1918 IPs | **FIXED (`PASS`)** |
| **Android Cleartext Traffic & Release Signing** | **HIGH** | `mobile/android/app/build.gradle` enabled `usesCleartextTraffic: "true"` and `signingConfig signingConfigs.debug` for `release` builds | Switched release `usesCleartextTraffic` to `"false"`; removed debug signing fallback from `release` (requires `keystore.properties` / `SERPENTIS_UPLOAD_*` env vars) | **FIXED (`PASS`)** |
| **Server Startup Env Validation & Socket CORS** | **HIGH** | `server.ts` did not validate production secrets/CORS at boot; `socket.ts` hardcoded `origin: '*'` | Added `envValidation.ts` refusing weak/placeholder `JWT_SECRET` or `CORS_ORIGIN='*'` in `production`; unified Express + Socket.IO CORS via `getCorsOrigins()` | **FIXED (`PASS`)** |
| **SOS Citizen PII Exposure & Abuse Controls** | **MEDIUM** | `getAllSOS`/`getNearbySOS` exposed reporter `email` & `phone` to all logged-in citizens and lacked `POST /api/sos` rate limiting or enum check | Redacted reporter `email`/`phone` for non-staff/non-owner callers; added `SOS_TYPES` validation + 15-min rate limiter on `POST /api/sos` | **FIXED (`PASS`)** |
| **Public Report Email Exposure** | **MEDIUM** | Unauthenticated `GET /api/reports` & `/search` included `reportedBy.email` on non-anonymous reports | `sanitizeReportForViewer` strips `reportedBy.email` unless caller is the author or `moderator`/`admin` | **FIXED (`PASS`)** |
| **Unescaped MongoDB Search `$regex` (ReDoS / 500)** | **MEDIUM** | `groupController`, `placeController`, `publicServiceController`, `reportController` passed raw user query strings directly into `$regex` | Added `escapeRegex()` (`maxLength = 100`) across all 4 search controllers | **FIXED (`PASS`)** |

---

## 2. Verified Existing Security Controls

| Control | Verification Result | Implementation Details |
| :--- | :--- | :--- |
| **JWT Verification & Expiry** | **PASS** | `authMiddleware.ts` verifies `Bearer` token via `jwt.verify`, handles `TokenExpiredError` (`401`), requires `JWT_SECRET` |
| **Password Hashing** | **PASS** | `User.ts` hashes passwords with `bcrypt`; `authController.ts` compares via `bcrypt.compare` |
| **Password Reset OTP & Timing Attack Safety** | **PASS** | `passwordResetService.ts` enforces >=32-byte `PASSWORD_RESET_SECRET`, `randomInt` OTP, HMAC-SHA256 + `timingSafeEqual`, max 5 OTP attempts, email & IP rate windows |
| **File Upload Limits & MIME Filtering** | **PASS** | `uploadMiddleware.ts` enforces memory storage, max 1 file, `5 MB` limit (`413`), and strict `image/jpeg` / `image/png` / `image/webp` check (`415`) |
| **Security Response Headers & JSON Limit** | **PASS** | `app.ts` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, and `express.json({ limit: '1mb' })` |
| **Mobile Token Storage** | **PASS** | JWT stored in Android Keystore via `react-native-keychain` (`storage.ts`), never `AsyncStorage`; Socket.IO disconnected on logout |
| **Secret & Credential Hygiene** | **PASS** | Zero private keys, signing passwords, or server API keys in `mobile/src` or tracked git history; `mobile/android/.gitignore` excludes keystores & `google-services.json` |
| **RBAC Enforcement** | **PASS** | `adminMiddleware` & `authorizeRoles('moderator', 'admin')` verified returning `403` to citizens across `/admin`, `/reports/:id/status`, and `/sos/:id` |

---

## 3. Security Notes / Residual Production Tasks
- In-memory rate limiting (`rateLimitMiddleware.ts`) protects single-instance deployments; horizontal multi-node scaling will require a shared store (e.g., Redis) in a future infrastructure phase.
- Run `npm audit` against CI registry before Play Store production rollout when network security scanning is scheduled.
