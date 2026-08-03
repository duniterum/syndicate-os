// config/pressKit.ts — THE press & brand kit content authority (slice E,
// founder «go décide pour moi», 2026-08-03).
//
// Dependency-free → Node-loadable: guard-press-kit imports and EXECUTES this
// module, so every description is frozen verbatim, the language lists cannot
// silently thin or contradict, and every protocol fact must keep its internal
// verify door. The origin's press.tsx was the QUARRY; the MIRROR RULE the
// sieve — only what is true and served today is published. Channels live in
// config/brand.ts (socialLinks — THE authority); the legal line lives in
// config/sharedCopy.ts (safetyCopy.notInvestment) — both imported by the
// page, never retyped here.

/** The three official descriptions — PROOF register: zero adjectives,
 * figures speak, every sentence chain-true. FROZEN by guard-press-kit. */
export const pressDescriptions = {
  oneLine:
    "The Syndicate is an on-chain membership protocol on Avalanche: every seat, purchase and introduction is a public, verifiable record.",
  short:
    "The Syndicate is a membership protocol on Avalanche C-Chain. A seat is bought in USDC from your own wallet; the purchase, the seat and every introduction are written on-chain as permanent, independently verifiable records. The protocol publishes what the chain publishes — never more.",
  long:
    "The Syndicate is a membership protocol on Avalanche C-Chain. A seat is bought in USDC from your own wallet; the purchase, the seat and every introduction are written on-chain as permanent, independently verifiable records. Treasury flows follow a published split — Vault 70% · Liquidity 20% · Operations 10% — and the referral program pays an introducer's commission inside the buyer's own transaction. The rule of record: never a claim beyond what the chain itself publishes.",
} as const;

/** Words that describe the protocol correctly. */
export const pressApprovedLanguage: readonly string[] = [
  "membership",
  "seat",
  "verified introduction",
  "commission",
  "receipt",
  "proof",
  "on-chain record",
  "chapter",
  "season",
  "treasury split",
  "don't trust, verify",
];

/** The red lines — what the protocol is NOT, stated as direct denials (each
 * line is quotable as-is; the guard-forbidden-copy negation law is exactly
 * this form). Behind the list: the two business red lines — no gain promise,
 * no chain-refutable claim. */
export const pressBannedLanguage: readonly string[] = [
  "not an investment",
  "no yield, no ROI",
  "not passive income",
  "no returns, no profit promise",
  "nothing guaranteed",
  "not an MLM — no downline, no upline",
  "no airdrops",
  "no price predictions",
  "not financial advice",
];

/** Live protocol facts — each with the internal door that proves it.
 * A fact without a door is a claim; none ships here. */
export interface PressFact {
  text: string;
  href: string;
  door: string;
}
export const pressProtocolFacts: readonly PressFact[] = [
  {
    text: "Seats are sold live, on-chain, in USDC — every purchase is a public transaction.",
    href: "/join",
    door: "Join",
  },
  {
    text: "A public register lists every seat.",
    href: "/registry",
    door: "Registry",
  },
  {
    text: "A live activity record carries every protocol act with its transaction anchor.",
    href: "/activity",
    door: "Activity",
  },
  {
    text: "The treasury split is published: Vault 70% · Liquidity 20% · Operations 10%.",
    href: "/contracts",
    door: "Economy",
  },
  {
    text: "Referral commissions are paid inside the buyer's own transaction.",
    href: "/referral-terms",
    door: "Program terms",
  },
  {
    text: "Season standings are public.",
    href: "/season",
    door: "Season",
  },
  {
    text: "The chain is Avalanche C-Chain; live protocol status is published.",
    href: "/status",
    door: "Status",
  },
];

/** How the name and the mark may be used. */
export const pressMediaUsage: readonly string[] = [
  "Use the mark as provided — never redrawn, recolored, distorted or combined with another mark.",
  "Never imply an endorsement, partnership or affiliation that does not exist.",
  "Never present the protocol as an investment, and never attach financial projections to its name.",
  "Quote figures only with their verify path — every number the protocol publishes carries one.",
];

// Explicit .ts extension: this module is EXECUTED by guard-press-kit under
// Node type-stripping, which resolves no extensionless relative imports.
import { brandAssets } from "./brand.ts";

/** The served brand files — only what public/ actually holds. The PNG path
 * is THE brandAssets authority, imported (the twin law — review-2 found it
 * retyped in three places, 2026-08-03). */
export interface PressAsset {
  label: string;
  href: string;
  note: string;
}
export const pressAssets: readonly PressAsset[] = [
  { label: "The lockup — mark + wordmark (SVG)", href: brandAssets["syn-lockup-gold"], note: "vector · for dark grounds" },
  { label: "The lockup — mark + wordmark (PNG)", href: brandAssets["syn-lockup-gold-png"], note: "transparent · @2x below" },
  { label: "The lockup — mark + wordmark (PNG @2x)", href: brandAssets["syn-lockup-gold-png-2x"], note: "retina" },
  { label: "The mark alone — gold (PNG)", href: brandAssets["syn-mark-gold"], note: "transparent background" },
  { label: "The mark alone — gold (SVG)", href: brandAssets["syn-mark-gold-svg"], note: "vector" },
  { label: "Link-preview card (1280×720)", href: "/opengraph.jpg", note: "the served OG image" },
];
