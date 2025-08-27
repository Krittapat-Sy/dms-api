import { CreateTenantInput, TenantRow, UpdateTenantInput } from './tenant.schema.js';
import { query, exec } from '../../config/db.js';
import { ResultSetHeader } from 'mysql2';
class NotFoundError extends Error { code = 404 as const; }
class BadRequestError extends Error { code = 400 as const; }



export async function list() {
    const rows = await query<TenantRow>('SELECT * FROM tenants ORDER BY id DESC');
    return rows;
}

export async function getById(id: number) {
    const rows = await query<TenantRow>('SELECT * FROM tenants WHERE id = :id', { id });
    if (!rows.length) throw new NotFoundError('Tenant not found');

    return rows[0];
}

export async function create(data: CreateTenantInput): Promise<void> {
    await exec(`
        INSERT INTO tenants (name, phone, email, citizen_id, note)
        VALUES (:name, :phone, :email, :citizen_id, :note)
    `, {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        citizen_id: data.citizen_id ?? null,
        note: data.note ?? null
    }
    );
}

export async function update(id: number, data: UpdateTenantInput): Promise<void> {
    if (!data || Object.keys(data).length === 0) throw new BadRequestError('Empty update payload');

    const fields = Object.entries(data);
    const setClause = fields.map(([k]) => `${String(k)} = :${String(k)}`)

    const params: Record<string, unknown> = Object.fromEntries(fields);
    params.id = id;

    const res: ResultSetHeader = await exec(
        `UPDATE tenants SET ${setClause} WHERE id = :id`,
        params
    );
    if (res.affectedRows == 0) throw new NotFoundError('Tenant not found');
}

export async function remove(id: number): Promise<void> {
    const res: any = await exec('DELETE FROM tenants WHERE id = :id', { id });
    if (res.affectedRows === 0) throw new NotFoundError('Tenant not found');
}
