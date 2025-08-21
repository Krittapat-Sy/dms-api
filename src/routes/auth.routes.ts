import { Router } from 'express';
import * as auth from '../modules/auth/auth.service.js';

const r = Router();
r.post('/register', auth.register);
r.post('/login', auth.login);
r.get('/me', auth.me);
r.post('/refresh', auth.refresh);
r.post('/logout', auth.logout);

export default r;
