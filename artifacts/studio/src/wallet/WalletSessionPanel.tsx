// WalletSessionPanel — dev-only SIWE session UI on /member (S2, gated).
// ---------------------------------------------------------------------------
// Reachable ONLY through the flag-gated dynamic import in MemberAccess.tsx;
// dead-code-eliminated from production builds. Everything here is honest:
//   - the address shown is a CLIENT-SIDE fact from the wallet, held in memory
//     only — the server never receives, stores, or echoes it (outside the
//     signed SIWE message it verifies and drops);
//   - after a reload (or wallet account switch) the session may still be
//     valid but the address claim is gone — we say so instead of pretending;
//   - a session is control-proof only: session ≠ membership, and this app
//     performs no wallet→member lookup of any kind.

import { useEffect, useState } from "react";
import { KeyRound, LogOut, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AccessStateChip } from "@/components/access/AccessStateChip";
import {
  useAccessState,
  useWireAccessState,
} from "@/components/access/AccessStateProvider";
import {
  getInjectedProvider,
  logoutSession,
  requestAccount,
  shortAddress,
  signInWithWallet,
  type Eip1193Provider,
} from "./walletSession";

type Busy = "connect" | "sign" | "logout" | null;

const honestyLines = [
  "session ≠ membership — a signed session proves control of a wallet right now, nothing more.",
  "member continuity not wired — this app performs no wallet→member lookup of any kind.",
  "Holder Index not served — no member number, standing, or receipt is looked up or shown.",
] as const;

export default function WalletSessionPanel() {
  const appState = useAccessState();
  const wire = useWireAccessState();
  const [provider] = useState<Eip1193Provider | null>(() =>
    getInjectedProvider(),
  );
  const [address, setAddress] = useState<string | null>(null);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);

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
    <Card className="border-cyan-400/25 bg-cyan-400/5 p-6 mb-12" data-testid="panel-wallet-session">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-md bg-cyan-400/10 text-cyan-600 dark:text-cyan-300 shrink-0">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              Wallet session — dev preview
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
              Excluded from production builds · auth zone production-dark
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
            No browser wallet detected — nothing to connect. This panel stays
            honest: no wallet, no session.
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
            {busy === "sign" ? "Awaiting signature…" : "Sign to create session"}
          </Button>
        ) : (
          <Button
            onClick={connect}
            disabled={busy !== null}
            data-testid="button-wallet-connect"
          >
            <Wallet className="h-4 w-4 mr-2" />
            {busy === "connect" ? "Awaiting wallet…" : "Connect wallet"}
          </Button>
        )}
      </div>

      {error ? (
        <p className="text-sm text-destructive mb-5" data-testid="text-session-error">
          {error}
        </p>
      ) : null}

      <ul className="space-y-2 border-t border-border/50 pt-4">
        {honestyLines.map((line) => (
          <li
            key={line}
            className="flex items-start gap-2.5 font-mono text-xs text-muted-foreground leading-relaxed"
          >
            <span className="mt-1.5 h-1 w-1 rounded-full bg-cyan-500/70 shrink-0" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
