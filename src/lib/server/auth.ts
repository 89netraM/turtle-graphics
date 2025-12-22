import bcrypt from "bcrypt";
import type { Cookies } from "@sveltejs/kit";

const SALT_ROUNDS = 10;
const SESSION_COOKIE_NAME = "turtle_session";
const PIN_COOKIE_NAME = "turtle_pin";

/**
 * Generate a random 6-digit PIN code
 */
export function generatePin(): string {
  const pin = Math.floor(100000 + Math.random() * 900000);
  return pin.toString();
}

/**
 * Hash a password/PIN using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password/PIN against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Set the session cookie for a user
 */
export function setSession(cookies: Cookies, username: string, pin: string): void {
  cookies.set(SESSION_COOKIE_NAME, username, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  // Store PIN in a separate cookie (httpOnly for security)
  cookies.set(PIN_COOKIE_NAME, pin, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

/**
 * Get the current username from the session cookie
 */
export function getSession(cookies: Cookies): string | null {
  return cookies.get(SESSION_COOKIE_NAME) ?? null;
}

/**
 * Get the session with PIN
 */
export function getSessionWithPin(cookies: Cookies): { username: string; pin: string } | null {
  const username = cookies.get(SESSION_COOKIE_NAME);
  const pin = cookies.get(PIN_COOKIE_NAME);

  if (!username || !pin) {
    return null;
  }

  return { username, pin };
}

/**
 * Clear the session cookie (sign out)
 */
export function clearSession(cookies: Cookies): void {
  cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
  cookies.delete(PIN_COOKIE_NAME, { path: "/" });
}
