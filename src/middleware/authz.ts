import type { Request, Response, NextFunction } from 'express';
import { verifyAccess, type JwtUser } from '../utils/jwt.js';

declare global {
    namespace Express {
        interface Request {
            user?: JwtUser;
        }
    }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Missing access token' });

    try {
        const user = verifyAccess(token);
        req.user = user;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid access token' });
    }
}

export function requireRole(...roles: Array<'ADMIN' | 'MANAGER' | 'TENANT'>) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: insufficient role' });
        }
        next();
    };
}
