import { Router } from 'express';
import * as leases from '../modules/leases/leases.service.js';
import { requireAuth, requireRole } from '../middleware/authz.js';

const r = Router();

r.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), leases.create);
r.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), leases.list);
r.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), leases.getById);
r.patch('/:id/terminate', requireAuth, requireRole('ADMIN', 'MANAGER'), leases.terminate);

export default r;
