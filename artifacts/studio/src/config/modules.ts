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
  Activity,
  FileText,
  Share2,
  LifeBuoy,
  Archive,
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
  dependencies: string[];
  nav: NavPlacement;
  icon: LucideIcon;
  flag?: FeatureFlag;
}

// One module list, two audiences. `nav` controls placement:
//   - header  → public marketing header (kept concise: Home / Proof / Learn / Status)
//   - sidebar → operator console (Studio OS, Proof Studio, Source, Founder)
//   - footer  → public footer (grouped in navigation.ts)
export const modules: SyndicateModule[] = [
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
    id: "proof",
    label: "Proof",
    path: "/proof",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    truthStatus: surfaceStatus.proofOfFire,
    description: "What public proof will mean — and why none is wired yet.",
    dependencies: ["eventAdapter"],
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
    label: "Member OS",
    path: "/member",
    zone: "member",
    visible: true,
    enabled: false,
    live: false,
    phase: "future",
    truthStatus: "AWAITING_FOUNDER_APPROVAL",
    description:
      "A labelled preview of the future member cockpit. Membership is founder-gated and not live yet.",
    dependencies: ["founderApproval", "membershipIndexer"],
    nav: { header: false, sidebar: false, footer: true },
    icon: Users,
    flag: "membershipLive",
  },
  {
    id: "source",
    label: "Source Attribution",
    sidebarLabel: "Source (Operator)",
    path: "/source",
    zone: "studio",
    visible: true,
    enabled: false,
    live: false,
    phase: "future",
    truthStatus: surfaceStatus.sourceAttribution,
    description: "Operator source surface. Paused by precaution; nothing is read or written.",
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
    description: "Honesty hub detailing exactly what is real versus not wired.",
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
    truthStatus: "LIVE_SOURCE_MISSING",
    description: "Read-only contract & economy memory — roles and structure, no live reads.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: FileText,
  },
  {
    id: "source-attribution",
    label: "Source Attribution",
    path: "/source-attribution",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    truthStatus: surfaceStatus.sourceAttribution,
    description: "How verified introductions work — recognition, never a paid reward.",
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
    phase: "future",
    truthStatus: surfaceStatus.archive,
    description: "Archive & chronicle concept memory. Archive reads are not wired.",
    dependencies: [],
    nav: { header: false, sidebar: false, footer: true },
    icon: Archive,
  },
];

export const getModuleById = (id: string): SyndicateModule | undefined =>
  modules.find((m) => m.id === id);

export const getModuleByPath = (path: string): SyndicateModule | undefined =>
  modules.find((m) => m.path === path);
