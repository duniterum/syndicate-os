// pages/admin/AdminHome.tsx
//
// Phase 2 — the admin home dashboard. TRUTH-FIRST: this file contains NO
// fabricated figures. Business KPIs (revenue / packages / artifacts)
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
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
  | "members"
  | "broadcast"
  | "support"
  | "seasons";

interface AdminHomeProps {
  /** Operator role label (e.g. "founder_root"), or null when not signed in. */
  role: string | null;
  /** Navigate to an /admin/* section. */
  onNavigate: (section: AdminSectionId) => void;
  /** The live, real ProtocolReality panel (GET /api/protocol/reality). */
  realitySlot?: ReactNode;
  /** CONSOLE ① — the LIVE waiting count for Source reviews (the queue's own
   * figure, shell-wired), or null when unknown/denied (no badge, never a
   * fake zero). */
  reviewCount?: number | null;
  /** THE BUSINESS — the live KPI band (BusinessBand) that LEADS the page,
   * right under the work grid. Renders its own honest fail-closed states. */
  referralBand?: ReactNode;
  /** TREASURY — the live Protocol Assets card (what the protocol holds: the
   * vault's USDC / AVAX / BTC.b / WETH.e, the LP position, the SYN reserve).
   * Work-zone, right under the business band, never collapsed; renders its own
   * fail-closed per-asset states. */
  assetsSlot?: ReactNode;
  /** The collapsed "System & registry" slot at the very bottom (module counts,
   * posture ledger, health) — reference material, never the work. */
  systemSlot?: ReactNode;
}

// Business KPIs are no longer a stub — the live figures lead the page in
// BusinessBand (founder 2026-07-25: "un dashboard ouvre sur ses chiffres").
// No preview cards remain (DONE-IS-DONE: a wired figure keeps no unwired twin).

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

// K3.a (2026-07-22): "Source reviews" is LIVE — the queue reads real intake
// rows with server preflight; its preview badge died with the slice
// (DONE-IS-DONE). The other two doors keep their honest preview badge.
const ATTENTION: { key: string; label: string; icon: typeof Flag; section: AdminSectionId; live?: boolean }[] = [
  { key: "reviews", label: "Source reviews", icon: LinkIcon, section: "sources-referrals", live: true },
  { key: "support", label: "Support queue", icon: LifeBuoy, section: "support" },
  { key: "flags", label: "Abuse flags", icon: Flag, section: "sources-referrals" },
];

// Human role labels for the identity line — the registry stores snake_case
// tokens; the operator never reads `founder_root` (human-labels law).
const ROLE_LABEL: Record<string, string> = {
  founder_root: "Founder",
  protocol_admin: "Protocol admin",
  operator: "Operator",
  source_reviewer: "Source reviewer",
  member_support: "Member support",
  content_docs: "Content & docs",
  auditor: "Auditor",
  worker_agent: "Worker agent",
};

export default function AdminHome({
  role,
  onNavigate,
  realitySlot,
  reviewCount = null,
  referralBand,
  assetsSlot,
  systemSlot,
}: AdminHomeProps) {
  return (
    <div className="space-y-6">
      {/* Heading + honest identity line */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {role
              ? `Signed in as ${ROLE_LABEL[role] ?? role}`
              : "Not signed in as an operator"}
          </p>
        </div>
      </div>

      {/* THE WORK-FIRST PAGE LAW (founder, permanent, 2026-07-18): the page
          opens on THE WORK — actions and decisions. Reference/diagnostic
          material lives in collapsed expanders at the bottom; the operator
          never scrolls past diagnostics to reach a button. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Needs attention */}
        <Card className="rounded-2xl border-border bg-card/40 shadow-sm">
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
                  {/* CONSOLE ①: the live waiting count on the queue's door —
                      shown only when the wired read answered with work
                      (never a fake zero, never a badge on unknown). */}
                  {a.key === "reviews" && reviewCount !== null && reviewCount > 0 ? (
                    <Badge className="ml-auto text-[10px] bg-gold text-background hover:bg-gold" data-testid="badge-review-count">
                      {reviewCount} waiting
                    </Badge>
                  ) : a.live ? null : (
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      preview
                    </Badge>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card className="rounded-2xl border-border bg-card/40 shadow-sm">
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

      {/* THE BUSINESS — the live figures LEAD the page (founder 2026-07-25:
          "un dashboard ouvre sur ses chiffres, il ne les cache pas"). Plain
          dated numbers, each a door to its ledger; never a collapsible. */}
      {referralBand ?? null}

      {/* TREASURY — what the protocol HOLDS. The financial figures the operator
          came for → work-zone, right under the business band, never collapsed
          (WORK-FIRST §1). Fail-closed per asset. */}
      {assetsSlot ?? null}

      {/* Reference layer — collapsed by default (the work-first law). The data
          stays one click away, never in the way. */}
      {realitySlot ? (
        <Collapsible>
          <Card className="p-0 rounded-2xl border-border bg-card/40 shadow-sm">
            <CollapsibleTrigger className="flex w-full items-center gap-2 p-4 text-left group">
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              <CardTitle className="text-sm">Protocol reality</CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                Live · on-chain
              </Badge>
              <span className="ml-auto text-xs text-muted-foreground">
                expand to inspect the live chain signals
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              {realitySlot}
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : null}

      {systemSlot ? (
        <Collapsible>
          <Card className="p-0 rounded-2xl border-border bg-card/40 shadow-sm">
            <CollapsibleTrigger className="flex w-full items-center gap-2 p-4 text-left group">
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
              <CardTitle className="text-sm">System &amp; registry</CardTitle>
              <span className="ml-auto text-xs text-muted-foreground">
                modules, posture &amp; health — expand to inspect
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 pb-4">
              {systemSlot}
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ) : null}
    </div>
  );
}
