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

export const UpdateRoomSchema = RoomCore.partial();

