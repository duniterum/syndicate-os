// components/registry/registryPosture.tsx — shared fail-closed posture derivation.
// ---------------------------------------------------------------------------
// ONE render-time derivation for Module Registry v0 postures, shared by every
// consumer (public homepage cards, Member Home, the internal control
// tower). Nothing here is a hardcoded status: posture resolves from the
// entry's declared proofSource — a GET /api/source-status category or a
// GET /api/protocol/reality group — falling back to the module's honest
// wiring reason code. A missing category, failed fetch, or unknown key
// renders an explicit "unavailable (fail-closed)" state, never an invented
// value. Public-safe: no internal route literals, no addresses, no writes.

import {
  type SourceStatusItem,
  type SourceStatusResponse,
  type ProtocolRealityResponse,
} from "@workspace/api-client-react";
import { TruthLabel } from "@/components/TruthLabel";
import { PostureBadge } from "@/components/PostureBadge";
import { Spinner } from "@/components/ui/spinner";
import type {
  ModuleRegistryEntry,
  RealityGroupKey,
} from "@/config/moduleRegistry";

export type SourceStatusData = SourceStatusResponse | undefined;

/** Fail-closed category lookup — absent ledger or key → null, never a guess. */
export function lookupCategory(
  data: SourceStatusData,
  category: string,
): SourceStatusItem | null {
  if (!data) return null;
  const item = data.categories[category];
  return item ?? null;
}

/** Count a reality group's readable signals (failureReason null + value present). */
export function realityGroupSummary(
  data: ProtocolRealityResponse | undefined,
  group: RealityGroupKey,
): { readable: number; total: number } | null {
  if (!data) return null;
  const items = data.groups[group];
  if (!items) return null;
  return {
    readable: items.filter((i) => i.failureReason === null && i.value !== null)
      .length,
    total: items.length,
  };
}

export function PostureUnavailable({
  text = "Posture unavailable (fail-closed)",
}: {
  text?: string;
}) {
  return (
    <span className="font-mono text-[11px] text-destructive">
      {text}
    </span>
  );
}

export interface RegistryPostureQueries {
  sourceStatus: SourceStatusData;
  sourceLoading: boolean;
  sourceError: boolean;
  reality: ProtocolRealityResponse | undefined;
  realityLoading: boolean;
  realityError: boolean;
}

/**
 * Render one registry entry's posture. sourceStatus-backed entries render the
 * ledger's PostureBadge; reality-backed entries render a read-only signal
 * summary; everything else falls back to the entry's honest wiring label or
 * an explicit fail-closed notice.
 */
export function RegistryPostureChip({
  entry,
  sourceStatus,
  sourceLoading,
  sourceError,
  reality,
  realityLoading,
  realityError,
}: { entry: ModuleRegistryEntry } & RegistryPostureQueries) {
  const fallback = entry.fallbackTruthStatus ? (
    <TruthLabel variant={entry.fallbackTruthStatus} />
  ) : null;

  if (!entry.proofSource) {
    return fallback ?? <PostureUnavailable text="No posture source declared" />;
  }

  if (entry.proofSource.kind === "sourceStatus") {
    if (sourceLoading) return <Spinner className="h-3.5 w-3.5" />;
    if (sourceError) return <PostureUnavailable />;
    const item = lookupCategory(sourceStatus, entry.proofSource.category);
    if (!item) return fallback ?? <PostureUnavailable />;
    return <PostureBadge posture={item.posture} />;
  }

  // reality group
  if (realityLoading) return <Spinner className="h-3.5 w-3.5" />;
  if (realityError)
    return <PostureUnavailable text="Proof unavailable (fail-closed)" />;
  const summary = realityGroupSummary(reality, entry.proofSource.group);
  if (!summary)
    return fallback ?? <PostureUnavailable text="Proof unavailable (fail-closed)" />;
  return (
    <span className="font-mono text-[11px] text-proof">
      {summary.readable}/{summary.total} read-only signals reconciled
    </span>
  );
}
