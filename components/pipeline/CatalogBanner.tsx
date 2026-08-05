export function CatalogBanner() {
  return (
    <div className="mt-[16px] flex items-center gap-[14px] rounded-[10px] border border-line bg-surface px-[16px] py-[14px]">
      <div className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-[7px] bg-white font-mono text-[11px] font-medium text-[#0f0f0f]">
        !
      </div>
      <div className="flex-1">
        <div className="font-sans text-[13px] font-semibold text-ink">
          Import your catalog to turn on content cold-start
        </div>
        <div className="mt-[1px] font-sans text-[12px] text-grey-40">
          6% of requests fall back to popularity today — those are the only
          explanations that can’t name a reason.
        </div>
      </div>
      <button className="flex-none rounded-[7px] bg-white px-[14px] py-[8px] font-sans text-[12px] font-medium text-[#0f0f0f] transition-opacity hover:opacity-90">
        Import catalog
      </button>
    </div>
  );
}
