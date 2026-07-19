// AccessStateSimulator — dev/preview-only matrix explorer (Slice IA-1).
// ---------------------------------------------------------------------------
// Lives INSIDE the gated operator graph only (imported by a console page;
// guard-operator-gate keeps it out of public builds and dist-greps for the
// probe string below). Founder-approved trimmed form:
//   - a state selector chip row + the §3-matrix allow/block outcome per
//     registered surface. No placeholder shells for other states.
//   - selection is IN-MEMORY ONLY (React state). Never localStorage, never
//     any persistence: a sticky simulated state would be a confusion hazard.
//   - simulating a state changes NOTHING outside this panel — no session, no
//     authority. (Truth sweep 2026-07-17: the app-wide provider is no longer
//     hardwired S1 — it wires S1⇄S4⇄S7⇄S11 live from the server session.)
// Every simulated view carries the SIMULATED STATE — NOT WIRED warning.

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AccessStateId } from "@workspace/os-contracts";
import {
  ACCESS_STATE_IDS,
  accessStates,
  evaluateAccess,
  matrixAllows,
} from "@/config/accessState";
import { surfaceClassification } from "@/config/surfaceClassification";
import { AccessStateChip } from "@/components/access/AccessStateChip";

// Verbatim-unique dist-grep probe (guard-operator-gate section 9).
const SIMULATOR_PROBE = "ACCESS-STATE SIMULATOR — SIMULATED STATE — NOT WIRED";

export function AccessStateSimulator() {
  const [simulated, setSimulated] = useState<AccessStateId>("S1");
  const meta = accessStates[simulated];

  return (
    <Card className="p-6 border-dashed" data-testid="card-access-simulator">
      <p className="font-mono text-[11px] tracking-widest text-warning mb-1">
        {SIMULATOR_PROBE}
      </p>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
        Matrix explorer. Selecting a state changes nothing outside this panel —
        no session, no persistence, no authority. The app-wide access state is
        LIVE: it resolves from the real server session (S1 ⇄ S4 ⇄ S7 ⇄ S11,
        fail-closed to S1), and INTERNAL routes are gated in production by the
        server-confirmed operator role. This panel only previews the §3 matrix
        for states other than your own.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {ACCESS_STATE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setSimulated(id)}
            className={`rounded-md transition-opacity ${simulated === id ? "opacity-100 ring-1 ring-ring" : "opacity-60 hover:opacity-100"}`}
            data-testid={`button-simulate-${id}`}
          >
            <AccessStateChip stateId={id} />
          </button>
        ))}
      </div>

      <div className="mb-4 text-sm text-foreground">
        <span className="font-medium">{meta.name}</span>
        <span className="text-muted-foreground"> — {meta.honestNote}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground font-mono">
              <th className="py-1.5 pr-3 font-medium">Surface</th>
              <th className="py-1.5 pr-3 font-medium">Required (future)</th>
              <th className="py-1.5 pr-3 font-medium">Enforcement today</th>
              <th className="py-1.5 pr-3 font-medium">Matrix outcome</th>
              <th className="py-1.5 font-medium">Rendered today</th>
            </tr>
          </thead>
          <tbody>
            {surfaceClassification.map((s) => {
              const wouldAllow = matrixAllows(simulated, s.requiredState);
              const today = evaluateAccess(simulated, s.requiredState, s.enforcement);
              return (
                <tr key={s.routePath} className="border-t border-border/60">
                  <td className="py-1.5 pr-3 font-mono">{s.routePath}</td>
                  <td className="py-1.5 pr-3 font-mono">{s.requiredState}</td>
                  <td className="py-1.5 pr-3 font-mono">{s.enforcement}</td>
                  <td className="py-1.5 pr-3">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] px-1.5 py-0 ${wouldAllow ? "border-success/40 text-success" : "border-destructive/40 text-destructive"}`}
                    >
                      {wouldAllow ? "ALLOW" : "BLOCK"}
                    </Badge>
                  </td>
                  <td className="py-1.5 font-mono text-muted-foreground">
                    {today.outcome}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        “Matrix outcome” is the §3 access matrix from the checkpointed design
        doc. “Rendered today” is the CLIENT side only: every surface stays
        PREVIEW_LABELLED — visibility, never permission. The real walls (the
        member sign-in wall, the operator wall) are enforced server-side.
        Nothing HERE authorizes anything.
      </p>
    </Card>
  );
}
