// SEO Route Registry — single source of truth for route SEO/indexing posture.
//
// Slice 2.18B (SEO Registry Foundation) created this registry; the sitemap,
// robots disallows, and the guard check are derived from it.
// Slice 2.18C (Per-Route Metadata) now ALSO consumes it at runtime: the
// `SeoHeadManager` component reads the current route, matches it here, and
// harmonizes document.title / description / robots / canonical / OG / Twitter
// tags per route. Helpers below (getRobotsDirective, getCanonicalUrl,
// getOgImageUrl, toAbsoluteUrl, matchRoute) are the contract for that manager.
//
// This is still a client-rendered SPA — runtime metadata improves browser and
// JS-executing-crawler state, but static social/AI preview bots that do not run
// JS may still see the base index.html until SSR/prerender is added later.
//
// Keep this file dependency-free (no imports) so the Node scripts in `scripts/`
// can load it directly via Node's native TypeScript support.

export type SeoRouteType =
  | "PUBLIC"
  | "INTERNAL"
  | "PENDING"
  | "UTILITY"
  | "API"
  | "RETIRED"
  | "UNKNOWN";

export type SeoIndexStatus =
  | "INDEX"
  | "NOINDEX"
  | "INTERNAL"
  | "PENDING"
  | "REDIRECT"
  | "UTILITY";

export type SeoChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SeoRouteEntry {
  /** Route path as declared in the wouter router, or "*" for the catch-all. */
  path: string;
  routeType: SeoRouteType;
  indexStatus: SeoIndexStatus;
  /** Include in sitemap.xml. Must only ever be true when indexStatus === "INDEX". */
  sitemap: boolean;
  /** Document title. Emitted per route by SeoHeadManager (incl. noindex routes — title is not a ranking signal and improves UX). */
  title: string;
  description: string;
  /** Self-canonical path for indexable routes (must start with "/"); null when not indexable. */
  canonicalPath: string | null;
  changefreq?: SeoChangeFreq;
  /** Relative priority hint, 0.0–1.0. */
  priority?: number;
  ogImage?: string;
  ownerSurface: string;
  primaryIntent: string;
  primaryCTA?: string;
  proofRoute?: string;
  notes?: string;
}

/**
 * Canonical origin for The Syndicate (founder-directed).
 * As of Slice 2.18C, `index.html` base OG/Twitter tags and the runtime
 * SeoHeadManager both use this origin (the old `syndicate-os.replit.app`
 * deploy origin is no longer referenced in metadata).
 */
export const CANONICAL_ORIGIN = "https://thesyndicate.money";

/** Default OG/Twitter image (root-relative; made absolute via CANONICAL_ORIGIN). */
export const DEFAULT_OG_IMAGE = "/opengraph.jpg";

/** Twitter card type used across all routes. */
export const TWITTER_CARD_TYPE = "summary_large_image";

/**
 * Every actual route in `src/App.tsx` (14 explicit routes + the catch-all).
 * Routes named only in founder memory but NOT present in the app are
 * intentionally omitted (documented in the slice report, never invented here).
 */
export const seoRouteRegistry: SeoRouteEntry[] = [
  {
    path: "/",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "The Syndicate — Proof-First Membership Protocol",
    description:
      "A read-only foundation for The Syndicate: verifiable membership and public proof. No protocol data is live yet — every unwired value is truth-labelled.",
    canonicalPath: "/",
    changefreq: "weekly",
    priority: 1.0,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "brand",
    primaryIntent: "brand",
    primaryCTA: "Request a seat",
    proofRoute: "/status",
    notes: "Public front door (PublicLayout).",
  },
  {
    path: "/status",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Status — What's Live vs Pending",
    description:
      "The authoritative ledger of what is wired versus posture-only across The Syndicate. Most surfaces are awaiting a verified source today.",
    canonicalPath: "/status",
    changefreq: "weekly",
    priority: 0.8,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "status",
    proofRoute: "/status",
    notes: "Authoritative wiring/status ledger.",
  },
  {
    path: "/proof",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Proof — Verify The Syndicate",
    description:
      "What public, auditable proof will mean for The Syndicate — membership receipts, source attribution, and burn events — and an honest account of why none is wired yet.",
    canonicalPath: "/proof",
    changefreq: "weekly",
    priority: 0.7,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "verify",
    proofRoute: "/proof",
    notes: "Honest proof explainer (no placeholder data). Proof adapters not wired.",
  },
  {
    path: "/member",
    routeType: "PENDING",
    indexStatus: "PENDING",
    sitemap: false,
    title: "Take Your Seat — Membership",
    description:
      "A labelled preview of the future member cockpit. Membership is founder-gated and not live yet; this previews what a seat will involve once the protocol is wired.",
    canonicalPath: null,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "identity",
    primaryIntent: "join",
    proofRoute: "/status",
    notes:
      "Member preview (founder-gated). NOINDEX until membership is live.",
  },
  {
    path: "/learning",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Learn — How The Syndicate Works",
    description:
      "Plain-language education about wallets, transactions, proof, membership, and how to read this honest, read-only foundation.",
    canonicalPath: "/learning",
    changefreq: "weekly",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "education",
    primaryIntent: "education",
    proofRoute: "/status",
    notes: "Real educational content (Slice 2.21A).",
  },
  {
    path: "/recognition",
    routeType: "PENDING",
    indexStatus: "PENDING",
    sitemap: false,
    title: "Recognition",
    description:
      "The recognition model explained as a future concept — structural recognition of verified participation, never a financial reward.",
    canonicalPath: null,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "recognition",
    primaryIntent: "recognition",
    proofRoute: "/status",
    notes: "Concept page. NOINDEX until the model is live.",
  },
  {
    path: "/contracts",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Contracts — Contract & Economy Memory",
    description:
      "Read-only memory of The Syndicate's contracts and economy: roles, lifecycle, and treasury routing structure. Canon reference only — no addresses, balances, or live chain reads.",
    canonicalPath: "/contracts",
    changefreq: "monthly",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "transparency",
    proofRoute: "/status",
    notes: "Posture-only contract memory. No addresses/balances; nothing read live.",
  },
  {
    path: "/source-attribution",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Source Attribution — Verified Introductions",
    description:
      "How The Syndicate recognises a verified introduction — the origin of a join. Attribution is recognition of a growth contribution, never a commission or financial benefit. Nothing is wired today.",
    canonicalPath: "/source-attribution",
    changefreq: "monthly",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "source",
    primaryIntent: "education",
    proofRoute: "/status",
    notes: "Public-safe attribution model. Operator /source stays paused/internal.",
  },
  {
    path: "/support",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Support — Help & Review",
    description:
      "Where help and review requests will live. An honest preview today — nothing is stored, sent, or written to a backend until the intake flow is wired.",
    canonicalPath: "/support",
    changefreq: "monthly",
    priority: 0.4,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "foundation",
    primaryIntent: "support",
    proofRoute: "/status",
    notes: "Intake preview only (no backend write).",
  },
  {
    path: "/archive",
    routeType: "PENDING",
    indexStatus: "PENDING",
    sitemap: false,
    title: "Archive & Chronicle",
    description:
      "The Syndicate's archive and chronicle — protocol memory and milestones. Archive reads are not wired and nothing is minted; this is concept memory today.",
    canonicalPath: null,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "archive",
    primaryIntent: "archive",
    proofRoute: "/status",
    notes: "ARCHIVE_READS_NOT_WIRED. NOINDEX until archive reads are wired.",
  },
  {
    path: "/studio",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: "Studio OS — Operator Console",
    description: "Operator-facing console. Not a public destination.",
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes:
      "INTERNAL: robots disallow is defense-in-depth only — still needs page-level noindex/auth in a later slice.",
  },
  {
    path: "/proof-studio",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: "Proof Studio — Operator",
    description:
      "Draft proof tooling for operators (disabled forms). Not a public destination.",
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: "INTERNAL: operator-only later.",
  },
  {
    path: "/founder",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: "Founder — Operator",
    description: "Founder/operator surface. Not a public destination.",
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: "INTERNAL: auth later.",
  },
  {
    path: "/source",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: "Source — Operator (Paused)",
    description:
      "Source / Verified Introduction surface. Paused; not activated and not public.",
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes:
      "Verified-Introduction PAUSED. INTERNAL: hide from public nav. A future public education page is a separate route, not this one.",
  },
  {
    path: "*",
    routeType: "UTILITY",
    indexStatus: "UTILITY",
    sitemap: false,
    title: "Page Not Found",
    description: "Unknown route fallback.",
    canonicalPath: null,
    ownerSurface: "utility",
    primaryIntent: "utility",
    notes:
      "Catch-all (wouter pathless <Route> → not-found.tsx). Currently returns HTTP 200 (soft-404); true 404 + noindex deferred to Slice 2.18E.",
  },
];

/** Routes that belong in the sitemap: only INDEX routes explicitly flagged sitemap=true. */
export function getSitemapRoutes(
  registry: SeoRouteEntry[] = seoRouteRegistry,
): SeoRouteEntry[] {
  return registry.filter((r) => r.sitemap && r.indexStatus === "INDEX");
}

/** Internal/operator routes that should be disallowed in robots.txt (publicly routable, real path). */
export function getRobotsDisallowRoutes(
  registry: SeoRouteEntry[] = seoRouteRegistry,
): SeoRouteEntry[] {
  return registry.filter(
    (r) => r.routeType === "INTERNAL" && r.path !== "*" && r.path.startsWith("/"),
  );
}

// --- Runtime metadata helpers (consumed by SeoHeadManager, Slice 2.18C) -------
// Pure + dependency-free so the Node guard can also call them.

/**
 * Deterministic `<meta name="robots">` content for a route, by indexStatus:
 * - INDEX            → "index, follow"        (public, indexable)
 * - PENDING          → "noindex, follow"      (not ready; keep links crawlable for when it flips)
 * - INTERNAL/UTILITY → "noindex, nofollow"    (operator / not-found; keep out of the index entirely)
 * - NOINDEX/REDIRECT → "noindex, follow"      (conservative default)
 */
export function getRobotsDirective(entry: SeoRouteEntry): string {
  switch (entry.indexStatus) {
    case "INDEX":
      return "index, follow";
    case "INTERNAL":
    case "UTILITY":
      return "noindex, nofollow";
    case "PENDING":
    case "NOINDEX":
    case "REDIRECT":
    default:
      return "noindex, follow";
  }
}

/** Join the canonical origin with a root-relative path (no double slashes). */
export function toAbsoluteUrl(pathname: string): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return CANONICAL_ORIGIN + (pathname.startsWith("/") ? pathname : `/${pathname}`);
}

/**
 * Absolute self-canonical URL for an indexable route, or null when the route
 * must not advertise a canonical (non-INDEX / no canonicalPath). Returning null
 * tells the head manager to REMOVE any stale canonical left by a prior route.
 */
export function getCanonicalUrl(entry: SeoRouteEntry): string | null {
  if (entry.indexStatus !== "INDEX" || entry.canonicalPath === null) return null;
  return toAbsoluteUrl(entry.canonicalPath);
}

/** Absolute OG/Twitter image URL for a route (falls back to the default image). */
export function getOgImageUrl(entry: SeoRouteEntry): string {
  return toAbsoluteUrl(entry.ogImage ?? DEFAULT_OG_IMAGE);
}

/** Normalize a wouter location to a registry path key (strip trailing slash except root). */
export function normalizeLocation(location: string): string {
  if (!location || location === "") return "/";
  const noQuery = location.split(/[?#]/)[0];
  if (noQuery.length > 1 && noQuery.endsWith("/")) return noQuery.replace(/\/+$/, "");
  return noQuery;
}

/**
 * Match a current location to its registry entry. Exact-path match only (the
 * app has no dynamic/param routes today); anything unmatched falls back to the
 * catch-all "*" entry so unknown routes get noindex metadata.
 */
export function matchRoute(
  location: string,
  registry: SeoRouteEntry[] = seoRouteRegistry,
): SeoRouteEntry {
  const normalized = normalizeLocation(location);
  const exact = registry.find((r) => r.path === normalized);
  if (exact) return exact;
  const catchAll = registry.find((r) => r.path === "*");
  if (catchAll) return catchAll;
  // Defensive: a registry without a catch-all still returns a noindex-able shape.
  return {
    path: normalized,
    routeType: "UNKNOWN",
    indexStatus: "UTILITY",
    sitemap: false,
    title: "Page Not Found",
    description: "Unknown route fallback.",
    canonicalPath: null,
    ownerSurface: "utility",
    primaryIntent: "utility",
  };
}

/**
 * Resolved per-route head metadata. `canonical` is null when the route must not
 * advertise a canonical; `ogUrl` is always present (canonical when indexable,
 * else the route's own absolute URL).
 */
export interface ResolvedRouteHead {
  title: string;
  description: string;
  robots: string;
  canonical: string | null;
  ogUrl: string;
  ogImage: string;
  twitterCard: string;
}

/** Resolve every head value for a location in one call (used by SeoHeadManager). */
export function resolveRouteHead(location: string): ResolvedRouteHead {
  const entry = matchRoute(location);
  const canonical = getCanonicalUrl(entry);
  const ownPath = entry.canonicalPath ?? normalizeLocation(location);
  return {
    title: entry.title,
    description: entry.description,
    robots: getRobotsDirective(entry),
    canonical,
    ogUrl: canonical ?? toAbsoluteUrl(ownPath),
    ogImage: getOgImageUrl(entry),
    twitterCard: TWITTER_CARD_TYPE,
  };
}

// --- Wayfinding helpers (consumed by RouteContextBar, Slice 2.18G) ------------
// Derive breadcrumb labels + a calm, human-readable route posture/index status
// from the EXISTING registry fields. This adds NO second route truth: every value
// below is a projection of `routeType` / `indexStatus` / `title` already declared
// above. Pure + dependency-free so the registry stays Node-loadable.

/** Human-readable route posture, projected from `routeType`. */
export type RoutePosture = "Public" | "Pending" | "Internal" | "Utility";

const ROUTE_POSTURE_BY_TYPE: Record<SeoRouteType, RoutePosture> = {
  PUBLIC: "Public",
  PENDING: "Pending",
  INTERNAL: "Internal",
  UTILITY: "Utility",
  API: "Internal",
  RETIRED: "Internal",
  UNKNOWN: "Utility",
};

/** Calm posture label for a route ("Public" / "Pending" / "Internal" / "Utility"). */
export function getRoutePostureLabel(entry: SeoRouteEntry): RoutePosture {
  return ROUTE_POSTURE_BY_TYPE[entry.routeType] ?? "Utility";
}

/** Human-readable indexing status, projected from `indexStatus`. */
export type RouteIndexLabel =
  | "Indexed"
  | "Noindex"
  | "Internal"
  | "Pending"
  | "Utility";

const ROUTE_INDEX_LABEL: Record<SeoIndexStatus, RouteIndexLabel> = {
  INDEX: "Indexed",
  NOINDEX: "Noindex",
  INTERNAL: "Internal",
  PENDING: "Pending",
  REDIRECT: "Noindex",
  UTILITY: "Utility",
};

/** Calm index-status label for a route ("Indexed" / "Noindex" / ...). */
export function getRouteIndexLabel(entry: SeoRouteEntry): RouteIndexLabel {
  return ROUTE_INDEX_LABEL[entry.indexStatus] ?? "Utility";
}

/**
 * Short wayfinding label for a route, derived from its SEO `title` (the segment
 * before a separating em/en dash, e.g. "Status — What's Live" → "Status").
 * Falls back to the full title when there is no separator.
 */
export function getRouteLabel(entry: SeoRouteEntry): string {
  const lead = entry.title.split(/\s+[—–-]\s+/)[0]?.trim();
  return lead && lead.length > 0 ? lead : entry.title;
}

/** Resolve the registry entry for a path (thin, named alias over `matchRoute`). */
export function getRouteSeoByPath(
  location: string,
  registry: SeoRouteEntry[] = seoRouteRegistry,
): SeoRouteEntry {
  return matchRoute(location, registry);
}

/** A single breadcrumb crumb (label + the path it links to). */
export interface RouteCrumb {
  label: string;
  path: string;
}

/** Resolved breadcrumb + posture context for the current location. */
export interface RouteBreadcrumb {
  /** Root crumb — always points at the public front door. */
  home: RouteCrumb;
  /** Current-page crumb, or null when the location IS the home route. */
  current: RouteCrumb | null;
  posture: RoutePosture;
  indexLabel: RouteIndexLabel;
  isHome: boolean;
  isNotFound: boolean;
}

/**
 * Resolve breadcrumb + posture/index context for a location in one call.
 * The trail is intentionally shallow (Home → current) because the app has a flat
 * route table — there are no nested route segments to model.
 */
export function getRouteBreadcrumb(location: string): RouteBreadcrumb {
  const normalized = normalizeLocation(location);
  const entry = matchRoute(normalized);
  const isHome = entry.path === "/";
  const isNotFound = entry.path === "*";
  return {
    home: { label: "Home", path: "/" },
    current: isHome
      ? null
      : { label: getRouteLabel(entry), path: isNotFound ? normalized : entry.path },
    posture: getRoutePostureLabel(entry),
    indexLabel: getRouteIndexLabel(entry),
    isHome,
    isNotFound,
  };
}
