import "server-only";

import { redirect } from "next/navigation";
import { getProjectCookie, getSessionUser, type SessionUser } from "@/lib/session";
import { listProjectsFor } from "@/lib/control/projects";
import type { Project } from "@/lib/api/types";

/**
 * The two things every dashboard screen needs: who is signed in and which of
 * their projects the shell is looking at. Server components call these; a
 * missing session redirects to sign-in and a user with no project is sent to
 * onboarding, so pages below can assume both exist.
 */
export async function requireUser(next = "/app"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/api/auth/logout?next=${encodeURIComponent(next)}`);
  return user;
}

export interface Current {
  user: SessionUser;
  project: Project;
  projects: Project[];
}

export async function requireProject(next = "/app"): Promise<Current> {
  const user = await requireUser(next);
  const projects = await listProjectsFor(user.user_id);
  if (projects.length === 0) redirect("/onboarding");
  const wanted = await getProjectCookie();
  const project = projects.find((p) => p.project_id === wanted) ?? projects[0];
  return { user, project, projects };
}

/** For route handlers: null instead of a redirect. */
export async function currentProject(): Promise<Current | null> {
  const user = await getSessionUser();
  if (!user) return null;
  const projects = await listProjectsFor(user.user_id);
  if (projects.length === 0) return null;
  const wanted = await getProjectCookie();
  const project = projects.find((p) => p.project_id === wanted) ?? projects[0];
  return { user, project, projects };
}
