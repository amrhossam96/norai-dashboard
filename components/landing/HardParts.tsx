interface Part {
  n: string;
  title: string;
  body: string;
  statLabel: string;
  statValue: string;
  /** Render the stat in red — reserved for the "the why" card. */
  redStat?: boolean;
}

const PARTS: Part[] = [
  {
    n: "01",
    title: "Never returns an empty shelf",
    body: "A brand-new visitor has no history to rank, so norai serves popularity for their entity type instead of nothing — then switches to their own affinity as soon as their first events land. Catalog attributes sharpen that very first request even further.",
    statLabel: "visitor #1 today",
    statValue: "popularity fallback",
  },
  {
    n: "02",
    title: "Lightweight enough to ship this week",
    body: "One endpoint to send events, one to ask for recommendations. No feature store to run, no pipeline to babysit, no GPUs, no model to train — the engines are heuristics over your own event stream.",
    statLabel: "to integrate",
    statValue: "two HTTP calls",
  },
  {
    n: "03",
    title: "Every result comes with its reason",
    body: "Each item ships with the signal that produced it and a readable detail — affinity, similarity or transitions — so you can settle an argument about why something ranked. Nothing here is a black box you have to take on faith.",
    statLabel: "every item carries",
    statValue: "source + detail",
  },
];

/* One spacing scale for the whole card, so the three of them share a rhythm
 * instead of each inventing its own gaps. */
const GUTTER = "px-[20px]";
const BAND = "py-[13px]";
const RULE = "border-[#1e1e1e]";

/**
 * Three stacked bands — index, content, stat — with the rules running the full
 * width of the card.
 *
 * The card is a flex column and the content band takes the slack, so the lower
 * rule sits on the floor of every card no matter how long the body copy runs.
 * Titles get a two-line floor for the same reason: without it a one-line title
 * starts its body 24px higher than its neighbour's.
 */
function PartCard({ part }: { part: Part }) {
  return (
    <div
      data-reveal
      className="nr-lit flex h-full flex-col overflow-hidden rounded-[12px] border border-[#262626] bg-[#141414]"
    >
      <div className={`border-b ${RULE} ${GUTTER} ${BAND}`}>
        <span className="font-mono text-[11px] font-medium text-[#565656]">
          {part.n}
        </span>
      </div>

      <div className={`flex flex-1 flex-col ${GUTTER} py-[18px]`}>
        <h3 className="text-[19px] md:min-h-[48px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#f2f2f2] text-balance">
          {part.title}
        </h3>
        <p className="mt-[12px] text-[13.5px] leading-[1.6] text-[#a8a8a8] text-pretty">
          {part.body}
        </p>
      </div>

      <div
        className={`flex flex-wrap items-baseline justify-between gap-x-[10px] border-t ${RULE} ${GUTTER} ${BAND} font-mono text-[11.5px]`}
      >
        <span className="text-[#6e6e6e]">{part.statLabel}</span>
        <span className={part.redStat ? "text-red" : "text-[#f2f2f2]"}>
          {part.statValue}
        </span>
      </div>
    </div>
  );
}

export function HardParts() {
  return (
    <div
      id="system"
      className="mx-auto max-w-[1200px] px-[18px] pt-[52px] md:px-[28px] md:pt-[76px]"
      style={{ scrollMarginTop: 70 }}
    >
      <div data-reveal>
        <div className="font-mono text-[9.5px] font-medium tracking-[0.14em] text-[#6e6e6e]">
          THE THREE HARD PARTS
        </div>
        <h2 className="mt-[12px] max-w-[680px] text-[27px] leading-[1.15] sm:text-[32px] md:text-[38px] font-semibold md:leading-[1.12] tracking-[-0.035em] text-white text-balance">
          Everyone can rank items. The hard parts are the first visitor, the
          weight, and the why.
        </h2>
      </div>

      <div className="mt-[30px] grid grid-cols-1 items-stretch gap-[14px] md:grid-cols-3">
        {PARTS.map((p) => (
          <PartCard key={p.n} part={p} />
        ))}
      </div>
    </div>
  );
}
