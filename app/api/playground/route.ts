import { currentProject } from "@/lib/current";
import { projectGatewayKey } from "@/lib/control/projects";
import { gatewayFetch, GatewayError } from "@/lib/gateway";
import type { ApiResult } from "@/lib/api/client";
import type { ExplainResponse, RecommendRequest, RecommendResponse } from "@/lib/api/types";

const reply = <T,>(r: ApiResult<T>, status: number) => Response.json(r, { status });

export interface PlaygroundResult {
  request: RecommendRequest;
  response: RecommendResponse;
  explain: ExplainResponse | null;
  explainError?: string;
  latencyMs: number;
}

/**
 * POST a RecommendRequest → the gateway's answer plus its /explain record.
 * Server-side because /v1/recommend has no CORS and needs the secret key.
 */
export async function POST(req: Request) {
  const cur = await currentProject();
  if (!cur) return reply({ status: "error", message: "Your session expired." }, 401);
  const body = (await req.json().catch(() => null)) as Partial<RecommendRequest> | null;
  if (!body?.surface) return reply({ status: "error", message: "Pick a surface." }, 400);
  const request: RecommendRequest = {
    surface: String(body.surface),
    k: Math.min(100, Math.max(1, Number(body.k ?? 10) || 10)),
    ...(body.user_id ? { user_id: String(body.user_id) } : {}),
    ...(body.anonymous_id ? { anonymous_id: String(body.anonymous_id) } : {}),
    ...(Array.isArray(body.basket) && body.basket.length ? { basket: body.basket.map(String) } : {}),
    ...(body.context && typeof body.context === "object" ? { context: body.context } : {}),
  };
  if (!request.user_id && !request.anonymous_id) request.anonymous_id = "playground";

  try {
    const key = await projectGatewayKey(cur.project.project_id);
    const t0 = performance.now();
    const response = await gatewayFetch<RecommendResponse>("/v1/recommend", { key, method: "POST", body: request });
    const latencyMs = Math.round(performance.now() - t0);
    let explain: ExplainResponse | null = null;
    let explainError: string | undefined;
    try {
      explain = await gatewayFetch<ExplainResponse>(`/v1/explain/${response.recommendation_id}`, { key });
    } catch (err) {
      explainError = err instanceof GatewayError ? `${err.status} ${err.message}` : String(err);
    }
    return reply<PlaygroundResult>({ status: "success", message: "", data: { request, response, explain, explainError, latencyMs } }, 200);
  } catch (err) {
    if (err instanceof GatewayError) {
      return reply({ status: "error", message: `${err.status} ${err.problem.title}: ${err.problem.detail ?? ""}`.trim(), errors: err.problem.errors }, 502);
    }
    console.error("[playground] failed", err);
    return reply({ status: "error", message: err instanceof Error ? err.message : "Request failed." }, 502);
  }
}
