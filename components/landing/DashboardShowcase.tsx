/* A framed, non-interactive picture of the product's overview screen.
 * Purely illustrative — every figure here is a still, not live data. */

const NAV_SERVE = ["Overview", "Playground", "Surfaces", "Catalog"];
const NAV_INSPECT = ["Users & identity", "Event stream", "Engines"];

interface Kpi {
  label: string;
  value: React.ReactNode;
  sub: string;
}
const KPIS: Kpi[] = [
  { label: "RECS SERVED", value: "2.41M", sub: "▲ 12.4%" },
  { label: "CLICK-THROUGH", value: "7.9%", sub: "▲ 1.1pt" },
  {
    label: "P95 LATENCY",
    value: (
      <>
        38<span className="text-[14px] text-[#8a8a8a]">ms</span>
      </>
    ),
    sub: "budget 80ms",
  },
  { label: "COVERAGE", value: "94%", sub: "personal rec" },
];

interface Rec {
  rank: string;
  title: string;
  meta: string;
  score: string;
  bars?: number[];
  why: string;
  cold?: boolean;
}
const RECS: Rec[] = [
  {
    rank: "1",
    title: "Mixed Grill Platter",
    meta: "restaurant · ent_71a3",
    score: "0.87",
    bars: [100, 64, 8, 22],
    why: "Purchased twice this week",
  },
  {
    rank: "2",
    title: "Falafel Sandwich Combo",
    meta: "dish · ent_4c19",
    score: "0.79",
    bars: [41, 88, 30, 12],
    why: "Frequently purchased next",
  },
  {
    rank: "3",
    title: "Ayran 250ml",
    meta: "grocery_item · ent_9910",
    score: "0.63",
    why: "Cold start — popular nearby, 18:00–21:00",
    cold: true,
  },
];

/** Four-bar signal sparkline — active bar near-white, descending into the dark. */
function SignalBars({ heights }: { heights: number[] }) {
  const shade = ["#f2f2f2", "#8a8a8a", "#3a3a3a", "#3a3a3a"];
  return (
    <div className="flex h-[18px] items-end gap-[2px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[6px] rounded-[1px]"
          style={{ height: `${h}%`, background: shade[i] }}
        />
      ))}
    </div>
  );
}

function SidebarItem({
  label,
  active,
  badge,
}: {
  label: string;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`flex items-center rounded-[6px] px-[10px] py-[7px] text-[12.5px] ${
        active
          ? "bg-[#1f1f1f] font-semibold text-[#f2f2f2]"
          : "font-normal text-[#a8a8a8]"
      }`}
    >
      {label}
      {badge && (
        <span className="ml-auto font-mono text-[9px] font-medium text-[#7a7a7a]">
          {badge}
        </span>
      )}
    </div>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <div className="px-[8px] pb-[4px] pt-[6px] font-mono text-[8.5px] font-medium tracking-[0.13em] text-[#565656]">
      {children}
    </div>
  );
}

export function DashboardShowcase() {
  return (
    <div
      id="dashboard"
      className="mx-auto max-w-[1200px] px-[18px] pt-[52px] md:px-[28px] md:pt-[76px]"
      style={{ scrollMarginTop: 70 }}
    >
      <div data-reveal className="flex flex-col items-start gap-[18px] md:flex-row md:items-end md:justify-between md:gap-[30px]">
        <div>
          <div className="font-mono text-[9.5px] font-medium tracking-[0.14em] text-[#6e6e6e]">
            THE DASHBOARD
          </div>
          <h2 className="mt-[12px] max-w-[620px] text-[27px] font-semibold leading-[1.15] tracking-[-0.03em] text-white text-balance sm:text-[32px] md:text-[38px] md:leading-[1.12] md:tracking-[-0.035em]">
            Watch it decide, in real time.
          </h2>
          <p className="mt-[12px] max-w-[560px] text-[14px] leading-[1.6] text-[#a8a8a8] text-pretty md:text-[15px]">
            Pick an environment once and everything scopes to it. The home
            screen answers three questions at a glance — is it healthy, is it
            working, what is it recommending — and the math is always one click
            down.
          </p>
        </div>
        <a
          href="#waitlist"
          className="cta cta-ghost"
        >
          Get a walkthrough
        </a>
      </div>

      <div
        data-reveal
        className="mt-[28px] overflow-hidden rounded-[14px] border border-[#262626] bg-[#0e0e0e] shadow-[0_24px_60px_-30px_rgba(0,0,0,.8)]"
      >
        {/* browser chrome */}
        <div className="flex flex-wrap items-center gap-[8px] border-b border-[#1e1e1e] bg-[#141414] px-[12px] py-[10px] md:px-[16px] md:py-[11px]">
          <span className="h-[9px] w-[9px] rounded-full bg-[#2a2a2a]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#2a2a2a]" />
          <span className="h-[9px] w-[9px] rounded-full bg-[#2a2a2a]" />
          <div className="mx-auto rounded-[6px] border border-[#2a2a2a] bg-[#0e0e0e] px-[14px] py-[4px] font-mono text-[11px] text-[#7a7a7a]">
            app.norai.dev / prod / overview
          </div>
          {/* Says out loud what the file comment already says: these are sample
              figures, not measurements. */}
          <div className="whitespace-nowrap rounded-[5px] border border-[#3a2a26] bg-[#1c1512] px-[8px] py-[3px] font-mono text-[9px] font-medium tracking-[0.1em] text-[#c07a63]">
            SAMPLE DATA
          </div>
        </div>

        <div className="grid min-h-[380px] grid-cols-1 lg:min-h-[520px] lg:grid-cols-[200px_1fr]">
          {/* mock sidebar */}
          <div className="hidden flex-col border-r border-[#1e1e1e] bg-[#121212] px-[12px] py-[14px] lg:flex">
            <div className="mb-[14px] rounded-[8px] border border-[#262626] px-[10px] py-[9px]">
              <div className="font-mono text-[8.5px] font-medium tracking-[0.13em] text-[#7a7a7a]">
                ENVIRONMENT
              </div>
              <div className="mt-[5px] flex items-center gap-[7px]">
                <span className="h-[6px] w-[6px] rounded-full bg-red" />
                <span className="flex-1 text-[12.5px] font-semibold text-[#f2f2f2]">
                  prod
                </span>
                <span className="font-mono text-[10px] text-[#6e6e6e]">⌄</span>
              </div>
            </div>

            <div className="flex flex-col gap-[2px]">
              <GroupLabel>SERVE</GroupLabel>
              {NAV_SERVE.map((l, i) => (
                <SidebarItem key={l} label={l} active={i === 0} />
              ))}
              <GroupLabel>INSPECT</GroupLabel>
              {NAV_INSPECT.map((l) => (
                <SidebarItem
                  key={l}
                  label={l}
                  badge={l === "Event stream" ? "live" : undefined}
                />
              ))}
            </div>

            <div className="mt-auto rounded-[8px] border border-[#262626] px-[11px] py-[10px]">
              <div className="font-mono text-[8.5px] font-medium tracking-[0.13em] text-[#7a7a7a]">
                ENGINES
              </div>
              <div className="mt-[2px] text-[13px] font-semibold tracking-[-0.02em] text-[#f2f2f2]">
                recomputed 02:00
              </div>
              <div className="text-[10px] text-[#7a7a7a]">nightly · or on demand</div>
            </div>
          </div>

          {/* mock main */}
          <div className="px-[14px] py-[14px] md:px-[20px] md:py-[18px]">
            <div className="grid grid-cols-2 gap-[10px] xl:grid-cols-4">
              {KPIS.map((k) => (
                <div
                  key={k.label}
                  className="rounded-[10px] border border-[#262626] bg-[#141414] px-[13px] py-[12px]"
                >
                  <div className="font-mono text-[8.5px] font-medium tracking-[0.13em] text-[#7a7a7a]">
                    {k.label}
                  </div>
                  <div className="mt-[4px] text-[22px] font-semibold tracking-[-0.03em] text-[#f2f2f2]">
                    {k.value}
                  </div>
                  <div className="font-mono text-[10px] text-[#7a7a7a]">
                    {k.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* live recommendations */}
            <div className="mt-[12px] overflow-hidden rounded-[12px] border border-[#262626] bg-[#141414]">
              <div className="flex items-center gap-[10px] border-b border-[#1e1e1e] px-[15px] py-[12px]">
                <span className="text-[13px] font-semibold text-[#f2f2f2]">
                  Live recommendations
                </span>
                <span className="font-mono text-[11px] text-[#7a7a7a]">
                  every result carries a why
                </span>
              </div>

              {RECS.map((r, i) => (
                <div
                  key={r.rank}
                  className={`flex items-center gap-[12px] px-[15px] py-[11px] ${
                    i < RECS.length - 1 ? "border-b border-[#1a1a1a]" : ""
                  } ${r.cold ? "opacity-[0.62]" : ""}`}
                >
                  <span className="w-[12px] font-mono text-[12px] text-[#565656]">
                    {r.rank}
                  </span>
                  <div className="h-[28px] w-[28px] rounded-[6px] bg-[#1f1f1f]" />
                  <div className="flex-1">
                    <div className="text-[12.5px] font-semibold text-[#f2f2f2]">
                      {r.title}
                    </div>
                    <div className="font-mono text-[10px] text-[#7a7a7a]">
                      {r.meta}
                    </div>
                  </div>
                  {r.bars && <SignalBars heights={r.bars} />}
                  {r.cold ? (
                    <div className="rounded-full border border-[#2a2a2a] bg-[#1a1a1a] px-[9px] py-[3px] text-[10.5px] font-medium text-[#8a8a8a]">
                      {r.why}
                    </div>
                  ) : (
                    <div
                      className="rounded-full px-[9px] py-[3px] text-[10.5px] font-medium text-[#ff7a5c]"
                      style={{
                        background: "rgba(236,48,19,.1)",
                        border: "1px solid rgba(236,48,19,.3)",
                      }}
                    >
                      {r.why}
                    </div>
                  )}
                  <span className="w-[32px] text-right font-mono text-[12px] font-medium text-[#f2f2f2]">
                    {r.score}
                  </span>
                </div>
              ))}
            </div>

            {/* next best action */}
            <div className="mt-[12px] flex items-center gap-[12px] rounded-[10px] border border-[#2a2a2a] bg-[#161616] px-[14px] py-[12px]">
              <div className="whitespace-nowrap font-mono text-[8.5px] font-medium tracking-[0.13em] text-[#7a7a7a]">
                NEXT BEST ACTION
              </div>
              <div className="flex-1 text-[12.5px] text-[#d0d0d0]">
                Import your catalog to upgrade cold start from popularity to
                attribute matching.
              </div>
              <div className="whitespace-nowrap rounded-[6px] bg-white px-[12px] py-[7px] text-[11.5px] font-medium text-[#0f0f0f]">
                Import catalog
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
