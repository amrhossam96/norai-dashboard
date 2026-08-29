import { redirect } from "next/navigation";
import { hasSession } from "@/lib/session";
import "./onboarding.css";

/**
 * The wizard takes the whole screen, so it lives outside /app rather than
 * inside it: the dashboard layout wraps its children in the sidebar and topbar,
 * and a first-run flow rendered inside chrome for a workspace that does not
 * exist yet is asking someone to navigate a product they have not set up.
 *
 * The session check is duplicated from the app layout rather than shared,
 * because this route is a sibling of /app and not a child of it. Same caveat
 * applies: this is a presence check on the cookie, and the API's 401 is the
 * authoritative answer.
 */
export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasSession())) redirect("/login?next=/onboarding");
  return children;
}
