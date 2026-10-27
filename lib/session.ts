const encoder = new TextEncoder();

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function stringToBase64Url(value: string): string {
  return toBase64Url(encoder.encode(value).buffer as ArrayBuffer);
}

function base64UrlToString(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  return atob(padded);
}

async function sign(secret: string, message: string): Promise<string> {
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(signature);
}

export async function createSessionToken(secret: string, accountId: string, maxAgeSeconds: number): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload = `${stringToBase64Url(accountId)}.${expires}`;
  return `${payload}.${await sign(secret, payload)}`;
}

export async function verifySessionAccount(secret: string, token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [accountRaw, expiresRaw, signature] = parts;
  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) return null;
  if ((await sign(secret, `${accountRaw}.${expiresRaw}`)) !== signature) return null;
  try {
    const accountId = base64UrlToString(accountRaw);
    return accountId || null;
  } catch {
    return null;
  }
}
