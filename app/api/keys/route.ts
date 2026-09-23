import { currentProject } from "@/lib/current";
import { createKey, revokeKey } from "@/lib/control/keys";
import type { ApiResult } from "@/lib/api/client";
import type { CreatedApiKey } from "@/lib/api/types";

const reply = <T,>(r: ApiResult<T>, status: number) => Response.json(r, { status });

/** POST {key_type} → the plaintext, once. */
export async function POST(req: Request) {
  const cur = await currentProject();
  if (!cur) return reply({ status: "error", message: "Your session expired." }, 401);
  const body = (await req.json().catch(() => null)) as { key_type?: unknown } | null;
  const type = body?.key_type === "publishable" ? "publishable" : body?.key_type === "secret" ? "secret" : null;
  if (!type) return reply({ status: "error", message: "key_type must be publishable or secret." }, 400);
  try {
    const key = await createKey(cur.project.project_id, type, `dashboard:${cur.user.email}`);
    return reply<CreatedApiKey>({ status: "success", message: "", data: key }, 200);
  } catch (err) {
    console.error("[keys] create failed", err);
    return reply({ status: "error", message: "Couldn't create the key." }, 502);
  }
}

/** DELETE {key_id} → revoked, valid for the 24 h grace window. */
export async function DELETE(req: Request) {
  const cur = await currentProject();
  if (!cur) return reply({ status: "error", message: "Your session expired." }, 401);
  const body = (await req.json().catch(() => null)) as { key_id?: unknown } | null;
  const keyId = String(body?.key_id ?? "");
  const ok = await revokeKey(cur.project.project_id, keyId, `dashboard:${cur.user.email}`);
  return ok ? reply({ status: "success", message: "" }, 200) : reply({ status: "error", message: "No such key." }, 404);
}
