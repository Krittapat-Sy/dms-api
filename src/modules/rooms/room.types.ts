export type RoomRowDB = {
    id: number;
    number: string;
    floor: number | null;
    size_sq_m: number | null;
    status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
    monthly_rent: number;
    deposit: number;
    created_at: string;
};

export type RoomEditableCols =
    | 'number' | 'floor' | 'size_sq_m' | 'status' | 'monthly_rent' | 'deposit';

export type RoomInsertDB = Pick<RoomRowDB, RoomEditableCols>;

export type RoomUpdateDB = Partial<RoomInsertDB>;


// export type RoomDTO2 = {
//     id: number;
//     number: string;
//     floor?: number | null;
//     sizeSqM?: number | null;
//     status: 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';
//     monthlyRent: number;
//     deposit: number;
//     createdAt: string; // หรือ Date ถ้ามีการแปลง
// };

// export function mapRoomRowToDTO2(r: RoomRowDB): RoomDTO2 {
//     return {
//         id: r.id,
//         number: r.number,
//         floor: r.floor,
//         sizeSqM: r.size_sq_m,
//         status: r.status,
//         monthlyRent: r.monthly_rent,
//         deposit: r.deposit,
//         createdAt: r.created_at,
//     };
// }
