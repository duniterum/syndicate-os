// config/surfaceNaming.ts
//
// THE SURFACE-NAMING CANON (founder directive, 2026-07-11). Locks the words the
// USER reads for the three surfaces that reached ELEVEN names. Mirrors the shape
// of config/sourceAttributionTerminology.ts — the ONLY vocabulary in this repo
// that never drifted in six months, because it had a config AND a guard. Surface
// naming had no guard; that is why it sprawled. A guard cannot catch a lie it has
// no word for — so the banned list lives here, and guard-surface-naming.ts holds
// the surfaces to it (BLOCKING).
//
// WHY (grounded, not taste): Coinbase (Portfolio), Revolut, Kraken, Binance
// (Wallet), Interactive Brokers, Stripe, Shopify, AWS + NN/g research all name a
// page after THE OBJECT THE USER OWNS — never a metaphor, never a brand term. A
// Syndicate member owns a SEAT (canonical in the contract, the receipt, the
// doctrine). "cockpit" dies because it is the SAME pilot-seat metaphor as
// "console" for the OPPOSITE audience — that collision is the bug.
//
// SCOPE: governs what the USER READS (labels, headings, nav, copy) and what
// AGENTS WRITE IN PROSE (comments). It does NOT govern file names (MemberAccess.tsx
// is fine) or internal lookup-id keys that are never rendered.
//
// Dependency-free (Node-loadable for the guard).

/** The canonical name for each user-facing surface. Nothing else may be shown. */
export const surfaceNames = {
  /** /member — the member's home. Named after the object owned, not a metaphor. */
  memberHome: "Member Home",
  /** The identity block inside Member Home. */
  identityBlock: "Your Seat",
  /** The header link to Member Home — the CONCEPT, not the page. */
  headerLink: "Membership",
  /** /studio, /admin, /founder — the operator surfaces. */
  console: "Console",
} as const;

/**
 * "dashboard" is a common noun ONLY — never a page name, an H1, or a nav label
 * (Revolut / Stripe usage). Tracked here so the guard can forbid it as a name
 * while allowing it as ordinary prose.
 */
export const commonNounOnly: readonly string[] = ["dashboard"];

/**
 * BANNED surface names — never shown to a user, never written in agent prose.
 * The guard scans studio source (labels, headings, copy, comments) for these,
 * exempting this file + the guard (which must name them to ban them), file-path
 * / import lines, and the route-rename ledger (routeMemory.ts records old names
 * by design). Word-boundary, case-insensitive.
 */
export const bannedSurfaceNames: readonly string[] = [
  // FOUNDER DECISION (2026-07-14): "My Syndicate" is DEAD as a surface name —
  // the possessive-network framing carries a DOWNLINE connotation the referral
  // doctrine explicitly bans; its content lives in the Referral dashboard.
  "my syndicate",
  "cockpit",
  "member os",
  "member access", // as prose; the FILE MemberAccess.tsx is fine (no space → not matched)
  "lobby",
  "user lobby",
  "connected lobby",
  "control tower",
  "operating surface",
  "trust surface",
  "proof surface",
  "member path",
];

/** One-line rationale the guard asserts is present (so the WHY never gets lost). */
export const surfaceNamingRationale =
  "A page is named after the object the user owns — a member owns a SEAT. Metaphors (cockpit, lobby, control tower) and brand terms are banned; 'cockpit' collides with 'console' for the opposite audience.";
