// HomeSeasonSection — the visitor home's season band (S2c, founder GO-and-GO-
// LIVE 2026-07-24; the approved mockup: docs/design/seasons/
// season-visitor-home.mockup.html, §0.14-E corrected re-issue).
// ---------------------------------------------------------------------------
// THE LAWS THIS BAND OBEYS:
//   · FULL-SCREEN (S7-d): a full-bleed band, clamp padding — never a page cap.
//   · TWO COLUMNS 1.4fr/.9fr (mockup .season-top), collapsing under 860px.
//   · ONE-GOLD-CTA (conversion law §3): the hero owns the page's single FILLED
//     gold CTA — this band's join CTA renders SECONDARY (gold outline).
//   · ONE AUTHORITY for the seat count: the hero's served spine
//     (useHeroReality → financial.members.memberCount) — never /api/season,
//     never a second figure (the 12-vs-14 lesson). Era/chapter derive from it
//     (chapterForSeat — pure, deterministic).
//   · SEAT-THRESHOLD CLOCK, NEVER DATES (§0.14-F): "before Genesis Signal
//     seals" — the chain decides, no date anywhere.
//   · THE POT CARD IS A FRAME (seasonBounty FUTURE): LifecycleBadge + the
//     proven /season wording — NO dollar figure until the committed escrow
//     exists (a naked number is a chain-refutable claim).
//   · THE WORD IS "BUILDERS" (SETTLED_RULES §8-⑥); numbered ranks stay
//     "seated members".
//   · Fail-closed everywhere: a null spine hides figures (honest generic),
//     a DARK season payload hides the podium — nothing is invented.
// Superseded mockup copy applied at build time (recorded in the slice report):
// "Members earning" → "Builders earning" · the caption's "A seat = the season"
// dropped (§0.18: XP accrues at every level — the seat gates the pot, not
// play) · the alias clause dropped (aliasLayer stays future) · the $2,000
// money card renders as the FUTURE frame.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MembersProvenance } from "@/components/living/MembersProvenance";
import { SeasonMedal } from "./SeasonMedal";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { chapterForSeat, CHAPTERS } from "@/lib/chapters";

type SeasonAxis = "connector" | "capital" | "steward" | "historian";

const AXIS_LABEL: Record<SeasonAxis, string> = {
  connector: "Connector",
  capital: "Capital",
  steward: "Steward",
  historian: "Historian",
};

interface TeaserRow {
  display: string;
  shortForm?: string;
  seat: number | null;
  rank: number | null;
  xp: number;
  axes: Record<SeasonAxis, number>;
}

interface TeaserSeason {
  seasonNumber: number;
  playersEarning: number;
  standings: TeaserRow[];
}

interface TeaserPayload {
  module: "season";
  state: "LIVE" | "DARK";
  currentSeasonNumber: number | null;
  seasons: TeaserSeason[];
}

export function HomeSeasonSection() {
  const reality = useHeroReality();
  const seats = reality.membersTotalNumber;
  const [payload, setPayload] = useState<TeaserPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/season")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: TeaserPayload) => {
        if (!cancelled) setPayload(j);
      })
      .catch(() => {
        /* fail-closed: the teaser simply does not render */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const chapter = seats !== null ? chapterForSeat(seats) : null;
  const seasonNumber = chapter !== null ? CHAPTERS.indexOf(chapter) + 1 : null;
  const endSeat = chapter?.endSeat ?? null;
  const seatsLeft = seats !== null && endSeat !== null ? Math.max(0, endSeat - seats) : null;
  const gaugePct =
    seats !== null && endSeat !== null && endSeat > 0
      ? Math.min(100, Math.max(2, Math.round((seats / endSeat) * 1000) / 10))
      : null;

  const current =
    payload?.state === "LIVE" && payload.currentSeasonNumber !== null
      ? (payload.seasons.find((s) => s.seasonNumber === payload.currentSeasonNumber) ?? null)
      : null;
  const podium = (current?.standings ?? []).filter((r) => r.rank !== null && r.rank <= 3);
  const buildersEarning = current?.playersEarning ?? null;

  return (
    <section className="syn-season-band border-y border-border py-[58px] text-foreground">
      <div className="w-full px-[clamp(24px,5vw,72px)]">
        {/* The two columns: pitch + gauge | the pot frame (mockup 1.4fr/.9fr). */}
        <div className="grid items-stretch gap-[30px] min-[860px]:grid-cols-[1.4fr_0.9fr]">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
              {seasonNumber !== null ? `Live now · Era ${seasonNumber}` : "The season"}
            </div>
            <h2 className="mt-2 font-serif text-[clamp(2.2rem,1.6rem+2.6vw,3.3rem)] leading-[1.08]">
              {seasonNumber !== null && chapter !== null ? (
                <>
                  Season {seasonNumber} · <span className="text-gold">{chapter.name}</span>
                </>
              ) : (
                <>The season</>
              )}
            </h2>
            <p className="mt-2 max-w-[52ch] text-[14.5px] text-muted-foreground">
              {seasonNumber !== null && chapter !== null ? (
                <>
                  Bound to Era {seasonNumber} — it seals, forever, when the era fills. Get in
                  before {chapter.name} seals.
                </>
              ) : (
                <>It seals, forever, when the era fills. No date — the chain decides.</>
              )}
            </p>

            {seats !== null && endSeat !== null && gaugePct !== null && (
              <div className="mb-1.5 mt-[22px]">
                <div className="mb-[9px] flex items-baseline justify-between font-mono text-[12.5px]">
                  <span className="text-muted-foreground">
                    {seats.toLocaleString("en-US")} / {endSeat.toLocaleString("en-US")} seats
                  </span>
                  <span className="text-gold">
                    {seatsLeft?.toLocaleString("en-US")} before {chapter?.name ?? "the era"} seals
                    — forever
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-lg border border-border bg-muted/40">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-gold/70 to-gold"
                    style={{ width: `${gaugePct}%` }}
                    aria-hidden="true"
                  />
                </div>
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
            )}

            <Link href="/join">
              <Button
                variant="outline"
                className="mt-[18px] h-auto rounded-[9px] border-gold/50 bg-transparent px-[26px] py-[14px] text-[16px] font-semibold text-gold hover:bg-gold/[0.08]"
                data-testid="home-season-cta"
              >
                Take your seat{seasonNumber !== null ? ` — enter Season ${seasonNumber}` : ""} →
              </Button>
            </Link>
            <p className="mt-3 font-mono text-[11.5px] text-muted-foreground">
              You earn by what you do, shown on-chain.
            </p>
          </div>

          {/* The pot frame — seasonBounty FUTURE: the badge speaks, no figure. */}
          <aside className="syn-pot-card flex flex-col justify-center rounded-2xl border border-gold/50 px-[26px] py-[30px]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                The season pot
              </span>
              <LifecycleBadge lifecycle="FUTURE" />
            </div>
            <p className="mt-3 text-sm text-foreground">
              <b>By merit, never chance. For what you do, never for what you hold.</b> Put up by
              the company.
            </p>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              The committed figure will stand here — on-chain and verifiable — the day it
              exists. Never a number without its proof.
            </p>
            <div className="mt-4 flex flex-wrap gap-[26px] border-t border-border pt-[14px]">
              {chapter !== null && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
                    Runs until
                  </div>
                  <div className="mt-0.5 font-serif text-base text-gold">{chapter.name} seals</div>
                </div>
              )}
              {seatsLeft !== null && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
                    Seats left
                  </div>
                  <div className="mt-0.5 font-serif text-base">
                    {seatsLeft.toLocaleString("en-US")}
                  </div>
                </div>
              )}
              {buildersEarning !== null && (
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70">
                    Builders earning
                  </div>
                  <div className="mt-0.5 font-serif text-base">{buildersEarning}</div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* The ranking teaser: top-3 podium + the door to the full board. */}
        <div className="mt-9 border-t border-border pt-[22px]">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
              {seasonNumber !== null ? `Season ${seasonNumber} ranking · the leaders` : "The season ranking"}
            </span>
            <Link href="/season">
              <span className="cursor-pointer border-b border-primary/40 font-mono text-[11.5px] text-primary">
                See full ranking →
              </span>
            </Link>
          </div>

          {podium.length === 3 && (
            <div className="relative grid items-end gap-4 pt-[18px] min-[700px]:grid-cols-3">
              <div
                className="syn-podium-glow pointer-events-none absolute -bottom-1 left-[12%] right-[12%] h-[120px]"
                aria-hidden="true"
              />
              {[podium[1], podium[0], podium[2]].map((r) => {
                const first = r.rank === 1;
                return (
                  <div
                    key={r.display}
                    className={`relative rounded-[14px] border bg-card p-4 text-center ${
                      first
                        ? "border-gold/55 pb-5 pt-7 shadow-[0_0_42px_hsl(var(--gold)/0.15)]"
                        : r.rank === 2
                          ? "border-[hsl(var(--silver)/0.35)]"
                          : "border-[hsl(var(--bronze)/0.4)]"
                    }`}
                  >
                    <SeasonMedal rank={r.rank as 1 | 2 | 3} size={first ? "lg" : "md"} />
                    <div className={`font-serif ${first ? "text-[21px]" : "text-lg"}`}>
                      {r.display}
                      {r.seat !== null && r.shortForm && (
                        <span className="mt-0.5 block font-mono text-[10.5px] text-muted-foreground">
                          {r.shortForm}
                        </span>
                      )}
                    </div>
                    <div className="mt-1.5 text-[10.5px] text-muted-foreground">
                      {(Object.keys(AXIS_LABEL) as SeasonAxis[])
                        .filter((a) => (r.axes[a] ?? 0) > 0)
                        .map((a) => AXIS_LABEL[a])
                        .join(" · ")}
                    </div>
                    <div className="mt-2 font-mono text-[13px] text-primary tabular-nums">
                      {r.xp.toLocaleString("en-US")} XP
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="mt-3.5 font-mono text-[11.5px] text-muted-foreground">
            Public, pseudonymous · your rank never drops. Full ranking on its own page.
          </p>
        </div>
      </div>
    </section>
  );
}
