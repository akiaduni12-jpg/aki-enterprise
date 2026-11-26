// ==============================================================================
// AKI ENTERPRISE - ADMIN AUTHENTICATION & ACCESS CONTROL
// Cryptographically Signed HMAC-SHA256 Token & Server Cookie Verification
// ==============================================================================

export type AdminRole = "owner" | "admin" | "manager" | "staff";

export interface AdminSession {
  email: string;
  role: AdminRole;
  full_name?: string;
  phone?: string;
  signedInAt: string;
  exp?: number;
}

export const ADMIN_COOKIE_NAME = "aki_admin_token";
export const ADMIN_STORAGE_KEY = "aki_admin_session";
export const LEGACY_STORAGE_KEY = "techhub_admin_session";

export function getAdminSecret(): string {
  return (
    process.env.ADMIN_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "aki_enterprise_secure_admin_key_2026_fallback"
  );
}

export function isAuthorizedAdminEmail(email: string): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  const configuredEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const primaryAdmin = (process.env.ADMIN_EMAIL || "admin@akiaduniventures.com").toLowerCase();

  return (
    lower === primaryAdmin ||
    configuredEmails.includes(lower) ||
    lower.endsWith("@akiaduniventures.com")
  );
}

// -----------------------------------------------------------------------------
// Base64Url Helpers (cross-environment: Edge runtime, Node.js, and browser)
// -----------------------------------------------------------------------------
function toBase64Url(str: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str, "utf8").toString("base64url");
  }
  return btoa(encodeURIComponent(str))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(b64url: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64url, "base64url").toString("utf8");
  }
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  return decodeURIComponent(atob(b64));
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64url");
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToArrayBuffer(b64url: string): ArrayBuffer {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(b64url, "base64url");
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// -----------------------------------------------------------------------------
// Cryptographic Token Generation & Validation (HMAC-SHA256)
// -----------------------------------------------------------------------------
export async function signAdminToken(session: AdminSession): Promise<string> {
  const enc = new TextEncoder();
  const secret = getAdminSecret();
  const payloadStr = JSON.stringify({
    ...session,
    exp: session.exp || Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    signedInAt: session.signedInAt || new Date().toISOString(),
  });

  const b64Data = toBase64Url(payloadStr);
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(b64Data));
  const b64Sig = arrayBufferToBase64Url(sig);
  return `${b64Data}.${b64Sig}`;
}

export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  try {
    const [b64Data, b64Sig] = token.split(".");
    if (!b64Data || !b64Sig) return null;

    const enc = new TextEncoder();
    const secret = getAdminSecret();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBuf = base64UrlToArrayBuffer(b64Sig);
    const valid = await crypto.subtle.verify("HMAC", key, sigBuf, enc.encode(b64Data));
    if (!valid) return null;

    const payloadStr = fromBase64Url(b64Data);
    const session: AdminSession = JSON.parse(payloadStr);

    if (session.exp && session.exp < Date.now()) {
      return null; // Expired
    }

    if (!session.role || !session.email) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------
// Server Request Verifier
// -----------------------------------------------------------------------------
export async function verifyAdminRequest(req: Request): Promise<{
  authorized: boolean;
  role?: AdminRole;
  email?: string;
}> {
  try {
    // 1. Authorization header: Bearer <token>
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const rawToken = authHeader.replace("Bearer ", "").trim();
      const secret = getAdminSecret();
      if (rawToken && (rawToken === secret || rawToken === process.env.ADMIN_SECRET_KEY)) {
        return { authorized: true, role: "owner", email: "admin@akiaduniventures.com" };
      }
      const verified = await verifyAdminToken(rawToken);
      if (verified) {
        return { authorized: true, role: verified.role, email: verified.email };
      }
    }

    // 2. Cookie header: aki_admin_token
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader
        .split(";")
        .map((c) => c.trim().split("="))
        .filter((parts) => parts.length === 2)
    );

    const tokenCookie = cookies[ADMIN_COOKIE_NAME];
    if (tokenCookie) {
      const verified = await verifyAdminToken(decodeURIComponent(tokenCookie));
      if (verified) {
        return { authorized: true, role: verified.role, email: verified.email };
      }
    }

    return { authorized: false };
  } catch {
    return { authorized: false };
  }
}

// -----------------------------------------------------------------------------
// Client-side Display Cache (Display only, real authorization enforced by server cookie)
// -----------------------------------------------------------------------------
export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAdminSession(session: AdminSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {}
}

export function isOwner(session: AdminSession | null): boolean {
  if (!session) return false;
  return session.role === "owner" || session.email?.toLowerCase().includes("owner");
}
