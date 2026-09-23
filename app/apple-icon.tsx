import { ImageResponse } from "next/og";
import { MARK_PATH, MARK_TRANSFORM, MARK_VIEWBOX } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
        }}
      >
        <svg width="118" height="108.5" viewBox={MARK_VIEWBOX}>
          <path fill="#f2f2f2" transform={MARK_TRANSFORM} d={MARK_PATH} />
        </svg>
      </div>
    ),
    size,
  );
}
