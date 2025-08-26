import { query, exec, pool } from '../../config/db.js';
import type { PaymentInsertDB, PaymentRowDB } from './payment.types.js';
import type { InvoiceRow } from '../billing/billing.types.js';
import { ResultSetHeader } from 'mysql2';

export async function list(filter?: { invoice_id?: number }): Promise<PaymentRowDB[]> {
    const where: string[] = [];
    const params: Record<string, any> = {};
    if (filter?.invoice_id) { where.push('invoice_id = :invoice_id'); params.invoice_id = filter.invoice_id; }

    const sql = `
                SELECT id, invoice_id, amount, method, paid_at, note, created_at
                FROM payments
                ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
                ORDER BY id DESC
                `;
    return await query<PaymentRowDB>(sql, params);
}

export async function get(id: number): Promise<PaymentRowDB | undefined> {
    const rows = await query<PaymentRowDB>(
        `
        SELECT id, invoice_id, amount, method, paid_at, note, created_at
        FROM payments WHERE id = :id LIMIT 1
        `,
        { id }
    );
    return rows[0];
}

export async function insert(data: PaymentInsertDB): Promise<number> {
    const res: ResultSetHeader = await exec(
        `INSERT INTO payments (invoice_id, amount, method, paid_at, note)
        VALUES (:invoice_id, :amount, :method, :paid_at, :note)`,
        {
            invoice_id: data.invoice_id,
            amount: data.amount,
            method: data.method,
            paid_at: data.paid_at,
            note: data.note ?? null,
        }
    );
    return res.insertId as number;
}

export async function remove(id: number): Promise<number> {
    const res: ResultSetHeader = await exec(`DELETE FROM payments WHERE id = :id`, { id });
    return res.affectedRows as number;
}


export async function getInvoice(id: number): Promise<InvoiceRow | null> {
    const rows = await query<InvoiceRow>(`SELECT * FROM invoices WHERE id = :id`, { id });
    return rows[0] ?? null;
}

export async function sumPayments(invoice_id: number): Promise<number> {
    const rows = await query<{ total: number }>(
        `SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE invoice_id = :invoice_id`,
        { invoice_id }
    );
    return Number(rows[0]?.total || 0);
}

export async function setInvoiceStatus(id: number, status: InvoiceRow['status']): Promise<number> {
    const [res]: any = await exec(`UPDATE invoices SET status = :status WHERE id = :id`, { id, status });
    return res.affectedRows as number;
}
