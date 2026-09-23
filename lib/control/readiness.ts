import "server-only";

import { queryOne } from "@/lib/db/pg";
import { gatewayHealth } from "@/lib/gateway";
import { latestConfigs } from "@/lib/control/config";
import { listKeys } from "@/lib/control/keys";
import { eventsLast24h } from "@/lib/control/metrics";
import { chQuery } from "@/lib/db/clickhouse";
import type { Readiness, ReadinessCheck } from "@/lib/api/types";

/**
 * "Why is my /recommend response empty", answered from the stores the answer
 * lives in. Ordered: the first failure is the one to fix. The deeper checks
 * (mapping report, retrieval readiness) belong to `norai onboarding report`
 * and are linked rather than reimplemented.
 */
export async function readiness(projectId: string): Promise<Readiness> {
  const checks: ReadinessCheck[] = [];

  const health = await gatewayHealth();
  checks.push({
    name: "gateway",
    ok: health?.status === "ok",
    detail: health
      ? `Gateway answered ${health.status}${health.version ? ` (${health.version})` : ""}.`
      : "The gateway did not answer /healthz.",
    fix: health ? undefined : "Start the stack: `make up` in the norai repo.",
  });

  const configs = await latestConfigs(projectId);
  const missing = (["schema", "taxonomy", "surfaces"] as const).filter((k) => !configs[k]);
  checks.push({
    name: "config",
    ok: missing.length === 0,
    detail:
      missing.length === 0
        ? `Mapping ${configs.schema!.version}, taxonomy ${configs.taxonomy!.version}, surfaces ${configs.surfaces!.version} registered.`
        : `Not registered yet: ${missing.join(", ")}.`,
    fix: missing.length ? "Upload them on the Configuration screen; starters are provided." : undefined,
    href: "/app/config",
  });

  const keys = await listKeys(projectId);
  const live = keys.filter((k) => !k.revoked_at);
  checks.push({
    name: "keys",
    ok: live.length > 0,
    detail: live.length ? `${live.length} active key${live.length === 1 ? "" : "s"}.` : "No API key has been issued.",
    fix: live.length ? undefined : "Create a publishable key for the SDK and a secret key for your server.",
    href: "/app/api-keys",
  });

  const items = await queryOne<{ c: string }>(
    "SELECT count(*) AS c FROM public.items WHERE project_id = $1 AND available AND deleted_at IS NULL",
    [projectId],
  );
  const nItems = Number(items?.c ?? 0);
  checks.push({
    name: "catalog",
    ok: nItems > 0,
    detail: nItems > 0 ? `${nItems.toLocaleString()} available items.` : "The catalog is empty.",
    fix: nItems > 0 ? undefined : "PUT /v1/items with your secret key, or POST /v1/items/import for a file.",
    href: "/app/catalog",
  });

  const ev = await eventsLast24h(projectId);
  checks.push({
    name: "events",
    ok: (ev ?? 0) > 0,
    detail:
      ev === null
        ? "The warehouse did not answer."
        : ev > 0
          ? `${ev.toLocaleString()} events received in the last 24 hours.`
          : "No events in the last 24 hours.",
    fix: (ev ?? 0) > 0 ? undefined : "Install the web SDK with a publishable key, or POST /v1/events from your server.",
  });

  const set = await queryOne<{ active_set_id: string; updated_at: string }>(
    "SELECT active_set_id, updated_at FROM public.artifact_sets WHERE project_id = $1",
    [projectId],
  );
  checks.push({
    name: "artifacts",
    ok: Boolean(set),
    detail: set
      ? `Active artifact set ${set.active_set_id}, published ${new Date(set.updated_at).toLocaleString()}.`
      : "No artifact set has been published, so retrieval can only fall back to popularity.",
    fix: set ? undefined : "Run the offline build in the norai repo, then `norai artifacts register` and `norai artifacts publish --project <id>`.",
  });

  let served = 0;
  let fallback = "";
  try {
    const r = await chQuery<{ c: string; fb: string }>(
      "SELECT count() AS c, topK(1)(fallback_level)[1] AS fb FROM served WHERE project_id = {project:String} AND ts >= now() - INTERVAL 1 DAY",
      { project: projectId },
    );
    served = Number(r[0]?.c ?? 0);
    fallback = r[0]?.fb ?? "";
  } catch {
    /* reported by the events check */
  }
  checks.push({
    name: "serving",
    ok: served > 0,
    detail: served > 0 ? `${served.toLocaleString()} recommendations served in the last 24 hours (most common fallback level: ${fallback || "none"}).` : "Nothing has been served in the last 24 hours.",
    fix: served > 0 ? undefined : "Try a request on the Playground.",
    href: "/app/playground",
  });

  const blocker = checks.find((c) => !c.ok);
  return { ready: !blocker, checks, blocker };
}
