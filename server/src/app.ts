import express, { type Request, type Response } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to the SERPENTIS API 🚀',
  });
});

export default app;