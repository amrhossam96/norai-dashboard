export function PipelineHero() {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <div className="eyebrow" style={{ letterSpacing: "0.14em" }}>
          The system
        </div>
        <h1 className="mt-[7px] font-sans text-[27px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
          One request. Every layer.
        </h1>
        <p className="mt-[7px] max-w-[620px] text-pretty font-sans text-[13.5px] leading-[1.55] text-muted">
          From an event to a served recommendation — this is the actual path a
          request takes, and every box on it is something norai runs for you.
          Click a stage to inspect it live.
        </p>
      </div>
      <div className="flex flex-none gap-[8px]">
        <button className="rounded-[7px] border border-line bg-surface px-[12px] py-[8px] font-sans text-[12px] font-medium text-ink transition-colors hover:border-grey-85">
          home_feed ⌄
        </button>
        <button className="rounded-[7px] bg-white px-[14px] py-[9px] font-sans text-[12px] font-medium text-[#0f0f0f] transition-opacity hover:opacity-90">
          Replay a request
        </button>
      </div>
    </div>
  );
}
