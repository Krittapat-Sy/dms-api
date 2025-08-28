import { type CreateLeaseInput, type TerminateLeaseInput, LeaseRow, LeaseReqQuery } from './lease.schema.js';
import { query, exec } from '../../config/db.js';
class NotFoundError extends Error { code = 404 as const; }
class BadRequestError extends Error { code = 400 as const; }
class ConflictError extends Error { code = 409 as const; }

export async function list(filters: LeaseReqQuery): Promise<LeaseRow[]> {
    const where: string[] = [];
    const params: Record<string, any> = {};

    if (filters?.status) { where.push('status = :status'); params.status = filters.status; }
    if (filters?.room_id) { where.push('room_id = :room_id'); params.room_id = filters.room_id; }
    if (filters?.tenant_id) { where.push('tenant_id = :tenant_id'); params.tenant_id = filters.tenant_id; }

    const sql = `SELECT * FROM leases ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
    const rows = await query<LeaseRow>(sql, params);
    if (!rows.length) throw new NotFoundError('Leases not found');

    return rows
}

export async function getById(id: number): Promise<LeaseRow> {
    const rows = await query<LeaseRow>('SELECT * FROM leases WHERE id = :id', { id });
    if (!rows.length) throw new NotFoundError('Leases not found');
    return rows[0]
}

export async function create(data: CreateLeaseInput): Promise<void> {
    const rowsRoom = await query('SELECT id, status FROM rooms WHERE id = :room_id', { room_id: data.room_id });
    const room = rowsRoom[0];
    if (!room) throw new NotFoundError('Room not found');
    if (room.status === 'MAINTENANCE') throw new BadRequestError('Room under maintenance');

    const rowsTenant = await query('SELECT id FROM tenants WHERE id = :tenant_id', { tenant_id: data.tenant_id });
    const tenant = rowsTenant[0];
    if (!tenant) throw new NotFoundError('Tenant not found');

    const rowsAlreadyActive = await query<{ cnt: number }>(
        'SELECT COUNT(*) AS cnt FROM leases WHERE room_id = :room_id AND status = "ACTIVE"',
        { room_id: data.room_id }
    );
    const count = rowsAlreadyActive[0]?.cnt ?? 0;
    const hasActiveLease = count > 0;
    if (hasActiveLease) throw new ConflictError('Room already has an active lease');

    await exec(
        `
        INSERT INTO leases (room_id, tenant_id, start_date, end_date, status, monthly_rent, deposit)
        VALUES (:room_id, :tenant_id, :start_date, :end_date, 'ACTIVE', :monthly_rent, :deposit)
        `,
        {
            room_id: data.room_id,
            tenant_id: data.tenant_id,
            start_date: data.start_date,
            end_date: null,
            monthly_rent: data.monthly_rent,
            deposit: data.deposit
        }
    );

    await exec(
        `UPDATE rooms SET status = :status WHERE id = :room_id`,
        { status: 'OCCUPIED', room_id: data.room_id }
    );
}

export async function terminate(id: number, data: TerminateLeaseInput) {
    const rowsLease = await query<LeaseRow>('SELECT * FROM leases WHERE id = :id', { id });
    const lease: LeaseRow = rowsLease[0];
    if (!lease) throw new NotFoundError('Lease not found')
    if (lease.status !== 'ACTIVE') throw new ConflictError('Lease already ended')
    if (data.end_date < new Date(lease.start_date).toISOString().split("T")[0]) throw new BadRequestError('end_date must be >= start_date')

    await exec(
        `UPDATE leases SET status = 'ENDED', end_date = :end_date WHERE id = :id AND status = 'ACTIVE'`,
        { id, end_date: data.end_date }
    );


    const rowsStillActive = await query<{ cnt: number }>(
        'SELECT COUNT(*) AS cnt FROM leases WHERE room_id = :room_id AND status = "ACTIVE"',
        { room_id: lease.room_id }
    );
    const count = rowsStillActive[0]?.cnt ?? 0;
    const hasStillActive = count > 0;
    console.log(hasStillActive)
    console.log(count)

    if (!hasStillActive) {
        await exec(
            `UPDATE rooms SET status = :status WHERE id = :room_id`,
            { status: 'VACANT', room_id: lease.room_id }
        );
    }


}












