import { modules, type SyndicateModule } from "./modules";

const byId: Record<string, SyndicateModule> = Object.fromEntries(
  modules.map((m) => [m.id, m]),
);

const ordered = (ids: string[]): SyndicateModule[] =>
  ids.map((id) => byId[id]).filter((m): m is SyndicateModule => Boolean(m));

// Public marketing header — kept deliberately concise (seat CTA is separate).
export const headerNav: SyndicateModule[] = ordered([
  "home",
  "proof",
  "learning",
  "status",
]).filter((m) => m.visible && m.nav.header);

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
