import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';
import { env } from '../config/env.js';

export function applySecurity(app: Express) {
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    app.use(cors({ origin: env.CORS_ORIGINS.length ? env.CORS_ORIGINS : true, credentials: true }));
    app.use(hpp());
    const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true });
    app.use('/api/v1/auth/login', authLimiter);
}
