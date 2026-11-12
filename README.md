# SERPENTIS — Smart City & Climate Intelligence Platform

SERPENTIS combines **Civic Intelligence** and **Environmental & Climate Intelligence** in one unified mobile platform, backend API, and interactive MapLibre GIS experience built with a Pan-India-extensible city hierarchy (Stage 1: **Badlapur, Maharashtra**; Stage 2: Thane & Maharashtra cities; Stage 3: Pan-India).

---

## Core Architecture

- **Mobile (`mobile/`):** React Native (`0.86.0`), TypeScript (`5.8`), React Navigation (Native Stack + Bottom Tabs), MapLibre (`@maplibre/maplibre-react-native`), Socket.IO client, Android Keystore token storage (`react-native-keychain`).
- **Backend (`server/`):** Node.js (`>=22`), Express (`5`), TypeScript (`5.9`), MongoDB & Mongoose (`9`), Socket.IO (`4`), JWT + bcrypt + HMAC OTP password reset, Multer + Cloudinary image uploads.
- **Climate & Intelligence Engine (`server/src/services/`):**
  - **CPCB National AQI Calculator (`CpcbAqiCalculator.ts`):** 8-pollutant (`PM2.5`, `PM10`, `NO2`, `SO2`, `CO`, `O3`, `NH3`, `Pb`) breakpoint interpolation, minimum-3-pollutant + PM eligibility rule, strict provenance separation between official stations and modeled estimates.
  - **Weather & Air Quality Providers:** Open-Meteo modeled weather & air quality (no API key required for non-commercial dev), plus gated adapters for IMD, OpenAQ v3, and CPCB/data.gov.in when API keys are supplied.
  - **Smart City Layers & AI Intelligence:** 10 interactive map layers, environmental & heat/AQI alert clustering, deterministic fallback & optional OpenAI/Gemini City Assistant.

---

## Repository Layout

```text
SERPENTIS/
├── .github/workflows/ci.yml   # Automated server, mobile & repository hygiene CI
├── .gitignore                 # Node, RN, Android keystores/local.properties & secrets exclusions
├── .gitattributes             # Cross-platform line endings & binary handling
├── .editorconfig              # Formatting conventions
├── CONTRIBUTING.md            # Git branching, testing & safe commit workflow
├── CHANGELOG.md               # Milestone & release history
├── README.md                  # Project overview & quickstart
├── mobile/                    # React Native + Android Gradle project
├── server/                    # Node.js + Express + MongoDB TypeScript backend
├── docs/                      # Categorized technical, release, security & Git docs
└── documentation/             # Project report documentation & UML/DFD diagrams
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js `>= 22.11` & npm
- MongoDB running locally (or connection string)
- Android Studio / JDK 21 / Android SDK (for mobile builds & emulator)

### 1. Backend (`server/`)
```bash
cd server
cp .env.example .env
# Edit server/.env with MONGO_URI and JWT_SECRET (32+ chars in production)
npm install
npm run build
npm test
npm run dev
```

### 2. Mobile & Android (`mobile/`)
```bash
cd mobile
npm install
npx tsc --noEmit
npx eslint src
npm test -- --watchAll=false
```

By default in debug builds, `mobile/src/config/env.ts` routes Android emulators to `http://10.0.2.2:5000/api`. For physical Android devices on local Wi-Fi or custom release URLs, see [Environment Configuration](docs/development/ENVIRONMENT_CONFIGURATION.md).

### 3. Android APK Builds
```bash
cd mobile/android
# Clean separately before assembleDebug on fresh workspace
.\gradlew.bat clean
.\gradlew.bat assembleDebug
# Signed production release requires keystore.properties or SERPENTIS_UPLOAD_* env vars + HTTPS URL:
.\gradlew.bat assembleRelease -PSERPENTIS_API_URL=https://api.example.com/api
```

---

## Documentation Index

See [docs/README.md](docs/README.md) for the complete index, including:
- [System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)
- [Installation Guide](docs/development/INSTALLATION.md) & [Environment Configuration](docs/development/ENVIRONMENT_CONFIGURATION.md)
- [Android Release Guide](docs/deployment/ANDROID_RELEASE_GUIDE.md)
- [Security Architecture](docs/security/SECURITY.md) & [Phase 2 Release Security Audit](docs/security/RELEASE_SECURITY_AUDIT.md)
- [Phase 2 Release Hardening Report](docs/testing/PHASE_2_RELEASE_HARDENING_REPORT.md)
- [Git Audit, Security & Repair Reports](docs/git/GIT_REPAIR_REPORT.md)
