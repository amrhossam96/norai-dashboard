import { ImageResponse } from "next/og";
import {
  MARK_PATH,
  MARK_TRANSFORM,
  MARK_VIEWBOX,
  SITE_DESCRIPTION,
  SITE_TAGLINE,
} from "@/lib/brand";

export const alt = `norai — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social card. Mirrors the landing hero: warm-to-black gradient, the N mark
 * beside the wordmark, the tagline, and the red accent as a single dot. The
 * renderer ships only a regular sans face (no Archivo, no italic), so the
 * layout is set to read well in that rather than depending on webfonts.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(180deg, #17110f 0%, #0a0a0a 70%)",
          color: "#f2f2f2",
          fontFamily:
            'Inter, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="44" height="40.5" viewBox={MARK_VIEWBOX}>
            <path fill="#f2f2f2" transform={MARK_TRANSFORM} d={MARK_PATH} />
          </svg>
          <div
            style={{ fontSize: 34, fontWeight: 600, letterSpacing: "-0.02em" }}
          >
            norai
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 78,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: "-0.04em",
              maxWidth: 1000,
            }}
          >
            <span>Recommendations that&nbsp;</span>
            <span>explain themselves</span>
            <span style={{ color: "#ec3013" }}>.</span>
          </div>
          <div
            style={{
              fontSize: 27,
              lineHeight: 1.45,
              color: "#b4b4b4",
              maxWidth: 900,
            }}
          >
            {SITE_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#8a8a8a",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              background: "#ec3013",
            }}
          />
          norai.dev · Private beta
        </div>
      </div>
    ),
    size,
  );
}
