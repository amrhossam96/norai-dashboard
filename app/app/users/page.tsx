import { StubPage } from "@/components/StubPage";

export default function UsersPage() {
  return (
    <StubPage
      index="05"
      title="Users & identity inspector"
      purpose="Debugging one real person is the fastest way to believe (or disprove) the system."
      rows={[
        { status: "BUILT", text: "Identity map: anon ids stitched to a user id; app-user read with derived profile" },
        { status: "BUILT", text: "RTBF erase across Postgres + ClickHouse (returns 204)" },
        { status: "BACKEND", text: "Session timeline and affinity table have no read endpoint yet — internal only" },
        { status: "BACKEND", text: "Erase confirmation receipt — the delete returns an empty 204 today" },
        { status: "UX", text: "“What would this user see right now?” — runs the pipeline inline from the profile" },
        { status: "UX", text: "Affinity decay shown as a curve over time, not a number — makes decay legible" },
      ]}
    />
  );
}
