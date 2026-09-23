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

export function validateProjectName(raw: unknown): string | null {
  const name = typeof raw === "string" ? raw.trim() : "";
  if (!name) return "Give your project a name.";
  if (name.length < PROJECT_NAME_MIN)
    return `At least ${PROJECT_NAME_MIN} characters.`;
  if (name.length > PROJECT_NAME_MAX)
    return `At most ${PROJECT_NAME_MAX} characters.`;
  return null;
}

