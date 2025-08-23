import { Router } from 'express';
import * as sv from '../modules/billing/billing.service.js';
import { requireAuth, requireRole } from '../middleware/authz.js';

const r = Router();

r.post('/meters/readings', requireAuth, requireRole('ADMIN', 'MANAGER'), sv.upsertReading);
r.get('/meters/readings', requireAuth, requireRole('ADMIN', 'MANAGER'), sv.listReadings);

r.post('/billing/generate', requireAuth, requireRole('ADMIN', 'MANAGER'), sv.generateBilling);

r.get('/invoices', requireAuth, requireRole('ADMIN', 'MANAGER'), sv.listInvoices);
r.get('/invoices/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), sv.getInvoice);

export default r;
