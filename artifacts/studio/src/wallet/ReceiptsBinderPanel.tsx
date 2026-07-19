// wallet/ReceiptsBinderPanel.tsx (build-time-gated wallet module)
//
// R-BIND — THE RECEIPTS BINDER (founder order 2026-07-19; the engraved A1
// placements ②③ moment). The locked "Receipts" door opens: EVERY confirmed
// purchase of the signed wallet, each row reopenable IN PLACE as the FULL
// protocol ticket — the same paper the checkout prints (one spine, one
// rendering path; the binder mounts the ticket, it never re-implements it).
//
// The register grammar (the founder-approved receipts composition, mockup
// 2026-07-19): a record header · month-grouped rows (newest first, exact
// figures) · each row expands to its ticket · honest empty/loading/failed
// states. Multiple rows may be open at once; the URL never changes (the
// public per-transaction page is its own engraved future slice).
//
// Truth laws: every figure is the served row's own fact (exact re-base,
// never floored, never recomputed); a row whose record cannot express a
// full ticket (an engine that never carried the facts) says so honestly and
// keeps its proof link — absence renders as absence, never a guess.

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import ReceiptTicket from "./ReceiptTicket";
import {
  buildMembershipReceipt,
  formatAmountExact,
  type MembershipReceiptModel,
} from "@/lib/protocolCommerceReceipt";
import {
  fetchOwnPurchases,
  type OwnPurchaseRowReadback,
  type OwnPurchasesReadback,
} from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";
import { SignInWall } from "./SignInWall";

/** The signed wallet's own purchase rows — re-read on session changes. */
function useOwnPurchaseRows(): OwnPurchasesReadback | null {
  const [readback, setReadback] = useState<OwnPurchasesReadback | null>(null);
  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchOwnPurchases().then((r) => {
        if (active) setReadback(r);
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);
  return readback;
}

const MONTHS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
] as const;
/** Title-case full month ("JULY" → "July") — full words on a receipt
 *  register (and the short financial-acronym lookalikes never exist). */
function titleMonth(idx: number): string {
  const m = MONTHS[idx] ?? "";
  return m.charAt(0) + m.slice(1).toLowerCase();
}

/** "2026-07-12" → "JULY 2026" (pure string math on the served ISO day). */
function monthLabel(isoDayUtc: string): string {
  const m = isoDayUtc.match(/^(\d{4})-(\d{2})-\d{2}$/);
  if (!m) return isoDayUtc;
  const idx = Number(m[2]) - 1;
  return idx >= 0 && idx < 12 ? `${MONTHS[idx]} ${m[1]}` : isoDayUtc;
}

/** "2026-07-12" → "July 12, 2026" (the register's one date format). */
function dateLabel(isoDayUtc: string): string {
  const m = isoDayUtc.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return isoDayUtc;
  const idx = Number(m[2]) - 1;
  if (idx < 0 || idx > 11) return isoDayUtc;
  return `${titleMonth(idx)} ${Number(m[3])}, ${m[1]}`;
}

/** Exact USD display from the served raw (never floored — receipt law). */
function usdExact(raw: string, usdcDecimals: number): string | null {
  const v = formatAmountExact(raw, usdcDecimals);
  return v === null ? null : `$${v}`;
}

/** Build the row's FULL ticket model, or null when the record cannot
 *  express one (no receipt facts / no seat / no block) — honest absence. */
function ticketModelFor(
  row: OwnPurchaseRowReadback,
  decimals: { usdc: number; syn: number },
): MembershipReceiptModel | null {
  const f = row.receipt;
  if (f === null || f.seat === null || f.holderShort === null) return null;
  if (row.block === null) return null;
  return buildMembershipReceipt({
    event: {
      memberNumber: String(f.seat),
      recipient: f.holderShort,
      grossUsdcRaw: row.amountRaw,
      acquisitionCostRaw: f.commissionRaw,
      protocolContributionRaw: f.netRaw,
      vaultAmountRaw: f.vaultRaw,
      liquidityAmountRaw: f.liquidityRaw,
      operationsAmountRaw: f.operationsRaw,
      synOutRaw: f.synOutRaw,
      synPerUsdc: f.synPerUsdc,
      era: f.era,
      firstSeat: f.firstSeat,
      sourceId: f.sourceIdHex,
      sourceWallet: f.broughtByShort,
    },
    proof: {
      txHash: row.transaction,
      blockNumber: String(row.block),
      explorerTxUrl: row.explorerUrl,
    },
    blockTimestamp: row.sealedAtSec,
    usdcDecimals: decimals.usdc,
    synDecimals: decimals.syn,
  });
}

function SkeletonRow() {
  return (
    <div className="rounded-[10px] border border-border bg-card px-4 py-4 flex items-center gap-3">
      <span className="h-3 w-20 rounded bg-border/60" />
      <span className="h-3 w-24 rounded bg-border/60" />
      <span className="h-3 w-14 rounded bg-border/60 ml-auto" />
      <span className="h-3 w-3.5 rounded bg-border/60" />
    </div>
  );
}

export default function ReceiptsBinderPanel() {
  return (
    <SignInWall teaser="Your receipt binder — every confirmed purchase on your wallet, each one reopening as its full ticket, dated and anchored on-chain. Sign in with your wallet to open it.">
      <BinderBody />
    </SignInWall>
  );
}

function BinderBody() {
  // The connected wallet feeds each opened ticket's one-door state read;
  // the ROWS themselves are the SERVER SESSION's own (never the wagmi link).
  const { address: wallet } = useAccount();
  const readback = useOwnPurchaseRows();
  const rows = readback?.rows ?? null;
  const decimals = readback?.decimals ?? null;
  // GAP-3b verdict (sealed 2026-07-19): a home-row "receipt" link deep-opens
  // ITS OWN ticket — the binder reads ?tx= once and starts with that row
  // open (a malformed value is simply ignored; the page never breaks).
  const [open, setOpen] = useState<ReadonlySet<string>>(() => {
    const tx = new URLSearchParams(window.location.search).get("tx");
    return tx !== null && /^0x[0-9a-fA-F]{64}$/.test(tx)
      ? new Set([tx, tx.toLowerCase()])
      : new Set();
  });

  const groups = useMemo(() => {
    if (rows === null || rows.length === 0) return [];
    const byMonth = new Map<string, OwnPurchaseRowReadback[]>();
    for (const r of rows) {
      const key = monthLabel(r.isoDayUtc);
      const list = byMonth.get(key) ?? [];
      list.push(r);
      byMonth.set(key, list);
    }
    // Served order is newest-first already; the map preserves insertion.
    return [...byMonth.entries()].map(([label, list]) => ({ label, list }));
  }, [rows]);

  const toggle = (tx: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(tx)) next.delete(tx);
      else next.add(tx);
      return next;
    });
  };

  return (
    <div data-testid="panel-receipts-binder">
      {/* The record header — the work opens the page. */}
      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">
            Your receipts — the record
          </span>
          {rows !== null ? (
            <StatusPill tone="live" size="xs">
              Live · your own row
            </StatusPill>
          ) : null}
        </div>
        {rows === null ? (
          <p
            className="text-sm text-muted-foreground leading-relaxed"
            title={readback?.failureReason ?? undefined}
          >
            {readback === null
              ? "The record read is resolving — nothing is assumed, nothing is invented."
              : "The record is unavailable right now — your record on-chain is unchanged. Try again in a moment."}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {rows.length === 0
              ? "No purchases on this wallet yet — your first receipt prints at checkout, and lives here forever after."
              : `${rows.length} confirmed ${rows.length === 1 ? "purchase" : "purchases"} — each one reopens below as its full ticket, anchored on-chain.`}
          </p>
        )}
      </Card>

      {/* The receipts — month-grouped, newest first, expanding in place. */}
      {readback === null ? (
        <div className="space-y-3" aria-hidden="true">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : null}

      {groups.map((g) => (
        <section key={g.label} className="mb-6">
          <div className="flex items-baseline gap-3 mb-2.5 px-0.5">
            <span className="font-mono text-xs tracking-[0.18em] text-muted-foreground">
              {g.label}
            </span>
            <span className="font-mono text-xs text-muted-foreground ml-auto tabular-nums">
              {g.list.length} {g.list.length === 1 ? "receipt" : "receipts"}
            </span>
          </div>
          <div className="space-y-3">
            {g.list.map((r) => {
              const isOpen = open.has(r.transaction);
              const model =
                decimals !== null ? ticketModelFor(r, decimals) : null;
              const total =
                decimals !== null ? usdExact(r.amountRaw, decimals.usdc) : null;
              const rowId = `receipt-${r.transaction.slice(2, 10)}`;
              return (
                <article
                  key={r.transaction}
                  className="rounded-[10px] border border-border bg-card overflow-hidden"
                >
                  {/* the paper's torn top edge — the register's genre marker */}
                  <div
                    className="border-t border-dashed border-border mx-3.5 mt-1.5"
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    onClick={() => toggle(r.transaction)}
                    aria-expanded={isOpen}
                    aria-controls={rowId}
                    className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-3 min-h-12 text-left"
                    data-testid={`button-${rowId}`}
                  >
                    <span className="text-[13px] text-muted-foreground whitespace-nowrap">
                      {dateLabel(r.isoDayUtc)}
                    </span>
                    {r.receipt?.seat !== null && r.receipt?.seat !== undefined ? (
                      <span className="font-mono text-[13px] text-foreground">
                        Seat #{r.receipt.seat}
                        {/* GAP-3a verdict (sealed 2026-07-19): a repeat
                            purchase by a seated member is FOOTPRINT, never a
                            second seat — said on the row, from the event's
                            own first-purchase flag (false = the seat already
                            stood; null = an engine that never carried it). */}
                        {r.receipt.firstSeat === false ? (
                          <span className="text-xs text-muted-foreground"> · footprint</span>
                        ) : null}
                      </span>
                    ) : null}
                    <span className="font-mono text-xs text-muted-foreground">
                      {r.engine}
                    </span>
                    <span className="ml-auto font-mono text-[15px] font-semibold text-gold tabular-nums">
                      {total ?? "—"}
                    </span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-muted-foreground transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                  {isOpen ? (
                    <div id={rowId} className="border-t border-dashed border-border px-3.5 py-5 flex justify-center">
                      {model !== null ? (
                        <ReceiptTicket model={model} wallet={wallet} />
                      ) : (
                        <div className="max-w-md text-center">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            This engine&apos;s record does not carry every fact a
                            full ticket needs — nothing is guessed. The
                            transaction itself is the receipt.
                          </p>
                          <a
                            href={r.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs text-proof/80 hover:text-proof underline underline-offset-2 mt-2"
                          >
                            Verify on the explorer
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        </div>
                      )}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
