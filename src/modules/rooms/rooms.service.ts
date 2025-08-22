import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as repo from './rooms.repo.js';
import { CreateRoomSchema, UpdateRoomSchema } from '../../schemas/room.schema.js';
import type { RoomPartial } from '../../schemas/room.schema.js';

function validate<T>(schema: z.ZodTypeAny, data: unknown): T {
    const parsed = schema.safeParse(data);
    console.log(parsed)
    if (!parsed.success) throw { status: 400, message: parsed.error.issues.map(i => i.message).join(', ') };
    return parsed.data as T;
}

export async function list(_req: Request, res: Response, next: NextFunction) {
    try {
        const rooms: RoomPartial[] = await repo.list()
        res.json({ rooms });
    } catch (e) {
        next(e);
    }
}

export async function get(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            throw { status: 400, message: "Invalid room id" };
        }

        const row = await repo.get(id);
        if (!row) throw { status: 404, message: 'Room not found' };
        res.json(row);
    } catch (e) { next(e); }
}

export async function create(req: Request, res: Response, next: NextFunction) {
    try {
        const data = validate<z.infer<typeof CreateRoomSchema>>(CreateRoomSchema, req.body);
        await repo.create({
            number: data.number,
            floor: data.floor ?? null,
            size_sq_m: data.size_sq_m ?? null,
            status: data.status ?? 'VACANT',
            monthly_rent: data.monthly_rent,
            deposit: data.deposit ?? 0
        });
        res.status(201).json({ ok: true });
    } catch (e) {
        next(e);
    }
}

export async function update(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (id == null || Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid room id' });
        }

        const data = validate<z.infer<typeof UpdateRoomSchema>>(UpdateRoomSchema, req.body);
        await repo.update(id, data);

        if (!(await repo.exists(id))) {
            return res.status(404).json({ error: 'Room not found' });
        }
        return res.status(200).json({ ok: true });
    } catch (e) { next(e); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
    try {
        const id = Number(req.params.id);
        if (id == null || Number.isNaN(id)) {
            return res.status(400).json({ error: 'Invalid room id' });
        }

        if (!(await repo.exists(id))) {
            return res.status(404).json({ error: 'Room not found' });
        }
        await repo.remove(id);
        res.json({ ok: true });
    } catch (e) { next(e); }
}
