import { StubPage } from "@/components/StubPage";

export default function EventsPage() {
  return (
    <StubPage
      index="—"
      title="Event stream"
      purpose="The live ingest tail — every event as it lands, the entity it resolved to, and the interaction strength it scored."
      rows={[
        { status: "BUILT", text: "Paginated event read model with polarity, weight, signals and interaction_strength" },
        { status: "BUILT", text: "Single + batch ingest with a human-readable event-shape validator" },
        { status: "UX", text: "Live “waiting for your first event” state that flips the moment ingest sees one" },
        { status: "BACKEND", text: "Dropped-ClickHouse-writes counter (gap G6) — the health card is lying until this exists" },
      ]}
    />
  );
}
