export const SESSION_COOKIE_NAME = "admin_session";
export const RESELLER_SESSION_COOKIE_NAME = "reseller_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 días

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("Falta configurar ADMIN_SESSION_SECRET en las variables de entorno.");
  }
  return secret;
}

async function hmac(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Buffer.from(signature).toString("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function createSignedToken(payload: string): Promise<string> {
  const signature = await hmac(payload, getSecret());
  return `${payload}.${signature}`;
}

async function verifySignedToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expected = await hmac(payload, getSecret());
  if (!timingSafeEqual(signature, expected)) return null;
  return payload;
}

export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  return createSignedToken(`${expiresAt}`);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const payload = await verifySignedToken(token);
  if (!payload) return false;
  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && Date.now() <= expiresAt;
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const validUsername = process.env.ADMIN_USERNAME ?? "";
  const validPassword = process.env.ADMIN_PASSWORD ?? "";
  if (!validUsername || !validPassword) return false;
  return timingSafeEqual(username, validUsername) && timingSafeEqual(password, validPassword);
}

export async function createResellerSessionToken(resellerId: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  return createSignedToken(`${resellerId}|${expiresAt}`);
}

export async function verifyResellerSessionToken(token: string | undefined): Promise<string | null> {
  const payload = await verifySignedToken(token);
  if (!payload) return null;
  const [resellerId, expiresAtRaw] = payload.split("|");
  const expiresAt = Number(expiresAtRaw);
  if (!resellerId || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;
  return resellerId;
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
