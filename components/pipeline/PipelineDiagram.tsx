"use client";

import { useState } from "react";
import { Meter } from "@/components/ui/Meter";
import type { CandidateSource, PipelineModel } from "@/lib/viewmodels";

function StatRow({
  label,
  value,
  dark,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div className="flex justify-between font-mono text-[11.5px] text-grey-40">
      <span>{label}</span>
      <span style={{ color: dark ? "#fff" : "var(--color-ink)" }}>{value}</span>
    </div>
  );
}

function StageShell({
  eyebrow,
  aside,
  dark,
  children,
  onClick,
  active,
}: {
  eyebrow: string;
  aside?: string;
  dark?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-[10px] border px-[14px] py-[13px] text-left transition-all"
      style={{
        background: dark ? "var(--color-panel)" : "var(--color-surface-2)",
        borderColor:
          active && !dark
            ? "var(--color-ink)"
            : "var(--color-line-3)",
        boxShadow: active && !dark ? "0 1px 3px rgba(15,15,15,0.08)" : "none",
      }}
    >
      <div className="flex items-baseline justify-between">
        <div
          className="eyebrow"
          style={{ color: dark ? "var(--color-grey-40)" : undefined }}
        >
          {eyebrow}
        </div>
        {aside && (
          <div className="font-mono text-[10px] text-grey-65">{aside}</div>
        )}
      </div>
      {children}
    </button>
  );
}

function Connector() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-px w-full bg-line-2" />
    </div>
  );
}

function SourceCard({ source }: { source: CandidateSource }) {
  if (source.add) {
    return (
      <div className="flex items-center justify-center rounded-[7px] border border-dashed border-grey-85 px-[9px] py-[8px]">
        <span className="font-mono text-[10.5px] font-medium text-grey-60">
          {source.name}
        </span>
      </div>
    );
  }
  const caption = source.pending
    ? source.note
    : source.note
      ? `${source.count} · ${source.note}`
      : `${source.count} · w ${source.weight?.toFixed(1)}`;
  return (
    <div
      className={`rounded-[7px] border px-[9px] py-[8px] ${
        source.pending
          ? "border-dashed border-grey-85"
          : "border-line-3 bg-surface"
      }`}
    >
      <div
        className={`font-sans text-[11.5px] font-semibold ${
          source.pending ? "text-grey-60" : "text-ink"
        }`}
      >
        {source.name}
      </div>
      <div
        className={`font-mono text-[10px] ${
          source.pending ? "text-grey-70" : "text-grey-55"
        }`}
      >
        {caption}
      </div>
    </div>
  );
}

export function PipelineDiagram({ model }: { model: PipelineModel }) {
  const [active, setActive] = useState<number | null>(null);
  const { context, sources, merge, rank } = model;

  return (
    <div className="mt-[22px] rounded-[12px] border border-line bg-surface p-[20px] shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
      <div
        className="grid items-stretch gap-0"
        style={{
          gridTemplateColumns: "1fr 20px 1.55fr 20px 1fr 20px 1fr",
          minWidth: 860,
        }}
      >
        {/* 01 · CONTEXT */}
        <StageShell
          eyebrow="01 · Context"
          active={active === 0}
          onClick={() => setActive(active === 0 ? null : 0)}
        >
          <div className="mt-[6px] font-sans text-[14px] font-semibold text-ink">
            Resolve user
          </div>
          <div className="mt-[11px] flex flex-col gap-[6px]">
            <StatRow label="seeds" value={String(context.seeds)} />
            <StatRow label="seen" value={String(context.seen)} />
            <StatRow label="negative" value={String(context.negative)} />
            <StatRow label="confidence" value={context.confidence.toFixed(2)} />
          </div>
          <div className="mt-[12px]">
            <Meter value={context.confidence} tone="ink" />
          </div>
        </StageShell>

        <Connector />

        {/* 02 · CANDIDATE SOURCES */}
        <StageShell
          eyebrow="02 · Candidate sources"
          aside="concurrent"
          active={active === 1}
          onClick={() => setActive(active === 1 ? null : 1)}
        >
          <div className="mt-[11px] grid grid-cols-2 gap-[7px]">
            {sources.map((s) => (
              <SourceCard key={s.name} source={s} />
            ))}
          </div>
        </StageShell>

        <Connector />

        {/* 03 · MERGE & FILTER */}
        <StageShell
          eyebrow="03 · Merge & filter"
          active={active === 2}
          onClick={() => setActive(active === 2 ? null : 2)}
        >
          <div className="mt-[6px] font-sans text-[14px] font-semibold text-ink">
            {merge.from} → {merge.to}
          </div>
          <div className="mt-[11px] flex flex-col gap-[6px]">
            {merge.steps.map((s) => (
              <StatRow key={s.label} label={s.label} value={String(s.delta)} />
            ))}
          </div>
          <div className="mt-[12px]">
            <Meter value={merge.to / merge.from} tone="ink" />
          </div>
        </StageShell>

        <Connector />

        {/* 04 · RANK & SERVE (dark) */}
        <StageShell
          eyebrow="04 · Rank & serve"
          dark
          active={active === 3}
          onClick={() => setActive(active === 3 ? null : 3)}
        >
          <div className="mt-[6px] font-sans text-[14px] font-semibold text-white">
            {rank.summary}
          </div>
          <div className="mt-[11px] flex flex-col gap-[6px]">
            {rank.settings.map((s) => (
              <StatRow key={s.label} label={s.label} value={s.value} dark />
            ))}
          </div>
          <div className="mt-[12px]">
            <Meter value={rank.meter} tone="red" dark />
          </div>
        </StageShell>
      </div>

      <div className="mt-[12px] flex flex-wrap gap-x-[22px] gap-y-1 font-mono text-[11.5px] text-grey-55">
        {model.throughput.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}
