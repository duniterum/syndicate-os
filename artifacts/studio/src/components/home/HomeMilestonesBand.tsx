/**
 * THE HOME MILESTONES BAND — momentum, not the record.
 * ---------------------------------------------------------------------------
 * Founder-approved wireframe: docs/design/home-milestones-band-mockup.html (v3,
 * 2026-07-27). He asked for what ICO pages do well — a visitor landing cold
 * must SEE that the protocol is advancing — and rejected my first proposal of a
 * single line. He was right; this is the section.
 *
 * WHAT IT IS NOT. The /activity panel stays exactly where it is: that one is
 * the RECORD, with every sealed crossing and its verify anchor. This one is the
 * MOMENTUM. Same read-model, same `progressFor`, two cuts — never two sources.
 *
 * THE THREE DECISIONS THE WIREFRAME MADE, so nobody "improves" them back:
 * ① NO CHAPTER LEAD. It said "14 of 333", which the hero and the era band
 *    already say. Cutting it removes a FOURTH framing of one number at the
 *    source. Each card owns a "Next milestone", which is a target — never a
 *    rival denominator.
 * ② THE HOUSE SHELL. The wireframe dropped the heading; seeing it BUILT between
 *    two framed sections showed why that was wrong — it read as an orphan. It
 *    now wears the same shell as every sibling (frame · gold eyebrow · type-h2 ·
 *    description · right-hand CTA). Harmony is part of adding a section, not a
 *    separate request (founder, 2026-07-27).
 * ③ THE ORDER IS THE PROTOCOL'S OWN CHAIN, not a ranking: people join →
 *    money routes → supply burns, then market depth → members bring members →
 *    the record accumulates. Deliberately NOT sorted by progress, which would
 *    re-sort itself whenever a figure moved and read as arranged, not true.
 */

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  fetchServedFeed,
  MILESTONE_FAMILY_BY_KIND,
  MILESTONE_FAMILY_LABEL,
  type ServedMilestoneFamily,
  type ServedMilestones,
} from "@/lib/backboneFeedClient";
import { progressPartsFor } from "@/lib/milestoneProgress";

/** ③ above. A separate constant from the /activity panel's order on purpose:
 *  that one pairs families by weight so its two-column rows sit flush; this one
 *  tells the mechanism left to right. Same families, different job. */
const HOME_FAMILY_ORDER: readonly ServedMilestoneFamily[] = [
  "membership",
  "economy",
  "fire",
  "liquidity",
  "referral",
  "archive",
];

/** Function symbols only — a seat, a split, a flame, depth, a network, a
 *  drawer. No rocket, no rising chart, no raining coins: the
 *  anti-financialization rule holds in decoration too, or it holds nowhere. */
function FamilyIcon({ family }: { family: ServedMilestoneFamily }) {
  const p = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (family) {
    case "membership":
      return (
        <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
          <path d="M6 10V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" />
          <path d="M4 10h16v5H4z" />
          <path d="M6 15v4M18 15v4" />
        </svg>
      );
    case "economy":
      // Money entering and being SPLIT onward. Arrows, never nodes — the
      // referral card owns the network language; this one owns flow.
      return (
        <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
          <path d="M2 12h7" />
          <path d="M9 12c3.5 0 3.5-6 7-6h4" />
          <path d="M9 12h11" />
          <path d="M9 12c3.5 0 3.5 6 7 6h4" />
          <path d="M18 4l2 2-2 2" />
          <path d="M18 10l2 2-2 2" />
          <path d="M18 16l2 2-2 2" />
        </svg>
      );
    case "fire":
      return (
        <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
          <path d="M12 3c3 3.6 5 6.2 5 9a5 5 0 0 1-10 0c0-1.6.7-3 2-4.4.4 1.3 1.1 2 2 2.2-.6-2.4-.2-4.4 1-6.8z" />
        </svg>
      );
    case "liquidity":
      return (
        <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
          <path d="M12 3.5s5.5 5.9 5.5 9.5a5.5 5.5 0 0 1-11 0C6.5 9.4 12 3.5 12 3.5z" />
          <path d="M6.9 14.5c1.6 0 1.6 1.4 3.2 1.4s1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4" />
        </svg>
      );
    case "referral":
      return (
        <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
          <circle cx="6" cy="12" r="2.4" />
          <circle cx="18" cy="6" r="2.4" />
          <circle cx="18" cy="18" r="2.4" />
          <path d="M8.1 10.9 15.9 7.1" />
          <path d="M8.1 13.1 15.9 16.9" />
        </svg>
      );
    case "archive":
      return (
        <svg viewBox="0 0 24 24" {...p} aria-hidden="true">
          <path d="M3 7h18v3H3z" />
          <path d="M5 10v9h14v-9" />
          <path d="M10 14h4" />
        </svg>
      );
  }
}

export function HomeMilestonesBand() {
  const [milestones, setMilestones] = useState<ServedMilestones | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchServedFeed().then((feed) => {
      if (!cancelled) setMilestones(feed?.milestones ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // FAIL-CLOSED: no served milestones → no band at all. A momentum section with
  // invented or empty bars is worse than no section, on a page that sells
  // provability.
  if (milestones === null) return null;

  const lanes = HOME_FAMILY_ORDER.map((family) => {
    const sealed = milestones.sealed.filter(
      (m) => MILESTONE_FAMILY_BY_KIND[m.milestoneKind] === family,
    ).length;
    // ONE BAR PER FAMILY, AND THE CHOICE IS DELIBERATE (pre-handoff gate,
    // 2026-07-27). A family can carry SEVERAL ladders — Fire has both "proofs
    // of burn" (acts) and "SYN burned" (cumulative). The first version took
    // `[0]`, i.e. whatever the server happened to list first, so the home page
    // could silently swap which ladder it advertised when the server's order
    // moved. The band now shows the ladder CLOSEST TO SEALING: it is
    // deterministic, it needs no per-family table to maintain, and it is the
    // honest momentum signal — what is about to happen next.
    // The /activity record still shows every ladder; this is the summary.
    const candidates = milestones.approaching
      .filter((a) => a.family === family)
      .map((a) => ({ next: a, parts: progressPartsFor(a) }))
      .filter((c): c is { next: typeof c.next; parts: NonNullable<typeof c.parts> } =>
        c.parts !== null,
      )
      .sort((x, y) => y.parts.pct - x.parts.pct);
    const chosen = candidates[0] ?? null;
    const next = chosen?.next ?? null;
    const parts = chosen?.parts ?? null;
    return { family, sealed, next, parts };
  }).filter((l) => l.sealed > 0 || l.next !== null);

  if (lanes.length === 0) return null;

  const sealedTotal = milestones.sealed.length;

  return (
    <section
      className="w-full px-4 py-3 text-foreground sm:px-6 lg:px-8"
      aria-labelledby="home-milestones-heading"
      data-testid="home-milestones-band"
    >
      {/* THE HOUSE SHELL, not a bespoke one (founder, 2026-07-27: "harmony
          design ce n'est pas dans tes tâches… le cadre, le titre comme le
          reste, un texte descriptif"). The first build shipped a BARE section
          between two framed ones — an orphan with no frame, no title and no
          description, which is why it read as dropped in rather than belonging.
          Same shell as every sibling: rounded-2xl frame · gold mono eyebrow ·
          type-h2 title · muted description · the CTA on the right. */}
      <div className="rounded-2xl border border-border bg-card/40 p-6 shadow-sm md:p-8">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="measure">
            <div className="syn-eyebrow mb-3 text-gold">
              The protocol&rsquo;s canonical account
            </div>
            <h2 id="home-milestones-heading" className="type-h2 mb-3 text-foreground">
              What the protocol has sealed, and what comes next
            </h2>
            {/* PUBLIC COPY — human words only, and it carries the COUNT so no
                second sentence has to repeat it. */}
            <p className="text-muted-foreground">
              <strong className="font-semibold text-foreground">
                {sealedTotal} milestone{sealedTotal === 1 ? "" : "s"} sealed so far.
              </strong>{" "}
              Each card counts what its family has already sealed and shows the next mark the
              protocol is moving toward. A sealed milestone is not a plan &mdash; it is a
              transaction on Avalanche you can open.
            </p>
          </div>
          <Link
            href="/activity?facet=milestone"
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Button variant="outline">See the full record</Button>
          </Link>
        </div>

      {/* THREE COLUMNS AT THE TOP END, ON PURPOSE (preview gate, 2026-07-27).
          `auto-fit` fitted FOUR cards at 1440px and left a ragged row of two —
          and it destroyed the reason the order exists: row 1 is the mechanism
          (join → route → burn), row 2 is what is being built (depth → network →
          record), and the vertical pairs mean something (fire over archive:
          what is burned, what is kept). A grid that reflows by width alone
          cannot know that. This is NOT a page cap — the section still spans the
          full width and the cards grow; only the column COUNT is held at the
          number the composition needs. */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {lanes.map((lane) => (
          <div
            key={lane.family}
            className="flex flex-col gap-4 rounded-xl border border-border bg-background/58 p-6 transition-colors hover:border-gold/40 dark:border-white/10 dark:bg-white/[0.035]"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-full border border-border text-gold dark:border-white/10">
                <span className="block h-[19px] w-[19px]">
                  <FamilyIcon family={lane.family} />
                </span>
              </span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="syn-label text-muted-foreground">
                  {MILESTONE_FAMILY_LABEL[lane.family]}
                </span>
                <span className="text-sm font-medium text-primary">
                  {lane.sealed} sealed
                </span>
              </span>
            </div>

            {lane.next !== null && lane.parts !== null ? (
              <div className="mt-auto flex flex-col gap-2.5">
                <span className="text-body-sm text-foreground">
                  Next milestone &mdash; {lane.next.label}
                </span>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-border"
                  role="img"
                  aria-label={`${lane.parts.current} of ${lane.parts.target}`}
                >
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${(lane.parts.pct * 100).toFixed(2)}%` }}
                  />
                </div>
                <span className="flex items-baseline justify-between gap-2.5 font-mono text-xs tabular-nums text-muted-foreground">
                  <span className="font-semibold text-gold">{lane.parts.current}</span>
                  <span>{lane.parts.target}</span>
                </span>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      </div>
    </section>
  );
}
