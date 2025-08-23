import { z } from 'zod';

export const UpsertReadingSchema = z.object({
    room_id: z.number().int().positive(),
    period: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
    electric: z.number().nonnegative(),
    water: z.number().nonnegative(),
});
export type UpsertReadingInput = z.infer<typeof UpsertReadingSchema>;

export const ListReadingQuerySchema = z.object({
    room_id: z.string().regex(/^\d+$/).transform(Number).optional(),
    period: z.string().regex(/^\d{4}-\d{2}$/).optional(),
});
export type ListReadingQuery = z.infer<typeof ListReadingQuerySchema>;

export const GenerateBillingQuerySchema = z.object({
    period: z.string().regex(/^\d{4}-\d{2}$/),
});
export type GenerateBillingQuery = z.infer<typeof GenerateBillingQuerySchema>;
