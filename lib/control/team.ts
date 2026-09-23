import "server-only";

import { query, queryOne } from "@/lib/db/pg";
import type { AuditRow, Member } from "@/lib/api/types";

export async function listMembers(projectId: string): Promise<Member[]> {
  return query<Member>(
    `SELECT u.user_id, u.email, u.first_name, u.last_name, m.role, m.created_at
       FROM dashboard.memberships m JOIN dashboard.users u USING (user_id)
      WHERE m.project_id = $1 ORDER BY m.created_at`,
    [projectId],
  );
}

/** Add an existing dashboard account by email. Returns null when no such account. */
export async function addMember(projectId: string, email: string, role: Member["role"]): Promise<Member | null> {
  const user = await queryOne<{ user_id: string }>(
    "SELECT user_id FROM dashboard.users WHERE lower(email) = lower($1)",
    [email.trim()],
  );
  if (!user) return null;
  await query(
    `INSERT INTO dashboard.memberships (user_id, project_id, role) VALUES ($1, $2, $3)
     ON CONFLICT (user_id, project_id) DO UPDATE SET role = EXCLUDED.role`,
    [user.user_id, projectId, role],
  );
  return queryOne<Member>(
    `SELECT u.user_id, u.email, u.first_name, u.last_name, m.role, m.created_at
       FROM dashboard.memberships m JOIN dashboard.users u USING (user_id)
      WHERE m.project_id = $1 AND m.user_id = $2`,
    [projectId, user.user_id],
  );
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  await query("DELETE FROM dashboard.memberships WHERE project_id = $1 AND user_id = $2 AND role <> 'owner'", [
    projectId,
    userId,
  ]);
}

export async function auditLog(projectId: string): Promise<AuditRow[]> {
  return query<AuditRow>(
    "SELECT audit_id, actor, action, resource, created_at FROM public.audit_log WHERE project_id = $1 ORDER BY created_at DESC LIMIT 50",
    [projectId],
  );
}
