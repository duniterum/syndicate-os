// wallet/ActivityMineLedger.tsx — the Mine lens of /activity (A1, founder-
// approved wireframe + « go continue » 2026-08-02).
// ---------------------------------------------------------------------------
// The member's calm personal LEDGER — the C3 brick: own purchases (with their
// receipt facts), own sealed introductions, and the seat's own entry receipt,
// composed into the feed's grammar. STRICTLY own-row: every datum comes from
// the sealed sign-in readbacks (walletSession → /api/auth/*, session cookie
// only) — NEVER by filtering the public feed against a connected address (the
// SIWE-bound account is server-side and never echoed; the wagmi account is
// not the session). Signed out, this component shows the honest invitation —
// zero data, never a teaser. Three honest states signed-in: loading skeleton ·
// empty-with-next-step · error-with-retry.
//
// This is a WALLET module (guard-access-state rule 15): the public /activity
// page reaches it ONLY through a flag-gated lazy import — the pulse carries
// no wallet weight until Mine is asked for.

import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBaseUnits } from "@/lib/amountFormat";
import { chapterForSeat } from "@/lib/chapters";
import {
  fetchMemberStanding,
  fetchOwnIntroductions,
  fetchOwnPurchases,
  type MemberStandingReadback,
  type OwnIntroductionsReadback,
  type OwnPurchasesReadback,
} from "@/wallet/walletSession";

type LedgerState =
  | { kind: "loading" }
  | { kind: "signed-out" }
  | { kind: "error" }
  | {
      kind: "ok";
      standing: MemberStandingReadback;
      purchases: OwnPurchasesReadback;
      introductions: OwnIntroductionsReadback;
    };

interface LedgerRow {
  /** ISO day for sorting/display; null = day unknown (the seat's own receipt). */
  day: string | null;
  sentence: string;
  /** Gold-emphasised fragment inside the sentence, when one exists. */
  strong: string | null;
  anchorShort: string;
  explorerUrl: string;
  /** The full transaction hash — the row's own coordinates. */
  tx: string;
  /** The document door — the row's OWN /receipt/{tx} page — when the row has
   * a full ticket (founder catch 2026-08-03: never the whole binder). */
  hasReceipt: boolean;
  key: string;
}

const short = (tx: string): string => `${tx.slice(0, 6)}…${tx.slice(-4)}`;

export default function ActivityMineLedger() {
  const [state, setState] = useState<LedgerState>({ kind: "loading" });
  const [nonce, setNonce] = useState(0);

  const reload = useCallback(() => {
    setState({ kind: "loading" });
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [standing, purchases, introductions] = await Promise.all([
        fetchMemberStanding(),
        fetchOwnPurchases(),
        fetchOwnIntroductions(),
      ]);
      if (cancelled) return;
      // Transport/shape failure on any read → honest error, never a partial ledger.
      if (standing === null || purchases === null || introductions === null) {
        setState({ kind: "error" });
        return;
      }
      // No active session (S1) — the honest invitation, zero data.
      if (standing.state !== "S4") {
        setState({ kind: "signed-out" });
        return;
      }
      setState({ kind: "ok", standing, purchases, introductions });
    })();
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  if (state.kind === "loading") {
    return (
      <p className="py-6 text-sm text-muted-foreground" data-testid="mine-loading">
        Reading your own record…
      </p>
    );
  }

  if (state.kind === "signed-out") {
    return (
      <div
        className="mt-2 max-w-[60ch] rounded-xl border border-dashed border-border/60 p-7"
        data-testid="mine-signed-out"
      >
        {/* Work Sans semibold — the page's ONE serif display is its h1
            (font law 2026-07-25; the guard caught the wireframe's serif). */}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          Your own on-chain history lives here.
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Every purchase, every introduction, every receipt that belongs to your
          seat — shown to you alone, each line verifiable on the explorer. Sign
          in with your wallet to open your ledger. No email, no password — the
          chain is the account.
        </p>
        <Link href="/member" className="mt-4 inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Button tabIndex={-1}>Member sign-in</Button>
        </Link>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="py-6" data-testid="mine-error">
        <p className="text-sm text-muted-foreground">
          Your ledger could not be read just now — nothing is shown rather than
          something guessed.
        </p>
        <Button variant="outline" className="mt-3" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  const { standing, purchases, introductions } = state;
  // FINAL AUDIT 2026-08-03 (MEDIUM): rows === null means the record model is
  // UNAVAILABLE — an honest gap, NEVER proven absence. Collapsing it into []
  // could show a seated member "no acts yet" over an unread model. Unreadable
  // → the same honest error state, with retry.
  if (purchases.rows === null || introductions.rows === null) {
    return (
      <div className="py-6" data-testid="mine-unavailable">
        <p className="text-sm text-muted-foreground">
          Part of your record could not be read just now — nothing is shown
          rather than something guessed.
        </p>
        <Button variant="outline" className="mt-3" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }
  const usdcDec = purchases.decimals?.usdc ?? 6;
  const synDec = purchases.decimals?.syn ?? 18;

  const rows: LedgerRow[] = [];
  for (const p of purchases.rows ?? []) {
    const usd = formatBaseUnits(p.amountRaw, usdcDec, 2);
    const syn =
      p.receipt?.synOutRaw != null ? formatBaseUnits(p.receipt.synOutRaw, synDec, 0) : null;
    rows.push({
      day: p.isoDayUtc,
      sentence: `Your purchase — $${usd ?? "…"} USDC${syn !== null ? ` · ${syn} SYN received` : ""}`,
      strong: null,
      anchorShort: short(p.transaction),
      explorerUrl: p.explorerUrl,
      tx: p.transaction,
      hasReceipt: p.receipt !== null,
      key: `p-${p.transaction}`,
    });
  }
  for (const r of introductions.rows ?? []) {
    rows.push({
      day: r.isoDayUtc,
      sentence: `Your introduction sealed — ${r.durable ? "durable" : "awaiting durability"} · commission paid in the buyer's own transaction`,
      strong: r.durable ? "durable" : null,
      anchorShort: short(r.transaction),
      explorerUrl: r.explorerUrl,
      tx: r.transaction,
      hasReceipt: false,
      key: `i-${r.transaction}`,
    });
  }
  rows.sort((a, b) => (b.day ?? "").localeCompare(a.day ?? ""));
  // The seat's own entry receipt closes the ledger (the beginning of the
  // story; its payload carries no day — the block is its coordinate).
  if (standing.receipt !== null && standing.memberNumber !== null) {
    rows.push({
      day: null,
      sentence: `Your seat #${standing.memberNumber} written on-chain`,
      strong: `#${standing.memberNumber}`,
      anchorShort: short(standing.receipt.transaction),
      explorerUrl: standing.receipt.explorerUrl,
      tx: standing.receipt.transaction,
      hasReceipt: false,
      key: "seat-entry",
    });
  }

  const seatNo = standing.memberNumber !== null ? Number(standing.memberNumber) : null;
  const chapter = seatNo !== null ? chapterForSeat(seatNo) : null;

  if (rows.length === 0) {
    return (
      <div className="mt-2 max-w-[60ch] rounded-xl border border-dashed border-border/60 p-7" data-testid="mine-empty">
        <p className="text-sm leading-relaxed text-muted-foreground">
          No on-chain acts on this account yet — the ledger fills itself the
          moment one exists.
        </p>
        <Link href="/join" className="mt-4 inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Button tabIndex={-1}>Take your seat</Button>
        </Link>
      </div>
    );
  }

  return (
    <div data-testid="mine-ledger">
      {standing.memberNumber !== null ? (
        <p className="type-eyebrow mb-3 text-muted-foreground">
          Seat #{standing.memberNumber}
          {chapter !== null ? ` · Chapter ${chapter.roman}` : ""}
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-0">
          <tbody>
            {rows.map((r) => (
              <tr key={r.key}>
                <td className="border-t border-border/40 py-3.5 pr-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                  {r.day ??
                    (standing.receipt?.block != null
                      ? `block ${standing.receipt.block.toLocaleString("en-US")}`
                      : "—")}
                </td>
                <td className="border-t border-border/40 py-3.5 pr-4 text-sm">
                  {r.strong !== null && r.sentence.includes(r.strong) ? (
                    <>
                      {r.sentence.slice(0, r.sentence.indexOf(r.strong))}
                      <span className="font-semibold text-gold">{r.strong}</span>
                      {r.sentence.slice(r.sentence.indexOf(r.strong) + r.strong.length)}
                    </>
                  ) : (
                    r.sentence
                  )}
                </td>
                <td className="border-t border-border/40 py-3.5 pr-4 whitespace-nowrap">
                  <a
                    href={r.explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-sm font-mono text-sm text-proof transition-colors hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {r.anchorShort}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </td>
                <td className="border-t border-border/40 py-3.5 whitespace-nowrap font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                  {r.hasReceipt ? (
                    // The row's OWN document — we HAVE the hash; the binder
                    // stays one door in the footer (founder, 2026-08-03).
                    <Link
                      href={`/receipt/${r.tx}`}
                      className="rounded-sm text-proof hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      receipt
                    </Link>
                  ) : (
                    // An anchor like its public-feed sibling — never a dead
                    // label dressed as one (founder, 2026-08-03).
                    <a
                      href={r.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-sm text-proof hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      verify
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">
        Rows come from your own sealed readbacks — purchases, introductions and
        your seat — never from the public feed. Your full tickets live in{" "}
        <Link
          href="/receipts"
          className="rounded-sm text-proof hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Receipts
        </Link>
        .
      </p>
    </div>
  );
}
