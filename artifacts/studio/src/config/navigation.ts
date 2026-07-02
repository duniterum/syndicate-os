import { modules, type SyndicateModule } from "./modules";

const byId: Record<string, SyndicateModule> = Object.fromEntries(
  modules.map((m) => [m.id, m]),
);

const ordered = (ids: string[]): SyndicateModule[] =>
  ids.map((id) => byId[id]).filter((m): m is SyndicateModule => Boolean(m));

// Public marketing header — institutional wayfinding into the REAL modules.
// The single route source of truth stays in modules.ts; this only curates
// which modules appear in the header and how they read (no parallel routes).
export interface HeaderNavItem {
  id: string;
  path: string;
  label: string;
}

const headerSpec: { id: string; label: string }[] = [
  { id: "proof", label: "Protocol" },
  { id: "contracts", label: "Economy" },
  { id: "archive", label: "Chronicle" },
  { id: "recognition", label: "Recognition" },
  { id: "member", label: "Membership" },
  { id: "learning", label: "Docs" },
  { id: "status", label: "Status" },
];

export const headerNav: HeaderNavItem[] = headerSpec
  .map((s) => {
    const m = byId[s.id];
    return m && m.visible ? { id: m.id, path: m.path, label: s.label } : null;
  })
  .filter((x): x is HeaderNavItem => x !== null);

// Operator console sidebar — operator surfaces only.
export const sidebarNav: SyndicateModule[] = modules.filter(
  (m) => m.visible && m.nav.sidebar,
);

// Public footer, grouped. Each group references module ids so the footer stays
// registry-driven (no hardcoded link islands).
export interface FooterGroup {
  heading: string;
  items: SyndicateModule[];
}

const footerGroupSpec: { heading: string; itemIds: string[] }[] = [
  { heading: "Protocol", itemIds: ["proof", "status", "contracts", "source-attribution"] },
  { heading: "Learn", itemIds: ["learning", "recognition", "archive"] },
  { heading: "Membership", itemIds: ["member", "support"] },
  { heading: "Console", itemIds: ["studio"] },
];

export const footerGroups: FooterGroup[] = footerGroupSpec.map((g) => ({
  heading: g.heading,
  items: ordered(g.itemIds).filter((m) => m.visible && m.nav.footer),
}));

export const navLabel = (
  m: SyndicateModule,
  surface: "header" | "sidebar" | "footer",
): string => (surface === "sidebar" && m.sidebarLabel ? m.sidebarLabel : m.label);
