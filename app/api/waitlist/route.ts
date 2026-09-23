/**
 * Waitlist signup. Stored in the dashboard's own table (dashboard.waitlist):
 * the norai backend has no notion of prospects. The honeypot drops obvious
 * bot traffic before the database is touched.
 */
import { query } from "@/lib/db/pg";
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

  try {
    // ON CONFLICT DO NOTHING: a duplicate is reported as success, so this
    // endpoint never confirms whether an address is already on the list.
    await query("INSERT INTO dashboard.waitlist (email) VALUES ($1) ON CONFLICT DO NOTHING", [check.email]);
    return ok();
  } catch (err) {
    console.error("[waitlist] insert failed", err);
    return reply({ status: "error", message: WAITLIST_FAILURE_MESSAGE }, 502);
  }
}
