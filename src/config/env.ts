import 'dotenv/config';

function reqEnv(key: string, fallback?: string) {
    const v = process.env[key] ?? fallback;
    if (!v) throw new Error(`Missing ENV: ${key}`);
    return v;
}

export const env = {
    PORT: Number(reqEnv('PORT', '3000')),
    NODE_ENV: reqEnv('NODE_ENV', 'development'),
    DB_URL: reqEnv('DB_URL'),
    JWT_SECRET: reqEnv('JWT_SECRET'),
    JWT_EXPIRES: reqEnv('JWT_EXPIRES', '15m'),
    REFRESH_SECRET: reqEnv('REFRESH_SECRET'),
    REFRESH_EXPIRES: reqEnv('REFRESH_EXPIRES', '7d'),
    CORS_ORIGINS: reqEnv('CORS_ORIGINS', '').split(',').filter(Boolean),

    COOKIE_NAME_REFRESH: reqEnv('COOKIE_NAME_REFRESH', 'refresh_token'),
    COOKIE_SAMESITE: reqEnv('COOKIE_SAMESITE', 'lax'), 
    COOKIE_SECURE: reqEnv('COOKIE_SECURE', 'false'),   
    COOKIE_DOMAIN: reqEnv('COOKIE_DOMAIN', ''),        
};
