# SERPENTIS Screenshot Capture Plan

## A. SCREENSHOT INVENTORY
Based on the actual React Native source code in `mobile/src/screens`, the following screens are implemented and available for capture:
- `SplashScreen`
- `LoginScreen`
- `SignupScreen`
- `ForgotPasswordScreen`, `OtpVerificationScreen`, `ResetPasswordScreen`, `PasswordResetSuccessScreen`
- `HomeScreen`
- `MapScreen`, `PlacesScreen`, `HeritageScreen`
- `ReportIssueScreen`, `ReportDetailsScreen`
- `SosScreen`
- `CommunityScreen`, `CreateGroupScreen`, `GroupChatScreen`, `GroupDetailsScreen`
- `ProfileScreen`, `EditProfileScreen`, `PrivacySecurityScreen`, `ThemeScreen`, `HelpSupportScreen`
- `DashboardScreen`, `LeaderboardScreen`, `BadgesScreen`, `ContributionHistoryScreen`
- `NotificationsScreen`

## B. PRIORITY
**REQUIRED:** Critical user flows mapping to primary functional requirements (Auth, Map, Report, SOS, Chat).
**RECOMMENDED:** Gamification, deeper profile actions, detailed views.
**OPTIONAL:** Settings, Success/Static screens, secondary history pages.

## C. EXACT CAPTURE STATE

| Priority | Screen Name | Visible State / Data Requirement | Filter/State Rules | Suggested Filename |
|---|---|---|---|---|
| **REQUIRED** | `SplashScreen` | App Logo & branding. | Logged Out. | `01_splash.png` |
| **REQUIRED** | `LoginScreen` | Email/password input, Login button. | Logged Out. No error toasts. | `02_login.png` |
| **REQUIRED** | `SignupScreen` | Full Name, Email, Password inputs. | Logged Out. | `03_signup.png` |
| **RECOMMENDED**| `ForgotPasswordScreen` | Email input for OTP. | Logged Out. | `04_forgot_password.png` |
| **REQUIRED** | `HomeScreen` | Welcome message, dashboard summary, shortcuts. | Logged In. Seeded data visible if applicable. | `05_home.png` |
| **REQUIRED** | `MapScreen` | MapLibre/OpenFreeMap tiles. | Logged In. GPS Permitted. Should display Sion/SIES marker clusters. | `06_map.png` |
| **REQUIRED** | `PlacesScreen` | List of the 13 heritage/places records. | Logged In. Records must be loaded. | `07_places.png` |
| **REQUIRED** | `ReportIssueScreen` | Form to create a civic report (Pothole/Garbage). | Logged In. Location attached. | `08_create_report.png` |
| **REQUIRED** | `ReportDetailsScreen` | Detailed view of a submitted report with an image. | Logged In. Must tap an existing seeded report. | `09_report_details.png` |
| **REQUIRED** | `SosScreen` | Emergency categories (Medical, Fire, etc.) and SOS button. | Logged In. GPS Permitted. | `10_sos.png` |
| **REQUIRED** | `CommunityScreen` | List of available community groups. | Logged In. Groups must be fetched. | `11_community_groups.png` |
| **REQUIRED** | `GroupChatScreen` | Socket.IO real-time chat interface. | Logged In. Should show at least 2 messages. | `12_group_chat.png` |
| **RECOMMENDED**| `DashboardScreen` | Trust Score, Reputation Points. | Logged In. Non-zero trust score preferred. | `13_dashboard.png` |
| **REQUIRED** | `LeaderboardScreen` | Top users ranked by Trust Score. | Logged In. Multiple users should be visible. | `14_leaderboard.png` |
| **REQUIRED** | `ProfileScreen` | User's profile picture, name, and role. | Logged In. | `15_profile.png` |
| **RECOMMENDED**| `EditProfileScreen` | Profile editing form. | Logged In. | `16_edit_profile.png` |
| **RECOMMENDED**| `NotificationsScreen` | List of app notifications. | Logged In. At least one notification preferred. | `17_notifications.png` |
| **OPTIONAL** | `PrivacySecurityScreen` | Privacy settings toggles. | Logged In. | `18_privacy.png` |
| **OPTIONAL** | `BadgesScreen` | Earned gamification badges. | Logged In. | `19_badges.png` |

## D. REPORT MAPPING

- **01_splash.png / 02_login.png / 03_signup.png** -> Chapter 5 (Implementation), Section 5.6. *Caption: Figure X.X — SERPENTIS authentication and onboarding flow.*
- **05_home.png / 13_dashboard.png** -> Chapter 5, Section 5.17. *Caption: Figure X.X — User Home and gamified Dashboard.*
- **06_map.png / 07_places.png** -> Chapter 5, Sections 5.11 / 5.12. *Caption: Figure X.X — MapLibre visualization of public services and heritage places.*
- **08_create_report.png / 09_report_details.png** -> Chapter 5, Section 5.8. *Caption: Figure X.X — Civic issue reporting interface with location binding.*
- **10_sos.png** -> Chapter 5, Section 5.13. *Caption: Figure X.X — Emergency SOS broadcast interface.*
- **11_community_groups.png / 12_group_chat.png** -> Chapter 5, Section 5.14. *Caption: Figure X.X — Real-time Socket.IO community chat interface.*
- **14_leaderboard.png** -> Chapter 5, Section 5.17. *Caption: Figure X.X — Community Trust Score Leaderboard.*
- **15_profile.png / 16_edit_profile.png** -> Chapter 5, Section 5.7. *Caption: Figure X.X — User profile management and settings.*

## E. CAPTURE ORDER
To maximize efficiency and avoid repeating states:
1. **Unauthenticated Flow:**
   - Launch App: Capture `Splash`.
   - Navigate to `Login`, then `Signup`, then `Forgot Password`.
2. **Authenticated Flow (Login with primary test account):**
   - Ensure GPS permission is granted upon login.
   - Capture `Home`.
   - Navigate to `Profile` -> Capture `Profile`, `Edit Profile`, `Privacy`, `Badges`.
   - Navigate to `Dashboard` -> Capture `Dashboard`, `Leaderboard`.
   - Navigate to `Map` -> Let tiles load -> Capture `Map`, then navigate to `Places` -> Capture `Places`.
   - Navigate to `Community` -> Capture group list, click a group -> Capture `Group Chat`.
   - Navigate to `SOS` -> Capture `SOS Screen` before pressing broadcast.
   - Navigate to `Create Report` -> Fill dummy data, take dummy photo -> Capture `Create Report` before submit.
   - Submit report -> Go to `Report Details` -> Capture `Report Details`.
   - Open `Notifications` -> Capture.

## F. QUALITY RULES
- **Device:** Use a consistent Android Emulator (e.g., Pixel 7) or physical device. Portrait orientation only.
- **Resolution:** Native high resolution. Do NOT compress or stretch.
- **Status Bar:** Keep the status bar clean. Hide debug icons (e.g., ADB/USB debugging). Ensure time/battery icons are neutral if possible.
- **Overlays:** Disable the React Native developer menu and Metro bundler overlays (no green/red banners).
- **Errors:** Avoid capturing red error toasts unless documenting error boundaries.
- **Data Privacy:** Use dummy/test data. Do not capture real phone numbers or personal emails.

## G. GAP CHECK
- **Screens requested by report but not implemented:** None. Every requested functional flow maps perfectly to an existing `.tsx` file in `mobile/src/screens`.
- **Implemented screens missing from report:** `HelpSupportScreen`, `ThemeScreen`, `ContributionHistoryScreen`, `MapTestScreen`. (These were classified as OPTIONAL or excluded as they are supplementary and not strictly required for the academic core narrative).
- **Technically difficult captures:** Real-time SOS alerts appearing on a *second* device (Requires 2 emulators or 1 physical + 1 emulator to capture the Socket.IO broadcast reception).
- **Required pre-capture data:** Ensure MongoDB contains at least 1 Group, 2 Chat Messages, 1 Civic Report with an image, and the 13 seeded Places before beginning capture.

## H. FINAL CHECKLIST
- [ ] Backend Server running locally (`npm start`).
- [ ] Metro Bundler running (`npm start` in mobile).
- [ ] Emulator launched in Portrait mode.
- [ ] Developer overlays turned off.
- [ ] GPS coordinates set in emulator (e.g., Sion/SIES location).
- [ ] Followed Capture Order (Step E).
- [ ] Verified 12 REQUIRED images and 4 RECOMMENDED images captured.
