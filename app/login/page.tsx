import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { hasSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in — norai",
  // Auth screens should never appear in search results.
  robots: { index: false, follow: false },
};

export default async function LoginPage(props: {
  searchParams: Promise<{ next?: string }>;
}) {
  // searchParams is a Promise in Next 16.
  const { next } = await props.searchParams;

  if (await hasSession()) redirect("/app");

  // Only allow same-origin paths: an attacker-supplied ?next=https://evil.com
  // would otherwise turn this page into an open redirect.
  const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app";

  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your norai dashboard."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#f2f2f2] underline underline-offset-2">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm next={target} />
    </AuthShell>
  );
}
