import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { hasSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create an account — norai",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  if (await hasSession()) redirect("/app");

  return (
    <AuthShell
      title="Create an account"
      subtitle="We'll email you an activation link before you can sign in."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-[#f2f2f2] underline underline-offset-2">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
