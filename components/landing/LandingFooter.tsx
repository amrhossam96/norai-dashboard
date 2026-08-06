import Link from "next/link";
import { NoraiMark } from "@/components/NoraiMark";

interface Col {
  title: string;
  links: { label: string; href: string }[];
}

const COLS: Col[] = [
  {
    title: "PRODUCT",
    links: [
      { label: "How it works", href: "#system" },
      { label: "Dashboard", href: "#dashboard" },
      { label: "Sample request", href: "#docs" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "Waitlist", href: "#waitlist" },
      { label: "FAQ", href: "#faq" },
      // A real route, unlike the anchors above it. Kept last so it does not
      // compete with the waitlist while the product is still invite-only.
      { label: "Sign in", href: "/login" },
    ],
  },
  // No LEGAL column until the documents exist. Privacy, Terms and a DPA were
  // all linked to "#top" — three dead links promising paperwork we do not have,
  // and a DPA link is exactly what an enterprise buyer checks first.
];

export function LandingFooter() {
  return (
    <div className="mx-auto max-w-[1200px] px-[18px] pb-[32px] pt-[40px] md:px-[28px] md:pb-[40px] md:pt-[56px]">
      <div className="flex flex-wrap items-start gap-[30px] border-t border-[#262626] pt-[24px]">
        <div className="min-w-[220px] flex-1">
          <div className="flex items-center gap-[9px] text-[#f2f2f2]">
            <NoraiMark size={18} />
            <span className="text-[14px] font-semibold tracking-[-0.02em]">
              norai
            </span>
          </div>
          <div className="mt-[10px] max-w-[260px] text-[12.5px] leading-[1.6] text-[#7a7a7a]">
            Recommendations that explain themselves.
          </div>
        </div>

        {COLS.map((col) => (
          <div key={col.title} className="flex flex-col gap-[8px]">
            <div className="font-mono text-[9px] font-medium tracking-[0.13em] text-[#6e6e6e]">
              {col.title}
            </div>
            {col.links.map((l) => {
              const style =
                "text-[12.5px] text-[#a8a8a8] transition-colors hover:text-white";
              // Same-page anchors stay plain <a>; real routes go through Link so
              // they navigate client-side instead of reloading the document.
              return l.href.startsWith("/") ? (
                <Link key={l.label} href={l.href} className={style}>
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href} className={style}>
                  {l.label}
                </a>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-[26px] font-mono text-[11.5px] text-[#565656]">
        © {new Date().getFullYear()} norai · figures in the product preview are
        illustrative
      </div>
    </div>
  );
}
