import { StubPage } from "@/components/StubPage";

export default function SurfacesPage() {
  return (
    <StubPage
      index="03"
      title="Surfaces & merchandising rules"
      purpose="The #1 retailer buying reason, and today entirely inert (gap G8). Rules a non-technical audience can write and trust."
      rows={[
        { status: "PHASE 3", text: "Rules schema UI: weights, exclude_seen, boosts, pins, include/exclude, diversity" },
        { status: "UX", text: "Rules as plain sentences — “boost in-stock items under 25 min ×1.2” — not JSON" },
        { status: "UX", text: "Every rule shows its blast radius before save: “changes 31% of home-feed slots”" },
        { status: "UX", text: "Rule effects appear in the “why” — merchandising must stay explainable" },
        { status: "PHASE 3", text: "Needs surfaces.GetBySlug + Surface→Request mapping to exist at all" },
      ]}
      cta="Surfaces are stored today but never enforced. This is the deferred half of the personalization layer — the pipeline reads query params, not surface rules, until Phase 3 lands."
    />
  );
}
