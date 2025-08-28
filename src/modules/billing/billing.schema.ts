import { z } from 'zod';


export const FilterListSchema = z.object({
    room_id: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.number().int().optional()
    ),
    period: z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.string().regex(/^\d{4}-\d{2}$/).optional()
    ),
}).strict();
export type FilterList = z.infer<typeof FilterListSchema>;

export const ReqParams = z.object({
    id: z.coerce.number<string>()
});

export const UpsertReadingSchema = z.object({
    room_id: z.number().int().positive(),
    period: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
    electric: z.number().nonnegative(),
    water: z.number().nonnegative(),
}).strict();
export type UpsertReadingInput = z.infer<typeof UpsertReadingSchema>;

export type InvoiceRow = {
    id: number;
    lease_id: number;
    period: string;
    total: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    due_date: string | null;
    created_at: string;
};

export type InvoiceItemRow = {
    id: number;
    invoice_id: number;
    type: 'RENT' | 'ELECTRIC' | 'WATER' | 'SERVICE' | 'OTHER';
    qty: number;
    unit_price: number;
    amount: number;
    meta: any | null;
    created_at: string;
};

export const PeriodSchema = z.object({
    period: z.string().regex(/^\d{4}-\d{2}$/),
});

export type UtilityRate = {
    id: number;
    electric_per_unit: number;
    water_per_unit: number;
    service_fee: number;
    effective_from: string;
    created_at: string;
};

export type MeterReading = {
    id: number;
    room_id: number;
    period: string;
    electric: number;
    water: number;
    created_at: string;
};
