import { Router } from 'express';
import * as rooms from '../modules/rooms/rooms.service.js';
import { requireAuth, requireRole } from '../middleware/authz.js';

const r = Router();
r.get('/', requireAuth, requireRole('ADMIN', 'MANAGER'), rooms.list);
r.get('/:id', requireAuth, rooms.get);
r.post('/',  requireAuth, requireRole('ADMIN', 'MANAGER'), rooms.create);
r.put('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), rooms.update);
r.delete('/:id', requireAuth, requireRole('ADMIN', 'MANAGER'), rooms.remove);


export default r;
