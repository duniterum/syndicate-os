// pages/admin/sections.tsx
//
// Phase 2 slice 1 — the ten sectioned admin routes. Each section composes the
// REHOMED read-only panels (pages/admin/panels.tsx) and the existing preview
// components under components/referral that previously lived stacked on the
// single flat /admin page. Moved, not rewritten — every panel of the former
// Admin Console renders on exactly one section below; nothing was lost
// or hidden. The only new composition is the Dashboard, which hosts the
// founder-approved AdminHome (presentational, no fabricated figures) with the
// REAL ProtocolRealityPanel in its realitySlot.
//
// Section-to-panel resolution (former flat page → sections):
//   Dashboard  → AdminHome (CONSOLE ① 2026-07-22: + the wired referral KPI
//                band + the live waiting count) + Overview panel
//   Members    → Members & Continuity panel
//   Sources    → CONSOLE ② 2026-07-22: FIVE sub-tabs (the /referral underline
//                grammar) — Review queue (default) · Signing (promotion +
//                create/manage) · Program terms · Registry · Performance
//                (K3.c: per-source table + CSV)
//   Operators  → AdminOperatorsCrud (roles + registry)
//   Content    → Content & Homepage + Packages & Advertising + Address Labels
//                (note: no Recognition admin panel existed on the flat page —
//                none was invented; recognition remains on /recognition)
//   Modules    → AdminModulesConsole + Modules registry panel
//   Broadcast  → the LIVE broadcast composer + sent history (founder-gated,
//                audited — NOTIF-1/2/2b)
//   Audit      → Audit log preview card (the real trail records server-side;
//                the live read view is its own Q42 slice) + Activity panel
//   Support    → Support queue preview card
//   Settings   → Feature-flags preview card + real build-flags panel
//                + System Health panel

import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation } from "wouter";
import AdminHome, { type AdminSectionId } from "@/pages/admin/AdminHome";
import {
  AdminOverviewPanel,
  AdminModulesRegistryPanel,
  AdminMembersPanel,
  AdminSourcesPanel,
  AdminPackagesPanel,
  AdminAddressLabelsPanel,
  AdminContentPanel,
  AdminActivityPanel,
  AdminFlagsPanel,
  AdminHealthPanel,
} from "@/pages/admin/panels";
import { MemberLedgerPanel } from "@/pages/admin/memberLedger";
import { ReferralKpiBand } from "@/pages/admin/ReferralKpiBand";
import { SourcePerformancePanel } from "@/pages/admin/SourcePerformancePanel";
import { consumeRequestedSourcesTab } from "@/lib/adminPrefill";
import { AdminReferralPanel } from "@/components/referral/AdminReferralPanel";
import { AdminModulesConsole } from "@/components/referral/AdminModulesConsole";
import { AdminReferralCrud } from "@/components/referral/AdminReferralCrud";
import {
  AdminOperatorsCrud,
  SourceReviewQueue,
} from "@/components/referral/AdminOperatorsCrud";
import {
  BroadcastPanel,
  FeatureFlagsPanel,
  AuditLogPanel,
  SupportQueuePanel,
} from "@/components/referral/AdminOperatorSurfaces";
import { ProtocolRealityPanel } from "@/components/ProtocolReality";
import { ChroniclePrepare } from "@/components/admin/ChroniclePrepare";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";

// Maps AdminHome's section ids to the mounted admin sub-routes.
const SECTION_ROUTE: Record<AdminSectionId, string> = {
  operators: "/admin/operators",
  "sources-referrals": "/admin/sources",
  members: "/admin/members",
  broadcast: "/admin/broadcast",
  support: "/admin/support",
};

/**
 * Honest operator-role readback for the dashboard identity line. Reads
 * GET /api/auth/operator-context through the fail-closed wallet-session
 * transport, loaded ONLY via the flag-conditional dynamic import (rule 15:
 * only App.tsx reaches @/wallet/ statically). Dark auth zone, no session, or
 * a non-ACTIVE wallet → null (AdminHome renders "Not signed in as an
 * operator"), never a fabricated role.
 */
function useOperatorRole(): string | null {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    if (!WALLET_SESSION_PREVIEW_ENABLED) return;
    let active = true;
    void import("@/wallet/walletSession").then(({ fetchOperatorContext }) =>
      fetchOperatorContext().then((ctx) => {
        if (!active) return;
        setRole(ctx.isOperator ? ctx.role : null);
      }),
    );
    return () => {
      active = false;
    };
  }, []);
  return role;
}

export function AdminDashboardSection() {
  const [, navigate] = useLocation();
  const role = useOperatorRole();
  // CONSOLE ① — the shared cached signals feed the live waiting count (the
  // queue's own figure; one audited read per TTL window, shared with the
  // KPI band). null = unknown/denied → no badge, never a fake zero.
  const [reviewCount, setReviewCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    void import("@/lib/operatorClient").then(({ fetchConsoleSignals }) =>
      fetchConsoleSignals().then((s) => {
        if (!active) return;
        setReviewCount(s.queue.status === "ok" ? s.queue.openCount : null);
      }),
    );
    return () => {
      active = false;
    };
  }, []);
  const onNavigate = (section: AdminSectionId) => navigate(SECTION_ROUTE[section]);
  return (
    <div className="space-y-6">
      <AdminHome
        role={role}
        onNavigate={onNavigate}
        realitySlot={<ProtocolRealityPanel groups={["chain", "contracts", "sale", "financial"]} />}
        reviewCount={reviewCount}
        referralBand={<ReferralKpiBand onNavigate={onNavigate} />}
      />
      <AdminOverviewPanel />
    </div>
  );
}

export function AdminMembersSection() {
  return (
    <div className="space-y-6">
      {/* M-INT-1: the member ledger — the section's centerpiece (founder-only
          read; masked wallets; audit-logged). The posture panel keeps the
          server-only PII boundary statement below it. */}
      <MemberLedgerPanel />
      <AdminMembersPanel />
    </div>
  );
}

// R2 — the PROPOSE screen (Constitution §④ Form 2): builds createSource /
// setSourceStatus for the founder's wallet to sign. Wallet-zone code, so it is
// reached ONLY via a runtime dynamic import (guard rule 15 — only App.tsx
// imports @/wallet statically).
const ProposeSourceCreate = lazy(() => import("@/wallet/ProposeSourceCreate"));
// LADDER-PROMOTION-SCREEN — the persistent due-promotion reminder + the
// updateSourceTerms PROPOSE flow (Form 2). Same rule-15 dynamic import.
const ProposeSourcePromotion = lazy(() => import("@/wallet/ProposeSourcePromotion"));

// ── CONSOLE ② (mockup v2 founder-approved 2026-07-22): the section's FIVE
// sub-tabs — the /referral underline grammar reused verbatim (one tab
// language, member and admin; the world benchmark's verdict: flat rail at
// level 1, one tab row at level 2, the decision queue as the default face).
// Client-side tab state (the wall and the route guards stay untouched);
// Approve on the queue SWITCHES to Signing and prefills the create form
// through the buffered seam (which survives the lazy chunk's late mount).
type SourcesTabId = "queue" | "signing" | "program" | "registry" | "performance";

const SOURCES_TABS: { id: SourcesTabId; label: string }[] = [
  { id: "queue", label: "Review queue" },
  { id: "signing", label: "Signing" },
  { id: "program", label: "Program terms" },
  { id: "registry", label: "Registry" },
  { id: "performance", label: "Performance" },
];

// The /referral tab focus idiom (no offset ring — the founder-caught class).
const SOURCES_TAB_FOCUS =
  "focus-visible:outline-none focus-visible:bg-gold/10 rounded-t-md";

export function AdminSourcesSection() {
  // A Dashboard door may have pre-selected the destination tab (the one-shot
  // seam) — a door's label must land where it points.
  const [tab, setTab] = useState<SourcesTabId>(() => {
    const requested = consumeRequestedSourcesTab();
    return SOURCES_TABS.some((t) => t.id === requested)
      ? (requested as SourcesTabId)
      : "queue";
  });
  // Badges from the SHARED cached signals (one audited read per TTL window,
  // already primed by the Dashboard/rail): the queue count + promotions due.
  // badgeTick re-reads after a queue-changing verdict (the cache is
  // invalidated by the act — a badge must never contradict the queue face).
  const [badgeTick, setBadgeTick] = useState(0);
  const [badges, setBadges] = useState<{ queue: number; due: number } | null>(null);
  useEffect(() => {
    let active = true;
    void import("@/lib/operatorClient").then(({ fetchConsoleSignals }) =>
      fetchConsoleSignals().then((s) => {
        if (!active) return;
        setBadges({
          queue: s.queue.status === "ok" ? s.queue.openCount : 0,
          due: s.ledger.status === "ok" ? s.ledger.payload.totals.promotionsDue : 0,
        });
      }),
    );
    return () => {
      active = false;
    };
  }, [tab, badgeTick]);

  return (
    <div>
      <div className="relative mb-6">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-border/50" />
        <nav
          aria-label="Sources & referrals surfaces"
          className="flex gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {SOURCES_TABS.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap px-3 py-2.5 border-b-2 text-sm transition-colors ${SOURCES_TAB_FOCUS} ${
                  active
                    ? "border-gold text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`sources-tab-${t.id}`}
              >
                {t.label}
                {t.id === "queue" && badges !== null && badges.queue > 0 ? (
                  <span className="font-mono text-[10px] font-bold rounded-full bg-gold text-background px-1.5">
                    {badges.queue}
                  </span>
                ) : null}
                {t.id === "signing" && badges !== null && badges.due > 0 ? (
                  <span className="font-mono text-xs rounded-full bg-border/40 px-1.5">
                    {badges.due} due
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {tab === "queue" ? (
          <SourceReviewQueue
            onApproveOpened={() => setTab("signing")}
            onQueueChanged={() => setBadgeTick((t) => t + 1)}
          />
        ) : null}
        {tab === "signing" ? (
          <>
            <Suspense fallback={null}>
              <ProposeSourcePromotion />
            </Suspense>
            <Suspense fallback={null}>
              <ProposeSourceCreate />
            </Suspense>
          </>
        ) : null}
        {tab === "program" ? <AdminReferralCrud /> : null}
        {tab === "registry" ? (
          <>
            <AdminReferralPanel />
            <AdminSourcesPanel />
          </>
        ) : null}
        {tab === "performance" ? <SourcePerformancePanel /> : null}
      </div>
    </div>
  );
}

export function AdminOperatorsSection() {
  return (
    <div className="space-y-6">
      <AdminOperatorsCrud />
    </div>
  );
}

export function AdminContentSection() {
  return (
    <div className="space-y-6">
      {/* CHR-1 — prepare a Chronicle entry (promotion = a founder commit). */}
      <ChroniclePrepare />
      <AdminContentPanel />
      <AdminPackagesPanel />
      <AdminAddressLabelsPanel />
    </div>
  );
}

export function AdminModulesSection() {
  return (
    <div className="space-y-6">
      <AdminModulesConsole />
      <AdminModulesRegistryPanel />
    </div>
  );
}

export function AdminBroadcastSection() {
  return (
    <div className="space-y-6">
      <BroadcastPanel />
    </div>
  );
}

export function AdminAuditSection() {
  return (
    <div className="space-y-6">
      <AuditLogPanel />
      <AdminActivityPanel />
    </div>
  );
}

export function AdminSupportSection() {
  return (
    <div className="space-y-6">
      <SupportQueuePanel />
    </div>
  );
}

export function AdminSettingsSection() {
  return (
    <div className="space-y-6">
      <FeatureFlagsPanel />
      <AdminFlagsPanel />
      <AdminHealthPanel />
    </div>
  );
}
