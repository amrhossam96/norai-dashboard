import "server-only";

import YAML from "yaml";
import { query } from "@/lib/db/pg";
import { gatewayFetch } from "@/lib/gateway";
import { projectGatewayKey } from "@/lib/control/projects";
import { CONFIG_KINDS, type ConfigKind, type ConfigVersion, type ConfigVersionResponse, type SurfaceRow } from "@/lib/api/types";

export const KIND_LABEL: Record<ConfigKind, string> = {
  schema: "Semantic mapping",
  taxonomy: "Taxonomy",
  surfaces: "Surfaces",
  rules: "Rules",
};

export const KIND_BLURB: Record<ConfigKind, string> = {
  schema: "Which of your catalog fields play which role: title, price, category, stock. Gates what norai can do for you.",
  taxonomy: "Maps your event names to norai's kinds (view, engage, positive, convert…) with strength priors and half-lives.",
  surfaces: "The placements you serve: retrieval sources, objective weights, holdout share and exploration slots.",
  rules: "Per-surface business rules: filter, exclude, boost, pin, diversity. Needs the semantic mapping first.",
};

export function isConfigKind(v: string): v is ConfigKind {
  return (CONFIG_KINDS as string[]).includes(v);
}

/** Latest version of every kind; a kind the project has never registered is absent. */
export async function latestConfigs(projectId: string): Promise<Partial<Record<ConfigKind, ConfigVersion>>> {
  const rows = await query<ConfigVersion>(
    `SELECT DISTINCT ON (config_type) config_type, version, payload, created_at
       FROM public.config_versions WHERE project_id = $1
      ORDER BY config_type, created_at DESC, version_id DESC`,
    [projectId],
  );
  const out: Partial<Record<ConfigKind, ConfigVersion>> = {};
  for (const r of rows) if (isConfigKind(r.config_type)) out[r.config_type] = r;
  return out;
}

export async function configHistory(projectId: string, kind: ConfigKind): Promise<ConfigVersion[]> {
  return query<ConfigVersion>(
    `SELECT config_type, version, payload, created_at FROM public.config_versions
      WHERE project_id = $1 AND config_type = $2 ORDER BY created_at DESC LIMIT 20`,
    [projectId, kind],
  );
}

/**
 * Upload a config object. The YAML is parsed here and sent as JSON to the
 * gateway's PUT /v1/config/{kind}, which runs the same validation the CLI does
 * and writes the rows. Errors surface as GatewayError with `errors[]`.
 */
export async function putConfig(projectId: string, kind: ConfigKind, yamlText: string): Promise<ConfigVersionResponse> {
  let obj: unknown;
  try {
    obj = YAML.parse(yamlText);
  } catch (err) {
    throw new ConfigParseError(err instanceof Error ? err.message : "invalid YAML");
  }
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    throw new ConfigParseError("the document must be a YAML mapping with a `version` field");
  }
  const key = await projectGatewayKey(projectId);
  return gatewayFetch<ConfigVersionResponse>(`/v1/config/${kind}`, { key, method: "PUT", body: obj });
}

export class ConfigParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigParseError";
  }
}

export function toYaml(obj: unknown): string {
  return YAML.stringify(obj, { lineWidth: 100 });
}

/** Surfaces joined with their latest rules. */
export async function listSurfaces(projectId: string): Promise<SurfaceRow[]> {
  return query<SurfaceRow>(
    `SELECT s.surface_name, s.config_version, s.payload,
            r.version AS rules_version, r.payload AS rules
       FROM public.surfaces s
       LEFT JOIN LATERAL (
         SELECT version, payload FROM public.rules
          WHERE project_id = s.project_id AND surface_name = s.surface_name
          ORDER BY version DESC LIMIT 1
       ) r ON true
      WHERE s.project_id = $1 ORDER BY s.surface_name`,
    [projectId],
  );
}

/**
 * Starter files a new project can upload as-is. Taxonomy, surfaces and rules
 * are the ecommerce templates the norai repo registers for its benchmarks
 * (config/{taxonomy,surfaces,rules}/ecommerce.yaml); the mapping is the
 * fixture project's item roles (config/semantic/fixture-ten-items.yaml) with
 * the field names a shop is likely to send. They are content, not a stand-in
 * for fetched data.
 */
export const STARTERS: Record<ConfigKind, string> = {
  schema: `# Which of your item fields play which role. item_id is required; the rest
# gate capabilities (D1.1): content needs title or text, category constraints
# need category, price rules need price + currency, stock rules need num:stock.
version: v1
category_level: leaf
roles:
  item_id:   {source: item_id,   target_type: string}
  title:     {source: name,      target_type: string}
  category:  {source: category,  target_type: string}
  price:     {source: price,     target_type: number}
  currency:  {source: currency,  target_type: string}
  available: {source: available, target_type: boolean}
  image:     {source: image_url, target_type: string}
capability_policy:
  content_retriever: true
  category_constraints: true
  price_rules_and_features: true
  stock_rules: false
  durability_policy: false
  image_dashboard_display: true
`,
  taxonomy: `# Your event names → norai kinds. Anything unmapped becomes \`custom\`.
version: ecommerce-v1
mappings:
  impression:       {kind: impression, value_semantics: viewport_fraction, strength_prior: 0.00, half_life_days: 0,   label_eligible: false, attribution_window_hours: 0}
  view:             {kind: view,       value_semantics: none,              strength_prior: 0.10, half_life_days: 14,  label_eligible: true,  attribution_window_hours: 24}
  engage:           {kind: engage,     value_semantics: dwell_fraction,    strength_prior: 0.25, half_life_days: 14,  label_eligible: true,  attribution_window_hours: 24}
  add_to_wishlist:  {kind: positive,   value_semantics: none,              strength_prior: 0.50, half_life_days: 60,  label_eligible: true,  attribution_window_hours: 24}
  add_to_cart:      {kind: positive,   value_semantics: quantity,          strength_prior: 0.70, half_life_days: 30,  label_eligible: true,  attribution_window_hours: 24}
  remove_from_cart: {kind: negative,   value_semantics: none,              strength_prior: -0.20, half_life_days: 30, label_eligible: true,  attribution_window_hours: 24}
  purchase:         {kind: convert,    value_semantics: order_value,       strength_prior: 1.00, half_life_days: 180, label_eligible: true,  attribution_window_hours: 168}
  return:           {kind: negative,   value_semantics: refund_value,      strength_prior: -0.50, half_life_days: 180, label_eligible: true, attribution_window_hours: 24}
  share:            {kind: share,      value_semantics: none,              strength_prior: 0.60, half_life_days: 60,  label_eligible: true,  attribution_window_hours: 24}
defaults:
  positive_strength: 0.60
  negative_strength: -0.30
  custom_strength: 0.05
  session_gap_minutes: 30
  click_objective: view
`,
  surfaces: `# The placements you serve. Retrieval names are norai's sources; objective
# weights say what each surface optimises for.
version: ecommerce-v2
surfaces:
  - name: pdp_similar
    retrieval: [substitutes, content]
    objective: {click: 0.3, add_to_cart: 0.4, convert: 0.3}
    constraints: {same_category: true, available: true, exclude_same_product_code: true, diversity: {max_per_category_top10: 3, max_per_brand: 2}}
    holdout_share: 0.05
    exploration: {slots_per_page: 2, positions: [7, 15]}
    readiness: {ranker: {confirmed_impression_rows_min: 1000, positive_per_head_min: 50}}
  - name: pdp_bought_together
    retrieval: [complements]
    objective: {click: 0.1, add_to_cart: 0.5, convert: 0.4}
    constraints: {different_category: true, available: true, exclude_same_product_code: true, diversity: {max_per_category_top10: 3, max_per_brand: 2}}
    holdout_share: 0.05
    exploration: {slots_per_page: 2, positions: [7, 15]}
    readiness: {ranker: {confirmed_impression_rows_min: 1000, positive_per_head_min: 50}}
  - name: home_rows
    retrieval: [history, complements, popularity, content, new_arrivals]
    objective: {click: 0.4, add_to_cart: 0.4, convert: 0.2}
    constraints: {available: true, durability: true, diversity: {max_per_category_top10: 3, max_per_brand: 2}}
    holdout_share: 0.05
    exploration: {slots_per_page: 2, positions: [7, 15]}
    readiness: {ranker: {confirmed_impression_rows_min: 1000, positive_per_head_min: 50}}
  - name: cart_upsell
    retrieval: [complements, popularity]
    objective: {click: 0.1, add_to_cart: 0.4, convert: 0.5}
    constraints: {different_category_from_basket: true, available: true, exclude_same_product_code: true, diversity: {max_per_category_top10: 3, max_per_brand: 2}}
    holdout_share: 0.05
    exploration: {slots_per_page: 2, positions: [7, 15]}
    readiness: {ranker: {confirmed_impression_rows_min: 1000, positive_per_head_min: 50}}
`,
  rules: `# Per-surface business rules (schemas/rules/grammar.md). Predicates refer to
# mapped roles, so register the semantic mapping first.
version: ecommerce-v1
surfaces:
  pdp_similar:
    rules:
      - {verb: filter, predicate: "role:available == true"}
  pdp_bought_together:
    rules:
      - {verb: filter, predicate: "role:available == true"}
  home_rows:
    rules:
      - {verb: filter, predicate: "role:available == true"}
  cart_upsell:
    rules:
      - {verb: filter, predicate: "role:available == true"}
      - {verb: exclude, predicate: "role:category in basket.categories"}
`,
};
