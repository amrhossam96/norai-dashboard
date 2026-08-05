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

// ---- Surfaces ----
export interface Surface {
  id: string;
  environment_id: string;
  name: string;
  slug: string;
  engine: "preference" | "similarity" | "transitions" | "trending";
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
