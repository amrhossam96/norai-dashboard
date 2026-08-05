/**
 * The single seam between the dashboard and the norai backend.
 *
 * Today the pages read from the mock layer (lib/mock/*) so the dashboard renders
 * the design faithfully with no running backend. When you're ready to go live,
 * flip NEXT_PUBLIC_NORAI_USE_MOCK=false and point NEXT_PUBLIC_NORAI_API_URL at a
 * running API — every response is already unwrapped from the `{ data }` envelope
 * here, so callers never change.
 */
import type { ApiError } from "./types";

/**
 * Resolved once per runtime. NORAI_API_URL is server-only (never inlined into the
 * browser bundle) and wins when present, so server actions and route handlers can
 * talk to an internal address that is never exposed publicly. In the browser that
 * lookup is `undefined`, so it falls through to the NEXT_PUBLIC_ value.
 */
export const API_BASE =
  process.env.NORAI_API_URL ??
  process.env.NEXT_PUBLIC_NORAI_API_URL ??
  "http://localhost:8080/v1";

export const USE_MOCK =
  (process.env.NEXT_PUBLIC_NORAI_USE_MOCK ?? "true") !== "false";

export class NoraiApiError extends Error {
  status: number;
  details?: ApiError["details"];
  constructor(status: number, message: string, details?: ApiError["details"]) {
    super(message);
    this.name = "NoraiApiError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  /** JWT for dashboard routes, or leave undefined for public/api-key routes. */
  token?: string;
  /** x-norai-api-key for the ingest/serving routes. */
  apiKey?: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(
    path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`,
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Perform a request and return the unwrapped payload (the value inside `data`).
 * Throws NoraiApiError on non-2xx.
 */
export async function apiFetch<T>(
  path: string,
  { token, apiKey, body, query, headers, ...init }: RequestOptions = {},
): Promise<T> {
  const res = await fetch(buildUrl(path, query), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(apiKey ? { "x-norai-api-key": apiKey } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const json = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const err = (json ?? {}) as ApiError;
    throw new NoraiApiError(
      res.status,
      err.error ?? res.statusText,
      err.details,
    );
  }

  // Unwrap the `{ data }` envelope; a few endpoints return no body.
  return (json && "data" in json ? json.data : json) as T;
}
