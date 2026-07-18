// wallet/CapitalAxisCard.tsx (build-time-gated wallet module)
//
// S7-b — YOUR CAPITAL FOOTPRINT (founder decision 2026-07-16, THE
// OWN-ACCOUNT DISPLAY RULE — GAMIFICATION_LEGAL_DOCTRINE §own-account):
// "The Syndicate recognizes capital without reducing identity to capital."
// The member's OWN account shows his own cumulative footprint, his rung,
// the founder-named ladder and the NEXT rung with honest progress — the
// Sephora/Marriott account pattern, guidance. Legal because of what a rung
// UNLOCKS: recognition only — the shield line renders beside the ladder,
// always. The seat is binary; rungs never descend; the PUBLIC feed still
// never carries the amount. Own-row; every figure fail-closed.
//
// Phase-A step 5 (S7-e): the read is the shared, race-guarded
// useSettledOwnCapitalStanding — the card NEVER vanishes on a read (loading
// keeps the frame; a FAILED read offers Retry; the server's honest "no rung
// yet" is copy of its own, never mislabeled as a read error).

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import {
  usdFromRaw,
  useOwnPurchases,
  useSettledOwnCapitalStanding,
} from "./ownReads";

const SHIELD_LINE =
  "Recognition only — a rung never unlocks a better SYN price or any financial benefit, and it never descends. The seat itself is binary: every seat is the same seat.";

export default function CapitalAxisCard() {
  const { capital, refresh } = useSettledOwnCapitalStanding();
  // D-TRUTH D3: the sum's own addends — every indexed purchase, each with
  // its verify anchor (the "recomputable by anyone" claim gets its record).
  const purchases = useOwnPurchases();

  // No recognized seat → the identity band owns that state; there is no
  // footprint card to draw (this is the ONLY branch that hides the card).
  if (capital.status === "no-seat") return null;

  const standing = capital.status === "ready" ? capital.standing : null;
  const walked =
    standing !== null &&
    standing.rung !== null &&
    standing.cumulativeUsdcRaw !== null;
  const cum = walked ? BigInt(standing!.cumulativeUsdcRaw!) : 0n;
  const next = standing?.nextRung ?? null;
  // Honest progress toward the next rung (own-account guidance): the exact
  // share of the next threshold already covered by the cumulative footprint.
  const progress =
    walked && next !== null
      ? Math.min(1, Number((cum * 1000n) / (BigInt(next.usdc) * 1_000_000n)) / 1000)
      : null;

  return (
    <Card className="bg-card/40 border-gold/25 p-5" data-testid="capital-axis-card">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <h3 className="text-base font-medium text-foreground">Your capital footprint</h3>
        {walked ? (
          <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold">
            {standing!.rung}
          </span>
        ) : null}
      </div>

      {/* The figure region — four honest states; the card never vanishes. */}
      {capital.status === "loading" ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="capital-loading"
        >
          Reading your footprint…
        </p>
      ) : capital.status === "failed" ? (
        <div data-testid="capital-read-failed">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your footprint could not be read right now — nothing is assumed,
            nothing is invented.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={refresh}
            data-testid="button-capital-retry"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
            Retry read
          </Button>
        </div>
      ) : walked ? (
        <>
          <p
            className="font-mono text-2xl text-foreground"
            data-testid="capital-cumulative"
          >
            {usdFromRaw(standing!.cumulativeUsdcRaw!)}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            Your cumulative footprint — the sum of your own on-chain purchases,
            public and recomputable by anyone.
          </p>
          {next !== null ? (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-foreground/90">{standing!.rung}</span>
                <span className="text-muted-foreground" data-testid="capital-next-rung">
                  Next: {next.title} at ${next.usdc.toLocaleString("en-US")}
                </span>
              </div>
              {progress !== null ? (
                <div
                  className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden"
                  role="progressbar"
                  aria-label="Your footprint toward the next rung"
                  aria-valuemin={0}
                  aria-valuemax={1}
                  aria-valuenow={progress}
                >
                  <div
                    className="h-full rounded-full bg-gold/70"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Monolith — the summit of the capital axis.
            </p>
          )}
        </>
      ) : (
        // ready + honest gap: the server answered, no rung is derivable yet —
        // an honest state of its OWN, never the "couldn't be read" of a failure.
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          data-testid="capital-no-rung"
        >
          No footprint on the ladder yet — your own on-chain purchases place you
          on a rung as soon as the record shows one; nothing is assumed.
        </p>
      )}

      {/* D-TRUTH D3: the record behind the sum — every own purchase with its
          verify anchor (same progressive-disclosure pattern as the ladder). */}
      <details className="mt-3 group" data-testid="own-purchase-record">
        <summary className="cursor-pointer text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
          Your purchase record — every entry verifiable
        </summary>
        {purchases?.rows && purchases.rows.length > 0 ? (
          <ul className="mt-2 grid gap-0.5">
            {purchases.rows.map((r) => (
              <li
                key={r.transaction}
                className="flex items-baseline justify-between gap-3 rounded px-2 py-1 text-sm text-muted-foreground"
              >
                <span className="font-mono">{r.isoDayUtc}</span>
                <span className="font-mono text-foreground/90">
                  {usdFromRaw(r.amountRaw)}
                </span>
                <a
                  href={r.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold/90 hover:text-gold underline underline-offset-2"
                >
                  verify ↗
                </a>
              </li>
            ))}
          </ul>
        ) : (
          // Human-First (S7-e law): the honest human sentence; the server's
          // exact reason stays available to verifiers via the tooltip.
          <p
            className="mt-2 text-sm text-muted-foreground leading-relaxed"
            title={purchases?.failureReason ?? undefined}
          >
            {purchases?.rows
              ? "No purchase rows in the indexed record for this wallet."
              : "The record couldn't be read just now — nothing is assumed, nothing is invented. Try again in a moment."}
          </p>
        )}
      </details>

      {/* Progressive disclosure: the full founder-named ladder — only when the
          server's standing (which carries the ladder) has been served. */}
      {standing !== null ? (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground">
            The capital axis — all 12 rungs
          </summary>
          <ul className="mt-2 grid gap-0.5">
            {standing.ladder.map((r) => (
              <li
                key={r.title}
                className={`flex items-baseline justify-between gap-3 rounded px-2 py-1 text-sm ${
                  r.title === standing.rung
                    ? "bg-gold/10 text-foreground border border-gold/25"
                    : "text-muted-foreground"
                }`}
              >
                <span>{r.title}</span>
                <span className="font-mono">${r.usdc.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
        {SHIELD_LINE}
      </p>
    </Card>
  );
}
