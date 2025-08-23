import { z } from 'zod';

const LeaseCore = z.object({
    room_id: z.number().int().positive(),
    tenant_id: z.number().int().positive(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    monthly_rent: z.number().nonnegative(),
    deposit: z.number().nonnegative().default(0),
});

export const CreateLeaseSchema = LeaseCore;
export type CreateLeaseInput = z.infer<typeof CreateLeaseSchema>;

export const LeaseRowSchema = LeaseCore.extend({
    id: z.number().int(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(["ACTIVE", "ENDED"]),
    created_at: z.date(),
});
export type LeaseRow = z.infer<typeof LeaseRowSchema>;

export const LeasePartialSchema = LeaseRowSchema.partial();
export type LeasePartial = z.infer<typeof LeasePartialSchema>;


export const TerminateLeaseSchema = z.object({
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});
export type TerminateLeaseInput = z.infer<typeof TerminateLeaseSchema>;


