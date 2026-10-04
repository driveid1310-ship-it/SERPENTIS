import express, { type Request, type Response } from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import userRoutes from './routes/userRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";
import placeRoutes from "./routes/placeRoutes.js";
import publicServiceRoutes from "./routes/publicServiceRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
const app = express();

app.use(cors());
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
app.use('/api/groups', groupRoutes);
app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to the SERPENTIS API 🚀',
  });
});

export default app;