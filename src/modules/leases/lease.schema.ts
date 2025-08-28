import { z } from 'zod';

export const LeaseReqQuerySchema = z.object({
    status: z
        .string()
        .transform((val) => (val === "" ? null : val))
        .pipe(z.enum(["ACTIVE", "ENDED"]).nullable())
        .optional(),
    room_id: z.coerce.number().int().optional(),
    tenant_id: z.coerce.number().int().optional(),
}).strict();
export type LeaseReqQuery = z.infer<typeof LeaseReqQuerySchema>;

export const LeaseReqParamsSchema = z.object({
    id: z.coerce.number<string>()
});

const LeaseCore = z.object({
    room_id: z.number().int().positive(),
    tenant_id: z.number().int().positive(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    monthly_rent: z.number().nonnegative(),
    deposit: z.number().nonnegative(),
});

export const CreateLeaseSchema = LeaseCore.strict();
export type CreateLeaseInput = z.infer<typeof CreateLeaseSchema>;

export const LeaseRowSchema = LeaseCore.extend({
    id: z.number().int(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(["ACTIVE", "ENDED"]),
    created_at: z.date(),
});
export type LeaseRow = z.infer<typeof LeaseRowSchema>;

export const TerminateLeaseSchema = z.object({
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
});
export type TerminateLeaseInput = z.infer<typeof TerminateLeaseSchema>;


