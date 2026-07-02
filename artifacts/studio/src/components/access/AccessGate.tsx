// AccessGate — fail-closed access-state shell for classified surfaces (IA-1).
// ---------------------------------------------------------------------------
// THIS IS VISIBILITY/UX, NOT SECURITY. There is no sensitive data behind any
// surface this gate wraps (the backend is read-only and public), and frontend
// hiding is never permission control. Real enforcement is a future
// server-side, founder-gated slice.
//
// Behavior (two-field registry design):
//   - PREVIEW_LABELLED surfaces (all of them in IA-1) render children
//     unchanged — the registry's `requiredState` is recorded matrix truth,
//     not enforcement.
//   - GATED surfaces (none exist yet; guard-enforced) consult the §3 matrix
//     via evaluateAccess and fail closed: a blocked or unclassified surface
//     renders the honest ACCESS STATE NOT WIRED panel, never content.
//   - Unknown current state resolves to S1 before evaluation.

import type { ReactNode } from "react";
import { getSurfaceByRoute } from "@/config/surfaceClassification";
import { accessStates, evaluateAccess } from "@/config/accessState";
import { useAccessState } from "@/components/access/AccessStateProvider";
import { AccessStateChip } from "@/components/access/AccessStateChip";

function AccessBlockedPanel({
  routePath,
  requiredName,
}: {
  routePath: string;
  requiredName: string;
}) {
  const current = useAccessState();
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center" data-testid="panel-access-blocked">
      <p className="font-mono text-xs tracking-widest text-muted-foreground mb-4">
        ACCESS STATE NOT WIRED
      </p>
      <div className="flex justify-center mb-6">
        <AccessStateChip stateId={current} />
      </div>
      <h1 className="text-xl font-light text-foreground mb-4">
        This surface is reserved for a future access state.
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {`The surface at ${routePath} is designed for “${requiredName}”. No real
        authentication or session system exists yet — every visitor is an
        anonymous visitor (S1), and this notice is an honest placeholder, not a
        security boundary. No sensitive data exists behind it.`}
      </p>
    </div>
  );
}

export function AccessGate({
  routePath,
  children,
}: {
  routePath: string;
  children: ReactNode;
}) {
  const current = useAccessState();
  const entry = getSurfaceByRoute(routePath);

  // Fail closed: a wrapped surface that is missing from the classification
  // registry renders the honest panel, never content.
  if (!entry) {
    return <AccessBlockedPanel routePath={routePath} requiredName="an unclassified surface" />;
  }

  const evaluation = evaluateAccess(current, entry.requiredState, entry.enforcement);
  if (!evaluation.allowed) {
    return (
      <AccessBlockedPanel
        routePath={routePath}
        requiredName={accessStates[entry.requiredState].name}
      />
    );
  }
  return <>{children}</>;
}
