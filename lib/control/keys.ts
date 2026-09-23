import "server-only";

import type { PoolClient } from "pg";
import { query, queryOne, transaction } from "@/lib/db/pg";
import { randomKeyChars, uuid7 } from "@/lib/crypto";
import { hashSecret } from "@/lib/auth/password";
import type { ApiKeyRow, CreatedApiKey } from "@/lib/api/types";

/**
 * Mirrors ml/control/keys.py and the gateway's config/serving/gateway.yaml
 * `keys` block: nk_<pub|sec>_<32 chars>, stored as an argon2id PHC string, looked
 * up by `nk_xxx_` + the first 8 random characters. The plaintext leaves this
 * module exactly once, in the create result.
 */
const RANDOM_CHARS = 32;
const LOOKUP_PREFIX_CHARS = 8;
const GRACE_HOURS = 24;
const PREFIX = { publishable: "nk_pub_", secret: "nk_sec_" } as const;

export type KeyType = keyof typeof PREFIX;

/** `nk_sec_abcdefgh…k9z2` at creation; afterwards only the stored prefix is known. */
function display(keyPrefix: string, key?: string): string {
  return key ? `${keyPrefix}…${key.slice(-4)}` : `${keyPrefix}…`;
}

/** Insert a key using an existing client, so callers can compose it into a transaction. */
export async function mintKey(
  c: Pick<PoolClient, "query">,
  projectId: string,
  keyType: KeyType,
): Promise<CreatedApiKey> {
  const key = PREFIX[keyType] + randomKeyChars(RANDOM_CHARS);
  const keyPrefix = key.slice(0, PREFIX[keyType].length + LOOKUP_PREFIX_CHARS);
  const keyId = `key_${uuid7()}`;
  const now = new Date();
  await c.query(
    "INSERT INTO public.api_keys (project_id, key_id, key_prefix, key_hash, key_type, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
    [projectId, keyId, keyPrefix, await hashSecret(key), keyType, now],
  );
  return {
    key_id: keyId,
    key,
    display: display(keyPrefix, key),
    key_type: keyType,
    created_at: now.toISOString(),
    revoked_at: null,
    grace_until: null,
  };
}

export async function createKey(projectId: string, keyType: KeyType, actor: string): Promise<CreatedApiKey> {
  return transaction(async (c) => {
    const made = await mintKey(c, projectId, keyType);
    await c.query(
      `INSERT INTO public.audit_log (project_id, audit_id, actor, action, resource, payload, created_at)
       VALUES ($1, gen_random_uuid(), $2, 'key.create', $3, $4, now())`,
      [projectId, actor, made.key_id, JSON.stringify({ key_type: keyType })],
    );
    return made;
  });
}

export async function listKeys(projectId: string): Promise<ApiKeyRow[]> {
  const rows = await query<{
    key_id: string;
    key_prefix: string;
    key_type: KeyType;
    created_at: string;
    revoked_at: string | null;
    grace_until: string | null;
  }>(
    "SELECT key_id, key_prefix, key_type, created_at, revoked_at, grace_until FROM public.api_keys WHERE project_id = $1 ORDER BY created_at",
    [projectId],
  );
  // The dashboard's own key is an implementation detail, not something a user manages.
  const own = await queryOne<{ key_id: string }>(
    "SELECT key_id FROM dashboard.project_keys WHERE project_id = $1",
    [projectId],
  );
  return rows
    .filter((r) => r.key_id !== own?.key_id)
    .map((r) => ({
      key_id: r.key_id,
      display: display(r.key_prefix),
      key_type: r.key_type,
      created_at: r.created_at,
      revoked_at: r.revoked_at,
      grace_until: r.grace_until,
    }));
}

export async function revokeKey(projectId: string, keyId: string, actor: string): Promise<boolean> {
  const own = await queryOne<{ key_id: string }>(
    "SELECT key_id FROM dashboard.project_keys WHERE project_id = $1",
    [projectId],
  );
  if (own?.key_id === keyId) return false;
  const rows = await query(
    `UPDATE public.api_keys
        SET revoked_at = COALESCE(revoked_at, now()), grace_until = now() + ($3 || ' hours')::interval
      WHERE project_id = $1 AND key_id = $2 RETURNING key_id`,
    [projectId, keyId, String(GRACE_HOURS)],
  );
  if (rows.length === 0) return false;
  await query(
    `INSERT INTO public.audit_log (project_id, audit_id, actor, action, resource, payload, created_at)
     VALUES ($1, gen_random_uuid(), $2, 'key.revoke', $3, '{}', now())`,
    [projectId, actor, keyId],
  );
  return true;
}
