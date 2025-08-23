import { query, exec } from '../../config/db.js';
import type { UtilityRate, MeterReading, InvoiceRow, InvoiceItemRow } from './billing.types.js';
import type { LeaseRow } from '../../schemas/lease.schema.js';

export async function getLatestRateForPeriod(period: string): Promise<UtilityRate | null> {
    const endOfPeriod = period + '-28';
    const rows = await query<UtilityRate>(
        `SELECT * FROM utility_rates WHERE effective_from <= :end ORDER BY effective_from DESC LIMIT 1`,
        { end: endOfPeriod }
    );
    return rows[0] || null;
}

export async function upsertReading(data: { room_id: number; period: string; electric: number; water: number }): Promise<number> {

    const res = await exec(
        `
        INSERT INTO meter_readings (room_id, period, electric, water)
        VALUES (:room_id, :period, :electric, :water)
        ON DUPLICATE KEY UPDATE electric = VALUES(electric), water = VALUES(water)
        `,
        data
    );
    return res.insertId || 0;
}

export async function listReadings(filter: { room_id?: number; period?: string }): Promise<MeterReading[]> {
    const where: string[] = [];
    const params: Record<string, any> = {};
    if (filter.room_id) {
        where.push('room_id = :room_id');
        params.room_id = filter.room_id;
    }
    if (filter.period) {
        where.push('period = :period');
        params.period = filter.period;
    }
    const sql = `SELECT * FROM meter_readings ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
    return query<MeterReading>(sql, params);
}

export async function listActiveLeasesOnPeriod(period: string): Promise<LeaseRow[]> {
    const rows = await query<LeaseRow>(
        `
        SELECT * FROM leases 
        WHERE status = 'ACTIVE' OR (status='ENDED' AND DATE_FORMAT(end_date, '%Y-%m') = :period)
        `,
        { period }
    );
    return rows;
}

export async function getReading(room_id: number, period: string): Promise<MeterReading | null> {
    const rows = await query<MeterReading>(
        `SELECT * FROM meter_readings WHERE room_id = :room_id AND period = :period`,
        { room_id, period }
    );
    return rows[0] || null;
}

export async function getInvoiceByLeasePeriod(lease_id: number, period: string): Promise<InvoiceRow | null> {
    const rows = await query<InvoiceRow>(
        `SELECT * FROM invoices WHERE lease_id = :lease_id AND period = :period`,
        { lease_id, period }
    );
    return rows[0] || null;
}

export async function createInvoice(data: { lease_id: number; period: string; total: number; due_date?: string | null }): Promise<number> {
    const res: any = await exec(
        `
        INSERT INTO invoices (lease_id, period, total, status, due_date)
        VALUES (:lease_id, :period, :total, 'PENDING', :due_date)
        `,
        { ...data, due_date: data.due_date ?? null }
    );
    return res.insertId as number;
}

export async function addItem(inv_id: number, item: Omit<InvoiceItemRow, 'id' | 'invoice_id' | 'created_at'>): Promise<number> {
    const res = await exec(
        `
        INSERT INTO invoice_items (invoice_id, type, qty, unit_price, amount, meta)
        VALUES (:invoice_id, :type, :qty, :unit_price, :amount, :meta)
        `,
        { invoice_id: inv_id, ...item }
    );
    return res.insertId as number;
}

export async function updateInvoiceTotal(inv_id: number): Promise<void> {
    await exec(
        `
        UPDATE invoices i 
        JOIN (SELECT invoice_id, COALESCE(SUM(amount),0) AS total FROM invoice_items WHERE invoice_id=:id) t 
        ON i.id=t.invoice_id 
        SET i.total=t.total`
        ,
        { id: inv_id }
    );
}

export async function listInvoices(filter: { period?: string }): Promise<InvoiceRow[]> {
    const where: string[] = [];
    const params: Record<string, any> = {};
    if (filter.period) {
        where.push('period = :period');
        params.period = filter.period;
    }
    const sql = `SELECT * FROM invoices ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
    return query<InvoiceRow>(sql, params);
}

export async function getInvoice(id: number): Promise<InvoiceRow | null> {
    const rows = await query<InvoiceRow>(`SELECT * FROM invoices WHERE id = :id`, { id });
    return rows[0] || null;
}

export async function listItems(invoice_id: number): Promise<InvoiceItemRow[]> {
    return query<InvoiceItemRow>(`SELECT * FROM invoice_items WHERE invoice_id = :invoice_id ORDER BY id ASC`, { invoice_id });
}
