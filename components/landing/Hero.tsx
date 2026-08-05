import { SignalScene } from "./SignalScene";

/** Ambient recommendation "field" behind the hero — warm light blooming out of
 * the dark, masked to fade before it reaches the content below. */
function HeroField() {
  const maskFade = "linear-gradient(180deg,#000 0,#000 52%,transparent 92%)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-[-120px] right-[-120px] top-[-260px] z-0 h-[1180px]"
      style={{ WebkitMaskImage: maskFade, maskImage: maskFade }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 62% 34%,rgba(236,48,19,.2),rgba(236,48,19,.03) 52%,rgba(236,48,19,0) 76%)",
        }}
      />
      <div
        data-nr-anim
        className="absolute left-[2%] top-[14%] h-[760px] w-[760px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(236,48,19,.46),rgba(236,48,19,.12) 46%,rgba(236,48,19,0) 70%)",
          filter: "blur(32px)",
          animation: "nr-glowA 15s ease-in-out infinite",
        }}
      />
      <div
        data-nr-anim
        className="absolute left-[46%] top-[4%] h-[820px] w-[820px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(255,138,92,.3),rgba(255,138,92,.06) 48%,rgba(255,138,92,0) 72%)",
          filter: "blur(40px)",
          animation: "nr-glowB 19s ease-in-out infinite",
        }}
      />
      <div
        data-nr-anim
        className="absolute left-[24%] top-[30%] h-[700px] w-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(255,120,70,.2),rgba(255,120,70,.04) 46%,rgba(255,120,70,0) 70%)",
          filter: "blur(44px)",
          animation: "nr-glowC 17s ease-in-out infinite",
        }}
      />
      <div
        data-nr-anim
        className="absolute left-[68%] top-[36%] h-[560px] w-[560px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 50% 50%,rgba(236,48,19,.36),rgba(236,48,19,.05) 48%,rgba(236,48,19,0) 72%)",
          filter: "blur(36px)",
          animation: "nr-glowA 21s ease-in-out 3s infinite",
        }}
      />
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-x-clip">
      {/* Full-bleed ambient field — spans the viewport, not the content column.
          overflow-x-clip (not overflow-hidden) keeps the vertical axis visible so
          the field can bleed up behind the transparent sticky nav — otherwise the
          top ~nav-height band clips to bare body and reads as a dark strip. */}
      <HeroField />

      <div
        id="top"
        className="relative mx-auto max-w-[1200px] px-[18px] pt-[58px] md:px-[28px] md:pt-[68px]"
      >
        <div className="relative z-[1]">
          <div className="max-w-[760px]">
            <div
              className="inline-flex items-center gap-[8px] rounded-full border border-[#2a2a2a] bg-[#151515] px-[12px] py-[5px]"
              style={{ animation: "nr-rise .6s both" }}
            >
              <span
                data-nr-anim
                className="h-[6px] w-[6px] rounded-full bg-red"
                style={{ animation: "nr-blink 2s infinite" }}
              />
              <span className="text-[11.5px] font-medium text-[#b4b4b4]">
                Private beta · limited access
              </span>
            </div>

            <h1
              className="mt-[20px] text-[36px] font-semibold leading-[1.08] tracking-[-0.035em] text-white text-balance sm:text-[46px] lg:mt-[20px] lg:text-[54px] lg:leading-[1.04] lg:tracking-[-0.042em]"
              style={{ animation: "nr-rise .7s .06s both" }}
            >
              Recommendations that{" "}
              <em className="font-medium italic tracking-[-0.03em]">
                explain themselves
              </em>
              .
            </h1>

            <p
              className="mt-[18px] max-w-[640px] text-[15.5px] leading-[1.6] text-[#b4b4b4] text-pretty md:mt-[20px] md:text-[18px] md:leading-[1.55]"
              style={{ animation: "nr-rise .7s .14s both" }}
            >
              Works on a brand-new visitor, runs on one API call, and tells you{" "}
              <i>why</i> it picked every item. No ML team, no black box.
            </p>
            <div
              className="mt-[24px] flex flex-wrap items-center gap-[10px]"
              style={{ animation: "nr-rise .7s .22s both" }}
            >
              <a href="#waitlist" className="cta cta-accent cta-tall">
                Join the waitlist
              </a>
              <a href="#docs" className="cta cta-ghost cta-tall">
                See a sample request
              </a>
            </div>

            <div
              className="mt-[16px] flex flex-wrap gap-[18px] font-mono text-[12px] text-[#6e6e6e]"
              style={{ animation: "nr-rise .7s .3s both" }}
            >
              <span>no model to train</span>
              <span>one endpoint</span>
              <span>works on visitor #1</span>
              <span>every result carries a reason</span>
            </div>
          </div>

          <SignalScene />
        </div>
      </div>
    </section>
  );
}
