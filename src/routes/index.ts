import { Router } from 'express';
import rooms from './rooms.routes.js';
import auth from './auth.routes.js';

const r = Router();

r.get('/health', (_req, res) => {
    res.json({ ok: true, version: 'v1', time: new Date().toISOString() });
});
r.use('/auth', auth);
r.use('/rooms', rooms);   

export default r;
