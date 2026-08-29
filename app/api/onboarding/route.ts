/**
 * Commit the onboarding wizard.
 *
 * Everything the wizard asked about is provisioned here in one request. It is
 * one call and not eight because the JWT lives in an httpOnly cookie: the
 * browser cannot build an Authorization header, so every backend write has to
 * originate on this side anyway. Bundling them also makes the ordering explicit
 * — the project has to exist before its environment can be found, and the
 * environment before anything env-scoped.
 *
 *   POST /projects/                      -> project (+ Production env, same tx)
 *   GET  /projects/{id}/environments     -> the env id everything else needs
 *   GET  /events/categories              -> name -> id, for event-type creation
 *   POST /environments/{env}/event-types -> one per event the user kept
 *   POST /environments/{env}/surfaces    -> one per surface the user kept
 *   POST /environments/{env}/api-keys    -> the publishable key for the snippet
 *   GET  /environments/{env}/entity-config/{kind} -> the half-life to display
 *
 * No entity-config write. The engine's own defaults already cover all six
 * domains (internal/engine/preference/model.go), and writing an override that
 * equals the default would turn `source: "default"` into `"override"` for no
 * reason — the dashboard would then show a bespoke number nobody chose.
 *
 * Partial failure never fails the request once the project exists. A second run
 * of the wizard would create a *second* project, so anything non-essential that
 * fails comes back as a warning and is fixable on the relevant screen.
 */
import { NoraiApiError } from "@/lib/api/client";
import { authedFetch, isUnauthorized } from "@/lib/api/server";
import type {
  CreateAPIKeyRequest,
  CreateEventTypeRequest,
  CreateProjectRequest,
  CreateSurfaceRequest,
  CreatedAPIKey,
  EntityTypeConfig,
  Environment,
  EventCategory,
  Project,
  Surface,
  TeamWithRole,
} from "@/lib/api/types";
import {
  ONBOARDING_FAILED,
  resolveAnswers,
  type OnboardingResult,
  type ResolvedAnswers,
} from "@/lib/onboarding/contract";
import { slugify } from "@/lib/onboarding/presets";
import {
  PROJECT_NO_TEAM,
  slugifyProjectName,
} from "@/lib/projects";

function reply(result: OnboardingResult, status: number) {
  return Response.json(result, { status });
}

export async function POST(req: Request) {
  const parsed = resolveAnswers(await req.json().catch(() => null));
  if (!parsed.ok) {
    return reply({ status: "error", message: parsed.message }, 400);
  }
  const answers = parsed.answers;

  let project: Project;
  let environment: Environment;
  try {
    const teams = await authedFetch<TeamWithRole[]>("/teams");
    const team = teams?.[0];
    if (!team) {
      // Only reachable if provisioning failed at activation, which the backend
      // logs but does not treat as fatal.
      console.error("[onboarding] user has no team");
      return reply({ status: "error", message: PROJECT_NO_TEAM }, 409);
    }

    const body: CreateProjectRequest = {
      name: answers.projectName,
      slug: slugifyProjectName(answers.projectName),
      description: "",
      team_id: team.id,
    };
    project = await authedFetch<Project>("/projects/", {
      method: "POST",
      body,
    });
    environment = await findProductionEnvironment(project.id);
  } catch (err) {
    if (isUnauthorized(err)) {
      return reply({ status: "error", message: "Your session expired." }, 401);
    }
    if (err instanceof NoraiApiError && err.status === 409) {
      return reply(
        { status: "error", message: "A project with that name already exists." },
        409,
      );
    }
    console.error("[onboarding] could not create the project", err);
    return reply({ status: "error", message: ONBOARDING_FAILED }, 502);
  }

  // Past this line the project exists, so nothing below may return an error
  // status — a retry would leave the account with two projects.
  const warnings: string[] = [];
  const envId = environment.id;

  const eventTypesCreated = await registerEventTypes(envId, answers, warnings);
  const surfacesCreated = await createSurfaces(envId, answers, warnings);
  const apiKey = await mintPublishableKey(envId, warnings);
  const halfLifeDays = await readHalfLife(envId, answers, warnings);

  return reply(
    {
      status: "success",
      projectId: project.id,
      environmentId: envId,
      environmentName: environment.name,
      apiKey,
      entityType: answers.preset.kind,
      halfLifeDays,
      eventTypesCreated,
      surfacesCreated,
      warnings,
    },
    200,
  );
}

/**
 * The environment created alongside the project.
 *
 * Matched on `kind` rather than on the name "Production", because the name is
 * a display string a customer can rename and the kind is the enum the backend
 * provisions with. Falling back to the first environment keeps a renamed or
 * re-kinded workspace working rather than dead-ending onboarding.
 */
async function findProductionEnvironment(
  projectId: string,
): Promise<Environment> {
  const envs =
    (await authedFetch<Environment[]>(`/projects/${projectId}/environments`)) ??
    [];
  const production = envs.find((e) => e.kind === "production") ?? envs[0];
  if (!production) {
    throw new NoraiApiError(500, "project has no environment");
  }
  return production;
}

async function registerEventTypes(
  envId: string,
  answers: ResolvedAnswers,
  warnings: string[],
): Promise<number> {
  let categories: EventCategory[];
  try {
    categories = (await authedFetch<EventCategory[]>("/events/categories")) ?? [];
  } catch (err) {
    console.error("[onboarding] could not read event categories", err);
    warnings.push(
      "Your event types weren't registered. Add them on the Events screen.",
    );
    return 0;
  }

  const idByName = new Map(categories.map((c) => [c.name, c.id]));
  const wanted = answers.preset.events.filter((e) =>
    answers.events.includes(e.name),
  );

  const results = await Promise.allSettled(
    wanted.map((event) => {
      const categoryId = idByName.get(event.category);
      if (!categoryId) {
        // A preset naming a category the backend does not seed is our bug, not
        // the user's, so it is logged loudly rather than shown to them.
        return Promise.reject(
          new Error(`no seeded category named ${event.category}`),
        );
      }
      const body: CreateEventTypeRequest = {
        event_name: event.name,
        event_category_id: categoryId,
        entity_type: answers.preset.kind,
      };
      return authedFetch(`/environments/${envId}/event-types`, {
        method: "POST",
        body,
      });
    }),
  );

  return countAndWarn(
    results,
    warnings,
    wanted.length,
    "[onboarding] event type failed",
    (missed) =>
      `${missed} event ${plural(missed, "type", "types")} couldn't be registered. Add ${plural(missed, "it", "them")} on the Events screen.`,
  );
}

async function createSurfaces(
  envId: string,
  answers: ResolvedAnswers,
  warnings: string[],
): Promise<number> {
  const wanted = answers.preset.surfaces.filter((s) =>
    answers.surfaces.includes(s.name),
  );
  if (wanted.length === 0) return 0;

  const results = await Promise.allSettled(
    wanted.map((surface) => {
      const body: CreateSurfaceRequest = {
        name: surface.name,
        slug: slugify(surface.name),
        engine: surface.engine,
        entity_type: answers.preset.kind,
        description: surface.description,
      };
      return authedFetch<Surface>(`/environments/${envId}/surfaces`, {
        method: "POST",
        body,
      });
    }),
  );

  return countAndWarn(
    results,
    warnings,
    wanted.length,
    "[onboarding] surface failed",
    (missed) =>
      `${missed} ${plural(missed, "surface", "surfaces")} couldn't be created. Add ${plural(missed, "it", "them")} on the Surfaces screen.`,
  );
}

/**
 * Publishable, not secret: this key is pasted into the snippet on the next
 * screen and ships inside the customer's app. The secret key can delete a user,
 * so it is never the one onboarding hands out.
 */
async function mintPublishableKey(
  envId: string,
  warnings: string[],
): Promise<string | null> {
  try {
    const body: CreateAPIKeyRequest = {
      name: "Default publishable key",
      class: "publishable",
    };
    const created = await authedFetch<CreatedAPIKey>(
      `/environments/${envId}/api-keys`,
      { method: "POST", body },
    );
    return created.apiKey;
  } catch (err) {
    console.error("[onboarding] could not mint an API key", err);
    warnings.push("We couldn't issue a key. Create one on the API keys screen.");
    return null;
  }
}

async function readHalfLife(
  envId: string,
  answers: ResolvedAnswers,
  warnings: string[],
): Promise<number> {
  try {
    const config = await authedFetch<EntityTypeConfig>(
      `/environments/${envId}/entity-config/${encodeURIComponent(answers.preset.kind)}`,
    );
    return config.decay_half_life_d;
  } catch (err) {
    // Display only — the engine uses its own value regardless of what we show,
    // so the preset's copy is a fine fallback and not worth a warning.
    console.error("[onboarding] could not read entity config", err);
    void warnings;
    return answers.preset.halfLifeDays;
  }
}

function countAndWarn(
  results: PromiseSettledResult<unknown>[],
  warnings: string[],
  attempted: number,
  logPrefix: string,
  message: (missed: number) => string,
): number {
  let created = 0;
  for (const result of results) {
    if (result.status === "fulfilled") created += 1;
    else console.error(logPrefix, result.reason);
  }
  const missed = attempted - created;
  if (missed > 0) warnings.push(message(missed));
  return created;
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}
