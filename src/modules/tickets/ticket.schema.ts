import { z } from "zod";

const TicketCore = z.object({
    room_id: z.number().int().positive(),
    tenant_id: z.number().int().positive().nullable().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
    assigned_to: z.string().max(100).nullable().optional(),
    resolved_at: z.string().datetime().nullable().optional(), 
});

export const CreateTicketSchema = TicketCore.extend({
    status: TicketCore.shape.status.default("OPEN"),
    priority: TicketCore.shape.priority.default("MEDIUM"),
});

export const UpdateTicketSchema = TicketCore.partial();

export const ListTicketQuerySchema = z.object({
    room_id: z.string().regex(/^\d+$/).transform(Number).optional(),
    tenant_id: z.string().regex(/^\d+$/).transform(Number).optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
});
