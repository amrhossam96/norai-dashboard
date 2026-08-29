import { redirect } from "next/navigation";
import { Wizard } from "@/components/onboarding/Wizard";
import { authedFetch, isUnauthorized } from "@/lib/api/server";
import type { Project } from "@/lib/api/types";

/**
 * First-run setup.
 *
 * Guarded on the same question /app asks, in the opposite direction: this is
 * the screen for someone with no project, so anyone who already has one is
 * sent to the dashboard. That also covers the reload-after-finishing case —
 * the wizard's last step created a project, so coming back here lands on /app
 * rather than offering to set everything up a second time.
 */
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  let projects: Project[];
  try {
    projects = (await authedFetch<Project[]>("/projects/")) ?? [];
  } catch (err) {
    if (isUnauthorized(err)) redirect("/api/auth/logout?from=onboarding");
    throw err;
  }
  if (projects.length > 0) redirect("/app");

  return <Wizard />;
}
