export const ADMIN_SESSION_COOKIE = "otopz_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function getSigningKey(): Promise<CryptoKey | null> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const key = await getSigningKey();
  if (!key) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters");

  const payload = encodeBase64Url(
    new TextEncoder().encode(
      JSON.stringify({ email, expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 })
    )
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function verifyAdminSession(
  token: string | undefined
): Promise<{ email: string } | null> {
  if (!token) return null;

  try {
    const [payload, signature, ...extra] = token.split(".");
    if (!payload || !signature || extra.length > 0) return null;

    const key = await getSigningKey();
    if (!key) return null;
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(signature),
      new TextEncoder().encode(payload)
    );
    if (!isValid) return null;

    const session = JSON.parse(new TextDecoder().decode(decodeBase64Url(payload))) as {
      email?: unknown;
      expiresAt?: unknown;
    };
    if (
      typeof session.email !== "string" ||
      !session.email.includes("@") ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now()
    ) {
      return null;
    }

    return { email: session.email.toLowerCase() };
  } catch {
    return null;
  }
}
