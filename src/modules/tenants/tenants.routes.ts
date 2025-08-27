import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/authz';
import * as ctrl from './tanants.controller';
import { validate } from '../../middleware/schemaValidator';
import { CreateTenantSchema, Params, UpdateTenantSchema } from './tenant.schema';

const r = Router();

r.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.list);
r.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(Params, 'params') , ctrl.getById);
r.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(CreateTenantSchema, 'body') , ctrl.create);
r.patch('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(Params, 'params'), validate(UpdateTenantSchema, 'body') , ctrl.update);
r.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(Params, 'params'), ctrl.remove);

export default r;
