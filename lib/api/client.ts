/** Browser-side helper for the dashboard's own /api routes. */
export interface ApiResult<T = undefined> {
  status: "success" | "error";
  message: string;
  data?: T;
  /** Field-level errors, e.g. from a config upload. */
  errors?: { path: string; code: string; message: string }[];
}

export async function postJson<T = undefined>(path: string, body: unknown, method = "POST"): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as ApiResult<T> | null;
    if (!json) return { status: "error", message: `Unexpected ${res.status} response.` };
    return json;
  } catch {
    return { status: "error", message: "Couldn't reach the dashboard. Check your connection and try again." };
  }
}
