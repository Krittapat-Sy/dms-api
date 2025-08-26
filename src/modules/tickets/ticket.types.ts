export type TicketRowDB = {
    id: number;
    room_id: number;
    tenant_id: number | null;
    title: string;
    description?: string | null;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    assigned_to: string | null;
    resolved_at: string | null;
    created_at: string;
    updated_at: string;
};

export type TicketEditableCols =
    | 'room_id' | 'tenant_id' | 'title' | 'description'
    | 'status' | 'priority' | 'assigned_to' | 'resolved_at';

export type TicketInsertDB = Pick<TicketRowDB, TicketEditableCols>;
export type TicketUpdateDB = Partial<TicketInsertDB>;

export type TicketFilter = {
    room_id?: number;
    tenant_id?: number;
    status?: TicketRowDB['status'];
    priority?: TicketRowDB['priority'];
};

