import express from 'express';
import compression from 'compression';
import 'dotenv/config';
import cookieParser from 'cookie-parser';

import { requestId } from './middleware/requestId.js';
import { logger } from './middleware/logger.js';
import { applySecurity } from './middleware/security.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';
import api from './routes/index.js';

export function createApp() {
    const app = express();

    // app.set('trust proxy', false);
    app.use(requestId);
    app.use(logger);
    applySecurity(app);

    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(compression());

    app.use('/api/v1', api);

    app.use(notFound);
    app.use(errorHandler);
    return app;
}
