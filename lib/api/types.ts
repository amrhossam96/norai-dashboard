/**
 * TypeScript contracts mirroring the norai Go backend (all routes under /v1).
 *
 * Source of truth: a code-level audit of github.com/amrhossam96/norai-backend.
 * Every successful JSON body from the backend is wrapped in `{ "data": ... }`;
 * the types below describe the shape *inside* `data`. Errors are `{ "error": string }`.
 *
 * These exist so the mock data layer and the real fetch client share one set of
 * types — swapping mock → live is a single seam (see lib/api/client.ts).
 */

// ---- Envelope ----
export interface ApiEnvelope<T> {
  data: T;
}
export interface ApiError {
  error: string;
  details?: { field: string; message: string }[];
}

// ---- Auth ----
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  token: string; // 7-day HS256 JWT; expiry embedded in the token only
}

// ---- The signed-in user ----

/**
 * GET /v1/users/me — the caller's own record.
 *
 * The only way the dashboard can name who is signed in: the JWT lives in an
 * httpOnly cookie so no script can decode it, and every other endpoint answers
 * about teams, projects or environments rather than about the person. `password`
 * is `json:"-"` on the Go model and never appears here.
 */
export interface CurrentUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  provider?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Tenancy ----
export type Role = "owner" | "admin" | "member" | "viewer";

export interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}
export interface TeamWithRole extends Team {
  user_role: Role;
}

export interface Project {
  id: string;
  team_id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "suspended" | "archived";
  created_at: string;
  updated_at: string;
}

/**
 * POST /v1/projects/
 *
 * Creating a project also creates its default "Production" environment, in the
 * same transaction — see projects.EnvironmentProvisioner in the backend. So
 * this one call is the whole of onboarding; there is no second step to make an
 * environment, and callers can assume one exists afterwards.
 */
export interface CreateProjectRequest {
  name: string;
  slug: string;
  description: string;
  team_id: string;
}

export interface Environment {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  kind: "production" | "staging" | "development" | "custom";
  description: string;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

// ---- Recommendations (the Glassbox contract) ----
export interface RecReason {
  source: string; // "similarity" | "transitions" | "affinity" | "popularity" | ...
  detail: string; // the human sentence — "the why"
  seed_id?: string;
}
export interface RecItem {
  entity_id: string;
  entity_type: string;
  score: number;
  confidence: number;
  reasons: RecReason[];
}
export interface RecommendResponse {
  entity_type: string;
  items: RecItem[];
}

// ---- Event taxonomy ----

/**
 * One of the nine rows the backend seeds into event_categories. The category is
 * what carries the weight and polarity an event contributes to a preference
 * score — the event *name* is just a label the customer chose.
 */
export interface EventCategory {
  id: string;
  name: string;
  weight: number;
  polarity: "positive" | "negative";

  // What the category means downstream. The flags are not independent —
  // polarity 'negative' wins over counts_as_engagement — so `role` is the
  // resolved answer and the one to read.
  counts_as_engagement: boolean;
  forms_sequence: boolean;
  breaks_sequence: boolean;
  is_conversion: boolean;
  role: "negative" | "conversion" | "engagement" | "ignored";

  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EventType {
  id: string;
  environment_id: string;
  event_name: string;
  event_category_id?: string;
  entity_type: string;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventTypeRequest {
  event_name: string;
  event_category_id: string;
  entity_type: string;
  description?: string;
}

/**
 * A stored event, as returned by GET /v1/environments/{id}/events.
 *
 * Only the fields the dashboard reads are typed. The row carries a good deal
 * more (signals, attribution, SDK provenance) that no screen shows yet.
 */
export interface Event {
  id: string;
  event_type: string;
  event_category?: string;
  entity_type?: string;
  environment_id: string;
  anonymous_id: string;
  session_id?: string;
  interaction_strength?: number;
  created_at: string;
}

// ---- Engine tuning ----

/**
 * GET /v1/environments/{id}/entity-config/{entityType}.
 *
 * entity_type_config is an override table, not the definition: it is empty
 * until someone disagrees with the engine. The endpoint answers with what the
 * engine will actually use and says which of the two it is, so `source:
 * "default"` is the normal, healthy answer rather than a missing value.
 */
export interface EntityTypeConfig {
  entity_type: string;
  decay_half_life_d: number;
  saturation_k: number;
  source: "default" | "override";
}

// ---- Surfaces ----

export type SurfaceEngine =
  | "preference"
  | "similarity"
  | "transitions"
  | "trending"
  | "pipeline";

export interface CreateSurfaceRequest {
  name: string;
  slug: string;
  engine: SurfaceEngine;
  entity_type: string;
  description?: string;
}

export interface Surface {
  id: string;
  environment_id: string;
  name: string;
  slug: string;
  engine: SurfaceEngine;
  entity_type: string;
  description?: string;
  rules: Record<string, unknown>;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

// ---- API keys ----
export interface ProjectAPIKey {
  id: string;
  environment_id: string;
  name: string;
  status: string;
  created_by: string;
  created_at: string;
  last_used_at?: string;
  revoked_at?: string;
}

export interface CreateAPIKeyRequest {
  name: string;
  class?: "publishable" | "secret";
}

/**
 * The response to POST /api-keys. `apiKey` is plaintext and is the only moment
 * it is ever readable — the backend stores a hash and every later read returns
 * ProjectAPIKey, which has no key on it.
 */
export interface CreatedAPIKey {
  id: string;
  class: "publishable" | "secret";
  apiKey: string;
}

// ---- Waitlist ----
/**
 * POST /v1/waitlist/ is the one public, unauthenticated endpoint the marketing
 * site uses. The backend reads bodies with DisallowUnknownFields, so `email` is
 * the only key it will accept — adding a name or company field here is a 400
 * until the backend grows the column.
 */
export interface WaitlistSignupRequest {
  email: string;
}

/** GET /v1/waitlist/ — JWT-only (do not call from the public site). */
export interface WaitlistEntry {
  email: string;
  created_at: string;
}

// ---- Health ----
export interface ReadyResponse {
  status: "ready" | "not_ready";
  checks: {
    postgres: "ok" | "error";
    nats: "ok" | "error";
    clickhouse: "ok" | "error" | "disabled";
  };
}

// ---- Diagnostics: GET /v1/environments/{environmentId}/diagnostics ----
export interface DiagnosticCheck {
  name: string;
  ok: boolean;
  detail: string;
  fix?: string;
}

export interface EnvironmentHealth {
  environment_id: string;
  ready: boolean;
  blocker?: DiagnosticCheck;
  checks: DiagnosticCheck[];
}
