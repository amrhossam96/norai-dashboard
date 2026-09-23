import "server-only";

import { chQuery, ClickHouseError } from "@/lib/db/clickhouse";

/**
 * Read models for the home screen, straight from the warehouse. Every query is
 * scoped by project_id and bounded in time; the warehouse is append-only so
 * these are cheap.
 */

export interface DayCount {
  day: string; // YYYY-MM-DD
  count: number;
}

export interface Overview {
  eventsLast24h: number;
  eventsByKind7d: { kind: string; count: number }[];
  eventsPerDay14d: DayCount[];
  servedLast24h: number;
  servedPerDay14d: DayCount[];
  fallback7d: { level: string; count: number }[];
  impressionsLast7d: number;
  recentServed: RecentServed[];
  /** Latest metrics_daily rows, one per (surface, metric, arm). */
  metrics: MetricRow[];
  warehouse: "ok" | "unreachable";
}

export interface RecentServed {
  recommendation_id: string;
  ts: string;
  surface: string;
  fallback_level: string;
  items: number;
  who: string;
}

export interface MetricRow {
  date: string;
  surface: string;
  arm: string;
  segment: string;
  metric: string;
  value: number;
  numerator: number;
  denominator: number;
}

const n = (v: unknown) => Number(v ?? 0);

export async function overview(projectId: string): Promise<Overview> {
  const p = { project: projectId };
  try {
    const [e24, ek, epd, s24, spd, fb, imp, recent, metrics] = await Promise.all([
      chQuery<{ c: string }>(
        "SELECT count() AS c FROM events WHERE project_id = {project:String} AND received_at >= now() - INTERVAL 1 DAY",
        p,
      ),
      chQuery<{ kind: string; c: string }>(
        "SELECT kind, count() AS c FROM events WHERE project_id = {project:String} AND ts >= now() - INTERVAL 7 DAY GROUP BY kind ORDER BY c DESC",
        p,
      ),
      chQuery<{ day: string; c: string }>(
        "SELECT toDate(ts) AS day, count() AS c FROM events WHERE project_id = {project:String} AND ts >= today() - 13 GROUP BY day ORDER BY day",
        p,
      ),
      chQuery<{ c: string }>(
        "SELECT count() AS c FROM served WHERE project_id = {project:String} AND ts >= now() - INTERVAL 1 DAY",
        p,
      ),
      chQuery<{ day: string; c: string }>(
        "SELECT toDate(ts) AS day, count() AS c FROM served WHERE project_id = {project:String} AND ts >= today() - 13 GROUP BY day ORDER BY day",
        p,
      ),
      chQuery<{ level: string; c: string }>(
        "SELECT fallback_level AS level, count() AS c FROM served WHERE project_id = {project:String} AND ts >= now() - INTERVAL 7 DAY GROUP BY level ORDER BY c DESC",
        p,
      ),
      chQuery<{ c: string }>(
        "SELECT count() AS c FROM impressions WHERE project_id = {project:String} AND ts >= now() - INTERVAL 7 DAY",
        p,
      ),
      chQuery<{ recommendation_id: string; ts: string; surface: string; fallback_level: string; items: string; who: string }>(
        `SELECT recommendation_id, ts, surface, fallback_level,
                length(JSONExtractArrayRaw(items_json)) AS items,
                coalesce(user_id, anonymous_id, '') AS who
           FROM served WHERE project_id = {project:String} ORDER BY ts DESC LIMIT 12`,
        p,
      ),
      chQuery<MetricRow>(
        `SELECT date, surface, arm, segment, metric, value, numerator, denominator
           FROM metrics_daily WHERE project_id = {project:String}
            AND date = (SELECT max(date) FROM metrics_daily WHERE project_id = {project:String})
          ORDER BY surface, metric, arm, segment`,
        p,
      ),
    ]);
    return {
      eventsLast24h: n(e24[0]?.c),
      eventsByKind7d: ek.map((r) => ({ kind: r.kind, count: n(r.c) })),
      eventsPerDay14d: fillDays(epd.map((r) => ({ day: r.day, count: n(r.c) }))),
      servedLast24h: n(s24[0]?.c),
      servedPerDay14d: fillDays(spd.map((r) => ({ day: r.day, count: n(r.c) }))),
      fallback7d: fb.map((r) => ({ level: r.level, count: n(r.c) })),
      impressionsLast7d: n(imp[0]?.c),
      recentServed: recent.map((r) => ({ ...r, items: n(r.items) })),
      metrics: metrics.map((m) => ({ ...m, value: n(m.value), numerator: n(m.numerator), denominator: n(m.denominator) })),
      warehouse: "ok",
    };
  } catch (err) {
    if (!(err instanceof ClickHouseError)) console.error("[metrics] warehouse read failed", err);
    else console.error("[metrics] clickhouse", err.status, err.message);
    return {
      eventsLast24h: 0,
      eventsByKind7d: [],
      eventsPerDay14d: fillDays([]),
      servedLast24h: 0,
      servedPerDay14d: fillDays([]),
      fallback7d: [],
      impressionsLast7d: 0,
      recentServed: [],
      metrics: [],
      warehouse: "unreachable",
    };
  }
}

/** A zero for every missing day, so the sparkline has 14 bars. */
function fillDays(rows: DayCount[]): DayCount[] {
  const by = new Map(rows.map((r) => [r.day, r.count]));
  const out: DayCount[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, count: by.get(key) ?? 0 });
  }
  return out;
}

export async function eventsLast24h(projectId: string): Promise<number | null> {
  try {
    const r = await chQuery<{ c: string }>(
      "SELECT count() AS c FROM events WHERE project_id = {project:String} AND received_at >= now() - INTERVAL 1 DAY",
      { project: projectId },
    );
    return n(r[0]?.c);
  } catch {
    return null;
  }
}
