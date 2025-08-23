import { query, exec } from '../../config/db.js';
import type { RoomInsertDB, RoomRowDB, RoomUpdateDB } from './room.types.js';

export async function list(): Promise<RoomRowDB[]> {
    return await query<RoomRowDB>(
        `
        SELECT id, floor, number, size_sq_m, status, monthly_rent, deposit, created_at 
        FROM rooms 
        ORDER BY id DESC
        `
    );
}

export async function get(id: number): Promise<RoomRowDB | undefined> {
    const rows = await query<RoomRowDB>(
        `
        SELECT id, floor, number, size_sq_m, status, monthly_rent, deposit, created_at 
        FROM rooms 
        WHERE id = :id LIMIT 1
        `, { id });
    return rows[0];
}

export async function insert(data: RoomInsertDB) {
    await exec(
        `
        INSERT INTO rooms (number,floor,size_sq_m,status,monthly_rent,deposit)
        VALUES (:number,:floor,:size_sq_m,:status,:monthly_rent,:deposit)
        `, data
    );
}

export async function update(id: number, data: RoomUpdateDB) {
    const allowed = ['number', 'floor', 'size_sq_m', 'status', 'monthly_rent', 'deposit'] as const;

    const fields: string[] = [];
    const params: any = { id };

    for (const k of allowed) {
        if (Object.prototype.hasOwnProperty.call(data, k) && (data as any)[k] !== undefined) {
            fields.push(`${k} = :${k}`);
            params[k] = (data as any)[k];
        }
    }

    await exec(
        `UPDATE rooms SET ${fields.join(', ')} WHERE id = :id`,
        params
    );
}

export async function remove(id: number) {
    await exec('DELETE FROM rooms WHERE id = :id', { id });
}

export async function exists(id: number): Promise<boolean> {
    const rows = await query<{ id: number }>(`SELECT id FROM rooms WHERE id = :id LIMIT 1`, { id });
    return rows.length > 0;
}
