// WalletSessionBoot — app-root session resolution (S2, flag-gated seam).
// ---------------------------------------------------------------------------
// Mounted once (inside AccessStateProvider) via the flag-gated dynamic import
// in App.tsx, so a live session cookie resolves to S4 on EVERY route. Renders
// nothing. Since Phase 1 the wallet layer ships in ALL builds
// (WALLET_SESSION_PREVIEW_ENABLED is a `true` literal); this module stays a
// dynamic import so the seam remains gate-shaped and guard-pinned.

import { useEffect } from "react";
import { useWireAccessState } from "@/components/access/AccessStateProvider";
import { fetchSessionState } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

export default function WalletSessionBoot() {
  const wire = useWireAccessState();
  useEffect(() => {
    let alive = true;
    const resolve = () => {
      void fetchSessionState().then((state) => {
        if (alive) wire(state);
      });
    };
    resolve();
    // Reconcile after ANY sign-in/sign-out (RainbowKit adapter or the bespoke
    // panel) — the server session stays the single source of truth; this
    // listener only triggers a re-read of GET /api/auth/session.
    window.addEventListener(SESSION_CHANGED_EVENT, resolve);
    return () => {
      alive = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, resolve);
    };
  }, [wire]);
  return null;
}
