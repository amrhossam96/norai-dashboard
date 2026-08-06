import "server-only";

import { cookies } from "next/headers";

/**
 * Session storage for the dashboard.
 *
 * The Go API is stateless: POST /v1/auth/token returns a 7-day HS256 JWT and
 * AuthTokenMiddleware expects it back as `Authorization: Bearer <token>`. There
 * is no session cookie on the backend, so the browser has to hold that string
 * somewhere.
 *
 * It is held in an httpOnly cookie rather than localStorage. localStorage is
 * readable by any script on the page, so a single XSS — in our code or in a
 * dependency — walks off with a credential that stays valid for a week. An
 * httpOnly cookie is invisible to JavaScript; only the server reads it, adds
 * the Bearer header, and calls Go. The backend needs no changes for this.
 *
 * `import "server-only"` makes importing this from a client component a build
 * error rather than a leaked token.
 */

export const SESSION_COOKIE = "norai_session";

/**
 * Matches the backend's JWT_TOKEN_EXP (168h). Kept slightly under the token's
 * own lifetime so the cookie disappears before the token it carries goes stale,
 * rather than the browser sending a credential the API will reject.
 */
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 - 60; // 7 days minus a minute

function cookieOptions() {
  return {
    httpOnly: true,
    // Secure breaks plain-HTTP localhost, so it follows the deployment.
    secure: process.env.NODE_ENV === "production",
    // "lax" still sends the cookie on top-level navigation into the dashboard
    // (e.g. the activation link in an email) while blocking cross-site POSTs.
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function createSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    ...cookieOptions(),
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  // Delete by overwriting with an expired value: a bare delete() can miss when
  // the attributes do not match the ones the cookie was written with.
  store.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

/** The raw JWT, or null when signed out. Server-side only. */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Whether a session cookie is present.
 *
 * This is a presence check, not a validation: the signature is verified by the
 * Go API on every call. Treat it as "show the dashboard shell", never as
 * "this user is authorised" — authorisation is the backend's answer, and a 401
 * from it is the real source of truth.
 */
export async function hasSession(): Promise<boolean> {
  return (await getSessionToken()) !== null;
}
