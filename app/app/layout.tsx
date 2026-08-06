import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import { hasSession } from "@/lib/session";

/**
 * Every /app/* route renders through this layout, so the session check here
 * covers all of them.
 *
 * This is a presence check on the cookie, not proof of authorisation — it stops
 * the shell rendering for signed-out visitors. The authoritative answer is the
 * Go API's 401 on each request, so once these screens fetch real data they must
 * still handle that rather than trusting this gate.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasSession())) redirect("/login?next=/app");

  return (
    <div className="flex h-screen bg-shell">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="no-scrollbar flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
