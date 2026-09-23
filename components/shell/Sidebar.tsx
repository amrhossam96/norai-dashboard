"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";
import { NoraiMark } from "@/components/NoraiMark";
import { UserMenu } from "@/components/shell/UserMenu";
import { ProjectSwitcher } from "@/components/shell/ProjectSwitcher";
import type { CurrentUser, Project } from "@/lib/api/types";

function Logo() {
  return (
    <div className="flex items-center gap-[9px] px-[18px] pb-4 pt-[18px] text-ink">
      <NoraiMark size={20} />
      <span className="font-sans text-[15px] font-semibold tracking-[-0.02em]">
        norai
      </span>
      <span className="ml-auto rounded-[4px] border border-line px-[5px] py-[2px] font-mono text-[9.5px] font-medium text-grey-40">
        v1
      </span>
    </div>
  );
}

export function Sidebar({
  user,
  project,
  projects,
}: {
  user: CurrentUser | null;
  project: Project;
  projects: Project[];
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[236px] flex-none flex-col border-r border-line bg-surface">
      <Logo />
      <ProjectSwitcher project={project} projects={projects} />

      <nav className="no-scrollbar flex flex-1 flex-col gap-[2px] overflow-y-auto px-[14px]">
        {navSections.map((section, si) => (
          <div key={section.title} className="flex flex-col gap-[2px]">
            <div
              className="eyebrow px-[8px] pb-[5px]"
              style={{ paddingTop: si === 0 ? 10 : 16 }}
            >
              {section.title}
            </div>
            {section.items.map((item) => {
              const active =
                item.href === "/app"
                  ? pathname === "/app"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-[8px] rounded-[6px] px-[10px] py-[7px] font-sans text-[13px] transition-colors ${
                    active
                      ? "bg-[#1f1f1f] font-semibold text-ink"
                      : "font-normal text-ink-3 hover:bg-[#161616]"
                  }`}
                >
                  {item.index && (
                    <span
                      className={`font-mono text-[9.5px] font-medium ${
                        active ? "text-grey-50" : "text-grey-75"
                      }`}
                    >
                      {item.index}
                    </span>
                  )}
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <UserMenu user={user} />
    </aside>
  );
}
