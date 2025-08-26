import { z } from 'zod';

const PaymentCore = z.object({
    invoice_id: z.number().int().positive(),
    amount: z.number().positive(),
    method: z.enum(['CASH', 'TRANSFER', 'QR', 'CARD']).default('CASH'),
    paid_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    note: z.string().max(255).nullable().optional(),
});

export const CreatePaymentSchema = PaymentCore;


