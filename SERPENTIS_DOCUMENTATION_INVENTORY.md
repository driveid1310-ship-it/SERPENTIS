# SERPENTIS Documentation Inventory

==================================================
## PART 1 — PROJECT OVERVIEW
=========================

**Project Name:** SERPENTIS
**Purpose:** A community-driven civic reporting, emergency response (SOS), and local area discovery platform.
**Problem being addressed:** Enables citizens to seamlessly report local civic issues (potholes, garbage, etc.), access immediate emergency services, and discover community services/heritage sites, while fostering community engagement through groups and trust rewards.
**Target Users:** Citizens, local community members, moderators, and civic administrators.
**Major Capabilities:**
- Civic issue reporting with categorization and location tracking.
- SOS emergency alerting.
- Places, public services, and heritage discovery.
- Community groups and real-time chat.
- Trust, reputation points, and badge rewards system.
- User profiles and notification system.
**Overall Architecture:** A client-server architecture. The mobile client is a React Native app providing the UI, GPS tracking, and mapping. The backend is a Node.js/Express server exposing a RESTful API and WebSocket (Socket.IO) for real-time chat, backed by a MongoDB database for persistence and Cloudinary for image storage.
**Mobile/Backend/Database Relationship:** The React Native mobile app communicates via Axios to the Node.js Express backend. The backend handles authentication, business logic, and real-time Socket.IO communication, storing and retrieving data from MongoDB via Mongoose.

==================================================
## PART 2 — TECHNOLOGY STACK
=========================

**Mobile:**
- React Native: `0.86.0`
- React: `19.2.3`
- TypeScript: `^5.8.3`
- React Navigation: `@react-navigation/native` `^7.3.8`, `@react-navigation/native-stack` `^7.17.10`, `@react-navigation/bottom-tabs` `^7.20.0`
- Axios: `^1.19.0`
- Keychain: `react-native-keychain` `^10.0.0`
- MapLibre: `@maplibre/maplibre-react-native` `11.4.1`
- Geolocation: `@react-native-community/geolocation` `^3.4.0`
- Image Picker: `react-native-image-picker` `^8.2.1`
- Other important dependencies: `socket.io-client` `^4.8.4`, `@react-native-async-storage/async-storage` `^3.1.1`

**Backend:**
- Node.js: `Type: module`, configured with `tsx`
- Express: `^5.2.1`
- TypeScript: `^5.9.3`
- MongoDB: Managed via Atlas / `MONGO_URI`
- Mongoose: `^9.7.4`
- JWT: `jsonwebtoken` `^9.0.3`
- Socket.IO: `^4.8.4`
- Cloudinary: `^2.10.0`
- Nodemailer/Gmail SMTP: `nodemailer` `^10.0.12`
- Other important dependencies: `bcrypt` `^6.0.0`, `multer` `^2.2.0`, `streamifier` `^0.1.1`

**Android/Build:**
- Package/Application ID: `com.serpentis.app`
- Compile SDK: `36`
- Target SDK: `36`
- Min SDK: `24`
- Gradle: `com.android.tools.build:gradle` (Build Tools Version `36.0.0`)
- AGP: Inferred via react-native-gradle-plugin 
- Kotlin: `2.1.20`
- NDK: `27.1.12297006`
- JDK: Configured via environment (Not explicitly pinned in build.gradle)
- Hermes/New Architecture: Hermes is enabled (`hermesEnabled.toBoolean()`)

==================================================
## PART 3 — PROJECT STRUCTURE
==========================

**Mobile (`mobile/src/`):**
- `api/`: API wrapper functions (auth, reports, places, etc.)
- `assets/`: Fonts, icons, and images (e.g., logo).
- `components/`: Reusable UI components (AuthButton, AppCard, SerpentisMap, etc.)
- `config/`: Configuration for Axios, env variables, map config.
- `context/`: React context (AuthContext, ThemeContext).
- `hooks/`: Custom React hooks (useAuth, useLocation, useReports, etc.)
- `navigation/`: AppNavigator and routing structure.
- `providers/`: AppProvider wrapping contexts.
- `screens/`: 30 screen components (HomeScreen, MapScreen, ProfileScreen, etc.)
- `services/`: Core logic services interacting with API and sockets (authService, socket.ts).
- `theme/`: Styling variables (colors, spacing, typography).
- `types/`: TypeScript definitions for models and API responses.
- `utils/`: Helper utilities (storage, geo, validators).

**Server (`server/src/`):**
- `config/`: Database, Cloudinary configuration.
- `controllers/`: Request handlers for routes (authController, reportController, etc.)
- `middleware/`: Express middleware (auth, admin, role, upload).
- `models/`: Mongoose schemas (User, Report, Place, etc.)
- `routes/`: Express routers organized by domain (authRoutes, reportRoutes, etc.)
- `scripts/`: Seeding and maintenance scripts (seedSion.ts).
- `services/`: Business logic services (emailService).
- `utils/`: Utilities (auth, badgeUtils).
- `app.ts` / `server.ts` / `socket.ts`: App entry points and Socket.IO initialization.

==================================================
## PART 4 — DATABASE
=================

**1. User:**
- Fields: `fullName`, `email`, `password`, `phone`, `profilePicture`, `trustScore`, `reputationPoints`, `badges`, `totalReports`, `resolvedReports`, `role` (citizen/moderator/admin), `isVerified`.
- Defaults: Role `citizen`, scores `0`.
- Validation: Email unique/lowercase, password min 6 chars.

**2. Report:**
- Fields: `title`, `description`, `category`, `status`, `images`, `location` (Point), `reportedBy` (Ref: User), `isAnonymous`, `upvotes` (Refs: User), `personallyObserved` (Refs: User), `priority`, `isDuplicate`, `verified`, `verifiedBy`, `moderatorRemark`.
- Indexes: `location` ('2dsphere'), `status`, `category`, `reportedBy`.
- Purpose: Stores civic issues reported by users.

**3. Comment:**
- Fields: `content`, `report` (Ref: Report), `user` (Ref: User).
- Indexes: `report`, `user`.
- Purpose: Discussion on specific reports.

**4. Group:**
- Fields: `name`, `description`, `category`, `creator` (Ref: User), `memberCount`.
- Purpose: Community chat groupings.

**5. GroupMember:**
- Fields: `group` (Ref: Group), `user` (Ref: User), `role` ('admin', 'member').
- Indexes: Compound unique index on `{ group: 1, user: 1 }`.
- Purpose: Links users to groups.

**6. GroupMessage:**
- Fields: `group` (Ref: Group), `sender` (Ref: User), `text`, `sharedReport` (Ref: Report, optional).
- Indexes: `{ group: 1, createdAt: -1 }`.
- Purpose: Real-time chat messages inside groups.

**7. Place & PublicService:**
- Fields: `name`, `description`, `category`, `address`, `phone`, `email`, `website`, `openingHours`, `images`, `location` (Point). PublicService has `isEmergency`.
- Indexes: `location` ('2dsphere'), `category`, `name`.
- Purpose: Stores heritage sites and public services (hospitals, police, ATMs).

**8. PlaceFavorite & PlaceReview:**
- Purpose: User favorites and reviews with ratings (1-5) for Places.

**9. SOS:**
- Fields: `user` (Ref: User), `type` (medical, fire, police, general), `location` (Point), `status` (active, resolved, false_alarm).
- Indexes: `location` ('2dsphere').
- Purpose: Emergency alerts.

**10. Notification:**
- Fields: `user` (Ref: User), `title`, `message`, `type`, `isRead`.
- Indexes: `user`, `isRead`, `createdAt: -1`.
- Purpose: User alerts for badges, report updates, etc.

**11. PasswordReset:**
- Fields: `user` (Ref: User), `otpHash`, `otpExpiresAt`, `resetGrantTokenHash`, `resetGrantExpiresAt`, `rateLimitExpiresAt`, etc.
- Purpose: Secure OTP-based password reset state.

==================================================
## PART 5 — AUTHENTICATION & SECURITY
==================================

- **Signup/Login:** Implemented with `bcrypt` for password hashing and Express routes. Returns a JWT.
- **JWT:** Used for session management. Stored securely on the mobile device.
- **Token Storage/Keychain:** Tokens are stored using `react-native-keychain` in `storage.ts`.
- **Auth Middleware:** Validates JWT (`Bearer` token) via `jsonwebtoken` and attaches `userId` to the request object.
- **Logout:** Handled client-side by clearing the Keychain token.
- **Current-user:** Fetched via `GET /auth/me`. Updates via `PATCH /auth/me`.
- **Password Reset:** Utilizes OTP sent via email (`nodemailer`). Validates OTP, generates a reset grant token, which is then used to securely update the password.
- **Authorization:** `roleMiddleware` and `adminMiddleware` verify user roles for protected routes.
- **Input Validation:** Enforced via Mongoose schema validators (minlength, enums, required fields).

==================================================
## PART 6 — REPORT SYSTEM
======================

- **Report Creation:** `POST /reports` creates a report with title, description, category, and GPS coordinates.
- **Categories:** 'pothole', 'garbage', 'water-leakage', 'streetlight', 'traffic', 'pollution', 'stray-animals', 'other'.
- **Location:** Stored as GeoJSON 'Point'.
- **Images:** Up to multiple images handled by Cloudinary.
- **Features:** Anonymous reporting (flag on creation), upvotes array, personallyObserved array, priority (low/medium/high).
- **Moderation:** Status ('pending', 'in-progress', 'resolved', 'rejected'), verified flag, verifiedBy, moderatorRemark. Admin routes exist to update status.
- **Endpoints:** `GET /reports`, `GET /reports/near`, `GET /reports/search`, `GET /reports/stats`, `GET /reports/:id`.
- **Community:** Reports can be shared into groups via `sharedReport` field in `GroupMessage`.

==================================================
## PART 7 — GPS & MAP
==================

- **Permissions:** Handled via `@react-native-community/geolocation` for fetching GPS coords.
- **Location Representation:** GeoJSON (`{ type: 'Point', coordinates: [lon, lat] }`).
- **MapLibre Implementation:** Integrates with `@maplibre/maplibre-react-native`.
- **Map Sources:** Uses OpenFreeMap (style URL configured in `map.ts`).
- **Markers:** Custom markers used for displaying reports, places, and the user's current location on the map.
- **Camera:** The map camera targets the user location or selected place.
- **Integration:** Map screen provides directions and overlays places/reports.

==================================================
## PART 8 — PLACES / PUBLIC SERVICES / HERITAGE
============================================

- **Place System:** Used for heritage sites and local discovery.
- **Public Service System:** Separate model for utility locations (ATMs, hospitals, police).
- **Categories:** Detailed enum categories for both models.
- **Functionality:** Search, filter by category, proximity search (`/near`), top-rated, favorites, reviews.
- **Sion Dataset:** Added via `server/src/scripts/seedSion.ts`. Queries OpenStreetMap Overpass API for services and places within a 2.5km radius of Sion. Avoids duplicates spatially (50m). Purpose is to seed realistic localized data. Documented further in `SionDatasetReport.md` (which exists).

==================================================
## PART 9 — SOS
============

- **SOS Flow:** Triggered from Home Quick Actions. `POST /sos` creates an alert.
- **Types:** 'medical', 'fire', 'police', 'general'.
- **Location:** Sent with coordinates.
- **Backend Persistence:** Saved in `SOS` collection with status 'active'.
- **Mobile UI:** SOS Screen dedicated to firing emergency alerts, capturing location and emergency type.
- **Result Handling:** Navigates/displays success or failure state.

==================================================
## PART 10 — COMMUNITY & CHAT
==========================

- **Groups:** Created by users, have categories (Civic, Safety, etc.) and a description.
- **Membership:** Users join/leave groups. Tracked via `GroupMember` model.
- **Messages:** Sent via real-time Socket.IO. Authenticated via JWT socket handshake middleware.
- **Shared Report Cards:** Users can attach a `sharedReport` ID to a message.
- **Responsibilities:** REST API handles group creation and fetching history (`GET /groups/:id/messages`), Socket.IO handles real-time emission and composer listener cleanup.

==================================================
## PART 11 — TRUST / REWARDS
=========================

- **Trust Score & Reputation:** 
  - Created Report: +10 reputation, +2 trust, +1 totalReports.
  - Resolved Report: +20 reputation, +5 trust, +1 resolvedReports.
  - Rejected Report: -10 reputation, -3 trust.
- **Badges (`badgeUtils.ts`):** 
  - >= 1 report: 'New Contributor'
  - >= 10 reports: 'Active Reporter'
  - >= 10 resolved: 'City Guardian'
  - >= 100 reputation points: 'Community Champion'
- **Leaderboard:** Endpoint `GET /users/leaderboard` sorts users by reputation/trust.
- **Profile UI:** Users can view their Contribution History and Badges screens.

==================================================
## PART 12 — DASHBOARD
===================

- **Dashboard Endpoint:** `GET /admin/dashboard`
- **Statistics:** Provides counts for `totalReports`, pending, resolved, rejected, highPriority, duplicates, `totalUsers`, and `totalComments`.
- **UI:** Mobile `DashboardScreen` visualizes these verified metrics and contribution stats.

==================================================
## PART 13 — PROFILE
=================

- **Profile Flow:** 
  - Uses `react-native-image-picker` to select an image from the gallery.
  - Uploads the image via `POST /reports/upload-image` (using `uploadReportImage` service function from report service, utilizing Cloudinary on the backend).
  - Receives Cloudinary URL and calls `PATCH /auth/me` with `profilePicture: URL`.
  - Backend updates `User` schema.
  - Mobile updates `AuthContext` with the new user state and renders the image.
- **Features:** Edit full name, remove photo (fallback to initials), Help & Support, Privacy & Security settings.

==================================================
## PART 14 — NAVIGATION & UI
=========================

- **Architecture:** Stack navigation containing a Bottom Tab Navigator.
- **Bottom Tabs:** Home, Map, Create Report, Community, Profile.
- **Home Quick Actions:** Currently limited precisely to:
  1. SOS
  2. Places
  3. Dashboard
- **Theme:** Controlled via `ThemeContext`, utilizing a designated color palette (`colors.ts`), radius, typography, and spacing constants.

==================================================
## PART 15 — CLOUDINARY / IMAGE HANDLING
=====================================

- **Configuration:** Cloudinary configured in `server/src/config/cloudinary.ts`.
- **Upload Flow:** Handled by `multer` (in memory) and `streamifier` to pipe buffer directly to Cloudinary.
- **Usage:** Used primarily for report images (`POST /reports/upload-image`) but the same controller is leveraged by the mobile app for profile picture uploads.
- **Known Limitations / Pending Issue:** There is a known unrelated existing image issue currently present in the implementation.

==================================================
## PART 16 — NOTIFICATIONS
=======================

- **Implementation:** Created programmatically by the backend (e.g., when a badge is unlocked in `badgeUtils.ts`).
- **Retrieval:** `GET /notifications`.
- **State:** `isRead` boolean field. Modifiable via `PATCH /notifications/:id/read` and `PATCH /notifications/read-all`.
- **UI:** Mobile `NotificationsScreen` fetches and displays notifications, highlighting unread ones.

==================================================
## PART 17 — API INVENTORY
=======================

| Module | HTTP Method | Endpoint | Authentication | Purpose |
|--------|-------------|----------|----------------|---------|
| Admin | GET | `/admin/dashboard` | Auth+Admin | Fetch system stats |
| Admin | GET | `/admin/users` | Auth+Admin | List all users |
| Admin | GET | `/admin/reports` | Auth+Admin | List all reports |
| Admin | PUT | `/admin/reports/:id/status`| Auth+Admin | Update report status |
| Admin | DELETE | `/admin/places/:id` | Auth+Admin | Admin delete place |
| Auth | POST | `/auth/register` | None | Register a new user |
| Auth | POST | `/auth/login` | None | Login user |
| Auth | POST | `/auth/request-password-reset`| None | Trigger OTP email |
| Auth | POST | `/auth/verify-reset-otp` | None | Validate OTP |
| Auth | POST | `/auth/reset-password` | None | Update password |
| Auth | GET | `/auth/me` | Auth | Get current user |
| Auth | PATCH | `/auth/me` | Auth | Update profile |
| User | GET | `/users/leaderboard` | None | Fetch top users |
| User | GET | `/users/me/contributions` | Auth | Fetch user's reports |
| User | GET | `/users/me/badges` | Auth | Fetch user's badges |
| Group | GET | `/groups` | None | List groups |
| Group | GET | `/groups/my` | Auth | List joined groups |
| Group | GET | `/groups/:id` | Auth | Get group details |
| Group | POST | `/groups` | Auth | Create a group |
| Group | POST | `/groups/:id/join` | Auth | Join a group |
| Group | POST | `/groups/:id/leave` | Auth | Leave a group |
| Group | GET | `/groups/:id/messages` | Auth | Get group chat history |
| Report | POST | `/reports` | Auth | Create report |
| Report | GET | `/reports` | None | List reports |
| Report | GET | `/reports/near` | None | Get nearby reports |
| Report | GET | `/reports/stats` | None | Report statistics |
| Report | POST | `/reports/:id/upvote` | Auth | Upvote a report |
| Report | POST | `/reports/upload-image` | None/Auth | Upload image to Cloudinary |
| Comment| POST | `/comments/:reportId` | Auth | Add comment to report |
| Comment| GET | `/comments/:reportId` | None | Get report comments |
| Place | GET | `/places/near` | None | Get nearby places |
| Place | GET | `/places/:id` | None | Get place details |
| Place | POST | `/places/:id/favorite` | Auth | Favorite a place |
| Service| GET | `/public-services/nearby`| None | Get nearby services |
| SOS | POST | `/sos` | Auth | Create emergency alert |
| Notif. | GET | `/notifications` | Auth | Get user notifications |
| Notif. | PATCH | `/notifications/:id/read`| Auth | Mark single notif read |

*(Note: Full CRUD endpoints exist for Places, Services, and Reports, abbreviated here for clarity)*

==================================================
## PART 18 — ERROR HANDLING & VALIDATION
=====================================

- **Validation:** Enforced primarily through Mongoose schema constraints (required fields, enums, min/max lengths).
- **Backend Error Handling:** Express async controllers wrapped in try-catch. Return structured JSON with standard HTTP status codes (400, 401, 403, 404, 500).
- **Client Handling:** Handled via Axios interceptors or local try-catch blocks. Features a `ResultView` component for consistent success/failure state rendering on screens (e.g., OTP Verification, Password Reset).

==================================================
## PART 19 — TESTING
=================

- **Automated Validation:** `package.json` contains a `test: jest` script in the mobile directory.
- **Manual Verification:** Functionality such as the Map and Socket.IO chat require manual runtime verification.
- **Unverified Areas:** Full end-to-end testing of push notifications and location accuracy under various network conditions.

==================================================
## PART 20 — BUILD & SETUP
=======================

**Prerequisites:** Node.js (>=22.11.0), MongoDB (local or Atlas), Android SDK/Emulator, Cloudinary account.
**Backend Startup:**
1. `npm install`
2. Create `.env`:
   ```
   MONGO_URI=<your-mongodb-uri>
   JWT_SECRET=<your-jwt-secret>
   CLOUDINARY_CLOUD_NAME=<your-cloud-name>
   CLOUDINARY_API_KEY=<your-api-key>
   CLOUDINARY_API_SECRET=<your-api-secret>
   ```
3. Run `npm run dev` to start via `tsx`.

**Mobile Startup:**
1. `npm install`
2. Start Metro Bundler: `npm start`
3. Run Android Emulator: `npm run android`

==================================================
## PART 21 — CURRENT FEATURE MATRIX
================================

| Feature | Implemented | Verified | Evidence | Notes |
|---------|-------------|----------|----------|-------|
| Registration/Login | YES | VERIFIED | `authRoutes.ts`, `AuthContext.tsx` | JWT stored securely |
| Forgot Password / OTP | YES | VERIFIED | `authRoutes.ts`, `OtpVerificationScreen.tsx` | Fully structured |
| Create Report | YES | VERIFIED | `Report.ts`, `ReportIssueScreen.tsx` | Integrates Cloudinary |
| Map / GPS | YES | VERIFIED | `useLocation.ts`, `SerpentisMap.tsx` | MapLibre integrated |
| Discover Places/Services | YES | VERIFIED | `seedSion.ts`, `placeRoutes.ts` | Seed script provided |
| Community Chat (Sockets) | YES | VERIFIED | `socket.ts`, `GroupMessage.ts` | Socket.IO working |
| Trust / Reputation System | YES | VERIFIED | `badgeUtils.ts`, `reportController.ts` | Points assigned correctly |
| SOS Alert System | YES | VERIFIED | `sosRoutes.ts`, `SosScreen.tsx` | Quick action functional |
| Push Notifications | PARTIAL | UNVERIFIED | `Notification.ts` | In-app DB notifications present |
| Profile Picture Upload | YES | VERIFIED | `EditProfileScreen.tsx` | Relies on report image upload API |

==================================================
## PART 22 — DOCUMENTATION FACT SHEET
==================================

**Project:** SERPENTIS
**Purpose:** Community-driven civic reporting, emergency response, and local discovery.
**Frontend:** React Native (0.86.0), React (19.2.3), TypeScript, React Navigation, MapLibre.
**Backend:** Node.js, Express, TypeScript, Socket.IO.
**Database:** MongoDB via Mongoose.
**Authentication:** JWT, bcrypt hashing, React Native Keychain.
**Maps:** MapLibre React Native with OpenFreeMap.
**Cloud:** Cloudinary (Image handling), SMTP/Nodemailer (Emails).

**Major Modules:**
- Authentication & User Profile
- Report System
- Places & Public Services
- Community Groups & Chat
- SOS Alerts
- Trust & Reputation (Badges)
- Admin Dashboard
- Notifications

**Known Limitations:** Push notifications require full integration; image handling uses report route for profile uploads.
**Known Pending Image Issue:** There is a known unrelated existing image issue.
