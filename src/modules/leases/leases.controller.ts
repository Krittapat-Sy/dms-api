import { Request, Response, NextFunction } from "express";
import * as service from './leases.service';
import { da } from "zod/locales";


export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const filters = req.query;
        const rows = await service.list(filters);

        res.json({ data: rows });
    } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const row = await service.getById(id);

        res.json({ data: row });
    } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body;
        await service.create(data)
        res.status(201).json({ ok: true });
    } catch (e) { next(e); }
}

export async function terminate(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const data = req.body
        await service.terminate(id, data)
        res.status(201).json({ ok: true });
    } catch (e) { next(e); }
}