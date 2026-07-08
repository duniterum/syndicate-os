// wallet/OperatorBadge.tsx (part of the build-time-gated wallet module)
//
// Live, honest operator-identity chip for the admin surfaces. On mount it reads
// GET /api/auth/operator-context (via the fail-closed wallet-session transport)
// and shows the resolved operator role. When the auth zone is dark (production
// default), there is no wallet session, or the wallet is not an ACTIVE operator,
// it renders an honest "not signed in as an operator" — never a fabricated role.

import { useEffect, useState } from "react";
import { fetchOperatorContext } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

type Status =
  | { kind: "checking" }
  | { kind: "operator"; role: string }
  | { kind: "none" };

export function OperatorBadge() {
  const [status, setStatus] = useState<Status>({ kind: "checking" });

  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchOperatorContext().then((ctx) => {
        if (!active) return;
        setStatus(
          ctx.isOperator && ctx.role !== null
            ? { kind: "operator", role: ctx.role }
            : { kind: "none" },
        );
      });
    };
    read();
    // Re-read after a SIWE sign-in / sign-out so the badge resolves in place
    // (Phase 3 slice 2) — the truth still always comes from the server.
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);

  if (status.kind === "checking") {
    return (
      <span className="text-xs font-mono text-muted-foreground">
        Checking operator status…
      </span>
    );
  }

  if (status.kind === "operator") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-2 py-0.5 text-xs font-medium text-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
        Operator&nbsp;·&nbsp;<span className="font-mono">{status.role}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs text-muted-foreground">
      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
      Not signed in as an operator
    </span>
  );
}

export default OperatorBadge;
