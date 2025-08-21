// src/utils/cookies.ts
import type { CookieOptions } from 'express';
import { env } from '../config/env.js';

const isProd = env.NODE_ENV === 'production';

/**
 * แปลง "15m" | "7d" | "900" (วินาที) -> มิลลิวินาทีสำหรับ cookie.maxAge
 */
export function msFromDuration(input: string): number | undefined {
    if (!input) return undefined;
    // เลขล้วน = วินาที
    if (/^\d+$/.test(input)) return Number(input) * 1000;

    const m = input.match(/^(\d+)(s|m|h|d|w)$/i);
    if (!m) return undefined;
    const n = Number(m[1]);
    const unit = m[2].toLowerCase();
    const mult: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000
    };
    return n * mult[unit];
}

/**
 * ค่าพื้นฐานของคุกกี้ (httpOnly + sameSite/secure/domain)
 */
export function baseCookieOptions(): CookieOptions {
    const sameSite = (env.COOKIE_SAMESITE.toLowerCase() as CookieOptions['sameSite']) || 'lax';
    // ถ้า sameSite=none ต้อง secure=true (โดยเฉพาะ production/https)
    const secure = env.COOKIE_SECURE === 'true' || (isProd && sameSite === 'none');

    const opts: CookieOptions = {
        httpOnly: true,
        sameSite,
        secure
    };

    if (env.COOKIE_DOMAIN) {
        opts.domain = env.COOKIE_DOMAIN;
    }
    return opts;
}
