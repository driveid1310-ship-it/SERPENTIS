import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import publicServiceRoutes from "./routes/publicServiceRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});
const app = express();
app.disable("x-powered-by");

app.use(helmet());

app.use(compression());

app.use(limiter);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/places', placeRoutes);
app.use("/api/public-services", publicServiceRoutes);
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to the SERPENTIS API 🚀',
  });
});
app.use(errorHandler);
export default app;