import { z } from 'zod';

const emptyToNull = z
    .string()
    .transform((s) => s.trim())
    .transform((s) => (s === "" ? null : s));

const TenantCore = z.object({
    name: z.string().trim().min(1, 'name is required'),
    phone: z.string().min(3).max(30).nullable().optional(),
    email: z.string().email().nullable().optional(),
    citizen_id: z.string().min(5).max(30).nullable().optional(),
    note: z.string().max(1000).nullable().optional(),
});

export const CreateTenantSchema = TenantCore;
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;


export const UpdateTenantSchema = CreateTenantSchema.partial();
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;

export const TenantRowSchema = TenantCore.extend({
    id: z.number().int(),
    created_at: z.date(),
});
export type TenantRow = z.infer<typeof TenantRowSchema>;

export const TenantPartialSchema = TenantRowSchema.partial();
export type TenantPartial = z.infer<typeof TenantPartialSchema>;
export type TenantUpdatable = Omit<TenantPartial, "id" | "created_at">;
