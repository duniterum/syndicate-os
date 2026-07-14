import {
  Users,
  Activity,
  Network,
  Database,
  TerminalSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import {
  surfaceStatus,
  homepageStatus,
  type TruthStatus,
  type SurfaceId,
  type DisplayLifecycle,
} from "./truthStatus";

export interface ProtocolSurface {
  id: SurfaceId;
  homeLabel: string;
  homeBlurb: string;
  truthStatus: TruthStatus;
  icon: LucideIcon;
  iconClass: string;
}

export const protocolSurfaces: ProtocolSurface[] = [
  {
    id: "membership",
    homeLabel: "Membership",
    homeBlurb: "Immutable records of protocol seats and historical standing.",
    truthStatus: surfaceStatus.membership,
    icon: Users,
    iconClass: "text-primary",
  },
  {
    id: "proofOfFire",
    homeLabel: "Proof of Fire",
    homeBlurb: "Verifiable burn records mapped directly to member attribution.",
    truthStatus: surfaceStatus.proofOfFire,
    icon: Activity,
    iconClass: "text-viz-5",
  },
  {
    id: "sourceAttribution",
    homeLabel: "Source Attribution",
    homeBlurb: "Cryptographic proof of network origin and source attribution.",
    truthStatus: surfaceStatus.sourceAttribution,
    icon: Network,
    iconClass: "text-viz-1",
  },
  {
    id: "archive",
    homeLabel: "Archive / Memory",
    homeBlurb: "Historical preservation of protocol actions and recognition.",
    truthStatus: surfaceStatus.archive,
    icon: Database,
    iconClass: "text-viz-3",
  },
];

export interface AwaitingWiringItem {
  /** The item's own honest badge — no shared surface map needed here. */
  status: TruthStatus;
  title: string;
  note: string;
}

// M1-b truth sweep: the old three "not wired" claims were YESTERDAY'S truth —
// the membership indexer, the protocol event lanes, and the source indexer all
// run live in production today. This card now lists ONLY what genuinely does
// not exist yet; each item carries its own honest status badge.
export const awaitingWiring: AwaitingWiringItem[] = [
  {
    status: "NOT_LIVE",
    title: "Commission Router",
    note: "The routed-commission contract is not deployed. Referrers are paid today by the direct-payment model — inside the buyer's own transaction, enforced by the sale contract.",
  },
  {
    status: "FUTURE_MODULE",
    title: "Identity Alias",
    note: "A human-readable name above the wallet hex — opt-in, default invisible, founder-curated. The chain will speak of persons.",
  },
  {
    status: "FUTURE_MODULE",
    title: "Notifications",
    note: "Member notifications ride the event backbone's served feed; the bell is reserved in the header today.",
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
  ] as OperationalItem[],
};

// RETIRED FROM THE PUBLIC HOME (founder decision, 2026-07-13): the teaser
// promoted an operator category on a public view (locked-vs-hidden law). Its
// intent — "members see us advancing" — belongs to the future public Roadmap
// page (Phase-2 slice 2.8, registry-driven). Config kept for that reuse; no
// public surface renders it today.
export const studioPreview = {
  title: "Studio OS Console",
  description:
    "Access the operational proof console. It currently serves as the foundational shell; protocol data is awaiting source wiring.",
  cta: { label: "Open Studio OS", href: "/studio" },
  mockStatus: "DESIGN_PREVIEW" as TruthStatus,
};

/**
 * Illustrative "OS Preview" for the homepage Studio teaser (right half).
 * These are SAMPLE rows, not live data: the panel header carries an
 * "Illustrative" SampleTag and every row carries its own honest lifecycle
 * label. No figure here is read from any source — it conveys the shape of the
 * operator console only. Rendered by PublicHome.tsx (Homepage governance
 * rule 7: homepage copy lives here, not as inline strings).
 */
export const studioPreviewPanel = {
  eyebrow: "OS Preview",
  rows: [
    {
      id: "proof",
      label: "Proof of Fire",
      lifecycle: "PENDING_ADAPTER",
      detail: "On-chain proof events, once the event adapter is wired.",
    },
    {
      id: "source",
      label: "Source attribution",
      lifecycle: "PENDING_ADAPTER",
      detail: "Per-member referral histories, once the introduction indexer is wired.",
    },
    {
      id: "activity",
      label: "Activity chronicle",
      lifecycle: "FUTURE",
      detail: "A public activity timeline is a separate founder-gated slice.",
    },
    {
      id: "receipts",
      label: "Membership receipts",
      lifecycle: "PENDING_ADAPTER",
      detail: "Member-facing receipt views await the membership indexer.",
    },
    {
      id: "knowledge",
      label: "Knowledge OS",
      lifecycle: "FUTURE",
      detail: "Guided learn, verify, and inspect surfaces — a future concept.",
    },
    {
      id: "notices",
      label: "Notice OS",
      lifecycle: "FUTURE",
      detail: "Read-only protocol notices; no broadcast is wired.",
    },
    {
      id: "admin",
      label: "Admin gates",
      lifecycle: "FOUNDER_GATED",
      detail: "Operator controls stay founder-gated and read-only.",
    },
  ] as {
    id: string;
    label: string;
    lifecycle: DisplayLifecycle;
    detail: string;
  }[],
  note: "Preview — a sample of the console's read-only surfaces. No live protocol data is shown here; each row carries its own honest status.",
};

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
  reconciledNote: "read-only signals reconciled",
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

export const memberAccess = {
  heading: "Membership is your wallet",
  intro:
    "In The Syndicate, your wallet address is your identity — there is no account to create. Membership is not granted by a form; it is recognized from a verified on-chain Membership Sale receipt and resolved through the Holder Index into a member record. One thing is live here today, read-only: sign a wallet session below and this page reads YOUR signed wallet's own standing straight from the active engine (a self-readback — no directory of other wallets exists). The historical member record (seats #1–#8) stays verified server-side against the on-chain freeze root and is not published; every other value below stays truth-labelled rather than simulated.",
  points: [
    "Your self-custodied wallet address is the identity key — no usernames, no passwords, no accounts.",
    "Membership is recognized, not requested: a verified Membership Sale receipt is what establishes a seat.",
    "Member number, chapter, and recognition standing are derived facts read from on-chain history — never assigned by hand.",
    "Taking a seat is live on Join — two signatures from your own wallet. This page stays a read-only self-readback of your own signed wallet's standing — no balances, no member directory, no other wallet's record.",
  ],
};

export interface IdentityStage {
  step: string;
  title: string;
  body: string;
  lifecycle: DisplayLifecycle;
}

// The wallet-as-identity organism. Each stage carries an HONEST lifecycle:
// the wallet/chain identity is verifiable today (see /status), receipt →
// index → derived facts are real architecture pending the live indexer
// (PENDING_ADAPTER), and Member Home is FUTURE. Since the C5 go-live
// (founder, 2026-07-13) the buy flow IS live on /join — signed from the
// visitor's own wallet; nothing here grants a seat by itself.
export const membershipIdentity = {
  heading: "How membership identity works",
  lead: "A deterministic chain from wallet to recognition. Each stage is labelled for exactly how real it is in this foundation — no stage is simulated.",
  stages: [
    {
      step: "01",
      title: "Wallet address",
      body: "Your self-custodied wallet on the Avalanche C-Chain is your decentralized identity key. Inspecting a wallet here would only ever read public facts — never a transaction, signature, or write — and that inspection is not wired in this foundation yet.",
      lifecycle: "PENDING_ADAPTER",
    },
    {
      step: "02",
      title: "Membership Sale receipt",
      body: "A verified on-chain purchase receipt is the proof that establishes a seat — the spine the entire member read-model hangs off. The buy flow is live on Join (two signatures from your own wallet); the receipt event is what establishes the seat, and this page only reads it.",
      lifecycle: "PENDING_ADAPTER",
    },
    {
      step: "03",
      title: "Holder Index",
      body: "The receipt is resolved through the Holder Index, which reconstructs membership identity from on-chain history. The historical member record is verified server-side against the on-chain freeze root, and a server-only foundation of the Holder Index read-model now derives and reconciles member continuity internally — nothing is persisted or surfaced yet.",
      lifecycle: "PENDING_ADAPTER",
    },
    {
      step: "04",
      title: "Member number, chapter & rank",
      body: "Your member number, chapter, and recognition standing are derived facts — read from verified history, never assigned by hand. Recognition is structural standing, never a financial benefit.",
      lifecycle: "PENDING_ADAPTER",
    },
    {
      step: "05",
      title: "Member Home",
      body: "Your Member Home surfaces seat, receipts, archive holdings, and next actions once the indexer resolves them. It is a future surface, not live today.",
      lifecycle: "FUTURE",
    },
    {
      step: "06",
      title: "Activity & proof",
      body: "Verified protocol events become your public, shareable proof of participation. The event adapter that reads them is not wired here yet.",
      lifecycle: "PENDING_ADAPTER",
    },
  ] as IdentityStage[],
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
    pending: ["Commission Router", "Identity Alias", "Notifications"],
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
    title: "Entry Preview",
    note: "Preview — a simulated entry routes by the canonical 70 / 20 / 10 split.",
    readonlyNote: "Read-only preview · No transaction",
    amounts: [5, 10, 25, 50, 75],
    defaultAmount: 5,
    split: [
      { id: "vault", label: "Vault", ratio: 0.7, tone: "vault" },
      { id: "liquidity", label: "Liquidity", ratio: 0.2, tone: "liquidity" },
      { id: "operations", label: "Operations", ratio: 0.1, tone: "operations" },
    ] as HeroSplit[],
  },

  disclaimer:
    "Every figure on this page is read live from the Avalanche blockchain — nothing is invented. When a live read is briefly unavailable, we say so instead of guessing. The 70 / 20 / 10 routing is canonical, and anything marked Preview is a demonstration, not live data.",
};

