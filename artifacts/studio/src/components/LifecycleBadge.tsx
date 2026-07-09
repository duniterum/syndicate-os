import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import { type DisplayLifecycle, displayLifecycleText } from "@/config/truthStatus";

interface LifecycleBadgeProps {
  lifecycle: DisplayLifecycle;
  className?: string;
}

// Lifecycle → tokenized tone. Read-only proof is cyan proof; paused / pending are
// caution (amber); founder-gated rides the identity (gold) axis; everything else is
// inert → neutral. None of these read as an affirmative "live" state.
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
};

export function LifecycleBadge({ lifecycle, className = "" }: LifecycleBadgeProps) {
  return (
    <StatusPill tone={lifecycleTone[lifecycle] ?? "neutral"} className={className}>
      {displayLifecycleText[lifecycle]}
    </StatusPill>
  );
}
