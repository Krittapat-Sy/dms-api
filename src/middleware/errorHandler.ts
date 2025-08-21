import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
    const status = err.status ?? 500;
    const code = err.code ?? 'INTERNAL_ERROR';
    if (status >= 500) console.error(`[${(req as any).id}]`, err);
    res.status(status).json({ error: { code, message: err.message ?? 'Server error', requestId: (req as any).id } });
}
