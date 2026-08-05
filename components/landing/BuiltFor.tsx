const SECTORS = [
  "quick commerce",
  "grocery",
  "marketplaces",
  "food delivery",
  "fashion retail",
  "pharmacy",
  "media",
  "ticketing",
];

export function BuiltFor() {
  const edgeFade =
    "linear-gradient(90deg,transparent 0,#000 48px,#000 calc(100% - 48px),transparent 100%)";
  return (
    <div className="mx-auto max-w-[1200px] overflow-hidden px-[18px] pt-[28px] md:px-[28px] md:pt-[36px]">
      <div className="flex items-center gap-[20px] border-t border-[#1e1e1e] pt-[16px]">
        <span className="whitespace-nowrap font-mono text-[9.5px] font-medium tracking-[0.14em] text-[#6e6e6e]">
          BUILT FOR
        </span>
        <div
          className="relative flex-1 overflow-hidden"
          style={{ WebkitMaskImage: edgeFade, maskImage: edgeFade }}
        >
          <div
            data-nr-anim
            className="flex w-max gap-[44px] text-[13px] font-medium text-[#565656]"
            style={{ animation: "nr-marq 26s linear infinite" }}
          >
            {[...SECTORS, ...SECTORS].map((s, i) => (
              <span key={`${s}-${i}`}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
