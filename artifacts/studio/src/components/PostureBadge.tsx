import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import type { NonLivePosture } from "@workspace/os-contracts";

/**
 * Posture badge for the /status honesty hub, keyed by the canonical
 * @workspace/os-contracts SourcePosture vocabulary returned by
 * GET /api/source-status.
 *
 * This is posture-only: it communicates wiring posture, never a live value. The
 * prop is typed as NonLivePosture — the canon's read / display / gated postures
 * with LIVE_ACTION deliberately excluded, so a badge can never imply a live write.
 */
export type BadgePosture = NonLivePosture;

export const postureText: Record<BadgePosture, string> = {
  READ_ONLY_PROOF: "Read-only proof",
  NOT_WIRED: "Not wired",
  VERIFIED_SOURCE_PENDING_ADAPTER: "Verified source pending adapter",
  AUTH_REQUIRED: "Auth required",
  ADMIN_ONLY: "Admin only",
  FUTURE: "Future",
};

// Posture → tokenized tone. Read-only proof is the strongest state (cyan proof);
// a pending source is caution (amber); admin-only rides the identity (gold) axis;
// everything else is inert → neutral. No state ever renders an affirmative "live".
const postureTone: Record<BadgePosture, StatusTone> = {
  READ_ONLY_PROOF: "proof",
  VERIFIED_SOURCE_PENDING_ADAPTER: "caution",
  NOT_WIRED: "neutral",
  AUTH_REQUIRED: "neutral",
  ADMIN_ONLY: "identity",
  FUTURE: "neutral",
};

interface PostureBadgeProps {
  posture: BadgePosture;
  className?: string;
}

export function PostureBadge({ posture, className = "" }: PostureBadgeProps) {
  return (
    <StatusPill tone={postureTone[posture] ?? "neutral"} className={className}>
      {postureText[posture] ?? posture}
    </StatusPill>
  );
}
