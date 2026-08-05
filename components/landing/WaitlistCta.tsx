import { WaitlistForm } from "./WaitlistForm";

export function WaitlistCta() {
  return (
    <div
      id="waitlist"
      className="mx-auto max-w-[1200px] px-[18px] pt-[52px] md:px-[28px] md:pt-[76px]"
      style={{ scrollMarginTop: 70 }}
    >
      <div
        data-reveal
        className="relative overflow-hidden rounded-[16px] border border-[#2a2a2a] px-[20px] py-[34px] md:px-[44px] md:py-[56px]"
        style={{
          background:
            "radial-gradient(90% 130% at 88% -10%,#3a221c 0%,#0d0d0d 52%)",
        }}
      >
        {/* travelling beam along the top edge */}
        <div className="absolute left-0 right-0 top-0 h-[2px] overflow-hidden">
          <div
            data-nr-anim
            className="absolute top-0 h-[2px] w-[120px]"
            style={{
              background:
                "linear-gradient(90deg,rgba(236,48,19,0),#ec3013,rgba(236,48,19,0))",
              animation: "nr-travel 5s linear infinite",
            }}
          />
        </div>

        <div className="max-w-[640px]">
          <div className="font-mono text-[9.5px] font-medium tracking-[0.14em] text-[#7a7a7a]">
            PRIVATE BETA
          </div>
          <h2 className="mt-[14px] text-[29px] font-semibold leading-[1.12] tracking-[-0.03em] text-white text-balance sm:text-[35px] md:text-[44px] md:leading-[1.08] md:tracking-[-0.04em]">
            Let us prove it on your catalog.
          </h2>
          <p className="mt-[14px] text-[14.5px] leading-[1.6] text-[#a8a8a8] text-pretty md:mt-[16px] md:text-[16px]">
            We are starting with a small number of teams. Send us a week of events
            and we will stand up your environment, wire up the engines, and walk
            you through the reason behind every recommendation it serves.
          </p>

          <div className="mt-[28px]">
            <WaitlistForm variant="cta">
              {/* TODO: no contact endpoint exists on the backend yet, and there is
                  no published address to link — this is still a no-op. */}
              <a
                href="#waitlist"
                className="cta cta-ghost cta-tall"
              >
                Talk to us
              </a>
            </WaitlistForm>
          </div>

          <div className="mt-[18px] flex gap-[22px] font-mono text-[11.5px] text-[#6e6e6e]">
            <span>no card</span>
            <span>no minimum volume</span>
            <span>your data stays yours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
