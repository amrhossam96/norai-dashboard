import { StubPage } from "@/components/StubPage";

export default function EnginesPage() {
  return (
    <StubPage
      index="—"
      title="Engines"
      purpose="The four heuristic engines behind every recommendation — their freshness, their inputs, and a one-click recompute."
      rows={[
        { status: "BUILT", text: "Preference — live per-event decayed asymmetric affinity + entity popularity" },
        { status: "BUILT", text: "Similarity — item-item cosine, nightly 02:00 + on-demand recompute" },
        { status: "BUILT", text: "Transitions — session-bigram PMI “what’s next”, nightly 02:30 + on-demand" },
        { status: "PHASE 2", text: "Content match — attribute similarity; dark until a catalog is imported" },
        { status: "BUILT", text: "Admin recompute endpoints return a job id (202) per engine" },
      ]}
    />
  );
}
