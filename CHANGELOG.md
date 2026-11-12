# Changelog

All notable milestones and repository hardening changes for SERPENTIS are recorded here.

## Unreleased — Git Repair, Repository Cleanup & Hygiene Hardening
- Organized technical, release, security, and test documentation under categorized `docs/{architecture,development,deployment,security,testing,git}/` folders with [docs/README.md](docs/README.md).
- Replaced legacy root placeholder README with full SERPENTIS documentation in [README.md](README.md).
- Restored missing tracked `documentation/` files from `HEAD` and untracked accidentally committed `mobile/android/local.properties` and `.kotlin/` cache files without deleting local files.
- Hardened `.gitignore`, added `.gitattributes`, `.editorconfig`, `CONTRIBUTING.md`, `CHANGELOG.md`, and `.github/workflows/ci.yml`.
- Completed full 51-commit Git history secret audit (`0` real production credentials leaked) and recorded findings in `docs/git/`.

## Phase 2 — Release Hardening & Release Candidate 1 (`6fd7619`)
- Added build-time `SerpentisConfigModule` Gradle `BuildConfig` bridge removing dev LAN IP assumptions from production builds, enforcing HTTPS-only release traffic (`usesCleartextTraffic="false"`).
- Separated `signingConfigs.release` cleanly from debug signing and produced unsigned release RC1 APK (`app-release-unsigned.apk`).
- Added Android 13+ `POST_NOTIFICATIONS` manifest permission and once-per-install runtime permission flow.
- Hardened server startup validation (`envValidation.ts`), unified Express + Socket.IO CORS origins, escaped MongoDB search `$regex` inputs, redacted citizen emails/phones on public reports and SOS feeds, and added SOS rate limiting.
- Verified `17/17` server tests, `10/10` mobile Jest tests, `13/13` live MongoDB/Express/Open-Meteo/Socket.IO regression checks, Android `assembleDebug` + `assembleRelease`, and `SERPENTIS_PRES` emulator runtime lifecycle.

## Post-Implementation Audit (`d45d1e5`, `4e98836`)
- Independent backend, CPCB AQI, weather, live Android emulator UI/UX audit and fixes (`Screen.tsx` safe-area insets, `CitySelectorScreen.tsx`, `CityAssistantScreen.tsx`, Open-Meteo `1h` averaging metadata).

## M1–M14 Smart City & Climate Intelligence Evolution (`43c4a43`)
- Added CPCB NAQI calculation engine, Open-Meteo & gated IMD/OpenAQ/CPCB providers, caching, climate alerts, analytics, City Assistant, 10-layer MapLibre smart city map, City Selector, and Smart Hub across 18 technical docs.

## M0 & Baseline Snapshots (`cb5c850`, `1a3aac4`, `fd54ec7`)
- Baseline civic reporting, authentication, community groups, places, SOS, leaderboard, badges, and initial project snapshot.
