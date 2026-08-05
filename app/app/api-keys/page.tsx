import { StubPage } from "@/components/StubPage";

export default function ApiKeysPage() {
  return (
    <StubPage
      index="06"
      title="Keys & environments"
      purpose="Boring on purpose. Environment is the data-isolation unit, so it lives in the sidebar — this is just the keys that write to it."
      rows={[
        { status: "BUILT", text: "Create / revoke keys (admin only), env create-update-archive, RBAC at project level" },
        { status: "UX", text: "Copy-once secret with an “I saved it” gate; rotation without downtime" },
        { status: "UX", text: "Prod is visually distinct everywhere — destructive actions type-to-confirm" },
        { status: "BACKEND", text: "Key detail view + last_used_at + rate-limit headroom — all M3, don’t build the view yet" },
      ]}
    />
  );
}
