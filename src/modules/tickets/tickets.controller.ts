import type { Request, Response, NextFunction } from 'express';
import * as service from './tickets.service.js';
import { TicketFilter, TicketInsertDB, TicketRowDB, TicketUpdateDB } from './ticket.types.js';

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const filter: TicketFilter = req.query;
        const rows: TicketRowDB[] = await service.list(filter);
        res.json({
            data: rows
        });
    } catch (e) { next(e); }
};

export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        const id: number = Number(req.params.id);
        const row = await service.get(id);
        res.json({
            data: row
        });
    } catch (e) { next(e); }
};

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data: TicketInsertDB = req.body;
        const id = await service.create(data);
        res.json({
            ok: true, id
        });
    } catch (e) { next(e); }
};

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const id: number = Number(req.params.id);
        const data: TicketUpdateDB = req.body;
        await service.update(id, data);
        res.json({
            ok: true
        });
    } catch (e) { next(e); }
};

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const id: number = Number(req.params.id);
        await service.remove(id);
        res.json({
            ok: true
        });
    } catch (e) { next(e); }
};
