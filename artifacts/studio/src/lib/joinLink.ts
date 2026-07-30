// lib/joinLink.ts — THE ONE join-link builder (footer audit 2026-07-30).
// ---------------------------------------------------------------------------
// Five referral share surfaces each hand-assembled
// `https://thesyndicate.money/join?source=…`, and /source built the same link
// from window.location.origin — handing out a localhost share link on any
// off-prod rig (Check ① — one fact, two homes). One fact, ONE home: the
// canonical origin is imported from the SEO route registry (the single origin
// authority) and every share surface calls this builder.

import { CANONICAL_ORIGIN } from "@/lib/seo-route-registry";

/** The member's shareable join link for a source id — canonical origin, always. */
export function buildJoinLink(sourceId: string): string {
  return `${CANONICAL_ORIGIN}/join?source=${sourceId}`;
}
