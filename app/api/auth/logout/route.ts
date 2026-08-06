/**
 * Sign-out. Clears the session cookie.
 *
 * POST rather than GET on purpose: a GET would let any <img src="/api/auth/logout">
 * on a third-party page sign the user out.
 *
 * The JWT itself stays valid until it expires — the Go API is stateless and has
 * no revocation list. Clearing the cookie is enough for the browser, but a token
 * already copied out elsewhere would keep working. Real revocation needs backend
 * support (a denylist or short-lived tokens plus refresh).
 */
import { destroySession } from "@/lib/session";

export async function POST() {
  await destroySession();
  return Response.json({ status: "success", message: "" }, { status: 200 });
}
