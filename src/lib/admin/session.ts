import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Single-password admin session.
 *
 * There is one admin password (no user table): the signed-in state is a cookie
 * holding an expiry plus an HMAC of it keyed by that password. Nothing is
 * stored server-side, and changing `ADMIN_PASSWORD` invalidates every existing
 * session at once.
 */

export const SESSION_COOKIE = "belleva_admin";
const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

function password(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

function sign(payload: string): string {
  return createHmac("sha256", password()).update(payload).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Constant-time comparison, and false when no password is configured at all. */
export function verifyPassword(input: string): boolean {
  const expected = password();
  if (!expected) return false;
  return safeEqual(input, expected);
}

export function createSessionToken(): string {
  const expires = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expires}.${sign(expires)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expires, mac] = token.split(".");
  if (!expires || !mac) return false;
  if (!safeEqual(mac, sign(expires))) return false;
  return Number(expires) > Date.now();
}

export async function isSignedIn(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
