import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import type { SourcePosture } from "@workspace/os-contracts";

/**
 * Posture badge for the /status honesty hub, keyed by the canonical
 * @workspace/os-contracts SourcePosture vocabulary returned by
 * GET /api/source-status.
 *
 * C5 GO-LIVE (founder, 2026-07-13): widened from NonLivePosture to the full
 * SourcePosture — the /join checkout is a real, gated LIVE_ACTION (a write the
 * VISITOR signs from their own wallet; the server still sends nothing), and the
 * ledger must be able to say so honestly. Every other posture keeps its
 * non-live reading.
 */
export type BadgePosture = SourcePosture;

export const postureText: Record<BadgePosture, string> = {
  READ_ONLY_PROOF: "Read-only proof",
  NOT_WIRED: "Not wired",
  VERIFIED_SOURCE_PENDING_ADAPTER: "Verified source pending adapter",
  AUTH_REQUIRED: "Auth required",
  ADMIN_ONLY: "Admin only",
  LIVE_ACTION: "Live — signed from your wallet",
  FUTURE: "Future",
};

// Posture → tokenized tone. Read-only proof is the strongest read state (cyan
// proof); a pending source is caution (amber); admin-only and the one live
// write (the join — a membership act) ride the identity (gold) axis;
// everything else is inert → neutral.
const postureTone: Record<BadgePosture, StatusTone> = {
  READ_ONLY_PROOF: "proof",
  VERIFIED_SOURCE_PENDING_ADAPTER: "caution",
  NOT_WIRED: "neutral",
  AUTH_REQUIRED: "neutral",
  ADMIN_ONLY: "identity",
  LIVE_ACTION: "identity",
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
