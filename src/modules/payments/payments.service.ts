import * as repo from './payments.repo.js';
import type { PaymentInsertDB, PaymentRowDB } from './payment.types.js';
class NotFoundError extends Error { code = 404 as const; }

export async function list(invoice_id: number): Promise<PaymentRowDB[]> {
    const rows = await repo.list({ invoice_id });
    if (!rows) throw new NotFoundError('Payment not found');
    return rows;
}

export async function get(id: number): Promise<PaymentRowDB | null> {
    const row = await repo.get(id);
    if (!row) throw new NotFoundError('Payment not found');
    return row;
}

export async function create(data: PaymentInsertDB): Promise<number> {
    const inv = await repo.getInvoice(data.invoice_id);
    if (!inv) throw new NotFoundError('Invoice not found');

    const id = await repo.insert(data);

    // อัปเดตสถานะใบแจ้งหนี้ถ้าจ่ายครบ
    const totalPaid = await repo.sumPayments(data.invoice_id);
    if (totalPaid >= inv.total && inv.status !== 'PAID') {
        await repo.setInvoiceStatus(data.invoice_id, 'PAID');
    }
    return id;
}

export async function remove(id: number): Promise<void> {
    const affected = await repo.remove(id);
    if (affected === 0) throw new NotFoundError('Payment not found');
}
