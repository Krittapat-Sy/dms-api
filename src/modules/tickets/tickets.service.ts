import { TicketFilter, TicketInsertDB, TicketRowDB, TicketUpdateDB } from "./ticket.types";
import { query, exec } from '../../config/db.js';
import { ResultSetHeader } from "mysql2";
class NotFoundError extends Error { code = 404 as const; }
class BadRequestError extends Error { code = 400 as const; }

export async function list(filter?: TicketFilter): Promise<TicketRowDB[]> {
    const where: string[] = [];
    const params: Record<string, any> = {};

    if (filter?.room_id) { where.push('room_id = :room_id'); params.room_id = filter.room_id; }
    if (filter?.tenant_id) { where.push('tenant_id = :tenant_id'); params.tenant_id = filter.tenant_id; }
    if (filter?.status) { where.push('status = :status'); params.status = filter.status; }
    if (filter?.priority) { where.push('priority = :priority'); params.priority = filter.priority; }

    const sql = `
            SELECT id, room_id, tenant_id, title, description, status, priority,
            assigned_to, resolved_at, created_at, updated_at
            FROM tickets
            ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC
        `;

    const rows: TicketRowDB[] = await query<TicketRowDB>(sql, params);
    return rows;
}

export async function get(id: number): Promise<TicketRowDB | undefined> {
    const rows: TicketRowDB[] = await query<TicketRowDB>(`
        SELECT id, room_id, tenant_id, title, description, status, priority,
        assigned_to, resolved_at, created_at, updated_at
        FROM tickets WHERE id = :id LIMIT 1
    `, { id });
    if (!rows.length) throw new NotFoundError('Ticket not found');

    return rows[0];
}

export async function create(data: TicketInsertDB): Promise<number> {
    if ((data.status === 'RESOLVED' || data.status === 'CLOSED') && !data.resolved_at) {
        data.resolved_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    data.status = data.status ?? 'OPEN';
    data.priority = data.priority ?? 'MEDIUM';
    data.assigned_to = data.assigned_to ?? null;
    data.resolved_at = data.resolved_at ?? null;
    const res: ResultSetHeader = await exec(`
        INSERT INTO tickets
        (room_id, tenant_id, title, description, status, priority, assigned_to, resolved_at)
        VALUES
        (:room_id, :tenant_id, :title, :description, :status, :priority, :assigned_to, :resolved_at)`
        , data
    );
    return res.insertId;
}

export async function update(id: number, data: TicketUpdateDB): Promise<void> {
    const hasAnyField = Object.keys(data).length > 0 && Object.values(data).some(v => v !== undefined);
    if (!hasAnyField) throw new BadRequestError('No fields to update');

    if ((data.status === 'RESOLVED' || data.status === 'CLOSED') && data.resolved_at === undefined) {
        data.resolved_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    const allowed = ['room_id', 'tenant_id', 'title', 'description', 'status', 'priority', 'assigned_to', 'resolved_at'] as const;
    const fields: string[] = [];
    const params: Record<string, any> = { id };

    for (const k of allowed) {
        if (Object.prototype.hasOwnProperty.call(data, k) && (data as any)[k] !== undefined) {
            fields.push(`${k} = :${k}`);
            params[k] = (data as any)[k];
        }
    }
    if (fields.length === 0) throw new BadRequestError('No fields to update');

    const res: ResultSetHeader = await exec(`UPDATE tickets SET ${fields.join(', ')} WHERE id = :id`, params);
    if (res.affectedRows === 0) throw new NotFoundError('Ticket not found');
}

export async function remove(id: number): Promise<void> {
    const res: ResultSetHeader = await exec(`DELETE FROM tickets WHERE id = :id`, { id });
    if (res.affectedRows === 0) throw new NotFoundError('Ticket not found');
}
