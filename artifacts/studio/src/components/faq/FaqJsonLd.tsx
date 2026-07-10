// FaqJsonLd — runtime injector for the /faq FAQPage structured data.
//
// Mirrors SeoHeadManager's setOrganizationJsonLd: the payload comes from the
// shared builder in @/lib/seo-faq-jsonld — the SAME source the build-time
// prerender bakes into the server HTML — so runtime and static never drift.
// When /faq is prerendered the tag already exists (matched by FAQ_JSONLD_ID);
// this updates it in place rather than creating a duplicate, and removes it on
// unmount so the tag never leaks onto another route. Renders nothing.

import { useEffect } from "react";
import { serializeFaqJsonLd, FAQ_JSONLD_ID } from "@/lib/seo-faq-jsonld";

export function FaqJsonLd(): null {
  useEffect(() => {
    let el = document.getElementById(FAQ_JSONLD_ID) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = FAQ_JSONLD_ID;
      el.setAttribute("data-seo-managed", "true");
      document.head.appendChild(el);
    }
    el.textContent = serializeFaqJsonLd();
    return () => {
      document.getElementById(FAQ_JSONLD_ID)?.remove();
    };
  }, []);

  return null;
}
