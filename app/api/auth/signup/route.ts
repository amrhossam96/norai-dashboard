/**
 * Sign-up. Creates the account and signs it in straight away.
 *
 * There is no activation email: the dashboard has no mail transport of its own
 * and the norai backend has no user model to defer to. Invite-only access is
 * enforced by the waitlist on the landing page, not here.
 */
import { query, isUniqueViolation } from "@/lib/db/pg";
import { hashSecret } from "@/lib/auth/password";
import { randomUUID } from "@/lib/crypto";
import { AUTH_EMAIL_TAKEN, AUTH_FAILURE, AUTH_INVALID_INPUT, hasErrors, validateSignup, type AuthResult } from "@/lib/auth";
import { createSession } from "@/lib/session";

function reply(result: AuthResult, status: number) {
  return Response.json(result, { status });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (payload === null || typeof payload !== "object") return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);
  const input = payload as Record<string, unknown>;
  if (hasErrors(validateSignup(input))) return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);

  const userId = `usr_${randomUUID()}`;
  try {
    await query(
      "INSERT INTO dashboard.users (user_id, email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4, $5)",
      [
        userId,
        String(input.email).trim(),
        await hashSecret(String(input.password)),
        String(input.first_name).trim(),
        String(input.last_name).trim(),
      ],
    );
  } catch (err) {
    if (isUniqueViolation(err)) return reply({ status: "error", message: AUTH_EMAIL_TAKEN }, 400);
    console.error("[auth] signup failed", err);
    return reply({ status: "error", message: AUTH_FAILURE }, 502);
  }
  await createSession(userId);
  return reply({ status: "success", message: "" }, 200);
}
