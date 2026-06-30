import {
  Users,
  Activity,
  Network,
  Database,
  TerminalSquare,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { surfaceStatus, homepageStatus, type TruthStatus, type SurfaceId } from "./truthStatus";

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

export const seatCta = { label: "Request a seat", href: "/member" };

export const heroContent = {
  badge: homepageStatus.heroBadge,
  headlineLead: "Verifiable truth for the",
  headlineEmphasis: "next era of membership.",
  subheadline:
    "A read-only foundation shell for protocol attribution, memory, and transparent recognition. Built on undeniable on-chain reality.",
  primaryCta: seatCta,
  secondaryCta: { label: "Verify proof", href: "/proof" },
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
      title: "Request Your Seat",
      description: "Establish your initial protocol presence through verifiable interaction.",
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
  heading: "Request a Seat",
  intro:
    "Membership access to The Syndicate is founder-gated and not live yet. This page is an honest, read-only placeholder until real membership wiring is reviewed and approved.",
  points: [
    "Membership is not live yet — no seats can be issued or reserved at this stage.",
    "Seat requests and membership access are founder-gated and granted manually by the founder.",
    "The protocol is awaiting verified source integration before any membership record can be shown.",
    "Until that wiring is approved, every membership value here stays truth-labelled rather than simulated.",
  ],
};
