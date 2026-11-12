import { Router } from 'express';

import { authMiddleware } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { createRateLimiter } from '../middleware/rateLimitMiddleware.js';

import {
  createSOS,
  getAllSOS,
  getNearbySOS,
  resolveSOS,
} from '../controllers/sosController.js';

const router = Router();

const sosCreateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'sos-create',
  message: 'Too many SOS alerts sent from this connection. Please wait before sending another.',
});

// ===============================
// Get All Active SOS Alerts
// ===============================
router.get('/', authMiddleware, getAllSOS);

// ===============================
// Nearby SOS Alerts
// ===============================
router.get('/near', authMiddleware, getNearbySOS);

// ===============================
// Create SOS
// ===============================
router.post('/', authMiddleware, sosCreateLimiter, createSOS);

// ===============================
// Resolve SOS (Moderator/Admin)
// ===============================
router.patch(
  '/:id',
  authMiddleware,
  authorizeRoles('moderator', 'admin'),
  resolveSOS,
);

export default router;