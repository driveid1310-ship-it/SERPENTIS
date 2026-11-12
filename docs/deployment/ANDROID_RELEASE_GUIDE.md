# SERPENTIS — Android Release Build & Signing Guide (RC1)

**Application ID:** `com.serpentis.app`  
**Version:** `versionCode 1`, `versionName "1.0"`  
**SDK Targets:** `minSdkVersion 24`, `compileSdkVersion 36`, `targetSdkVersion 36`, `buildToolsVersion "36.0.0"`, `ndkVersion "27.1.12297006"`  
**Architecture Flags:** `newArchEnabled=true`, `hermesEnabled=true`, ABIs `armeabi-v7a,arm64-v8a,x86,x86_64`

---

## 1. Phase 2 Release Hardening Summary

1. **Removed Debug Signing Fallback from Release Builds:**
   - `mobile/android/app/build.gradle` no longer uses `signingConfigs.debug` for `buildTypes.release`.
   - When signing properties are absent, `assembleRelease` produces `app-release-unsigned.apk` rather than misleadingly signing a release APK with the debug keystore.
2. **Enforced HTTPS-Only Network Policy in Release:**
   - `buildTypes.release` sets `manifestPlaceholders = [usesCleartextTraffic: "false"]`.
   - `mobile/src/config/env.ts` validates `BuildConfig.API_BASE_URL` at startup (`validateProductionApiUrl`) and refuses HTTP, `localhost`, `10.0.2.2`, RFC1918 LAN IPs, or empty URLs.
3. **Android 13+ Notification Permission (`POST_NOTIFICATIONS`):**
   - Added `<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />` to `AndroidManifest.xml`.
   - Added single-prompt runtime request logic in `mobile/src/utils/notificationPermission.ts` + recovery prompt in `NotificationsScreen.tsx`.
4. **ProGuard / R8 Keep Rules:**
   - Added conservative keep rules in `mobile/android/app/proguard-rules.pro` for `SerpentisConfigModule`, MapLibre, OkHttp, Keychain, Reanimated, and Worklets (`minifyEnabled` toggled via `-PENABLE_PROGUARD=true`).

---

## 2. Verified Phase 2 APK Artifacts

Built from `mobile/android` after `gradlew.bat clean`:

| Build Variant | Output Path | Size (Bytes) | SHA-256 Checksum | Signing Status |
| :--- | :--- | :--- | :--- | :--- |
| **Debug** | `mobile/android/app/build/outputs/apk/debug/app-debug.apk` | `258,731,542` | `B35317FBDD337D27A8B28227CC5735CE746F34CCC8F0C067827F1591D8609413` | `debug.keystore` |
| **Release (Unsigned RC)** | `mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk` | `127,688,270` | `58FB5DE7A6196DE0E5DB4568495C690F23638174CF64AA5C2A23A575F18C175C` | **Unsigned (`BLOCKED` awaiting release keystore)** |

---

## 3. Completing Production Signing & Build

### Option A — Generate an Upload Keystore
```powershell
keytool -genkeypair -v -storetype PKCS12 `
  -keystore mobile\android\serpentis-upload-key.keystore `
  -alias serpentis-upload -keyalg RSA -keysize 2048 -validity 10000
```

### Option B — Supply Signing Credentials Securely (Never Commit)
Copy `mobile/android/keystore.properties.example` to `mobile/android/keystore.properties` (excluded via `mobile/android/.gitignore`):
```properties
storeFile=serpentis-upload-key.keystore
storePassword=<YOUR_STORE_PASSWORD>
keyAlias=serpentis-upload
keyPassword=<YOUR_KEY_PASSWORD>
```
Or export `SERPENTIS_UPLOAD_STORE_FILE`, `SERPENTIS_UPLOAD_STORE_PASSWORD`, `SERPENTIS_UPLOAD_KEY_ALIAS`, and `SERPENTIS_UPLOAD_KEY_PASSWORD` in CI/CD environment variables.

### Build Signed Release APK / Play Store AAB with HTTPS Backend URL
```powershell
cd mobile\android
.\gradlew.bat assembleRelease -PSERPENTIS_API_URL=https://api.yourdomain.com/api
# Or for Google Play Store App Bundle:
.\gradlew.bat bundleRelease -PSERPENTIS_API_URL=https://api.yourdomain.com/api
```

### Verify Signed Release APK
```powershell
& "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.0.0\apksigner.bat" verify --verbose app\build\outputs\apk\release\app-release.apk
```

---

## 4. Remaining Android Release Blockers
1. **Production Release Keystore:** Unsigned APK generated cleanly; final signed `.apk`/`.aab` requires project owner's upload keystore & passwords.
2. **Firebase Cloud Messaging (FCM):** `POST_NOTIFICATIONS` permission is ready, but live background push requires adding `google-services.json`, `@react-native-firebase/app` + `@react-native-firebase/messaging`, and a backend FCM token registry + Firebase Admin sender.
3. **Production HTTPS Backend Domain:** Must supply a live `https://` endpoint via `-PSERPENTIS_API_URL` before distributing a release build.
