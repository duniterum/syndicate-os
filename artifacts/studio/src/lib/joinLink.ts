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

/**
 * THE ONE channel-tag composer (twin search, 2026-08-03). `&via=` was being
 * assembled in THREE homes — withVia() in referrerKit.tsx plus two hand-built
 * templates in ReferralLinkPanel.tsx — and the kit's per-network share tag was
 * about to become a fourth. A join link and the tag that says WHERE it was
 * handed out are one fact, so they live in one module.
 *
 * The tag vocabulary is OPEN by design: the Channels breakdown renders whatever
 * tags actually arrive, so a new channel needs no registry entry here.
 */
export function withVia(joinLink: string, tag: string): string {
  return `${joinLink}&via=${tag}`;
}

/**
 * THE PREVIEW FACE (K1.7, founder GO 2026-08-03 — « je veux chaque image »).
 *
 * A shared link's preview picture is whatever THAT URL declares, so an artifact
 * makes its own picture travel by shipping its own url: `&card=` names the face
 * the server paints at /api/join-card/<sourceId>.png. Two different params, two
 * different questions, never conflated — `via` is WHERE the link was handed
 * out (Channels counts it), `card` is WHICH picture unfurls.
 *
 * The face vocabulary is the painter's JOIN_CARD_FACES (invite · standing ·
 * seat · record); an unknown or absent value degrades to the invitation
 * server-side, so a mangled or older link still unfurls something true.
 */
export function withCard(joinLink: string, face: string): string {
  return `${joinLink}&card=${face}`;
}
