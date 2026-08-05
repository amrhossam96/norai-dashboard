/**
 * Mock data for the flagship "Pipeline" home screen (design direction 2a).
 * Values are lifted verbatim from the Claude Design canvas so the build renders
 * pixel-faithful. When the backend goes live, these are replaced by:
 *   - context/merge/rank      → the ContextResolver + pipeline trace
 *   - sources                 → the CandidateSource registry + per-source counts
 *   - kpis                    → recs-served / CTR / coverage metrics
 *   - liveResults             → GET /recommendations/recommend `reasons[]`
 */
import type {
  Environment,
  Kpi,
  LiveResultsModel,
  PipelineModel,
} from "@/lib/viewmodels";

export const mockEnvironment: Environment = {
  team: "",
  name: "prod",
  id: "env_8f21c04",
  kind: "production",
};

export const mockPipeline: PipelineModel = {
  context: { seeds: 14, seen: 208, negative: 3, confidence: 0.72 },
  sources: [
    { name: "Affinity", count: 142, weight: 0.5 },
    { name: "Similarity", count: 386, weight: 1.0 },
    { name: "Transitions", count: 97, weight: 1.0 },
    { name: "Popularity", count: 200, note: "fallback" },
    { name: "Content match", note: "needs catalog", pending: true },
    { name: "+ add source", add: true },
  ],
  merge: {
    from: 825,
    to: 419,
    steps: [
      { label: "dedup", delta: -188 },
      { label: "seen filter", delta: -201 },
      { label: "negative", delta: -9 },
      { label: "out of stock", delta: -8 },
    ],
  },
  rank: {
    summary: "Blend → top 10",
    settings: [
      { label: "rank-norm", value: "on" },
      { label: "conf blend", value: "0.72" },
      { label: "diversity", value: "3/brand" },
      { label: "p95", value: "38ms" },
    ],
    meter: 0.47,
  },
  throughput: [
    "1,204 req/min",
    "p95 38ms · budget 80ms",
    "every stage swappable — a learned ranker plugs in at 04",
  ],
};

export const mockKpis: Kpi[] = [
  { label: "Recs served · 7d", value: "2.41M", delta: "▲ 12.4%" },
  { label: "Click-through", value: "7.9%", delta: "▲ 1.1pt vs baseline" },
  { label: "Coverage", value: "94%", delta: "users with a personal rec" },
  {
    label: "Integration",
    value: "1 issue",
    delta: "no catalog connected",
    alert: true,
  },
];

export const mockLiveResults: LiveResultsModel = {
  user: "usr_9c41",
  surface: "home_feed",
  timestamp: "14:22:07",
  results: [
    {
      rank: 1,
      title: "Mixed Grill Platter",
      entityType: "restaurant",
      entityId: "ent_71a3",
      spark: [100, 64, 6, 22],
      why: "Because you ordered Tawouk Meal twice this week",
      score: 0.87,
      detail: {
        narrative:
          "Because you ordered a <b>Tawouk Meal</b> twice this week, and people who order that usually order this next.",
        seeds: [
          { label: "Tawouk Meal", strength: 0.91 },
          { label: "Manakish Zaatar", strength: 0.44 },
          { label: "+12 seeds", muted: true },
        ],
        contributions: [
          { label: "similarity · 0.81", value: "0.44", fill: 0.52, tone: "ink" },
          {
            label: "transitions · +1.40",
            value: "0.31",
            fill: 0.36,
            tone: "grey",
          },
          {
            label: "popularity · rank 24",
            value: "0.12",
            fill: 0.14,
            tone: "faint",
          },
        ],
        rules: "exclude_seen · boost in-stock & <25min ×1.2",
      },
    },
    {
      rank: 2,
      title: "Falafel Sandwich Combo",
      entityType: "dish",
      entityId: "ent_4c19",
      spark: [41, 88, 30, 12],
      why: "People who ordered grills order this next",
      score: 0.79,
    },
    {
      rank: 3,
      title: "Fattoush",
      entityType: "dish",
      entityId: "ent_2277",
      spark: [22, 35, 71, 18],
      why: "Pairs with your last two orders",
      score: 0.71,
    },
    {
      rank: 4,
      title: "Ayran 250ml",
      entityType: "grocery_item",
      entityId: "ent_9910",
      why: "Cold start — popular nearby, 18:00–21:00",
      coldStart: true,
      score: 0.63,
      dim: true,
    },
  ],
};

/* Deliberately no lift/holdout mock lives here: the backend has no experiment
 * framework, so there is nothing for it to become. Reinstate it alongside the
 * real measurement engine, not before. */
