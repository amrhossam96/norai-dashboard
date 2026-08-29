import { PipelineHero } from "@/components/pipeline/PipelineHero";
import { PipelineDiagram } from "@/components/pipeline/PipelineDiagram";
import { KpiCards } from "@/components/pipeline/KpiCards";
import { LiveResults } from "@/components/pipeline/LiveResults";
import { CatalogBanner } from "@/components/pipeline/CatalogBanner";
import {
  mockKpis,
  mockLiveResults,
  mockPipeline,
} from "@/lib/mock/pipeline";
import { authedFetch, isUnauthorized } from "@/lib/api/server";
import type { Project } from "@/lib/api/types";
import { redirect } from "next/navigation";

/**
 * A signed-in user with no project cannot do anything here — every data
 * endpoint is scoped to an environment, which only exists under a project. So
 * this screen asks the real API what they have before deciding what to render.
 */
async function listProjects(): Promise<Project[]> {
  try {
    return (await authedFetch<Project[]>("/projects/")) ?? [];
  } catch (err) {
        if (isUnauthorized(err)) {
      // The layout only checks that a cookie exists; the API is what actually
      // validates it. An expired or revoked token surfaces here first. Clear the
      // invalid cookie and send the user back to the login screen, otherwise the
      // login page (which sees any cookie at all) bounces straight back here and
      // the two pages redirect-loop forever.
      //
      // Cookies can't be written from a server component, so the logout route
      // handler (a Route Handler — allowed) does the clearing, then redirects.
      redirect("/api/auth/logout?from=app");
    }
    throw err;
  }
}

export default async function PipelinePage() {
  const projects = await listProjects();
  // Onboarding is a full-screen route of its own, not a panel inside this
  // shell: someone with no project has no environment either, so every nav
  // item in the sidebar would lead nowhere.
  if (projects.length === 0) redirect("/onboarding");

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      {/* Every figure here is from lib/mock, but the read API now exists:
          GET /outcomes returns served/seen/engaged per surface, source, position
          and arm. Wire it up and delete this banner. */}
      <div className="mb-[18px] flex items-center gap-[10px] rounded-[8px] border border-line bg-surface px-[14px] py-[10px]">
        <span className="rounded-[5px] border border-line-2 px-[7px] py-[2px] font-mono text-[9px] font-medium tracking-[0.1em] text-grey-55">
          SAMPLE DATA
        </span>
        <span className="font-sans text-[12px] text-grey-40">
          Placeholder figures — the metrics API is not built yet, so nothing on
          this screen is measured.
        </span>
      </div>
      <PipelineHero />
      <div className="no-scrollbar overflow-x-auto">
        <PipelineDiagram model={mockPipeline} />
      </div>
      <KpiCards kpis={mockKpis} />
      <LiveResults model={mockLiveResults} />
      <CatalogBanner />
    </div>
  );
}
