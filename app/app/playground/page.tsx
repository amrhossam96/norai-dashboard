import { requireProject } from "@/lib/current";
import { listSurfaces } from "@/lib/control/config";
import { PageHeader } from "@/components/ui/PageHeader";
import { Playground } from "@/components/playground/Playground";

export default async function PlaygroundPage() {
  const { project } = await requireProject("/app/playground");
  const surfaces = await listSurfaces(project.project_id);
  return (
    <div className="px-[24px] pb-[36px] pt-[26px]">
      <PageHeader eyebrow="02 · Serve" title="Playground">
        The same call your server makes, with the explain record beside it. Requests go through the gateway with
        the project&apos;s own key, so they are served, logged and attributed exactly like production traffic.
      </PageHeader>
      <Playground surfaces={surfaces.map((s) => s.surface_name)} />
    </div>
  );
}
