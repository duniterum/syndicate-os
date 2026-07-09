// AccessStateChip — monospace pill for an S1–S14 access state (IA-1).
// Vocabulary display only; a chip is never evidence of authentication.

import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import type { AccessStateId } from "@workspace/os-contracts";
import { accessStates, resolveAccessState } from "@/config/accessState";

// Track → tokenized tone. PRIVILEGED reads on the identity (gold) axis; USER and
// MACHINE are inert vocabulary states → neutral. The label carries the precision.
const trackTone: Record<string, StatusTone> = {
  USER: "neutral",
  PRIVILEGED: "identity",
  MACHINE: "neutral",
};

export function AccessStateChip({
  stateId,
  className = "",
}: {
  stateId: AccessStateId;
  className?: string;
}) {
  const id = resolveAccessState(stateId);
  const meta = accessStates[id];
  return (
    <StatusPill
      tone={trackTone[meta.track] ?? "neutral"}
      className={className}
      data-testid={`chip-access-state-${id}`}
    >
      {meta.chipLabel}
    </StatusPill>
  );
}
