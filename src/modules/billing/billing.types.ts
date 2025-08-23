export type UtilityRate = {
    id: number;
    electric_per_unit: number;
    water_per_unit: number;
    service_fee: number;
    effective_from: string;  
    created_at: string;
};

export type MeterReading = {
    id: number;
    room_id: number;
    period: string;          
    electric: number;
    water: number;
    created_at: string;
};

export type InvoiceRow = {
    id: number;
    lease_id: number;
    period: string;          
    total: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    due_date: string | null; 
    created_at: string;
};

export type InvoiceItemRow = {
    id: number;
    invoice_id: number;
    type: 'RENT' | 'ELECTRIC' | 'WATER' | 'SERVICE' | 'OTHER';
    qty: number;
    unit_price: number;
    amount: number;
    meta: any | null;
    created_at: string;
};
