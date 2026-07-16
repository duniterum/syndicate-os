import {
  Home,
  TerminalSquare,
  ShieldCheck,
  BoxSelect,
  Users,
  Briefcase,
  Network,
  Award,
  Library,
  BookOpen,
  Coins,
  HelpCircle,
  Activity,
  FileText,
  Share2,
  LifeBuoy,
  Archive,
  UserPlus,
  Link2,
  LayoutDashboard,
  Map as MapIcon,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import type { TruthStatus } from "./truthStatus";
import { surfaceStatus } from "./truthStatus";
import type { FeatureFlag } from "./featureFlags";

export type ModuleZone = "public" | "studio" | "member" | "founder" | "system";
export type ModulePhase = "live" | "draft" | "future";

export interface NavPlacement {
  header: boolean;
  sidebar: boolean;
  footer: boolean;
}

export interface SyndicateModule {
  id: string;
  label: string;
  sidebarLabel?: string;
  path: string;
  zone: ModuleZone;
  visible: boolean;
  enabled: boolean;
  live: boolean;
  phase: ModulePhase;
  truthStatus?: TruthStatus;
  description: string;
  dependencies: readonly string[];
  nav: NavPlacement;
  icon: LucideIcon;
  flag?: FeatureFlag;
}

// One module list, two audiences. `nav` controls placement:
//   - header  → public marketing header (kept concise: Home / Proof / Learn / Status)
//   - sidebar → operator console (Studio OS, Proof Studio, Source, Founder)
//   - footer  → public footer (grouped in navigation.ts)
export const modules = [
  {
    id: "home",
    label: "Home",
    path: "/",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description: "Public front door for The Syndicate.",
    dependencies: [],
    nav: { header: true, sidebar: false, footer: false },
    icon: Home,
    flag: "publicHomepage",
  },
  {
    id: "studio",
    label: "Studio OS",
    sidebarLabel: "Overview",
    path: "/studio",
    zone: "studio",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description: "Operator console overview for the proof foundation.",
    dependencies: [],
    nav: { header: false, sidebar: true, footer: true },
    icon: TerminalSquare,
    flag: "studioShell",
  },
  {
    id: "os-map",
    label: "Protocol OS Map",
    sidebarLabel: "OS Map",
    path: "/os-map",
    zone: "studio",
    visible: true,
    enabled: true,
    live: false,
    phase: "draft",
    truthStatus: "DESIGN_PREVIEW",
    description:
      "Internal founder preview mapping the full protocol organism — every subsystem with its honest status. Not a live product surface.",
    dependencies: [],
    nav: { header: false, sidebar: true, footer: false },
    icon: Network,
  },
  {
    id: "admin",
    label: "Admin Console",
    sidebarLabel: "Admin",
    path: "/admin",
    zone: "studio",
    visible: true,
    enabled: true,
    live: false,
    phase: "draft",
    truthStatus: "DESIGN_PREVIEW",
    description:
      "Operator console skeleton — read-only panels over the module registry and live postures. No write controls exist.",
    dependencies: [],
    nav: { header: false, sidebar: true, footer: false },
    icon: LayoutDashboard,
  },
  {
    id: "proof",
    label: "Proof",
    path: "/proof",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    // S7 truth sweep (2026-07-16): the "not live yet" badge DIED — the event
    // backbone serves the complete heartbeat (a live surface renders no
    // TruthLabel; the /join precedent).
    description: "Verify the protocol: receipts, routing, numbered burns and referral payments — read live, each with its verify link.",
    dependencies: [],
    nav: { header: true, sidebar: false, footer: true },
    icon: ShieldCheck,
    flag: "proofDashboard",
  },
  {
    id: "proof-studio",
    label: "Proof Studio",
    path: "/proof-studio",
    zone: "studio",
    visible: true,
    enabled: true,
    live: false,
    phase: "draft",
    truthStatus: "DESIGN_PREVIEW",
    description: "Draft tooling to configure protocol recognition events (disabled).",
    dependencies: ["eventAdapter"],
    nav: { header: false, sidebar: true, footer: false },
    icon: BoxSelect,
    flag: "proofStudioDraft",
  },
  {
    id: "member",
    label: "Membership",
    path: "/member",
    zone: "member",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    // S7 truth sweep (2026-07-16): "AWAITING_FOUNDER_APPROVAL / draft" was a
    // fossil — the founder switched auth ON (2026-07-11) and Member Home is a
    // live production surface (session, own seat, receipt, referral standing).
    description:
      "Member Home: connect your wallet and read your own record live — seat, receipt, referral standing. Only ever your own row; nothing is written from this app.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: Users,
    flag: "membershipLive",
  },
  {
    id: "join",
    label: "Join",
    path: "/join",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "Read the live membership engine, compute an exact join quote, and complete the join — two signatures from your own wallet; the app never holds your funds.",
    dependencies: [],
    nav: { header: true, sidebar: false, footer: true },
    icon: UserPlus,
  },
  {
    id: "source-link",
    label: "Referral Link",
    path: "/source",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "Validate a referral code against the on-chain registry and build a shareable referral link — read-only; nothing is created or activated here.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: Link2,
  },
  {
    id: "source",
    label: "Source Attribution",
    sidebarLabel: "Source (Operator)",
    path: "/os-source",
    zone: "studio",
    visible: true,
    enabled: false,
    live: false,
    phase: "future",
    // AUD-TRUTH (2026-07-16): the retired sourceAttribution reason code no
    // longer renders on /status — the badge now describes THIS console's own
    // honest state (a preview), never the live-and-paying referral program.
    truthStatus: "DESIGN_PREVIEW",
    description:
      "Operator source console. Read-only; source creation and activation remain owner-side on-chain acts.",
    dependencies: ["chainIndex"],
    nav: { header: false, sidebar: true, footer: false },
    icon: Network,
    flag: "sourceRegistryLive",
  },
  {
    id: "founder",
    label: "Founder OS",
    path: "/founder",
    zone: "founder",
    visible: true,
    enabled: false,
    live: false,
    phase: "future",
    truthStatus: "AWAITING_FOUNDER_APPROVAL",
    description: "Founder/operator controls preview. Gated until founder verification.",
    dependencies: ["founderApproval"],
    nav: { header: false, sidebar: true, footer: false },
    icon: Briefcase,
    flag: "founderControls",
  },
  {
    id: "recognition",
    label: "Recognition",
    path: "/recognition",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "future",
    truthStatus: surfaceStatus.recognition,
    description: "The recognition model, explained as a future concept — never a financial reward.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: Award,
    flag: "recognitionLive",
  },
  {
    id: "whitepaper",
    label: "Whitepaper",
    path: "/whitepaper",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "The Syndicate whitepaper — what the protocol is, how a seat and routing work, and how to verify every figure on-chain.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: BookOpen,
  },
  {
    id: "tokenomics",
    label: "Tokenomics",
    path: "/tokenomics",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "SYN supply, the live on-chain distribution across the seven allocation wallets, the two independent prices, and burn — every figure read live from the chain.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: Coins,
  },
  {
    id: "faq",
    label: "FAQ",
    path: "/faq",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "Honest, verifiable answers about the protocol — SYN the seat, the sale, routing, liquidity, ranks, the archive, and risk. Answers hold no figures; every live number is one click away on-chain.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: HelpCircle,
  },
  // ── AUD-T (founder GO 2026-07-16): the legal layer — the audit's fourth P0
  // dead. Three routed pages, footer-linked site-wide, honest draft labels.
  {
    id: "terms",
    label: "Terms of Use",
    path: "/terms",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "The terms that govern the site and the protocol: what a seat is and is not, how a purchase works, the referral program's rules, and what the protocol never does.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: FileText,
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    path: "/privacy",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "Built to know almost nothing about you: no accounts, no identity checks, one functional cookie, no analytics — said plainly, with what little does exist disclosed.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: ShieldCheck,
  },
  {
    id: "risk",
    label: "Risk Disclosure",
    path: "/risk",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "Read before you sign: price can fall to zero, contracts can have flaws, keys are your only access, transactions are final, and the rules keep changing.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: AlertTriangle,
  },
  {
    id: "docs",
    label: "Docs",
    path: "/docs",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "The protocol operating manual — a knowledge hub that indexes every surface with a status and an audience tag, read in the order a member lives it.",
    dependencies: [],
    nav: { header: true, sidebar: false, footer: true },
    icon: FileText,
  },
  {
    id: "learning",
    label: "Learn",
    path: "/learning",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description: "Plain-language education about the protocol and how to read this foundation.",
    dependencies: [],
    nav: { header: true, sidebar: false, footer: true },
    icon: Library,
  },
  {
    id: "status",
    label: "Status",
    sidebarLabel: "System Status",
    path: "/status",
    zone: "system",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description: "Honesty hub detailing exactly what is live versus pending.",
    dependencies: [],
    nav: { header: true, sidebar: false, footer: true },
    icon: Activity,
    flag: "statusPage",
  },
  {
    id: "contracts",
    label: "Contracts",
    path: "/contracts",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    // AUD-TRUTH (2026-07-16): the "Not live yet" badge DIED — the page renders
    // the live read-only reality panel; a live surface renders NO TruthLabel.
    description: "Read-only contract & economy memory — roles, structure, and the live read-only reality panel.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: FileText,
  },
  {
    id: "map",
    label: "Protocol Map",
    path: "/map",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    description:
      "The public proof organism — every reconciled chain, contract, token, sale, and source signal in one read-only map.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: MapIcon,
  },
  {
    id: "source-attribution",
    label: "Referral Program",
    path: "/referral",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    // S7 truth sweep (2026-07-16): the "not live yet" badge DIED — the
    // program is ACTIVE (LIVE_ACTION, real money proven) and the R5
    // introduction indexer serves live standing.
    description:
      "How the referral program works — a bounded commission per eligible completed introduction, paid inside the buyer's own transaction, plus long-term recognition.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: Share2,
  },
  {
    id: "support",
    label: "Support",
    path: "/support",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    truthStatus: "NOT_LIVE",
    description: "Public help entry. Intake states only — nothing is stored or transmitted.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: LifeBuoy,
  },
  {
    id: "archive",
    label: "Archive",
    path: "/archive",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    // S7 truth sweep (2026-07-16): the "not live yet / future" posture DIED —
    // artifacts mint on-chain today (17 minted, counts and prices read live);
    // the per-wallet holdings view is the honest remaining gap.
    description: "Archive & chronicle — protocol memory; artifacts minted on-chain, counts and prices read live.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: Archive,
  },
] as const satisfies readonly SyndicateModule[];

/**
 * Compile-time module-id union derived from the canonical list above.
 * `moduleRegistry.ts` (and any future overlay) references modules by this
 * union, so a typo or a removed module fails `tsc`, not runtime.
 */
export type ModuleId = (typeof modules)[number]["id"];

export const getModuleById = (id: string): SyndicateModule | undefined =>
  modules.find((m) => m.id === id);

export const getModuleByPath = (path: string): SyndicateModule | undefined =>
  modules.find((m) => m.path === path);
