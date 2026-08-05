"use client";

import { useState } from "react";
import { Meter } from "@/components/ui/Meter";
import { SignalBars } from "@/components/ui/SignalBars";
import type { LiveResult, LiveResultsModel, WhyDetail } from "@/lib/viewmodels";

function WhyPanel({ detail }: { detail: WhyDetail }) {
  return (
    <div className="border-b border-line-softest bg-surface-3 pb-[16px] pl-[66px] pr-[18px]">
      <div className="flex gap-[14px] pt-[14px]">
        {/* left: the sentence-first explanation */}
        <div className="flex-1 border-l-2 border-red pl-[12px]">
          <div className="eyebrow" style={{ color: "var(--color-red-ink)" }}>
            Why this
          </div>
          <div
            className="mt-[4px] max-w-[520px] font-sans text-[13px] leading-[1.55] text-ink-2 [&_b]:font-semibold [&_b]:text-ink"
            dangerouslySetInnerHTML={{ __html: detail.narrative }}
          />
          <div className="mt-[10px] flex flex-wrap gap-[6px]">
            {detail.seeds.map((seed) => (
              <span
                key={seed.label}
                className={`rounded-full border border-line-3 px-[9px] py-[3px] font-sans text-[10.5px] font-medium ${
                  seed.muted ? "text-grey-55" : "text-ink-3"
                }`}
              >
                {seed.label}
                {seed.strength !== undefined && ` · ${seed.strength.toFixed(2)}`}
              </span>
            ))}
          </div>
        </div>

        {/* right: signal contribution bars */}
        <div className="flex w-[280px] flex-col gap-[8px]">
          <div className="eyebrow">Signal contribution</div>
          {detail.contributions.map((c) => (
            <div key={c.label}>
              <div className="flex justify-between font-sans text-[11.5px] text-ink-3">
                <span>{c.label}</span>
                <span className="font-mono">{c.value}</span>
              </div>
              <div className="mt-[4px]">
                <Meter value={c.fill} tone={c.tone} height={5} />
              </div>
            </div>
          ))}
          {detail.rules && (
            <div className="font-sans text-[11px] text-grey-40">
              Rules applied: {detail.rules}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultRow({
  result,
  open,
  onToggle,
}: {
  result: LiveResult;
  open: boolean;
  onToggle: () => void;
}) {
  const expandable = Boolean(result.detail);
  return (
    <>
      <div
        onClick={expandable ? onToggle : undefined}
        className={`flex items-center gap-[14px] border-b border-line-softest px-[18px] py-[13px] ${
          expandable ? "cursor-pointer hover:bg-surface-3" : ""
        }`}
        style={{ opacity: result.dim ? 0.62 : 1 }}
      >
        <span className="w-[16px] font-mono text-[13px] font-semibold text-grey-75">
          {result.rank}
        </span>
        <div className="h-[34px] w-[34px] flex-none rounded-[7px] bg-[#1f1f1f]" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-sans text-[13px] font-semibold text-ink">
            {result.title}
          </div>
          <div className="font-mono text-[10.5px] text-grey-60">
            {result.entityType} · {result.entityId}
          </div>
        </div>
        {result.spark && <SignalBars values={result.spark} />}
        <div
          className={result.coldStart ? "chip" : "why-chip"}
          style={{
            maxWidth: 430,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {result.why}
        </div>
        <span className="w-[38px] text-right font-mono text-[13px] font-medium text-ink">
          {result.score.toFixed(2)}
        </span>
      </div>
      {expandable && open && result.detail && <WhyPanel detail={result.detail} />}
    </>
  );
}

export function LiveResults({ model }: { model: LiveResultsModel }) {
  // The top result (with a full trace) is expanded by default, per the design.
  const firstExpandable = model.results.find((r) => r.detail)?.rank ?? null;
  const [openRank, setOpenRank] = useState<number | null>(firstExpandable);

  return (
    <div className="mt-[22px] overflow-hidden rounded-[12px] border border-line bg-surface">
      <div className="flex items-center gap-[12px] border-b border-line-soft px-[18px] py-[14px]">
        <span className="font-sans text-[14px] font-semibold text-ink">
          Live results
        </span>
        <span className="font-mono text-[11.5px] text-grey-55">
          {model.user} · {model.surface} · {model.timestamp}
        </span>
        <button className="ml-auto font-sans text-[11.5px] font-medium text-grey-40 transition-colors hover:text-ink">
          Copy as cURL
        </button>
      </div>

      {model.results.map((r) => (
        <ResultRow
          key={r.rank}
          result={r}
          open={openRank === r.rank}
          onToggle={() => setOpenRank(openRank === r.rank ? null : r.rank)}
        />
      ))}
    </div>
  );
}
