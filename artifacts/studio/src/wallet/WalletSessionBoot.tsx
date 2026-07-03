// WalletSessionBoot — app-root session resolution (S2, build-time gated).
// ---------------------------------------------------------------------------
// Mounted once (inside AccessStateProvider) via the flag-gated dynamic import
// in App.tsx, so a live session cookie resolves to S4 on EVERY route in dev —
// not just /member. Renders nothing. In production builds this module does
// not exist (dead-code-eliminated with the rest of src/wallet/).

import { useEffect } from "react";
import { useWireAccessState } from "@/components/access/AccessStateProvider";
import { fetchSessionState } from "./walletSession";

export default function WalletSessionBoot() {
  const wire = useWireAccessState();
  useEffect(() => {
    let alive = true;
    void fetchSessionState().then((state) => {
      if (alive) wire(state);
    });
    return () => {
      alive = false;
    };
  }, [wire]);
  return null;
}
