/**
 * The signal scene — set and cast. Choreography lives in SignalSceneMotion.tsx.
 *
 * Landscape stage: visitor -> one call -> four signals asked at once -> blend ->
 * answer. One pass only.
 *
 * Geometry is one source of truth: every beam endpoint comes from a component
 * rect via an edge anchor, so a beam cannot drift off a box.
 */

const VB = { w: 1000, h: 392 };
/** The horizontal spine every centred actor sits on. */
const SPINE = 194;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}
const rect = (x: number, y: number, w: number, h: number): Rect => ({ x, y, w, h });
const onSpine = (x: number, w: number, h: number) =>
  rect(x, SPINE - h / 2, w, h);

const leftOf = (r: Rect) => [r.x, r.y + r.h / 2] as const;
const rightOf = (r: Rect) => [r.x + r.w, r.y + r.h / 2] as const;

// ---- the set ----------------------------------------------------------------
const VISITOR = onSpine(10, 96, 34);
const CALL = onSpine(138, 112, 46);
const SIG_X = 300;
const SIG_W = 356;
const SIG_H = 78;
const BLEND = onSpine(716, 104, 52);
const ANSWER = onSpine(852, 138, 78);

interface Signal {
  label: string;
  engine: string;
  evidence: string;
  cy: number;
  /** Meter bars and beam width: how strongly this signal answered. */
  weight: 1 | 2 | 3;
  /** How much it moved the answer — return-beam width and brightness. */
  credit: number;
}

const SIGNALS: Signal[] = [
  {
    label: "What they keep choosing",
    engine: "affinity",
    credit: 2,
    evidence: "recency-weighted",
    cy: 59,
    weight: 2,
  },
  {
    label: "What pairs with what",
    engine: "similarity",
    credit: 1.2,
    evidence: "1,240 bought both",
    cy: 149,
    weight: 1,
  },
  {
    label: "What follows what",
    engine: "transitions",
    credit: 4.5,
    evidence: "3 of 4 baskets",
    cy: 239,
    weight: 3,
  },
  {
    label: "What is in demand",
    engine: "popularity",
    credit: 0.9,
    evidence: "covers a new visitor",
    cy: 329,
    weight: 1,
  },
];

const MAX_CREDIT = Math.max(...SIGNALS.map((s) => s.credit));
const sigRect = (s: Signal) => rect(SIG_X, s.cy - SIG_H / 2, SIG_W, SIG_H);

// ---- beams ------------------------------------------------------------------
type Pt = readonly [number, number];
const hLine = (a: Pt, b: Pt) => `M${a[0]},${a[1]} H${b[0]}`;

/**
 * Symmetric S. Both control points sit at half the horizontal run, so the curve
 * leaves and arrives exactly horizontal at the component edges and the control
 * points can never cross.
 *
 * Every route starts at ONE point (Call's right edge) and every reply ends at ONE
 * point (Blend's left edge) — a real split and a real converge.
 */
const fan = (a: Pt, b: Pt) => {
  const k = (b[0] - a[0]) / 2;
  return `M${a[0]},${a[1]} C${a[0] + k},${a[1]} ${b[0] - k},${b[1]} ${b[0]},${b[1]}`;
};
const askPath = (s: Signal) => fan(rightOf(CALL), leftOf(sigRect(s)));
const replyPath = (s: Signal) => fan(rightOf(sigRect(s)), leftOf(BLEND));

/**
 * The exact geometric reverse of a path this file emits.
 *
 * Reverse-drawing via a negative stroke-dashoffset is not portable: SVG 1.1
 * defines a negative offset as an error and some browsers clamp it to 0, which
 * renders the path fully drawn instead of reversed. So the return leg gets its
 * own path that genuinely runs right-to-left and is drawn FORWARDS.
 *
 *   M p0 C p1 p2 p3   ->   M p3 C p2 p1 p0
 *   M a,y  H bx       ->   M bx,y H a
 */
const reversePath = (d: string): string => {
  const cubic = d.match(
    /^M([\d.-]+),([\d.-]+) C([\d.-]+),([\d.-]+) ([\d.-]+),([\d.-]+) ([\d.-]+),([\d.-]+)$/,
  );
  if (cubic) {
    const [, x0, y0, x1, y1, x2, y2, x3, y3] = cubic;
    return `M${x3},${y3} C${x2},${y2} ${x1},${y1} ${x0},${y0}`;
  }
  const horiz = d.match(/^M([\d.-]+),([\d.-]+) H([\d.-]+)$/);
  if (horiz) {
    const [, x0, y0, x1] = horiz;
    return `M${x1},${y0} H${x0}`;
  }
  throw new Error(`reversePath: unsupported path "${d}"`);
};

const pct = (n: number, total: number) => `${(n / total) * 100}%`;
const place = (r: Rect) => ({
  left: pct(r.x, VB.w),
  top: pct(r.y, VB.h),
  width: pct(r.w, VB.w),
  height: pct(r.h, VB.h),
});

const ASK = "#ff7a5c";
const BACK = "#ffd9cf";

function Meter({ weight }: { weight: Signal["weight"] }) {
  return (
    <span aria-hidden className="flex items-end gap-[2px]">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-[1px]"
          style={{
            height: `${3 + i * 2}px`,
            background: i <= weight ? "#ff9d84" : "#333",
          }}
        />
      ))}
    </span>
  );
}

export function SignalScene() {
  return (
    <div
      data-reveal
      data-scene
      className="relative z-[1] mt-[30px] overflow-hidden rounded-[14px] border border-[#262626]"
      style={{
        background: "linear-gradient(180deg,#151515,#111)",
        boxShadow: "0 24px 60px -30px rgba(0,0,0,.8)",
      }}
    >
      <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[3px] border-b border-[#1e1e1e] px-[14px] py-[10px] md:px-[18px]">
        <span className="font-mono text-[9px] font-medium tracking-[0.14em] text-[#7a7a7a]">
          ONE REQUEST
        </span>
        <span className="font-mono text-[11px] text-[#565656]">
          GET /v1/recommendations/recommend
        </span>
        <span className="ml-auto flex items-center gap-[6px] font-mono text-[10.5px] text-[#8a8a8a]">
          <span
            data-nr-anim
            className="h-[5px] w-[5px] rounded-full bg-red"
            style={{ animation: "nr-blink 1.6s infinite" }}
          />
          all four asked at once
        </span>
      </div>

      {/* ================= the stage (lg and up) ================= */}
      <div
        className="relative hidden lg:block"
        style={{ aspectRatio: `${VB.w} / ${VB.h}` }}
      >
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          preserveAspectRatio="none"
          fill="none"
        >
          {/* dark wiring, always drawn, so the set reads while paused */}
          <g stroke="#242424" strokeWidth={1}>
            <path d={hLine(rightOf(VISITOR), leftOf(CALL))} />
            {SIGNALS.map((s, i) => (
              <path key={`w1-${s.engine}`} d={askPath(s)} />
            ))}
            {SIGNALS.map((s, i) => (
              <path key={`w2-${s.engine}`} d={replyPath(s)} />
            ))}
            <path d={hLine(rightOf(BLEND), leftOf(ANSWER))} />
          </g>

          <path
            data-beam-ask
            d={hLine(rightOf(VISITOR), leftOf(CALL))}
            stroke={ASK}
            strokeWidth={2}
            strokeLinecap="round"
            pathLength={1}
          />
          {SIGNALS.map((s, i) => (
            <path
              key={`ask-${s.engine}`}
              data-beam-out
              d={askPath(s)}
              stroke={ASK}
              strokeWidth={s.weight}
              strokeLinecap="round"
              pathLength={1}
            />
          ))}
          {SIGNALS.map((s, i) => (
            <path
              key={`rep-${s.engine}`}
              data-beam-join
              d={replyPath(s)}
              stroke={ASK}
              strokeWidth={s.weight}
              strokeLinecap="round"
              pathLength={1}
            />
          ))}
          {/* ---- the return: same wires, reversed geometry, drawn forwards ---- */}
          <path
            data-beam-back-spine
            d={reversePath(hLine(rightOf(BLEND), leftOf(ANSWER)))}
            stroke={BACK}
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
          />
          {SIGNALS.map((s) => (
            <path
              key={`back-${s.engine}`}
              data-beam-back
              data-strength={(s.credit / MAX_CREDIT).toFixed(3)}
              d={reversePath(replyPath(s))}
              stroke={BACK}
              strokeWidth={s.credit}
              strokeLinecap="round"
              pathLength={1}
            />
          ))}

          <path
            data-beam-verdict
            d={hLine(rightOf(BLEND), leftOf(ANSWER))}
            stroke={ASK}
            strokeWidth={2.5}
            strokeLinecap="round"
            pathLength={1}
          />

        </svg>

        {/* ---- the cast ---- */}
        <div
          className="nr-actor absolute flex flex-col justify-center px-[9px]"
          style={place(VISITOR)}
        >
          <span className="font-mono text-[8.5px] text-[#6e6e6e]">VISITOR</span>
          <span className="font-mono text-[10px] text-[#b4b4b4]">anon_8f2</span>
        </div>

        <div
          className="nr-actor nr-call absolute flex flex-col justify-center px-[11px]"
          style={place(CALL)}
        >
          <span className="font-mono text-[8.5px] text-[#ff9d84]">ONE CALL</span>
          <span className="font-mono text-[9.5px] text-[#8a8a8a]">
            /v1/recommend
          </span>
        </div>

        {SIGNALS.map((s) => (
          <div
            key={s.engine}
            data-signal
            className="nr-node absolute flex flex-col justify-center rounded-[10px] border border-[#2a2a2a] px-[14px]"
            style={place(sigRect(s))}
          >
            <span
              aria-hidden
              data-glow
              className="nr-node-glow pointer-events-none absolute inset-0 rounded-[10px]"
            />
            <div className="relative flex items-center gap-[10px]">
              <span className="flex-1 truncate text-[13px] font-medium text-[#f2f2f2]">
                {s.label}
              </span>
              <Meter weight={s.weight} />
            </div>
            <div className="relative mt-[4px] flex items-baseline gap-[8px]">
              <span className="font-mono text-[10px] text-[#ff9d84]">
                {s.engine}
              </span>
              <span className="truncate font-mono text-[10px] text-[#6e6e6e]">
                {s.evidence}
              </span>
            </div>
          </div>
        ))}

        <div
          className="nr-actor absolute flex flex-col justify-center px-[11px]"
          style={place(BLEND)}
        >
          <span className="font-mono text-[8.5px] text-[#6e6e6e]">BLEND</span>
          <span className="font-mono text-[9.5px] text-[#b4b4b4]">
            by confidence
          </span>
          <span aria-hidden className="mt-[4px] flex h-[3px] gap-[2px]">
            <span className="flex-[72] rounded-[1px] bg-[#ff9d84]" />
            <span className="flex-[28] rounded-[1px] bg-[#3a3a3a]" />
          </span>
        </div>

        <div
          data-verdict
          className="nr-verdict absolute flex flex-col justify-center rounded-[11px] border px-[14px]"
          style={place(ANSWER)}
        >
          <span className="font-mono text-[8.5px] font-medium tracking-[0.13em] text-[#ff7a5c]">
            THE ANSWER
          </span>
          <span className="mt-[3px] font-mono text-[12.5px] text-white">
            sku-71a3
          </span>
          <span className="mt-[3px] text-[11px] leading-[1.3] text-[#ffd9cf]">
            because it follows sku-4c19
          </span>
        </div>
      </div>

      {/* ================= stacked, below lg ================= */}
      <div className="flex flex-col gap-[9px] px-[14px] pb-[16px] pt-[14px] lg:hidden">
        <div className="font-mono text-[10.5px] text-[#8a8a8a]">
          anon_8f2 · one call · all four asked at once
        </div>
        {SIGNALS.map((s) => (
          <div
            key={s.engine}
            className="nr-lit rounded-[10px] border border-[#2a2a2a] px-[13px] py-[11px]"
          >
            <div className="flex items-center gap-[10px]">
              <span className="flex-1 text-[13px] font-medium text-[#f2f2f2]">
                {s.label}
              </span>
              <Meter weight={s.weight} />
            </div>
            <div className="mt-[3px] flex items-baseline gap-[8px]">
              <span className="font-mono text-[10px] text-[#ff9d84]">
                {s.engine}
              </span>
              <span className="font-mono text-[10px] text-[#6e6e6e]">
                {s.evidence}
              </span>
            </div>
          </div>
        ))}
        <div className="nr-verdict rounded-[11px] border px-[13px] py-[12px]">
          <div className="font-mono text-[9px] font-medium tracking-[0.13em] text-[#ff7a5c]">
            THE ANSWER
          </div>
          <div className="mt-[5px] font-mono text-[12.5px] text-white">
            sku-71a3
          </div>
          <div className="mt-[4px] text-[12px] text-[#ffd9cf]">
            because it follows sku-4c19 — every answer names its signals
          </div>
        </div>
      </div>
    </div>
  );
}
