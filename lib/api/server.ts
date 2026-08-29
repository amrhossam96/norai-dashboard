import "server-only";

import { apiFetch, NoraiApiError, type RequestOptions } from "./client";
import { getSessionToken } from "@/lib/session";

/**
 * apiFetch with the signed-in user's JWT attached.
 *
 * The backend wants `Authorization: Bearer <jwt>` and nothing more — Postman
 * works because you paste the token in yourself. The browser cannot do that:
 * the token lives in an httpOnly cookie precisely so JavaScript cannot read it,
 * which also means client code cannot build the header. So the header is added
 * here, on the server, where the cookie is readable.
 *
 * Call this from server components and route handlers. Importing it into a
 * client component is a build error, via "server-only".
 */
export async function authedFetch<T>(
  path: string,
  options: Omit<RequestOptions, "token"> = {},
): Promise<T> {
  const token = await getSessionToken();
  if (!token) {
    // Mirrors what the API would answer, so callers handle one shape rather
    // than a missing-cookie case and a rejected-token case separately.
    throw new NoraiApiError(401, "unauthorized");
  }
  return apiFetch<T>(path, { ...options, token });
}

/** True when an error is the API rejecting the caller's identity. */
export function isUnauthorized(err: unknown): boolean {
  return err instanceof NoraiApiError && err.status === 401;
}
