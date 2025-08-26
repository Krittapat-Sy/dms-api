export type PaymentRowDB = {
    id: number;
    invoice_id: number;
    amount: number;
    method: 'CASH' | 'TRANSFER' | 'QR' | 'CARD';
    paid_at: string;       
    note: string | null;
    created_at: string;
};

export type PaymentEditableCols = 'invoice_id' | 'amount' | 'method' | 'paid_at' | 'note';
export type PaymentInsertDB = Pick<PaymentRowDB, PaymentEditableCols>;
export type PaymentUpdateDB = Partial<PaymentInsertDB>;
