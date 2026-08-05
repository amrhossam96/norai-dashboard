import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "norai — dashboard",
  description:
    "Glassbox recommendations. Every result carries a why. One request, every layer.",
};

/**
 * Without this a phone assumes a ~980px desktop viewport and renders the whole
 * page zoomed out. Note there is no maximum-scale or user-scalable=false here —
 * blocking pinch-zoom is an accessibility failure.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // data-scroll-behavior: Next 16 no longer suppresses `scroll-behavior: smooth`
  // during route changes. Without it, navigating to another route would also
  // smooth-scroll to the top, which reads as a stuck page. This opts back into
  // the old override so only in-page anchors ease.
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
