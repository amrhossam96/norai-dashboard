/**
 * Sign-out: deletes the session row (real revocation) and clears the cookies.
 * GET exists for server-side redirects: a page that finds the cookie stale
 * sends the browser here so the cookie is destroyed before it lands on /login.
 */
import { redirect } from "next/navigation";
import { destroySession } from "@/lib/session";

export async function POST() {
  await destroySession();
  return Response.json({ status: "success", message: "" }, { status: 200 });
}

export async function GET(req: Request) {
  await destroySession();
  const next = new URL(req.url).searchParams.get("next");
  const safe = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";
  redirect(`/login?next=${encodeURIComponent(safe)}`);
}
