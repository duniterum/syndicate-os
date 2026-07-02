// AccessStateProvider — Slice IA-1 access-state shell (visibility/UX ONLY).
// ---------------------------------------------------------------------------
// HONESTY POSTURE: no authentication, session, wallet, or registry system
// exists anywhere in this product. The only truthful access state is S1
// (anonymous visitor), so this provider is HARDWIRED to it — there is nothing
// to read a state from, and pretending otherwise would be fake auth.
//
// This context is NOT security. It exists so future founder-gated slices
// (SIWE/session work) have exactly one seam to wire a real state into, and so
// the fail-closed AccessGate has a single source of current-state truth.
//
// Rules:
//   - No state, no effects, no persistence, no localStorage, no cookies.
//   - Unknown/absent context resolves to S1 (fail closed).

import { createContext, useContext, type ReactNode } from "react";
import type { AccessStateId } from "@workspace/os-contracts";
import {
  CURRENT_ACCESS_STATE_ID,
  resolveAccessState,
} from "@/config/accessState";

const AccessStateContext = createContext<AccessStateId>("S1");

export function AccessStateProvider({ children }: { children: ReactNode }) {
  return (
    <AccessStateContext.Provider value={CURRENT_ACCESS_STATE_ID}>
      {children}
    </AccessStateContext.Provider>
  );
}

/** Current access state; anything unexpected fail-closes to S1. */
export function useAccessState(): AccessStateId {
  return resolveAccessState(useContext(AccessStateContext));
}
