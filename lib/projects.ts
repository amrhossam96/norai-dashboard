/**
 * Shared vocabulary for project creation, imported by both the onboarding form
 * and the /api/projects route handler — same split as lib/auth.ts.
 */

export interface ProjectResult {
  status: "success" | "error";
  message: string;
  /** Present on success so the caller can route straight to the new project. */
  projectId?: string;
}

export const PROJECT_NAME_MIN = 2;
export const PROJECT_NAME_MAX = 60;

export const PROJECT_CREATE_FAILED =
  "Couldn't create the project. Please try again.";
export const PROJECT_OFFLINE =
  "Couldn't reach us just now. Check your connection and try again.";
/**
 * The team is created by users.Service.Activate (and, for Google, only on the
 * first-ever sign-in) — never by a password login. So "sign out and back in",
 * which this used to advise, cannot possibly fix it: the account would come
 * back with exactly the same missing workspace. Say what is true instead.
 */
export const PROJECT_NO_TEAM =
  "Your account was set up without a workspace. Signing out won't fix it — get in touch and we'll repair the account.";

export function validateProjectName(raw: unknown): string | null {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return "Give your project a name.";
  if (name.length < PROJECT_NAME_MIN)
    return `At least ${PROJECT_NAME_MIN} characters.`;
  if (name.length > PROJECT_NAME_MAX)
    return `At most ${PROJECT_NAME_MAX} characters.`;
  return null;
}

/**
 * Derive a URL-safe slug from the display name.
 *
 * The API takes name and slug separately and does not derive one from the
 * other, so if we sent an empty slug every project would collide on "". The
 * random suffix is deliberate: two people naming a project "Store" would
 * otherwise produce the same slug and the second create would 409 for a reason
 * that means nothing to them.
 */
export function slugifyProjectName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    // Strip accents so "Café" becomes "cafe" rather than "caf".
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  const suffix = Math.random().toString(36).slice(2, 8);
  return base ? `${base}-${suffix}` : `project-${suffix}`;
}
