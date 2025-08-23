import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as repo from './billing.repo.js';
import { UpsertReadingSchema, ListReadingQuerySchema, GenerateBillingQuerySchema } from '../../schemas/billing.schema.js';

function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        throw { status: 400, message: parsed.error.issues.map(i => i.message).join(', ') };
    }
    return parsed.data;
}

export async function upsertReading(req: Request, res: Response, next: NextFunction) {
    try {
        const data = validate(UpsertReadingSchema, req.body);
        await repo.upsertReading(data);
        res.status(201).json({ ok: true });
    } catch (e) { next(e); }
}

export async function listReadings(req: Request, res: Response, next: NextFunction) {
    try {
        const q = validate(ListReadingQuerySchema, req.query);
        const rows = await repo.listReadings({ room_id: q.room_id, period: q.period });
        res.json({ ok: true, data: rows });
    } catch (e) { next(e); }
}

export async function generateBilling(req: Request, res: Response, next: NextFunction) {
    try {
        const { period } = validate(GenerateBillingQuerySchema, req.query);

        const rate = await repo.getLatestRateForPeriod(period);

        if (!rate) return res.status(400).json({ error: 'No utility rate configured' });

        const leases = await repo.listActiveLeasesOnPeriod(period);
        if (leases.length === 0) return res.json({ ok: true, created: 0 });

        let created = 0;

        for (const lease of leases) {
            const exists = await repo.getInvoiceByLeasePeriod(lease.id, period);

            if (exists) continue;

            const reading = await repo.getReading(lease.room_id, period);

            const electricUnits = reading?.electric ?? 0;
            const waterUnits = reading?.water ?? 0;

            const invId = await repo.createInvoice({
                lease_id: lease.id,
                period,
                total: 0,
                due_date: null,
            });

            await repo.addItem(invId, { type: 'RENT', qty: 1, unit_price: lease.monthly_rent, amount: lease.monthly_rent, meta: null });
            if (electricUnits > 0) {
                const amount = electricUnits * rate.electric_per_unit;
                await repo.addItem(invId, { type: 'ELECTRIC', qty: electricUnits, unit_price: rate.electric_per_unit, amount, meta: null });
            }
            if (waterUnits > 0) {
                const amount = waterUnits * rate.water_per_unit;
                await repo.addItem(invId, { type: 'WATER', qty: waterUnits, unit_price: rate.water_per_unit, amount, meta: null });
            }
            if (rate.service_fee > 0) {
                await repo.addItem(invId, { type: 'SERVICE', qty: 1, unit_price: rate.service_fee, amount: rate.service_fee, meta: null });
            }

            await repo.updateInvoiceTotal(invId);
            created++;
        }

        res.json({ ok: true, created });
    } catch (e) { next(e); }
}

export async function listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
        const period = typeof req.query.period === 'string' ? req.query.period : undefined;
        const rows = await repo.listInvoices({ period });
        res.json({ ok: true, data: rows });
    } catch (e) { next(e); }
}

export async function getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (!req.params.id || Number.isNaN(id)) return res.status(400).json({ error: 'Invalid invoice id' });

        const inv = await repo.getInvoice(id);
        if (!inv) return res.status(404).json({ error: 'Invoice not found' });

        const items = await repo.listItems(id);
        res.json({ ok: true, data: { invoice: inv, items } });
    } catch (e) { next(e); }
}
