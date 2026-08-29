import { ClassifyTable } from "@/components/events/ClassifyTable";
import { authedFetch, isUnauthorized } from "@/lib/api/server";
import type { EventCategory, EventType, Environment, Project } from "@/lib/api/types";
import { redirect } from "next/navigation";

/* An unclassified event type is stored and scores zero — it moves no engine and
   appears in no outcome. Four surfaces already say so; this is the first one
   that lets anyone do something about it. */

async function load() {
  const projects = (await authedFetch<Project[]>("/projects/")) ?? [];
  if (projects.length === 0) redirect("/onboarding");
  const environments =
    (await authedFetch<Environment[]>(`/projects/${projects[0].id}/environments/`)) ?? [];
  const environment = environments.find((e) => !e.archived_at) ?? environments[0];
  if (!environment) throw new Error("This project has no environment yet.");

  const [types, categories] = await Promise.all([
    authedFetch<EventType[]>(`/environments/${environment.id}/event-types/`),
    authedFetch<EventCategory[]>("/events/categories/"),
  ]);
  return { environment, types: types ?? [], categories: categories ?? [] };
}

export default async function EventsPage() {
  let data;
  try {
    data = await load();
  } catch (err) {
    if (isUnauthorized(err)) redirect("/api/auth/logout?from=app");
    return (
      <div className="px-[24px] pb-[36px] pt-[26px]">
        <h1 className="font-sans text-[27px] font-semibold tracking-[-0.03em] text-ink">
          Event types
        </h1>
        <div className="mt-[20px] max-w-[720px] rounded-[12px] border border-line bg-surface px-[18px] py-[16px]">
          <div className="font-sans text-[13.5px] font-medium text-ink">
            Could not reach the API
          </div>
          <div className="mt-[4px] font-mono text-[12px] text-muted">
            {err instanceof Error ? err.message : "unknown error"}
          </div>
        </div>
      </div>
    );
  }

  const pending = data.types
    .filter((t) => t.status === "pending")
    .sort((a, b) => a.event_name.localeCompare(b.event_name));
  const active = data.types
    .filter((t) => t.status !== "pending")
    .sort((a, b) => a.event_name.localeCompare(b.event_name));

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <span className="eyebrow" style={{ letterSpacing: "0.14em" }}>
        Integration
      </span>
      <h1 className="mt-[7px] font-sans text-[27px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
        Event types
      </h1>
      <p className="mt-[7px] max-w-[640px] text-pretty font-sans text-[13.5px] leading-[1.55] text-muted">
        A name Norai has not seen is accepted and stored, then scores zero until
        someone says what it means. Categories are pre-filled from the name where
        we recognise it — check them, because a category is replayed over that
        type&rsquo;s whole history once and cannot be re-scored afterwards.
      </p>

      <ClassifyTable
        environmentId={data.environment.id}
        pending={pending}
        active={active}
        categories={data.categories}
      />
    </div>
  );
}
