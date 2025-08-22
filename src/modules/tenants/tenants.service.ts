import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as repo from './tenants.repo.js';
import { CreateTenantSchema, UpdateTenantSchema } from '../../schemas/tenant.schema.js';

function parseIdParam(req: Request): number | null {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function validate<T>(schema: z.ZodTypeAny, data: unknown): T {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
        throw { status: 400, message: parsed.error.issues.map(i => i.message).join(', ') };
    }
    return parsed.data as T;
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = validate<z.infer<typeof CreateTenantSchema>>(CreateTenantSchema, req.body);
        await repo.create({
            name: data.name,
            phone: data.phone ?? null,
            email: data.email ?? null,
            citizen_id: data.citizen_id ?? null,
            note: data.note ?? null,
        });
        res.status(201).json({ ok: true });
    } catch (e) { next(e); }
}

export async function list(_req: Request, res: Response, next: NextFunction) {
    try {
        const tenant = await repo.list();
        res.json({ tenant });
    } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseIdParam(req);
        if (id === null) return res.status(400).json({ error: 'Invalid tenant id' });

        const tenant = await repo.get(id);
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        res.json({ tenant });
    } catch (e) { next(e); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseIdParam(req);
        if (id === null) return res.status(400).json({ error: 'Invalid tenant id' });

        const data = validate<z.infer<typeof UpdateTenantSchema>>(UpdateTenantSchema, req.body);
        if (!data || Object.keys(data).length === 0) {
            return res.status(400).json({ error: 'Empty update payload' });
        }

        const affected = await repo.update(id, data);
        if (affected === 0) return res.status(404).json({ error: 'Tenant not found' });

        res.json({ ok: true });
    } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseIdParam(req);
        if (id === null) return res.status(400).json({ error: 'Invalid tenant id' });

        const affected = await repo.remove(id);
        if (affected === 0) return res.status(404).json({ error: 'Tenant not found' });

        res.json({ ok: true });
    } catch (e) { next(e); }
}
