import { env } from 'cloudflare:workers';
import { AppError } from './server';
const encode = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const decode = (text: string) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
async function key() { const secret = (env as unknown as Record<string, string>).DEMO_SIGNING_SECRET || process.env.DEMO_SIGNING_SECRET; if (!secret)
    throw new AppError('DEMO_UNAVAILABLE', 'The public demo is not configured yet. The signed-in workspace is still available.', 503); const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)); return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']); }
export async function seal(value: unknown) { const iv = crypto.getRandomValues(new Uint8Array(12)); const bytes = new TextEncoder().encode(JSON.stringify({ expires: Date.now() + 6 * 60 * 60 * 1000, value })); const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await key(), bytes); return `${encode(iv)}.${encode(new Uint8Array(encrypted))}`; }
export async function unseal<T>(token: string): Promise<T> { try {
    if (token.length > 30000)
        throw Error();
    const [iv, cipher] = token.split('.');
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(iv) }, await key(), decode(cipher));
    const data = JSON.parse(new TextDecoder().decode(decrypted));
    if (data.expires < Date.now())
        throw Error();
    return data.value as T;
}
catch {
    throw new AppError('DEMO_EXPIRED', 'This demo quiz expired or was changed. Generate a fresh quiz to continue.', 400);
} }
