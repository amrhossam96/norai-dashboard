/**
 * Wire shapes of the norai gateway (api/openapi.yaml in the norai repo) and
 * of the dashboard's own control plane over the same Postgres. Nothing here is
 * invented: every gateway type mirrors a `components.schemas` entry.
 */

// ---- Gateway: recommendations ----

export type Reason =
  | "similar_to_viewed"
  | "bought_together"
  | "similar_to_recent"
  | "popular_in_segment"
  | "new_arrival"
  | "pinned"
  | "exploration"
  | "bought_before";

export interface RecommendationItem {
  item_id: string;
  position: number;
  score: number;
  reasons: Reason[];
}

export interface RecommendResponse {
  recommendation_id: string;
  surface: string;
  variant: Record<string, unknown>;
  model_versions: Record<string, string>;
  items: RecommendationItem[];
  page_token?: string | null;
  ttl_seconds: number;
}

export interface RecommendRequest {
  surface: string;
  user_id?: string;
  anonymous_id?: string;
  k?: number;
  context?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  basket?: string[];
  exclude?: string[];
}

export interface ExplainAttribution {
  shown: "seen" | "not_seen" | "unknown";
  impression_ts?: string | null;
  label_build_ts?: string | null;
  labels?: Record<string, { label: number; label_kind: string; label_ts?: string | null }>;
}

export interface ExplainItem {
  item_id: string;
  sources: Record<string, unknown>[];
  applied_rules: Record<string, unknown>[];
  attribution?: ExplainAttribution;
}

export interface ExplainResponse {
  recommendation_id: string;
  surface: string;
  fallback_level: string;
  items: ExplainItem[];
}

export interface ConfigVersionResponse {
  version: string;
}

// ---- Control plane (Postgres) ----

export type ConfigKind = "schema" | "taxonomy" | "surfaces" | "rules";
export const CONFIG_KINDS: ConfigKind[] = ["schema", "taxonomy", "surfaces", "rules"];

export interface Project {
  project_id: string;
  name: string;
  region: string;
  status: string;
  created_at: string;
  /** The signed-in user's role on it. */
  role: "owner" | "admin" | "member";
}

export interface ConfigVersion {
  config_type: ConfigKind;
  version: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface SurfaceRow {
  surface_name: string;
  config_version: string;
  payload: {
    name: string;
    retrieval: string[];
    objective: Record<string, number>;
    constraints?: Record<string, unknown>;
    holdout_share: number;
    exploration: { slots_per_page: number; positions?: number[] };
    readiness?: Record<string, unknown>;
  };
  rules_version?: string | null;
  rules?: { rules: Record<string, unknown>[] } | null;
}

export interface ApiKeyRow {
  key_id: string;
  /** `nk_sec_abcdefgh…` — prefix only; the plaintext is shown once at creation. */
  display: string;
  key_type: "publishable" | "secret";
  created_at: string;
  revoked_at: string | null;
  grace_until: string | null;
}

export interface CreatedApiKey extends ApiKeyRow {
  key: string;
}

export interface CatalogItem {
  item_id: string;
  updated_at: string;
  first_seen_at: string;
  available: boolean;
  fields: Record<string, unknown>;
}

export interface Member {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: Project["role"];
  created_at: string;
}

export interface AuditRow {
  audit_id: string;
  actor: string;
  action: string;
  resource: string;
  created_at: string;
}

export interface ReadinessCheck {
  name: string;
  ok: boolean;
  detail: string;
  fix?: string;
  href?: string;
}

export interface Readiness {
  ready: boolean;
  checks: ReadinessCheck[];
  blocker?: ReadinessCheck;
}

/** What the shell needs to draw the account chip. */
export interface CurrentUser {
  email: string;
  first_name?: string;
  last_name?: string;
}
