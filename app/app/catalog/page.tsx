import { StubPage } from "@/components/StubPage";

export default function CatalogPage() {
  return (
    <StubPage
      index="04"
      title="Catalog"
      purpose="Unlocks day-one cold-start and turns explanations from crowd-based to attribute-based. Until it lands, a visitor with no history is served popularity."
      rows={[
        { status: "PHASE 2", text: "CSV / API import with column mapping and a dry-run preview" },
        { status: "PHASE 2", text: "Attribute health: % of items with category, price band, tags — coverage drives quality" },
        { status: "UX", text: "Entity detail: who it is recommended to, what it is similar to, what follows it" },
      ]}
      cta="No catalog connected. Import one to turn on content-attribute cold-start — a brand-new SKU with zero events gets an explainable rec from day one."
    />
  );
}
