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
    iconClass: "text-orange-500",
  },
  {
    id: "sourceAttribution",
    homeLabel: "Source Attribution",
    homeBlurb: "Cryptographic proof of network origin and source attribution.",
    truthStatus: surfaceStatus.sourceAttribution,
    icon: Network,
    iconClass: "text-cyan-500",
  },
  {
    id: "archive",
    homeLabel: "Archive / Memory",
    homeBlurb: "Historical preservation of protocol actions and recognition.",
    truthStatus: surfaceStatus.archive,
    icon: Database,
    iconClass: "text-purple-500",
  },
];

export interface AwaitingWiringItem {
  surfaceId: SurfaceId;
  title: string;
  note: string;
}

export const awaitingWiring: AwaitingWiringItem[] = [
  {
    surfaceId: "membership",
    title: "Membership State",
    note: "Membership contracts are vendored read-only; the live membership indexer is not wired.",
  },
  {
    surfaceId: "proofOfFire",
    title: "Proof of Fire Events",
    note: "Protocol event taxonomy is vendored; the live event adapter is not wired.",
  },
  {
    surfaceId: "sourceAttribution",
    title: "Source Attribution",
    note: "Source registry ABI is vendored; the live source indexer is not wired.",
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
        "Come back to your Member OS to read your standing, your receipt trail, and your next step — always read-only, always yours.",
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

export const operationalReality = {
  title: "Radical Honesty",
  subtitle: "What is operational today vs awaiting source integration.",
  liveHeading: "Operational Reality",
  pendingHeading: "Awaiting Wiring",
  statusCta: { label: "View Full Status Hub", href: "/status" },
  live: [
    {
      icon: TerminalSquare,
      title: "Public App Shell",
      description: "The architecture, navigation, and structural layouts are live.",
    },
    {
      icon: Activity,
      title: "Truth-Label System",
      description: "Strict visual markers preventing deception across all surfaces.",
    },
    {
      icon: ShieldCheck,
      title: "Studio OS Foundation",
      description: "The internal console shell for data presentation is built.",
    },
  ] as OperationalItem[],
};

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
      detail: "Verified-introduction links, once the source indexer is wired.",
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
  note: "Illustrative — a sample of the console's read-only surfaces. No live protocol data is shown here; each row carries its own honest status.",
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
  title: "Real surfaces, read-only by design",
  subtitle:
    "Every door below opens onto live protocol reality. Nothing on this site sends a transaction — you read, verify, and act on-chain yourself.",
  blurbs: {
    "membership-join":
      "Read the live membership engine and compute an exact join quote — figures straight from the active engine, never estimated.",
    "verified-introduction":
      "Validate an introduction id against the on-chain registry and build an attribution link — recognition, never a paid role.",
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
    "Seat issuance from this app remains founder-gated: no transaction is ever initiated, signed, or submitted here. The only live figure is the self-readback of your own signed wallet's standing — no balances, no member directory, no other wallet's record.",
  ],
};

export interface IdentityStage {
  step: string;
  title: string;
  body: string;
  lifecycle: DisplayLifecycle;
}

// The wallet-as-identity organism, recovered as read-only doctrine. Each stage
// carries an HONEST lifecycle: the wallet/chain identity is verifiable today
// (see /status), receipt → index → derived facts are real architecture pending
// the live indexer (PENDING_ADAPTER), and the member cockpit is FUTURE. Nothing
// here implies a active wallet connector, active buy flow, or a granted seat.
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
      body: "A verified on-chain purchase receipt is the proof that establishes a seat — the spine the entire member read-model hangs off. No buy flow is wired in this app; receipts are read, never minted here.",
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
      title: "Member OS",
      body: "Your member cockpit surfaces seat, receipts, archive holdings, and next actions once the indexer resolves them. It is a future surface, not live today.",
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

export interface HeroProofRailItem {
  mark: string;
  label: string;
  note: string;
  tone: "avax" | "gold" | "cyan";
}

/**
 * Live-bound hero stat descriptor. `bind` names the field of `useHeroReality()`
 * that supplies the value; the components render an honest "Checking… /
 * Unavailable" state when the live read is null. `unit` is appended after the
 * live figure. There is NO static value here — no simulated figures exist.
 */
export interface HeroStat {
  id: string;
  label: string;
  bind: "membersTotal" | "aggregateInflowUsdc" | "vaultUsdc" | "opsUsdc" | "lpReserves" | "burnedSyn";
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
  bind?: "aggregateInflowUsdc" | "attributionActivities";
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
  sub: string;
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
  eyebrow: "The seat is the center",
  headlineLead: "Take your seat in a living",
  headlineEmphasis: "protocol.",
  subheadline:
    "A transparent on-chain membership institution where every seat, receipt, and routed contribution becomes part of the public operating record.",
  primaryCta: seatCta,
  secondaryCta: { label: "View public proof", href: "/proof" },

  proofRail: [
    { mark: "A", label: "Avalanche", note: "Target C-Chain", tone: "avax" },
    { mark: "70", label: "Canonical", note: "70 / 20 / 10", tone: "gold" },
    { mark: "✓", label: "Public proof", note: "Read-only", tone: "cyan" },
    { mark: "◇", label: "Memory", note: "Recorded", tone: "gold" },
  ] as HeroProofRailItem[],

  // The centrepiece figure — LIVE cumulative on-chain inflow (count-up to the
  // real aggregate V1+V2A+V2+V3 read from GET /api/protocol/reality). The
  // provenance note is deliberate: the figure includes founder test
  // transactions during buildout and is NEVER framed as revenue.
  seat: {
    coreLabel: "Cumulative on-chain inflow",
    coreNote: "Live read · includes founder test transactions",
    coreUnavailable: "Live read unavailable",
    center: "The Seat",
    centerNote: "You are the institution",
  },

  // Radial flow diagram. Inbound source nodes feed the seat; the CANONICAL
  // 70/20/10 split routes value out. Each node's `sub` line is its honest
  // state — only Membership Sales is a live on-chain stream today. Package
  // Sales is NOT a node: packages are membership-sale tiers, not a distinct
  // on-chain stream. NFT and LP Fee Flow stay DISTINCT nodes (never "LP NFT").
  flow: {
    sources: [
      { id: "membership", label: "Membership Sales", sub: "Live · on-chain", angle: 100 },
      { id: "chronicle", label: "Chronicle / Memory", sub: "Recorded", angle: 126 },
      { id: "nft", label: "NFT", sub: "Not live yet", angle: 153 },
      { id: "lpfees", label: "LP Fee Flow", sub: "Not tracked yet", angle: 207 },
      { id: "referrals", label: "Verified Introductions", sub: "Attribution only", angle: 234 },
      { id: "future", label: "Future Streams", sub: "Coming", angle: 260 },
    ] as HeroFlowSource[],
    routes: [
      { id: "vault", label: "Vault", ratio: "70%", tone: "vault", angle: 52 },
      { id: "liquidity", label: "Liquidity", ratio: "20%", tone: "liquidity", angle: 0 },
      { id: "operations", label: "Operations", ratio: "10%", tone: "operations", angle: -52 },
    ] as HeroFlowRoute[],
  },

  overview: {
    title: "Protocol overview",
    liveNote: "Live · read-only",
    stats: [
      { id: "members", label: "Members", bind: "membersTotal", meta: "Holder Index · recognised seats" },
      { id: "gross", label: "Cumulative inflow", bind: "aggregateInflowUsdc", unit: "USDC", meta: "Incl. founder test transactions" },
      { id: "vault", label: "Vault balance", bind: "vaultUsdc", unit: "USDC", meta: "70% routing target" },
      { id: "liquidity", label: "LP reserves", bind: "lpReserves", meta: "20% routing target" },
      { id: "operations", label: "Operations balance", bind: "opsUsdc", unit: "USDC", meta: "10% routing target" },
      { id: "burned", label: "Burned all-time", bind: "burnedSyn", unit: "SYN", meta: "Proof of Fire" },
    ] as HeroStat[],
    chapter: { label: "Current chapter", value: "Genesis Signal", meta: "Chapter #1" },
    // Chapter I window (#1–#333) comes from the vendored archive canon; the
    // filled count is the LIVE Holder Index memberTotal — never fabricated.
    seats: {
      label: "Seats recognised",
      chapterWindow: 333,
      chapterNote: "Chapter I window · seats #1–#333",
    },
  },

  activity: {
    title: "Recent activity",
    // Honest empty state — NO fabricated activity items are ever shown.
    comingNote: "Live activity feed coming with the event backbone.",
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
      { id: "nft", label: "NFT", status: "Not live yet" },
      { id: "lpfees", label: "LP Fee Flow", status: "Not tracked yet" },
      {
        id: "referrals",
        label: "Verified Introductions",
        bind: "attributionActivities",
        unit: "attribution activities",
        note: "Activity count — no commission",
      },
      { id: "future", label: "Other / Future Streams", status: "Coming" },
    ] as HeroSource[],
  },

  routing: {
    title: "Current routed allocation",
    // Amounts are computed live: the canonical 70/20/10 shares of the real
    // aggregate inflow, with the live balances shown as the on-chain proof.
    routes: [
      { id: "vault", label: "Vault", ratio: "70%", tone: "vault" },
      { id: "liquidity", label: "Liquidity", ratio: "20%", tone: "liquidity" },
      { id: "operations", label: "Operations", ratio: "10%", tone: "operations" },
    ] as HeroRoute[],
    balanceNote: "Live balances confirm the routing",
  },

  // Entry preview — illustrative contribution amounts routed by the CANONICAL
  // 70/20/10 split. Deliberately NO per-SYN price and NO "you receive N SYN"
  // purchase framing — membership is recognised, not sold as an investment.
  entryPreview: {
    title: "Entry Preview",
    note: "Illustrative — a simulated entry routes by the canonical 70 / 20 / 10 split.",
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
    "Financial figures are live read-only on-chain reads (server-cached, fail-closed to an honest unavailable state). Structural ratios are canonical; illustrative elements are labelled.",
};

