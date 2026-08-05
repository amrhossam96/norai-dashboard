"use client";

import { usePathname } from "next/navigation";
import { mockEnvironment } from "@/lib/mock/pipeline";
import { navSections } from "@/lib/nav";

function pageLabel(pathname: string): string {
  if (pathname === "/app") return "pipeline";
  const all = navSections.flatMap((s) => s.items);
  const match = all.find(
    (i) => i.href !== "/app" && pathname.startsWith(i.href),
  );
  return match
    ? match.label.toLowerCase()
    : pathname.replace(/^\/app\/?/, "");
}

function Crumb({ children, muted }: { children: string; muted?: boolean }) {
  return (
    <span
      className={`font-sans text-[12.5px] ${
        muted ? "text-grey-40" : "font-medium text-ink"
      }`}
    >
      {children}
    </span>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const sep = <span className="font-mono text-[12px] text-grey-85">/</span>;

  return (
    <header className="flex items-center gap-[14px] border-b border-line bg-surface px-[24px] py-[13px]">
      {mockEnvironment.team && (
        <>
          <Crumb muted>{mockEnvironment.team}</Crumb>
          {sep}
        </>
      )}
      <Crumb>{mockEnvironment.name}</Crumb>
      {sep}
      <Crumb>{pageLabel(pathname)}</Crumb>

      <div className="ml-auto flex items-center gap-[10px]">
        <button className="flex items-center gap-[26px] rounded-[7px] border border-line bg-shell px-[10px] py-[6px] transition-colors hover:border-grey-85">
          <span className="font-sans text-[12px] text-grey-60">
            Search users, entities, events
          </span>
          <span className="font-mono text-[10px] font-medium text-grey-60">
            ⌘K
          </span>
        </button>
        <a
          href="#"
          className="font-sans text-[12.5px] text-ink-3 transition-colors hover:text-ink"
        >
          Docs
        </a>
      </div>
    </header>
  );
}
