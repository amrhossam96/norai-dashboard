/**
 * Dashboard view models. These are composites the *screen* needs — the pipeline
 * diagram, KPI tiles, the Glassbox result feed with signal-contribution bars —
 * assembled from one or more backend responses (recommend reasons, playground
 * traces, health checks, engine freshness). Kept separate from lib/api/types.ts,
 * which mirrors raw backend shapes.
 */

export interface PipelineContext {
  seeds: number;
  seen: number;
  negative: number;
  confidence: number; // 0..1, drives the meter
}

export interface CandidateSource {
  name: string;
  /** candidates contributed, e.g. 142 */
  count?: number;
  /** weight in the blend, e.g. 0.5 */
  weight?: number;
  /** "fallback" | "needs catalog" | ... — overrides the count/weight caption */
  note?: string;
  /** unbuilt/dashed slot — the seam, shown as a sales pitch */
  pending?: boolean;
  /** the "+ add source" affordance */
  add?: boolean;
}

export interface MergeStep {
  label: string;
  delta: number; // negative
}

export interface RankSetting {
  label: string;
  value: string;
}

export interface PipelineModel {
  context: PipelineContext;
  sources: CandidateSource[];
  merge: {
    from: number;
    to: number;
    steps: MergeStep[];
  };
  rank: {
    summary: string; // "Blend → top 10"
    settings: RankSetting[];
    meter: number; // 0..1 fill for the red bar
  };
  throughput: string[]; // footer captions
}

export interface Kpi {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  /** flags this tile as the one that needs attention (red dot) */
  alert?: boolean;
}

export interface SignalContribution {
  label: string; // "similarity · 0.81"
  value: string; // "0.44"
  fill: number; // 0..1 bar
  tone: "ink" | "grey" | "faint"; // bar shade
}

export interface ResultSeed {
  label: string;
  strength?: number;
  muted?: boolean;
}

export interface WhyDetail {
  narrative: string; // the full sentence, one click down
  seeds: ResultSeed[];
  contributions: SignalContribution[];
  rules?: string;
}

export interface LiveResult {
  rank: number;
  title: string;
  entityType: string;
  entityId: string;
  /** the 4-bar signal spark, values 0..100 (%) */
  spark?: number[];
  /** the short red "why" chip — the sentence-first explanation */
  why: string;
  /** neutral (grey) chip instead of red — used for cold-start / popularity */
  coldStart?: boolean;
  score: number;
  /** expanded Glassbox breakdown, shown for the top result */
  detail?: WhyDetail;
  dim?: boolean;
}

export interface LiveResultsModel {
  user: string;
  surface: string;
  timestamp: string;
  results: LiveResult[];
}

export interface Environment {
  team: string;
  name: string;
  id: string;
  kind: "production" | "staging" | "development" | "custom";
}
