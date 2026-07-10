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

// Zones: "primary" renders as a top-level header link; "more" collapses into
// the one-step "More" dropdown. ONE spec array keeps the curation (and the
// surface-audit textual parse) in a single place — 3 primary + 5 more = 8.
const headerSpec: { id: string; label: string; zone: "primary" | "more" }[] = [
  { id: "proof", label: "Protocol", zone: "primary" },
  { id: "contracts", label: "Economy", zone: "primary" },
  { id: "member", label: "Membership", zone: "primary" },
  { id: "archive", label: "Chronicle", zone: "more" },
  { id: "recognition", label: "Recognition", zone: "more" },
  { id: "join", label: "Join", zone: "more" },
  { id: "learning", label: "Docs", zone: "more" },
  { id: "status", label: "Status", zone: "more" },
];

const buildHeaderNav = (zone: "primary" | "more"): HeaderNavItem[] =>
  headerSpec
    .filter((s) => s.zone === zone)
    .map((s) => {
      const m = byId[s.id];
      return m && m.visible ? { id: m.id, path: m.path, label: s.label } : null;
    })
    .filter((x): x is HeaderNavItem => x !== null);

export const headerNavPrimary: HeaderNavItem[] = buildHeaderNav("primary");
export const headerNavMore: HeaderNavItem[] = buildHeaderNav("more");

/** Full curated header list (mobile sheet + audits) — primary first, then more. */
export const headerNav: HeaderNavItem[] = [...headerNavPrimary, ...headerNavMore];

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
  { heading: "Protocol", itemIds: ["proof", "map", "status", "contracts", "source-attribution"] },
  { heading: "Learn", itemIds: ["whitepaper", "tokenomics", "faq", "learning", "recognition", "archive"] },
  { heading: "Membership", itemIds: ["member", "join", "source-link", "support"] },
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
