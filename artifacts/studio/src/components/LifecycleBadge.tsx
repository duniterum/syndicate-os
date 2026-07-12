import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import { type DisplayLifecycle, displayLifecycleText } from "@/config/truthStatus";

interface LifecycleBadgeProps {
  lifecycle: DisplayLifecycle;
  className?: string;
}

// Lifecycle → tokenized tone. Read-only proof is cyan proof; paused / pending are
// caution (amber); founder-gated rides the identity (gold) axis; everything else is
// inert → neutral. C5 go-live (founder, 2026-07-13): LIVE_ACTION — the one real
// write, the /join checkout — rides the identity (gold) axis: the seat is the
// membership act. Every OTHER lifecycle still never reads as "live".
const lifecycleTone: Record<DisplayLifecycle, StatusTone> = {
  READ_ONLY_PROOF: "proof",
  HISTORICAL_PROOF: "neutral",
  PAUSED_BY_PRECAUTION: "caution",
  PENDING_ADAPTER: "caution",
  NOT_ACTIVE: "neutral",
  FOUNDER_GATED: "identity",
  AUTH_REQUIRED: "neutral",
  PREVIEW: "neutral",
  DESIGN_CONCEPT: "neutral",
  FUTURE: "neutral",
  LIVE_ACTION: "identity",
};

export function LifecycleBadge({ lifecycle, className = "" }: LifecycleBadgeProps) {
  return (
    <StatusPill tone={lifecycleTone[lifecycle] ?? "neutral"} className={className}>
      {displayLifecycleText[lifecycle]}
    </StatusPill>
  );
}
