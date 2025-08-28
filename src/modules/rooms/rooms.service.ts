import { Room, RoomInsert, RoomUpdate } from './room.schema.js';
import { query, exec } from '../../config/db.js';
import { ResultSetHeader } from 'mysql2/promise';
class NotFoundError extends Error { code = 404 as const; }
class BadRequestError extends Error { code = 400 as const; }

export async function list(): Promise<Room[]> {
    return await query<Room>(`
        SELECT id, floor, number, size_sq_m, status, monthly_rent, deposit, created_at 
        FROM rooms 
        ORDER BY id DESC
    `);
}

export async function get(id: number): Promise<Room> {
    const rowsRoom = await query<Room>(
        `
        SELECT id, floor, number, size_sq_m, status, monthly_rent, deposit, created_at 
        FROM rooms 
        WHERE id = :id LIMIT 1
        `, { id });
    const room = rowsRoom[0];
    if (!room) throw new NotFoundError('Room not found');
    return room;

}

export async function create(data: RoomInsert): Promise<void> {
    await exec(
        `
        INSERT INTO rooms (number,floor,size_sq_m,status,monthly_rent,deposit)
        VALUES (:number,:floor,:size_sq_m,:status,:monthly_rent,:deposit)
        `, {
        number: data.number,
        floor: data.floor ?? null,
        size_sq_m: data.size_sq_m ?? null,
        status: data.status ?? 'VACANT',
        monthly_rent: data.monthly_rent,
        deposit: data.deposit ?? 0
    }
    );
}

export async function update(id: number, data: RoomUpdate): Promise<void> {
    if (!data || Object.keys(data).length === 0) throw new BadRequestError('Empty update payload');

    const fields = Object.entries(data);
    const setClause = fields.map(([k]) => `${String(k)} = :${String(k)}`)

    const params: Record<string, unknown> = Object.fromEntries(fields);
    params.id = id;

    const res: ResultSetHeader = await exec(
        `UPDATE rooms SET ${setClause} WHERE id = :id`,
        params
    );
    if (res.affectedRows == 0) throw new NotFoundError('Tenant not found');
}

export async function remove(id: number): Promise<void> {
    const res: ResultSetHeader = await exec('DELETE FROM rooms WHERE id = :id', { id });
    if (res.affectedRows == 0) throw new NotFoundError('Tenant not found');
}
