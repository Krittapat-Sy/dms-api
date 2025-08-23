import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as repo from './leases.repo.js';
import {
    CreateLeaseSchema,
    TerminateLeaseSchema,
    type CreateLeaseInput,
    type TerminateLeaseInput,
    type LeasePartial,
    LeaseRow
} from '../../schemas/lease.schema.js';

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
        const data = validate<CreateLeaseInput>(CreateLeaseSchema, req.body);

        const room = await repo.getRoom(data.room_id);
        if (!room) return res.status(404).json({ error: 'Room not found' });
        if (room.status === 'MAINTENANCE') {
            return res.status(400).json({ error: 'Room under maintenance' });
        }

        const tenant = await repo.getTenant(data.tenant_id);
        if (!tenant) return res.status(404).json({ error: 'Tenant not found' });

        const alreadyActive = await repo.hasActiveLease(data.room_id);
        if (alreadyActive) return res.status(409).json({ error: 'Room already has an active lease' });

        const id = await repo.create({
            room_id: data.room_id,
            tenant_id: data.tenant_id,
            start_date: data.start_date,
            monthly_rent: data.monthly_rent,
            deposit: data.deposit ?? 0,
            end_date: null
        });

        await repo.updateRoomStatus(data.room_id, 'OCCUPIED');

        res.status(201).json({ ok: true, id });
    } catch (e) { next(e); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
    try {
        const filters: { status?: 'ACTIVE' | 'ENDED'; room_id?: number; tenant_id?: number } = {};
        if (req.query.status === 'ACTIVE' || req.query.status === 'ENDED') {
            filters.status = req.query.status as 'ACTIVE' | 'ENDED';
        }
        if (req.query.room_id && /^\d+$/.test(String(req.query.room_id))) {
            filters.room_id = Number(req.query.room_id);
        }
        if (req.query.tenant_id && /^\d+$/.test(String(req.query.tenant_id))) {
            filters.tenant_id = Number(req.query.tenant_id);
        }

        const rows = await repo.list(filters);
        res.json({ ok: true, data: rows as LeasePartial[] });
    } catch (e) { next(e); }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseIdParam(req);
        if (id === null) return res.status(400).json({ error: 'Invalid lease id' });

        const row = await repo.get(id);
        if (!row) return res.status(404).json({ error: 'Lease not found' });

        res.json({ ok: true, data: row as LeasePartial });
    } catch (e) { next(e); }
}

export async function terminate(req: Request, res: Response, next: NextFunction) {
    try {
        const id = parseIdParam(req);
        if (id === null) return res.status(400).json({ error: 'Invalid lease id' });

        const lease: LeaseRow | null = await repo.get(id);
        if (!lease) return res.status(404).json({ error: 'Lease not found' });

        if (lease.status !== 'ACTIVE') {
            return res.status(409).json({ error: 'Lease already ended' });
        }

        const data = validate<TerminateLeaseInput>(TerminateLeaseSchema, req.body);
        if (data.end_date < lease.start_date) {
            return res.status(400).json({ error: 'end_date must be >= start_date' });
        }

        const affected = await repo.terminate(id, data.end_date);
        if (affected === 0) return res.status(409).json({ error: 'Cannot terminate lease' });

        const stillActive = await repo.hasActiveLease(lease.room_id);
        if (!stillActive) {
            await repo.updateRoomStatus(lease.room_id, 'VACANT');
        }

        res.json({ ok: true });
    } catch (e) { next(e); }
}
