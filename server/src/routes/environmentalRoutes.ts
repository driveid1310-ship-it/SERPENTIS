import { Router } from 'express';
import {
  analyzeEnvironmentalImage,
  askAssistant,
  estimateCarbonFootprint,
  getAirQuality,
  getAlertHistory,
  getAlerts,
  getAnalytics,
  getAssistantSummary,
  getMapLayers,
  getMonitoringOverview,
  getPreferences,
  getScores,
  getSmartCityCapabilities,
  getUnifiedOverview,
  getWeather,
  listLocations,
  resolveLocationEndpoint,
  submitEnvironmentalReading,
  updatePreferences,
} from '../controllers/environmentalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimitMiddleware.js';

const router = Router();

const envLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyPrefix: 'env',
});

const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  keyPrefix: 'ai',
  message: 'AI assistant rate limit reached. Please wait a minute.',
});

router.use(envLimiter);

// Locations & India hierarchy
router.get('/locations', listLocations);
router.get('/locations/resolve', resolveLocationEndpoint);

// Core climate intelligence
router.get('/weather', getWeather);
router.get('/aqi', getAirQuality);
router.get('/overview', getUnifiedOverview);
router.get('/monitoring', getMonitoringOverview);
router.post('/readings', authMiddleware, submitEnvironmentalReading);

// Alerts & analytics
router.get('/alerts', getAlerts);
router.get('/alerts/history', getAlertHistory);
router.get('/analytics', getAnalytics);

// Smart City map layers
router.get('/map-layers', getMapLayers);

// AI City Intelligence
router.post('/assistant/ask', aiLimiter, askAssistant);
router.get('/assistant/summary', getAssistantSummary);
router.post('/assistant/analyze-image', authMiddleware, aiLimiter, analyzeEnvironmentalImage);

// City Intelligence Scores & Smart City Capabilities
router.get('/scores', getScores);
router.get('/smart-city', getSmartCityCapabilities);
router.post('/carbon-estimate', estimateCarbonFootprint);

// User environmental preferences
router.get('/preferences', authMiddleware, getPreferences);
router.put('/preferences', authMiddleware, updatePreferences);

export default router;
