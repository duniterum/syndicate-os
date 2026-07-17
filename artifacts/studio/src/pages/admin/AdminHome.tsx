// pages/admin/AdminHome.tsx
//
// Phase 2 — the admin home dashboard. TRUTH-FIRST: this file contains NO
// fabricated figures. Business KPIs (revenue / packages / artifacts / members)
// are not wired to real reads yet, so they render as explicit "live reads
// coming" preview cards — never a fake number. The live protocol-reality panel
// (already real, from GET /api/protocol/reality) is dropped into `realitySlot`
// by the shell. Every card carries a tooltip explaining what it is and where
// its number will come from (self-documenting admin).
//
// Dependency-light on purpose: `role`, `onNavigate`, and `realitySlot` are
// props so the shell wires routing/identity/data and this stays presentational.

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Info,
  TrendingUp,
  Package,
  Image as ImageIcon,
  Users,
  UserPlus,
  SlidersHorizontal,
  Megaphone,
  LinkIcon,
  LifeBuoy,
  Flag,
} from "lucide-react";

export type AdminSectionId =
  | "operators"
  | "sources-referrals"
  | "broadcast"
  | "support";

interface AdminHomeProps {
  /** Operator role label (e.g. "founder_root"), or null when not signed in. */
  role: string | null;
  /** Navigate to an /admin/* section. */
  onNavigate: (section: AdminSectionId) => void;
  /** The live, real ProtocolReality panel (GET /api/protocol/reality). */
  realitySlot?: ReactNode;
}

interface PreviewKpi {
  key: string;
  label: string;
  icon: typeof Package;
  tooltip: string;
}

// Business KPIs — NOT wired yet. Rendered as honest preview cards (no numbers).
const PREVIEW_KPIS: PreviewKpi[] = [
  {
    key: "revenue",
    label: "Total revenue",
    icon: TrendingUp,
    tooltip:
      "Protocol sales inflows in the period (membership, packages, artifacts), read live on-chain. Referral payouts are shown separately as an outflow. Not wired yet — will read live.",
  },
  {
    key: "packages",
    label: "Packages sold",
    icon: Package,
    tooltip:
      "Count of membership package purchases in the period, read from on-chain sale events. Not wired yet — will read live.",
  },
  {
    key: "artifacts",
    label: "Artifacts / NFTs",
    icon: ImageIcon,
    tooltip:
      "Count of archive artifacts minted in the period, read on-chain. Not wired yet — will read live.",
  },
  {
    key: "members",
    label: "Members",
    icon: Users,
    tooltip:
      "Distinct member seats, read on-chain. Not wired yet — will read live.",
  },
];

const QUICK_ACTIONS: {
  key: string;
  label: string;
  icon: typeof UserPlus;
  section: AdminSectionId;
}[] = [
  { key: "invite", label: "Invite operator", icon: UserPlus, section: "operators" },
  { key: "terms", label: "Edit referral terms", icon: SlidersHorizontal, section: "sources-referrals" },
  { key: "broadcast", label: "New broadcast", icon: Megaphone, section: "broadcast" },
];

const ATTENTION: { key: string; label: string; icon: typeof Flag; section: AdminSectionId }[] = [
  { key: "reviews", label: "Source reviews", icon: LinkIcon, section: "sources-referrals" },
  { key: "support", label: "Support queue", icon: LifeBuoy, section: "support" },
  { key: "flags", label: "Abuse flags", icon: Flag, section: "sources-referrals" },
];

function KpiTooltip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="What is this?"
          className="text-muted-foreground/70 hover:text-muted-foreground"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

export default function AdminHome({ role, onNavigate, realitySlot }: AdminHomeProps) {
  return (
    <div className="space-y-6">
      {/* Heading + honest identity line */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {role
              ? `Signed in as an operator · ${role}`
              : "Not signed in as an operator"}
          </p>
        </div>
      </div>

      {/* Q40 (founder, 2026-07-17: "what I need is at the bottom"): LIVE
          content leads — the real Protocol reality renders FIRST; the honest
          KPI placeholders are demoted below it until their reads are wired. */}
      {realitySlot ? (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CardTitle className="text-base">Protocol reality</CardTitle>
            <Badge variant="secondary" className="text-[10px]">
              Live · on-chain
            </Badge>
          </div>
          {realitySlot}
        </Card>
      ) : null}

      {/* Business KPIs — honest preview, NO fabricated numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PREVIEW_KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.key} className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Icon className="h-4 w-4" />
                <span>{k.label}</span>
                <KpiTooltip text={k.tooltip} />
              </div>
              <div className="text-2xl font-medium text-muted-foreground/50">—</div>
              <Badge variant="outline" className="mt-2 text-[10px]">
                Live reads coming
              </Badge>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Needs attention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ATTENTION.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => onNavigate(a.section)}
                  className="flex items-center gap-2 w-full text-left text-sm text-muted-foreground hover:text-foreground rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{a.label}</span>
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    preview
                  </Badge>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => onNavigate(a.section)}
                  className="inline-flex items-center gap-2 text-sm rounded-md border px-3 py-1.5 hover:bg-muted transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {a.label}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
