import Link from "next/link";
import { requireProject } from "@/lib/current";
import { listSurfaces } from "@/lib/control/config";
import { Empty, mono, PageHeader, Panel } from "@/components/ui/PageHeader";

export default async function SurfacesPage() {
  const { project } = await requireProject("/app/surfaces");
  const surfaces = await listSurfaces(project.project_id);

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader
        eyebrow="03 · Serve"
        title="Surfaces"
        actions={
          <Link href="/app/config?kind=surfaces" className="cta cta-ghost cta-sm">
            Edit surfaces.yaml
          </Link>
        }
      >
        The placements you serve. Each one names its retrieval sources, the objective it ranks for, the holdout it
        keeps for measurement and the exploration slots it reserves. Rules attach per surface.
      </PageHeader>

      {surfaces.length === 0 ? (
        <Panel className="mt-[22px] max-w-[720px]">
          <Empty action={<Link href="/app/config?kind=surfaces" className="cta cta-primary cta-sm">Register surfaces</Link>}>
            No surfaces yet. Upload a surfaces object on the Configuration screen; a starter with pdp_similar,
            pdp_bought_together and home_rows is provided.
          </Empty>
        </Panel>
      ) : (
        <div className="mt-[22px] grid gap-[12px] lg:grid-cols-2">
          {surfaces.map((s) => {
            const rules = s.rules?.rules ?? [];
            return (
              <Panel
                key={s.surface_name}
                title={s.surface_name}
                aside={<span className={mono}>surfaces {s.config_version}{s.rules_version ? ` · rules ${s.rules_version}` : ""}</span>}
              >
                <div className="grid grid-cols-2 gap-x-[16px] gap-y-[10px] px-[18px] py-[14px]">
                  <Row label="Retrieval">
                    <div className="flex flex-wrap gap-[4px]">{s.payload.retrieval.map((r) => <span key={r} className="chip">{r}</span>)}</div>
                  </Row>
                  <Row label="Objective">
                    <div className="flex flex-wrap gap-[4px]">
                      {Object.entries(s.payload.objective).map(([k, v]) => (
                        <span key={k} className="chip">{k} <span className="text-grey-55">×{v}</span></span>
                      ))}
                    </div>
                  </Row>
                  <Row label="Holdout">{(s.payload.holdout_share * 100).toFixed(1)}% of requests</Row>
                  <Row label="Exploration">
                    {s.payload.exploration.slots_per_page} slot{s.payload.exploration.slots_per_page === 1 ? "" : "s"} per page
                    {s.payload.exploration.positions?.length ? ` at ${s.payload.exploration.positions.join(", ")}` : ""}
                  </Row>
                  {s.payload.constraints && Object.keys(s.payload.constraints).length ? (
                    <Row label="Constraints" wide>
                      <code className="font-mono text-[11px] text-ink-3">{JSON.stringify(s.payload.constraints)}</code>
                    </Row>
                  ) : null}
                  <Row label="Rules" wide>
                    {rules.length === 0 ? (
                      <span className="text-grey-55">none — <Link href="/app/config?kind=rules" className="text-ink-3 underline underline-offset-2 hover:text-ink">add rules</Link></span>
                    ) : (
                      <ul className="flex flex-col gap-[4px]">
                        {rules.map((r, i) => (
                          <li key={i} className="font-mono text-[11.5px] text-ink-2">
                            <span className="text-red-ink">{String(r.verb)}</span> {String(r.predicate)}
                            {r.by !== undefined ? ` by ${r.by}` : ""}{r.position !== undefined ? ` at ${r.position}` : ""}{r.max !== undefined ? ` max ${r.max}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Row>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <div className="eyebrow">{label}</div>
      <div className="mt-[5px] font-sans text-[12.5px] leading-[1.5] text-ink-2">{children}</div>
    </div>
  );
}
