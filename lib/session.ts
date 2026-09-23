import "server-only";

import { cookies } from "next/headers";
import { query, queryOne } from "@/lib/db/pg";
import { randomToken, sha256Hex } from "@/lib/crypto";

/**
 * Dashboard sessions.
 *
 * The norai backend has no human users: every /v1 call is authenticated by a
 * project API key. Sign-in is therefore the dashboard's own concern. A session
 * is a random token in an httpOnly cookie; only its SHA-256 is stored, so a
 * database read cannot be replayed as a cookie. Sign-out deletes the row, which
 * is real revocation.
 */
export const SESSION_COOKIE = "norai_session";
export const PROJECT_COOKIE = "norai_project";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // seconds

function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export interface SessionUser {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

export async function createSession(userId: string): Promise<void> {
  const token = randomToken();
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  await query(
    "INSERT INTO dashboard.sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)",
    [sha256Hex(token), userId, expires],
  );
  const store = await cookies();
  store.set(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_MAX_AGE });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await query("DELETE FROM dashboard.sessions WHERE token_hash = $1", [sha256Hex(token)]).catch(
      (err) => console.error("[session] delete failed", err),
    );
  }
  store.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  store.set(PROJECT_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
}

/** Presence check only; use getSessionUser() for the authoritative answer. */
export async function hasSession(): Promise<boolean> {
  const store = await cookies();
  return Boolean(store.get(SESSION_COOKIE)?.value);
}

/** The signed-in user, or null when the cookie is missing, unknown or expired. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return queryOne<SessionUser>(
    `SELECT u.user_id, u.email, u.first_name, u.last_name, u.created_at
       FROM dashboard.sessions s JOIN dashboard.users u USING (user_id)
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256Hex(token)],
  );
}

/** Which project the shell is looking at; validated against membership by the caller. */
export async function getProjectCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(PROJECT_COOKIE)?.value ?? null;
}

export async function setProjectCookie(projectId: string): Promise<void> {
  const store = await cookies();
  store.set(PROJECT_COOKIE, projectId, { ...cookieOptions(), httpOnly: false, maxAge: 365 * 24 * 60 * 60 });
}
