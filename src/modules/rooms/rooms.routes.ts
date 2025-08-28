import { Router } from 'express';
import * as ctrl from './rooms.controller.js';
import { requireAuth, requireRole, } from '../../middleware/authz.js';
import { validate } from '../../middleware/schemaValidator.js';
import { CreateRoomSchema, Params, UpdateRoomSchema } from './room.schema.js';

const r = Router();

r.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), ctrl.list);
r.get('/:id', requireAuth, validate(Params, 'params'), ctrl.get);
r.post('/', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(CreateRoomSchema, 'body'), ctrl.create);
r.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(UpdateRoomSchema, 'body'), ctrl.update);
r.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), validate(Params, 'params'), ctrl.remove);

export default r;
