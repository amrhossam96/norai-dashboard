/** The thin progress/fill bar used across pipeline stages and contribution rows. */
type Tone = "ink" | "grey" | "faint" | "red";

const FILL: Record<Tone, string> = {
  ink: "var(--color-ink)",
  grey: "var(--color-grey-40)",
  faint: "var(--color-grey-88)",
  red: "var(--color-red)",
};

export function Meter({
  value,
  tone = "ink",
  height = 4,
  dark = false,
}: {
  value: number; // 0..1
  tone?: Tone;
  height?: number;
  dark?: boolean;
}) {
  return (
    <div
      className="w-full overflow-hidden rounded-full"
      style={{
        height,
        background: dark ? "var(--color-panel-track)" : "#262626",
      }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.max(0, Math.min(1, value)) * 100}%`,
          background: FILL[tone],
        }}
      />
    </div>
  );
}
