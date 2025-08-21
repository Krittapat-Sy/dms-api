export type UserRow = {
    id: number;
    email: string;
    password_hash: string;
    role: 'ADMIN' | 'MANAGER' | 'TENANT';
};

export type RefreshRow = {
    id: number;
    user_id: number;
    token_hash: string;
    jwt_id: string;
    user_agent: string | null;
    ip: string | null;
    expires_at: string;
    revoked_at: string | null;
    replaced_by: string | null;
    created_at: string;
};