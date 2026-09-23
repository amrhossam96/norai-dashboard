/**
 * Sign-in. Verifies the password against dashboard.users and opens a session
 * (lib/session.ts). The norai backend is not involved: it has no human users.
 */
import { queryOne } from "@/lib/db/pg";
import { verifySecret } from "@/lib/auth/password";
import { AUTH_FAILURE, AUTH_INVALID_CREDENTIALS, AUTH_INVALID_INPUT, hasErrors, validateLogin, type AuthResult } from "@/lib/auth";
import { createSession } from "@/lib/session";

function reply(result: AuthResult, status: number) {
  return Response.json(result, { status });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (payload === null || typeof payload !== "object") return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);
  const input = payload as Record<string, unknown>;
  if (hasErrors(validateLogin(input))) return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);

  try {
    const user = await queryOne<{ user_id: string; password_hash: string }>(
      "SELECT user_id, password_hash FROM dashboard.users WHERE lower(email) = lower($1)",
      [String(input.email).trim()],
    );
    // Same answer for "no such user" and "wrong password": no account oracle.
    const ok = user ? await verifySecret(user.password_hash, String(input.password)) : false;
    if (!user || !ok) return reply({ status: "error", message: AUTH_INVALID_CREDENTIALS }, 401);
    await createSession(user.user_id);
    return reply({ status: "success", message: "" }, 200);
  } catch (err) {
    console.error("[auth] login failed", err);
    return reply({ status: "error", message: AUTH_FAILURE }, 502);
  }
}
