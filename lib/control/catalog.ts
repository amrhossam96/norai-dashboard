import "server-only";

import { query, queryOne } from "@/lib/db/pg";
import type { CatalogItem } from "@/lib/api/types";

export const PAGE = 50;

export async function catalogStats(projectId: string): Promise<{ total: number; available: number; users: number }> {
  const items = await queryOne<{ total: string; available: string }>(
    "SELECT count(*) AS total, count(*) FILTER (WHERE available AND deleted_at IS NULL) AS available FROM public.items WHERE project_id = $1",
    [projectId],
  );
  const users = await queryOne<{ c: string }>("SELECT count(*) AS c FROM public.users WHERE project_id = $1", [projectId]);
  return { total: Number(items?.total ?? 0), available: Number(items?.available ?? 0), users: Number(users?.c ?? 0) };
}

export async function listItems(projectId: string, page: number, q: string): Promise<CatalogItem[]> {
  return query<CatalogItem>(
    `SELECT item_id, updated_at, first_seen_at, available, fields
       FROM public.items WHERE project_id = $1 AND ($2 = '' OR item_id ILIKE '%' || $2 || '%' OR fields::text ILIKE '%' || $2 || '%')
      ORDER BY updated_at DESC LIMIT $3 OFFSET $4`,
    [projectId, q, PAGE, Math.max(0, page - 1) * PAGE],
  );
}

export async function listUsers(projectId: string, page: number, q: string) {
  return query<{ user_id: string; attributes: Record<string, unknown>; updated_at: string }>(
    `SELECT user_id, attributes, updated_at FROM public.users
      WHERE project_id = $1 AND ($2 = '' OR user_id ILIKE '%' || $2 || '%')
      ORDER BY updated_at DESC LIMIT $3 OFFSET $4`,
    [projectId, q, PAGE, Math.max(0, page - 1) * PAGE],
  );
}

/** A human label for an item, from whichever mapped field carries one. */
export function itemTitle(fields: Record<string, unknown>): string {
  for (const k of ["title", "name", "text", "prod_name", "label"]) {
    const v = fields[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}
