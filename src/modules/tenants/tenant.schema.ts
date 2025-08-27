import { z } from 'zod';

export const Params = z.object({
    id: z.coerce.number<string>()
});

const TenantCore = z.object({
    name: z.string().trim().min(1, 'name is required'),
    phone: z.string().min(3).max(30).nullable().optional(),
    email: z.string().email().nullable().optional(),
    citizen_id: z.string().min(5).max(30).nullable().optional(),
    note: z.string().max(1000).nullable().optional(),
});

export const TenantRowSchema = TenantCore.extend({
    id: z.number().int(),
    created_at: z.date(),
});
export type TenantRow = z.infer<typeof TenantRowSchema>;

export const CreateTenantSchema = TenantCore;
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;

export const UpdateTenantSchema = CreateTenantSchema.partial();
export type UpdateTenantInput = z.infer<typeof UpdateTenantSchema>;