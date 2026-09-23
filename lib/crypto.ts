import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

/** The alphabet the CLI uses for API keys (ml/control/keys.py ALPHABET). */
const KEY_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function randomKeyChars(n: number): string {
  const buf = randomBytes(n);
  let out = "";
  for (let i = 0; i < n; i++) out += KEY_ALPHABET[buf[i] % KEY_ALPHABET.length];
  return out;
}

/**
 * UUIDv7: time-ordered, which is what the CLI mints for key ids
 * (norai.artifacts.store.uuid7). Node only ships v4, so it is built here.
 */
export function uuid7(): string {
  const ms = BigInt(Date.now());
  const b = randomBytes(16);
  b[0] = Number((ms >> 40n) & 0xffn);
  b[1] = Number((ms >> 32n) & 0xffn);
  b[2] = Number((ms >> 24n) & 0xffn);
  b[3] = Number((ms >> 16n) & 0xffn);
  b[4] = Number((ms >> 8n) & 0xffn);
  b[5] = Number(ms & 0xffn);
  b[6] = (b[6] & 0x0f) | 0x70;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = b.toString("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export { randomUUID };

// ---- Symmetric encryption for the dashboard-held project keys ----

function secretKey(): Buffer {
  const raw = process.env.DASHBOARD_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error(
      "DASHBOARD_SECRET is not set (or is shorter than 16 characters). It protects the per-project keys the dashboard holds; see .env.example.",
    );
  }
  return createHash("sha256").update(raw).digest();
}

/** AES-256-GCM; output is base64url(iv || tag || ciphertext). */
export function encrypt(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey(), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

export function decrypt(payload: string): string {
  const buf = Buffer.from(payload, "base64url");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const enc = buf.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", secretKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}
