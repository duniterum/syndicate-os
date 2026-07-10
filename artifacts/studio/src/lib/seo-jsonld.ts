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
import { CANONICAL_ORIGIN } from "./seo-route-registry.ts";

/** Shared DOM id for the injected script tag — the client reuses the prerendered node. */
export const ORG_JSONLD_ID = "seo-jsonld-org";

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
