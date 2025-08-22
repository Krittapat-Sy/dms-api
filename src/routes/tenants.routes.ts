import { Router } from 'express';
import * as tenants from '../modules/tenants/tenants.service';
import { requireAuth, requireRole } from '../middleware/authz.js';

const r = Router();

r.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), tenants.list);
r.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), tenants.getById);

r.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), tenants.create);
r.patch('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), tenants.update);
r.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), tenants.remove);

export default r;
