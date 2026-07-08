// components/referral/AdminOperatorsCrud.tsx
//
// Operators & sources management for the Admin Control Tower: the role
// hierarchy and the operator registry (invite / edit / suspend / revoke) in
// AdminOperatorsCrud, plus the source-review queue (approve / flag) exported
// separately so the sectioned admin shell can rehome it under Sources &
// referrals (moved, not rewritten). Mirrors the wallet-first operator
// registry design (server-side allowlist, one role per row, fail-closed).
//
// PREVIEW ONLY. Every control here is a WRITE into the operator registry / audit
// log — the OS's first write-capable zone, which is founder-gated and not yet
// stood up. Admin-tier registry changes additionally require step-up signature
// and founder/root approval. So this shows the management surface exactly, while
// persisting nothing.

import { useEffect, useState } from "react";
import { UsersRound, UserPlus, Pencil, Ban, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TruthLabel } from "@/components/TruthLabel";
import { operatorRoles, sourceReviewSample } from "@/config/referralProgram";
import { listOperators, type ListOperatorsResult } from "@/lib/operatorClient";

// Live, read-only registry read (Phase 3 slice 1). Honest states only — no
// fake fallback: loading, ok (rows or empty), denied (dark zone / no session /
// insufficient role), unavailable. Wallets arrive pre-masked from the server.
type RegistryState = { status: "loading" } | ListOperatorsResult;

function useOperatorRegistry(): RegistryState {
  const [state, setState] = useState<RegistryState>({ status: "loading" });
  useEffect(() => {
    let active = true;
    void listOperators().then((result) => {
      if (active) setState(result);
    });
    return () => {
      active = false;
    };
  }, []);
  return state;
}

export function AdminOperatorsCrud() {
  const registry = useOperatorRegistry();
  return (
    <Card id="operators" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <UsersRound className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Operators &amp; roles</h2>
        <TruthLabel variant="DESIGN_PREVIEW" />
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-5 leading-relaxed">
        Manage who can operate the protocol. Preview: invite, edit, suspend, and revoke are writes into the
        operator registry — enabled with the founder-gated write zone. Admin-tier changes also need a step-up
        signature and founder approval.
      </p>

      {/* Role hierarchy */}
      <div className="mb-6">
        <div className="text-sm font-medium text-foreground mb-3">Role hierarchy</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {operatorRoles.map((r, i) => (
            <div key={r.role} className="rounded-md border border-border/50 p-3">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-sm font-medium text-foreground">{r.role}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.scope}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Operator registry */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-foreground">Operator registry</div>
          <Button variant="outline" size="sm" disabled title="Enabled with the operator write zone">
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite operator
          </Button>
        </div>
        <div className="rounded-md border border-border/50 divide-y divide-border/50">
          {registry.status === "loading" && (
            <div className="p-3 text-sm text-muted-foreground">Loading registry…</div>
          )}
          {registry.status === "denied" && (
            <div className="p-3 text-sm text-muted-foreground">
              Sign in as an operator to view the live registry.
            </div>
          )}
          {registry.status === "unavailable" && (
            <div className="p-3 text-sm text-muted-foreground">
              The operator registry isn&apos;t available yet.
            </div>
          )}
          {registry.status === "ok" && registry.operators.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">
              No operators in the registry yet.
            </div>
          )}
          {registry.status === "ok" &&
            registry.operators.map((op) => (
              <div key={op.walletShort} className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{op.label}</span>
                    <Badge variant="outline" className="text-[10px] font-normal">{op.role}</Badge>
                    <span className="text-[10px] text-muted-foreground">{op.status}</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground truncate">{op.walletShort}</div>
                </div>
                <Button variant="ghost" size="sm" disabled aria-label={`Edit ${op.label}`} title="Enabled with the operator write zone">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled aria-label={`Suspend ${op.label}`} title="Enabled with the operator write zone">
                  <Ban className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </div>
      </div>
    </Card>
  );
}

export function SourceReviewQueue() {
  return (
    <Card id="source-review" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <Link2 className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Source review queue</h2>
        <TruthLabel variant="DESIGN_PREVIEW" />
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        Review requested sources. Preview: approve and flag are writes into the operator registry / audit log —
        enabled with the founder-gated write zone.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="font-normal pb-2">Source</th>
            <th className="font-normal pb-2">Requested</th>
            <th className="font-normal pb-2">Status</th>
            <th className="font-normal pb-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sourceReviewSample.map((s) => (
            <tr key={s.source} className="border-t border-border/40">
              <td className="py-2 font-mono text-xs text-foreground/80">{s.source}</td>
              <td className="py-2 text-muted-foreground">{s.requested}</td>
              <td className="py-2 text-muted-foreground">{s.status}</td>
              <td className="py-2 text-right">
                <Button variant="ghost" size="sm" disabled title="Enabled with the operator write zone">Approve</Button>
                <Button variant="ghost" size="sm" disabled title="Enabled with the operator write zone">Flag</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
