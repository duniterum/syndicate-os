// SeasonStandingCard — the member's OWN season standing, served in place
// (S2d, founder GO-and-GO-LIVE 2026-07-24; the corrected member mockup's
// Season card, truth-amended — the #14-figures reconcile ruling: mockup
// figures are GEOMETRY, never data).
// ---------------------------------------------------------------------------
// ONE AUTHORITY, TWICE:
//   · rank / XP / axes come from GET /api/auth/season-standing — which picks
//     the SAME model row the public board serves, by the session's own seat,
//     server-side (one model, one authority — the 12-vs-14 lesson; and the
//     wallet boundary speaks to the auth zone ONLY, guard-access-state).
//   · the era ring + seal sentence read the hero's served seat spine
//     (useHeroReality + chapterForSeat) — the same figures the home band
//     shows, never a private recount.
// THE POT COLUMN IS A FRAME (seasonBounty FUTURE): the badge speaks, no
// dollar figure until the committed escrow exists.
// Fail-closed everywhere: a missing row is the honest zero view ("your first
// chain-proven act opens your row"), a dark model an honest line — nothing
// is invented. Own-row only (ADR-003): this reads the session's own seat and
// the public board; no lookup surface, no address anywhere.

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MembersProvenance } from "@/components/living/MembersProvenance";
import { chapterForSeat } from "@/lib/chapters";
import { eraForSeatCount } from "@/config/eraCanon";
import { useHeroReality } from "@/components/hero/useHeroReality";

type SeasonAxis = "connector" | "capital" | "steward" | "historian";

const AXIS_LABEL: Record<SeasonAxis, string> = {
  connector: "Connector",
  capital: "Capital",
  steward: "Steward",
  historian: "Historian",
};

interface OwnSeasonView {
  state: "S1" | "S4";
  seasonXp: number | null;
  seasonRank: number | null;
  seasonAxes: Partial<Record<SeasonAxis, number>> | null;
  failureReason: string | null;
}

type OwnRow =
  | { status: "loading" }
  | { status: "failed" }
  | { status: "ready"; view: OwnSeasonView };

export default function SeasonStandingCard() {
  const reality = useHeroReality();
  const seats = reality.membersTotalNumber;
  const [own, setOwn] = useState<OwnRow>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/season-standing", { method: "GET" });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as OwnSeasonView;
        if (cancelled) return;
        // Fail-closed (the audit's catch): S4 + a failureReason = the model
        // is dark — an honest line, NEVER a zero coalesced from null.
        if (body.state !== "S4" || body.failureReason !== null) {
          setOwn({ status: "failed" });
          return;
        }
        setOwn({ status: "ready", view: body });
      } catch {
        if (!cancelled) setOwn({ status: "failed" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ONE AUTHORITY for the era/season number + end seat: ERA_CANON (the
  // chain's schedule, the server's own boundaries); chapters = the name only.
  const era = seats !== null ? eraForSeatCount(seats) : null;
  const seasonNumber = era?.era ?? null;
  const endSeat = era?.endSeat ?? null;
  const chapter = era !== null ? chapterForSeat(era.endSeat) : null;
  const fillPct =
    seats !== null && endSeat !== null && endSeat > 0
      ? Math.min(100, Math.max(1.5, Math.round((seats / endSeat) * 1000) / 10))
      : 0;

  const view = own.status === "ready" ? own.view : null;
  const rankLabel = view?.seasonRank != null ? `#${view.seasonRank}` : "—";
  const axisNames = view?.seasonAxes
    ? (Object.keys(AXIS_LABEL) as SeasonAxis[])
        .filter((a) => (view.seasonAxes?.[a] ?? 0) > 0)
        .map((a) => AXIS_LABEL[a])
        .join(" · ")
    : "";

  return (
    <Card className="bg-card/40 border-gold/25 p-5" data-testid="member-season-card">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-medium text-foreground">
          {seasonNumber !== null && chapter !== null
            ? `Season ${seasonNumber} · ${chapter.name}`
            : "The season"}
        </h3>
        <span className="rounded border border-gold/40 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.08em] text-gold">
          Recognition
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* The era ring — the seal clock (spine fill %), your rank at center. */}
        <div
          className="grid h-[78px] w-[78px] shrink-0 place-items-center rounded-full"
          style={{
            background: `conic-gradient(hsl(var(--gold)) ${fillPct}%, hsl(var(--muted)) 0)`,
          }}
          aria-hidden="true"
        >
          <div className="grid h-[60px] w-[60px] place-items-center rounded-full bg-card font-serif text-[13px] text-gold">
            {rankLabel}
          </div>
        </div>
        <div className="min-w-[180px] flex-1">
          <div className="font-serif text-[19px] text-foreground">Your place this season</div>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {seasonNumber !== null && seats !== null && endSeat !== null ? (
              <>
                Seals when Era {seasonNumber} fills —{" "}
                <span className="font-mono">
                  {seats.toLocaleString("en-US")} / {endSeat.toLocaleString("en-US")}
                </span>{" "}
                seats. No date: the chain decides.
              </>
            ) : (
              <>Seals when the era fills. No date: the chain decides.</>
            )}
          </p>
          {/* guard-freshness law: a live member figure carries its
              dual-authority provenance + the verified as-of. */}
          <MembersProvenance
            variant="compact"
            className="mt-1.5"
            historicalFreeze={reality.historicalFreeze}
            v3Emitted={reality.v3Emitted}
            snapshotMemberTotal={reality.snapshotMemberTotal}
            snapshotAsOf={reality.snapshotAsOf}
            membersDiverged={reality.membersDiverged}
            distinctWallets={reality.distinctWallets}
            seatOverlap={reality.seatOverlap}
          />
        </div>
      </div>

      {own.status === "failed" ? (
        <p className="mt-3 text-xs leading-snug text-muted-foreground">
          Your season view is unavailable right now — nothing is assumed; it returns with the
          next read.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-x-[22px] gap-y-2">
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/70">
              Your XP
            </div>
            <div className="mt-0.5 font-serif text-[17px] text-primary tabular-nums">
              {(view?.seasonXp ?? 0).toLocaleString("en-US")}
            </div>
          </div>
          <div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/70">
              Your rank
            </div>
            <div className="mt-0.5 font-serif text-[17px] text-gold">{rankLabel}</div>
          </div>
          {axisNames !== "" && (
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/70">
                Your axes
              </div>
              <div className="mt-0.5 font-serif text-[15px] text-foreground">{axisNames}</div>
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground/70">
                Season pot
              </span>
              <LifecycleBadge lifecycle="FUTURE" />
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              the committed figure stands here the day it exists
            </div>
          </div>
        </div>
      )}

      {view !== null && (view.seasonXp ?? 0) === 0 && view.seasonRank === null && (
        <p className="mt-2 text-xs leading-snug text-muted-foreground">
          Your first chain-proven act opens your row on the board.
        </p>
      )}

      <p className="mt-3 border-t border-border/40 pt-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
        The season gives status — a rank, a badge, a place in the Chronicle. When the company
        funds a season reward it&apos;s real USDC for effort — paid openly, every amount shown.
        A rank, once earned, never drops.
      </p>
    </Card>
  );
}
