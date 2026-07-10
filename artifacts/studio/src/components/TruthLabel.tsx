import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import { TruthStatus, truthStatusText } from "@/config/truthStatus";

export type TruthLabelVariant = TruthStatus;

interface TruthLabelProps {
  variant: TruthLabelVariant;
  className?: string;
}

// Truth status → tokenized StatusPill tone. NOT_LIVE is danger (red); the various
// "not wired / awaiting index" adapters are caution (amber, pending); awaiting
// founder approval rides the identity (gold) axis; previews / future / missing are
// inert → neutral. The truthStatusText label carries the precise meaning; the tone
// is just the honest signal. None of these ever reads as an affirmative "live".
const truthTone: Record<TruthStatus, StatusTone> = {
  NOT_LIVE: "danger",
  DESIGN_PREVIEW: "neutral",
  FUTURE_MODULE: "neutral",
  EVENT_ADAPTER_NOT_WIRED: "caution",
  SOURCE_INDEXER_NOT_WIRED: "caution",
  ARCHIVE_READS_NOT_WIRED: "caution",
  AWAITING_CHAIN_INDEX: "caution",
  SYNDICATE_INDEXER_NOT_WIRED: "caution",
  AWAITING_FOUNDER_APPROVAL: "identity",
  LIVE_SOURCE_MISSING: "neutral",
};

export function TruthLabel({ variant, className = "" }: TruthLabelProps) {
  return (
    <StatusPill tone={truthTone[variant] ?? "neutral"} className={className}>
      {truthStatusText[variant]}
    </StatusPill>
  );
}
