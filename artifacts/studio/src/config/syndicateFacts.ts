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

export const seatCta = { label: "Take your seat", href: "/member" };

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
  subtitle: "A deterministic path from action to recognition.",
  steps: [
    {
      step: "01",
      title: "Take Your Seat",
      description: "Your wallet is your identity; a verified Membership Sale receipt establishes your seat — recognized, not granted by hand.",
    },
    {
      step: "02",
      title: "Record Attribution",
      description: "All attribution paths and proofs are permanently anchored to your identity.",
    },
    {
      step: "03",
      title: "Verify & Operate",
      description: "Enter the Studio OS or Member OS to view transparent, read-only data.",
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

export const expectations = {
  title: "Expectations & Reality",
  body: "The Syndicate is an attribution and recognition protocol. Membership does not constitute an investment, security, or financial instrument, and carries no promise of financial gain. The systems provided serve as tools for verifiable truth and historical memory. Participants must rely on their own verification of on-chain reality before interacting.",
};

export const memberAccess = {
  heading: "Membership is your wallet",
  intro:
    "In The Syndicate, your wallet address is your identity — there is no account to create. Membership is not granted by a form; it is recognized from a verified on-chain Membership Sale receipt and resolved through the Holder Index into a member record. The historical member record (seats #1–#8) has been verified server-side against the on-chain freeze root, but none of that resolution is surfaced in this read-only foundation yet, so every value below stays truth-labelled rather than simulated.",
  points: [
    "Your self-custodied wallet address is the identity key — no usernames, no passwords, no accounts.",
    "Membership is recognized, not requested: a verified Membership Sale receipt is what establishes a seat.",
    "Member number, chapter, and recognition standing are derived facts read from on-chain history — never assigned by hand.",
    "Seat issuance is operationally founder-gated and not active in this app today; until the membership indexer is wired and approved, no live seat, balance, or member record is shown.",
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

export interface HeroTrustChip {
  label: string;
  note: string;
}

export interface HeroStat {
  id: string;
  label: string;
  value: string;
  meta?: string;
  kind: "simulated" | "canonical";
}

export interface HeroSource {
  id: string;
  label: string;
  value: string;
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

export interface HeroActivity {
  id: string;
  event: string;
  meta: string;
  time: string;
}

export interface HeroFlowSource {
  id: string;
  label: string;
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

  trustChips: [
    { label: "Verifiable", note: "On-chain records" },
    { label: "Transparent", note: "Every route" },
    { label: "Permanent", note: "Recorded to last" },
    { label: "Read-only", note: "No writes, no wallet" },
  ] as HeroTrustChip[],

  // The centrepiece figure — simulated cumulative gross inflow (count-up).
  seat: {
    coreLabel: "Gross all-time capital inflow",
    coreValue: 16500000,
    coreDisplay: "$16,500,000+",
    coreNote: "Recorded · cumulative · never decreases",
    center: "The Seat",
    centerNote: "You are the institution",
  },

  // Radial flow diagram. Inbound capital sources (illustrative) feed the seat;
  // the CANONICAL 70/20/10 split routes value out. Node labels use the canonical
  // source taxonomy; the same names carry into `sources` (Cumulative Capital
  // Sources) below. NFT and LP Fee Flow are DISTINCT nodes (never a combined "LP NFT").
  flow: {
    sources: [
      { id: "membership", label: "Membership Sales", angle: 100 },
      { id: "chronicle", label: "Chronicle / Memory", angle: 126 },
      { id: "nft", label: "NFT", angle: 153 },
      { id: "package", label: "Package Sales", angle: 180 },
      { id: "lpfees", label: "LP Fee Flow", angle: 207 },
      { id: "referrals", label: "Referral Commissions", angle: 234 },
      { id: "future", label: "Future Streams", angle: 260 },
    ] as HeroFlowSource[],
    routes: [
      { id: "vault", label: "Vault", ratio: "70%", tone: "vault", angle: 52 },
      { id: "liquidity", label: "Liquidity", ratio: "20%", tone: "liquidity", angle: 0 },
      { id: "operations", label: "Operations", ratio: "10%", tone: "operations", angle: -52 },
    ] as HeroFlowRoute[],
  },

  overview: {
    title: "Protocol overview",
    stats: [
      { id: "members", label: "Members", value: "9,245", meta: "Recognised seats", kind: "simulated" },
      { id: "gross", label: "Gross all-time", value: "$16.50M", meta: "Since inception", kind: "simulated" },
      { id: "vault", label: "Vault holdings", value: "$11.55M", meta: "70% of routed inflow", kind: "simulated" },
      { id: "liquidity", label: "Liquidity TVL", value: "$3.30M", meta: "20% of routed inflow", kind: "simulated" },
      { id: "lpFees", label: "LP Fee Flow", value: "$1.42M", meta: "All-time", kind: "simulated" },
      { id: "burned", label: "Burned All-Time", value: "2,000 SYN", meta: "Proof of Fire", kind: "simulated" },
    ] as HeroStat[],
    chapter: { label: "Current chapter", value: "Genesis Signal", meta: "Chapter #1" },
    seats: { label: "Seats filled", filled: 214, total: 333, pct: 64 },
  },

  activity: {
    title: "Recent activity",
    items: [
      { id: "a1", event: "New member recognised — Seat #234", meta: "Membership Sale receipt", time: "12m" },
      { id: "a2", event: "Proof of Fire recorded", meta: "Attribution anchored", time: "17m" },
      { id: "a3", event: "Chronicle entry recorded", meta: "Genesis Signal", time: "30m" },
      { id: "a4", event: "Introduction verified", meta: "Source attribution", time: "41m" },
    ] as HeroActivity[],
  },

  sources: {
    title: "Cumulative capital sources",
    note: "Gross inflows are cumulative and never decrease.",
    items: [
      { id: "membership", label: "Membership Sales", value: "$11.25M" },
      { id: "nft", label: "NFT Sales", value: "$2.65M" },
      { id: "package", label: "Package Sales", value: "$1.35M" },
      { id: "lpfees", label: "LP Fee Flow", value: "$1.42M" },
      { id: "referrals", label: "Referral Commissions", value: "$820K" },
      { id: "future", label: "Other / Future Streams", value: "$430K" },
    ] as HeroSource[],
  },

  routing: {
    title: "Current routed allocation",
    total: "$16.50M",
    routes: [
      { id: "vault", label: "Vault", ratio: "70%", amount: "$11.55M", tone: "vault" },
      { id: "liquidity", label: "Liquidity", ratio: "20%", amount: "$3.30M", tone: "liquidity" },
      { id: "operations", label: "Operations", ratio: "10%", amount: "$1.65M", tone: "operations" },
    ] as HeroRoute[],
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
    "Illustrative preview — figures are simulated, not live protocol data. Structural ratios are canonical.",
};

