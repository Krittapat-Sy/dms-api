import { Router } from 'express';
import * as ctrl from './rooms.controller.js';
import { requireAuth, requireRole, } from '../../middleware/authz.js';
import { validate } from '../../middleware/schemaValidator.js';
import { CreateRoomSchema, UpdateRoomSchema } from './room.schema.js';

const r = Router();

r.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.list);
r.get('/:id', requireAuth, ctrl.get);
r.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(CreateRoomSchema), ctrl.create);
r.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(UpdateRoomSchema), ctrl.update);
r.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.remove);

export default r;
