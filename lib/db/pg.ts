import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool, types, type PoolClient, type QueryResultRow } from "pg";

// timestamptz (1184) and timestamp (1114) come back as ISO strings, not Date
// objects, so rows can cross the server/client boundary and match lib/api/types.
const toIso = (v: string) => new Date(v.includes("+") || v.endsWith("Z") ? v : `${v}Z`).toISOString();
types.setTypeParser(1184, toIso);
types.setTypeParser(1114, toIso);

/**
 * The dashboard's Postgres connection. Same database as the norai gateway and
 * CLI, connected as the control-plane role (the CLI does the same via
 * norai.control.db.admin_connection), so the RLS policies on the data-plane
 * tables do not apply and every query must scope by project_id explicitly.
 */
const DSN =
  process.env.NORAI_PG_DSN ?? "postgresql://norai:norai@localhost:5432/norai";

let pool: Pool | null = null;
let migrated: Promise<void> | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: DSN, max: 8 });
    pool.on("error", (err) => console.error("[pg] idle client error", err));
  }
  return pool;
}

/** Apply lib/db/schema.sql once per process. Every statement is idempotent. */
function ensureSchema(): Promise<void> {
  if (!migrated) {
    const sql = readFileSync(path.join(process.cwd(), "lib/db/schema.sql"), "utf8");
    migrated = getPool()
      .query(sql)
      .then(() => undefined)
      .catch((err) => {
        migrated = null;
        throw err;
      });
  }
  return migrated;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  await ensureSchema();
  const res = await getPool().query<T>(text, params);
  return res.rows;
}

export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Run `fn` inside one transaction; rolls back on throw. */
export async function transaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  await ensureSchema();
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const out = await fn(client);
    await client.query("COMMIT");
    return out;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** True when the error is Postgres' unique-violation (23505). */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
}
