import type { Request, Response, NextFunction } from 'express';
import * as service from './rooms.service.js';

export async function list(_req: Request, res: Response, next: NextFunction) {
    try {
        const rooms = await service.list();
        res.json({ rooms });
    } catch (e) { next(e); }
}

export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const row = await service.get(id);
        if (!row) return res.status(404).json({ error: 'Room not found' });
        res.json(row);
    } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body;
        await service.create(data);
        res.status(201).json({ ok: true });
    } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const data = req.body;

        const result = await service.update(id, data);
        if (result === 'NO_FIELDS') {
            return res.status(200).json({ ok: true });
        }
        if (result === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Room not found' });
        }
        return res.status(200).json({ ok: true });
    } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const result = await service.remove(id);
        if (result === 'NOT_FOUND') {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json({ ok: true });
    } catch (e) { next(e); }
}
