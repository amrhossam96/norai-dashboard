/**
 * POST: register a project (the dashboard's equivalent of `norai projects create`)
 * and make it the current one. PUT: switch the current project.
 */
import { getSessionUser, setProjectCookie } from "@/lib/session";
import { createProject, getProjectFor } from "@/lib/control/projects";
import { PROJECT_CREATE_FAILED, validateProjectName, type ProjectResult } from "@/lib/projects";

function reply(result: ProjectResult, status: number) {
  return Response.json(result, { status });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return reply({ status: "error", message: "Your session expired." }, 401);
  const payload = (await req.json().catch(() => null)) as { name?: unknown } | null;
  const name = String(payload?.name ?? "").trim();
  const invalid = validateProjectName(name);
  if (invalid) return reply({ status: "error", message: invalid }, 400);
  try {
    const project = await createProject(user.user_id, name);
    await setProjectCookie(project.project_id);
    return reply({ status: "success", message: "", projectId: project.project_id }, 200);
  } catch (err) {
    console.error("[projects] create failed", err);
    const msg = err instanceof Error && /DASHBOARD_SECRET/.test(err.message) ? err.message : PROJECT_CREATE_FAILED;
    return reply({ status: "error", message: msg }, 502);
  }
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return reply({ status: "error", message: "Your session expired." }, 401);
  const payload = (await req.json().catch(() => null)) as { projectId?: unknown } | null;
  const id = String(payload?.projectId ?? "");
  const project = await getProjectFor(user.user_id, id);
  if (!project) return reply({ status: "error", message: "Not one of your projects." }, 404);
  await setProjectCookie(project.project_id);
  return reply({ status: "success", message: "", projectId: project.project_id }, 200);
}
