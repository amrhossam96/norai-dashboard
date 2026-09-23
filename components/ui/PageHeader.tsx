/** The eyebrow / title / purpose block at the top of every dashboard screen. */
export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <span className="eyebrow" style={{ letterSpacing: "0.14em" }}>
          {eyebrow}
        </span>
        <h1 className="mt-[7px] font-sans text-[27px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">{title}</h1>
        {children ? (
          <p className="mt-[7px] max-w-[620px] text-pretty font-sans text-[13.5px] leading-[1.55] text-muted">{children}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-none gap-[8px]">{actions}</div> : null}
    </div>
  );
}

export function Panel({ title, aside, children, className = "" }: { title?: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-[12px] border border-line bg-surface ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-[12px] border-b border-line-soft px-[18px] py-[12px]">
          <span className="flex-none font-sans text-[13.5px] font-semibold text-ink">{title}</span>
          <div className="min-w-0 truncate text-right">{aside}</div>
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[14px] px-[18px] py-[16px]">
      <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[7px] bg-white font-mono text-[11px] font-medium text-[#0f0f0f]">
        !
      </div>
      <div className="flex-1 font-sans text-[13px] leading-[1.5] text-ink-2">{children}</div>
      {action}
    </div>
  );
}

export const th = "px-[14px] py-[9px] text-left font-mono text-[9.5px] font-medium tracking-[0.1em] text-grey-55 uppercase";
export const td = "px-[14px] py-[10px] font-sans text-[12.5px] text-ink-2 align-top";
export const mono = "font-mono text-[11.5px] text-ink-3";

/**
 * Timestamps arrive three ways: Date objects from pg (timestamptz), ISO strings
 * we built ourselves, and ClickHouse's "YYYY-MM-DD HH:MM:SS.mmm" which carries
 * no zone but is UTC by table definition.
 */
export function fmtTs(v: string | Date | null | undefined): string {
  if (!v) return "—";
  const d = v instanceof Date ? v : new Date(v.endsWith("Z") || v.includes("+") ? v : `${v.replace(" ", "T")}Z`);
  return isNaN(d.getTime()) ? String(v) : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
