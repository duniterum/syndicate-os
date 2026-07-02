// AccessStateChip — monospace badge for an S1–S14 access state (IA-1).
// Vocabulary display only; a chip is never evidence of authentication.

import { Badge } from "@/components/ui/badge";
import type { AccessStateId } from "@workspace/os-contracts";
import { accessStates, resolveAccessState } from "@/config/accessState";

const trackStyles: Record<string, string> = {
  USER: "border-sky-300 text-sky-700 bg-sky-50 dark:border-sky-500/40 dark:text-sky-300 dark:bg-sky-500/10",
  PRIVILEGED:
    "border-amber-300 text-amber-700 bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:bg-amber-500/10",
  MACHINE:
    "border-zinc-300 text-zinc-600 bg-zinc-50 dark:border-zinc-500/40 dark:text-zinc-400 dark:bg-zinc-500/10",
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
    <Badge
      variant="outline"
      className={`font-mono text-[10px] sm:text-xs font-medium px-2 py-0.5 whitespace-nowrap transition-colors ${trackStyles[meta.track]} ${className}`}
      data-testid={`chip-access-state-${id}`}
    >
      {meta.chipLabel}
    </Badge>
  );
}
