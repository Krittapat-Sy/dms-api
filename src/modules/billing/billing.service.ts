import { FilterList, UpsertReadingInput, InvoiceRow, InvoiceItemRow, UtilityRate, MeterReading } from './billing.schema.js';
import { query, exec } from '../../config/db.js';
import { LeaseRow } from '../leases/lease.schema.js';
class NotFoundError extends Error { code = 404 as const; }
class BadRequestError extends Error { code = 400 as const; }

export async function listReadings(filter: FilterList): Promise<MeterReading[]> {
    let where: string[] = [];
    let params: Record<string, any> = {};
    if (filter.room_id) {
        where.push('room_id = :room_id');
        params.room_id = filter.room_id;
    }
    if (filter.period) {
        where.push('period = :period');
        params.period = filter.period;
    }
    const sql = `SELECT * FROM meter_readings ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
    const rows = query<MeterReading>(sql, params);
    return rows
}

export async function upsertReading(data: UpsertReadingInput): Promise<void> {
    await exec(
        `
        INSERT INTO meter_readings (room_id, period, electric, water)
        VALUES (:room_id, :period, :electric, :water)
        ON DUPLICATE KEY UPDATE electric = VALUES(electric), water = VALUES(water)
        `,
        data
    );
}

export async function listInvoices(period: string | undefined): Promise<InvoiceRow[]> {
    const where: string[] = [];
    const params: Record<string, any> = {};

    if (period) {
        where.push('period = :period');
        params.period = period;
    }
    const sql = `SELECT * FROM invoices ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC`;
    const rows = await query<InvoiceRow>(sql, params);

    return rows
}

export async function getInvoice(id: number) {
    const rowsInvoice = await query<InvoiceRow>(`SELECT * FROM invoices WHERE id = :id`, { id });
    const invoice = rowsInvoice[0];
    if (!invoice) throw new NotFoundError('Invoice not found')

    const items = await query<InvoiceItemRow>(`SELECT * FROM invoice_items WHERE invoice_id = :invoice_id ORDER BY id ASC`, { invoice_id: id });
    const res = {
        invoice: invoice,
        items
    }
    return res
}

export async function generateBilling(period: string): Promise<number> {
    const endOfPeriod = period + '-28';
    const rowsRate = await query<UtilityRate>(
        `SELECT * FROM utility_rates WHERE effective_from <= :end ORDER BY effective_from DESC LIMIT 1`,
        { end: endOfPeriod }
    );

    const rate = rowsRate[0]
    if (!rate) throw new BadRequestError('No utility rate configured');

    const leases = await query<LeaseRow>(
        `
        SELECT * FROM leases 
        WHERE status = 'ACTIVE' OR (status='ENDED' AND DATE_FORMAT(end_date, '%Y-%m') = :period)
        `,
        { period }
    );
    if (leases.length === 0) {
        return 0
    }

    let created = 0;

    for (const lease of leases) {
        let rowsInvoice = await query<InvoiceRow>(
            `SELECT * FROM invoices WHERE lease_id = :lease_id AND period = :period`,
            { lease_id: lease.id, period }
        );
        const exists = rowsInvoice[0];
        if (exists) continue;

        const rowsReading = await query<MeterReading>(
            `SELECT * FROM meter_readings WHERE room_id = :room_id AND period = :period`,
            { room_id: lease.room_id, period }
        );
        const reading = rowsReading[0];

        const electricUnits = reading?.electric ?? 0;
        const waterUnits = reading?.water ?? 0;

        const res = await exec(`
        INSERT INTO invoices (lease_id, period, total, status, due_date)
        VALUES (:lease_id, :period, :total, 'PENDING', :due_date)
        `, { lease_id: lease.id, period, total: 0, due_date: null }
        );
        const invId = res.insertId;


        await exec(`
            INSERT INTO invoice_items (invoice_id, type, qty, unit_price, amount, meta)
            VALUES (:invoice_id, :type, :qty, :unit_price, :amount, :meta)
        `, { invoice_id: invId, type: 'RENT', qty: 1, unit_price: lease.monthly_rent, amount: lease.monthly_rent, meta: null }
        );

        if (electricUnits > 0) {
            const amount = electricUnits * rate.electric_per_unit;
            await exec(`
                INSERT INTO invoice_items (invoice_id, type, qty, unit_price, amount, meta)
                VALUES (:invoice_id, :type, :qty, :unit_price, :amount, :meta)
            `, { invoice_id: invId, type: 'ELECTRIC', qty: electricUnits, unit_price: rate.electric_per_unit, amount, meta: null }
            );
        }
        if (waterUnits > 0) {
            const amount = waterUnits * rate.water_per_unit;
            await exec(`
                INSERT INTO invoice_items (invoice_id, type, qty, unit_price, amount, meta)
                VALUES (:invoice_id, :type, :qty, :unit_price, :amount, :meta)
            `, { invoice_id: invId, type: 'WATER', qty: waterUnits, unit_price: rate.water_per_unit, amount, meta: null }
            );
        }
        if (rate.service_fee > 0) {
            await exec(`
                INSERT INTO invoice_items (invoice_id, type, qty, unit_price, amount, meta)
                VALUES (:invoice_id, :type, :qty, :unit_price, :amount, :meta)
            `, { invoice_id: invId, type: 'SERVICE', qty: 1, unit_price: rate.service_fee, amount: rate.service_fee, meta: null }
            );
        }

        await exec(
            `
        UPDATE invoices i 
        JOIN (SELECT invoice_id, COALESCE(SUM(amount),0) AS total FROM invoice_items WHERE invoice_id=:id) t 
        ON i.id=t.invoice_id 
        SET i.total=t.total`
            ,
            { id: invId }
        );
        created++;
    }

    return created;
}




