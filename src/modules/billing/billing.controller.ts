import { Request, Response, NextFunction } from "express";
import * as service from './billing.service';

export async function listReadings(req: Request, res: Response, next: NextFunction) {
    try {
        const filtersData = req.query;
        const rows = await service.listReadings(filtersData)
        res.json({ data: rows });
    } catch (e) { next(e); }
}

export async function upsertReading(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body;
        await service.upsertReading(data)
        res.status(201).json({ ok: true });
    } catch (e) { next(e); }
}

export async function listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
        const period = typeof req.query.period === 'string' ? req.query.period : undefined;
        const rows = await service.listInvoices(period)
        res.json({ data: rows });
    } catch (e) { next(e); }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        const result = await service.getInvoice(id);
        res.json({ data: result });
    } catch (e) { next(e); }
}

export async function generateBilling(req: Request, res: Response, next: NextFunction) {
    try {
        const period = String(req.query.period);
        const created = await service.generateBilling(period)
        res.json({ ok: true, created });
    } catch (e) { next(e); }
}