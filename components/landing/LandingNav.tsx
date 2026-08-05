import Link from "next/link";
import { NoraiMark } from "@/components/NoraiMark";

/** Wordmark: the norai brandmark alongside the name, in chrome white. */
function Wordmark() {
  return (
    <span className="flex items-center gap-[9px] text-[#f2f2f2]">
      <NoraiMark size={20} />
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        norai
      </span>
    </span>
  );
}

const LINKS = [
  { label: "System", href: "#system" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Docs", href: "#docs" },
  { label: "FAQ", href: "#faq" },
];

/**
 * Sticky top nav. Transparent while the hero sits at the top, solidifying into
 * a dark blurred bar as the page scrolls — driven entirely by CSS (see
 * `.nr-nav` in globals.css), so it works with no client JS.
 */
export function LandingNav() {
  return (
    <div className="nr-nav fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-[1200px] items-center gap-[14px] px-[18px] py-[11px] md:gap-[26px] md:px-[28px] md:py-[13px]">
        <Link href="#top" className="flex items-center">
          <Wordmark />
        </Link>

        <nav className="ml-[14px] hidden gap-[20px] lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[13px] text-[#b4b4b4] transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-[12px]">
          <a
            href="#waitlist"
            className="hidden text-[13px] font-medium text-[#b4b4b4] transition-colors hover:text-white sm:inline"
          >
            Talk to us
          </a>
          <a
            href="#waitlist"
            className="cta cta-accent cta-sm"
          >
            Join the waitlist
          </a>
        </div>
      </div>
    </div>
  );
}
