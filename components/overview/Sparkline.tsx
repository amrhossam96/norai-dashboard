import type { DayCount } from "@/lib/control/metrics";

/** 14 bars, one per day; the last bar is today. */
export function Sparkline({ days, tone = "ink" }: { days: DayCount[]; tone?: "ink" | "red" }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="flex h-[54px] items-end gap-[3px]" role="img" aria-label={days.map((d) => `${d.day}: ${d.count}`).join(", ")}>
      {days.map((d) => (
        <div
          key={d.day}
          title={`${d.day} · ${d.count.toLocaleString()}`}
          className="flex-1 rounded-[2px]"
          style={{
            height: `${Math.max(3, (d.count / max) * 100)}%`,
            background: d.count === 0 ? "var(--color-grey-88)" : tone === "red" ? "var(--color-red)" : "var(--color-ink)",
            opacity: d.count === 0 ? 1 : 0.85,
          }}
        />
      ))}
    </div>
  );
}
