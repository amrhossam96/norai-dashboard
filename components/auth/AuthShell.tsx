import Link from "next/link";
import { NoraiMark } from "@/components/NoraiMark";

/**
 * Ambient bloom behind the card — the hero's light field, dimmed and slowed.
 *
 * Reuses the nr-glow keyframes rather than defining new ones, so auth drifts at
 * the same cadence as the landing page. Durations are longer and opacities
 * lower than the hero's: this sits behind a form someone is reading, so it
 * should register as atmosphere, not motion competing for attention.
 *
 * Positioned with left/top, never translate utilities — the keyframes animate
 * `transform`, so a Tailwind -translate-x-1/2 would be overwritten the moment
 * the animation starts and the blob would snap.
 *
 * data-nr-anim opts these into the global prefers-reduced-motion freeze in
 * globals.css, which pins them mid-drift instead of stopping the page dead.
 */
function AuthField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div
        data-nr-anim
        className="absolute left-[8%] top-[14%] h-[760px] w-[760px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(236,48,19,.26),rgba(236,48,19,.06) 46%,rgba(236,48,19,0) 70%)",
          filter: "blur(42px)",
          animation: "nr-glowA 26s ease-in-out infinite",
        }}
      />
      <div
        data-nr-anim
        className="absolute left-[46%] top-[2%] h-[680px] w-[680px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(255,138,92,.18),rgba(255,138,92,.04) 48%,rgba(255,138,92,0) 72%)",
          filter: "blur(50px)",
          animation: "nr-glowB 32s ease-in-out infinite",
        }}
      />
      <div
        data-nr-anim
        className="absolute left-[24%] top-[44%] h-[620px] w-[620px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(255,120,70,.16),rgba(255,120,70,.03) 46%,rgba(255,120,70,0) 70%)",
          filter: "blur(48px)",
          animation: "nr-glowC 29s ease-in-out 4s infinite",
        }}
      />
    </div>
  );
}

/**
 * Centred card used by sign-in, sign-up and activation.
 *
 * The mark is aria-hidden because the visible "norai" text beside it already
 * carries the name — otherwise a screen reader announces it twice.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-[18px] py-[48px]"
      style={{
        // Same warm-to-black ramp the landing page opens with, so arriving here
        // from the nav does not feel like a different product.
        background: "linear-gradient(180deg,#17110f 0%,#0a0a0a 620px)",
      }}
    >
      <AuthField />
      <div aria-hidden className="nr-grain" />

      <div className="relative z-[1] w-full max-w-[380px]">
        <Link
          href="/"
          className="mb-[28px] flex items-center gap-[9px] text-[#f2f2f2]"
        >
          <span aria-hidden>
            <NoraiMark size={20} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.02em]">
            norai
          </span>
        </Link>

        <h1 className="text-[24px] font-semibold tracking-[-0.03em] text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-[8px] text-[13.5px] leading-[1.55] text-[#b4b4b4]">
            {subtitle}
          </p>
        ) : null}

        <div className="mt-[24px]">{children}</div>

        {footer ? (
          <div className="mt-[20px] text-[13px] text-[#b4b4b4]">{footer}</div>
        ) : null}
      </div>
    </main>
  );
}
