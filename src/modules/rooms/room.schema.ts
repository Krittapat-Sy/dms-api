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
}).strict();

export const RoomRowSchema = RoomCore.extend({
    id: z.number().int(),
    created_at: z.date(),
});

export const UpdateRoomSchema = RoomCore.partial().strict();

export const Params = z.object({
    id: z.coerce.number<string>()
});

export type Room = z.infer<typeof RoomRowSchema>;
export type RoomInsert = z.infer<typeof RoomCore>;
export type RoomUpdate = z.infer<typeof UpdateRoomSchema>;

