// SeoHeadManager — Slice 2.18C per-route document metadata for the SPA.
//
// Reads the current wouter location, resolves the matching entry from the SEO
// route registry (the single source of truth), and harmonizes document.title,
// description, robots, canonical, and OG/Twitter tags on every navigation.
//
// HONEST SCOPE: this is client-side/runtime metadata only. It improves browser
// state and JS-executing crawlers; static social/AI preview bots that do not run
// JS may still read the base index.html until SSR/prerender lands later. This
// component renders nothing.

import { useEffect } from "react";
import { useLocation } from "wouter";
import { resolveRouteHead } from "@/lib/seo-route-registry";

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

    upsertMetaByName("twitter:card", head.twitterCard);
    upsertMetaByName("twitter:title", head.title);
    upsertMetaByName("twitter:description", head.description);
    upsertMetaByName("twitter:image", head.ogImage);
  }, [location]);

  return null;
}
