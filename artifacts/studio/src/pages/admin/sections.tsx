// pages/admin/sections.tsx
//
// Phase 2 slice 1 — the ten sectioned admin routes. Each section composes the
// REHOMED read-only panels (pages/admin/panels.tsx) and the existing preview
// components under components/referral that previously lived stacked on the
// single flat /admin page. Moved, not rewritten — every panel of the former
// Admin Control Tower renders on exactly one section below; nothing was lost
// or hidden. The only new composition is the Dashboard, which hosts the
// founder-approved AdminHome (presentational, no fabricated figures) with the
// REAL ProtocolRealityPanel in its realitySlot.
//
// Section-to-panel resolution (former flat page → sections):
//   Dashboard  → AdminHome + Overview panel
//   Members    → Members & Continuity panel
//   Sources    → AdminReferralPanel + AdminReferralCrud + Sources panel
//                + SourceReviewQueue (split out of AdminOperatorsCrud)
//   Operators  → AdminOperatorsCrud (roles + registry)
//   Content    → Content & Homepage + Packages & Advertising + Address Labels
//                (note: no Recognition admin panel existed on the flat page —
//                none was invented; recognition remains on /recognition)
//   Modules    → AdminModulesConsole + Modules registry panel
//   Broadcast  → Broadcast preview card
//   Audit      → Audit log preview card + Activity & Chronicle panel
//   Support    → Support queue preview card
//   Settings   → Feature-flags preview card + real build-flags panel
//                + System Health panel

import { useEffect, useState } from "react";
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
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";

// Maps AdminHome's section ids to the mounted admin sub-routes.
const SECTION_ROUTE: Record<AdminSectionId, string> = {
  operators: "/admin/operators",
  "sources-referrals": "/admin/sources",
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
  return (
    <div className="space-y-6">
      <AdminHome
        role={role}
        onNavigate={(section) => navigate(SECTION_ROUTE[section])}
        realitySlot={<ProtocolRealityPanel groups={["chain", "contracts", "sale"]} />}
      />
      <AdminOverviewPanel />
    </div>
  );
}

export function AdminMembersSection() {
  return (
    <div className="space-y-6">
      <AdminMembersPanel />
    </div>
  );
}

export function AdminSourcesSection() {
  return (
    <div className="space-y-6">
      <AdminReferralPanel />
      <AdminReferralCrud />
      <SourceReviewQueue />
      <AdminSourcesPanel />
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
