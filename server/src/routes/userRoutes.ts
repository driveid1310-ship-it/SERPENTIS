import { Router } from 'express';
import { getLeaderboard } from '../controllers/userController.js';

const router = Router();

// Leaderboard
router.get('/leaderboard', getLeaderboard);

export default router;
