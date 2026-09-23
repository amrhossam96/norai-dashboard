import Link from "next/link";
import { requireProject } from "@/lib/current";
import { overview } from "@/lib/control/metrics";
import { catalogStats } from "@/lib/control/catalog";
import { latestConfigs } from "@/lib/control/config";
import { KpiCards } from "@/components/overview/KpiCards";
import { Sparkline } from "@/components/overview/Sparkline";
import { Empty, fmtTs, mono, PageHeader, Panel, td, th } from "@/components/ui/PageHeader";
import { Meter } from "@/components/ui/Meter";

const REASON_LABEL: Record<string, string> = {
  none: "no fallback",
};

export default async function OverviewPage() {
  const { project } = await requireProject();
  const [ov, cat, cfg] = await Promise.all([overview(project.project_id), catalogStats(project.project_id), latestConfigs(project.project_id)]);

  const totalFallback = ov.fallback7d.reduce((a, r) => a + r.count, 0);
  const fallbackShare = totalFallback ? ov.fallback7d.filter((r) => r.level !== "none" && r.level !== "").reduce((a, r) => a + r.count, 0) / totalFallback : 0;
  const configured = (["schema", "taxonomy", "surfaces", "rules"] as const).filter((k) => cfg[k]).length;

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader eyebrow="The system" title="One request. Every layer.">
        What {project.name} received, served and explained. Everything here is read from the warehouse and the
        registry; nothing is sampled.
      </PageHeader>

      {ov.warehouse === "unreachable" ? (
        <div className="mt-[18px] flex items-center gap-[10px] rounded-[8px] border border-line bg-surface px-[14px] py-[10px]">
          <span className="rounded-[5px] border border-line-2 px-[7px] py-[2px] font-mono text-[9px] font-medium tracking-[0.1em] text-red-ink">
            WAREHOUSE OFFLINE
          </span>
          <span className="font-sans text-[12px] text-grey-40">ClickHouse did not answer, so the event and serving figures below read zero.</span>
        </div>
      ) : null}

      <KpiCards
        kpis={[
          { label: "Events · 24h", value: ov.eventsLast24h.toLocaleString(), delta: `${ov.impressionsLast7d.toLocaleString()} impressions · 7d` },
          { label: "Served · 24h", value: ov.servedLast24h.toLocaleString(), delta: `${totalFallback.toLocaleString()} in the last 7 days` },
          {
            label: "Fallback share · 7d",
            value: totalFallback ? `${(fallbackShare * 100).toFixed(1)}%` : "—",
            delta: "requests that could not use the full pipeline",
            alert: fallbackShare > 0.2,
          },
          { label: "Catalog", value: cat.available.toLocaleString(), delta: `${cat.total.toLocaleString()} items · ${cat.users.toLocaleString()} known users`, alert: cat.available === 0 },
        ]}
      />

      <div className="mt-[14px] grid gap-[12px] lg:grid-cols-2">
        <Panel title="Events per day" aside={<span className={mono}>14 days</span>}>
          <div className="px-[18px] py-[14px]">
            <Sparkline days={ov.eventsPerDay14d} />
            <div className="mt-[12px] flex flex-wrap gap-[6px]">
              {ov.eventsByKind7d.length === 0 ? (
                <span className="font-sans text-[12px] text-grey-40">No events in the last 7 days.</span>
              ) : (
                ov.eventsByKind7d.map((k) => (
                  <span key={k.kind} className="chip">
                    {k.kind} <span className="text-grey-55">{k.count.toLocaleString()}</span>
                  </span>
                ))
              )}
            </div>
          </div>
        </Panel>
        <Panel title="Recommendations per day" aside={<span className={mono}>14 days</span>}>
          <div className="px-[18px] py-[14px]">
            <Sparkline days={ov.servedPerDay14d} tone="red" />
            <div className="mt-[12px] flex flex-col gap-[7px]">
              {ov.fallback7d.length === 0 ? (
                <span className="font-sans text-[12px] text-grey-40">Nothing served in the last 7 days.</span>
              ) : (
                ov.fallback7d.map((f) => (
                  <div key={f.level} className="flex items-center gap-[10px]">
                    <span className="w-[120px] truncate font-mono text-[11px] text-ink-3">{REASON_LABEL[f.level] ?? (f.level || "none")}</span>
                    <div className="flex-1">
                      <Meter value={f.count / Math.max(1, totalFallback)} tone={f.level === "none" || f.level === "" ? "ink" : "red"} />
                    </div>
                    <span className="w-[56px] text-right font-mono text-[11px] text-grey-40">{f.count.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-[14px] grid gap-[12px] lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Recently served" aside={<Link href="/app/playground" className="font-sans text-[12px] text-ink-3 hover:text-ink">Open the playground →</Link>}>
          {ov.recentServed.length === 0 ? (
            <Empty>No recommendation has been served yet. Try one on the playground; it appears here with its fallback level.</Empty>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-line-soft">
                  <th className={th}>When</th>
                  <th className={th}>Surface</th>
                  <th className={th}>For</th>
                  <th className={th}>Items</th>
                  <th className={th}>Fallback</th>
                </tr>
              </thead>
              <tbody>
                {ov.recentServed.map((r) => (
                  <tr key={r.recommendation_id} className="border-b border-line-softest last:border-b-0">
                    <td className={td}>
                      <div>{fmtTs(r.ts)}</div>
                      <div className={mono}>{r.recommendation_id}</div>
                    </td>
                    <td className={td}>{r.surface}</td>
                    <td className={`${td} ${mono}`}>{r.who || "—"}</td>
                    <td className={td}>{r.items}</td>
                    <td className={td}>
                      <span className="chip">{r.fallback_level || "none"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        <div className="flex flex-col gap-[12px]">
          <Panel title="Setup">
            <div className="flex flex-col">
              <SetupRow ok={configured === 4} href="/app/config" label="Configuration" detail={`${configured} of 4 objects registered`} />
              <SetupRow ok={cat.available > 0} href="/app/catalog" label="Catalog" detail={cat.available > 0 ? `${cat.available.toLocaleString()} available items` : "empty"} />
              <SetupRow ok={ov.eventsLast24h > 0} href="/app/diagnostics" label="Events" detail={ov.eventsLast24h > 0 ? "arriving" : "none in 24h"} />
            </div>
          </Panel>
          <Panel title="Daily metrics" aside={<span className={mono}>{ov.metrics[0]?.date ?? "no roll-up yet"}</span>}>
            {ov.metrics.length === 0 ? (
              <Empty>The learning loop has not rolled up a day yet. Metrics appear once impressions are labelled and the daily job has run.</Empty>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line-soft">
                    <th className={th}>Surface</th>
                    <th className={th}>Metric</th>
                    <th className={th}>Arm</th>
                    <th className={`${th} text-right`}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {ov.metrics.slice(0, 12).map((m, i) => (
                    <tr key={i} className="border-b border-line-softest last:border-b-0">
                      <td className={td}>{m.surface}</td>
                      <td className={`${td} ${mono}`}>{m.metric}</td>
                      <td className={`${td} ${mono}`}>{m.arm}{m.segment && m.segment !== "all" ? ` · ${m.segment}` : ""}</td>
                      <td className={`${td} text-right font-mono`}>{m.value.toFixed(4)}<span className="text-grey-55"> ({m.numerator}/{m.denominator})</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function SetupRow({ ok, href, label, detail }: { ok: boolean; href: string; label: string; detail: string }) {
  return (
    <Link href={href} className="flex items-center gap-[12px] border-b border-line-softest px-[18px] py-[11px] transition-colors last:border-b-0 hover:bg-surface-3">
      <span aria-hidden className="h-[7px] w-[7px] shrink-0 rounded-full" style={{ background: ok ? "var(--color-grey-55)" : "var(--color-red-ink)" }} />
      <span className="font-sans text-[13px] font-medium text-ink">{label}</span>
      <span className="ml-auto font-mono text-[11px] text-grey-40">{detail}</span>
    </Link>
  );
}
