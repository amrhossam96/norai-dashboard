import { redirect } from "next/navigation";
import { Wizard } from "@/components/onboarding/Wizard";
import { requireUser } from "@/lib/current";
import { listProjectsFor } from "@/lib/control/projects";

/**
 * First-run setup. Someone who already has a project is sent to the dashboard,
 * unless they came here on purpose to add another (?new=1).
 */
export const dynamic = "force-dynamic";

export default async function OnboardingPage(props: { searchParams: Promise<{ new?: string }> }) {
  const { new: wantNew } = await props.searchParams;
  const user = await requireUser("/onboarding");
  const projects = await listProjectsFor(user.user_id);
  if (projects.length > 0 && !wantNew) redirect("/app");
  const gatewayUrl = process.env.NORAI_PUBLIC_GATEWAY_URL ?? process.env.NORAI_GATEWAY_URL ?? "http://localhost:8080";
  return <Wizard firstProject={projects.length === 0} gatewayUrl={gatewayUrl} />;
}
