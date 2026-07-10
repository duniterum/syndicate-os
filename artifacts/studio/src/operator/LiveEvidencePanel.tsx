// Live proof panel for /os-map spine nodes (operator-gated).
// ---------------------------------------------------------------------------
// Composes the SAME shared RealityTable that public /status and /contracts
// already render — this panel adds only classification/provenance chrome, so
// the spine shows an operator view of data the endpoint already serves
// publicly. Fail-closed: on fetch failure or a missing group it renders the
// unavailable state (static doctrine above it is retained) and never shows
// stale or fabricated live claims. The fetched-at line is page-load client
// time, deliberately NOT protocol/event truth.

import { useGetProtocolReality } from "@workspace/api-client-react";
import { AlertTriangle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { MetaStrip, RealityTable } from "@/components/ProtocolReality";
import { selectNodeEvidence } from "@/operator/protocolRealityEvidence";

const UNAVAILABLE_COPY =
  "LIVE PROOF UNAVAILABLE — static doctrine retained; no fabricated or stale values are shown.";

function fetchedAtText(dataUpdatedAt: number): string {
  const d = new Date(dataUpdatedAt);
  return `${d.toISOString().slice(11, 16)} UTC`;
}

function Unavailable() {
  return (
    <div
      className="mt-3 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 flex items-start gap-2"
      data-testid="osmap-live-unavailable"
    >
      <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
      <p className="font-mono text-[10px] tracking-wide text-warning leading-relaxed">
        {UNAVAILABLE_COPY}
      </p>
    </div>
  );
}

export function LiveEvidencePanel({ nodeId }: { nodeId: string }) {
  const { data, isLoading, isError, dataUpdatedAt } = useGetProtocolReality();

  if (isLoading) {
    return (
      <div className="mt-3 flex items-center gap-2 text-muted-foreground">
        <Spinner className="h-3.5 w-3.5" />
        <span className="text-[11px]">Reading live proof…</span>
      </div>
    );
  }
  if (isError || !data) return <Unavailable />;

  const items = selectNodeEvidence(data, nodeId);
  if (!items) return <Unavailable />;

  return (
    <div className="mt-3" data-testid={`osmap-live-evidence-${nodeId}`}>
      <RealityTable items={items} />
      <p className="font-mono text-[10px] text-muted-foreground/80 mt-2">
        GET /api/protocol/reality · fetched at page load {fetchedAtText(dataUpdatedAt)}
      </p>
    </div>
  );
}

/**
 * Envelope meta for the spine domain header — the server-reported mode,
 * expected chain, cache flag, and asOf. Rendered only when the live read
 * succeeded; on failure it renders nothing (no stale envelope claims — the
 * per-node panels already show the unavailable state).
 */
export function SpineDomainMeta() {
  const { data, isLoading, isError } = useGetProtocolReality();
  if (isLoading || isError || !data) return null;
  return <MetaStrip data={data} />;
}
