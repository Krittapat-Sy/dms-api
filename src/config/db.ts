import mysql from 'mysql2/promise';
import { env } from './env.js';

export const pool = mysql.createPool({
    uri: env.DB_URL,
    connectionLimit: 10,
    namedPlaceholders: true
});

export async function query<T = any>(sql: string, params?: any): Promise<T[]> {
    const [rows] = await pool.query(sql, params);
    return rows as T[];
}

export async function exec(sql: string, params?: any) {
    await pool.execute(sql, params);
}
