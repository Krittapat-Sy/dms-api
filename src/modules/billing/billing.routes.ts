import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import * as ctrl from './billing.controller.js';
import { validate } from '../../middleware/schemaValidator.js';
import { FilterListSchema, PeriodSchema, ReqParams, UpsertReadingSchema } from './billing.schema.js';

const r = Router();
r.get('/meters/readings', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(FilterListSchema, 'query'), ctrl.listReadings);
r.post('/meters/readings', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(UpsertReadingSchema, 'body'), ctrl.upsertReading);
r.get('/invoices', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.listInvoices);
r.get('/invoices/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(ReqParams, 'params'), ctrl.getInvoice);
r.post('/billing/generate', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(PeriodSchema, 'query'), ctrl.generateBilling);

export default r;
