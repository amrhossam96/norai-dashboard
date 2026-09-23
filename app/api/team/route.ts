import { currentProject } from "@/lib/current";
import { addMember, removeMember } from "@/lib/control/team";
import { validateEmail } from "@/lib/auth";
import type { ApiResult } from "@/lib/api/client";
import type { Member } from "@/lib/api/types";

const reply = <T,>(r: ApiResult<T>, status: number) => Response.json(r, { status });

export async function POST(req: Request) {
  const cur = await currentProject();
  if (!cur) return reply({ status: "error", message: "Your session expired." }, 401);
  if (cur.project.role === "member") return reply({ status: "error", message: "Only owners and admins can add people." }, 403);
  const body = (await req.json().catch(() => null)) as { email?: unknown; role?: unknown } | null;
  const email = String(body?.email ?? "");
  const invalid = validateEmail(email);
  if (invalid) return reply({ status: "error", message: invalid }, 400);
  const role = body?.role === "admin" ? "admin" : "member";
  const member = await addMember(cur.project.project_id, email, role);
  if (!member) return reply({ status: "error", message: "No dashboard account with that email. Ask them to sign up first." }, 404);
  return reply<Member>({ status: "success", message: "", data: member }, 200);
}

export async function DELETE(req: Request) {
  const cur = await currentProject();
  if (!cur) return reply({ status: "error", message: "Your session expired." }, 401);
  if (cur.project.role === "member") return reply({ status: "error", message: "Only owners and admins can remove people." }, 403);
  const body = (await req.json().catch(() => null)) as { user_id?: unknown } | null;
  await removeMember(cur.project.project_id, String(body?.user_id ?? ""));
  return reply({ status: "success", message: "" }, 200);
}
