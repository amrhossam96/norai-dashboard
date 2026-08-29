/**
 * "Has anything arrived yet?" for the last wizard screen.
 *
 * A poll and not a stream: the backend exposes no SSE or websocket, so the
 * honest implementation is to ask. `limit=1` keeps each answer to one row, and
 * the wizard backs off on its own — this endpoint holds no state between calls.
 *
 * Ingest is asynchronous (the SDK's POST returns before the row is queryable),
 * so an empty answer means "not yet", never "your event was rejected".
 */
import { authedFetch, isUnauthorized } from "@/lib/api/server";
import type { Event } from "@/lib/api/types";

export interface FirstEventResponse {
  /** Null until the environment has seen at least one event. */
  event: { eventType: string; entityType: string; receivedAt: string } | null;
  total: number;
}

export async function GET(req: Request) {
  const environmentId = new URL(req.url).searchParams.get("env") ?? "";
  if (!isUuid(environmentId)) {
    return Response.json({ error: "invalid env" }, { status: 400 });
  }

  try {
    const page = await authedFetch<{
      events: Event[] | null;
      pagination: { total?: number };
    }>(`/environments/${environmentId}/events`, { query: { limit: 1 } });

    const newest = page.events?.[0];
    const body: FirstEventResponse = {
      event: newest
        ? {
            eventType: newest.event_type,
            entityType: newest.entity_type ?? "",
            receivedAt: newest.created_at,
          }
        : null,
      total: page.pagination?.total ?? 0,
    };
    // No caching: the whole point of this route is that the answer changes.
    return Response.json(body, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    if (isUnauthorized(err)) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("[onboarding] first-event poll failed", err);
    return Response.json({ error: "unavailable" }, { status: 502 });
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
