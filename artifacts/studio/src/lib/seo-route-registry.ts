// SEO Route Registry — single source of truth for route SEO/indexing posture.
//
// Slice 2.18B (SEO Registry Foundation) created this registry; the sitemap,
// robots disallows, and the guard check are derived from it.
// Slice 2.18C (Per-Route Metadata) now ALSO consumes it at runtime: the
// `SeoHeadManager` component reads the current route, matches it here, and
// harmonizes document.title / description / robots / canonical / OG / Twitter
// tags per route. Helpers below (getRobotsDirective, getCanonicalUrl,
// getOgImageUrl, toAbsoluteUrl, matchRoute) are the contract for that manager.
//
// Non-JS bots are served too (AUD-ROUTE truth, 2026-07-17): every build runs
// scripts/prerender-routes.ts, which bakes this registry's per-route head
// (title/meta/canonical/JSON-LD) into flat static shells — static social/AI
// preview bots read the prerendered shell, never a bare index.html.
//
// Keep this file dependency-free (no imports) so the Node scripts in `scripts/`
// can load it directly via Node's native TypeScript support.

export type SeoRouteType =
  | "PUBLIC"
  | "INTERNAL"
  | "PENDING"
  | "UTILITY"
  | "API"
  | "RETIRED"
  | "UNKNOWN";

export type SeoIndexStatus =
  | "INDEX"
  | "NOINDEX"
  | "INTERNAL"
  | "PENDING"
  | "REDIRECT"
  | "UTILITY";

export type SeoChangeFreq =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SeoRouteEntry {
  /** Route path as declared in the wouter router, or "*" for the catch-all. */
  path: string;
  routeType: SeoRouteType;
  indexStatus: SeoIndexStatus;
  /** Include in sitemap.xml. Must only ever be true when indexStatus === "INDEX". */
  sitemap: boolean;
  /** Document title. Emitted per route by SeoHeadManager (incl. noindex routes — title is not a ranking signal and improves UX). */
  title: string;
  description: string;
  /** Self-canonical path for indexable routes (must start with "/"); null when not indexable. */
  canonicalPath: string | null;
  changefreq?: SeoChangeFreq;
  /** Relative priority hint, 0.0–1.0. */
  priority?: number;
  ogImage?: string;
  ownerSurface: string;
  primaryIntent: string;
  primaryCTA?: string;
  proofRoute?: string;
  notes?: string;
}

/**
 * Canonical origin for The Syndicate (founder-directed).
 * As of Slice 2.18C, `index.html` base OG/Twitter tags and the runtime
 * SeoHeadManager both use this origin (the old `syndicate-os.replit.app`
 * deploy origin is no longer referenced in metadata).
 */
export const CANONICAL_ORIGIN = "https://thesyndicate.money";

/** Default OG/Twitter image (root-relative; made absolute via CANONICAL_ORIGIN). */
export const DEFAULT_OG_IMAGE = "/opengraph.jpg";

/** Twitter card type used across all routes. */
export const TWITTER_CARD_TYPE = "summary_large_image";

/**
 * THE NEUTRAL WALL AT THE HEAD LAYER (/admin-in-prod, Ruling ② — 2026-07-17).
 * This registry ships in the PUBLIC entry bundle (it drives the runtime head),
 * so INTERNAL entries must carry ZERO admin vocabulary in their FIELDS:
 * view-source at an INTERNAL path must read exactly like the catch-all 404
 * (same title, same description). What each internal surface actually is lives
 * in COMMENTS above its entry (stripped from the build) and in the console
 * code itself (a separate lazy chunk, requested only after the server confirms
 * an ACTIVE operator role). The old per-surface titles ("Admin Console —
 * Broadcast (Internal)" …) were a bundle-string leak of the exact class
 * Ruling ② kills. guard-operator-gate pins these constants and the dist scan.
 */
export const NEUTRAL_WALL_TITLE = "Page Not Found";
export const NEUTRAL_WALL_DESCRIPTION = "Unknown route fallback.";
const NEUTRAL_WALL_NOTE = "Internal route: neutral head (mirrors the catch-all).";

/**
 * Every actual route in `src/App.tsx` plus the catch-all — the COUNT is never
 * written here (it rotted once: "14 routes" survived to a 42-route reality);
 * router↔registry parity is enforced by scripts/check-seo-registry.ts.
 * Routes named only in founder memory but NOT present in the app are
 * intentionally omitted (documented in the slice report, never invented here).
 */
export const seoRouteRegistry: SeoRouteEntry[] = [
  {
    path: "/",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "The Syndicate — Proof-First Membership Protocol",
    description:
      "A members club that lives on-chain. Your seat is permanent, numbered, and verifiable — and it's open today. Every figure on this site is read live from the chain. Check it yourself.",
    canonicalPath: "/",
    changefreq: "weekly",
    priority: 1.0,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "brand",
    primaryIntent: "brand",
    primaryCTA: "Take your seat",
    proofRoute: "/status",
    notes: "Public front door (PublicLayout).",
  },
  {
    path: "/status",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Status — What's Live vs Pending",
    description:
      "The honest ledger of what is live versus pending across The Syndicate — seats selling, indexers running, every figure read from the chain, every surface labelled.",
    canonicalPath: "/status",
    changefreq: "weekly",
    priority: 0.8,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "status",
    proofRoute: "/status",
    notes: "Authoritative wiring/status ledger.",
  },
  {
    path: "/proof",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Proof — Verify The Syndicate",
    description:
      "Verify The Syndicate for yourself: membership receipts, treasury routing, numbered burns and referral payments — read live from the chain, each with its own verify link.",
    canonicalPath: "/proof",
    changefreq: "weekly",
    priority: 0.7,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "verify",
    proofRoute: "/proof",
    notes:
      "AUD-P0 (2026-07-16): the page rewritten to today's truth — all four proof organs LIVE with doors to their living surfaces; the dead-era lead, banner and facet claims DIED (the audit's three converging P0s); safetyCopy.readOnly retired. The served head had already told the truth — the page now matches it.",
  },
  // AUD-T (2026-07-16): the legal layer. SEO-metadata law: NO banned financial
  // word in title/description, NOT EVEN NEGATED (truncation strips negation).
  {
    path: "/terms",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Terms of Use — The Syndicate",
    description:
      "The terms that govern thesyndicate.money: what a seat is, how a purchase works on Avalanche C-Chain, the referral program's rules, and what the protocol never does.",
    canonicalPath: "/terms",
    changefreq: "monthly",
    priority: 0.3,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "education",
    proofRoute: "/proof",
    notes:
      "AUD-T (2026-07-16, founder GO on the full text): Version 1 draft, honestly labeled as awaiting qualified counsel; governing law + entity + contact = pending lines, never invented. Doctrine-verified: zero banned vocabulary; negated disclaimers live in the BODY only.",
  },
  {
    path: "/privacy",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Privacy Policy — The Syndicate",
    description:
      "Built to know almost nothing about you: no accounts, no identity checks, one functional session cookie, no analytics — with the little that does exist said plainly.",
    canonicalPath: "/privacy",
    changefreq: "monthly",
    priority: 0.3,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "education",
    proofRoute: "/proof",
    notes:
      "AUD-T (2026-07-16): every claim harvested from real code (cookie flags/TTLs, the two browser-preference keys, zero analytics verified, pino logs + IP throttle, on-chain mirror disclosure, WalletConnect + public RPC third parties) and adversarially fact-checked. Retention window + entity + contact = pending lines.",
  },
  {
    path: "/risk",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Risk Disclosure — The Syndicate",
    description:
      "Read before you sign: the price of SYN can fall to zero, smart contracts can have flaws, your keys are your only access, and blockchain transactions are final.",
    canonicalPath: "/risk",
    changefreq: "monthly",
    priority: 0.3,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "education",
    proofRoute: "/proof",
    notes:
      "AUD-T (2026-07-16): honest and specific, never boilerplate — downside-only price language, purchase-flow protections stated exactly as coded (no simulation claim), immutable-code-not-frozen-behavior precision, no audit implied. Liquidity section reuses the /liquidity Risk Notice lexicon.",
  },
  {
    path: "/member",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Member Home — Your Seat, Your Standing",
    description:
      "Sign in with your wallet and see your own standing: your seat, the people you brought in, and what you've been paid — read live from the chain. Only your own row; there is no directory of members.",
    canonicalPath: "/member",
    changefreq: "weekly",
    priority: 0.7,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "identity",
    primaryIntent: "join",
    proofRoute: "/status",
    notes:
      "S7/S7-b: full-screen door (one connect CTA) for visitors; the member DASHBOARD (identity band, live KPI tiles, pulse, referral, capital/protocol/chronicle cards) for signed members. View-only; no transaction path. D-TRUTH (2026-07-16): genesis seats' early-era footprints join the capital walk (standing-only — the public feed unchanged); founder-signed source standing resolves via the wallet-of-record fallback; the capital card lists the member's own purchase record with verify anchors; a definitive zero renders 0, never a dash. Ruling ① (2026-07-16): every share surface (link card, share card, quick action) advertises the PAYING source's link — server-resolved own-row sourceIdHex first, canonical derivation fallback.",
  },
  // ARC SLICE D — member doors (FLAT routes: a /member/* path would emit a
  // member/ directory and resurrect the 2.0 trailing-slash redirect on /member).
  // NOTIF-1 (founder-approved wireframe 2026-07-18, no-email canon).
  {
    path: "/notifications",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Notifications — your inbox, the protocol's only channel",
    description:
      "Messages to you alone and announcements to all members, read with your own wallet session. The protocol never emails — real messages from the Syndicate appear only in this inbox, and nothing unread ever expires.",
    canonicalPath: "/notifications",
    changefreq: "monthly",
    priority: 0.4,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "identity",
    primaryIntent: "proof",
    proofRoute: "/status",
    notes:
      "NOTIF-1: own-row inbox only (session wallet → own messages + broadcasts; no directory, no lookup). Read/seen receipts are the member's own server-side state. Anti-phishing stance: the in-app inbox is the ONLY trusted channel (Revolut pattern).",
  },
  {
    path: "/wallet",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Wallet — your balances & approvals",
    description:
      "Your own SYN, USDC and Archive artifact balances, plus your own approvals toward the protocol's known contracts — read live, own-row only. Revoking an approval is a transaction you sign in your own wallet.",
    canonicalPath: "/wallet",
    changefreq: "monthly",
    priority: 0.5,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "identity",
    primaryIntent: "proof",
    proofRoute: "/status",
    notes:
      "Own-row reads + member-signed revoke (approve 0). No server write. D-TRUTH D5 (2026-07-16): own Archive artifact holdings read live per artifact (client ERC-1155 balanceOf; address from verify-links).",
  },
  {
    path: "/toolkit",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Toolkit — what a seat can do",
    description:
      "Every member action in one place — real acts only. Locked actions stay visible with their plain reason, so a visitor sees exactly what a seat unlocks.",
    canonicalPath: "/toolkit",
    changefreq: "monthly",
    priority: 0.5,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "identity",
    primaryIntent: "join",
    proofRoute: "/status",
    notes: "The action registry as the public conversion surface.",
  },
  // ARC L-1 — the liquidity surface (origin harvest; real live content → INDEX).
  {
    path: "/liquidity",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Liquidity — the SYN/USDC pool, read live",
    description:
      "Why the liquidity pool exists, the live pair reserves read from the chain, and the LP-side actions — trade, add liquidity, verify the pair. No rewards or entitlement are live or promised to liquidity providers.",
    canonicalPath: "/liquidity",
    changefreq: "weekly",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "economy",
    primaryIntent: "proof",
    proofRoute: "/status",
    notes: "LP-side flow ONLY (flow-separation law: no Join CTA on the rail). External links verified 2026-07-14.",
  },
  {
    path: "/join",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Join The Syndicate — Take Your Seat On-Chain",
    description:
      "Read your exact live quote — what you pay, the SYN you receive, where every dollar routes — then join with two signatures from your own wallet. Every figure is read live from Avalanche C-Chain.",
    canonicalPath: "/join",
    changefreq: "weekly",
    priority: 0.8,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "identity",
    primaryIntent: "join",
    proofRoute: "/status",
    notes:
      "Public joining surface: live sale group + exact quote + optional ?source= attribution validation + the two-signature approve→buy checkout (C5 go-live). A confirmed purchase prints THE PROTOCOL RECEIPT ticket (receipt slice 2026-07-16) — seat, routing lines from the event's own fields, QR verify, one next door.",
  },
  {
    path: "/learning",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Learn — How The Syndicate Works",
    description:
      "Plain-language lessons: wallets, transactions, how membership works here — and how to verify any figure on this site for yourself.",
    canonicalPath: "/learning",
    changefreq: "weekly",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "education",
    primaryIntent: "education",
    proofRoute: "/status",
    notes: "Real educational content (Slice 2.21A).",
  },
  {
    path: "/whitepaper",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Whitepaper — The Syndicate, Written Once, Verified Live",
    description:
      "What The Syndicate is, how a seat and revenue routing work, and how to verify every figure on-chain. The prose is written once; every figure is read live from Avalanche — never hardcoded.",
    canonicalPath: "/whitepaper",
    changefreq: "monthly",
    priority: 0.9,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "education",
    primaryIntent: "education",
    proofRoute: "/status",
    notes:
      "Anchor content page (slice 2.1), built on the Prose atom. Static prose; every figure is a live chain read or a PENDING label — no hardcoded numbers.",
  },
  {
    path: "/tokenomics",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Tokenomics — SYN Supply, Distribution & Prices, Live On-Chain",
    description:
      "SYN's fixed supply, the live distribution across the seven allocation wallets, the two independent prices, and burn — every figure read live from Avalanche, never hardcoded. Not a security; no promise of gain.",
    canonicalPath: "/tokenomics",
    changefreq: "weekly",
    priority: 0.9,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "economy",
    primaryIntent: "transparency",
    proofRoute: "/status",
    notes:
      "Tokenomics content page (slice 2.2), on the Prose atom. Supply / per-allocation balances / prices / burn are LIVE chain reads (protocol-reality + join-quote + LP reserves); mint-time design targets shown as labelled config.",
  },
  {
    path: "/faq",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "FAQ — The Syndicate, Answered & Verifiable",
    description:
      "Honest answers about The Syndicate — SYN the seat, membership and the sale, treasury routing, liquidity, ranks, the archive, and risk. Answers hold no figures; every live number is one click away on-chain. Not a security; no promise of gain.",
    canonicalPath: "/faq",
    changefreq: "monthly",
    priority: 0.7,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "education",
    primaryIntent: "education",
    proofRoute: "/status",
    notes:
      "FAQ content page (slice 2.3), composed from the living chassis. Number-free doctrine-perfect corpus (content/faq-content.ts) reframed from the origin 39 Q&A; FAQPage JSON-LD baked into the server HTML from one shared builder (seo-faq-jsonld.ts). Live figures via the hero card hooks / links only — no hardcoded numbers.",
  },
  {
    path: "/docs",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Docs — The Syndicate Operating Manual",
    description:
      "The knowledge hub for The Syndicate — read the protocol in the order a member lives it. Every entry carries a status and an audience tag and links to the real surface, where every figure is read live from Avalanche. Not a security; no promise of gain.",
    canonicalPath: "/docs",
    changefreq: "monthly",
    priority: 0.7,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "education",
    primaryIntent: "education",
    proofRoute: "/status",
    notes:
      "Docs hub (slice 2.4), composed from the living chassis. A journey spine + grouped cards; each card links a REAL registry route and derives its status pill from the registry (Ready/Pending, never hardcoded). Number-free; audience tags are editorial wayfinding, never access-gating.",
  },
  {
    path: "/recognition",
    routeType: "PENDING",
    indexStatus: "PENDING",
    sitemap: false,
    title: "Recognition",
    description:
      "The recognition model explained as a future concept — structural recognition of verified participation, never a financial reward.",
    canonicalPath: null,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "recognition",
    primaryIntent: "recognition",
    proofRoute: "/status",
    notes: "Concept page. NOINDEX until the model is live.",
  },
  {
    path: "/contracts",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Contracts — Contract & Economy Memory",
    description:
      "Read-only memory of The Syndicate's contracts and economy: roles, lifecycle, and treasury routing structure. Canon reference only — no addresses, balances, or live chain reads.",
    canonicalPath: "/contracts",
    changefreq: "monthly",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "transparency",
    proofRoute: "/status",
    notes: "Posture-only contract memory. No addresses/balances; nothing read live.",
  },
  {
    path: "/map",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Protocol Map — The Live Protocol, Reconciled",
    description:
      "The Syndicate's public proof organism: chain identity, contract code, token metadata, sale lifecycle and referral-registry posture — every check reconciled against pinned canon and read live. If something can't be read, we say so.",
    canonicalPath: "/map",
    changefreq: "weekly",
    priority: 0.7,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "transparency",
    primaryIntent: "transparency",
    proofRoute: "/status",
    notes: "Read-only composition of GET /api/protocol/reality; archive group deliberately unbound.",
  },
  {
    // The CANONICAL human URL (founder, 2026-07-13): people search "referral
    // program" — the URL is part of the search result and the mental load.
    path: "/referral",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Referral Program — The Syndicate",
    // SEO-metadata law (surface:audit, blocking): banned financial words never
    // appear in a title/description — NOT EVEN NEGATED. A truncated search
    // snippet can strip the negation and display the banned word alone. The
    // protective negations live in the page body; metadata stays clean.
    description:
      "How The Syndicate's referral program works: an eligible completed introduction pays a bounded commission to the introducer's wallet inside the buyer's own transaction — on-chain, shown by receipt. Membership is not an investment.",
    canonicalPath: "/referral",
    changefreq: "monthly",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "source",
    primaryIntent: "education",
    proofRoute: "/status",
    notes: "The canonical referral-program page (human URL).",
  },
  {
    // LEGACY ALIAS of /referral: serves the same page at 200 (existing links
    // never break — no 301 exists at the static layer until the domain
    // transfer), noindex,follow + cross-canonical → Google consolidates.
    path: "/source-attribution",
    routeType: "PUBLIC",
    indexStatus: "REDIRECT",
    sitemap: false,
    title: "Referral Program — The Syndicate",
    description:
      "How The Syndicate's referral program works: an eligible completed introduction pays a bounded commission to the introducer's wallet inside the buyer's own transaction — on-chain, shown by receipt. Membership is not an investment.",
    canonicalPath: "/referral",
    changefreq: "monthly",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "source",
    primaryIntent: "education",
    proofRoute: "/status",
    notes: "Public-safe attribution model. Operator /source stays paused/internal.",
  },
  {
    path: "/support",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Support — Help & Review",
    description:
      "Get help now: the on-site Guide answers instantly and the official channels are one click away. A full ticket system is not built yet — no form here stores or sends anything.",
    canonicalPath: "/support",
    changefreq: "monthly",
    priority: 0.4,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "foundation",
    primaryIntent: "support",
    proofRoute: "/status",
    notes: "Intake preview only (no backend write).",
  },
  {
    path: "/archive",
    routeType: "PENDING",
    indexStatus: "PENDING",
    sitemap: false,
    title: "Archive & Chronicle",
    description:
      "The Syndicate's archive — protocol memory minted on-chain. Artifacts are live on Avalanche today and every mint lands on the public record; the full museum surface is still being built.",
    canonicalPath: null,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "archive",
    primaryIntent: "archive",
    proofRoute: "/status",
    notes: "ARCHIVE_READS_NOT_WIRED. NOINDEX until archive reads are wired.",
  },
  // §11 slot 2c, GROWN UP (born 2026-07-14 as noindex teasers; LIVE since
  // ACT-1/CHR-1/the heartbeat): /activity, /chronicle and /fire-ledger serve
  // the real indexed record today — INDEX + sitemap, no posture badge.
  {
    path: "/activity",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Activity — the public heartbeat",
    description:
      "The protocol's public heartbeat: the complete indexed history — seats written, burns numbered, referral events, liquidity, archive mints, treasury movements, milestone crossings, era turns and footprint rises — every line a receipt-backed sentence with its own verify link.",
    canonicalPath: "/activity",
    changefreq: "daily",
    priority: 0.6,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "activity",
    primaryIntent: "proof",
    proofRoute: "/status",
    notes:
      "Complete served history (indexer) + recent-window freshness layer. H2-⑬: the Milestones panel — canonical crossings anchored to their exact transactions. H2-⑦: treasury movements (post-Fold-Law — routing detail never duplicates a purchase). H2-⑫: era turns (witnessed page turns; line-on-crossing only, never a countdown). H2-P: THE PRIDE OF THE PUBLIC RECORD — lines speak the origin voice (member number + short-form signature; a full address never serializes; ADR-003 amendment). H2-⑭: Chronicle promotions join from the committed register (no invented anchors; 'read the record' links) + chip decision A ('Referral registry'). H2-⑰: capital-axis footprint rises (12 founder-named rungs; recognition only — the red line guard-pinned; base rung silent). H2-⑩: deployments from the chain-verified canon registry (real creation-tx anchors) — the heartbeat's founding inventory COMPLETE.",
  },
  {
    path: "/chronicle",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Chronicle — the institutional story",
    description:
      "The protocol's solemn record — founder-promoted turning points, each verifiable on-chain. The register is public and grows only by founder-signed commits — no silent edits.",
    canonicalPath: "/chronicle",
    changefreq: "monthly",
    priority: 0.5,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "chronicle",
    primaryIntent: "archive",
    proofRoute: "/status",
    notes: "CHR-1 + first promotion (founder, 2026-07-14). Entries land ONLY by founder-approved commits.",
  },
  {
    path: "/fire-ledger",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Fire Ledger — supply retired in public",
    description:
      "Every burn, numbered: the live total of SYN retired to the burn address and the complete Proof of Burn record — dated, verifiable, served by the protocol's own indexer.",
    canonicalPath: "/fire-ledger",
    changefreq: "daily",
    priority: 0.5,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "fire-ledger",
    primaryIntent: "proof",
    proofRoute: "/status",
    notes: "ACT-1 LIVE (total + recent-window burn feed, honesty banner).",
  },
  // /studio — the operator console overview (Shell + OperatorOverview).
  {
    path: "/studio",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /proof-studio — draft proof tooling (disabled forms, read-only).
  {
    path: "/proof-studio",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /founder — founder/operator copy-only preview surface.
  {
    path: "/founder",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /os-map — the full-protocol visibility map (founder preview; live-bound
  // spine evidence panels). Robots disallow remains defense-in-depth.
  {
    path: "/os-map",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin — the sectioned console dashboard (Phase 2 slice 1): read-only
  // panels over the module registry and live postures.
  {
    path: "/admin",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/members — members & continuity postures (M-INT-1's future home).
  {
    path: "/admin/members",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/sources — source registry, referral terms + review queue.
  {
    path: "/admin/sources",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/operators — operator roles + registry (live invite/suspend/list).
  {
    path: "/admin/operators",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/content — content governance, packages, address-label reservations.
  {
    path: "/admin/content",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/modules — module registry governance overlay.
  {
    path: "/admin/modules",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/broadcast — broadcast preview surface (send disabled).
  {
    path: "/admin/broadcast",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/audit — audit-log preview + activity postures.
  {
    path: "/admin/audit",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/support — support queue preview surface.
  {
    path: "/admin/support",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  // /admin/settings — build flags + system health, read-only.
  {
    path: "/admin/settings",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  {
    path: "/source",
    routeType: "PUBLIC",
    indexStatus: "INDEX",
    sitemap: true,
    title: "Build Your Referral Link — The Syndicate",
    description:
      "Validate a referral code against the on-chain registry and build a shareable join link. Checking is free and writes nothing — the link you build pays you inside your referral's own transaction once they join.",
    canonicalPath: "/source",
    changefreq: "weekly",
    priority: 0.5,
    ogImage: DEFAULT_OG_IMAGE,
    ownerSurface: "identity",
    primaryIntent: "join",
    proofRoute: "/status",
    notes:
      "Public Verified-Introduction link builder (Public Online Integration MVP). The old operator source console moved to /os-source.",
  },
  // /os-source — the operator source console (read-only; creation/activation
  // stay owner-side on-chain acts). Was /source before the public link
  // builder took that path.
  {
    path: "/os-source",
    routeType: "INTERNAL",
    indexStatus: "INTERNAL",
    sitemap: false,
    title: NEUTRAL_WALL_TITLE,
    description: NEUTRAL_WALL_DESCRIPTION,
    canonicalPath: null,
    ownerSurface: "operator",
    primaryIntent: "operator",
    notes: NEUTRAL_WALL_NOTE,
  },
  {
    path: "*",
    routeType: "UTILITY",
    indexStatus: "UTILITY",
    sitemap: false,
    title: "Page Not Found",
    description: "Unknown route fallback.",
    canonicalPath: null,
    ownerSurface: "utility",
    primaryIntent: "utility",
    notes:
      "Catch-all (wouter pathless <Route> → not-found.tsx). The REAL 404 ships: prerender writes a branded noindex 404.html and the serving layer returns it with true HTTP 404 for unmatched paths (the old soft-404 note rotted here while the fix shipped — AUD-ROUTE truthed it).",
  },
];

/** Routes that belong in the sitemap: only INDEX routes explicitly flagged sitemap=true. */
export function getSitemapRoutes(
  registry: SeoRouteEntry[] = seoRouteRegistry,
): SeoRouteEntry[] {
  return registry.filter((r) => r.sitemap && r.indexStatus === "INDEX");
}

/** Internal/operator routes that should be disallowed in robots.txt (publicly routable, real path). */
export function getRobotsDisallowRoutes(
  registry: SeoRouteEntry[] = seoRouteRegistry,
): SeoRouteEntry[] {
  return registry.filter(
    (r) => r.routeType === "INTERNAL" && r.path !== "*" && r.path.startsWith("/"),
  );
}

// --- Runtime metadata helpers (consumed by SeoHeadManager, Slice 2.18C) -------
// Pure + dependency-free so the Node guard can also call them.

/**
 * Deterministic `<meta name="robots">` content for a route, by indexStatus:
 * - INDEX            → "index, follow"        (public, indexable)
 * - PENDING          → "noindex, follow"      (not ready; keep links crawlable for when it flips)
 * - INTERNAL/UTILITY → "noindex, nofollow"    (operator / not-found; keep out of the index entirely)
 * - NOINDEX/REDIRECT → "noindex, follow"      (conservative default)
 */
export function getRobotsDirective(entry: SeoRouteEntry): string {
  switch (entry.indexStatus) {
    case "INDEX":
      return "index, follow";
    case "INTERNAL":
    case "UTILITY":
      return "noindex, nofollow";
    case "PENDING":
    case "NOINDEX":
    case "REDIRECT":
    default:
      return "noindex, follow";
  }
}

/** Join the canonical origin with a root-relative path (no double slashes). */
export function toAbsoluteUrl(pathname: string): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return CANONICAL_ORIGIN + (pathname.startsWith("/") ? pathname : `/${pathname}`);
}

/**
 * Canonical URL by INDEX-STATUS CLASS (AUD-ROUTE 2026-07-17 — the class rule):
 *   INDEX    → self-canonical at its own canonicalPath.
 *   REDIRECT → CROSS-canonical at its target's canonicalPath — the alias
 *              consolidation the entry itself documents (noindex,follow +
 *              cross-canonical → Google consolidates). Before this, the alias
 *              promised the canonical in its note but never emitted it.
 *   all else → null (a noindex route must not advertise a canonical);
 *              null tells the head manager to REMOVE any stale canonical.
 */
export function getCanonicalUrl(entry: SeoRouteEntry): string | null {
  if (entry.canonicalPath === null) return null;
  if (entry.indexStatus !== "INDEX" && entry.indexStatus !== "REDIRECT") return null;
  return toAbsoluteUrl(entry.canonicalPath);
}

/** Absolute OG/Twitter image URL for a route (falls back to the default image). */
export function getOgImageUrl(entry: SeoRouteEntry): string {
  return toAbsoluteUrl(entry.ogImage ?? DEFAULT_OG_IMAGE);
}

/** Normalize a wouter location to a registry path key (strip trailing slash except root). */
export function normalizeLocation(location: string): string {
  if (!location || location === "") return "/";
  const noQuery = location.split(/[?#]/)[0];
  if (noQuery.length > 1 && noQuery.endsWith("/")) return noQuery.replace(/\/+$/, "");
  return noQuery;
}

/**
 * Match a current location to its registry entry. Exact-path match only (the
 * app has no dynamic/param routes today); anything unmatched falls back to the
 * catch-all "*" entry so unknown routes get noindex metadata.
 */
export function matchRoute(
  location: string,
  registry: SeoRouteEntry[] = seoRouteRegistry,
): SeoRouteEntry {
  const normalized = normalizeLocation(location);
  const exact = registry.find((r) => r.path === normalized);
  if (exact) return exact;
  const catchAll = registry.find((r) => r.path === "*");
  if (catchAll) return catchAll;
  // Defensive: a registry without a catch-all still returns a noindex-able shape.
  return {
    path: normalized,
    routeType: "UNKNOWN",
    indexStatus: "UTILITY",
    sitemap: false,
    title: "Page Not Found",
    description: "Unknown route fallback.",
    canonicalPath: null,
    ownerSurface: "utility",
    primaryIntent: "utility",
  };
}

/**
 * Resolved per-route head metadata. `canonical` is null when the route must not
 * advertise a canonical; `ogUrl` is always present (canonical when indexable,
 * else the route's own absolute URL).
 */
export interface ResolvedRouteHead {
  title: string;
  description: string;
  robots: string;
  canonical: string | null;
  ogUrl: string;
  ogImage: string;
  twitterCard: string;
}

/** Resolve every head value for a location in one call (used by SeoHeadManager). */
export function resolveRouteHead(location: string): ResolvedRouteHead {
  const entry = matchRoute(location);
  const canonical = getCanonicalUrl(entry);
  const ownPath = entry.canonicalPath ?? normalizeLocation(location);
  return {
    title: entry.title,
    description: entry.description,
    robots: getRobotsDirective(entry),
    canonical,
    ogUrl: canonical ?? toAbsoluteUrl(ownPath),
    ogImage: getOgImageUrl(entry),
    twitterCard: TWITTER_CARD_TYPE,
  };
}

// --- Wayfinding helpers (consumed by RouteContextBar, Slice 2.18G) ------------
// Derive breadcrumb labels + a calm, human-readable route posture/index status
// from the EXISTING registry fields. This adds NO second route truth: every value
// below is a projection of `routeType` / `indexStatus` / `title` already declared
// above. Pure + dependency-free so the registry stays Node-loadable.

/** Human-readable route posture, projected from `routeType`. */
export type RoutePosture = "Public" | "Pending" | "Internal" | "Utility";

const ROUTE_POSTURE_BY_TYPE: Record<SeoRouteType, RoutePosture> = {
  PUBLIC: "Public",
  PENDING: "Pending",
  INTERNAL: "Internal",
  UTILITY: "Utility",
  API: "Internal",
  RETIRED: "Internal",
  UNKNOWN: "Utility",
};

/** Calm posture label for a route ("Public" / "Pending" / "Internal" / "Utility"). */
export function getRoutePostureLabel(entry: SeoRouteEntry): RoutePosture {
  return ROUTE_POSTURE_BY_TYPE[entry.routeType] ?? "Utility";
}

/** Human-readable indexing status, projected from `indexStatus`. */
export type RouteIndexLabel =
  | "Indexed"
  | "Noindex"
  | "Internal"
  | "Pending"
  | "Utility";

const ROUTE_INDEX_LABEL: Record<SeoIndexStatus, RouteIndexLabel> = {
  INDEX: "Indexed",
  NOINDEX: "Noindex",
  INTERNAL: "Internal",
  PENDING: "Pending",
  REDIRECT: "Noindex",
  UTILITY: "Utility",
};

/** Calm index-status label for a route ("Indexed" / "Noindex" / ...). */
export function getRouteIndexLabel(entry: SeoRouteEntry): RouteIndexLabel {
  return ROUTE_INDEX_LABEL[entry.indexStatus] ?? "Utility";
}

/**
 * Short wayfinding label for a route, derived from its SEO `title` (the segment
 * before a separating em/en dash, e.g. "Status — What's Live" → "Status").
 * Falls back to the full title when there is no separator.
 */
export function getRouteLabel(entry: SeoRouteEntry): string {
  const lead = entry.title.split(/\s+[—–-]\s+/)[0]?.trim();
  return lead && lead.length > 0 ? lead : entry.title;
}

/** Resolve the registry entry for a path (thin, named alias over `matchRoute`). */
export function getRouteSeoByPath(
  location: string,
  registry: SeoRouteEntry[] = seoRouteRegistry,
): SeoRouteEntry {
  return matchRoute(location, registry);
}

/** A single breadcrumb crumb (label + the path it links to). */
export interface RouteCrumb {
  label: string;
  path: string;
}

/** Resolved breadcrumb + posture context for the current location. */
export interface RouteBreadcrumb {
  /** Root crumb — always points at the public front door. */
  home: RouteCrumb;
  /** Current-page crumb, or null when the location IS the home route. */
  current: RouteCrumb | null;
  posture: RoutePosture;
  indexLabel: RouteIndexLabel;
  isHome: boolean;
  isNotFound: boolean;
}

/**
 * Resolve breadcrumb + posture/index context for a location in one call.
 * The trail is intentionally shallow (Home → current) because the app has a flat
 * route table — there are no nested route segments to model.
 */
export function getRouteBreadcrumb(location: string): RouteBreadcrumb {
  const normalized = normalizeLocation(location);
  const entry = matchRoute(normalized);
  const isHome = entry.path === "/";
  const isNotFound = entry.path === "*";
  return {
    home: { label: "Home", path: "/" },
    current: isHome
      ? null
      : { label: getRouteLabel(entry), path: isNotFound ? normalized : entry.path },
    posture: getRoutePostureLabel(entry),
    indexLabel: getRouteIndexLabel(entry),
    isHome,
    isNotFound,
  };
}
