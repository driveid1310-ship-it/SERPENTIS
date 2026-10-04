import { Router } from 'express';
import { getLeaderboard, getMyContributions, getMyBadges } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Leaderboard
router.get('/leaderboard', getLeaderboard);

// Contributions
router.get('/me/contributions', authMiddleware, getMyContributions);

// Badges
router.get('/me/badges', authMiddleware, getMyBadges);

export default router;
