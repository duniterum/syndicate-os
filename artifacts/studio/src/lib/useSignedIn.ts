// lib/useSignedIn.ts — shared, ENTRY-SAFE session probe.
//
// "Is the current session signed in (S4)?" Dynamically imports the wallet-
// session modules (rule 15 — no wallet/session code in the public entry
// bundle). Re-reads on SESSION_CHANGED_EVENT. Mirrors MemberAccess's proven
// useOwnSession, adding a `checking` flag so a member never flashes the
// not-signed composition (we default to the signed/work layout while resolving).

import { useEffect, useState } from "react";

export function useSignedIn(): { signedIn: boolean; checking: boolean } {
  const [state, setState] = useState({ signedIn: false, checking: true });
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;
    void Promise.all([
      import("@/wallet/walletSession"),
      import("@/wallet/sessionEvents"),
    ]).then(([ws, ev]) => {
      if (!active) return;
      const read = () =>
        void ws.fetchSessionState().then((s) => {
          if (active) setState({ signedIn: s === "S4", checking: false });
        });
      read();
      window.addEventListener(ev.SESSION_CHANGED_EVENT, read);
      cleanup = () =>
        window.removeEventListener(ev.SESSION_CHANGED_EVENT, read);
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, []);
  return state;
}
