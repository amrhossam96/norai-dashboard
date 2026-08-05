/**
 * Shared vocabulary for the waitlist signup, imported by both the client form
 * and the /api/waitlist route handler.
 *
 * Note this is deliberately NOT a Server Action. Actions POST to the page route
 * and their response carries a re-rendered RSC tree for the whole page, so every
 * submit would re-render the entire landing page just to swap one line of text.
 * A route handler keeps the submit to a plain JSON round-trip.
 */

export type WaitlistStatus = "success" | "error";

export interface WaitlistResult {
  status: WaitlistStatus;
  message: string;
}

export type WaitlistState = { status: "idle" } | WaitlistResult;

/** Name of the honeypot field. Real users never see it; bots fill every input. */
export const WAITLIST_TRAP_FIELD = "company_website";

/** Shown for a fresh signup and for a duplicate (409) alike. */
export const WAITLIST_SUCCESS_MESSAGE =
  "You're on the list. We'll be in touch.";

export const WAITLIST_INVALID_MESSAGE = "That doesn't look like a valid email.";
export const WAITLIST_EMPTY_MESSAGE = "Enter your email address.";
export const WAITLIST_FAILURE_MESSAGE =
  "Something went wrong on our end. Please try again.";
export const WAITLIST_OFFLINE_MESSAGE =
  "Couldn't reach us just now. Check your connection and try again.";

/**
 * Deliberately conservative: catches the shapes that are definitely not
 * addresses without rejecting valid-but-unusual ones. The backend runs
 * `validate:"required,email"` and is the real authority.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type EmailCheck =
  | { ok: true; email: string }
  | { ok: false; message: string };

/** Trims, lower-cases and sanity-checks an address before it reaches the API. */
export function checkWaitlistEmail(raw: unknown): EmailCheck {
  const email = typeof raw === "string" ? raw.trim() : "";
  if (!email) return { ok: false, message: WAITLIST_EMPTY_MESSAGE };
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { ok: false, message: WAITLIST_INVALID_MESSAGE };
  }
  return { ok: true, email: email.toLowerCase() };
}
