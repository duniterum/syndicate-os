// components/receipt/PublicReceiptPanel.tsx — the /receipt/{txHash} body
// (Q44 sealed order; founder-approved wireframe 2026-07-20).
//
// Composition (work-first): THE TICKET under its verdict bar (both born in
// the wallet module — guard-receipt-ticket pin 10's ONE sanctioned mount
// site is this file; the bar renders only over a strictly-parsed row, the
// review-verified truth order). This panel owns the fetch and the honest
// states, never a guess: resolving · record unavailable · unknown/
// too-recent transaction.
//
// The fetch lives HERE, not in the wallet module: this is a PUBLIC read
// (guard-access-state §17 pins every wallet-module fetch to /api/auth), and
// the payload row is passed to the wallet mount UNPARSED — the strict
// parsing happens inside the wallet module with the binder's own parser
// (one fact shape, one validation).

import { lazy, Suspense, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";

const TicketMount = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/PublicReceiptTicket"))
  : null;

/** The serving layer admits only this shape; the belt stays on client-side. */
const TX_SHAPE_RE = /^0x[0-9a-fA-F]{64}$/;

interface ReceiptLookup {
  /** The served row, unparsed (object) — or null (no receipt / model dark). */
  row: Record<string, unknown> | null;
  /** False while the record model has not built — "unavailable", never a
   *  false "no receipt" (a dark model proves nothing). */
  modelReady: boolean;
  decimals: { usdc: number; syn: number } | null;
  /** The requested hash's canonical explorer address, served regardless. */
  explorerTxUrl: string | null;
  note: string | null;
}

/** undefined = resolving · null = transport failure · object = the read. */
function useReceiptLookup(txHash: string): ReceiptLookup | null | undefined {
  const [readback, setReadback] = useState<ReceiptLookup | null | undefined>(
    undefined,
  );
  useEffect(() => {
    let active = true;
    setReadback(undefined);
    if (!TX_SHAPE_RE.test(txHash)) {
      // A malformed tail can only be reached client-side (the serving layer
      // 404s it) — the truthful state is "no receipt on this transaction",
      // never a transport-failure claim.
      setReadback({
        row: null,
        modelReady: true,
        decimals: null,
        explorerTxUrl: null,
        note: null,
      });
      return;
    }
    void fetch(`/api/receipt/${txHash}`, { method: "GET" })
      .then(async (res) => {
        if (!res.ok) return null;
        const body: unknown = await res.json();
        if (typeof body !== "object" || body === null) return null;
        const o = body as Record<string, unknown>;
        const row =
          typeof o.row === "object" && o.row !== null
            ? (o.row as Record<string, unknown>)
            : null;
        let decimals: ReceiptLookup["decimals"] = null;
        if (typeof o.decimals === "object" && o.decimals !== null) {
          const d = o.decimals as Record<string, unknown>;
          if (
            typeof d.usdc === "number" &&
            Number.isSafeInteger(d.usdc) &&
            d.usdc >= 0 &&
            typeof d.syn === "number" &&
            Number.isSafeInteger(d.syn) &&
            d.syn >= 0
          ) {
            decimals = { usdc: d.usdc, syn: d.syn };
          }
        }
        return {
          row,
          modelReady: o.modelReady === true,
          decimals,
          explorerTxUrl:
            typeof o.explorerTxUrl === "string" ? o.explorerTxUrl : null,
          note: typeof o.note === "string" ? o.note : null,
        };
      })
      .then((r) => {
        if (active) setReadback(r);
      })
      .catch(() => {
        if (active) setReadback(null);
      });
    return () => {
      active = false;
    };
  }, [txHash]);
  return readback;
}

function SkeletonTicket() {
  return (
    <div
      className="w-[340px] max-w-full mx-auto h-[420px] rounded-[10px] border border-border bg-gradient-to-b from-border/35 to-border/10"
      aria-hidden="true"
    />
  );
}

export function PublicReceiptPanel({ txHash }: { txHash: string }) {
  const readback = useReceiptLookup(txHash);

  // Resolving — the skeleton keeps the true document shape, never a spinner.
  if (readback === undefined) {
    return (
      <div data-testid="panel-public-receipt">
        <SkeletonTicket />
        <p className="text-sm text-muted-foreground leading-relaxed text-center max-w-md mx-auto mt-4">
          The record read is resolving — nothing is assumed, nothing is
          invented.
        </p>
      </div>
    );
  }

  // Transport failure — honest, calm, retryable.
  if (readback === null) {
    return (
      <Card className="bg-card/40 border-border/50 p-5 max-w-md mx-auto" data-testid="panel-public-receipt">
        <p className="text-sm text-muted-foreground leading-relaxed">
          The record is unavailable right now — the on-chain record is
          unchanged. Try again in a moment.
        </p>
      </Card>
    );
  }

  const { row, modelReady, decimals, explorerTxUrl, note } = readback;

  if (row === null) {
    // The record model has not built yet — "unavailable", never a false
    // "no receipt" claim (a dark model proves nothing about this hash).
    if (!modelReady) {
      return (
        <Card className="bg-card/40 border-border/50 p-5 max-w-md mx-auto" data-testid="panel-public-receipt">
          <p className="text-sm text-muted-foreground leading-relaxed" title={note ?? undefined}>
            The record is unavailable right now — the on-chain record is
            unchanged. Try again in a moment.
          </p>
        </Card>
      );
    }
    // No receipt on this transaction (unknown hash, or one indexer cycle
    // early after checkout) — the approved copy, with a real verify door.
    return (
      <Card className="bg-card/40 border-border/50 p-5 max-w-md mx-auto" data-testid="panel-public-receipt">
        <p className="text-sm text-foreground leading-relaxed">
          No purchase receipt on this transaction in the served record.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed mt-1.5" title={note ?? undefined}>
          Sealed moments ago? The served record may still be catching up —
          retry shortly.
        </p>
        {explorerTxUrl !== null ? (
          <a
            href={explorerTxUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs text-proof/80 hover:text-proof underline underline-offset-2 mt-3"
            data-testid="link-unknown-verify"
          >
            Verify on the explorer
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        ) : null}
      </Card>
    );
  }

  // A row without its decimals is a malformed payload — the honest
  // unavailable state, never a mis-based figure.
  if (decimals === null) {
    return (
      <Card className="bg-card/40 border-border/50 p-5 max-w-md mx-auto" data-testid="panel-public-receipt">
        <p className="text-sm text-muted-foreground leading-relaxed">
          The record is unavailable right now — the on-chain record is
          unchanged. Try again in a moment.
        </p>
      </Card>
    );
  }

  return (
    <div data-testid="panel-public-receipt">
      {/* The document chain — verdict bar + ticket + provenance, all born in
          the wallet module over the strictly-parsed row. */}
      {TicketMount ? (
        <Suspense fallback={<SkeletonTicket />}>
          <TicketMount rowRaw={row} decimals={decimals} />
        </Suspense>
      ) : null}
    </div>
  );
}
