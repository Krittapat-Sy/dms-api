import { query, exec } from '../../config/db.js';
import { LeasePartial, LeaseRow } from '../../schemas/lease.schema.js';

type RoomMinimal = { id: number; status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE' };
type TenantMinimal = { id: number };

export async function list(filters?: { status?: 'ACTIVE' | 'ENDED'; room_id?: number; tenant_id?: number; }): Promise<LeasePartial[]> {
    const where: string[] = [];
    const params: Record<string, any> = {};

    if (filters?.status) { where.push('status = :status'); params.status = filters.status; }
    if (filters?.room_id) { where.push('room_id = :room_id'); params.room_id = filters.room_id; }
    if (filters?.tenant_id) { where.push('tenant_id = :tenant_id'); params.tenant_id = filters.tenant_id; }

    const sql = `SELECT * FROM leases ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
    return await query<LeasePartial>(sql, params);
}

export async function get(id: number): Promise<LeaseRow | null> {
    const rows = await query<LeaseRow>('SELECT * FROM leases WHERE id = :id', { id });
    return rows[0] || null;
}

export async function hasActiveLease(room_id: number): Promise<boolean> {
    const rows = await query<{ cnt: number }>(
        'SELECT COUNT(*) AS cnt FROM leases WHERE room_id = :room_id AND status = "ACTIVE"',
        { room_id }
    );
    return (rows[0]?.cnt || 0) > 0;
}

export async function getRoom(room_id: number): Promise<RoomMinimal | null> {
    const rows = await query<RoomMinimal>('SELECT id, status FROM rooms WHERE id = :room_id', { room_id });
    return rows[0] || null;
}

export async function getTenant(tenant_id: number): Promise<TenantMinimal | null> {
    const rows = await query<TenantMinimal>('SELECT id FROM tenants WHERE id = :tenant_id', { tenant_id });
    return rows[0] || null;
}

export async function create(data: Omit<LeasePartial, 'id' | 'created_at' | 'status' | 'end_date'> & { end_date?: string | null }): Promise<number> {
    const result= await exec(
        `
        INSERT INTO leases (room_id, tenant_id, start_date, end_date, status, monthly_rent, deposit)
        VALUES (:room_id, :tenant_id, :start_date, :end_date, 'ACTIVE', :monthly_rent, :deposit)
        `,
        {
            room_id: data.room_id,
            tenant_id: data.tenant_id,
            start_date: data.start_date,
            end_date: data.end_date ?? null,
            monthly_rent: data.monthly_rent,
            deposit: data.deposit
        }
    );
    return result.insertId as number;
}

export async function terminate(id: number, end_date: string): Promise<number> {
    const result = await exec(
        `UPDATE leases SET status = 'ENDED', end_date = :end_date WHERE id = :id AND status = 'ACTIVE'`,
        { id, end_date }
    );
    return result.affectedRows as number;
}

export async function updateRoomStatus(room_id: number, status: RoomMinimal['status']): Promise<number> {
    const result  = await exec(
        `UPDATE rooms SET status = :status WHERE id = :room_id`,
        { status, room_id }
    );
    return result.affectedRows as number;
}
