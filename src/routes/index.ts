import { Router } from 'express';
import rooms from '../modules/rooms/rooms.routes';
import auth from './auth.routes.js';
import tenants from './tenants.routes.js';
import leases from './leases.routes.js';
import billing from './billing.routes.js';
import payments from '../modules/payments/payments.routes.js';

const r = Router();

r.get('/health', (_req, res) => {
    res.json({ ok: true, version: 'v1', time: new Date().toISOString() });
});
r.use('/auth', auth);
r.use('/rooms', rooms);
r.use('/tenants', tenants);
r.use('/leases', leases);
r.use('/', billing);
r.use('/payments', payments);

export default r;
