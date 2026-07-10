// FAQPage JSON-LD — the SINGLE source of the /faq structured data.
//
// Mirrors the Organization JSON-LD pattern (seo-jsonld.ts): ONE builder feeds
// BOTH the build-time prerender (scripts/prerender-routes.ts, baked into the
// SERVER HTML so JS-blind AI/social crawlers still get it) AND the runtime
// injector (components/faq/FaqJsonLd.tsx) — no parallel truth, no drift.
//
// The payload is a direct projection of the number-free FAQ corpus in
// content/faq-content.ts: every Question/acceptedAnswer is plain text, identical
// to what renders on screen (honest structured data). ZERO chain figures.
//
// Imports use a relative `.ts` path (not the `@/` alias) so Node's native
// TypeScript loader can import this from `scripts/` exactly like seo-jsonld.ts;
// the corpus it pulls from is dependency-free.
import { FAQ_ENTRIES_FLAT } from "../content/faq-content.ts";

/** Shared DOM id for the injected script tag — the client reuses the prerendered node. */
export const FAQ_JSONLD_ID = "seo-jsonld-faq";

/** Build the FAQPage JSON-LD object (stable key order = stable serialization). */
export function buildFaqJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ENTRIES_FLAT.map((e) => ({
      "@type": "Question",
      name: e.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: e.a,
      },
    })),
  };
}

/** Serialized FAQPage JSON-LD for injection into a <script> tag. */
export function serializeFaqJsonLd(): string {
  return JSON.stringify(buildFaqJsonLd());
}
