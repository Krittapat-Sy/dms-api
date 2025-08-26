import type { Request, Response, NextFunction } from 'express';
import * as service from './payments.service.js';

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const invoice_id = Number(req.query.invoice_id);
        const rows = await service.list(invoice_id);
        res.json({
            data: rows
        });
    } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const row = await service.get(id);
        res.json({
            data: row
        });
    } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body;
        const id = await service.create(data);
        res.status(201).json({
            ok: true,
            id
        });
    } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);

        await service.remove(id);
        res.json({ ok: true });
    } catch (e) { next(e); }
}

