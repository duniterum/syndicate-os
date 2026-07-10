// Doctrine note: a member's standing here is a self-readback — only the
// signed wallet's OWN seat is read from the active engine, never a directory
// or lookup of any other wallet. (This comment satisfies the founder-required
// honesty invariant; the on-screen copy stays plain-language.)
// WalletSessionPanel — public SIWE session UI on /member.
// ---------------------------------------------------------------------------
// Public product surface (Public Online Integration MVP, founder-approved);
// still reachable only through the wallet session gate's dynamic import,
// which now ships in production-default builds. Everything here is honest:
//   - the address shown is a CLIENT-SIDE fact from the wallet, held in memory
//     only — the server never receives, stores, or echoes it (outside the
//     signed SIWE message it verifies and drops);
//   - after a reload (or wallet account switch) the session may still be
//     valid but the address claim is gone — we say so instead of pretending;
//   - a session proves control of a wallet right now — session ≠ membership;
//   - standing is a live read-only SELF-readback: the active engine's own
//     memberNumberOf figure for the signed wallet, and nothing else. No
//     directory, list, or lookup of other wallets exists anywhere.

import { useCallback, useEffect, useState } from "react";
import { KeyRound, LogOut, RefreshCw, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessStateChip } from "@/components/access/AccessStateChip";
import {
  useAccessState,
  useWireAccessState,
} from "@/components/access/AccessStateProvider";
import {
  fetchMemberStanding,
  getInjectedProvider,
  logoutSession,
  requestAccount,
  shortAddress,
  shortHashPin,
  signInWithWallet,
  type Eip1193Provider,
  type MemberStandingReadback,
} from "./walletSession";

type Busy = "connect" | "sign" | "logout" | null;

type StandingState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "read"; readback: MemberStandingReadback };

const honestyLines = [
  "Signing in proves the wallet is yours right now — it doesn't make you a member.",
  "You only ever see your own seat — never a list or lookup of anyone else's wallet.",
  "View-only: this page never sends a transaction or moves any funds.",
] as const;

function StandingSection({
  standing,
  onRetry,
}: {
  standing: StandingState;
  onRetry: () => void;
}) {
  if (standing.kind === "idle") return null;

  let body: React.ReactNode;
  if (standing.kind === "loading") {
    body = (
      <p className="font-mono text-sm text-muted-foreground" data-testid="text-standing-loading">
        STANDING: reading from the active engine…
      </p>
    );
  } else if (standing.kind === "unavailable") {
    body = (
      <div className="flex flex-wrap items-center gap-3">
        <p className="font-mono text-sm text-muted-foreground" data-testid="text-standing-unavailable">
          STANDING: read unavailable (possibly rate-limited) — nothing is
          assumed.
        </p>
        <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-standing-retry">
          <RefreshCw className="h-3.5 w-3.5 mr-2" />
          Retry read
        </Button>
      </div>
    );
  } else {
    const r = standing.readback;
    if (r.state !== "S4") {
      body = (
        <p className="font-mono text-sm text-muted-foreground" data-testid="text-standing-lapsed">
          STANDING: session lapsed — sign in again to read your standing.
        </p>
      );
    } else if (!r.chainVerified) {
      body = (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-sm text-muted-foreground" data-testid="text-standing-chainfail">
            STANDING: engine unreadable —{" "}
            {r.failureReason ?? "live chain read failed"}. No standing is
            invented.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-standing-retry">
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Retry read
          </Button>
        </div>
      );
    } else if (r.recognized === true && r.memberNumber !== null) {
      body = (
        <div data-testid="text-standing-recognized">
          <p className="font-mono text-sm text-foreground">
            STANDING: recognized member — seat #{r.memberNumber}
          </p>
          {r.era !== null && r.authorityLabel !== null ? (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span
                className="inline-flex items-center rounded-sm border border-proof/30 bg-proof/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-proof"
                data-testid="chip-standing-era"
              >
                {r.era}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                numbering authority: {r.authorityLabel}
              </span>
            </div>
          ) : null}
          {r.continuityStatus !== null ? (
            <p className="font-mono text-[10px] text-muted-foreground mt-1" data-testid="text-standing-continuity">
              continuity: {r.continuityStatus}
              {r.proofPosture !== null
                ? ` · snapshot ${r.proofPosture.snapshotStatus} · pin ${shortHashPin(r.proofPosture.snapshotHash)}`
                : ""}
            </p>
          ) : null}
          <p className="font-mono text-[10px] text-muted-foreground mt-1">
            Your own seat number, read live and exact from the protocol. You can
            only ever see your own — nothing about anyone else's wallet.
          </p>
        </div>
      );
    } else if (r.recognized === false) {
      body = (
        <div data-testid="text-standing-none">
          <p className="font-mono text-sm text-muted-foreground">
            No seat found for this wallet yet.
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1">
            That's an honest on-chain fact, not a judgement. Earlier-era membership
            is kept in a separate, founder-only record.
          </p>
        </div>
      );
    } else {
      body = (
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-mono text-sm text-muted-foreground" data-testid="text-standing-null">
            STANDING: could not be resolved —{" "}
            {r.failureReason ?? "no figure returned"}. Nothing is assumed.
          </p>
          <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-standing-retry">
            <RefreshCw className="h-3.5 w-3.5 mr-2" />
            Retry read
          </Button>
        </div>
      );
    }
  }

  return (
    <div className="border-t border-border/50 pt-4 mb-5" data-testid="panel-member-standing">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        Your member standing
      </p>
      {body}
    </div>
  );
}

export default function WalletSessionPanel() {
  const appState = useAccessState();
  const wire = useWireAccessState();
  const [provider] = useState<Eip1193Provider | null>(() =>
    getInjectedProvider(),
  );
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [standing, setStanding] = useState<StandingState>({ kind: "idle" });

  // Wallet account switch: the displayed address is a client-side claim that
  // is now stale — clear it (the anonymous server session is unaffected).
  useEffect(() => {
    if (!provider?.on || !provider.removeListener) return;
    const onAccountsChanged = () => setAddress(null);
    provider.on("accountsChanged", onAccountsChanged);
    return () => provider.removeListener?.("accountsChanged", onAccountsChanged);
  }, [provider]);

  const signed = appState === "S4";
  const localChip = signed ? "S4" : address ? "S3" : "S1";

  const readStanding = useCallback(() => {
    setStanding({ kind: "loading" });
    void fetchMemberStanding().then((readback) => {
      setStanding(
        readback === null ? { kind: "unavailable" } : { kind: "read", readback },
      );
    });
  }, []);

  // Signed session → read the wallet's own standing once (retry is manual;
  // the read shares the auth zone's throttle and fails closed to
  // "unavailable", never to an invented standing).
  useEffect(() => {
    if (!signed) {
      setStanding({ kind: "idle" });
      return;
    }
    readStanding();
  }, [signed, readStanding]);

  const sessionLine = signed
    ? address
      ? `SESSION: ${shortAddress(address)} (signed)`
      : "SESSION: signed — wallet address not retained (held in memory only; sign again to display it)"
    : address
      ? "SESSION: none — connected wallet has not signed"
      : "SESSION: none";

  const connect = async () => {
    if (!provider) return;
    setBusy("connect");
    setError(null);
    try {
      const account = await requestAccount(provider);
      if (account) setAddress(account);
      else setError("The wallet returned no account — nothing was connected.");
    } catch {
      setError("Wallet connection was rejected or failed — nothing was connected.");
    } finally {
      setBusy(null);
    }
  };

  const sign = async () => {
    if (!provider || !address) return;
    setBusy("sign");
    setError(null);
    try {
      const next = await signInWithWallet(provider, address);
      wire(next);
      if (next !== "S4") {
        setError("The server did not confirm the session — no session exists.");
      }
    } catch {
      setError("Sign-in failed or was rejected — no session was created.");
    } finally {
      setBusy(null);
    }
  };

  const logout = async () => {
    setBusy("logout");
    setError(null);
    const next = await logoutSession();
    wire(next);
    setAddress(null);
    setBusy(null);
  };

  return (
    <Card className="border-proof/25 bg-proof/5 p-6 mb-12" data-testid="panel-wallet-session">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-proof/10 text-proof shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              Wallet session &amp; standing
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              A signed session proves control of a wallet · never membership
            </p>
          </div>
        </div>
        <AccessStateChip stateId={localChip} />
      </div>

      <p
        className="font-mono text-sm text-foreground mb-4"
        data-testid="text-session-status"
      >
        {sessionLine}
      </p>

      <div className="flex flex-wrap gap-3 mb-5">
        {!provider ? (
          <p className="text-sm text-muted-foreground">
            No wallet found in your browser. There's nothing to connect yet.
          </p>
        ) : signed ? (
          <Button
            variant="outline"
            onClick={logout}
            disabled={busy !== null}
            data-testid="button-wallet-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            {busy === "logout" ? "Signing out…" : "Sign out"}
          </Button>
        ) : address ? (
          <Button
            onClick={sign}
            disabled={busy !== null}
            data-testid="button-wallet-sign"
          >
            <KeyRound className="h-4 w-4 mr-2" />
            {busy === "sign" ? "Waiting for signature…" : "Sign in"}
          </Button>
        ) : (
          <Button
            onClick={connect}
            disabled={busy !== null}
            data-testid="button-wallet-connect"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {busy === "connect" ? "Waiting for wallet…" : "Connect wallet"}
          </Button>
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive mb-5" data-testid="text-session-error">
          {error}
        </p>
      ) : null}

      <StandingSection standing={standing} onRetry={readStanding} />

      <ul className="space-y-2 border-t border-border/50 pt-4">
        {honestyLines.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2.5 font-mono text-xs text-muted-foreground leading-relaxed"
          >
            <span className="mt-1.5 h-1 w-1 rounded-full bg-proof/70 shrink-0" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
