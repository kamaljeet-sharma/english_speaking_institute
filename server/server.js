import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/error.js';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import batchRoutes from './routes/batches.js';
import liveClassRoutes from './routes/liveClasses.js';
import lectureRoutes from './routes/lectures.js';
import announcementRoutes from './routes/announcements.js';
import enrollmentRoutes from './routes/enrollments.js';
import paymentRoutes, { webhookHandler } from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import demoRoutes from './routes/demo.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));

// Razorpay webhook needs the raw body for signature check, so it goes BEFORE express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), webhookHandler);

app.use(express.json({ limit: '1mb' }));

app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }));
app.use('/api/auth/register', rateLimit({ windowMs: 60 * 60 * 1000, limit: 20 }));
app.use('/api/demo', rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, skip: (r) => r.method !== 'POST' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/demo', demoRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(port, () => console.log(`API running on http://localhost:${port}`)))
  .catch((err) => {
    console.error('Could not connect to MongoDB:', err.message);
    process.exit(1);
  });
