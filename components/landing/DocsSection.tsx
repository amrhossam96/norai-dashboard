import { JsonCode } from "./JsonCode";
import { SdkPlatforms } from "./SdkPlatforms";

const FEATURES = [
  { title: "Plain HTTP", body: "Two endpoints, any language. Nothing to install." },
  {
    title: "Environments",
    body: "Staging and prod are fully isolated data.",
  },
  { title: "Privacy", body: "Erase a visitor on request, across every store." },
  { title: "Playground", body: "Run a request as any visitor, read its trace." },
];

/** Dark terminal card shell shared by both code samples. */
function CodeCard({
  eyebrow,
  meta,
  children,
}: {
  eyebrow: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#262626] bg-[#101010]">
      <div className="flex items-center gap-[10px] border-b border-[#1e1e1e] px-[16px] py-[11px]">
        <span className="font-mono text-[9px] font-medium tracking-[0.13em] text-[#7a7a7a]">
          {eyebrow}
        </span>
        <span className="ml-auto font-mono text-[10.5px] text-[#565656]">
          {meta}
        </span>
      </div>
      <pre className="m-0 overflow-x-auto p-[16px] font-mono text-[12px] leading-[1.75] text-[#d8d8d8]">
        {children}
      </pre>
    </div>
  );
}

export function DocsSection() {
  return (
    <div
      id="docs"
      className="mx-auto max-w-[1200px] px-[18px] pt-[52px] md:px-[28px] md:pt-[76px]"
      style={{ scrollMarginTop: 70 }}
    >
      <div data-reveal>
        <div className="font-mono text-[9.5px] font-medium tracking-[0.14em] text-[#6e6e6e]">
          FOR THE ENGINEER EVALUATING THIS
        </div>
        <h2 className="mt-[12px] max-w-[640px] text-[27px] leading-[1.15] sm:text-[32px] md:text-[38px] font-semibold md:leading-[1.12] tracking-[-0.035em] text-white text-balance">
          Two calls. That is the whole integration.
        </h2>
      </div>

      <div
        data-reveal
        className="mt-[28px] grid grid-cols-1 items-start gap-[14px] lg:grid-cols-2"
      >
        <CodeCard eyebrow="WHAT COMES BACK" meta="200 OK">
          <JsonCode
            source={`{ "data": {
  "entity_type": "product",
  "items": [{
    "entity_id": "ent_71a3",
    "score": 0.87,
    "confidence": 0.72,
    "reasons": [{ "source": "transitions",
      "detail": "follows sku-4c19" }]
  }]
}}`}
          />
        </CodeCard>

        <SdkPlatforms />
      </div>

      <div data-reveal className="mt-[14px] grid grid-cols-2 gap-[14px] lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="nr-lit rounded-[12px] border border-[#262626] bg-[#141414] px-[18px] py-[16px]"
          >
            <div className="text-[14px] font-semibold text-[#f2f2f2]">
              {f.title}
            </div>
            <div className="mt-[4px] text-[12.5px] leading-[1.55] text-[#8a8a8a]">
              {f.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
