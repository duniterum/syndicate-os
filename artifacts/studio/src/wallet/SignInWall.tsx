// wallet/SignInWall.tsx — the shared MEMBER-ACCOUNT gate (CANON_ACCESS_MODEL §B).
//
// A member-account surface is a curated PRIVATE composition: it opens ONLY on a
// proven SIWE session (S4), resolved from the SESSION — NEVER from the wagmi
// address. Gating on the address is exactly the /wallet leak (a connected-but-
// unsigned wallet, or an auto-reconnected wallet whose session expired, would
// render own figures). This component renders ZERO personal figures until signed.
//
// It gates NOT-SIGNED only: a disconnected-but-still-signed member keeps the
// content (Q-B — the SIWE session persists after wallet disconnect; the child
// handles a null address itself, e.g. "reconnect to read your live balances").
//
// This file lives in a LAZILY-LOADED wallet chunk (its wagmi/RainbowKit/
// walletSession imports must never reach the public entry bundle — rule 15).
// Import it only from lazy wallet modules.

import { useEffect, useState, type ReactNode } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Card } from "@/components/ui/card";
import { useAuthAvailability } from "@/lib/authAvailability";
import { WalletAuthComingSoon } from "@/components/WalletAuthComingSoon";
import { fetchSessionState } from "@/wallet/walletSession";
import { SESSION_CHANGED_EVENT } from "@/wallet/sessionEvents";

function useSignedIn(): { signedIn: boolean; checking: boolean } {
  const [state, setState] = useState({ signedIn: false, checking: true });
  useEffect(() => {
    let active = true;
    const read = () =>
      void fetchSessionState().then((s) => {
        if (active) setState({ signedIn: s === "S4", checking: false });
      });
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);
  return state;
}

interface SignInWallProps {
  /** The value proposition, IN WORDS — describes what the account holds. NEVER a real figure. */
  teaser: ReactNode;
  /** Rendered ONLY when the session is S4 (signed). */
  children: ReactNode;
}

export function SignInWall({ teaser, children }: SignInWallProps) {
  const { signedIn, checking } = useSignedIn();
  const { address } = useAccount(); // ONLY to choose the copy — NEVER to gate.
  const authLive = useAuthAvailability() === "live";

  if (signedIn) return <>{children}</>;

  if (checking) {
    return (
      <Card className="p-6 border-border/50 bg-card/40">
        <p className="text-sm text-muted-foreground">Reading your session…</p>
      </Card>
    );
  }

  // THE WALL — zero personal figures. Connected-not-signed vs not-connected
  // changes only the copy; both stay walled until a proven session exists.
  const connectedNotSigned = !!address;
  return (
    <Card className="p-6 border-border/50 bg-card/40">
      <div className="max-w-2xl">{teaser}</div>
      <p className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-2xl">
        {connectedNotSigned
          ? "You're connected — sign in to read your own account. Signing proves you control this wallet; it reads only your own row, never a directory, and moves no funds."
          : "Connect and sign in to read your own account — live from the chain, own-row only, never a directory."}
      </p>
      <div className="mt-4">
        {authLive ? <ConnectButton showBalance={false} /> : <WalletAuthComingSoon />}
      </div>
    </Card>
  );
}
