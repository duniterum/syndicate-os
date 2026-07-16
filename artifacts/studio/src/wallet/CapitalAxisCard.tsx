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

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  fetchCapitalStanding,
  type CapitalStanding,
} from "@/lib/capitalStanding";
import { fetchMemberStanding } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";
import { usdFromRaw, useOwnPurchases } from "./ownReads";

const SHIELD_LINE =
  "Recognition only — a rung never unlocks a better SYN price or any financial benefit, and it never descends. The seat itself is binary: every seat is the same seat.";

export default function CapitalAxisCard() {
  const [seat, setSeat] = useState<string | null>(null);
  const [standing, setStanding] = useState<CapitalStanding | null>(null);
  // D-TRUTH D3: the sum's own addends — every indexed purchase, each with
  // its verify anchor (the "recomputable by anyone" claim gets its record).
  const purchases = useOwnPurchases();

  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchMemberStanding().then((r) => {
        if (!active) return;
        const own =
          r?.state === "S4" && r.recognized === true ? r.memberNumber : null;
        setSeat(own);
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);

  useEffect(() => {
    let active = true;
    setStanding(null);
    if (seat === null) return;
    void fetchCapitalStanding(seat).then((s) => {
      if (active) setStanding(s);
    });
    return () => {
      active = false;
    };
  }, [seat]);

  // No recognized seat (or read failed) → nothing to say; the band owns the
  // no-seat state.
  if (seat === null || standing === null) return null;

  const walked = standing.rung !== null && standing.cumulativeUsdcRaw !== null;
  const cum = walked ? BigInt(standing.cumulativeUsdcRaw!) : 0n;
  const next = standing.nextRung;
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
            {standing.rung}
          </span>
        ) : null}
      </div>

      {walked ? (
        <>
          <p
            className="font-mono text-2xl text-foreground"
            data-testid="capital-cumulative"
          >
            {usdFromRaw(standing.cumulativeUsdcRaw!)}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
            Your cumulative footprint — the sum of your own on-chain purchases,
            public and recomputable by anyone.
          </p>
          {next !== null ? (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-foreground/90">{standing.rung}</span>
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
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your footprint couldn&apos;t be read just now — nothing is assumed,
          nothing is invented. It returns as soon as the record answers; the
          full ladder lives below.
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

      {/* Progressive disclosure: the full founder-named ladder. */}
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

      <p className="mt-3 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
        {SHIELD_LINE}
      </p>
    </Card>
  );
}
