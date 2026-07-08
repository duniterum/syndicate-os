// wallet/OperatorSignInAction.tsx (part of the build-time-gated wallet module)
//
// Phase 3 slice 2 — "Sign in as operator" straight from the admin account
// menu, no /member detour. Reads the live operator context (fail-closed) and:
//   • resolved operator            → renders nothing (badge already shows it);
//   • no session / not signed in   → a menu action that opens the RainbowKit
//     connect + SIWE sign flow (the Phase 1 auth adapter — RainbowKit treats a
//     connected-but-unauthenticated wallet as needing the sign step, so one
//     modal covers both connect and sign);
//   • signed-in wallet WITHOUT an operator role → an honest disabled line —
//     never a fake sign-in that would loop.
// Re-reads the context whenever SESSION_CHANGED_EVENT fires, so a successful
// SIWE sign-in resolves the role in place.

import { useEffect, useState } from "react";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { LogIn } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { fetchOperatorContext } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

type Status =
  | { kind: "checking" }
  | { kind: "operator" }
  | { kind: "none" };

export function OperatorSignInAction() {
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchOperatorContext().then((ctx) => {
        if (!active) return;
        setStatus(
          ctx.isOperator && ctx.role !== null
            ? { kind: "operator" }
            : { kind: "none" },
        );
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);

  if (status.kind !== "none") return null;

  // openConnectModal is only offered by RainbowKit while the wallet still
  // needs connect and/or the SIWE sign step. When it is absent the wallet is
  // already connected AND session-authenticated — so the missing piece is the
  // operator role itself, and the only honest rendering is to say so.
  if (openConnectModal === undefined) {
    return (
      <DropdownMenuItem disabled>
        <LogIn className="h-4 w-4 mr-2" />
        Signed-in wallet has no operator role
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onSelect={() => openConnectModal()}
    >
      <LogIn className="h-4 w-4 mr-2" />
      Sign in as operator
    </DropdownMenuItem>
  );
}

export default OperatorSignInAction;
