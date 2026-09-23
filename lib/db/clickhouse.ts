import "server-only";

/**
 * ClickHouse over its HTTP interface. The warehouse holds the served records,
 * events, impressions and the daily metric roll-up (storage/clickhouse/schema.sql);
 * it is read-only from the dashboard's point of view.
 */
const URL_ = process.env.NORAI_CLICKHOUSE_URL ?? "http://localhost:8123";
const USER = process.env.NORAI_CLICKHOUSE_USER ?? "norai";
const PASSWORD = process.env.NORAI_CLICKHOUSE_PASSWORD ?? "norai";
const DATABASE = process.env.NORAI_CLICKHOUSE_DB ?? "norai";

export class ClickHouseError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ClickHouseError";
  }
}

/**
 * Run a SELECT with named parameters (`{name:Type}` in the SQL; values are sent
 * as `param_<name>` so they are never interpolated into the statement).
 */
export async function chQuery<T>(
  sql: string,
  params: Record<string, string | number> = {},
): Promise<T[]> {
  const url = new URL(URL_);
  url.searchParams.set("database", DATABASE);
  url.searchParams.set("default_format", "JSONEachRow");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(`param_${k}`, String(v));
  }
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "X-ClickHouse-User": USER,
      "X-ClickHouse-Key": PASSWORD,
      "Content-Type": "text/plain",
    },
    body: sql,
    cache: "no-store",
  });
  const text = await res.text();
  if (!res.ok) throw new ClickHouseError(text.trim() || res.statusText, res.status);
  return text
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as T);
}
