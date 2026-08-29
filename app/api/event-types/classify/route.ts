/**
 * Classify one pending event type.
 *
 * A route handler and not a direct call, because the JWT lives in an httpOnly
 * cookie the browser cannot read — every backend write has to originate on this
 * side. One type per request: the backend classifies per event name, and each
 * classification synchronously replays that name's history into the aggregate.
 */
import { NoraiApiError } from "@/lib/api/client";
import { authedFetch, isUnauthorized } from "@/lib/api/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  let body: { environmentId?: string; eventTypeId?: string; categoryId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "expected a JSON body" }, { status: 400 });
  }
  const { environmentId, eventTypeId, categoryId } = body;
  if (!environmentId || !eventTypeId || !categoryId) {
    return NextResponse.json(
      { error: "environmentId, eventTypeId and categoryId are all required" },
      { status: 400 },
    );
  }

  try {
    const updated = await authedFetch(
      `/environments/${environmentId}/event-types/${eventTypeId}/classify`,
      { method: "PATCH", body: { event_category_id: categoryId } },
    );
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (isUnauthorized(err)) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const status = err instanceof NoraiApiError ? err.status : 500;
    const message = err instanceof Error ? err.message : "classify failed";
    return NextResponse.json({ error: message }, { status });
  }
}
