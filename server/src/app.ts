import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import placeRoutes from './routes/placeRoutes.js';
import publicServiceRoutes from './routes/publicServiceRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import environmentalRoutes from './routes/environmentalRoutes.js';
import { errorMiddleware, notFoundHandler } from './middleware/errorMiddleware.js';
import { createRateLimiter } from './middleware/rateLimitMiddleware.js';
import { getCorsOrigins } from './config/envValidation.js';
import { weatherService } from './services/weather/WeatherService.js';
import { airQualityService } from './services/air-quality/AirQualityService.js';
import { cityIntelligenceAIService } from './services/ai/CityIntelligenceAIService.js';
import { environmentalCache } from './services/environmental/EnvironmentalCacheService.js';

const app = express();

const corsOrigins = getCorsOrigins();

app.use(
  cors({
    origin: corsOrigins,
  }),
);
app.use(express.json({ limit: '1mb' }));

// Security headers
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 100,
  keyPrefix: 'auth',
  message: 'Too many authentication attempts. Please try again later.',
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/public-services', publicServiceRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/environment', environmentalRoutes);

app.get('/health', (_req: Request, res: Response) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    service: 'SERPENTIS API',
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      state: dbStates[readyState] ?? 'unknown',
    },
    providers: {
      weather: weatherService.getProviderStatus(),
      airQuality: airQualityService.getProviderStatus(),
      ai: cityIntelligenceAIService.getProviderStatus(),
    },
    cache: environmentalCache.getStats(),
  });
});

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to the SERPENTIS API 🚀',
  });
});

app.use(notFoundHandler);
app.use(errorMiddleware);

export default app;
