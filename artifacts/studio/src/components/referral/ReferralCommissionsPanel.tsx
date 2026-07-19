// components/referral/ReferralCommissionsPanel.tsx — TAB 3 · Commissions.
//
// The money, by state (paid / escrow — each labelled, the Stripe trust
// discipline), the anatomy of one commission — RECEIPT-BACKED (slice ⑤):
// the member's latest real receipt, the event's own amounts (gross → your
// commission → net → the on-chain 70/20/10 routing), verify-linked; the
// static current-rate example remains the honest fallback while no receipt
// exists — the evolutive chart-as-record slot (CHARTS POLICY: the record,
// never a projection), and the pinned legal boundary line.

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { ladderProgress } from "@/config/connectorLadder";
import { referralProgram } from "@/config/referralProgram";
import { formatRawUnits } from "@/lib/rawUnits";
import {
  usd,
  useOwnIntroductions,
  type StandingReadback,
} from "@/components/referral/referralStanding";
import type { OwnIntroductionRowReadback } from "@/wallet/walletSession";

/** $5.00 seat purchase at `bps` → the commission in dollars, two decimals. */
function commissionOnFiveDollars(bps: number): string {
  return `$${((5 * bps) / 10_000).toFixed(2)}`;
}

/** Exact USD from USDC base units — never floored (the split must SUM on
 * screen exactly as it does on-chain: $3.325 renders, not $3.32), fraction
 * padded to at least cents. */
function usdExact(raw: string): string {
  const s = formatRawUnits(raw, 6);
  const [whole, frac = ""] = s.split(".");
  return `$${whole}.${frac.padEnd(2, "0")}`;
}

/** Basis points → a human percent ("5%", "6.5%"). */
function pct(bps: number): string {
  const p = bps / 100;
  return `${Number.isInteger(p) ? p : p.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}%`;
}

export function ReferralCommissionsPanel({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;
  const rateBps = s ? ladderProgress(s.durableIntroductions).current.bps : 500;
  // One read for the whole tab — the anatomy card and the record card render
  // from the SAME rows (they can never drift apart on the same wallet).
  const intro = useOwnIntroductions();
  const rows = intro?.rows ?? null;
  // STRICTLY the newest receipt (rows arrive newest first) — the card says
  // "your latest receipt", so it renders ONLY when the true latest carries a
  // server-consistent breakdown; otherwise the static example (fail-closed:
  // an older receipt never renders under the "latest" label).
  const latest = rows && rows.length > 0 && rows[0].anatomy !== null ? rows[0] : null;

  return (
    <div>
      {/* The money by state — only when the member's own read answered. */}
      {s ? (
        <Card className="bg-card/40 border-border/50 p-5 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The money — by state
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusPill tone="proof">Paid {usd(s.commissionPaidRaw)}</StatusPill>
            <StatusPill tone="identity">Escrow {usd(s.escrowOwedRaw)}</StatusPill>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Paid = already in your wallet, routed inside each buyer&apos;s own
            transaction. Escrow = owed and held on-chain — released while your
            source is active. Both are your own indexed record, up to block{" "}
            {s.asOfBlock.toLocaleString("en-US")}.
          </p>
        </Card>
      ) : null}

      {latest?.anatomy ? (
        <ReceiptAnatomyCard row={latest} />
      ) : (
        <Card className="bg-card/40 border-border/50 p-5 mb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
            The anatomy of one commission
          </p>
          {/* "commission", plainly — the referrer-surface word (CANON §4).
              "acquisitionCost" is the bytecode/ABI word ONLY, banned from every
              public surface (recorded ruling 2026-07-13, SESSION_STATE + the
              master brief: never "acquisition cost"). */}
          <p className="text-sm text-foreground/90 leading-relaxed">
            A $5.00 seat purchase → {s ? "your" : "a"} {rateBps / 100}%
            commission = <span className="font-medium text-gold">{commissionOnFiveDollars(rateBps)}</span> —
            paid to {s ? "your" : "the introducer's"} wallet inside the
            buyer&apos;s own transaction, in the same block.
          </p>
        </Card>
      )}

      {/* Slice ④ — the dated commission RECORD, live from the per-row model.
          CHARTS POLICY: the record, never a projection — while the history
          is sparse the record renders as dated receipt lines (each tied to
          its on-chain anchor); a chart takes over as the story grows. */}
      <CommissionRecordCard intro={intro} rows={rows} />

      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        {referralProgram.boundaryLine}
      </p>
    </div>
  );
}

// Slice ⑤ — the RECEIPT-BACKED anatomy: the member's latest real commission,
// broken down with the EVENT'S OWN amounts (never recomputed client-side,
// server-cross-checked: commission + net == gross; the 70/20/10 lines sum to
// the net exactly). Exact figures on purpose — the split must add up on
// screen the way it does on-chain. Verify → the transaction itself.
function ReceiptAnatomyCard({ row }: { row: OwnIntroductionRowReadback }) {
  const a = row.anatomy!;
  const lines = [
    { label: "Vault", share: "70%", raw: a.vaultRaw },
    { label: "Liquidity", share: "20%", raw: a.liquidityRaw },
    { label: "Operations", share: "10%", raw: a.operationsRaw },
  ];
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          The anatomy of one commission — your latest receipt
        </p>
        <StatusPill tone="live" size="xs">Live · your own row</StatusPill>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-muted-foreground">The buyer paid</span>
          <span className="font-mono tabular-nums text-foreground">{usdExact(a.grossRaw)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-sm">
          <span className="text-muted-foreground">
            Your commission{" "}
            <span className="text-[11px] text-muted-foreground/70">{pct(a.commissionBps)}</span>
          </span>
          <span className="font-mono tabular-nums font-medium text-gold">
            {usdExact(row.commissionRaw)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-3 text-sm border-t border-border/40 pt-1.5">
          <span className="text-muted-foreground">Sent to the Syndicate</span>
          <span className="font-mono tabular-nums text-foreground">{usdExact(a.netRaw)}</span>
        </div>
        {lines.map((l) => (
          <div key={l.label} className="flex items-baseline justify-between gap-3 text-sm pl-4">
            <span className="text-muted-foreground">
              {l.label}{" "}
              <span className="text-[11px] text-muted-foreground/70">{l.share}</span>
            </span>
            <span className="font-mono tabular-nums text-foreground/80">{usdExact(l.raw)}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mt-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          The event&apos;s own amounts, {row.isoDayUtc} — your commission was
          paid inside the buyer&apos;s transaction, in the same block.
        </p>
        <a
          href={row.explorerUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex font-mono text-xs text-proof/80 hover:text-proof underline underline-offset-2 ml-auto"
        >
          verify ↗
        </a>
      </div>
    </Card>
  );
}

// The dated record — REAL rows only; honest states, never a sample.
function CommissionRecordCard({
  intro,
  rows,
}: {
  intro: ReturnType<typeof useOwnIntroductions>;
  rows: OwnIntroductionRowReadback[] | null;
}) {
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-foreground">Your commissions — the record</span>
        {rows !== null ? (
          <StatusPill tone="live" size="xs">Live · your own row</StatusPill>
        ) : null}
      </div>
      {rows === null ? (
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          title={intro?.failureReason ?? undefined}
        >
          {intro === null
            ? "The record read is resolving — nothing is assumed, nothing is invented."
            : "The record is unavailable right now — nothing is assumed, nothing is invented. Try again in a moment."}
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground leading-relaxed">
          No commissions on your record yet — each one appears here dated,
          with its on-chain proof.
        </p>
      ) : (
        <div className="mt-2">
          <ul className="space-y-1.5">
            {rows.map((r) => (
              <li
                key={r.transaction}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border/40 pt-1.5 first:border-t-0 first:pt-0"
              >
                <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">{r.isoDayUtc}</span>
                {/* Exact, like the anatomy card — the SAME receipt must never
                    show two different dollar figures one card apart. */}
                <span className="font-mono text-sm text-gold">{usdExact(r.commissionRaw)}</span>
                <a
                  href={r.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex font-mono text-xs text-proof/80 hover:text-proof underline underline-offset-2 ml-auto"
                >
                  verify ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            The record, never a projection — each line is its own on-chain
            receipt; a chart takes over as the history grows.
          </p>
        </div>
      )}
    </Card>
  );
}
