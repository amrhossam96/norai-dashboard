import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ActivateForm } from "@/components/auth/ActivateForm";

export const metadata: Metadata = {
  title: "Activate your account — norai",
  robots: { index: false, follow: false },
};

/**
 * Target of the activation link the backend emails:
 * `${FRONT_URL}/confirm/{token}` — internal/modules/users/service.go.
 * The path is fixed by the backend; renaming this route breaks every link
 * already sitting in someone's inbox.
 */
export default async function ConfirmPage(props: {
  params: Promise<{ token: string }>;
}) {
  // params is a Promise in Next 16.
  const { token } = await props.params;

  return (
    <AuthShell
      title="Activate your account"
      subtitle="One click and your norai account is ready to sign in."
    >
      <ActivateForm token={token} />
    </AuthShell>
  );
}
