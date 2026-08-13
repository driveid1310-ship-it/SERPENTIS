import { Router } from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { loginLimiter } from "../middleware/rateLimiter.js";
const router = Router();

router.post('/register', register);
router.post("/login", loginLimiter, login);
router.get('/me', authMiddleware, getCurrentUser);

export default router;