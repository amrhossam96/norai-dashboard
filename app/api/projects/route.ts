/**
 * Project creation.
 *
 * Two calls to the API, not one: POST /v1/projects/ needs a team_id, and the
 * browser has no idea which team the user belongs to. The team was provisioned
 * for them at activation (users.Service.Activate -> EnsurePersonalWorkspaceIfNone),
 * so it is looked up here rather than being asked for in the form.
 *
 * The project's default "Production" environment is created by the backend in
 * the same transaction, so nothing more is needed to get a usable workspace.
 */
import { NoraiApiError } from "@/lib/api/client";
import { authedFetch, isUnauthorized } from "@/lib/api/server";
import type {
  CreateProjectRequest,
  Project,
  TeamWithRole,
} from "@/lib/api/types";
import {
  PROJECT_CREATE_FAILED,
  PROJECT_NO_TEAM,
  slugifyProjectName,
  validateProjectName,
  type ProjectResult,
} from "@/lib/projects";

function reply(result: ProjectResult, status: number) {
  return Response.json(result, { status });
}

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  if (payload === null || typeof payload !== "object") {
    return reply({ status: "error", message: PROJECT_CREATE_FAILED }, 400);
  }

  const name = String((payload as Record<string, unknown>).name ?? "").trim();
  const invalid = validateProjectName(name);
  if (invalid) {
    return reply({ status: "error", message: invalid }, 400);
  }

  try {
    const teams = await authedFetch<TeamWithRole[]>("/teams");
    const team = teams?.[0];
    if (!team) {
      // Only reachable if provisioning failed at activation, which the backend
      // logs but does not treat as fatal.
      console.error("[projects] user has no team");
      return reply({ status: "error", message: PROJECT_NO_TEAM }, 409);
    }

    const body: CreateProjectRequest = {
      name,
      slug: slugifyProjectName(name),
      description: "",
      team_id: team.id,
    };

    const project = await authedFetch<Project>("/projects/", {
      method: "POST",
      body,
    });

    return reply(
      { status: "success", message: "", projectId: project.id },
      200,
    );
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
    console.error("[projects] create failed", err);
    return reply({ status: "error", message: PROJECT_CREATE_FAILED }, 502);
  }
}
