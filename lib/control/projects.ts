import "server-only";

import { query, queryOne, transaction } from "@/lib/db/pg";
import { encrypt, decrypt } from "@/lib/crypto";
import { mintKey } from "@/lib/control/keys";
import type { Project } from "@/lib/api/types";

/** Where new projects are registered; the CLI reads it from config/semantic/<id>.yaml. */
const REGION = process.env.NORAI_REGION ?? "local";

export async function listProjectsFor(userId: string): Promise<Project[]> {
  return query<Project>(
    `SELECT p.project_id, p.name, p.region, p.status, p.created_at, m.role
       FROM dashboard.memberships m JOIN public.projects p USING (project_id)
      WHERE m.user_id = $1 ORDER BY p.created_at`,
    [userId],
  );
}

export async function getProjectFor(userId: string, projectId: string): Promise<Project | null> {
  return queryOne<Project>(
    `SELECT p.project_id, p.name, p.region, p.status, p.created_at, m.role
       FROM dashboard.memberships m JOIN public.projects p USING (project_id)
      WHERE m.user_id = $1 AND m.project_id = $2`,
    [userId, projectId],
  );
}

/** `my-shop-k3j2` — the CLI treats ids as opaque, so any slug works. */
export function projectIdFrom(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
  const suffix = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${suffix}` : `project-${suffix}`;
}

/**
 * Register a project the way `norai projects create` does (ml/control/registry.py),
 * make the caller its owner, and mint the secret key the dashboard will use to
 * talk to the gateway for it. One transaction: a half-created project is worse
 * than none.
 */
export async function createProject(userId: string, name: string): Promise<Project> {
  const projectId = projectIdFrom(name);
  return transaction(async (c) => {
    const now = new Date();
    await c.query(
      "INSERT INTO public.projects (project_id, name, created_at, region, status) VALUES ($1, $2, $3, $4, 'active')",
      [projectId, name.trim(), now, REGION],
    );
    await c.query(
      "INSERT INTO dashboard.memberships (user_id, project_id, role) VALUES ($1, $2, 'owner')",
      [userId, projectId],
    );
    const minted = await mintKey(c, projectId, "secret");
    await c.query(
      "INSERT INTO dashboard.project_keys (project_id, key_id, ciphertext) VALUES ($1, $2, $3)",
      [projectId, minted.key_id, encrypt(minted.key)],
    );
    await c.query(
      `INSERT INTO public.audit_log (project_id, audit_id, actor, action, resource, payload, created_at)
       VALUES ($1, gen_random_uuid(), $2, 'project.create', $1, '{}', $3)`,
      [projectId, `dashboard:${userId}`, now],
    );
    return {
      project_id: projectId,
      name: name.trim(),
      region: REGION,
      status: "active",
      created_at: now.toISOString(),
      role: "owner",
    };
  });
}

/** The dashboard's own secret key for a project (plaintext, decrypted on demand). */
export async function projectGatewayKey(projectId: string): Promise<string> {
  const row = await queryOne<{ ciphertext: string }>(
    "SELECT ciphertext FROM dashboard.project_keys WHERE project_id = $1",
    [projectId],
  );
  if (!row) {
    throw new Error(
      `project ${projectId} has no dashboard key; it was registered outside the dashboard. Create one with "norai keys create --project ${projectId} --type secret" and insert it into dashboard.project_keys.`,
    );
  }
  return decrypt(row.ciphertext);
}
