import { PipelineHero } from "@/components/pipeline/PipelineHero";
import { PipelineDiagram } from "@/components/pipeline/PipelineDiagram";
import { KpiCards } from "@/components/pipeline/KpiCards";
import { LiveResults } from "@/components/pipeline/LiveResults";
import { CatalogBanner } from "@/components/pipeline/CatalogBanner";
import {
  mockKpis,
  mockLiveResults,
  mockPipeline,
} from "@/lib/mock/pipeline";

export default function PipelinePage() {
  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      {/* Every figure on this screen comes from lib/mock. The backend exposes no
          metrics read API yet — no counts, CTR, latency or coverage endpoint —
          so none of it can be real. Delete this banner when the numbers are. */}
      <div className="mb-[18px] flex items-center gap-[10px] rounded-[8px] border border-line bg-surface px-[14px] py-[10px]">
        <span className="rounded-[5px] border border-line-2 px-[7px] py-[2px] font-mono text-[9px] font-medium tracking-[0.1em] text-grey-55">
          SAMPLE DATA
        </span>
        <span className="font-sans text-[12px] text-grey-40">
          Placeholder figures — the metrics API is not built yet, so nothing on
          this screen is measured.
        </span>
      </div>
      <PipelineHero />
      <div className="no-scrollbar overflow-x-auto">
        <PipelineDiagram model={mockPipeline} />
      </div>
      <KpiCards kpis={mockKpis} />
      <LiveResults model={mockLiveResults} />
      <CatalogBanner />
    </div>
  );
}
