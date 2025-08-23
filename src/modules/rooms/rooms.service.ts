import * as repo from './rooms.repo.js';
import { RoomInsertDB, RoomRowDB, RoomUpdateDB } from './room.types.js';

export async function list(): Promise<RoomRowDB[]> {
    return repo.list();
}

export async function get(id: number): Promise<RoomRowDB | undefined> {
    return repo.get(id);
}


export async function create(data: RoomInsertDB): Promise<void> {
    await repo.insert({
        number: data.number,
        floor: data.floor ?? null,
        size_sq_m: data.size_sq_m ?? null,
        status: data.status ?? 'VACANT',
        monthly_rent: data.monthly_rent,
        deposit: data.deposit ?? 0
    });
}

export async function update(id: number, data: RoomUpdateDB): Promise<'NOT_FOUND' | 'UPDATED' | 'NO_FIELDS'> {
    const hasAnyField =
        data.number !== undefined ||
        data.floor !== undefined ||
        data.size_sq_m !== undefined ||
        data.status !== undefined ||
        data.monthly_rent !== undefined ||
        data.deposit !== undefined;

    if (!hasAnyField) return 'NO_FIELDS';

    await repo.update(id, data);

    const ok = await repo.exists(id);
    return ok ? 'UPDATED' : 'NOT_FOUND';
}

export async function remove(id: number): Promise<'NOT_FOUND' | 'REMOVED'> {
    const roomExists = await repo.exists(id);
    if (!roomExists) return 'NOT_FOUND';
    await repo.remove(id);
    return 'REMOVED';
}
