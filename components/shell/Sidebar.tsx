"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navSections } from "@/lib/nav";
import { mockEnvironment } from "@/lib/mock/pipeline";
import { NoraiMark } from "@/components/NoraiMark";

function Logo() {
  return (
    <div className="flex items-center gap-[9px] px-[18px] pb-4 pt-[18px] text-ink">
      <NoraiMark size={20} />
      <span className="font-sans text-[15px] font-semibold tracking-[-0.02em]">
        norai
      </span>
      <span className="ml-auto rounded-[4px] border border-line px-[5px] py-[2px] font-mono text-[9.5px] font-medium text-grey-40">
        v0.9
      </span>
    </div>
  );
}

function EnvSwitcher() {
  return (
    <div className="px-[14px] pb-[14px]">
      <button className="w-full cursor-pointer rounded-[8px] border border-line bg-surface px-[11px] py-[10px] text-left shadow-[0_1px_2px_rgba(15,15,15,0.04)] transition-colors hover:border-grey-85">
        <div className="eyebrow">Environment</div>
        <div className="mt-[6px] flex items-center gap-[7px]">
          <span className="h-[6px] w-[6px] rounded-full bg-red" />
          <span className="flex-1 font-sans text-[13px] font-semibold text-ink">
            {mockEnvironment.team
              ? `${mockEnvironment.team} / ${mockEnvironment.name}`
              : mockEnvironment.name}
          </span>
          <span className="font-mono text-[10px] text-grey-65">⌄</span>
        </div>
        <div className="mt-[5px] font-mono text-[9.5px] text-grey-60">
          {mockEnvironment.id} · scopes everything
        </div>
      </button>
    </div>
  );
}

function UserFooter() {
  return (
    <div className="flex items-center gap-[9px] border-t border-line px-4 py-[12px]">
      <div className="h-[24px] w-[24px] rounded-full bg-line-2" />
      <div className="flex-1">
        <div className="font-sans text-[12px] font-semibold text-ink">Amr H.</div>
        <div className="font-mono text-[9.5px] text-grey-60">owner</div>
      </div>
      <span className="font-mono text-[11px] text-grey-65">⌄</span>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[236px] flex-none flex-col border-r border-line bg-surface">
      <Logo />
      <EnvSwitcher />

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
                  {item.badge && (
                    <span className="ml-auto font-mono text-[9.5px] font-medium text-grey-40">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <UserFooter />
    </aside>
  );
}
