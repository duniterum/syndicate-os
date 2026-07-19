import {
  Activity,
  Bell,
  TerminalSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { homepageStatus, type TruthStatus } from "./truthStatus";

// (S7 truth sweep, 2026-07-16: the dead `protocolSurfaces` config was
// DELETED — it had no consumer and still photographed the read-only era
// ("not wired" badges on the live membership/heartbeat/referral/archive
// organs). A live surface renders no not-live badge; dead config carrying
// stale claims is a lie waiting for an import.)

export interface AwaitingWiringItem {
  /** The item's own honest badge — no shared surface map needed here. */
  status: TruthStatus;
  title: string;
  note: string;
}

// M1-b truth sweep + S6 leakage sweep: this card lists ONLY what is genuinely
// pending AND publicly promised on the site (Identity Alias = the "SOON" slot
// in member settings; Notifications left this list 2026-07-19 — the bell and
// /notifications are LIVE and the fact moved to the live column). An INTERNAL
// plan never becomes a public promise (founder rule, guard-pinned — the
// Commission Router row died here 2026-07-15; the direct-payment fact lives
// in the LIVE column beside this card).
export const awaitingWiring: AwaitingWiringItem[] = [
  {
    status: "FUTURE_MODULE",
    title: "Identity Alias",
    note: "A human-readable name above the wallet hex — opt-in, default invisible, founder-curated. The chain will speak of persons.",
  },
];

export const seatCta = { label: "Take your seat", href: "/join" };

export const heroContent = {
  badge: homepageStatus.heroBadge,
  headlineLead: "Take your seat in",
  headlineEmphasis: "The Syndicate.",
  subheadline:
    "A transparent on-chain membership institution where every seat, receipt, and routed contribution becomes part of the public operating record.",
  primaryCta: seatCta,
  secondaryCta: { label: "View public proof", href: "/proof" },
  coreLabel: "Protocol Core",
  coreStatus: homepageStatus.heroCore,
};

export interface HowItWorksStep {
  step: string;
  title: string;
  description: string;
}

export const howItWorks = {
  title: "The Mechanics of Truth",
  subtitle: "The membership loop — a deterministic path from action to recognition.",
  steps: [
    {
      step: "01",
      title: "Join",
      description:
        "Take your seat. A verified Membership Sale receipt on the Avalanche C-Chain establishes your seat — recognized on-chain, never granted by hand.",
    },
    {
      step: "02",
      title: "Prove",
      description:
        "Every seat, receipt, and routed contribution is public, verifiable record — proof is read from the chain, never asserted.",
    },
    {
      step: "03",
      title: "Remember",
      description:
        "The protocol keeps memory: receipts, chronicle entries, and recognition are preserved as permanent, inspectable history.",
    },
    {
      step: "04",
      title: "Return",
      description:
        "Come back to your Member Home to read your standing, your receipt trail, and your next step — your own row, always yours.",
    },
    {
      step: "05",
      title: "Evolve",
      description:
        "Standing, chapters, and recognition evolve as verified history accumulates — structural standing, never a financial benefit.",
    },
  ] as HowItWorksStep[],
};

export interface OperationalItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

// M1-b truth sweep: the LIVE list told 2026-buildout truth ("app shell",
// "console foundation") while the protocol sells seats with real money and
// indexes its own history unattended. Rewritten to TODAY's operational facts.
export const operationalReality = {
  title: "Radical Honesty",
  subtitle: "What is operational today vs what genuinely does not exist yet.",
  liveHeading: "Operational Reality",
  pendingHeading: "Awaiting Wiring",
  statusCta: { label: "View Full Status Hub", href: "/status" },
  live: [
    {
      icon: TerminalSquare,
      title: "Seat Checkout",
      description:
        "Seats are bought in-page with real money — an exact live quote, signed from your own wallet, routed 70/20/10 by the contract.",
    },
    {
      icon: Activity,
      title: "Event Backbone",
      description:
        "The protocol indexes its own history unattended: seats, numbered burns, and referral lifecycle — served with verify anchors.",
    },
    {
      icon: ShieldCheck,
      title: "Referral Direct Payment",
      description:
        "Eligible referrers are paid inside the buyer's own transaction — nothing to claim, verifiable by hash.",
    },
    {
      icon: Bell,
      title: "Member notifications",
      description:
        "Every member carries an in-app inbox — the bell in the header, messages to you and announcements to all. The protocol never emails.",
    },
  ] as OperationalItem[],
};

// (Fossil sweep, 2026-07-19: the dead `studioPreview` + `studioPreviewPanel`
// configs — retired from the public home 2026-07-13 and unrendered since —
// were DELETED. Their sample rows still photographed the read-only era
// ("once the adapter is wired", "nothing is broadcast today") over organs
// that are live; dead config carrying stale claims is a lie waiting for an
// import.)

// ---------------------------------------------------------------------------
// Homepage recomposition copy (registry-driven sections).
// The Promoted Strip and Module Strip render from Module Registry v0
// (config/moduleRegistry.ts): labels/routes derive from the registry, live
// posture derives at render time (fail-closed), and only the marketing blurbs
// below live here — keyed by registryId so drift is impossible to hide.
// ---------------------------------------------------------------------------

/** Slim live trust strip under the hero — bound to GET /api/protocol/reality. */
export const trustStrip = {
  eyebrow: "Protocol reality",
  groups: [
    { key: "chain", label: "Chain identity" },
    { key: "sale", label: "Membership sale" },
    { key: "source", label: "Source registry" },
  ] as { key: "chain" | "sale" | "source"; label: string }[],
  reconciledNote: "live signals verified",
  failText: "Live posture unavailable — nothing is assumed.",
  links: [
    { label: "Status hub", href: "/status" },
    { label: "Public proof", href: "/proof" },
  ],
};

/** Marketing blurbs for PROMOTED_STRIP registry entries, keyed by registryId. */
export const homepagePromotedStrip = {
  eyebrow: "Act on the protocol",
  title: "Real surfaces, live and verifiable",
  subtitle:
    "Every door below opens onto live protocol reality. Reads are free and open; the one write — the join — is signed from your own wallet, with every figure shown before you sign.",
  blurbs: {
    "membership-join":
      "Read the live membership engine and compute an exact join quote — figures straight from the active engine, never estimated.",
    "verified-introduction":
      "Validate a referral code against the on-chain registry and build your referral link — a bounded commission per eligible completed introduction, never a paid role or salary.",
    "member-cockpit":
      "Sign a wallet session and read your own standing straight from the active engine — a self-readback; no directory of other wallets exists.",
    "protocol-reality":
      "Every public figure reconciles live chain reads against vendored canon — a mismatch fails closed, never an invented value.",
  } as Record<string, string>,
};

/** Slim strip of further public modules (MODULE_STRIP registry zone). */
export const homepageModuleStrip = {
  lead: "Also in the protocol",
  statusLink: {
    label: "Every module's honest status → Status hub",
    href: "/status",
  },
};

export const expectations = {
  title: "Expectations & Reality",
  body: "The Syndicate is an attribution and recognition protocol. Membership does not constitute an investment, security, or financial instrument, and carries no promise of financial gain. The systems provided serve as tools for verifiable truth and historical memory. Participants must rely on their own verification of on-chain reality before interacting.",
};

// ---------------------------------------------------------------------------
// S7 — MEMBER HOME (founder-approved wireframe, 2026-07-15): two states —
// the DOOR BAND (visitor: one human sentence, ONE connect CTA) and the
// YOUR-SEAT HERO (member). The old jargon facets and the stale stage table
// ("Member Home is a future surface", "Holder Index", PENDING_ADAPTER on
// live things) were retired with the recomposition — the Human-First Law.
// Two doctrine phrases below are FOUNDER-REQUIRED VERBATIM and guard-pinned
// (guard-access-state §16): "proves control of a wallet" · "session ≠
// membership". The own-row phrase "ever your own row" is the dist probe.
// ---------------------------------------------------------------------------
export const memberHome = {
  eyebrow: "Member Home",
  door: {
    title: "Your seat lives here.",
    lead: "This is Member Home. Connect your wallet and it reads your own record straight from the chain — the seat you hold, its receipt, and where you stand. You only ever see your own: no list of members to browse, and what little exists about you is served to you alone.",
    honestyControl:
      "Connecting proves control of a wallet — it doesn't give you a seat. Your seat is your membership: you take it on Join, and the chain writes it — numbered and permanent.",
    honestySafety:
      "No account, no email, no password — your wallet is your only key. Signing in moves no money; and we never hold your funds — taking a seat or clearing an approval is a transaction you sign yourself, in your own wallet.",
  },
  stepsHeading: "How a seat works",
  steps: [
    {
      title: "Your wallet is the identity",
      body: "No usernames, no accounts. Your self-custodied wallet is the only key — and this page can only ever read what the chain says about your own wallet.",
    },
    {
      title: "One purchase writes the seat",
      body: "A seat is taken on Join, signed from your own wallet. The purchase itself is your receipt — numbered, permanent, verifiable by anyone.",
    },
    {
      title: "Standing is read, never granted",
      body: "Member number, chapter, and footprint are read from on-chain history. Nothing is assigned by hand — and nothing is ever a financial promise.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Hero Motion System (public homepage flagship).
//
// DOCTRINE: this surface renders ILLUSTRATIVE protocol figures so the public
// front door can show the *shape* of the operating record. Nothing here is a
// live read. Every numeric figure is tagged SIMULATED via <SampleTag>; every
// fixed structural ratio (the 70/20/10 routing split) is tagged CANONICAL. No
// figure may render as current production data unless explicitly wired and labelled. No price, no per-token purchase framing,
// no wallet write — membership is recognised, never sold as an investment.
// ---------------------------------------------------------------------------

/**
 * Live-bound hero stat descriptor. `bind` names the field of `useHeroReality()`
 * that supplies the value; the components render an honest "Checking… /
 * Unavailable" state when the live read is null. `unit` is appended after the
 * live figure. There is NO static value here — no simulated figures exist.
 */
export interface HeroStat {
  id: string;
  label: string;
  bind:
    | "membersTotal"
    | "aggregateInflowUsdc"
    | "grossTotalUsdc"
    | "vaultUsdc"
    | "opsUsdc"
    | "lpReserves"
    | "burnedSyn";
  unit?: string;
  meta?: string;
}

/**
 * Cumulative-capital-source line. Either `bind` names a live read from
 * `useHeroReality()` (with optional `unit`), or `status` is the honest
 * non-live state text — never a fabricated figure.
 */
export interface HeroSource {
  id: string;
  label: string;
  bind?:
    | "aggregateInflowUsdc"
    | "attributionActivities"
    | "nftMintedTotal"
    | "nftRevenueUsdc"
    | "paidToReferrersUsdc";
  unit?: string;
  status?: string;
  note?: string;
}

export type RouteTone = "vault" | "liquidity" | "operations";

export interface HeroRoute {
  id: string;
  label: string;
  ratio: string;
  amount: string;
  tone: RouteTone;
}

export interface HeroSplit {
  id: string;
  label: string;
  ratio: number;
  tone: RouteTone;
}

export interface HeroFlowSource {
  id: string;
  label: string;
  /** The page this node opens; null = no page exists yet (node stays inert). */
  door: string | null;
  angle: number;
}

export interface HeroFlowRoute {
  id: string;
  label: string;
  ratio: string;
  tone: RouteTone;
  angle: number;
}

export const heroSystem = {
  // M1-a — the hero's first act, harvested from the origin's design LANGUAGE
  // (never its constraints: the origin was read-only; this is LIVE PRODUCTION —
  // seats are bought with real money, in-page, today). Copy is CONVERSION
  // register (CANON_PROTOCOL_LANGUAGE §7): every bold claim carries — or sits
  // next to — its verify path. Verify-link ids live in the components (the
  // HeroLedger pattern), never in this config.
  eyebrow: "The seat is the center",
  headlineLead: "A permanent, numbered seat,",
  headlineEmphasis: "written on-chain.",
  primaryCta: seatCta,

  // ① Honest LIVE/PENDING protocol posture chips. Static DECLARATIONS of
  // posture (no figures — the live reconciliation is the TrustStatusStrip and
  // /status). PENDING lists ONLY what is genuinely not deployed/wired today.
  statusChips: {
    live: [
      "SYN Token",
      "Seat Sale",
      "70/20/10 Routing",
      "LP Pool",
      "Referral Registry",
      "Proof of Burn",
    ],
    // S3 killed the PENDING row on the hero; S6 removed the dead list itself
    // (it carried an internal-plan name — the guard now pins that class).
    mobileNoteTail: "verify below",
  },

  // ③ The OS in plain words — what the public memory IS and why it matters.
  // Human sentences, zero jargon walls; the exact money-flow vocabulary
  // ("net contribution") is law, not style.
  explainer: [
    "The Syndicate is a membership institution that keeps its memory in public: every seat, every receipt, every burn is written to Avalanche, where anyone can read it.",
    "Join, and the contract writes your numbered seat into that record — permanent, verifiable, recognized on-chain rather than granted by hand.",
    "Every net contribution routes 70 / 20 / 10 to vault, liquidity and operations — enforced by the contract, and every figure on this page is a live chain read.",
  ],

  // ④ The living seat line — read from the chain, fail-closed. Speaks in
  // SEATS (memberCount() counts seats; one wallet can hold two — never
  // "Members"). The next-seat number is an INVITATION derived from the live
  // count; it disappears fail-closed when the read is unavailable. A member's
  // recorded seat number still ONLY ever comes from the emitted event.
  seatLine: {
    countSuffix: "seats on-chain",
    nextLead: "the next seat is",
    openNote: "open now",
    couldBeLead: "You could hold",
    couldBeTail: "— permanently recorded on Avalanche.",
    checking: "Reading the chain…",
    fallback: "Every seat is permanently recorded and verifiable on Avalanche.",
  },

  // ⑥ The quiet Inspect rail — the crypto-native actions a first-time visitor
  // scans for, one click away, never competing with the seat CTA.
  inspectRail: {
    lead: "Inspect",
    items: [
      { label: "Verify", href: "/proof" },
      { label: "Registry", href: "/contracts" },
      { label: "Token", href: "/tokenomics" },
      { label: "Liquidity", href: "/liquidity" },
    ],
  },

  // The centrepiece figure — LIVE gross cumulative on-chain inflow: membership
  // sales aggregate (V1+V2A+V2+V3) PLUS NFT artifact revenue (live mint price ×
  // live minted count), all read from GET /api/protocol/reality. The
  // provenance note is deliberate: the figure includes founder test
  // transactions during buildout and is NEVER framed as revenue.
  seat: {
    coreLabel: "Cumulative on-chain inflow",
    coreNote: "Live read · membership + NFT · incl. founder test transactions",
    coreUnavailable: "Live read unavailable",
    center: "The Seat",
    centerNote: "You are the institution",
  },

  // Radial flow diagram — THE LIVING MAP (M1-b). Inbound source nodes feed the
  // seat; the CANONICAL 70/20/10 split routes value out; Proof of Burn is the
  // one SYN outflow. STRUCTURAL LAW: no node carries a frozen `sub` string —
  // every sub-label is DERIVED from real status at render time
  // (SeatFlowDiagram's resolver over the live reads + the chronicle register),
  // so the map can never lie again by staying still. `door` = the page the
  // node opens (null = no page yet, the node stays inert). Package Sales is
  // NOT a node: packages are membership-sale tiers, not a distinct stream.
  flow: {
    sources: [
      { id: "membership", label: "Membership Sales", door: "/join", angle: 100 },
      { id: "chronicle", label: "Chronicle / Memory", door: "/chronicle", angle: 126 },
      { id: "nft", label: "NFT Artifacts", door: "/archive", angle: 153 },
      { id: "lpfees", label: "LP Pool", door: "/liquidity", angle: 207 },
      { id: "referrals", label: "Referrals", door: "/referral", angle: 234 },
      { id: "future", label: "Future Streams", door: null, angle: 260 },
    ] as HeroFlowSource[],
    routes: [
      { id: "vault", label: "Vault", ratio: "70%", tone: "vault", angle: 52 },
      { id: "liquidity", label: "Liquidity", ratio: "20%", tone: "liquidity", angle: 0 },
      { id: "operations", label: "Operations", ratio: "10%", tone: "operations", angle: -52 },
    ] as HeroFlowRoute[],
    // The SYN outflow node — real and live-readable (the numbered Proof of
    // Burn record); fills the map's bottom-right orbit slot.
    burn: { id: "burn", label: "Proof of Burn", door: "/fire-ledger" },
  },

  overview: {
    title: "Protocol overview",
    stats: [
      // Seats vocabulary law: memberCount() counts SEATS (one wallet can hold
      // two) — the stat never says "Members".
      { id: "members", label: "Seats", bind: "membersTotal", meta: "Live engine memberCount() · seats, not people" },
      { id: "gross", label: "Cumulative inflow", bind: "grossTotalUsdc", unit: "USDC", meta: "Membership + NFT · incl. founder test transactions" },
      { id: "vault", label: "Vault balance", bind: "vaultUsdc", unit: "USDC", meta: "70% routing target" },
      { id: "liquidity", label: "LP reserves", bind: "lpReserves", meta: "20% routing target" },
      { id: "operations", label: "Operations balance", bind: "opsUsdc", unit: "USDC", meta: "10% routing target" },
      { id: "burned", label: "Burned all-time", bind: "burnedSyn", unit: "SYN", meta: "Proof of Fire" },
    ] as HeroStat[],
    // The ONE chapter config — the hero overview card AND the header wordmark
    // badge read from here (M1-c: the header's "CH #001" literal died).
    chapter: { label: "Current chapter", value: "Genesis Signal", meta: "Chapter #1", badge: "CH #001" },
    // Chapter I window (#1–#333) comes from the vendored archive canon; the
    // filled count is the LIVE Holder Index memberTotal — never fabricated.
    seats: {
      label: "Seats recognised",
      chapterWindow: 333,
      chapterNote: "Chapter I window · seats #1–#333",
    },
  },

  // M1-b truth sweep: "coming with the event backbone" DIED — the backbone is
  // live in production and serves the complete receipt-line feed. The panel
  // renders the newest served lines, fail-closed to an honest unavailable note.
  activity: {
    title: "Live activity",
    doorLabel: "complete history →",
    doorHref: "/activity",
    unavailableNote:
      "The served activity feed is unavailable right now — nothing is invented. The complete history lives at /activity.",
  },

  sources: {
    title: "Cumulative capital sources",
    note: "Gross inflows are cumulative and never decrease.",
    items: [
      {
        id: "membership",
        label: "Membership Sales",
        bind: "aggregateInflowUsdc",
        unit: "USDC",
        note: "Incl. founder test transactions",
      },
      {
        // Money-forward: the card LEADS with the live contributed USDC figure
        // (mint price × minted count, both live chain reads); the minted
        // breakdown is the secondary line (computed live in HeroLedger).
        id: "nft",
        label: "NFT Artifacts",
        bind: "nftRevenueUsdc",
        unit: "contributed",
        note: "The First Signal + Patron Seal",
      },
      { id: "lpfees", label: "LP Fee Flow", status: "Not tracked yet" },
      {
        // M1-b: the apology note ("attribution only — not a commission
        // figure") DIED. Referrers are paid REAL money inside the buyer's own
        // transaction — the differentiator, stated as strength, verify-linked.
        id: "referrals",
        label: "Referrals",
        bind: "paidToReferrersUsdc",
        unit: "USDC",
        note: "Paid to referrers — inside the buyer's own transaction",
      },
      { id: "future", label: "Other / Future Streams", status: "Coming" },
    ] as HeroSource[],
  },

  routing: {
    title: "Current routed allocation",
    // Amounts are computed live: the canonical 70/20/10 shares of the real
    // MEMBERSHIP aggregate inflow (NFT revenue is NOT in this split), with the
    // live balances shown as the on-chain proof.
    routes: [
      { id: "vault", label: "Vault", ratio: "70%", tone: "vault" },
      { id: "liquidity", label: "Liquidity", ratio: "20%", tone: "liquidity" },
      { id: "operations", label: "Operations", ratio: "10%", tone: "operations" },
    ] as HeroRoute[],
    balanceNote: "Live balances confirm the routing",
    totalRoutedLabel: "Membership routed",
    // Honest per-stream allocation statement — each inflow stream declares
    // plainly where it goes. Only membership sales pass through the enforced
    // 70/20/10 contract split.
    allocation: [
      {
        id: "membership",
        label: "Membership sales",
        text: "70 / 20 / 10 vault · liquidity · operations — enforced on-chain.",
      },
      {
        id: "nft",
        label: "NFT / patronage",
        text: "Operations & protocol assets — declared, not the 70/20/10 split.",
      },
    ],
  },

  // Entry preview — illustrative contribution amounts routed by the CANONICAL
  // 70/20/10 split. Deliberately NO per-SYN price and NO "you receive N SYN"
  // purchase framing — membership is recognised, not sold as an investment.
  entryPreview: {
    title: "Entry Calculator",
    note: "Try any amount — it routes by the canonical 70 / 20 / 10 split.",
    readonlyNote: "A calculator — take your real seat on Join",
    amounts: [5, 10, 25, 50, 75],
    defaultAmount: 5,
    split: [
      { id: "vault", label: "Vault", ratio: 0.7, tone: "vault" },
      { id: "liquidity", label: "Liquidity", ratio: 0.2, tone: "liquidity" },
      { id: "operations", label: "Operations", ratio: 0.1, tone: "operations" },
    ] as HeroSplit[],
  },

  disclaimer:
    "Every figure on this page is read live from the Avalanche blockchain — nothing is invented. When a live read is briefly unavailable, we say so instead of guessing. The 70 / 20 / 10 routing is canonical; the entry calculator is a demonstration — your real entry happens on Join, signed from your own wallet.",
};

