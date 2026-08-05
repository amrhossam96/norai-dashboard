/**
 * Sidebar navigation, matching direction 2a. SERVE items carry a mono 01–04
 * index; INSPECT/SETTINGS are unnumbered. `badge` renders the small "live" tag.
 */
export interface NavItem {
  label: string;
  href: string;
  index?: string; // "01".."04" for the SERVE group
  badge?: string; // e.g. "live"
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Serve",
    items: [
      { label: "Pipeline", href: "/app", index: "01" },
      { label: "Playground", href: "/app/playground", index: "02" },
      { label: "Surfaces", href: "/app/surfaces", index: "03" },
      { label: "Catalog", href: "/app/catalog", index: "04" },
    ],
  },
  {
    title: "Inspect",
    items: [
      { label: "Users & identity", href: "/app/users" },
      { label: "Event stream", href: "/app/events", badge: "live" },
      { label: "Engines", href: "/app/engines" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "API keys", href: "/app/api-keys" },
      { label: "Team & audit log", href: "/app/team" },
    ],
  },
];
