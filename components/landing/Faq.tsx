interface FaqItem {
  n: string;
  q: string;
  a: string;
}

const FAQS: FaqItem[] = [
  {
    n: "01",
    q: "How is this different from the recommender we could build ourselves?",
    a: "You could build ranking. What takes teams a year is the identity stitching across anonymous and logged-in sessions, a fallback that keeps a first-time visitor from seeing an empty shelf, and an explanation trace you can actually read. norai is those three plus ranking, behind one endpoint.",
  },
  {
    n: "02",
    q: "What do you need from us to start?",
    a: "An event stream. That is genuinely it — one call to send events, one to ask for recommendations. A catalog export is the second input: it upgrades cold start from popularity to attribute matching.",
  },
  {
    n: "03",
    q: "Does it work for anonymous visitors?",
    a: "Yes, and this is the point. A brand-new anonymous visitor is served popularity for the entity type rather than nothing, their own affinity starts building on their first event, and when they log in that anonymous history stitches onto the account rather than being thrown away.",
  },
  {
    n: "04",
    q: "How do you prove the lift is real?",
    a: "A holdout group. A slice of traffic never sees a norai recommendation, and incremental order value is measured against that baseline rather than a self-reported click number. Every recommendation also carries its own trace, so you can read which signal produced each item and why.",
  },
  {
    n: "05",
    q: "Can non-engineers change what gets recommended?",
    a: "Surfaces are configured in plain sentences — boost in-stock items under 25 minutes, never repeat what someone already bought, at most three items per brand. Every rule shows its blast radius before you save it, and rule effects show up inside the explanation.",
  },
  {
    n: "06",
    q: "Where does our data live, and can we get it out?",
    a: "Environments are hard data-isolation boundaries. Deletion is one click and covers every store we keep. Nothing about the integration locks you in — it is two HTTP calls.",
  },
];

export function Faq() {
  return (
    <div
      id="faq"
      className="mx-auto max-w-[1200px] px-[18px] pt-[52px] md:px-[28px] md:pt-[76px]"
      style={{ scrollMarginTop: 70 }}
    >
      <div
        data-reveal
        className="grid grid-cols-1 items-start gap-[24px] lg:grid-cols-[340px_1fr] lg:gap-[40px]"
      >
        <div className="lg:sticky lg:top-[88px]">
          <div className="font-mono text-[9.5px] font-medium tracking-[0.14em] text-[#6e6e6e]">
            QUESTIONS
          </div>
          <h2 className="mt-[12px] text-[26px] leading-[1.18] sm:text-[30px] lg:text-[34px] font-semibold lg:leading-[1.14] tracking-[-0.035em] text-white text-balance">
            The things people ask on the first call.
          </h2>
          <p className="mt-[12px] text-[14px] leading-[1.6] text-[#a8a8a8]">
            Anything else, ask us directly — you will get an engineer, not a
            form.
          </p>
        </div>

        <div className="border-t border-[#262626]">
          {FAQS.map((f) => (
            <div
              key={f.n}
              className="border-b border-[#1e1e1e] px-[4px] py-[20px] transition-colors hover:bg-[#141414]"
            >
              <div className="flex items-start gap-[16px]">
                <span className="pt-[3px] font-mono text-[11px] font-medium text-[#565656]">
                  {f.n}
                </span>
                <div className="flex-1">
                  <div className="text-[16px] font-semibold tracking-[-0.015em] text-[#f2f2f2]">
                    {f.q}
                  </div>
                  <div className="mt-[7px] max-w-[600px] text-[13.5px] leading-[1.65] text-[#a8a8a8] text-pretty">
                    {f.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
