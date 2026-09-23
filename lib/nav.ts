/**
 * Sidebar navigation. SERVE items carry a mono 01–04 index; INSPECT/SETTINGS
 * are unnumbered.
 */
export interface NavItem {
  label: string;
  href: string;
  index?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Serve",
    items: [
      { label: "Overview", href: "/app", index: "01" },
      { label: "Playground", href: "/app/playground", index: "02" },
      { label: "Surfaces", href: "/app/surfaces", index: "03" },
      { label: "Catalog", href: "/app/catalog", index: "04" },
    ],
  },
  {
    title: "Inspect",
    items: [
      { label: "Users", href: "/app/users" },
      { label: "Readiness", href: "/app/diagnostics" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "Configuration", href: "/app/config" },
      { label: "API keys", href: "/app/api-keys" },
      { label: "Team & audit log", href: "/app/team" },
    ],
  },
];
