# SERPENTIS — AI-Powered City Intelligence

## 1. Provider-Agnostic Design (`CityIntelligenceAIService`)
Implements the `AIProvider` interface with three adapters:
1. `OpenAIProvider` (`AI_PROVIDER=openai`, `OPENAI_API_KEY`)
2. `GeminiAIProvider` (`AI_PROVIDER=gemini`, `GEMINI_API_KEY`)
3. `DeterministicFallbackAIProvider` (Active whenever external AI credentials are missing or upstream fails)

## 2. Capabilities & Guardrails
- **Natural-Language Assistant (`POST /api/environment/assistant/ask`):** Answers citizen questions about air quality, outdoor exercise, rainfall, heat precautions, waterlogging, and top city issues strictly using live retrieved weather, AQI, alerts, and MongoDB report counts.
- **Image Analysis (`POST /api/environment/assistant/analyze-image`):** Assistive classification only (`isVerifiedEvidence: false`). Never automatically marks a citizen report as verified.
- **Pattern Detection & Briefings (`GET /api/environment/assistant/summary`):** Summarizes daily conditions and 30-day recurring complaint clusters; explicitly marks predictive forecasting as `experimental-inactive` until multi-week validated local station data accumulates.
