/**
 * Sign-up proxy for POST /v1/auth/user.
 *
 * Registration does NOT create a session. The backend stores the user inactive
 * and emails an activation link (or, with MAIL_TRANSPORT=log, prints it), so
 * there is no token to hold onto yet. The user activates, then signs in.
 */
import { apiFetch, NoraiApiError } from "@/lib/api/client";
import {
  AUTH_EMAIL_TAKEN,
  AUTH_FAILURE,
  AUTH_INVALID_INPUT,
  AUTH_SIGNUP_SUCCESS,
  hasErrors,
  validateSignup,
  type AuthResult,
} from "@/lib/auth";

function reply(result: AuthResult, status: number) {
  return Response.json(result, { status });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (payload === null || typeof payload !== "object") {
    return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);
  }

  const input = payload as Record<string, unknown>;
  const errors = validateSignup(input);
  if (hasErrors(errors)) {
    // The form validates the same rules before submitting, so reaching here
    // means a hand-rolled request; one generic message is enough.
    return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);
  }

  const body = {
    first_name: String(input.first_name).trim(),
    last_name: String(input.last_name).trim(),
    // Trim only — case is the database's job (users.email is CITEXT).
    email: String(input.email).trim(),
    password: String(input.password),
  };

  try {
    // 201 Created, body {"data":null}.
    await apiFetch<null>("/auth/user", { method: "POST", body });
    return reply({ status: "success", message: AUTH_SIGNUP_SUCCESS }, 200);
  } catch (err) {
    if (err instanceof NoraiApiError && err.status === 400) {
      // The Go handler collapses "email already registered" and "invalid input
      // fields" into 400, distinguished only by the message string.
      const taken = /already registered/i.test(err.message);
      return reply(
        { status: "error", message: taken ? AUTH_EMAIL_TAKEN : AUTH_INVALID_INPUT },
        400,
      );
    }
    console.error("[auth] signup failed", err);
    return reply({ status: "error", message: AUTH_FAILURE }, 502);
  }
}
