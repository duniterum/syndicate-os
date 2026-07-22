// components/activity/MilestonesPanel.tsx — the protocol's canonical account
// of itself (H2-⑬, origin /activity Milestones section harvested + adapted).
// ---------------------------------------------------------------------------
// TWO honest lists from the served feed's milestones block:
//   • SEALED — each crossing anchored to the exact transaction where the
//     chain crossed it (verify link beside the claim, §8 trust law).
//   • APPROACHING — honest progress from the indexed history (never a fake
//     bar: a first-of-kind milestone has no meaningful "0 of 1" progress —
//     the origin's presentation-truth rule, carried).
// The server's derivation notes render verbatim — an honest middle state is
// shown, never hidden. No milestones block = the panel simply does not
// render (the feed's own banner already says the served history is dark).

import { CheckCircle2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  formatUsdcRaw,
  type ServedMilestones,
} from "@/lib/backboneFeedClient";

function progressFor(a: ServedMilestones["approaching"][number]): {
  text: string;
  pct: number;
} | null {
  if (a.kind === "seats" && a.currentSeats !== null) {
    return {
      text: `${a.currentSeats.toLocaleString("en-US")} / ${a.target.toLocaleString("en-US")} seats`,
      pct: Math.max(0, Math.min(1, a.currentSeats / a.target)),
    };
  }
  if (a.kind === "usdc" && a.currentUsdcRaw !== null) {
    const current = Number(BigInt(a.currentUsdcRaw) / 1_000_000n);
    return {
      text: `${formatUsdcRaw(a.currentUsdcRaw)} / ${a.target.toLocaleString("en-US")} USDC routed`,
      pct: Math.max(0, Math.min(1, current / a.target)),
    };
  }
  // first-mint (or a missing figure): no meaningful bar — honest text only.
  return null;
}

export function MilestonesPanel({
  milestones,
  explorerBase,
  condensed = false,
  fomoLine = null,
}: {
  milestones: ServedMilestones;
  explorerBase: string | null;
  /**
   * A3 (the newsroom rebuild, wireframe approved 2026-07-22): the WORK-FIRST
   * placement — sealed list + the NEXT approaching threshold only, the full
   * approaching list one click away in a collapsed expander.
   */
  condensed?: boolean;
  /**
   * A3 (business-first ruling, 2026-07-22): the historical-FOMO line —
   * TRUE, chain-derived, historical only ("a place in the founding story is
   * claimed once") — never financial, never invented. Null = not rendered.
   */
  fomoLine?: string | null;
}) {
  const approachingShown = condensed
    ? milestones.approaching.slice(0, 1)
    : milestones.approaching;
  const approachingRest = condensed ? milestones.approaching.slice(1) : [];
  const renderApproaching = (list: ServedMilestones["approaching"]) => (
    <ul className="space-y-2">
      {list.map((a) => {
        const p = progressFor(a);
        return (
          <li key={a.id}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="text-xs text-foreground/80 flex-1 min-w-40">{a.label}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {p ? p.text : "awaiting its first on-chain act"}
              </span>
            </div>
            {p ? (
              <div
                className="mt-1 h-1 rounded-full bg-border/40 overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.round(p.pct * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${a.label} progress`}
              >
                <div
                  className="h-full rounded-full bg-gold/50"
                  style={{ width: `${Math.max(1, Math.round(p.pct * 100))}%` }}
                />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
  return (
    <Card className="bg-card/30 border-border/50 p-4 mb-6" data-testid="milestones-panel">
      <h2 className="text-sm font-medium text-foreground mb-1">
        Milestones — the protocol's canonical account
      </h2>
      {fomoLine ? (
        <p className="text-sm font-medium text-gold leading-relaxed mb-1.5" data-testid="milestones-fomo">
          {fomoLine}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        Canonical thresholds — seat ordinals, cumulative USDC routed through
        the sale, first-of-kind mints — derived from the same gapless indexed
        history as the feed. A sealed milestone anchors to the exact
        transaction where the chain crossed it.
      </p>

      {milestones.sealed.length > 0 ? (
        <ul className="space-y-1.5 mb-4" data-testid="milestones-sealed">
          {milestones.sealed.map((m) => (
            <li
              key={m.milestoneId}
              className="flex flex-wrap items-center gap-x-3 gap-y-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden="true" />
              <span className="text-sm text-foreground/90 flex-1 min-w-40">{m.label}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {m.isoDayUtc} · block {m.blockNumber.toLocaleString("en-US")}
              </span>
              {explorerBase ? (
                <a
                  href={`${explorerBase}/tx/${m.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-proof/80 hover:text-proof"
                >
                  verify <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground mb-4">
          No milestone is sealed within the indexed history yet.
        </p>
      )}

      {milestones.approaching.length > 0 ? (
        <div data-testid="milestones-approaching">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            {condensed ? "Next" : "Approaching"}
          </h3>
          {renderApproaching(approachingShown)}
          {approachingRest.length > 0 ? (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                All thresholds ({approachingRest.length} more)
              </summary>
              <div className="mt-2">{renderApproaching(approachingRest)}</div>
            </details>
          ) : null}
        </div>
      ) : null}

      {milestones.notes.length > 0 ? (
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-3" data-testid="milestones-notes">
          {milestones.notes.join(" · ")}
        </p>
      ) : null}
    </Card>
  );
}
