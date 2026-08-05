import { StubPage } from "@/components/StubPage";

export default function TeamPage() {
  return (
    <StubPage
      index="06"
      title="Team & audit log"
      purpose="Who can touch this environment, and a record of what they did. RBAC is enforced at the project level; env access is derived from it."
      rows={[
        { status: "BUILT", text: "Team members with roles: owner / admin / member / viewer" },
        { status: "BUILT", text: "Add an existing user by id, change role, remove members (owner/admin only)" },
        { status: "BACKEND", text: "Invite by email — add-member takes a user_id, so there is no invite flow yet" },
        { status: "UX", text: "Audit log reads as sentences — “Amr revoked key ‘mobile-prod’ · 2h ago”" },
        { status: "BACKEND", text: "Audit-log persistence and a read endpoint are not built yet" },
      ]}
    />
  );
}
