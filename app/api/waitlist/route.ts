/**
 * Waitlist signup proxy.
 *
 * Sits in front of the Go API's public POST /v1/waitlist/ so that the browser
 * never needs the backend address (no prod origin has to be added to the
 * backend's CORS_ALLOWED_ORIGINS, which 403s unknown origins outright) and so
 * there is one server-side place to drop obvious bot traffic — that endpoint is
 * public and has no rate limiting of its own yet.
 */
import { apiFetch, NoraiApiError } from "@/lib/api/client";
import type { WaitlistSignupRequest } from "@/lib/api/types";
import {
  checkWaitlistEmail,
  WAITLIST_FAILURE_MESSAGE,
  WAITLIST_INVALID_MESSAGE,
  WAITLIST_SUCCESS_MESSAGE,
  WAITLIST_TRAP_FIELD,
  type WaitlistResult,
} from "@/lib/waitlist";

function reply(result: WaitlistResult, status: number) {
  return Response.json(result, { status });
}

const ok = () =>
  reply({ status: "success", message: WAITLIST_SUCCESS_MESSAGE }, 200);

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);

  if (payload === null || typeof payload !== "object") {
    return reply({ status: "error", message: WAITLIST_INVALID_MESSAGE }, 400);
  }

  const input = payload as Record<string, unknown>;

  // Honeypot tripped — acknowledge without touching the backend.
  if (typeof input[WAITLIST_TRAP_FIELD] === "string" && input[WAITLIST_TRAP_FIELD]) {
    return ok();
  }

  const check = checkWaitlistEmail(input.email);
  if (!check.ok) {
    return reply({ status: "error", message: check.message }, 400);
  }

  const body: WaitlistSignupRequest = { email: check.email };

  try {
    // 201 Created, body `{"data": null}`.
    await apiFetch<null>("/waitlist/", { method: "POST", body });
    return ok();
  } catch (err) {
    if (err instanceof NoraiApiError) {
      // 409 means this email is already stored. Report it as success: the user's
      // intent is satisfied, and a distinct message would confirm to anyone who
      // asks whether a given address is on the list.
      if (err.status === 409) return ok();
      if (err.status === 400) {
        return reply(
          { status: "error", message: WAITLIST_INVALID_MESSAGE },
          400,
        );
      }
    }

    console.error("[waitlist] signup failed", err);
    return reply({ status: "error", message: WAITLIST_FAILURE_MESSAGE }, 502);
  }
}
