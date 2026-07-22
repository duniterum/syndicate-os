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
import { UsersRound, UserPlus, Pencil, Ban, Link2, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { operatorRoles } from "@/config/referralProgram";
import {
  listOperators,
  inviteOperator,
  suspendOperator,
  listActivationQueue,
  decideActivation,
  fetchActivationSigner,
  invalidateConsoleSignals,
  type ActivationQueueResult,
  type ListOperatorsResult,
  type OperatorListItem,
} from "@/lib/operatorClient";
import { dispatchProposeSourcePrefill } from "@/lib/adminPrefill";
import { dateLabel } from "@/components/referral/referralStanding";

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

      {/* THE WORK-FIRST PAGE LAW (founder, 2026-07-18): the registry — the
          founder's actual work surface — leads; the role-hierarchy REFERENCE
          moved into the collapsed expander below it. */}
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
                <Button variant="ghost" size="sm" disabled aria-label={`Edit ${op.label}`} title="Lands with its own slice">
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
      {/* Reference layer — collapsed by default (the work-first law). */}
      <Collapsible className="mt-6">
        <div className="rounded-md border border-border/50">
          <CollapsibleTrigger className="flex w-full items-center gap-2 p-3 text-left group">
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            <span className="text-sm font-medium text-foreground">Role hierarchy</span>
            <span className="ml-auto text-xs text-muted-foreground">
              reference — what each role may do
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-3 pb-3">
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
          </CollapsibleContent>
        </div>
      </Collapsible>
      <SuspendOperatorDialog
        target={suspendTarget}
        onSuspended={reload}
        onClose={() => setSuspendTarget(null)}
      />
    </Card>
  );
}

// ── K3.a — THE SOURCE REVIEW QUEUE, LIVE (mockup founder-approved 2026-07-22,
// "GO and GO-Live"). Every request arrives already checked by the server
// (live preflight — fail-closed: a check that didn't run BLOCKS, never a
// silent pass). Three exit verbs + reality: Approve opens the signing path
// (prefills ProposeSourceCreate on this same page — the founder's SIGNATURE
// is the only approval that exists), Decline requires the human sentence the
// member will read (their bell carries it, written server-side in the same
// transaction), Hold parks. A request whose source turned ACTIVE on-chain is
// closed by reality — one click records it and the member's bell announces
// the activation. Wallets stay masked; the one full wallet needed to sign is
// fetched at act time (audited server-side per read). ────────────────────────

function decideFailureText(reason: string | null): string {
  switch (reason) {
    case "bad_reason":
      return "Write a short reason the member will read — required, 500 characters max.";
    case "address_in_text":
      return "The reason can't contain a raw wallet address — say it in words instead.";
    case "bad_state":
      return "This request moved on since the list loaded — reload and look again.";
    case "not_active_on_chain":
      return "The registry doesn't confirm this source is active — the bell only rings on verified on-chain truth. Sign the activation first, or reload.";
    case "not_found":
      return "This request no longer exists — reload the queue.";
    case "insufficient_role":
      return "Sign in as the founder to decide requests.";
    case "unavailable":
    case "unreachable":
      return "The write didn't go through — nothing changed. Try again in a moment.";
    default:
      return "The write was refused — nothing changed. Reload and try again.";
  }
}

/** One preflight chip — pass / fail / didn't-run (blocking), never silent. */
function CheckChip({ ok, pass, fail, norun }: { ok: boolean | null; pass: string; fail: string; norun: string }) {
  if (ok === true) return <Badge variant="outline" className="text-[10px] font-normal text-live border-live/40">✓ {pass}</Badge>;
  if (ok === false) return <Badge variant="outline" className="text-[10px] font-normal text-destructive border-destructive/40">✕ {fail}</Badge>;
  return <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">◌ {norun}</Badge>;
}

/** ISO timestamp → the register's one date grammar ("July 22, 2026"). */
function shortDay(iso: string | null): string {
  const day = iso?.slice(0, 10) ?? null;
  return day !== null && /^\d{4}-\d{2}-\d{2}$/.test(day) ? dateLabel(day) : "—";
}

export function SourceReviewQueue({
  onApproveOpened,
  onQueueChanged,
}: {
  /** CONSOLE ② — the tabbed section switches to the Signing tab when the
   * signing path opens (the seam's buffer survives the lazy mount). */
  onApproveOpened?: () => void;
  /** CONSOLE ② — fired after a successful verdict so the badges re-read
   * (the shared cache is invalidated first — a badge must never contradict
   * the queue face it sits above). */
  onQueueChanged?: () => void;
} = {}) {
  const [state, setState] = useState<{ status: "loading" } | ActivationQueueResult>({ status: "loading" });
  const [tick, setTick] = useState(0);
  const [declineFor, setDeclineFor] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState("");
  // Per-row busy SET (adversarial verify 2026-07-22): a single shared id was
  // overwritten by a second row's act, re-enabling the first mid-flight.
  const [busyIds, setBusyIds] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const markBusy = (id: string, on: boolean) =>
    setBusyIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  useEffect(() => {
    let active = true;
    void listActivationQueue().then((r) => {
      if (active) setState(r);
    });
    const onSession = () => {
      void listActivationQueue().then((r) => {
        if (active) setState(r);
      });
    };
    window.addEventListener(SESSION_CHANGED_EVENT, onSession);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, onSession);
    };
  }, [tick]);
  const reload = () => {
    setState({ status: "loading" });
    setError(null);
    setTick((t) => t + 1);
  };

  // Every verdict: fail-closed client call → toast → RE-READ (never optimistic).
  async function decide(id: string, verdict: "decline" | "hold" | "reopen" | "close", reason?: string) {
    markBusy(id, true);
    setError(null);
    const result = await decideActivation(id, verdict, reason);
    markBusy(id, false);
    if (!result.ok) {
      setError(decideFailureText(result.reason));
      return;
    }
    if (verdict === "decline") {
      setDeclineFor(null);
      setDeclineReason("");
      toast({ title: "Declined", description: "The member's bell carries your reason." });
    } else if (verdict === "close") {
      toast({ title: "Recorded", description: "The member's bell announces the activation." });
    }
    // The act changed the queue: drop the shared badge cache and tell the
    // section — the rail/Dashboard refresh on their next read.
    invalidateConsoleSignals();
    onQueueChanged?.();
    reload();
  }

  // Approve = open the signing path: fetch the request's full wallet (the
  // audited signing material), hand it to ProposeSourceCreate on this same
  // page, and let every existing gate (owner wallet, chain, terms hash, live
  // record) decide whether the signature opens. No server state changes here.
  async function approve(id: string) {
    markBusy(id, true);
    setError(null);
    const result = await fetchActivationSigner(id);
    markBusy(id, false);
    if (!result.ok) {
      setError(decideFailureText(result.reason));
      return;
    }
    // K3.b: the request id rides the seam — after the founder's activation
    // receipt confirms, the signing session closes the request itself and
    // the member's bell rings (Record-it stays as the manual fallback).
    dispatchProposeSourcePrefill(result.signerTarget, id);
    onApproveOpened?.();
    toast({
      title: "Signing path opened",
      description: "The create form now carries this request's wallet.",
    });
  }

  const rows = state.status === "ok" ? state.rows : [];
  // WORK-FIRST: the queue opens on the OLDEST waiting request (the mockup's
  // law); the decided tail orders by the founder's DECISION time — "Last
  // decision" must name his last act, never the most recently ASKED row
  // (adversarial verify 2026-07-22).
  const open = rows
    .filter((r) => r.status === "WAITING" || r.status === "HOLD")
    .slice()
    .sort((a, b) => (a.askedAtIso ?? "").localeCompare(b.askedAtIso ?? ""));
  const decided = rows
    .filter((r) => r.status === "DECLINED" || r.status === "CLOSED")
    .slice()
    .sort((a, b) => (b.decidedAtIso ?? "").localeCompare(a.decidedAtIso ?? ""));
  const lastDecision = decided[0] ?? null;

  return (
    <Card id="source-review" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <Link2 className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Source review queue</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Live · founder-gated writes
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-4 leading-relaxed">
        Members ask for activation from their referral page; every request
        arrives here already checked by the server. Approve opens the signing
        path — your on-chain signature is the only approval that exists.
      </p>

      {error !== null ? (
        <p className="text-xs text-destructive leading-relaxed mb-3" data-testid="text-queue-error">{error}</p>
      ) : null}

      {state.status === "loading" ? (
        <p className="text-sm text-muted-foreground">Reading the queue…</p>
      ) : state.status === "denied" ? (
        <p className="text-sm text-muted-foreground">
          Sign in as the founder to read the queue. Nothing is shown without the role.
        </p>
      ) : state.status === "unavailable" ? (
        <p className="text-sm text-muted-foreground">
          The queue is unavailable right now — nothing is assumed.{" "}
          <button type="button" className="underline underline-offset-2" onClick={reload}>Re-read</button>
        </p>
      ) : open.length === 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="text-queue-empty">
          No requests waiting.
          {lastDecision
            ? ` Last decision: ${lastDecision.status === "CLOSED" ? "recorded activated" : "declined"} ${lastDecision.walletShort} — ${shortDay(lastDecision.decidedAtIso)}.`
            : " The door on /referral feeds this queue."}
        </p>
      ) : (
        <div className="space-y-3">
          {state.uncheckedOpenCount > 0 ? (
            <p className="text-xs text-muted-foreground">
              {state.uncheckedOpenCount} newer waiting request(s) beyond the live-check window — the oldest are checked first; decide the ones below, then reload.
            </p>
          ) : null}
          {open.map((r) => {
            const c = r.checks;
            const closedByReality = c?.sourceActive === true;
            const approveReady =
              !closedByReality &&
              c !== null &&
              c.seatHeld === true &&
              c.holdsSyn === true &&
              c.sourceOnChain !== null &&
              c.sourceActive !== null;
            return (
              <div key={r.id} className="rounded-md border border-border/50 p-4" data-testid={`queue-request-${r.id}`}>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-mono text-sm font-medium text-foreground">{r.walletShort}</span>
                  <span className="text-xs text-muted-foreground">
                    {r.seat !== null ? `Seat #${r.seat} · ` : ""}asked {shortDay(r.askedAtIso)}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-normal ml-auto">
                    {closedByReality ? "Closed by reality" : r.status === "HOLD" ? "On hold" : "Waiting"}
                  </Badge>
                </div>

                {closedByReality ? (
                  <>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                      This wallet's source is already active on-chain — the chain
                      answered before a decision was needed. Record it so the
                      member's bell announces the activation.
                    </p>
                    <Button
                      size="sm"
                      className="mt-2"
                      disabled={busyIds.has(r.id)}
                      onClick={() => void decide(r.id, "close")}
                      data-testid={`button-close-${r.id}`}
                    >
                      Record it — notify the member
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5 mt-2.5 mb-3">
                      <CheckChip ok={c?.seatHeld ?? null} pass="Seat held" fail="No seat" norun="Seat — didn't run (blocking)" />
                      <CheckChip ok={c?.holdsSyn ?? null} pass="Holds SYN" fail="Holds SYN — 0 at last read" norun="SYN — didn't run (blocking)" />
                      <CheckChip
                        // Fail-closed rendering (adversarial verify 2026-07-22):
                        // an existing source whose is-active read did NOT run
                        // is UNKNOWN — never asserted "paused". And an
                        // inactive existing source is stated without guessing
                        // paused-vs-revoked (the server serves booleans; the
                        // signing screen reads the full live record and
                        // refuses a revoked source with its own honest words).
                        ok={
                          c === null ||
                          c.sourceOnChain === null ||
                          (c.sourceOnChain === true && c.sourceActive === null)
                            ? null
                            : true
                        }
                        pass={
                          c?.sourceOnChain === true
                            ? "On the registry — not active (the signing screen reads the live record)"
                            : "Not yet on the registry"
                        }
                        fail=""
                        norun="Registry — didn't run (blocking)"
                      />
                    </div>
                    {!approveReady ? (
                      <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                        A failed or unrun check blocks the signing door — fail-closed,
                        never a silent pass. Decline with a reason, or hold and
                        reload later.
                      </p>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        disabled={!approveReady || busyIds.has(r.id)}
                        onClick={() => void approve(r.id)}
                        data-testid={`button-approve-${r.id}`}
                      >
                        {approveReady ? "Approve — open the signing path" : "Approve — blocked by checks"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyIds.has(r.id)}
                        onClick={() => {
                          setDeclineFor(declineFor === r.id ? null : r.id);
                          setDeclineReason("");
                        }}
                        data-testid={`button-decline-${r.id}`}
                      >
                        Decline — with a reason
                      </Button>
                      {r.status === "WAITING" ? (
                        <Button variant="ghost" size="sm" disabled={busyIds.has(r.id)} onClick={() => void decide(r.id, "hold")}>
                          Hold
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled={busyIds.has(r.id)} onClick={() => void decide(r.id, "reopen")}>
                          Reopen
                        </Button>
                      )}
                    </div>
                    {declineFor === r.id ? (
                      <div className="mt-3">
                        <textarea
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          maxLength={500}
                          placeholder="A short reason the member will read — required."
                          className="w-full min-h-[52px] rounded-md border border-border bg-background text-foreground text-xs p-2.5 resize-y"
                          data-testid={`input-decline-reason-${r.id}`}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1.5"
                          disabled={declineReason.trim().length === 0 || busyIds.has(r.id)}
                          onClick={() => void decide(r.id, "decline", declineReason.trim())}
                          data-testid={`button-decline-confirm-${r.id}`}
                        >
                          Decline this request
                        </Button>
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
          {decided.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Decided recently:{" "}
              {decided.slice(0, 3).map((d) => `${d.walletShort} ${d.status === "CLOSED" ? "activated" : "declined"} ${shortDay(d.decidedAtIso)}`).join(" · ")}
            </p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
