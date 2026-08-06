/**
 * Account activation proxy for PUT /v1/users/activate/{token}.
 *
 * The backend builds the link as `${FRONT_URL}/confirm/{token}`
 * (internal/modules/users/service.go), so /confirm/[token] must exist or every
 * activation email dead-ends.
 */
import { apiFetch, NoraiApiError } from "@/lib/api/client";
import {
  AUTH_ACTIVATED,
  AUTH_ACTIVATION_INVALID,
  AUTH_FAILURE,
  type AuthResult,
} from "@/lib/auth";

function reply(result: AuthResult, status: number) {
  return Response.json(result, { status });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  const token =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>).token
      : null;

  if (typeof token !== "string" || token.length === 0) {
    return reply({ status: "error", message: AUTH_ACTIVATION_INVALID }, 400);
  }

  try {
    // 204 No Content on success.
    await apiFetch<null>(`/users/activate/${encodeURIComponent(token)}`, {
      method: "PUT",
    });
    return reply({ status: "success", message: AUTH_ACTIVATED }, 200);
  } catch (err) {
    if (err instanceof NoraiApiError && (err.status === 404 || err.status === 400)) {
      // 404 covers both "no such token" and "already consumed" — the row is
      // deleted on activation. Same message for both; there is nothing the user
      // can do differently, and distinguishing them leaks token validity.
      return reply({ status: "error", message: AUTH_ACTIVATION_INVALID }, 400);
    }
    console.error("[auth] activation failed", err);
    return reply({ status: "error", message: AUTH_FAILURE }, 502);
  }
}
