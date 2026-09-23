/**
 * Shared vocabulary for sign-in and sign-up, imported by both the client forms
 * and the /api/auth/* route handlers — the same split lib/waitlist.ts uses.
 *
 * Nothing here touches cookies or the network. Session storage is server-only
 * and lives in lib/session.ts, which this file deliberately does not import so
 * it stays safe to pull into a client component.
 */

export interface AuthResult {
  status: "success" | "error";
  message: string;
}

export type AuthState = { status: "idle" } | AuthResult;

// ---- Messages ----

export const AUTH_INVALID_CREDENTIALS =
  "That email and password combination doesn't match an account.";
export const AUTH_EMAIL_TAKEN = "That email is already registered.";
export const AUTH_INVALID_INPUT = "Please check the fields and try again.";
export const AUTH_FAILURE = "Something went wrong on our end. Please try again.";
export const AUTH_OFFLINE =
  "Couldn't reach us just now. Check your connection and try again.";

/**
 * Limits shared by the forms and the /api/auth/* handlers, which are the
 * authority now that accounts live in the dashboard's own table.
 */
export const EMAIL_MAX = 255;
export const PASSWORD_MIN = 12;
export const PASSWORD_MAX = 72;
export const NAME_MAX = 52;

/** Same conservative shape check the waitlist uses; the backend is authoritative. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type FieldErrors = Partial<
  Record<"first_name" | "last_name" | "email" | "password", string>
>;

export function validateEmail(raw: unknown): string | null {
  const email = typeof raw === "string" ? raw.trim() : "";
  if (!email) return "Enter your email address.";
  if (email.length > EMAIL_MAX) return `Keep this under ${EMAIL_MAX} characters.`;
  if (!EMAIL_RE.test(email)) return "That doesn't look like a valid email.";
  return null;
}

export function validatePassword(raw: unknown): string | null {
  const password = typeof raw === "string" ? raw : "";
  if (!password) return "Enter your password.";
  if (password.length < PASSWORD_MIN)
    return `At least ${PASSWORD_MIN} characters.`;
  if (password.length > PASSWORD_MAX)
    return `At most ${PASSWORD_MAX} characters.`;
  return null;
}

function validateName(raw: unknown, label: string): string | null {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return `Enter your ${label}.`;
  if (name.length > NAME_MAX) return `Keep this under ${NAME_MAX} characters.`;
  return null;
}

/** Shared by the sign-in form and its route handler. */
export function validateLogin(input: {
  email?: unknown;
  password?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};
  const email = validateEmail(input.email);
  if (email) errors.email = email;
  // Login only needs a non-empty password; length rules belong to sign-up, and
  // applying them here would leak whether an old password predates a rule.
  if (typeof input.password !== "string" || input.password.length === 0) {
    errors.password = "Enter your password.";
  }
  return errors;
}

/** Shared by the sign-up form and its route handler. */
export function validateSignup(input: {
  first_name?: unknown;
  last_name?: unknown;
  email?: unknown;
  password?: unknown;
}): FieldErrors {
  const errors: FieldErrors = {};
  const first = validateName(input.first_name, "first name");
  if (first) errors.first_name = first;
  const last = validateName(input.last_name, "last name");
  if (last) errors.last_name = last;
  const email = validateEmail(input.email);
  if (email) errors.email = email;
  const password = validatePassword(input.password);
  if (password) errors.password = password;
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
