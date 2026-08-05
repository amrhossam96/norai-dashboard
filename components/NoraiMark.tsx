/**
 * The norai brandmark — a single "N" glyph. Uses `fill: currentColor`, so it
 * takes the text colour of whatever lockup it sits in (white on the dark
 * chrome; set the parent's colour to red for an accent treatment).
 */
const NATIVE_W = 284.3811;
const NATIVE_H = 261.536;

export function NoraiMark({
  size = 20,
  className,
}: {
  /** Rendered height in px; width scales to preserve the mark's aspect. */
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="92.902 -417.5753 284.3811 261.536"
      width={(size * NATIVE_W) / NATIVE_H}
      height={size}
      className={className}
      fill="currentColor"
      role="img"
      aria-label="norai"
    >
      <path
        d="M 422.51 641.38 C404.26,636.97 386.25,622.62 378.12,606.00 C370.86,591.15 370.91,591.96 371.22,511.19 L 371.50 439.50 L 374.22 431.50 C378.14,420.02 383.40,411.57 392.01,403.00 C400.85,394.19 411.59,387.74 423.38,384.15 C434.72,380.71 453.80,380.55 465.31,383.81 C487.82,390.19 503.42,403.78 517.18,429.00 C522.26,438.31 542.88,474.61 579.37,538.49 L 596.50 568.49 L 596.76 475.23 L 597.01 381.97 L 626.26 382.23 L 655.50 382.50 L 655.50 492.00 L 655.50 601.50 L 653.29 608.50 C648.02,625.20 635.47,637.04 618.30,641.51 C614.12,642.60 606.98,643.00 591.86,643.00 L 571.13 643.00 L 567.75 636.75 C563.80,629.46 516.07,546.39 475.44,476.11 C460.74,450.68 459.08,448.92 449.08,448.20 C441.75,447.67 436.13,450.34 432.25,456.20 L 429.50 460.35 L 429.50 512.09 L 429.50 563.83 L 432.51 568.12 C438.39,576.48 438.31,576.46 473.75,576.80 L 505.00 577.11 L 505.00 586.84 C505.00,603.85 500.34,615.57 489.00,627.09 C481.99,634.22 473.97,638.73 463.47,641.47 C455.76,643.47 430.95,643.42 422.51,641.38 Z"
        transform="matrix(1, 0, 0, 1, -278.2169189453125, -799.0392456054688)"
      />
    </svg>
  );
}
