// SeoHeadManager — Slice 2.18C per-route document metadata for the SPA.
//
// Reads the current wouter location, resolves the matching entry from the SEO
// route registry (the single source of truth), and harmonizes document.title,
// description, robots, canonical, and OG/Twitter tags on every navigation.
//
// HONEST SCOPE (truthed by AUD-ROUTE, 2026-07-17): this is the RUNTIME half of
// a two-half system — every build also bakes the same registry head into flat
// per-route shells (scripts/prerender-routes.ts), so non-JS bots read real
// metadata; this manager keeps the head correct across CLIENT navigations.
// This component renders nothing.

import { useEffect } from "react";
import { useLocation } from "wouter";
import { resolveRouteHead } from "@/lib/seo-route-registry";
import { OG_IMAGE_ALT, OG_LOCALE, OG_SITE_NAME, X_HANDLE } from "@/config/brand";
import {
  serializeOrganizationJsonLd,
  serializeWebSiteJsonLd,
  serializeBreadcrumbJsonLd,
  ORG_JSONLD_ID,
  WEBSITE_JSONLD_ID,
  BREADCRUMB_JSONLD_ID,
} from "@/lib/seo-jsonld";

/** Create-or-update a <meta name="..."> tag. Tags we create are marked managed. */
function upsertMetaByName(name: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Create-or-update a <meta property="..."> tag (OpenGraph). */
function upsertMetaByProperty(property: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[property="${property}"]`,
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/** Set the canonical link, or remove it entirely when href is null. */
function setCanonical(href: string | null): void {
  const existing = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]',
  );
  if (href === null) {
    // Remove a stale canonical so a noindex route never inherits one.
    if (existing) existing.remove();
    return;
  }
  let el = existing;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Organization JSON-LD, emitted on the homepage only. The payload comes from the
 * shared builder in `@/lib/seo-jsonld` — the SAME source the build-time prerender
 * uses — so runtime and static HTML never drift. When the homepage is prerendered
 * the tag already exists (matched by ORG_JSONLD_ID); this updates it in place
 * rather than creating a duplicate.
 */
function setOrganizationJsonLd(active: boolean): void {
  setKeyedJsonLd(ORG_JSONLD_ID, active ? serializeOrganizationJsonLd() : null);
}

/** Upsert (or remove, when payload is null) a keyed JSON-LD script tag —
 * generalized from the ORG pattern for the AUD-ROUTE WebSite + Breadcrumb
 * blocks; the prerendered node (matched by id) is reused, never duplicated. */
function setKeyedJsonLd(id: string, payload: string | null): void {
  const existing = document.getElementById(id);
  if (payload === null) {
    if (existing) existing.remove();
    return;
  }
  let el = existing as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.type = "application/ld+json";
    el.id = id;
    el.setAttribute("data-seo-managed", "true");
    document.head.appendChild(el);
  }
  el.textContent = payload;
}

export function SeoHeadManager(): null {
  const [location] = useLocation();

  useEffect(() => {
    const head = resolveRouteHead(location);

    document.title = head.title;
    upsertMetaByName("description", head.description);
    upsertMetaByName("robots", head.robots);
    setCanonical(head.canonical);

    upsertMetaByProperty("og:title", head.title);
    upsertMetaByProperty("og:description", head.description);
    upsertMetaByProperty("og:url", head.ogUrl);
    upsertMetaByProperty("og:image", head.ogImage);
    // AUD-ROUTE: attribution + a11y of every social card (one brand source).
    upsertMetaByProperty("og:site_name", OG_SITE_NAME);
    upsertMetaByProperty("og:locale", OG_LOCALE);
    upsertMetaByProperty("og:image:alt", OG_IMAGE_ALT);

    upsertMetaByName("twitter:card", head.twitterCard);
    upsertMetaByName("twitter:site", X_HANDLE);
    upsertMetaByName("twitter:title", head.title);
    upsertMetaByName("twitter:description", head.description);
    upsertMetaByName("twitter:image", head.ogImage);

    setOrganizationJsonLd(location === "/");
    setKeyedJsonLd(
      WEBSITE_JSONLD_ID,
      location === "/" ? serializeWebSiteJsonLd() : null,
    );
    setKeyedJsonLd(BREADCRUMB_JSONLD_ID, serializeBreadcrumbJsonLd(location));
  }, [location]);

  return null;
}
