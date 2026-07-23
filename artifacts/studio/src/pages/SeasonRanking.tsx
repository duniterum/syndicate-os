// SeasonRanking — the public /season page (S2b of the seasons arc, founder
// GO 2026-07-23; the law: the harvest dossier §0 as amended + §0.18).
// ---------------------------------------------------------------------------
// WHAT THIS PAGE IS: the season's live recognition board, served by the
// backbone's season projection (GET /api/season — address-safe rows only:
// the chain-emitted short form on every row, plus the seat ordinal for the
// seated — S2c: both render together, per the approved ranking mockup).
// THE VISUAL-FIRST CATCH LAW (§0.5): the board reads at a glance — trophy
// podium, proportional XP bars, big display figures — before any sentence.
// HONESTY POSTURE:
//   · seasonRanking is LIVE (this page); seasonBounty stays FUTURE — the pot
//     card renders its frame with a LifecycleBadge and NO figure (no committed
//     escrow exists yet; a naked number would be a chain-refutable claim).
//   · §0.18: NUMBERED ranks = pot-eligible builders only; a no-seat builder
//     sorts in place, unnumbered, with the AWAITING SEAT chip — nothing is
//     reserved for them; the seal is the deadline (the caption says so).
//     THE WORD IS "BUILDERS" (founder ruling 2026-07-23, world-benchmarked:
//     identity-in-the-institution nouns, never the game register).
//   · DARK state: the projection not yet published = an honest warming-up
//     card — never invented rows.
//   · The seats gauge is deliberately absent in v1: the live seat count has
//     ONE authority (the hero's served spine) and this page will read that
//     same source when wired — never a second figure (the 12-vs-14 lesson).
// RECORDED DEFERRALS (final audit 2026-07-23 — each has its owning slice):
//   · YOU own-row highlight → S2c/auth-zone wiring (§0.14-D; the exception
//     entry lives in CANON_ACCESS_MODEL).
//   · All-time tab reads the current-season board — TRUE today (season 1 IS
//     all-time, the caption says so); the served LIFETIME board must land
//     BEFORE season 2 exists (the tab is honest until a second season).
//   · Podium metal medallions + crown SVG (the approved mockup's treatment)
//     → S2c polish WITH the silver/bronze token additions (no raw colors).
//   · Disconnected-visitor join CTA + register cards → S2c home section.

import { useEffect, useState } from "react";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { CHAPTERS } from "@/lib/chapters";
import { ERA_CANON } from "@/config/eraCanon";

type SeasonAxis = "connector" | "capital" | "steward" | "historian";

interface StandingRow {
  display: string;
  /** Chain-emitted short form, every row (S2c). Optional: a last-good model
   *  built before the field existed renders exactly as before — fail-closed. */
  shortForm?: string;
  seat: number | null;
  potEligible: boolean;
  rank: number | null;
  xp: number;
  axes: Record<SeasonAxis, number>;
  horsConcours: boolean;
  lastActBlock: number;
}

interface SeasonPayloadSeason {
  seasonNumber: number;
  era: number;
  state: "LIVE" | "SEALED";
  sealBlockNumber: number | null;
  playersEarning: number;
  standings: StandingRow[];
}

interface SeasonPayload {
  module: "season";
  state: "LIVE" | "DARK";
  currentSeasonNumber: number | null;
  seasons: SeasonPayloadSeason[];
  notes?: string[];
}

const AXIS_LABEL: Record<SeasonAxis, string> = {
  connector: "Connector",
  capital: "Capital",
  steward: "Steward",
  historian: "Historian",
};

function axisChips(axes: Record<SeasonAxis, number>): SeasonAxis[] {
  return (Object.keys(AXIS_LABEL) as SeasonAxis[]).filter((a) => (axes[a] ?? 0) > 0);
}

/** Narrative name for a founding season (Season N = Era N; chapter canon). */
function seasonName(seasonNumber: number): string | null {
  const era = ERA_CANON.find((e) => e.era === seasonNumber) ?? null;
  if (era === null) return null;
  const chapter = CHAPTERS.find((c) => c.endSeat !== null && c.endSeat >= era.endSeat) ?? null;
  return chapter?.name ?? null;
}

export default function SeasonRanking() {
  const [payload, setPayload] = useState<SeasonPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [scope, setScope] = useState<"season" | "alltime">("season");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/season")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((j: SeasonPayload) => {
        if (!cancelled) setPayload(j);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current =
    payload?.state === "LIVE" && payload.currentSeasonNumber !== null
      ? (payload.seasons.find((s) => s.seasonNumber === payload.currentSeasonNumber) ?? null)
      : null;
  const name = current ? seasonName(current.seasonNumber) : null;
  const endSeat = current
    ? (ERA_CANON.find((e) => e.era === current.era)?.endSeat ?? null)
    : null;
  const standings = current?.standings ?? [];
  const podium = standings.filter((r) => r.rank !== null && r.rank <= 3);
  const maxXp = standings.reduce((m, r) => Math.max(m, r.xp), 0);

  return (
    <div className="mx-auto w-full px-5 sm:px-8 xl:px-16 py-10">
      {/* Head */}
      <div className="mb-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
          {current ? `Live now · Era ${current.era}` : "The season board"}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl mt-1">
          {current ? (
            <>
              Season {current.seasonNumber}
              {name ? (
                <>
                  {" · "}
                  <span className="text-gold">{name}</span>
                </>
              ) : null}{" "}
              — Ranking
            </>
          ) : (
            "Season — Ranking"
          )}
        </h1>
        <p className="font-mono text-[11.5px] text-muted-foreground mt-2 max-w-4xl">
          Public, pseudonymous · your rank never drops. Chain-proven acts carry their
          transaction · the sealed season state anchors on-chain.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] items-start">
        {/* The board */}
        <div className="min-w-0">
          {/* Scope tabs */}
          <div className="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Board scope">
            <button
              role="tab"
              aria-selected={scope === "season"}
              onClick={() => setScope("season")}
              className={`font-mono text-xs rounded-lg border px-4 py-2 ${
                scope === "season"
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-border text-muted-foreground"
              }`}
            >
              This season
            </button>
            <button
              role="tab"
              aria-selected={scope === "alltime"}
              onClick={() => setScope("alltime")}
              className={`font-mono text-xs rounded-lg border px-4 py-2 ${
                scope === "alltime"
                  ? "border-gold/50 bg-gold/10 text-gold"
                  : "border-border text-muted-foreground"
              }`}
            >
              All-time · recognition
            </button>
          </div>

          {/* DARK / failed / live */}
          {failed || payload?.state === "DARK" ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="font-serif text-xl mb-1">The board is warming up</div>
              <p className="text-sm text-muted-foreground">
                The season projection publishes with the protocol&apos;s next heartbeat
                cycle. Nothing is invented in the meantime — what appears here will be
                the indexed record, replayed from the first block.
              </p>
            </div>
          ) : payload === null ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="font-mono text-xs text-muted-foreground">Reading the board…</div>
            </div>
          ) : standings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-6">
              <div className="font-serif text-xl mb-1">Be the first</div>
              <p className="text-sm text-muted-foreground">
                Every act counts from its first block — the first introduction, burn, or
                mint opens this board.
              </p>
            </div>
          ) : (
            <>
              {/* Trophy podium (§9 craft: medals + one crown; soft glow ceiling) */}
              {podium.length === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-5">
                  {[podium[1], podium[0], podium[2]].map((r) => {
                    const first = r.rank === 1;
                    return (
                      <div
                        key={r.display}
                        className={`relative rounded-xl border bg-card p-4 text-center ${
                          first
                            ? "border-gold/50 shadow-[0_0_42px_-8px] shadow-gold/20 sm:pb-6 sm:pt-7"
                            : "border-border"
                        }`}
                      >
                        <div
                          className={`mx-auto mb-2 grid place-items-center rounded-full font-serif ${
                            first
                              ? "h-14 w-14 bg-gold text-background text-2xl shadow-[0_0_26px_-4px] shadow-gold/50"
                              : "h-11 w-11 border border-border bg-muted text-foreground text-lg"
                          }`}
                          aria-label={`Rank ${r.rank}`}
                        >
                          {r.rank}
                        </div>
                        <div className={`font-serif ${first ? "text-xl" : "text-lg"}`}>
                          {r.display}
                          {r.seat !== null && r.shortForm && (
                            <span className="block font-mono text-[10.5px] text-muted-foreground mt-0.5">
                              {r.shortForm}
                            </span>
                          )}
                        </div>
                        <div className="text-[10.5px] text-muted-foreground mt-1">
                          {axisChips(r.axes).map((a) => AXIS_LABEL[a]).join(" · ")}
                        </div>
                        <div className="font-mono text-[13px] text-primary mt-2 tabular-nums">
                          {r.xp.toLocaleString("en-US")} XP
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* The table */}
              <div className="rounded-xl border border-border overflow-x-auto">
                <table className="w-full text-sm min-w-[560px]">
                  <caption className="sr-only">
                    Season standings — numbered ranks are seated members; unnumbered rows
                    are builders without a seat.
                  </caption>
                  <thead>
                    <tr className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground text-left">
                      <th scope="col" className="px-4 py-3 w-14">#</th>
                      <th scope="col" className="px-2 py-3 w-44">Member</th>
                      <th scope="col" className="px-2 py-3 w-44">Axes</th>
                      <th scope="col" className="px-2 py-3">Progress</th>
                      <th scope="col" className="px-4 py-3 text-right w-28">
                        {scope === "season" ? "XP" : "Lifetime XP"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((r) => (
                      <tr
                        key={r.display}
                        className="border-t border-border"
                      >
                        <td className="px-4 py-3 font-serif text-lg text-muted-foreground">
                          {r.rank ?? "—"}
                        </td>
                        <td className="px-2 py-3">
                          <span className={r.seat !== null ? "font-medium" : "font-mono text-muted-foreground"}>
                            {r.display}
                          </span>
                          {r.seat !== null && r.shortForm && (
                            <span className="ml-1.5 font-mono text-muted-foreground align-middle">
                              {r.shortForm}
                            </span>
                          )}
                          {r.horsConcours && (
                            <span className="ml-2 rounded border border-gold/40 px-1.5 py-0.5 font-mono text-[9.5px] text-gold align-middle">
                              Founder
                            </span>
                          )}
                          {/* Founder polish 2026-07-23: a hors-concours row never
                              competes for the pot, so AWAITING SEAT is noise there —
                              the gold Founder chip alone tells the truth. */}
                          {r.seat === null && !r.horsConcours && (
                            <span className="ml-2 rounded border border-warning/40 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.04em] text-warning align-middle">
                              AWAITING SEAT
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {axisChips(r.axes).map((a) => (
                              <span
                                key={a}
                                className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
                              >
                                {AXIS_LABEL[a]}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <div className="h-2 min-w-24 rounded-full border border-border bg-muted/40 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${maxXp > 0 ? Math.max(2, Math.round((r.xp / maxXp) * 100)) : 0}%` }}
                              aria-hidden="true"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-primary tabular-nums">
                          {r.xp.toLocaleString("en-US")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground mt-3 max-w-4xl">
                {scope === "season" ? (
                  <>
                    Numbered ranks are seated members — an AWAITING SEAT row holds no
                    paid rank and nothing is reserved for it; taking a seat activates
                    its standing. The seal is the deadline
                    {endSeat !== null ? ` — the era fills at seat ${endSeat.toLocaleString("en-US")}` : ""}
                    . No date; the chain decides.
                  </>
                ) : (
                  <>
                    All-time recognition — cumulative across every season ·{" "}
                    <b className="text-foreground">rank never drops</b>. Season 1 is the
                    first season, so today all-time matches the season board.
                  </>
                )}
              </p>

              {/* Past seasons — inline archive v1 (§0.14-E; a param route joins when built). */}
              <div className="mt-6">
                <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground mb-2">
                  Past seasons
                </div>
                <div className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                  Season 1 will be the first sealed season. A sealed season becomes a
                  Chronicle entry and a permanent mark on each builder&apos;s record —
                  nothing is erased.
                </div>
              </div>
            </>
          )}
        </div>

        {/* The money rail — FUTURE until the effort rail (seasonBounty) ships. */}
        <aside className="grid gap-4">
          <div className="rounded-xl border border-gold/40 bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                The season pot
              </span>
              <LifecycleBadge lifecycle="FUTURE" />
            </div>
            <p className="text-sm text-foreground">
              <b>By merit, never chance. For what you do, never for what you hold.</b>{" "}
              Put up by the company.
            </p>
            <p className="font-mono text-[11px] text-muted-foreground mt-2">
              The effort rail arrives with its own slice — the committed figure will
              stand here, on-chain and verifiable, the day it exists. Never a number
              without its proof.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-2">
              The season · bound to Era {current?.era ?? "I"}
            </div>
            <p className="text-sm text-muted-foreground">
              It seals when the era fills
              {endSeat !== null ? ` — at seat ${endSeat.toLocaleString("en-US")}` : ""}. No
              date; the chain decides. Recognition is permanent — your rank never drops,
              even after the season ends.
            </p>
            {current && (
              <p className="font-mono text-[11px] text-muted-foreground mt-3">
                Builders earning: <span className="text-foreground">{current.playersEarning}</span>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
