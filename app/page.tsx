import type { Metadata } from "next";
import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { BuiltFor } from "@/components/landing/BuiltFor";
import { HardParts } from "@/components/landing/HardParts";
import { DashboardShowcase } from "@/components/landing/DashboardShowcase";
import { DocsSection } from "@/components/landing/DocsSection";
import { Faq } from "@/components/landing/Faq";
import { WaitlistCta } from "@/components/landing/WaitlistCta";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingMotion } from "@/components/landing/LandingMotion";
import { CursorLight } from "@/components/landing/CursorLight";
import { SignalSceneMotion } from "@/components/landing/SignalSceneMotion";

export const metadata: Metadata = {
  title: "norai — recommendations that explain themselves",
  description:
    "Personalization that works on a brand-new visitor, runs on one API call, and tells you why it picked every item. No ML team, no six-month build, no black box.",
};

export default function LandingPage() {
  return (
    <div
      className="min-h-screen text-[#f2f2f2]"
      style={{
        background: "linear-gradient(180deg,#17110f 0%,#0a0a0a 640px)",
      }}
    >
      <CursorLight />
      <div aria-hidden className="nr-grain" />

      {/* Above the fixed cursor bloom, which paints at z-0. */}
      <div className="relative z-[1]">
        <LandingNav />
        <Hero />
        <BuiltFor />
        <HardParts />
        <DashboardShowcase />
        <DocsSection />
        <Faq />
        <WaitlistCta />
        <LandingFooter />
      </div>

      <LandingMotion />
      <SignalSceneMotion />
    </div>
  );
}
