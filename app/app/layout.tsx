import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { requireProject } from "@/lib/current";
import { gatewayHealth } from "@/lib/gateway";

/**
 * Every /app/* route renders through this layout. requireProject() is the
 * authorisation gate: no session → sign-in, no project → onboarding. Pages
 * below can call it again cheaply and assume both exist.
 */
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [{ user, project, projects }, health] = await Promise.all([requireProject(), gatewayHealth()]);

  return (
    <div className="flex h-screen bg-shell">
      <Sidebar user={user} project={project} projects={projects} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar projectName={project.name} gatewayVersion={health?.version ?? (health ? health.status : null)} />
        <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
