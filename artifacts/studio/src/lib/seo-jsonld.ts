// Organization JSON-LD — the SINGLE source of the homepage structured data.
//
// Slice 2.0 (rendering fix) extracted this from SeoHeadManager so BOTH the
// runtime manager AND the build-time prerender (scripts/prerender-routes.ts)
// emit the exact same payload from one place — no parallel truth.
//
// Facts are limited to what is publicly true and stable: name, canonical URL,
// logo, and the official social profiles (sameAs). NO financial/membership
// claims and ZERO chain figures — nothing here is a live read.
//
// Imports use relative `.ts` paths (not the `@/` alias) so Node's native
// TypeScript loader can import this from `scripts/` exactly like the sibling
// SEO scripts do; the sources it pulls from are both dependency-free.
import { brand, socialLinks } from "../config/brand.ts";
import {
  CANONICAL_ORIGIN,
  getRouteBreadcrumb,
  getRouteSeoByPath,
  toAbsoluteUrl,
} from "./seo-route-registry.ts";

/** Shared DOM id for the injected script tag — the client reuses the prerendered node. */
export const ORG_JSONLD_ID = "seo-jsonld-org";
/** Shared DOM id for the WebSite JSON-LD (homepage only). */
export const WEBSITE_JSONLD_ID = "seo-jsonld-website";
/** Shared DOM id for the per-route BreadcrumbList JSON-LD (INDEX routes off-home). */
export const BREADCRUMB_JSONLD_ID = "seo-jsonld-breadcrumb";

/** Build the Organization JSON-LD object (stable key order = stable serialization). */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: `${CANONICAL_ORIGIN}/`,
    logo: `${CANONICAL_ORIGIN}/opengraph.jpg`,
    sameAs: socialLinks.map((link) => link.href),
  };
}

/** Serialized Organization JSON-LD for injection into a <script> tag. */
export function serializeOrganizationJsonLd(): string {
  return JSON.stringify(buildOrganizationJsonLd());
}

// ── AUD-ROUTE (2026-07-17): WebSite + BreadcrumbList — the two standard
// blocks the audit found missing. Same single-source discipline as ORG:
// one builder, consumed by BOTH the prerender and the runtime manager.
// Deliberately NO SearchAction on WebSite — the site has no search endpoint;
// declaring one would be an invented capability.

/** Build the WebSite JSON-LD object (homepage only — the SERP site-name signal). */
export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: `${CANONICAL_ORIGIN}/`,
  };
}

/** Serialized WebSite JSON-LD for injection into a <script> tag. */
export function serializeWebSiteJsonLd(): string {
  return JSON.stringify(buildWebSiteJsonLd());
}

/**
 * Build the BreadcrumbList JSON-LD for a location, or null when the route
 * should carry none (home itself, not-found, and every non-INDEX route — a
 * noindex page gains nothing from advertising structured data). The trail is
 * Home → current, mirroring the visible RouteContextBar breadcrumb, both
 * projected from the SAME registry truth (getRouteBreadcrumb).
 */
export function buildBreadcrumbJsonLd(
  location: string,
): Record<string, unknown> | null {
  const entry = getRouteSeoByPath(location);
  if (entry.indexStatus !== "INDEX") return null;
  const crumb = getRouteBreadcrumb(location);
  if (crumb.isHome || crumb.isNotFound || crumb.current === null) return null;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: crumb.home.label,
        item: toAbsoluteUrl(crumb.home.path),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: crumb.current.label,
        item: toAbsoluteUrl(crumb.current.path),
      },
    ],
  };
}

/** Serialized BreadcrumbList JSON-LD, or null when the route carries none. */
export function serializeBreadcrumbJsonLd(location: string): string | null {
  const payload = buildBreadcrumbJsonLd(location);
  return payload === null ? null : JSON.stringify(payload);
}
