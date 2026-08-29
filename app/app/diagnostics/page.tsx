import { authedFetch, isUnauthorized } from "@/lib/api/server";
import type { Environment, Project, EnvironmentHealth, DiagnosticCheck } from "@/lib/api/types";
import { redirect } from "next/navigation";

/* The one screen that must work before a partner has any data: it answers
   "why is my /recommend response empty" without us on a call. */

const LABELS: Record<string, string> = {
  events_received: "Events are arriving",
  event_types_classified: "Event types are classified",
  events_carry_entities: "Events name an entity",
  outcomes_attributed: "Impressions are attributed",
  entities_known: "The catalogue is known",
  preference_engine_ran: "Affinity has been projected",
  similarity_engine_ran: "Item similarity has been built",
  transitions_engine_ran: "Session transitions have been built",
  user_has_history: "The sampled user has history",
};

async function load(): Promise<
  { state: "ok"; health: EnvironmentHealth; environment: Environment } | { state: "error"; message: string }
> {
  try {
    const projects = (await authedFetch<Project[]>("/projects/")) ?? [];
    if (projects.length === 0) redirect("/onboarding");
    const environments =
      (await authedFetch<Environment[]>(`/projects/${projects[0].id}/environments/`)) ?? [];
    const environment = environments.find((e) => !e.archived_at) ?? environments[0];
    if (!environment) return { state: "error", message: "This project has no environment yet." };
    const health = await authedFetch<EnvironmentHealth>(
      `/environments/${environment.id}/diagnostics/`,
    );
    return { state: "ok", health, environment };
  } catch (err) {
    if (isUnauthorized(err)) redirect("/api/auth/logout?from=app");
    return { state: "error", message: err instanceof Error ? err.message : "Unreachable" };
  }
}

function Row({ check }: { check: DiagnosticCheck }) {
  return (
    <div className="flex gap-[12px] border-b border-line-soft px-[18px] py-[13px] last:border-b-0">
      <span
        aria-hidden
        className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ background: check.ok ? "var(--color-grey-55)" : "var(--color-red-ink)" }}
      />
      <div className="min-w-0">
        <div className="font-sans text-[13.5px] font-medium text-ink">
          {LABELS[check.name] ?? check.name}
        </div>
        <div className="mt-[3px] font-sans text-[12.5px] leading-[1.5] text-muted">
          {check.detail}
        </div>
        {!check.ok && check.fix ? (
          <div className="mt-[6px] font-mono text-[11.5px] leading-[1.5] text-ink">{check.fix}</div>
        ) : null}
      </div>
    </div>
  );
}

export default async function DiagnosticsPage() {
  const result = await load();

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <span className="eyebrow" style={{ letterSpacing: "0.14em" }}>
        Integration
      </span>
      <h1 className="mt-[7px] font-sans text-[27px] font-semibold leading-[1.15] tracking-[-0.03em] text-ink">
        Diagnostics
      </h1>
      <p className="mt-[7px] max-w-[620px] text-pretty font-sans text-[13.5px] leading-[1.55] text-muted">
        Whether this environment can produce a recommendation yet, answered before
        anyone asks it for one. The checks run in order; the first failure is the
        one to fix.
      </p>

      {result.state === "error" ? (
        <div className="mt-[24px] max-w-[720px] rounded-[12px] border border-line bg-surface px-[18px] py-[16px]">
          <div className="font-sans text-[13.5px] font-medium text-ink">
            Could not reach the API
          </div>
          <div className="mt-[4px] font-mono text-[12px] text-muted">{result.message}</div>
        </div>
      ) : (
        <>
          <div className="mt-[22px] flex max-w-[720px] items-center gap-[10px] rounded-[8px] border border-line bg-surface px-[14px] py-[11px]">
            <span
              className="rounded-[5px] border border-line-2 px-[7px] py-[2px] font-mono text-[9px] font-medium tracking-[0.1em]"
              style={{ color: result.health.ready ? "var(--color-grey-55)" : "var(--color-red-ink)" }}
            >
              {result.health.ready ? "READY" : "NOT READY"}
            </span>
            <span className="font-sans text-[12px] text-grey-40">
              {result.health.ready
                ? `${result.environment.name} can serve recommendations.`
                : result.health.blocker
                  ? (result.health.blocker.fix ?? result.health.blocker.detail)
                  : `${result.environment.name} is not ready yet.`}
            </span>
          </div>

          <div className="mt-[18px] max-w-[720px] overflow-hidden rounded-[12px] border border-line bg-surface">
            {result.health.checks.map((check) => (
              <Row key={check.name} check={check} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
