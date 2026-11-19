# SERPENTIS — Installation & Local Startup Guide

## Prerequisites
- **Node.js:** ≥ 22.11.0 (verified on `v22.17.0`)
- **MongoDB:** Running locally (`mongodb://localhost:27017/serpentis`) or MongoDB Atlas URI
- **Android / Mobile Tooling:** Android Studio / JDK 17 + Android SDK (for Android native build)

## 1. Backend Setup (`server/`)
```powershell
cd server
npm install
# Copy server/.env.example to server/.env and fill in MONGO_URI, JWT_SECRET, etc.
npm run build
npm run dev
```
Verify server health at `http://localhost:5000/health`.

## 2. Mobile Setup (`mobile/`)
```powershell
cd mobile
npm install
# Update DEV_MODE and DEV_LAN_IP in mobile/src/config/env.ts if running on a physical device
npm start
# In another terminal:
npm run android
```

## 3. Environment Configuration (`server/.env`)
See `server/.env.example` for all keys:
- **Required:** `PORT`, `MONGO_URI`, `JWT_SECRET`, `PASSWORD_RESET_SECRET`
- **Optional Media/Email:** `CLOUDINARY_*`, `SMTP_*`
- **Live Out-of-the-Box Weather & Modeled AQI:** `OPEN_METEO_BASE_URL`, `OPEN_METEO_AQ_BASE_URL` (no API key needed)
- **Optional Official/AI Credentials:** `IMD_API_KEY` + `IMD_JWT_TOKEN`, `OPENAQ_API_KEY`, `DATA_GOV_IN_API_KEY`, `AI_PROVIDER` (`openai` or `gemini`) + `OPENAI_API_KEY` / `GEMINI_API_KEY`.
