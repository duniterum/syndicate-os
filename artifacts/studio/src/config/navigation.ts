import { modules, type SyndicateModule } from "./modules";

const byId: Record<string, SyndicateModule> = Object.fromEntries(
  modules.map((m) => [m.id, m]),
);

const ordered = (ids: string[]): SyndicateModule[] =>
  ids.map((id) => byId[id]).filter((m): m is SyndicateModule => Boolean(m));

export const headerNav: SyndicateModule[] = ordered([
  "home",
  "proof",
  "studio",
  "status",
]).filter((m) => m.visible && m.nav.header);

export const footerNav: SyndicateModule[] = ordered([
  "proof",
  "studio",
  "status",
]).filter((m) => m.visible && m.nav.footer);

export const sidebarNav: SyndicateModule[] = modules.filter(
  (m) => m.visible && m.nav.sidebar,
);

export const navLabel = (
  m: SyndicateModule,
  surface: "header" | "sidebar" | "footer",
): string => (surface === "sidebar" && m.sidebarLabel ? m.sidebarLabel : m.label);
