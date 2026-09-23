"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Project } from "@/lib/api/types";
import { postJson } from "@/lib/api/client";

/**
 * Which project the shell is scoped to. Every screen reads the choice from a
 * cookie the switch writes (PUT /api/projects), then the router refreshes so
 * server components re-render for the new project.
 */
export function ProjectSwitcher({ project, projects }: { project: Project; projects: Project[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    if (id === "__new") {
      router.push("/onboarding?new=1");
      return;
    }
    setPending(true);
    await postJson("/api/projects", { projectId: id }, "PUT");
    setPending(false);
    router.refresh();
  }

  return (
    <div className="px-[14px] pb-[14px]">
      <label className="block w-full rounded-[8px] border border-line bg-surface px-[11px] py-[10px] shadow-[0_1px_2px_rgba(15,15,15,0.04)] transition-colors hover:border-grey-85">
        <div className="eyebrow">Project</div>
        <div className="mt-[6px] flex items-center gap-[7px]">
          <span className={`h-[6px] w-[6px] rounded-full ${project.status === "active" ? "bg-red" : "bg-grey-70"}`} />
          <select
            value={project.project_id}
            onChange={onChange}
            disabled={pending}
            aria-label="Project"
            className="flex-1 cursor-pointer appearance-none bg-transparent font-sans text-[13px] font-semibold text-ink outline-none"
          >
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id} className="bg-surface text-ink">
                {p.name}
              </option>
            ))}
            <option value="__new" className="bg-surface text-ink">
              + New project…
            </option>
          </select>
          <span className="font-mono text-[10px] text-grey-65">⌄</span>
        </div>
        <div className="mt-[5px] truncate font-mono text-[9.5px] text-grey-60">
          {project.project_id} · {project.region}
        </div>
      </label>
    </div>
  );
}
