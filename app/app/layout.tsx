import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { hasSession } from "@/lib/session";
import { authedFetch, isUnauthorized } from "@/lib/api/server";
import type { CurrentUser } from "@/lib/api/types";

/**
 * Every /app/* route renders through this layout, so the session check here
 * covers all of them.
 *
 * This is a presence check on the cookie, not proof of authorisation — it stops
 * the shell rendering for signed-out visitors. The authoritative answer is the
 * Go API's 401 on each request, so once these screens fetch real data they must
 * still handle that rather than trusting this gate.
 */
/**
 * Who is signed in.
 *
 * A failure here must not take the shell down with it: the account chip is
 * chrome, and a dashboard that 500s because it could not draw a name is worse
 * than one that draws a placeholder. A 401 is the exception — that is the API
 * disagreeing with the cookie, and the pages below handle it by redirecting.
 */
async function currentUser(): Promise<CurrentUser | null> {
  try {
    return await authedFetch<CurrentUser>("/users/me");
  } catch (err) {
    if (isUnauthorized(err)) return null;
    console.error("[shell] could not load the signed-in user", err);
    return null;
  }
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasSession())) redirect("/login?next=/app");

  const user = await currentUser();

  return (
    <div className="flex h-screen bg-shell">
      <Sidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
