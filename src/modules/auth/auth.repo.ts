import { query, exec } from '../../config/db.js';
import { UserRow, RefreshRow } from './auth.types.js';

export async function findByEmail(email: string): Promise<UserRow | undefined> {
    const rows = await query<UserRow>('SELECT id, email, password_hash, role FROM users WHERE email = :email LIMIT 1', { email });
    return rows[0];
}

export async function insertUser(email: string, password_hash: string, role: UserRow['role']) {
    await exec('INSERT INTO users (email, password_hash, role) VALUES (:email, :password_hash, :role)', {
        email, password_hash, role
    });
}

export async function findById(id: number): Promise<UserRow | undefined> {
    const rows = await query<UserRow>('SELECT id,email,role,password_hash FROM users WHERE id = :id', { id });
    return rows[0];
}

export async function insertRefreshToken(params: {
    user_id: number;
    token_hash: string;
    jwt_id: string;
    user_agent?: string | null;
    ip?: string | null;
    expires_at: Date;
}) {
    await exec(
        `
        INSERT INTO refresh_tokens (user_id, token_hash, jwt_id, user_agent, ip, expires_at)
        VALUES (:user_id, :token_hash, :jwt_id, :user_agent, :ip, :expires_at)
        `,
        {
            user_id: params.user_id,
            token_hash: params.token_hash,
            jwt_id: params.jwt_id,
            user_agent: params.user_agent ?? null,
            ip: params.ip ?? null,
            expires_at: params.expires_at
        }
    );
}

export async function findRefreshByHash(hash: string): Promise<RefreshRow | undefined> {
    const rows = await query<RefreshRow>(
        'SELECT * FROM refresh_tokens WHERE token_hash = :hash LIMIT 1',
        { hash }
    );
    return rows[0];
}

export async function revokeRefreshByHash(hash: string, replacedBy?: string) {
    await exec(
        `
        UPDATE refresh_tokens
        SET revoked_at = NOW(), replaced_by = :replacedBy
        WHERE token_hash = :hash AND revoked_at IS NULL
        `, { hash, replacedBy: replacedBy ?? null }
    );
}

export async function revokeAllRefreshByUser(user_id: number) {
    await exec(
        `
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE user_id = :user_id AND revoked_at IS NULL`
        , { user_id }
    );
}