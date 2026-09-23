import "server-only";

import { argon2id, argon2Verify } from "hash-wasm";
import { randomBytes } from "node:crypto";

/**
 * argon2id for user passwords and for API keys.
 *
 * The API-key parameters are the gateway's (config/serving/gateway.yaml
 * `keys.argon2id`): the Go side verifies the PHC string we store
 * (services/internal/auth/keys.go VerifyPHC), so these must match exactly.
 * Passwords reuse the same cost; it is a fine setting for both.
 */
export const ARGON2 = {
  iterations: 2,
  memorySize: 65536, // KiB
  parallelism: 1,
  hashLength: 32,
  saltBytes: 16,
} as const;

export async function hashSecret(secret: string): Promise<string> {
  return argon2id({
    password: secret,
    salt: randomBytes(ARGON2.saltBytes),
    iterations: ARGON2.iterations,
    memorySize: ARGON2.memorySize,
    parallelism: ARGON2.parallelism,
    hashLength: ARGON2.hashLength,
    outputType: "encoded",
  });
}

export async function verifySecret(phc: string, secret: string): Promise<boolean> {
  try {
    return await argon2Verify({ password: secret, hash: phc });
  } catch {
    return false;
  }
}
