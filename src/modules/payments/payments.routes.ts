import { Router } from 'express';
import * as ctrl from './payments.controller.js';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import { validate } from '../../middleware/schemaValidator.js';
import { CreatePaymentSchema } from './payment.schema.js';

const r = Router();

r.get('/',  requireAuth, requireRole('ADMIN','MANAGER'), ctrl.list);
r.get('/:id', requireAuth, requireRole('ADMIN','MANAGER'), ctrl.get);
r.post('/', requireAuth, requireRole('ADMIN','MANAGER'), validate(CreatePaymentSchema), ctrl.create);
r.delete('/:id', requireAuth, requireRole('ADMIN','MANAGER'), ctrl.remove);

export default r;
