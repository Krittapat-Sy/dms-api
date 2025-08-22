import { ResultSetHeader } from 'mysql2';
import { query, exec } from '../../config/db.js';
import type { TenantPartial, TenantUpdatable } from '../../schemas/tenant.schema.js';

export async function list(): Promise<TenantPartial[]> {
    return await query<TenantPartial>('SELECT * FROM tenants ORDER BY id DESC');
}

export async function get(id: number): Promise<TenantPartial | null> {
    const rows = await query<TenantPartial>('SELECT * FROM tenants WHERE id = :id', { id });
    return rows[0] || null;
}

export async function create(data: Omit<TenantPartial, 'id' | 'created_at'>) {
    await exec(
        `
        INSERT INTO tenants (name, phone, email, citizen_id, note)
        VALUES (:name, :phone, :email, :citizen_id, :note)`
        , {
            name: data.name,
            phone: data.phone,
            email: data.email,
            citizen_id: data.citizen_id,
            note: data.note,
        }
    );
}

export async function update(id: number,data: Partial<TenantUpdatable>): Promise<number> {
    const fields = Object.entries(data) as
        [keyof TenantUpdatable, TenantUpdatable[keyof TenantUpdatable]][];

    if (fields.length === 0) return 0;

    const setClause = fields
        .map(([k]) => `${String(k)} = :${String(k)}`)
        .join(", ");

    const params: Record<string, unknown> = Object.fromEntries(fields);

    params.id = id;

    const result: ResultSetHeader = await exec(
        `UPDATE tenants SET ${setClause} WHERE id = :id`,
        params
    );

    return result.affectedRows as number;
}

export async function remove(id: number): Promise<number> {
    const result: any = await exec('DELETE FROM tenants WHERE id = ?', [id]);
    return result.affectedRows as number;
}
