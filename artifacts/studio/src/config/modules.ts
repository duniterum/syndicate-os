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
    description: "Operational proof console foundation.",
    dependencies: [],
    nav: { header: true, sidebar: true, footer: true },
    icon: TerminalSquare,
    flag: "studioShell",
  },
  {
    id: "proof",
    label: "Proof",
    sidebarLabel: "Public Proof",
    path: "/proof",
    zone: "public",
    visible: true,
    enabled: true,
    live: false,
    phase: "live",
    truthStatus: surfaceStatus.publicDashboard,
    description: "Verifiable truth surface for membership and protocol actions.",
    dependencies: ["chainIndex"],
    nav: { header: true, sidebar: true, footer: true },
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
    description: "Configure rules for protocol recognition events.",
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
      "Awaiting founder approval. Membership truth is sourced from TheSyndicate canon registers; the live membership indexer is not wired yet.",
    dependencies: ["founderApproval", "membershipIndexer"],
    nav: { header: false, sidebar: true, footer: false },
    icon: Users,
    flag: "membershipLive",
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
    description: "Awaiting founder verification before exposing management controls.",
    dependencies: ["founderApproval"],
    nav: { header: false, sidebar: true, footer: false },
    icon: Briefcase,
    flag: "founderControls",
  },
  {
    id: "source",
    label: "Source Attribution",
    path: "/source",
    zone: "studio",
    visible: true,
    enabled: false,
    live: false,
    phase: "future",
    truthStatus: surfaceStatus.sourceAttribution,
    description: "Source registry ABI is vendored read-only; the live source indexer is not wired yet.",
    dependencies: ["chainIndex"],
    nav: { header: false, sidebar: true, footer: false },
    icon: Network,
    flag: "sourceRegistryLive",
  },
  {
    id: "recognition",
    label: "Recognition",
    path: "/recognition",
    zone: "studio",
    visible: true,
    enabled: false,
    live: false,
    phase: "future",
    truthStatus: surfaceStatus.recognition,
    description: "Future module for verifiable memory and protocol recognition.",
    dependencies: [],
    nav: { header: false, sidebar: true, footer: false },
    icon: Award,
    flag: "recognitionLive",
  },
  {
    id: "learning",
    label: "Learning",
    path: "/learning",
    zone: "studio",
    visible: true,
    enabled: false,
    live: false,
    phase: "future",
    truthStatus: "FUTURE_MODULE",
    description: "Future knowledge base integration.",
    dependencies: [],
    nav: { header: false, sidebar: true, footer: false },
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
    nav: { header: true, sidebar: true, footer: true },
    icon: Activity,
    flag: "statusPage",
  },
];

export const getModuleById = (id: string): SyndicateModule | undefined =>
  modules.find((m) => m.id === id);

export const getModuleByPath = (path: string): SyndicateModule | undefined =>
  modules.find((m) => m.path === path);
