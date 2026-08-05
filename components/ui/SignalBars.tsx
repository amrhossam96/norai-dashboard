/**
 * The 4-bar signal spark on each recommendation row. Bar position maps to a
 * fixed shade — [affinity=ink, similarity=grey, transitions=faint, popularity=faint]
 * — so the same colours mean the same signals on every row.
 */
const SHADES = [
  "var(--color-ink)",
  "var(--color-grey-40)",
  "var(--color-grey-88)",
  "var(--color-grey-88)",
];

export function SignalBars({
  values,
  height = 20,
}: {
  values: number[]; // 0..100 per bar
  height?: number;
}) {
  return (
    <div className="flex items-end gap-[2px]" style={{ height }}>
      {values.map((v, i) => (
        <div
          key={i}
          className="rounded-[1px]"
          style={{
            width: 7,
            height: `${Math.max(2, Math.min(100, v))}%`,
            background: SHADES[i % SHADES.length],
          }}
        />
      ))}
    </div>
  );
}
