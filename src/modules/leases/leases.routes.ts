import { Router } from 'express';
import * as leases from './leases.service.js';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import * as ctrl from './leases.controller.js';
import { validate } from '../../middleware/schemaValidator.js';
import { CreateLeaseSchema, LeaseReqParamsSchema, LeaseReqQuerySchema, TerminateLeaseSchema } from './lease.schema.js';

const r = Router();
r.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(LeaseReqQuerySchema, 'query'), ctrl.list);
r.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(LeaseReqParamsSchema, 'params'), ctrl.getById);
r.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(CreateLeaseSchema, 'body'), ctrl.create);
r.patch('/:id/terminate', requireAuth, requireRole('ADMIN', 'MANAGER'),
    validate(LeaseReqParamsSchema, 'params'), validate(TerminateLeaseSchema, 'body'), ctrl.terminate);

export default r;
