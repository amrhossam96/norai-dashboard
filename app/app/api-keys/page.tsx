import { requireProject } from "@/lib/current";
import { listKeys } from "@/lib/control/keys";
import { PageHeader } from "@/components/ui/PageHeader";
import { KeysPanel } from "@/components/keys/KeysPanel";

export default async function ApiKeysPage() {
  const { project } = await requireProject("/app/api-keys");
  const keys = await listKeys(project.project_id);
  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader eyebrow="Settings" title="API keys">
        Every call to the gateway carries <code className="font-mono text-[12px] text-ink-3">Authorization: Bearer nk_…</code>.
        Keys are stored hashed; the plaintext is shown once. Revoking keeps a key valid for 24 hours so you can rotate
        without an outage.
      </PageHeader>
      <KeysPanel keys={keys} />
    </div>
  );
}
