import { Router } from 'express';
const r = Router();

r.get('/health', (_req, res) => {
    res.json({ ok: true, version: 'v1', time: new Date().toISOString() });
});

import auth from './auth.routes.js';
r.use('/auth', auth);

export default r;
