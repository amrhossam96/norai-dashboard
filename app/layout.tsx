import type { Metadata, Viewport } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/brand";
import "./globals.css";

/**
 * Site-wide defaults. `metadataBase` is what lets Next turn the generated
 * `/opengraph-image` and `/icon.svg` paths into the absolute URLs that
 * Twitter, Slack and Google require; without it there is no social card at
 * all and Google falls back to a generic favicon. Pages override `title` and
 * `description`; openGraph/twitter fall back to those when a page sets none.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} — dashboard`,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
  },
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
          href="https://fonts.googleapis.com/css2?family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600&family=Instrument+Serif:ital@0;1&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
