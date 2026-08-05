import { StubPage } from "@/components/StubPage";

export default function PlaygroundPage() {
  return (
    <StubPage
      index="02"
      title="Playground"
      purpose="Where trust is won. Ask for a rec as any user, on any surface, and see the whole trace — invoke and explain, per-item."
      rows={[
        { status: "BUILT", text: "playground/invoke + explain; pipeline reasons per item" },
        { status: "UX", text: "Three depths of why: chip → contribution bars → full stage trace (default: chip)" },
        { status: "UX", text: "Weight sliders that re-rank instantly, then “save as surface rule”" },
        { status: "UX", text: "Side-by-side diff: current config vs proposed — the merchandiser’s safety net" },
        { status: "BACKEND", text: "Playground has no pipeline case yet; needs ?surface= and a dry-run mode" },
      ]}
    />
  );
}
