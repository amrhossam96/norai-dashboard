import { currentProject } from "@/lib/current";
import { ConfigParseError, isConfigKind, putConfig } from "@/lib/control/config";
import { GatewayError } from "@/lib/gateway";
import type { ApiResult } from "@/lib/api/client";
import type { ConfigVersionResponse } from "@/lib/api/types";

const reply = <T,>(r: ApiResult<T>, status: number) => Response.json(r, { status });

/** PUT {kind, yaml} → {version}; validation errors come back field by field. */
export async function PUT(req: Request) {
  const cur = await currentProject();
  if (!cur) return reply({ status: "error", message: "Your session expired." }, 401);
  const body = (await req.json().catch(() => null)) as { kind?: unknown; yaml?: unknown } | null;
  const kind = String(body?.kind ?? "");
  if (!isConfigKind(kind)) return reply({ status: "error", message: "Unknown config kind." }, 400);
  const yaml = typeof body?.yaml === "string" ? body.yaml : "";
  if (!yaml.trim()) return reply({ status: "error", message: "The document is empty." }, 400);
  try {
    const out = await putConfig(cur.project.project_id, kind, yaml);
    return reply<ConfigVersionResponse>({ status: "success", message: `Registered ${kind} ${out.version}.`, data: out }, 200);
  } catch (err) {
    if (err instanceof ConfigParseError) return reply({ status: "error", message: `YAML: ${err.message}` }, 400);
    if (err instanceof GatewayError) {
      return reply(
        { status: "error", message: err.problem.detail ?? err.problem.title, errors: err.problem.errors },
        err.status === 409 || err.status === 422 ? err.status : 502,
      );
    }
    console.error("[config] put failed", err);
    return reply({ status: "error", message: err instanceof Error ? err.message : "Upload failed." }, 502);
  }
}
