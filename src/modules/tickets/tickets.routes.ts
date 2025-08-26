import { Router } from 'express';
import * as ctrl from './tickets.controller.js';
import { requireAuth, requireRole } from '../../middleware/authz.js';
import { validate } from '../../middleware/schemaValidator.js';
import { CreateTicketSchema, UpdateTicketSchema } from './ticket.schema.js';

const r = Router();

r.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.list);
r.get('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.get);
r.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(CreateTicketSchema), ctrl.create);
r.patch('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(UpdateTicketSchema), ctrl.update);
r.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.remove);

export default r;
