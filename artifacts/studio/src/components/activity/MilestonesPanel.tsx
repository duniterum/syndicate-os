// components/activity/MilestonesPanel.tsx — the protocol's canonical account
// of itself (H2-⑬ origin harvest → M-EVO-2 family lanes, founder GO and
// GO-Live 2026-07-22, MILESTONE_SYSTEM_EVOLUTION.md).
// ---------------------------------------------------------------------------
// THE FAMILY LANES (law 2, the goal-gradient): each family shows its sealed
// count + THE NEXT rung's honest progress bar — several living bars at any
// moment, never one distant number. The full sealed record (every crossing
// anchored to its exact transaction, §8 trust law) lives one click away in
// the expander when condensed. The server's derivation notes render
// verbatim — an honest middle state is shown, never hidden. No milestones
// block = the panel simply does not render (the feed's own methodology says
// the served history is dark).

import { CheckCircle2, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  formatSynRaw,
  formatUsdcRaw,
  MILESTONE_FAMILY_BY_KIND,
  MILESTONE_FAMILY_LABEL,
  type ServedMilestoneFamily,
  type ServedMilestoneLine,
  type ServedMilestones,
} from "@/lib/backboneFeedClient";

const FAMILY_ORDER: readonly ServedMilestoneFamily[] = [
  "membership",
  "economy",
  "fire",
  "referral",
  "liquidity",
  "archive",
];

// Defense in depth (adversarial verify, 2026-07-22): a non-finite ratio can
// never reach the bar — NaN width renders as a full gold bar in CSS.
function clampPct(ratio: number): number | null {
  return Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : null;
}

function progressFor(a: ServedMilestones["approaching"][number]): {
  text: string;
  pct: number;
} | null {
  if (a.kind === "seats" && a.currentSeats !== null) {
    const pct = clampPct(a.currentSeats / a.target);
    if (pct === null) return null;
    return {
      text: `${a.currentSeats.toLocaleString("en-US")} / ${a.target.toLocaleString("en-US")} seats`,
      pct,
    };
  }
  if (a.kind === "usdc" && a.currentUsdcRaw !== null) {
    const current = Number(BigInt(a.currentUsdcRaw) / 1_000_000n);
    return {
      text: `${formatUsdcRaw(a.currentUsdcRaw)} / ${a.target.toLocaleString("en-US")} USDC routed`,
      pct: clampPct(current / a.target) ?? 0,
    };
  }
  // M-EVO-2: the cumulative-SYN ladder (18-dec raw → whole SYN).
  if (a.kind === "burn-syn" && a.currentSynRaw !== null) {
    const current = Number(BigInt(a.currentSynRaw) / 10n ** 18n);
    return {
      text: `${formatSynRaw(a.currentSynRaw)} / ${a.target.toLocaleString("en-US")} SYN burned`,
      pct: clampPct(current / a.target) ?? 0,
    };
  }
  // M-EVO-2: the act ladders (burns · source creations · pool adds ·
  // artifacts) — a plain honest count toward the rung.
  if (
    (a.kind === "burn-acts" ||
      a.kind === "sources-created" ||
      a.kind === "lp-acts" ||
      a.kind === "archive-count") &&
    a.currentCount !== null
  ) {
    return {
      text: `${a.currentCount.toLocaleString("en-US")} / ${a.target.toLocaleString("en-US")}`,
      pct: clampPct(a.currentCount / a.target) ?? 0,
    };
  }
  // first-mint (or a missing figure): no meaningful bar — honest text only.
  return null;
}

function SealedRow({
  m,
  explorerBase,
}: {
  m: ServedMilestoneLine;
  explorerBase: string | null;
}) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden="true" />
      <span className="text-sm text-foreground/90 flex-1 min-w-40">{m.label}</span>
      <span className="font-mono text-xs text-muted-foreground">
        {m.isoDayUtc} · block {m.blockNumber.toLocaleString("en-US")}
      </span>
      {explorerBase ? (
        <a
          href={`${explorerBase}/tx/${m.transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-proof/80 hover:text-proof"
        >
          verify <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
        </a>
      ) : null}
    </li>
  );
}

function ApproachingRow({
  a,
}: {
  a: ServedMilestones["approaching"][number];
}) {
  const p = progressFor(a);
  return (
    <li>
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
}

export function MilestonesPanel({
  milestones,
  explorerBase,
  condensed = false,
  fomoLine = null,
}: {
  milestones: ServedMilestones;
  explorerBase: string | null;
  /** A3/M-EVO-2: WORK-FIRST — family lanes + next bars; the full sealed
   *  record one click away. */
  condensed?: boolean;
  /** The historical-FOMO line (business-first ruling 2026-07-22) — TRUE,
   *  chain-derived, historical only. Null = not rendered. */
  fomoLine?: string | null;
}) {
  const familyOf = (m: ServedMilestoneLine): ServedMilestoneFamily =>
    MILESTONE_FAMILY_BY_KIND[m.milestoneKind];
  const lanes = FAMILY_ORDER.map((family) => ({
    family,
    label: MILESTONE_FAMILY_LABEL[family],
    sealed: milestones.sealed.filter((m) => familyOf(m) === family),
    approaching: milestones.approaching.filter((a) => a.family === family),
  })).filter((l) => l.sealed.length > 0 || l.approaching.length > 0);

  return (
    <Card className="bg-card/30 border-border/50 p-4 mb-6" data-testid="milestones-panel">
      <h2 className="text-sm font-medium text-foreground mb-1">
        Milestones — the protocol's canonical account
      </h2>
      {fomoLine ? (
        <p className="text-sm font-medium text-gold leading-relaxed mb-2" data-testid="milestones-fomo">
          {fomoLine}
        </p>
      ) : null}
      {/* DENSITY (founder catch 2026-07-22): the methodology paragraph is
          reference — in the condensed rail it lives inside the expander,
          never as a wall of text above the lanes. */}
      {!condensed ? (
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          Canonical thresholds across the protocol's families — seats, USDC
          routed, the fire record, referral registry, pool acts, archive
          memory — derived from the same gapless indexed history as the feed.
          A sealed milestone anchors to the exact transaction where the chain
          crossed it; every family always has a next rung.
        </p>
      ) : null}

      {/* M-EVO-2 — THE FAMILY LANES: sealed count + the next rung's bar. */}
      <div className="mt-4 space-y-5" data-testid="milestones-lanes">
        {lanes.map((lane) => (
          <div key={lane.family} data-testid={`milestones-lane-${lane.family}`}>
            <div className="flex flex-wrap items-baseline gap-x-3 mb-2">
              <h3 className="text-xs font-medium uppercase tracking-wider text-foreground/80">
                {lane.label}
              </h3>
              <span className="font-mono text-xs text-muted-foreground">
                {lane.sealed.length > 0
                  ? `${lane.sealed.length} sealed`
                  : "nothing sealed yet — an honest zero"}
              </span>
            </div>
            {!condensed && lane.sealed.length > 0 ? (
              <ul className="space-y-1.5 mb-2" data-testid="milestones-sealed">
                {lane.sealed.map((m) => (
                  <SealedRow key={m.milestoneId} m={m} explorerBase={explorerBase} />
                ))}
              </ul>
            ) : null}
            <ul className="space-y-2">
              {lane.approaching.map((a) => (
                <ApproachingRow key={a.id} a={a} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Condensed: the full sealed record, one click away (WORK-FIRST). */}
      {condensed && milestones.sealed.length > 0 ? (
        <details className="mt-5" data-testid="milestones-sealed-expander">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
            The sealed record ({milestones.sealed.length}) — every crossing
            with its verify anchor
          </summary>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            Canonical thresholds across the protocol's families, derived from
            the same gapless indexed history as the feed. A sealed milestone
            anchors to the exact transaction where the chain crossed it;
            every family always has a next rung.
          </p>
          <ul className="space-y-2 mt-3" data-testid="milestones-sealed">
            {milestones.sealed.map((m) => (
              <SealedRow key={m.milestoneId} m={m} explorerBase={explorerBase} />
            ))}
          </ul>
        </details>
      ) : null}

      {milestones.notes.length > 0 ? (
        <p className="text-xs text-muted-foreground leading-relaxed mt-3" data-testid="milestones-notes">
          {milestones.notes.join(" · ")}
        </p>
      ) : null}
    </Card>
  );
}
