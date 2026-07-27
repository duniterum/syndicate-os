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

import { clampPct, progressFor } from "@/lib/milestoneProgress";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Disclosure } from "@/components/disclosure/Disclosure";
import { ProofAnchor } from "@/components/proof/ProofAnchor";
import {
  formatSynRaw,
  formatUsdcRaw,
  MILESTONE_FAMILY_BY_KIND,
  MILESTONE_FAMILY_LABEL,
  type ServedMilestoneFamily,
  type ServedMilestoneLine,
  type ServedMilestones,
} from "@/lib/backboneFeedClient";

// THE CANON ORDER — the families as the protocol names them (M-EVO-2).
const FAMILY_ORDER: readonly ServedMilestoneFamily[] = [
  "membership",
  "economy",
  "fire",
  "referral",
  "liquidity",
  "archive",
];

/**
 * THE DISPLAY ORDER — the same six families, PAIRED BY WEIGHT (Founder ruling at
 * the 2026-07-26 preview: "pas trop grade AAA sexy ?! trouve le moyen de le
 * rendre sexy, équilibré visuellement").
 *
 * THE CAUSE OF THE IMBALANCE, named rather than guessed: two families carry TWO
 * live milestones (fire: the tenth Proof of Burn + 50,000 SYN burned; archive: 25
 * artifacts + $100 of patronage) and four carry ONE. In a two-column grid the
 * canon order lands fire beside referral and archive beside nothing — a tall card
 * next to a short one, twice, so each row leaves a hole and the block reads
 * broken instead of composed.
 *
 * The fix is ordering, not CSS trickery: the two heavy families sit in the SAME
 * row, so every row pairs equal weight — (membership · economy) then
 * (fire · archive) then (referral · liquidity). `items-stretch` on the grid then
 * absorbs any future imbalance, so a seventh family or a new rung cannot bring
 * the holes back.
 */
const FAMILY_DISPLAY_ORDER: readonly ServedMilestoneFamily[] = [
  "membership",
  "economy",
  "fire",
  "archive",
  "referral",
  "liquidity",
];

// clampPct + progressFor MOVED to lib/milestoneProgress.ts (2026-07-27):
// the home band draws the same ladders, and two derivations of one percentage
// is the one-authority rule broken on a figure whose job is to be checkable.

function SealedRow({
  m,
  explorerBase,
}: {
  m: ServedMilestoneLine;
  explorerBase: string | null;
}) {
  return (
    // THE SAME PAIRING FIX AS THE MILESTONE FIGURES (Founder, 2026-07-26). The
    // label used to carry `flex-1`, which pushed its own date, block and verify
    // anchor to the far right of whatever width the row had — on a wide screen
    // the crossing and its proof were a screen apart, exactly the defect he made
    // me correct one panel above. Everything is left-clustered now: the label,
    // then the chain time it was sealed at, then the anchor that proves it. The
    // proof anchor is the shared atom, so this row can never drift back to a
    // 12px string with no target.
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-1">
      <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden="true" />
      <span className="text-sm text-foreground/90">{m.label}</span>
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {m.isoDayUtc} · block {m.blockNumber.toLocaleString("en-US")}
      </span>
      {explorerBase ? (
        <ProofAnchor
          href={`${explorerBase}/tx/${m.transactionHash}`}
          compact
          title={`${m.label} — open the sealing transaction`}
        />
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
  // A ZERO BAR IS EMPTY (approved mockup §④ truth fix, 2026-07-26). The width
  // was `Math.max(1, …)`, so a milestone at 0% still painted 1% of the track —
  // on a wide screen roughly 22px of gold asserting a progression that had NOT
  // happened. A figure of zero is honest; a pixel of zero is a claim. The floor
  // is gone and the card says the zero in words instead.
  const pctExact = p ? p.pct * 100 : 0;
  return (
    <li>
      {/* THE FIGURE SITS BESIDE ITS LABEL, NOT ACROSS THE SCREEN FROM IT.
          On a full-width line `justify-between` is exactly what produced the
          defect the Founder measured — the name at the far left, its number
          ~1,900px away at the far right, unpairable by eye. So they are
          LEFT-CLUSTERED and adjacent, and the bar below is what uses the full
          width. `flex-wrap` keeps the mobile escape fix: the number drops to
          its own line rather than pushing the document sideways. */}
      <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="min-w-0 text-base leading-snug text-foreground/90">{a.label}</span>
        <span className="whitespace-nowrap font-mono text-sm font-semibold tabular-nums text-muted-foreground">
          {p ? p.text : "awaiting its first act"}
        </span>
      </div>
      {p ? (
        <>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-border/40 ring-1 ring-inset ring-border"
            role="progressbar"
            aria-valuenow={Math.round(pctExact)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${a.label} progress`}
          >
            <div
              className="h-full rounded-full bg-gold"
              style={{ width: `${pctExact}%` }}
            />
          </div>
          {pctExact === 0 ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              Not started — an honest zero.
            </p>
          ) : null}
        </>
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
  const lanes = FAMILY_DISPLAY_ORDER.map((family) => ({
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

      {/* ── ONE CARD PER FAMILY (approved mockup §④, 2026-07-26) ─────────────
          THE DEFECT: the families were full-width LANES, so each label sat at
          the far left and its figure at the far right of whatever the screen
          was — the Founder measured ~1,900px of empty space between a name and
          its number on his 27-inch monitor, joined by a 3px thread.

          THE FIX, and it obeys the full-screen law (S7-d) rather than fighting
          it: no page cap, no empty margins — the extra width buys MORE COLUMNS.
          `auto-fit` + `minmax(min(100%, 20rem), 1fr)` puts six cards abreast on
          a 27-inch screen and exactly one on a phone, with no breakpoint list to
          maintain. Inside each card the label and its figure are neighbours. */}
      {/* TWO COLUMNS, THREE ROWS — the third layout and the Founder's call
          (2026-07-26 preview: "essaie 3 par 3 avec 2 colonnes"). The history is
          worth keeping because each step was a real judgement: auto-fit packed
          FIVE abreast and orphaned the sixth card beside a hole; six full-width
          lines gave every bar the whole page but made the block tall and thin.
          A fixed 2-column grid with six families divides EXACTLY — three rows,
          no orphan — and each bar still spans its own half of the page, which is
          plenty of length to read a proportion at a glance.
          The full-screen law is respected the way it asks to be: width is spent
          on a second CONTENT COLUMN, never on empty margin. One column on a
          phone, because two 20rem cards do not fit 375px. */}
      <div
        className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2"
        data-testid="milestones-lanes"
      >
        {lanes.map((lane) => (
          <div
            key={lane.family}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-5"
            data-testid={`milestones-lane-${lane.family}`}
          >
            {/* Left-clustered for the same reason as the figure below: on a
                full-width line, `justify-between` would throw "2 sealed" a
                screen away from the family it counts. */}
            <div className="mb-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h3 className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-gold">
                {lane.label}
              </h3>
              <span className="whitespace-nowrap font-mono text-xs tracking-[0.08em] text-muted-foreground">
                {lane.sealed.length > 0
                  ? `${lane.sealed.length} sealed`
                  : "none sealed yet"}
              </span>
            </div>
            {!condensed && lane.sealed.length > 0 ? (
              <ul className="mb-3 space-y-1.5" data-testid="milestones-sealed">
                {lane.sealed.map((m) => (
                  <SealedRow key={m.milestoneId} m={m} explorerBase={explorerBase} />
                ))}
              </ul>
            ) : null}
            <ul className="space-y-4">
              {lane.approaching.map((a) => (
                <ApproachingRow key={a.id} a={a} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Condensed: the full sealed record, one click away (WORK-FIRST). */}
      {condensed && milestones.sealed.length > 0 ? (
        <Disclosure
          className="mt-5"
          title="The sealed record"
          count={milestones.sealed.length}
          hint="every crossing with its verify anchor"
          testId="milestones-sealed-expander"
        >
          <p className="mb-4 max-w-[112ch] text-sm leading-relaxed text-muted-foreground lg:columns-2 lg:gap-12">
            Canonical thresholds across the protocol's families, derived from
            the same gapless indexed history as the feed. A sealed milestone
            anchors to the exact transaction where the chain crossed it;
            every family always has a next rung.
          </p>
          <ul data-testid="milestones-sealed">
            {milestones.sealed.map((m) => (
              <SealedRow key={m.milestoneId} m={m} explorerBase={explorerBase} />
            ))}
          </ul>
        </Disclosure>
      ) : null}

      {milestones.notes.length > 0 ? (
        <p className="text-xs text-muted-foreground leading-relaxed mt-3" data-testid="milestones-notes">
          {milestones.notes.join(" · ")}
        </p>
      ) : null}
    </Card>
  );
}
