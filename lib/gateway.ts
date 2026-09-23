import "server-only";

/**
 * The norai gateway (services/gateway), reached with a project's secret key.
 * Errors are RFC 9457 problem+json (services/internal/problems): the whole
 * document is kept so screens can show the field-level `errors[]` a config
 * upload comes back with.
 */
export const GATEWAY_URL = process.env.NORAI_GATEWAY_URL ?? "http://localhost:8080";

export interface FieldError {
  path: string;
  code: string;
  message: string;
}

export interface Problem {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: FieldError[];
}

export class GatewayError extends Error {
  constructor(public problem: Problem) {
    super(problem.detail ?? problem.title);
    this.name = "GatewayError";
  }
  get status() {
    return this.problem.status;
  }
  /** The slug after https://norai.example/problems/ */
  get slug() {
    return this.problem.type?.split("/").pop() ?? "";
  }
}

export async function gatewayFetch<T>(
  path: string,
  { key, method = "GET", body }: { key: string; method?: string; body?: unknown },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${GATEWAY_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${key}`,
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
  } catch (err) {
    throw new GatewayError({
      type: "https://norai.example/problems/unreachable",
      title: "gateway unreachable",
      status: 502,
      detail: `${GATEWAY_URL} did not answer: ${err instanceof Error ? err.message : String(err)}`,
    });
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok) {
    const p = (json ?? {}) as Partial<Problem>;
    throw new GatewayError({
      type: p.type ?? "https://norai.example/problems/unknown",
      title: p.title ?? res.statusText,
      status: p.status ?? res.status,
      detail: p.detail ?? (text.length < 400 ? text : undefined),
      instance: p.instance,
      errors: p.errors,
    });
  }
  return json as T;
}

export async function gatewayHealth(): Promise<{ status: string; version?: string } | null> {
  try {
    const res = await fetch(`${GATEWAY_URL}/healthz`, { cache: "no-store" });
    return (await res.json()) as { status: string; version?: string };
  } catch {
    return null;
  }
}
