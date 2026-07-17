// components/referral/AdminOperatorsCrud.tsx
//
// Operators & sources management for the Admin Console: the role
// hierarchy and the operator registry (invite / edit / suspend / revoke) in
// AdminOperatorsCrud, plus the source-review queue (approve / flag) exported
// separately so the sectioned admin shell can rehome it under Sources &
// referrals (moved, not rewritten). Mirrors the wallet-first operator
// registry design (server-side allowlist, one role per row, fail-closed).
//
// Phase 3 slice 2/3: the registry READ is live (masked wallets from the
// server), INVITE is a live founder-gated write into the real operator
// registry + audit log (POST /api/operator/operators), and SUSPEND is a live
// founder-gated write by stable row id (POST /api/operator/operators/suspend,
// confirmation dialog, self-suspend lockout server-side) — founder_root
// session required, fail-closed at every layer. Edit remains PREVIEW ONLY —
// a disabled control, persisting nothing — until its own founder-approved
// slice.

import { useEffect, useState, type FormEvent } from "react";
import { SESSION_CHANGED_EVENT } from "@/lib/sessionEvents";
import { UsersRound, UserPlus, Pencil, Ban, Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { TruthLabel } from "@/components/TruthLabel";
import { operatorRoles, sourceReviewSample } from "@/config/referralProgram";
import {
  listOperators,
  inviteOperator,
  suspendOperator,
  type ListOperatorsResult,
  type OperatorListItem,
} from "@/lib/operatorClient";

// Live, read-only registry read (Phase 3 slice 1). Honest states only — no
// fake fallback: loading, ok (rows or empty), denied (dark zone / no session /
// insufficient role), unavailable. Wallets arrive pre-masked from the server.
type RegistryState = { status: "loading" } | ListOperatorsResult;

function useOperatorRegistry(): {
  registry: RegistryState;
  reload: () => void;
} {
  const [registry, setRegistry] = useState<RegistryState>({ status: "loading" });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let active = true;
    void listOperators().then((result) => {
      if (active) setRegistry(result);
    });
    // Phase 3 slice 4a: re-read the live registry whenever the SIWE session
    // changes (sign-in / sign-out announced via the wallet session seam), so a
    // fresh sign-in populates the list without a manual page reload. The event
    // carries no state — the truth still always comes from the server.
    const onSessionChanged = () => {
      void listOperators().then((result) => {
        if (active) setRegistry(result);
      });
    };
    window.addEventListener(SESSION_CHANGED_EVENT, onSessionChanged);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, onSessionChanged);
    };
  }, [tick]);
  const reload = () => {
    setRegistry({ status: "loading" });
    setTick((t) => t + 1);
  };
  return { registry, reload };
}

// Honest, specific failure text for every reason the invite path can return —
// no generic "something went wrong", and NEVER a fake success.
function inviteFailureText(reason: string | null): string {
  switch (reason) {
    case "no_session":
      return "No active operator session — sign in as an operator first (account menu).";
    case "insufficient_role":
      return "Only a founder_root session can invite operators.";
    case "bad_wallet":
      return "Wallet must be a full 0x… address (40 hex characters).";
    case "bad_label":
      return "Label is required (max 128 characters).";
    case "bad_role":
      return "Unknown role — pick one of the canonical roles.";
    case "already_exists":
      return "This wallet is already in the operator registry — nothing was written.";
    case "bad_request":
      return "The server rejected the form fields as invalid.";
    case "throttled":
      return "Too many attempts — wait a moment and retry.";
    case "unavailable":
    case "unreachable":
    case "404":
      return "The operator write zone isn't available here (auth zone dark or no database).";
    default:
      return `Invite failed${reason !== null ? ` (reason: ${reason})` : ""}.`;
  }
}

// Honest, specific failure text for every reason the suspend path can return —
// no generic "something went wrong", and NEVER a fake success.
function suspendFailureText(reason: string | null): string {
  switch (reason) {
    case "cannot_suspend_self":
      return "You can't suspend yourself.";
    case "last_founder":
      return "Can't suspend the last active founder.";
    case "not_found":
      return "Operator not found — the registry may have changed; reload and retry.";
    case "no_session":
      return "No active operator session — sign in as an operator first (account menu).";
    case "insufficient_role":
      return "Only a founder can suspend operators.";
    case "bad_id":
    case "bad_request":
      return "The server rejected the suspend request as invalid.";
    case "throttled":
      return "Too many attempts — wait a moment and retry.";
    case "unavailable":
    case "unreachable":
    case "404":
      return "The operator write zone isn't available here (auth zone dark or no database).";
    default:
      return `Suspend failed${reason !== null ? ` (reason: ${reason})` : ""}.`;
  }
}

// Founder-gated suspend confirmation (Phase 3 slice 3). Confirms, then submits
// to the REAL POST /api/operator/operators/suspend by stable id through the
// fail-closed client; on success the registry is re-read live so the row flips
// to SUSPENDED — no fabricated local state change.
function SuspendOperatorDialog({
  target,
  onSuspended,
  onClose,
}: {
  target: OperatorListItem | null;
  onSuspended: () => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    if (target === null || submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await suspendOperator(target.id);
    setSubmitting(false);
    if (result.ok) {
      toast({ title: "Operator suspended" });
      onSuspended();
      onClose();
    } else {
      setError(suspendFailureText(result.reason));
    }
  }

  return (
    <AlertDialog
      open={target !== null}
      onOpenChange={(open) => {
        if (!open && !submitting) {
          setError(null);
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend this operator?</AlertDialogTitle>
          <AlertDialogDescription>
            {target !== null ? (
              <>
                <span className="font-medium text-foreground">{target.label}</span>{" "}
                <span className="font-mono text-xs">({target.walletShort})</span> — role{" "}
                <span className="font-mono text-xs">{target.role}</span>. This is a live
                founder-gated write: the row flips to SUSPENDED in the real registry and an
                audit entry is recorded.
              </>
            ) : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error !== null && (
          <p className="text-xs text-destructive leading-relaxed">{error}</p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={submitting}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
          >
            {submitting ? "Suspending…" : "Suspend"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Founder-gated invite form (Phase 3 slice 2). Submits to the REAL
// POST /api/operator/operators through the fail-closed client; on success the
// registry is re-read live — no fabricated row is ever appended locally.
function InviteOperatorForm({
  onInvited,
  onClose,
}: {
  onInvited: () => void;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [wallet, setWallet] = useState("");
  const [label, setLabel] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    const result = await inviteOperator(wallet.trim(), label.trim(), role);
    setSubmitting(false);
    if (result.ok) {
      toast({ title: "Operator invited" });
      onInvited();
      onClose();
    } else {
      setError(inviteFailureText(result.reason));
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="rounded-md border border-border/50 p-4 mb-3 space-y-3"
    >
      <div className="text-sm font-medium text-foreground">
        Invite operator
        <span className="ml-2 text-xs font-normal text-muted-foreground">
          founder-gated write into the live registry
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="invite-wallet">Wallet</Label>
          <Input
            id="invite-wallet"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x…"
            className="font-mono text-xs"
            autoComplete="off"
            spellCheck={false}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="invite-label">Label</Label>
          <Input
            id="invite-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Ops lead"
            maxLength={128}
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="invite-role">Role</Label>
        <Select value={role} onValueChange={setRole} required>
          <SelectTrigger id="invite-role" className="w-full sm:w-72">
            <SelectValue placeholder="Pick a canonical role" />
          </SelectTrigger>
          <SelectContent>
            {operatorRoles.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                <span className="font-mono text-xs">{r.id}</span>
                <span className="ml-2 text-muted-foreground">{r.role}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {error !== null && (
        <p className="text-xs text-destructive leading-relaxed">{error}</p>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={submitting || role === ""}>
          {submitting ? "Inviting…" : "Send invite"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AdminOperatorsCrud() {
  const { registry, reload } = useOperatorRegistry();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<OperatorListItem | null>(null);
  return (
    <Card id="operators" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <UsersRound className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Operators &amp; roles</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Live · founder-gated writes
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-5 leading-relaxed">
        Manage who can operate the protocol. Invite and suspend are LIVE — founder-gated writes into the real
        operator registry and audit log (founder_root session required; suspend asks for confirmation and takes
        effect on the operator&apos;s very next request). Edit remains a preview until its own founder-approved
        slice. Admin-tier changes also need a step-up signature and founder approval.
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInviteOpen((v) => !v)}
            title="Founder-gated write into the live operator registry"
          >
            <UserPlus className="h-4 w-4 mr-1.5" />
            Invite operator
          </Button>
        </div>
        {inviteOpen && (
          <InviteOperatorForm
            onInvited={reload}
            onClose={() => setInviteOpen(false)}
          />
        )}
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
              <div key={op.id} className="flex items-center gap-3 p-3">
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
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={op.status === "SUSPENDED"}
                  aria-label={`Suspend ${op.label}`}
                  title={
                    op.status === "SUSPENDED"
                      ? "Already suspended"
                      : "Founder-gated write: suspend this operator"
                  }
                  onClick={() => setSuspendTarget(op)}
                >
                  <Ban className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </div>
      </div>
      <SuspendOperatorDialog
        target={suspendTarget}
        onSuspended={reload}
        onClose={() => setSuspendTarget(null)}
      />
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
