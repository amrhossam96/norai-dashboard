import { requireProject } from "@/lib/current";
import { configHistory, isConfigKind, KIND_BLURB, KIND_LABEL, latestConfigs, STARTERS, toYaml } from "@/lib/control/config";
import { CONFIG_KINDS } from "@/lib/api/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfigEditor, type KindView } from "@/components/config/ConfigEditor";

export default async function ConfigPage(props: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await props.searchParams;
  const { project } = await requireProject("/app/config");
  const latest = await latestConfigs(project.project_id);
  const kinds: KindView[] = await Promise.all(
    CONFIG_KINDS.map(async (k) => ({
      kind: k,
      label: KIND_LABEL[k],
      blurb: KIND_BLURB[k],
      current: latest[k] ?? null,
      currentYaml: latest[k] ? toYaml(latest[k]!.payload) : "",
      starter: STARTERS[k],
      history: (await configHistory(project.project_id, k)).map((h) => ({ version: h.version, created_at: h.created_at })),
    })),
  );

  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader eyebrow="Settings" title="Configuration">
        Everything customer-specific lives in four versioned objects, not in code. Uploads go through the gateway,
        which validates them against the schemas in the norai repo. Order matters the first time: mapping, then
        taxonomy, surfaces, and rules last.
      </PageHeader>
      <ConfigEditor kinds={kinds} initial={kind && isConfigKind(kind) ? kind : "schema"} />
    </div>
  );
}
