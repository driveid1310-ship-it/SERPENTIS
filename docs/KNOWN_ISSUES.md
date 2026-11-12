# SERPENTIS — Known Issues & Technical Debt

Issues discovered during Phase 0 repository audit:

1. **Zero Automated Tests:**
   - `mobile`: `jest` fails with exit code 1 (`No tests found`).
   - `server`: No test script or test suite exists.
2. **Missing Backend Hardening & Health Check:**
   - `server/src/app.ts` has no centralized Express error-handling middleware (errors fall through to Express default HTML/text handler), no `GET /health` endpoint, no rate limiting, and unrestricted `cors()`.
   - `socket.ts` uses `cors: { origin: '*' }`.
3. **Default Map Coordinate Hardcoded to New Delhi:**
   - `mobile/src/config/map.ts` sets `MAP_TEST_INITIAL_COORDINATE` to `[77.209, 28.6139]` (New Delhi) rather than Badlapur (`[73.2355, 19.1668]`) or the active selected city.
4. **Badge Definition Mismatch:**
   - `server/src/utils/badgeUtils.ts` unlocks `'New Contributor'`, `'Active Reporter'`, `'City Guardian'`, `'Community Champion'` and writes them to `User.badges`.
   - `server/src/controllers/userController.ts` (`getMyBadges`) computes a different hardcoded list (`'Contributor'`, `'Active Guardian'`, `'Community Guardian'`, `'City Champion'`) on the fly instead of aligning with `badgeUtils.ts`.
5. **Monochrome Semantic Theme Colors:**
   - `mobile/src/theme/themes.ts` sets `warning`, `error`, and `sos` to `#FFFFFF` in both `futuristic` and `darkTech` themes, which prevents color-coding environmental risk severity or AQI categories unless extended cleanly.
6. **Bug in `ThemeScreen.tsx` / Lint Warnings:**
   - `mobile/src/screens/ThemeScreen.tsx` had an eslint warning context and inline styles; `AppNavigator.tsx` defines tab icons inline inside `MainTabs` causing `react/no-unstable-nested-components` warnings (116 total warnings in `mobile/src`).
7. **Unwired UI Element in `HomeScreen.tsx`:**
   - Line 247 renders `<Text style={styles.viewAll}>View all</Text>` without a `Pressable` handler.
8. **Git Working Tree Dirty & Legacy Directories:**
   - Root contains academic report scripts, `documentation - Copy/`, `mobile-old/`, `mobilebackup/`, `server-old/`, `backend/`, and deleted tracked files under `documentation/` in `git status`. These are left untouched to preserve repository integrity.
9. **No Environmental Intelligence Domain:**
   - No weather, air quality (CPCB National AQI), environmental monitoring (noise/water/green cover/waste), climate risk alerts, historical analytics, AI assistant, or India city-hierarchy models exist yet.
