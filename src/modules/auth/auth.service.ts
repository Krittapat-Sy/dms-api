import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { RegisterSchema, LoginSchema } from '../../schemas/auth.schema.js';
import * as repo from './auth.repo.js';
import { hashPassword, comparePassword } from '../../utils/passwords.js';
import { signAccess, issueRefresh, verifyAccess, verifyRefreshRaw, JwtUser } from '../../utils/jwt.js';
import { baseCookieOptions, msFromDuration } from '../../utils/cookies.js';
import { env } from '../../config/env.js';
import { sha256Hex } from '../../utils/tokens.js';

function validate<T>(schema: z.ZodTypeAny, data: unknown): T {
    const parsed = schema.safeParse(data);
    if (!parsed.success)
        throw { status: 400, message: parsed.error.issues.map(i => i.message).join(', ') };
    return parsed.data as T;
}

export async function register(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password, role } =
            validate<{ email: string; password: string; role?: any }>(RegisterSchema, req.body);

        const exists = await repo.findByEmail(email);
        if (exists) throw { status: 409, message: 'Email already registered' };

        const hash = await hashPassword(password);
        await repo.insertUser(email, hash, role ?? 'MANAGER');

        res.status(201).json({ ok: true });
    } catch (e) { next(e); }
}

export async function login(req: Request, res: Response, next: NextFunction) {
    try {
        const { email, password } =
            validate<{ email: string; password: string }>(LoginSchema, req.body);

        const user = await repo.findByEmail(email);
        if (!user) throw { status: 401, message: 'Invalid credentials' };

        const ok = await comparePassword(password, user.password_hash);
        if (!ok) throw { status: 401, message: 'Invalid credentials' };

        const payload: JwtUser = { id: user.id, email: user.email, role: user.role };

        // access -> ส่งไปเก็บที่ frontend memory
        const accessToken = signAccess(payload);

        // refresh -> ออกใหม่พร้อม jti, เก็บ hash ลง DB และตั้ง cookie
        const { token: refreshToken, jti, exp } = issueRefresh(payload);
        const refreshHash = sha256Hex(refreshToken);
        const expiresAt = new Date(exp * 1000);

        await repo.insertRefreshToken({
            user_id: user.id,
            token_hash: refreshHash,
            jwt_id: jti,
            user_agent: req.headers['user-agent']?.toString() ?? null,
            ip: req.ip,
            expires_at: expiresAt
        });

        const base = baseCookieOptions();
        const refreshMaxAge = msFromDuration(env.REFRESH_EXPIRES);

        res.cookie(env.COOKIE_NAME_REFRESH, refreshToken, {
            ...base,
            path: '/api/v1/auth/refresh',
            ...(refreshMaxAge ? { maxAge: refreshMaxAge } : {})
        });

        res.json({
            ok: true,
            accessToken,
            user: { id: user.id, email: user.email, role: user.role }
        });
    } catch (e) { next(e); }
}

/**
 * ใช้งานกับ Authorization: Bearer <accessToken> เท่านั้น (access อยู่ที่ frontend)
 */
export async function me(req: Request, res: Response, next: NextFunction) {
    try {
        const fromHeader = req.headers.authorization?.replace('Bearer ', '');
        if (!fromHeader) throw { status: 401, message: 'Missing token' };

        const user = verifyAccess(fromHeader);
        res.json({ user });
    } catch (e) { next({ status: 401, message: 'Invalid token' }); }
}

/**
 * Refresh Rotation:
 * - ตรวจ refresh จาก cookie
 * - ถ้า token ถูก reuse (ไม่พบใน DB หรือถูก revoked) => revoke ทุก refresh ของ user
 * - ออก access + refresh ใหม่, revoke ตัวเก่า และบันทึกตัวใหม่
 */
export async function refresh(req: Request, res: Response, next: NextFunction) {
    try {
        const presented = req.cookies?.[env.COOKIE_NAME_REFRESH];
        if (!presented) throw { status: 401, message: 'Missing refresh token' };

        // JWT verify ก่อน
        const decoded = verifyRefreshRaw(presented);
        const user: JwtUser = { id: decoded.id, email: decoded.email, role: decoded.role };
        const presentedHash = sha256Hex(presented);

        // หาใน DB
        const row = await repo.findRefreshByHash(presentedHash);

        // กรณีถูก reuse: JWT ใช้ได้ แต่ไม่มี record หรือโดน revoke ไปแล้ว
        if (!row || row.revoked_at) {
            // ความเสี่ยงถูกขโมย token -> revoke refresh ทั้งหมดของ user
            await repo.revokeAllRefreshByUser(user.id);
            // ลบคุกกี้ทันที
            const base = baseCookieOptions();
            res.clearCookie(env.COOKIE_NAME_REFRESH, { ...base, path: '/api/v1/auth/refresh' });
            throw { status: 401, message: 'Refresh token reuse detected. All sessions revoked.' };
        }

        // ออก token ใหม่ (Rotation)
        const accessToken = signAccess(user);
        const { token: newRefresh, jti: newJti, exp: newExp } = issueRefresh(user);
        const newHash = sha256Hex(newRefresh);

        // บันทึกตัวใหม่ + revoke ตัวเก่า พร้อมอ้างอิง replaced_by
        await repo.insertRefreshToken({
            user_id: user.id,
            token_hash: newHash,
            jwt_id: newJti,
            user_agent: req.headers['user-agent']?.toString() ?? null,
            ip: req.ip,
            expires_at: new Date(newExp * 1000)
        });
        await repo.revokeRefreshByHash(presentedHash, newHash);

        // เซ็ต cookie ตัวใหม่แทน
        const base = baseCookieOptions();
        const refreshMaxAge = msFromDuration(env.REFRESH_EXPIRES);
        res.cookie(env.COOKIE_NAME_REFRESH, newRefresh, {
            ...base,
            path: '/api/v1/auth/refresh',
            ...(refreshMaxAge ? { maxAge: refreshMaxAge } : {})
        });

        res.json({ ok: true, accessToken });
    } catch (e) { next({ status: (e as any).status || 401, message: (e as any).message || 'Invalid refresh token' }); }
}

export async function logout(req: Request, res: Response) {
    const base = baseCookieOptions();
    const presented = req.cookies?.[env.COOKIE_NAME_REFRESH];

    if (presented) {
        const hash = sha256Hex(presented);
        await repo.revokeRefreshByHash(hash);
    }

    res.clearCookie(env.COOKIE_NAME_REFRESH, { ...base, path: '/api/v1/auth/refresh' });
    res.json({ ok: true });
}
