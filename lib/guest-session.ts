const encoder = new TextEncoder();
const SESSION_SECONDS = 60 * 60 * 24 * 30;

type Session = { id: string; exp: number };

function base64url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

async function signingKey(secret: string) {
  const keyMaterial = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`edtech-guest-session-v1:${secret}`),
  );
  return crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createGuestSession(secret: string, id: string) {
  const payload = base64url(
    encoder.encode(JSON.stringify({ id, exp: Date.now() + SESSION_SECONDS * 1000 })),
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    await signingKey(secret),
    encoder.encode(payload),
  );
  return { token: `${payload}.${base64url(new Uint8Array(signature))}`, maxAge: SESSION_SECONDS };
}

export async function readGuestSession(cookieHeader: string | null, secret: string) {
  if (!cookieHeader) return null;
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("edtech_session="))
    ?.slice("edtech_session=".length);
  if (!token || token.length > 1000) return null;

  try {
    const [payload, encodedSignature, extra] = token.split(".");
    if (!payload || !encodedSignature || extra) return null;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret),
      fromBase64url(encodedSignature),
      encoder.encode(payload),
    );
    if (!valid) return null;
    const session = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as Session;
    if (!/^[0-9a-f-]{36}$/i.test(session.id) || session.exp <= Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}
