/**
 * Sign-in proxy.
 *
 * The browser posts here, never to the Go API directly. This handler exchanges
 * the credentials for a JWT and stores it in an httpOnly cookie, so the token
 * itself never reaches JavaScript (see lib/session.ts for why).
 *
 * A side benefit: because the browser only ever talks to this origin, the
 * backend's CORS_ALLOWED_ORIGINS never has to list a production domain.
 */
import { apiFetch, NoraiApiError } from "@/lib/api/client";
import type { LoginRequest, LoginResponse } from "@/lib/api/types";
import {
  AUTH_FAILURE,
  AUTH_INVALID_CREDENTIALS,
  AUTH_INVALID_INPUT,
  hasErrors,
  validateLogin,
  type AuthResult,
} from "@/lib/auth";
import { createSession } from "@/lib/session";

function reply(result: AuthResult, status: number) {
  return Response.json(result, { status });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (payload === null || typeof payload !== "object") {
    return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);
  }

  const input = payload as Record<string, unknown>;
  const errors = validateLogin(input);
  if (hasErrors(errors)) {
    // Deliberately generic: a field-level message here would confirm which half
    // of the pair was wrong.
    return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);
  }

  const body: LoginRequest = {
    // Trimmed but not lower-cased. users.email is CITEXT, so the database
    // matches case-insensitively; folding here would only stop the address
    // being stored the way the user typed it. The trim stays because the Go
    // validator rejects padded addresses outright, and a stray pasted space
    // should not read as "wrong password".
    email: String(input.email).trim(),
    password: String(input.password),
  };

  try {
    // 201 Created, body {"data":{"token":"<jwt>"}}.
    const data = await apiFetch<LoginResponse>("/auth/token", {
      method: "POST",
      body,
    });

    if (!data?.token) {
      console.error("[auth] login succeeded but no token in response");
      return reply({ status: "error", message: AUTH_FAILURE }, 502);
    }

    await createSession(data.token);
    return reply({ status: "success", message: "" }, 200);
  } catch (err) {
    if (err instanceof NoraiApiError) {
      // The backend answers 401 for both "no such user" and "wrong password",
      // and for an unactivated account. Keep them indistinguishable here too —
      // splitting them would turn this into an account-existence oracle.
      if (err.status === 401) {
        return reply(
          { status: "error", message: AUTH_INVALID_CREDENTIALS },
          401,
        );
      }
      if (err.status === 400) {
        return reply({ status: "error", message: AUTH_INVALID_INPUT }, 400);
      }
    }
    console.error("[auth] login failed", err);
    return reply({ status: "error", message: AUTH_FAILURE }, 502);
  }
}
