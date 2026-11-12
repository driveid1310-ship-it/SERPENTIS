# SERPENTIS — Civic Feature Regression Matrix (Phase 2)

All live tests were executed against local MongoDB (`127.0.0.1:27017`) and Express + Socket.IO using isolated test accounts (`p2_citizen_*@serpentis.test`, `p2_mod_*@serpentis.test`) that were deleted after completion. No real public complaints or live emergency dispatches were triggered.

| Domain | Scenario | Expected Result | Actual Result | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | Register new user | `201 Created` + JWT + sanitized user | `201 Created` with user & JWT | **PASS** | `verify_phase2_backend.ts` |
| **Auth** | Login valid credentials | `200 OK` + valid JWT | `200 OK` | **PASS** | `verify_phase2_backend.ts` |
| **Auth** | Invalid password | `401 Unauthorized` | `401` (`Invalid email or password.`) | **PASS** | `verify_phase2_backend.ts` |
| **Auth** | Session verify (`GET /api/auth/me`) & expired JWT | `200 OK` valid / `401` expired | `200` valid / `401` (`expired`) | **PASS** | `securityAndEnv.test.ts` & `verify_phase2_backend.ts` |
| **Auth** | Profile update (`PATCH /api/auth/me`) | `200 OK` updating `fullName` | `200 OK` | **PASS** | `verify_phase2_backend.ts` |
| **Auth** | OTP verification (`POST /api/auth/verify-reset-otp` invalid) | `400`/`503` clean rejection | Returned `400` cleanly | **PASS** | `verify_phase2_backend.ts` |
| **Auth** | Forgot-password live email delivery (SMTP) | Deliver 6-digit OTP email | Live SMTP credentials not configured | **BLOCKED** | Missing live SMTP server in test env |
| **Auth (Mobile)** | Offline cold start with stored JWT | Retain Keychain JWT + cached profile on network failure; clear only on `401`/`403` | Implemented & tested in `AuthContext.tsx`; verified in emulator offline test | **PASS** | `AuthContext.tsx` & emulator run |
| **Reports** | Create civic & environmental reports | `201 Created` persisted in MongoDB | `201 Created` | **PASS** | `verify_phase2_backend.ts` |
| **Reports** | Public report list & search PII redaction | Strip `email` for unauthenticated/other citizens | `reportedBy.email === undefined` | **PASS** | `verify_phase2_backend.ts` |
| **Reports** | Regex search ReDoS safety (`(a+)+$`) | Escaped cleanly, `200 OK` | `200 OK` (no regex error/hang) | **PASS** | `verify_phase2_backend.ts` & `securityAndEnv.test.ts` |
| **Reports** | Invalid MIME upload (`text/plain`) | `415 Unsupported Media Type` | `415` (`Only JPEG, PNG, and WebP...`) | **PASS** | `securityAndEnv.test.ts` |
| **Reports** | Valid image upload to Cloudinary | Store URL via Cloudinary API | Live Cloudinary test credentials not invoked | **BLOCKED** | Cloudinary test upload blocked without live secret |
| **Reports** | Comments & Upvotes | Persist comment (`201`) & upvote (`200`) | `201` & `200` | **PASS** | `verify_phase2_backend.ts` |
| **Reports** | Moderator status transition (`PATCH /reports/:id/status`) | `403` for citizen, `200` for moderator | `403` citizen / `200` moderator | **PASS** | `verify_phase2_backend.ts` |
| **Community** | Group create, list, ReDoS search, non-member message guard | `201` create, `200` search, `403` non-member messages | `201`, `200`, `403` | **PASS** | `verify_phase2_backend.ts` |
| **Community** | Join group, Socket.IO connect/send/disconnect/reconnect, history, leave | Real-time delivery + history fetch + clean leave | All assertions passed | **PASS** | `verify_phase2_backend.ts` |
| **Places** | Search, Favorite add/remove, Review create | `200` search/fav toggle, `201` review | All assertions passed | **PASS** | `verify_phase2_backend.ts` |
| **Notifications** | List, mark read, mark all read, delete | `200 OK` state transitions | All 4 calls returned `200` | **PASS** | `verify_phase2_backend.ts` |
| **Notifications** | Android 13+ `POST_NOTIFICATIONS` permission flow | Prompt at most once automatically; manual retry if denied | Verified via `environment.test.ts` & Android manifest | **PASS** | `notificationPermission.ts` |
| **Notifications** | Firebase Cloud Messaging (FCM) push delivery | Register device token & receive background push | No `@react-native-firebase/*`, `google-services.json`, or backend token API | **BLOCKED** | Missing Firebase config/credentials |
| **User Stats** | Leaderboard, My Contributions, My Badges | `200 OK` with accurate user counts | All 3 returned `200 OK` | **PASS** | `verify_phase2_backend.ts` |
| **SOS** | Invalid type guard, create, citizen PII redaction, moderator resolve | `400` invalid type, `email`/`phone` stripped for citizens, `403` citizen / `200` mod resolve | All assertions passed | **PASS** | `verify_phase2_backend.ts` |
| **Admin** | `GET /api/admin/dashboard` RBAC | `403` citizen / `200` moderator/admin | `403` citizen / `200` moderator | **PASS** | `verify_phase2_backend.ts` |
