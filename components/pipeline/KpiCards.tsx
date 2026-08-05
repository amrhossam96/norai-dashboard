import type { Kpi } from "@/lib/viewmodels";

export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <div className="mt-[22px] grid grid-cols-2 gap-[12px] lg:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-[10px] border border-line bg-surface px-[16px] py-[14px]"
        >
          <div className="flex items-center justify-between">
            <div className="eyebrow">{kpi.label}</div>
            {kpi.alert && (
              <span className="h-[6px] w-[6px] rounded-full bg-red" />
            )}
          </div>
          <div className="mt-[5px] font-sans text-[26px] font-semibold tracking-[-0.03em] text-ink">
            {kpi.value}
          </div>
          {kpi.delta && (
            <div className="mt-[2px] font-mono text-[11px] text-grey-40">
              {kpi.delta}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
