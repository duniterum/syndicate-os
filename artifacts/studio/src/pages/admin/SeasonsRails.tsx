// pages/admin/SeasonsRails.tsx — the admin Seasons section: TWO RAILS, never
// conflated (the two-layer law). S2-final, founder GO-and-GO-LIVE 2026-07-24;
// the approved admin-2rails mockup (§0.14-E corrected), truth-amended.
// ---------------------------------------------------------------------------
// RAIL 1 — RECOGNITION (autonomous): pure OBSERVATION of the engine that runs
// itself (§0.15 zero-click + SETTLED_RULES §8-④: NO validation queue exists
// on any XP path — this rail has no buttons, and that is the design). It
// reads ONLY existing public routes — /api/season (the SAME authority the
// public board serves), /api/backbone/status (the engine heartbeat), the
// hero seat spine — zero operator endpoints.
// RAIL 2 — THE SEASON POT (USDC, founder-gated): the §0.17 frame — two
// buckets, delta-window rounds, the zero-click pipeline, the S3 activation
// list. ONE FUTURE badge (seasonBounty); NO dollar figure, NO input, NO
// disabled fake control — the funding panel arrives WITH the contract at S3.
// Truth amendments over the mockup (recorded in the slice report): only the
// FED XP sources render in the table (quiz/weekly/feedback classes arrive
// WITH their feeders); every figure is live or absent — the mockup's $300/
// $500 ledger was S3-state illustration.

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MembersProvenance } from "@/components/living/MembersProvenance";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { chapterForSeat } from "@/lib/chapters";
import { eraForSeatCount } from "@/config/eraCanon";

interface BoardRow {
  display: string;
  rank: number | null;
  xp: number;
}

interface SeasonPayload {
  module: "season";
  state: "LIVE" | "DARK";
  currentSeasonNumber: number | null;
  seasons: {
    seasonNumber: number;
    state: "LIVE" | "SEALED";
    playersEarning: number;
    standings: BoardRow[];
  }[];
  notes?: string[];
}

interface EngineStatus {
  enabled?: boolean;
  state?: string;
  cycles?: { ok?: number; partial?: number; failed?: number };
}

const kvLabel =
  "font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70";
const chip =
  "rounded border px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.06em]";

/** The FED XP sources — exactly what the engine credits today, nothing more. */
const FED_SOURCES: readonly {
  source: string;
  proof: string;
  credit: string;
  antiSpam: string;
}[] = [
  { source: "Purchase receipt", proof: "Sale V3 event · on-chain", credit: "auto (indexer)", antiSpam: "unforgeable" },
  { source: "Converted introduction", proof: "SourceRegistry · on-chain", credit: "auto at the receipt", antiSpam: "self-referral credits nothing" },
  { source: "Burn (Proof of Fire)", proof: "on-chain", credit: "auto", antiSpam: "unforgeable" },
  { source: "Archive mint", proof: "on-chain", credit: "auto", antiSpam: "unforgeable" },
  { source: "Quest bonuses (ladder + firsts)", proof: "derived metric", credit: "auto at the threshold", antiSpam: "canon thresholds" },
];

export function SeasonsRailsPanel() {
  const reality = useHeroReality();
  const seats = reality.membersTotalNumber;
  const [season, setSeason] = useState<SeasonPayload | null>(null);
  const [engine, setEngine] = useState<EngineStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/season")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: SeasonPayload | null) => {
        if (!cancelled && j !== null) setSeason(j);
      })
      .catch(() => {});
    void fetch("/api/backbone/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((j: EngineStatus | null) => {
        if (!cancelled && j !== null) setEngine(j);
      })
      .catch(() => {});
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
  const current =
    season?.state === "LIVE" && season.currentSeasonNumber !== null
      ? (season.seasons.find((s) => s.seasonNumber === season.currentSeasonNumber) ?? null)
      : null;
  const top3 = (current?.standings ?? []).filter((r) => r.rank !== null && r.rank <= 3);

  return (
    <div className="space-y-6">
      {/* ── RAIL 1 · RECOGNITION — the engine that runs itself ─────────── */}
      <Card className="p-6 border-l-2 border-l-primary/60">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            Rail 01
          </span>
          <h2 className="font-serif text-xl text-foreground">Recognition</h2>
          <span className={`${chip} border-success/40 text-success`}>autonomous</span>
          {season !== null && (
            <span className={`${chip} border-primary/40 text-primary`}>{season.state}</span>
          )}
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          The engine runs itself — that is the default, not a feature. No validation queue
          exists on any XP path; the only click on this rail is an editorial right, never a
          duty.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* The state card. */}
          <div className="rounded-lg border border-border/60 bg-card/40 p-4">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                {seasonNumber !== null && chapter !== null ? (
                  <>
                    Season {seasonNumber} — Era {seasonNumber} ·{" "}
                    <span className="text-gold">{chapter.name}</span>
                  </>
                ) : (
                  <>The season</>
                )}
              </h3>
              <span className="font-mono text-[11px] text-muted-foreground">
                bounded by the chain — seals when the era fills
              </span>
            </div>
            {seats !== null && endSeat !== null && (
              <>
                <div className="h-2.5 overflow-hidden rounded-md border border-border bg-muted/40">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-gold/70 to-gold"
                    style={{ width: `${fillPct}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-1.5 font-mono text-[11.5px] text-muted-foreground">
                  {seats.toLocaleString("en-US")} / {endSeat.toLocaleString("en-US")} seats
                </div>
                <MembersProvenance
                  variant="compact"
                  className="mt-1"
                  historicalFreeze={reality.historicalFreeze}
                  v3Emitted={reality.v3Emitted}
                  snapshotMemberTotal={reality.snapshotMemberTotal}
                  snapshotAsOf={reality.snapshotAsOf}
                  membersDiverged={reality.membersDiverged}
                  distinctWallets={reality.distinctWallets}
                  seatOverlap={reality.seatOverlap}
                />
              </>
            )}
            <dl className="mt-3 space-y-2 border-t border-border/40 pt-3">
              <div className="flex items-baseline justify-between gap-3">
                <dt className={kvLabel}>End trigger</dt>
                <dd className="font-mono text-xs text-primary">
                  memberCount ≥ endSeat (on-chain)
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className={kvLabel}>Pot / USDC on this rail</dt>
                <dd className="font-mono text-xs text-success">none — recognition only</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className={kvLabel}>Next step (engine)</dt>
                <dd className="text-right font-mono text-xs text-foreground">
                  the era fills → auto-seal → seal round
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className={kvLabel}>Builders earning</dt>
                <dd className="font-mono text-xs text-foreground tabular-nums">
                  {current?.playersEarning ?? "—"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className={kvLabel}>Engine heartbeat</dt>
                <dd className="font-mono text-xs text-foreground">
                  {engine?.cycles
                    ? `ok ${engine.cycles.ok ?? 0} · partial ${engine.cycles.partial ?? 0} · failed ${engine.cycles.failed ?? 0}`
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>

          {/* The lifecycle machine. */}
          <div className="rounded-lg border border-border/60 bg-card/40 p-4">
            <h3 className="mb-1 text-sm font-semibold text-foreground">Season lifecycle</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Everything transits automatically. The only click is an editorial right, never
              a duty.
            </p>
            <ol className="space-y-2">
              {[
                { step: "Planned", note: "pre-opened", auto: true },
                { step: "Live", note: "bound to the era", auto: true },
                { step: "Sealed", note: "the era advanced", auto: true },
                { step: "Root committed", note: "XP fingerprint · the narrow SEALER role", auto: true },
                { step: "Published", note: "Chronicle — ONE optional click", auto: false },
              ].map((n) => (
                <li key={n.step} className="flex items-baseline gap-2">
                  <span
                    className={`${chip} ${n.auto ? "border-success/40 text-success" : "border-gold/40 text-gold"}`}
                  >
                    {n.auto ? "auto" : "optional"}
                  </span>
                  <span className="text-sm font-medium text-foreground">{n.step}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{n.note}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 border-t border-border/40 pt-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
              Snapshot, seal, on-chain fingerprint and the seal round: automatic. The
              operator only promotes the Chronicle entry.
            </p>
          </div>
        </div>

        {/* The FED XP sources — credit without manual validation. */}
        <div className="mt-4 rounded-lg border border-border/60 bg-card/40 p-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              XP sources — credited without manual validation
            </h3>
            <span className={`${chip} border-success/40 text-success`}>
              0 operator interventions
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-xs">
              <thead>
                <tr className="text-left font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2 pr-3">Proof</th>
                  <th className="py-2 pr-3">Credit</th>
                  <th className="py-2 pr-3">Anti-spam moat</th>
                  <th className="py-2">Operator</th>
                </tr>
              </thead>
              <tbody>
                {FED_SOURCES.map((s) => (
                  <tr key={s.source} className="border-t border-border/40">
                    <td className="py-2 pr-3 font-medium text-foreground">{s.source}</td>
                    <td className="py-2 pr-3 font-mono text-muted-foreground">{s.proof}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{s.credit}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{s.antiSpam}</td>
                    <td className="py-2 font-mono text-success">none</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 font-mono text-[11px] text-muted-foreground">
            Verify, not trust — on-chain XP links to its proof; further quest classes join
            WITH their feeders, never before. One identity (seat · SIWE); XP is
            non-transferable and carries no cash value.
          </p>
        </div>

        {/* Standings glance + the door to the board. */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
          {top3.map((r) => (
            <span key={r.display} className="font-mono text-xs text-muted-foreground">
              <span className="font-serif text-sm text-gold">{r.rank}</span>{" "}
              <span className="text-foreground">{r.display}</span>{" "}
              <span className="text-primary tabular-nums">
                {r.xp.toLocaleString("en-US")} XP
              </span>
            </span>
          ))}
          <a
            href="/season"
            className="border-b border-primary/40 font-mono text-[11.5px] text-primary"
          >
            Open the public board →
          </a>
        </div>

        {/* Reference layer — collapsed, bottom (WORK-FIRST). */}
        {season?.notes && season.notes.length > 0 && (
          <Collapsible className="mt-4">
            <Card className="p-0">
              <CollapsibleTrigger className="group flex w-full items-center gap-2 p-4 text-left">
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                <span className="text-sm font-medium text-foreground">
                  Model notes — the projection speaking for itself
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="space-y-1.5 px-4 pb-4">
                  {season.notes.map((n) => (
                    <li key={n} className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                      {n}
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}
      </Card>

      {/* ── RAIL 2 · THE SEASON POT — the money rail (frame until S3) ───── */}
      <Card className="p-6 border-l-2 border-l-success/60">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-success">
            Rail 02
          </span>
          <h2 className="font-serif text-xl text-foreground">The season pot</h2>
          <span className={`${chip} border-gold/40 text-gold`}>founder-gated</span>
          <LifecycleBadge lifecycle="FUTURE" />
        </div>
        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className={`${chip} border-border text-muted-foreground`}>
            merit · never chance
          </span>
          <span className={`${chip} border-border text-muted-foreground`}>
            USDC · never SYN
          </span>
          <span className={`${chip} border-border text-muted-foreground`}>
            company money · never the 70/20/10
          </span>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          Commit money to the pot whenever you want — all at once or bit by bit. The seal
          pays; if the era takes its time, interim rounds accelerate. The funding panel
          arrives WITH the contract at S3 — no figure, no control before the escrow exists.
        </p>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* The two buckets (§0.17-①). */}
          <div className="rounded-lg border border-warning/40 bg-card/40 p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              The ONLY recurring human act: putting money in
            </h3>
            <dl className="space-y-2.5">
              <div>
                <dt className="text-[13px] font-semibold text-gold">« Engager au pot »</dt>
                <dd className="text-xs leading-snug text-muted-foreground">
                  irrevocable for the season, ratchet-only — THE public figure members see
                  and work toward. Every gesture is one audited USDC transfer.
                </dd>
              </div>
              <div>
                <dt className="text-[13px] font-semibold text-warning">« Réserve »</dt>
                <dd className="text-xs leading-snug text-muted-foreground">
                  the company staging pocket — withdrawable after a 72-hour announced public
                  timelock. Flexibility without ever touching the committed figure.
                </dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-border/40 pt-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
              Rules are anchored at season open (rulesHash on-chain): curve, weights, caps,
              floors, interim policy. Giving more or earlier is always allowed — taking or
              delaying, never.
            </p>
          </div>

          {/* The rounds (§0.17-④/⑧/⑨). */}
          <div className="rounded-lg border border-border/60 bg-card/40 p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              Distribution rounds — one pot, several payments
            </h3>
            <ol className="space-y-2.5">
              <li>
                <span className="text-[13px] font-semibold text-foreground">Seal round</span>{" "}
                <span className={`${chip} border-success/40 text-success`}>auto at the seal</span>
                <p className="text-xs leading-snug text-muted-foreground">
                  automatic when the era seals — pays the season&apos;s remaining committed pot.
                </p>
              </li>
              <li>
                <span className="text-[13px] font-semibold text-foreground">
                  Interim rounds
                </span>{" "}
                <span className={`${chip} border-gold/40 text-gold`}>pre-announced 48h</span>
                <p className="text-xs leading-snug text-muted-foreground">
                  a founder right — announced 48 hours ahead with the amount; each pays the
                  delta window since the previous round.
                </p>
              </li>
              <li>
                <span className="text-[13px] font-semibold text-foreground">Final round</span>{" "}
                <span className={`${chip} border-gold/40 text-gold`}>founder right</span>
                <p className="text-xs leading-snug text-muted-foreground">
                  early closure — pays 100% of the remaining pot plus carryover; recognition
                  still waits for the real seal.
                </p>
              </li>
            </ol>
            <p className="mt-3 border-t border-border/40 pt-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
              Published for verification, then paid — never a bare “automatic”. Every round
              publishes its standings + root during the pending window (you may revoke it —
              a right, never a duty; a pause-only guardian covers founder-offline); after
              the delay anyone can activate; unclaimed shares stay pull-claimable one year,
              then join the carryover.
            </p>
          </div>
        </div>

        {/* The S3 activation list — what turns this rail on. */}
        <div className="mt-4 rounded-lg border border-border/60 bg-card/40 p-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">
            What activates this rail (S3)
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
            <li>
              The SeasonBountyPool contract deploys under the care protocol — full Foundry
              suite, Fuji rehearsal, your signed mainnet deploy (SETTLED_RULES §8-①).
            </li>
            <li>One-time: accept ownership from this console.</li>
            <li>
              Then your ONLY recurring act: fund — « Engager au pot » or « Réserve ». Seal
              and rounds transit automatically (§0.15).
            </li>
            <li>
              Optional rights, never duties: revoke a pending round in its public window ·
              pause · promote the sealed season to the Chronicle.
            </li>
          </ol>
          <p className="mt-3 border-t border-border/40 pt-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
            The executor is a narrow hot key — seal fingerprints, rounds, claims; it can
            never exceed the escrowed pot, never rotate an active root, never withdraw. The
            console will show its gas balance; the bell alerts when low.
          </p>
        </div>
      </Card>
    </div>
  );
}
