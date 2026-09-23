"use client";

import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";

function pageLabel(pathname: string): string {
  if (pathname === "/app") return "overview";
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

export function Topbar({ projectName, gatewayVersion }: { projectName: string; gatewayVersion: string | null }) {
  const pathname = usePathname();
  const sep = <span className="font-mono text-[12px] text-grey-85">/</span>;

  return (
    <header className="flex items-center gap-[14px] border-b border-line bg-surface px-[24px] py-[13px]">
      <Crumb>{projectName}</Crumb>
      {sep}
      <Crumb>{pageLabel(pathname)}</Crumb>

      <div className="ml-auto flex items-center gap-[10px]">
        <span className="flex items-center gap-[7px] rounded-[7px] border border-line bg-shell px-[10px] py-[6px]">
          <span className={`h-[6px] w-[6px] rounded-full ${gatewayVersion ? "bg-grey-40" : "bg-red"}`} />
          <span className="font-mono text-[10.5px] text-grey-60">
            {gatewayVersion ? `gateway ${gatewayVersion}` : "gateway unreachable"}
          </span>
        </span>
        <a
          href="https://github.com/amrhossam96/norai/blob/main/docs/SPEC.md"
          target="_blank"
          rel="noreferrer"
          className="font-sans text-[12.5px] text-ink-3 transition-colors hover:text-ink"
        >
          Docs
        </a>
      </div>
    </header>
  );
}
