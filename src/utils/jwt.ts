import jwt, { type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { env } from '../config/env.js';
import { v4 as uuid } from 'uuid';

export type Role = 'ADMIN' | 'MANAGER' | 'TENANT';
export type JwtUser = {
  id: number;
  email: string;
  role: Role
};

const ACCESS_SECRET: Secret = env.JWT_SECRET;
const REFRESH_SECRET: Secret = env.REFRESH_SECRET;

function toExpires(v: string): SignOptions['expiresIn'] {
  if (/^\d+$/.test(v)) return Number(v);
  return v as StringValue;
}

const accessOpts: SignOptions = { expiresIn: toExpires(env.JWT_EXPIRES) };
const refreshOptsBase: SignOptions = { expiresIn: toExpires(env.REFRESH_EXPIRES) };

export function signAccess(payload: JwtUser): string {
  return jwt.sign(payload, ACCESS_SECRET, accessOpts);
}

export function issueRefresh(payload: JwtUser): { token: string; jti: string; exp: number } {
  const jti = uuid();
  const token = jwt.sign(payload, REFRESH_SECRET, { ...refreshOptsBase, jwtid: jti });

  const decoded = jwt.decode(token) as JwtPayload | null;
  const exp = decoded?.exp ?? Math.floor(Date.now() / 1000) + 60;

  return { token, jti, exp };
}

export function verifyAccess(token: string): JwtUser {
  return jwt.verify(token, ACCESS_SECRET) as JwtUser;
}

export function verifyRefreshRaw(token: string): JwtUser & JwtPayload {
  return jwt.verify(token, REFRESH_SECRET) as JwtUser & JwtPayload; 
}
