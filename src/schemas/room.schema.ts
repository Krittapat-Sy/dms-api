import { z } from "zod";

const RoomCore = z.object({
    number: z.string().min(1),
    floor: z.number().int().nullable().optional(),
    size_sq_m: z.number().positive().nullable().optional(),
    status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE"]).optional(),
    monthly_rent: z.number().nonnegative(),
    deposit: z.number().nonnegative().optional(),
});

export const CreateRoomSchema = RoomCore.extend({
    status: RoomCore.shape.status.default("VACANT"),
    deposit: RoomCore.shape.deposit.default(0),
});
export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;

export const UpdateRoomSchema = RoomCore.partial();
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;

export const RoomRowSchema = RoomCore.extend({
    id: z.number().int(),
    created_at: z.date(),
    status: z.enum(["VACANT", "OCCUPIED", "MAINTENANCE"]),
    deposit: z.number().nonnegative(), 
});
export type RoomRow = z.infer<typeof RoomRowSchema>;

export const RoomPartialSchema = RoomRowSchema.partial();
export type RoomPartial = z.infer<typeof RoomPartialSchema>;
