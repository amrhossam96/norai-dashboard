import Link from "next/link";
import { requireProject } from "@/lib/current";
import { readiness } from "@/lib/control/readiness";
import { PageHeader } from "@/components/ui/PageHeader";
import type { ReadinessCheck } from "@/lib/api/types";

/* The one screen that must work before a partner has any data: it answers
   "why is my /recommend response empty" without us on a call. */

const LABELS: Record<string, string> = {
  gateway: "The gateway is up",
  config: "Mapping, taxonomy and surfaces are registered",
  keys: "An API key exists",
  catalog: "The catalog has items",
  events: "Events are arriving",
  artifacts: "An artifact set is published",
  serving: "Recommendations are being served",
};

function Row({ check }: { check: ReadinessCheck }) {
  return (
    <div className="flex gap-[12px] border-b border-line-soft px-[18px] py-[13px] last:border-b-0">
      <span aria-hidden className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: check.ok ? "var(--color-grey-55)" : "var(--color-red-ink)" }} />
      <div className="min-w-0 flex-1">
        <div className="font-sans text-[13.5px] font-medium text-ink">{LABELS[check.name] ?? check.name}</div>
        <div className="mt-[3px] font-sans text-[12.5px] leading-[1.5] text-muted">{check.detail}</div>
        {!check.ok && check.fix ? <div className="mt-[6px] font-mono text-[11.5px] leading-[1.5] text-ink">{check.fix}</div> : null}
      </div>
      {check.href ? (
        <Link href={check.href} className="self-center font-sans text-[12px] text-ink-3 hover:text-ink">Open →</Link>
      ) : null}
    </div>
  );
}

export default async function DiagnosticsPage() {
  const { project } = await requireProject("/app/diagnostics");
  const r = await readiness(project.project_id);

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader eyebrow="Inspect" title="Readiness">
        Whether {project.name} can produce a recommendation yet, answered before anyone asks it for one. The checks
        run in order; the first failure is the one to fix. The deeper mapping and retrieval report is{" "}
        <code className="font-mono text-[12px] text-ink-3">norai onboarding report --project {project.project_id}</code>.
      </PageHeader>

      <div className="mt-[22px] flex max-w-[720px] items-center gap-[10px] rounded-[8px] border border-line bg-surface px-[14px] py-[11px]">
        <span className="rounded-[5px] border border-line-2 px-[7px] py-[2px] font-mono text-[9px] font-medium tracking-[0.1em]" style={{ color: r.ready ? "var(--color-grey-55)" : "var(--color-red-ink)" }}>
          {r.ready ? "READY" : "NOT READY"}
        </span>
        <span className="font-sans text-[12px] text-grey-40">
          {r.ready ? `${project.name} is serving recommendations.` : r.blocker?.fix ?? r.blocker?.detail ?? "Not ready yet."}
        </span>
      </div>

      <div className="mt-[18px] max-w-[720px] overflow-hidden rounded-[12px] border border-line bg-surface">
        {r.checks.map((check) => <Row key={check.name} check={check} />)}
      </div>
    </div>
  );
}
