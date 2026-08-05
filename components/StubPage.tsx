/**
 * Teaching placeholder for routes not yet built out. Follows the design's
 * cross-cutting UX rule: "every zero explains the one action that fills it."
 * Each row carries the SPEC status so the seam (what's built vs. backend-work vs.
 * a product phase) is legible — the seam is the sales pitch.
 */
export type SpecStatus = "BUILT" | "BACKEND" | "PHASE 2" | "PHASE 3" | "UX";

const STATUS_COLOR: Record<SpecStatus, string> = {
  BUILT: "var(--color-grey-55)",
  UX: "var(--color-grey-55)",
  BACKEND: "var(--color-red-ink)",
  "PHASE 2": "var(--color-ink)",
  "PHASE 3": "var(--color-ink)",
};

export interface SpecRow {
  status: SpecStatus;
  text: string;
}

export function StubPage({
  index,
  title,
  purpose,
  rows,
  cta,
}: {
  index: string;
  title: string;
  purpose: string;
  rows: SpecRow[];
  cta?: string;
}) {
  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <div className="flex items-baseline gap-[10px]">
        <span className="font-mono text-[10px] font-medium text-grey-65">
          {index}
        </span>
        <span className="eyebrow" style={{ letterSpacing: "0.14em" }}>
          {title === "Pipeline" ? "The system" : "Roadmap"}
        </span>
      </div>
      <h1 className="mt-[7px] font-sans text-[27px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
        {title}
      </h1>
      <p className="mt-[7px] max-w-[620px] text-pretty font-sans text-[13.5px] leading-[1.55] text-muted">
        {purpose}
      </p>

      <div className="mt-[24px] max-w-[720px] overflow-hidden rounded-[12px] border border-line bg-surface">
        <div className="border-b border-line-soft px-[18px] py-[13px]">
          <span className="font-sans text-[14px] font-semibold text-ink">
            What this screen will do
          </span>
        </div>
        <div className="flex flex-col">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex gap-[12px] border-b border-line-softest px-[18px] py-[13px] last:border-b-0"
            >
              <span
                className="w-[66px] flex-none pt-[3px] font-mono text-[9px] font-medium"
                style={{ color: STATUS_COLOR[row.status] }}
              >
                {row.status}
              </span>
              <span className="font-sans text-[13px] leading-[1.55] text-ink-2">
                {row.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {cta && (
        <div className="mt-[16px] flex items-center gap-[14px] rounded-[10px] border border-line bg-surface px-[16px] py-[14px]">
          <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[7px] bg-white font-mono text-[11px] font-medium text-[#0f0f0f]">
            !
          </div>
          <div className="flex-1 font-sans text-[13px] text-ink-2">{cta}</div>
          <button className="flex-none rounded-[7px] bg-white px-[14px] py-[8px] font-sans text-[12px] font-medium text-[#0f0f0f] transition-opacity hover:opacity-90">
            Docs
          </button>
        </div>
      )}
    </div>
  );
}
