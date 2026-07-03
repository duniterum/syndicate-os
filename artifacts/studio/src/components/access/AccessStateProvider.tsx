// AccessStateProvider — access-state shell (S2: session-wirable, fail-closed).
// ---------------------------------------------------------------------------
// HONESTY POSTURE: the only wired identity signal in the product is the
// dev-only SIWE session (api /api/auth — production-dark), and it is
// anonymous control-proof: the server returns S1 or S4 and nothing else.
// This provider therefore:
//   - boots hardwired to the fail-closed default (S1);
//   - exposes ONE restricted wire seam (useWireAccessState) whose input is
//     forced through resolveWiredState — anything that is not exactly "S4"
//     collapses to S1. S7+/S11+ can never be wired here (no source exists);
//   - performs NO I/O itself: no fetch, no effects, no persistence, no
//     storage. Session resolution lives in the build-time-gated wallet
//     module (src/wallet/), which is dead-code-eliminated from production
//     builds — so in production this provider is effectively static S1.
//
// This context is NOT security. Frontend state is visibility/UX only; the
// server enforces nothing based on it and stores no identity at all.
//
// Rules:
//   - No fetch/effects in this file (guard-enforced); no persistence,
//     no localStorage, no cookies.
//   - Unknown/absent context resolves to S1 (fail closed).

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { AccessStateId } from "@workspace/os-contracts";
import {
  CURRENT_ACCESS_STATE_ID,
  resolveAccessState,
  resolveWiredState,
  type WiredAccessStateId,
} from "@/config/accessState";

const AccessStateContext = createContext<AccessStateId>("S1");
const WireAccessStateContext = createContext<(next: WiredAccessStateId) => void>(
  () => {},
);

export function AccessStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessStateId>(CURRENT_ACCESS_STATE_ID);
  // The one wire seam: input is forced through the fail-closed resolver, so
  // callers can only ever produce S1 or S4 app-wide.
  const wire = useCallback((next: WiredAccessStateId) => {
    setState(resolveWiredState(next));
  }, []);
  return (
    <AccessStateContext.Provider value={state}>
      <WireAccessStateContext.Provider value={wire}>
        {children}
      </WireAccessStateContext.Provider>
    </AccessStateContext.Provider>
  );
}

/** Current access state; anything unexpected fail-closes to S1. */
export function useAccessState(): AccessStateId {
  return resolveAccessState(useContext(AccessStateContext));
}

/**
 * Restricted wire seam for the (build-time-gated) wallet session module.
 * Only src/wallet/ may call this (guard-enforced import allowlist).
 */
export function useWireAccessState(): (next: WiredAccessStateId) => void {
  return useContext(WireAccessStateContext);
}
