/**
 * Sign-out. Clears the session cookie.
 *
 * POST clears the session and returns; the client then navigates away. GET lives
 * for server redirects: when /app hits a 401 it redirects here so the invalid
 * cookie is destroyed before the user is sent back to the login screen —
 * otherwise the login page (which only checks the cookie is present) bounces
 * straight back to /app forever.
 *
 * The JWT itself stays valid until it expires — the Go API is stateless and has
 * no revocation list. Clearing the cookie is enough for the browser, but a token
 * already copied out elsewhere would keep working. Real revocation needs backend
 * support (a denylist or short-lived tokens plus refresh).
 */
import { redirect } from "next/navigation";
import { destroySession } from "@/lib/session";

async function clear() {
  await destroySession();
}

export async function POST() {
  await clear();
  return Response.json({ status: "success", message: "" }, { status: 200 });
}

export async function GET() {
  await clear();
  redirect("/login");
}