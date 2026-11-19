# SERPENTIS — Security & Privacy

## 1. Authentication, Authorization & Realtime
- JWT Bearer authentication (`authMiddleware.ts`) and RBAC (`roleMiddleware.ts`, `adminMiddleware.ts`) preserved across all civic routes and applied to authenticated environmental endpoints (`/api/environment/readings`, `/api/environment/preferences`, `/api/environment/assistant/analyze-image`).
- Socket.IO handshake verifies JWT and enforces `GroupMember` membership before room join or message broadcast.

## 2. Hardening Added
- **Security Headers (`app.ts`):** `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, JSON body size cap (`1mb`).
- **Rate Limiting (`rateLimitMiddleware.ts`):** Sliding-window rate limiters on `/api/auth` (100 req / 15 min), `/api/environment` (60 req / min), and `/api/environment/assistant/*` (20 req / min) returning `429` with `Retry-After`.
- **Centralized Error Handling (`errorMiddleware.ts`):** Sanitizes Mongoose `ValidationError`, `CastError`, duplicate keys (`11000`), and hides stack traces in `NODE_ENV=production`.
- **Upload & Input Validation:** Multer limits single image uploads to JPEG/PNG/WebP ≤ 5 MB (`uploadMiddleware.ts`); pollutant and citizen sensor inputs enforce physical bounds (`EnvironmentalValidationService.ts`).

## 3. Location & Credential Privacy
- API keys (`IMD_API_KEY`, `OPENAQ_API_KEY`, `DATA_GOV_IN_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`, `CLOUDINARY_*`) reside exclusively on the backend (`server/.env`) and are excluded from Git via `.gitignore`.
- Location access on mobile (`useLocation.ts`) is explicit and permission-based; `EnvironmentalPreference` stores `locationConsentGranted` and avoids continuous background tracking.
- Public environmental analytics aggregate counts without exposing personal user details; anonymous reports continue to be sanitized via `sanitizeReportForViewer`.
