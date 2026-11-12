# SERPENTIS — Existing Feature Audit

This audit records every module directly inspected in `server/src/` and `mobile/src/` prior to Milestone 1 modifications.

## 1. Backend Modules (`server/src/`)

### Core Infrastructure
- `app.ts`: Configures `cors()`, `express.json()`, mounts 10 route groups under `/api/*`, and exposes `GET /`.
- `server.ts`: Loads `dotenv`, connects to MongoDB via `connectDB()`, creates HTTP server, and attaches Socket.IO via `setupSocket(server)`.
- `socket.ts`: Authenticates Socket.IO handshakes via JWT (`socket.handshake.auth.token`), enforces `GroupMember` authorization on `joinGroup` and `sendMessage`, persists `GroupMessage` (with optional validated `sharedReport`), and broadcasts `newMessage` to the group room.
- `config/database.ts`: Connects Mongoose to `process.env.MONGO_URI` and exits on failure.
- `config/cloudinary.ts`: Lazy-initializes Cloudinary v2 SDK from `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

### Database Models (`server/src/models/`)
1. `User`: `fullName`, `email` (unique), `password` (bcrypt pre-save hook), `phone`, `profilePicture`, `trustScore`, `reputationPoints`, `badges`, `totalReports`, `resolvedReports`, `role` (`citizen | moderator | admin`), `isVerified`.
2. `Report`: `title`, `description`, `category` (`pothole | garbage | water-leakage | streetlight | traffic | pollution | stray-animals | food-safety | other`), `status`, `images`, GeoJSON `location` (`2dsphere` indexed), `reportedBy`, `isAnonymous`, `upvotes`, `personallyObserved`, `priority`, `isDuplicate`, `verified`, `verifiedBy`, `moderatorRemark`, `foodSafetyDetails` (with `officialFiling` tracking).
3. `Comment`, `Group`, `GroupMember`, `GroupMessage`, `Notification` (`report | badge | sos | system`), `PasswordReset`, `Place` (heritage/places with `2dsphere`), `PlaceFavorite`, `PlaceReview`, `PublicService` (`hospital | police | fire-station | pharmacy | bank | atm | bus-stop | railway-station | government-office | parking | public-toilet | other` with `2dsphere`), `SOS`.

### API Routes (`server/src/routes/`)
- `/api/auth`: Register, login, OTP password reset (`request-password-reset`, `verify-reset-otp`, `reset-password`), `GET /me`, `PATCH /me`.
- `/api/reports`: `POST /upload-image` (Multer memory + Cloudinary), CRUD, `/near` geospatial query, `/search`, `/stats` (`getCityStats`), `upvote` (`POST`/`DELETE`), `/observe`, moderator `/status`, `/verify`, `/priority`, and `/official-filing`.
- `/api/comments`: Create, list by report, delete.
- `/api/groups`: List, `/my`, details, members, create, join, leave, messages.
- `/api/notifications`: List, mark one read, mark all read, delete.
- `/api/places`: List, search, `/near`, `/top-rated`, `/trending`, `/category/:category`, `/favorites`, `/reviews`, CRUD, reviews, favorite/unfavorite.
- `/api/public-services`: List, search, `/nearby`, `/category/:category`, CRUD.
- `/api/sos`: Active SOS list, `/near`, create, moderator `/resolve` (`PATCH /:id`).
- `/api/users`: `/leaderboard`, `/me/contributions`, `/me/badges`.
- `/api/admin`: Admin/moderator protected dashboard, users list, reports list, status update, delete report/place/service.

### Middleware & Utilities
- `authMiddleware.ts`: Extracts `Bearer <token>` JWT and attaches `req.userId`.
- `roleMiddleware.ts`: `authorizeRoles(...roles)` loads user from DB and verifies role.
- `adminMiddleware.ts`: Restricts access to `admin` or `moderator`.
- `uploadMiddleware.ts`: Multer memory storage restricting single image uploads to JPEG/PNG/WebP up to 5 MB.
- `badgeUtils.ts`: Unlocks badges (`New Contributor`, `Active Reporter`, `City Guardian`, `Community Champion`) and creates badge notifications.

## 2. Mobile Application (`mobile/src/`)

### Navigation (`mobile/src/navigation/AppNavigator.tsx`)
- Root native stack (`Splash`, `Login`, `Signup`, `Home` -> `MainTabs`, `ReportDetails`, `CreateGroup`, `GroupDetails`, `GroupChat`, `Leaderboard`, `Dashboard`, `ContributionHistory`, `Badges`, `Theme`, `DesignShowcase`, `Places`, `SOS`, `Notifications`, `Heritage`, `EditProfile`, `PrivacySecurity`, `HelpSupport`, `ForgotPassword`, `OtpVerification`, `ResetPassword`, `PasswordResetSuccess`).
- Bottom Tabs (`MainTabs`): `HomeTab` (`HomeScreen`), `Map` (`MapScreen`), `ReportIssue` (`ReportIssueScreen`), `Community` (`CommunityScreen`), `Profile` (`ProfileScreen`).

### MapLibre Integration (`mobile/src/components/map/SerpentisMap.tsx` & `MapScreen.tsx`)
- Uses `@maplibre/maplibre-react-native` v11 (`Map`, `Camera`, `GeoJSONSource`, `Layer`, `Marker`) with `OPENFREEMAP_STYLE_URL` (`https://tiles.openfreemap.org/styles/positron`).
- Displays current location circle layer, target marker, report markers, heritage place markers, and public service markers with category filter pills (`All`, `Hospitals`, `Police`).

### Themes & Design System (`mobile/src/theme/`, `ThemeContext.tsx`)
- Supports two persisted themes (`futuristic` and `darkTech`) via `AsyncStorage` (`@theme_name`), with spacing, radius, typography, shadows, and color tokens.

### Preservation Summary
All existing authentication, civic reporting, food-safety official filing, MapLibre rendering, Socket.IO group chat, SOS, places, public services, badges, leaderboards, notifications, and theme flows are functional in code and will be preserved backward-compatibly.
