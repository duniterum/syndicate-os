// components/referral/ReferralCommissionsPanel.tsx — TAB 3 · Commissions.
//
// SLICE 5.1 — THE COMMISSION RECEIPTS REGISTER (founder-approved mockup
// docs/design/commissions-receipts-mockup.html; direction
// docs/reference/COMMISSION_RECEIPTS_DESIGN_DIRECTION.md). Every commission,
// past and future, is the same receipt: one month-grouped stack of ticket
// rows expanding IN PLACE into the full 7-zone document (ARIA accordion,
// multiple open allowed) — no modal, no drawer, no second grammar. The
// receipt grammar is the wallet ticket's, re-implemented here because
// guard-access-state rule 15 walls the wallet module off from components/
// (type-only imports stay legal; guard-receipt-ticket Pin 10 keeps the
// ticket itself wallet-only).
//
// Truth laws: every figure is the served row's own fact via usdExact (never
// floored, never recomputed — the split must sum on screen exactly as it
// does on-chain); a row without a server-consistent breakdown renders its
// commission alone (absence is absence, never a guess); fetch state is never
// conflated with chain state — a rendered receipt is always Final. Every
// served row IS a paid commission by the rows model's own contract; escrow
// exists only as the standing's aggregate figure and renders in the record
// header, never invented onto a row.
//
// The share door (§7 + the sealed order's "its share card"): each document
// carries a quiet share row to the receipt's PERMANENT public page
// (/receipt/{txHash} — live 2026-07-20); the painted preview cards already
// serve every receipt link, so the link IS the share card. The rotation
// lives in the LINK (?f advances per share act — the R-BIND-2 engraved
// answer), and the shareTargets contract is honored per family (text never
// carries the link on url-param intents — the R-CARDS rider's lesson).

import { useMemo, useState } from "react";
import {
  ChevronDown,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { ladderProgress } from "@/config/connectorLadder";
import { referralProgram } from "@/config/referralProgram";
import { shareTargets, type ShareTargetDef } from "@/lib/shareTargets";
import {
  dateLabel,
  humanReadFailure,
  monthLabel,
  usdExact,
  useOwnIntroductions,
  type StandingReadback,
} from "@/components/referral/referralStanding";
import type { OwnIntroductionRowReadback } from "@/wallet/walletSession";

/** $5.00 seat purchase at `bps` → the commission in dollars, two decimals
 * (the WORKED EXAMPLE's own arithmetic — never a receipt's). */
function commissionOnFiveDollars(bps: number): string {
  return `$${((5 * bps) / 10_000).toFixed(2)}`;
}

/** The example's companion: what the $5.00 purchase sends to the company. */
function companyOnFiveDollars(bps: number): string {
  return `$${(5 - (5 * bps) / 10_000).toFixed(2)}`;
}

/** Basis points → a human percent ("5%", "6.5%"). */
function pct(bps: number): string {
  const p = bps / 100;
  return `${Number.isInteger(p) ? p : p.toFixed(2).replace(/0+$/, "").replace(/\.$/, "")}%`;
}

/** The house middle-ellipsis short form for a tx hash (6…4, U+2026). */
function shortTx(hash: string): string {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

/** Exact base-unit sum of a group's commissions (list-layer aggregation —
 * BigInt integer math, never floats, rendered through the one formatter). */
function sumCommissionsRaw(rows: readonly OwnIntroductionRowReadback[]): string {
  let sum = 0n;
  for (const r of rows) sum += BigInt(r.commissionRaw);
  return sum.toString();
}

/** The ticket's dashed zone separator, verbatim grammar. */
function ZoneRule() {
  return <div className="border-t border-dashed border-border" aria-hidden="true" />;
}

// ── The share door (§7): the receipt's permanent public page is the share
// artifact — the painted preview card already lives at the link. ────────────
const SHARE_ORDER = ["x", "whatsapp", "telegram", "linkedin", "facebook", "email"] as const;
const SHARE_ICONS: Record<(typeof SHARE_ORDER)[number], typeof Twitter> = {
  x: Twitter,
  whatsapp: MessageCircle,
  telegram: Send,
  linkedin: Linkedin,
  facebook: Facebook,
  email: Mail,
};
const ORDERED_TARGETS: ShareTargetDef[] = SHARE_ORDER.map(
  (id) => shareTargets.find((t) => t.id === id),
).filter((t): t is ShareTargetDef => t !== undefined);

function ShareRow({ tx }: { tx: string }) {
  // The rotation lives in the LINK: each share act hands the current face,
  // then advances (1 → 2 → 3 → 4 → 1). Stateless by design — no server.
  const [face, setFace] = useState(1);
  const [copied, setCopied] = useState(false);
  const nativeShareAvailable =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const pageUrl = `https://thesyndicate.money/receipt/${tx}${face > 1 ? `?f=${face}` : ""}`;
  const advance = () => setFace((f) => (f % 4) + 1);
  // The shareTargets contract: url-param intents get URL-FREE text (the
  // platform places the url itself); text-only intents carry it inline.
  const textBare = "The Syndicate — a commission receipt.";
  const textInline = `${textBare} Sealed proof: ${pageUrl}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">
        Share — this receipt&apos;s permanent page:
      </span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            .writeText(pageUrl)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            })
            .catch(() => {});
          advance();
        }}
        className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors"
        data-testid={`button-commission-copy-link-${tx.slice(2, 10)}`}
      >
        {copied ? "Copied" : "Copy link"}
      </button>
      {ORDERED_TARGETS.map((t) => {
        const Icon = SHARE_ICONS[t.id as (typeof SHARE_ORDER)[number]];
        return (
          <button
            key={t.id}
            type="button"
            aria-label={`Share on ${t.label}`}
            onClick={() => {
              const [intentUrl, intentText] =
                t.id === "whatsapp" || t.id === "email"
                  ? ["", textInline]
                  : [pageUrl, textBare];
              window.open(t.build(intentUrl, intentText), "_blank", "noopener,noreferrer");
              advance();
            }}
            className="h-9 w-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
            data-testid={`button-commission-share-${t.id}-${tx.slice(2, 10)}`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
      {nativeShareAvailable ? (
        <button
          type="button"
          aria-label="Share with other apps"
          onClick={() => {
            void navigator
              .share({ title: "The Syndicate", text: textBare, url: pageUrl })
              .then(advance)
              .catch(() => {});
          }}
          className="h-9 w-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center"
          data-testid={`button-commission-share-native-${tx.slice(2, 10)}`}
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/** The proof zone's copy affordance — copies the FULL hash (the tx hash IS
 * the receipt number). */
function CopyHashButton({ tx }: { tx: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          .writeText(tx)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          })
          .catch(() => {});
      }}
      className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      data-testid={`button-commission-copy-hash-${tx.slice(2, 10)}`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** One money line in the document, ticket grammar (13px/1.9, mono right
 * values; emphasis 15px semibold; gold belongs to the commission only). */
function MoneyRow({
  label,
  calc,
  value,
  emphasis,
  indent,
}: {
  label: string;
  calc?: string;
  value: string;
  emphasis?: "plain" | "em" | "gold";
  indent?: boolean;
}) {
  const valueClass =
    emphasis === "gold"
      ? "font-mono text-right ml-auto min-w-0 break-words tabular-nums text-[15px] font-semibold text-gold"
      : emphasis === "em"
        ? "font-mono text-right ml-auto min-w-0 break-words tabular-nums text-[15px] font-semibold"
        : "font-mono text-right ml-auto min-w-0 break-words tabular-nums text-foreground/80";
  return (
    <div
      className={`flex flex-wrap justify-between gap-x-3 text-[13px] leading-[1.9] ${indent ? "pl-3.5" : ""}`}
    >
      <span className="text-muted-foreground">
        {label}
        {calc ? <span className="text-xs text-muted-foreground/75"> {calc}</span> : null}
      </span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

// ── One receipt: the collapsed ticket-sliver row + the in-place document. ───
function CommissionReceipt({ row }: { row: OwnIntroductionRowReadback }) {
  // Collapsed by default, always — one state model, born scale-ready.
  // Multiple rows may be open at once (no coordination by design); the
  // accordion state lives in React memory only (guard rule 12).
  const [isOpen, setIsOpen] = useState(false);
  const a = row.anatomy;
  const docId = `commission-${row.transaction.slice(2, 10)}`;

  return (
    <article className="rounded-[10px] border border-border bg-card overflow-hidden">
      {/* the paper's torn top edge — the register's genre marker */}
      <div className="border-t border-dashed border-border mx-3.5 mt-1.5" aria-hidden="true" />
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={docId}
        className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-3 min-h-12 text-left"
        data-testid={`button-${docId}`}
      >
        {/* Mobile two-line recipe (§6): line 1 who + amount + caret; line 2
            date + pills. Desktop: date · who ——— pills · amount · caret. */}
        <span className="order-4 sm:order-1 basis-[60%] sm:basis-auto text-[13px] text-muted-foreground whitespace-nowrap">
          {dateLabel(row.isoDayUtc)}
        </span>
        <span className="order-1 sm:order-2 font-mono text-[13px] text-foreground">
          {row.who}
        </span>
        <span className="order-5 sm:order-3 ml-auto flex gap-1.5">
          <StatusPill tone="live" size="xs">
            Paid
          </StatusPill>
          {row.durable ? (
            <StatusPill tone="identity" size="xs">
              Durable
            </StatusPill>
          ) : null}
        </span>
        <span className="order-2 sm:order-4 ml-auto sm:ml-0 font-mono text-[15px] font-semibold text-gold tabular-nums whitespace-nowrap">
          +{usdExact(row.commissionRaw)}
        </span>
        <ChevronDown
          className={`order-3 sm:order-5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div id={docId} className="px-[18px] pb-3.5">
          {/* zone 1 · headline + record line */}
          <ZoneRule />
          <div className="py-3 px-0.5">
            <p className="text-[13px] leading-normal text-foreground">
              <span className="font-mono">{row.who}</span> joined through your
              introduction.
            </p>
            <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted-foreground mt-1.5">
              <span>{dateLabel(row.isoDayUtc)}</span>
              <span className="font-mono tabular-nums">
                block {row.block.toLocaleString("en-US")}
              </span>
              <span>
                receipt <span className="font-mono">{shortTx(row.transaction)}</span>
              </span>
            </div>
          </div>

          {/* zone 2 · the money story — the event's own amounts, printed */}
          <ZoneRule />
          <div className="py-3 px-0.5">
            <div className="font-mono text-xs font-semibold tracking-[0.18em] text-gold mb-1.5">
              THE MONEY — IN THE BUYER&apos;S OWN TRANSACTION
            </div>
            {a !== null ? (
              <>
                <MoneyRow label="The buyer paid" value={usdExact(a.grossRaw)} emphasis="em" />
                <MoneyRow
                  label="Your commission"
                  calc={`— ${pct(a.commissionBps)} of ${usdExact(a.grossRaw)}`}
                  value={`+${usdExact(row.commissionRaw)}`}
                  emphasis="gold"
                />
                <MoneyRow label="To the company" value={usdExact(a.netRaw)} emphasis="em" />
                <MoneyRow label="Vault · 70%" value={usdExact(a.vaultRaw)} indent />
                <MoneyRow label="Liquidity · 20%" value={usdExact(a.liquidityRaw)} indent />
                <MoneyRow label="Operations · 10%" value={usdExact(a.operationsRaw)} indent />
              </>
            ) : (
              <>
                <MoneyRow
                  label="Your commission"
                  value={`+${usdExact(row.commissionRaw)}`}
                  emphasis="gold"
                />
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  This record carries the commission alone — the full split
                  lives in the transaction itself, one tap below.
                </p>
              </>
            )}
          </div>

          {/* zone 3 · state — Avalanche truth: Final, never counters */}
          <ZoneRule />
          <div className="py-3 px-0.5 text-[13px] leading-normal">
            <span className="font-medium text-foreground">Final — settled on-chain.</span>{" "}
            <span className="text-muted-foreground">
              Your commission was paid inside the buyer&apos;s transaction, in
              the same block.
            </span>
          </div>

          {/* zone 4 · proof — the one verify idiom */}
          <ZoneRule />
          <div className="py-3 px-0.5 flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <span className="text-xs text-muted-foreground">
              tx <span className="font-mono">{shortTx(row.transaction)}</span>
            </span>
            <CopyHashButton tx={row.transaction} />
            <a
              href={row.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="ml-auto font-mono text-xs text-proof/80 hover:text-proof underline underline-offset-2"
              data-testid={`link-commission-verify-${row.transaction.slice(2, 10)}`}
            >
              Verify on Snowtrace ↗
            </a>
          </div>

          {/* zone 5 · the share door (§7) */}
          <ZoneRule />
          <div className="py-3 px-0.5">
            <ShareRow tx={row.transaction} />
          </div>

          {/* the perforation foot — the checkout liturgy, word for word */}
          <ZoneRule />
          <div className="font-mono text-xs font-semibold tracking-[0.22em] text-center text-muted-foreground pt-3 pb-1">
            DON&apos;T TRUST — VERIFY
          </div>
        </div>
      ) : null}
    </article>
  );
}

/** Skeleton of the REAL row shape — never a spinner (§6). */
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

// ── 3 · the reference expander — the worked example, chipped, one click
// away, never in the way (WORK-FIRST; the example never impersonates the
// record). ──────────────────────────────────────────────────────────────────
function ReferenceExpander({ rateBps }: { rateBps: number }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card className="bg-card/40 border-border/50 mt-7 overflow-hidden p-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="commission-worked-example"
        className="w-full flex items-center gap-2.5 px-5 py-3.5 min-h-12 text-left"
        data-testid="button-commission-reference"
      >
        <span className="text-sm text-foreground">How a commission is computed</span>
        <StatusPill tone="neutral" size="xs">
          Worked example
        </StatusPill>
        <ChevronDown
          className={`ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {isOpen ? (
        <div id="commission-worked-example" className="px-5 pb-4">
          <ZoneRule />
          <div className="pt-3">
            <MoneyRow label="A buyer takes a seat" value="$5.00" emphasis="em" />
            <MoneyRow
              label="Your commission at your current rung"
              calc={`— ${pct(rateBps)}`}
              value={commissionOnFiveDollars(rateBps)}
              emphasis="gold"
            />
            <MoneyRow label="To the company" value={companyOnFiveDollars(rateBps)} emphasis="em" />
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              Paid to your wallet inside the buyer&apos;s own transaction, in
              the same block. Your rate rises with durable introductions — see
              Ladder &amp; recognition.
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

// ── The tab ─────────────────────────────────────────────────────────────────
export function ReferralCommissionsPanel({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;
  const rateBps = s ? ladderProgress(s.durableIntroductions).current.bps : 500;
  // One read for the whole tab — the register renders from the SAME rows the
  // Introductions tab reads (they can never drift apart on the same wallet).
  const [retryToken, setRetryToken] = useState(0);
  const intro = useOwnIntroductions(retryToken);
  const rows = intro?.rows ?? null;

  // Month groups — served order is newest-first already; the map preserves
  // insertion, so groups arrive newest month first.
  const groups = useMemo(() => {
    if (rows === null || rows.length === 0) return [];
    const byMonth = new Map<string, OwnIntroductionRowReadback[]>();
    for (const r of rows) {
      const key = monthLabel(r.isoDayUtc);
      const list = byMonth.get(key) ?? [];
      list.push(r);
      byMonth.set(key, list);
    }
    return [...byMonth.entries()].map(([label, list]) => ({ label, list }));
  }, [rows]);

  // The record header's exact lifetime figure: paid + escrow, BigInt base
  // units through the one formatter (Mercury's invariant — the header must
  // equal the sum of the receipts and the chain).
  const lifetimeRaw = s
    ? (BigInt(s.commissionPaidRaw) + BigInt(s.escrowOwedRaw)).toString()
    : null;
  // The rows' own as-of block seats the register; the standing's is the
  // honest fallback while the rows read resolves.
  const asOfBlock = intro?.asOfBlock ?? s?.asOfBlock ?? null;
  const noSourceSentence =
    rows === null && intro !== null && intro.failureReason?.includes("no on-chain referral source")
      ? humanReadFailure(intro.failureReason)
      : null;

  return (
    <div data-testid="panel-commission-register">
      {/* 1 · THE RECORD HEADER — one quiet strip; the work opens the tab. */}
      {rows !== null && rows.length > 0 ? (
        <Card className="bg-card/40 border-border/50 p-5 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-sm font-medium text-foreground">
              Your commissions — the record
            </span>
            <StatusPill tone="live" size="xs">
              Live · your own row
            </StatusPill>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5">
            <span className="flex items-baseline gap-2">
              <span className="text-[12.5px] text-muted-foreground">Commissions</span>
              <span className="font-mono tabular-nums text-[15px] font-semibold text-foreground">
                {rows.length}
              </span>
            </span>
            {lifetimeRaw !== null ? (
              <span className="flex items-baseline gap-2">
                <span className="text-[12.5px] text-muted-foreground">Lifetime</span>
                <span className="font-mono tabular-nums text-[15px] font-semibold text-foreground">
                  {usdExact(lifetimeRaw)}
                </span>
              </span>
            ) : null}
            {s ? (
              <>
                <span className="flex items-baseline gap-2">
                  <span className="text-[12.5px] text-muted-foreground">Paid</span>
                  <span className="font-mono tabular-nums text-[15px] font-semibold text-foreground">
                    {usdExact(s.commissionPaidRaw)}
                  </span>
                </span>
                <span className="flex items-baseline gap-2">
                  <span className="text-[12.5px] text-muted-foreground">In escrow</span>
                  <span className="font-mono tabular-nums text-[15px] font-semibold text-foreground">
                    {usdExact(s.escrowOwedRaw)}
                  </span>
                </span>
              </>
            ) : null}
          </div>
          {asOfBlock !== null ? (
            <p className="text-xs text-muted-foreground leading-relaxed mt-2.5">
              Each commission below is its own on-chain receipt — your indexed
              record, up to block {asOfBlock.toLocaleString("en-US")}.
            </p>
          ) : null}
        </Card>
      ) : null}

      {/* 2 · THE RECEIPTS — month-grouped, newest first, expanding in place. */}
      {intro === null ? (
        <div className="space-y-3" aria-hidden="true">
          <SkeletonRow />
          <SkeletonRow />
        </div>
      ) : rows === null ? (
        // The read did not answer. A missing source is its own honest
        // sentence; anything else is a fetch failure — named as such, with
        // the record's truth intact and a way back (§6: fetch state is never
        // conflated with chain state).
        <Card className="bg-card/40 border-border/50 p-5">
          {noSourceSentence !== null ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{noSourceSentence}</p>
          ) : (
            <div
              className="flex flex-wrap items-center gap-3"
              title={intro.failureReason ?? undefined}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                Couldn&apos;t reach the chain — your record is unchanged.
              </p>
              <button
                type="button"
                onClick={() => setRetryToken((t) => t + 1)}
                className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors"
                data-testid="button-commission-retry"
              >
                Retry
              </button>
            </div>
          )}
        </Card>
      ) : rows.length === 0 ? (
        <Card className="bg-card/40 border-border/50 p-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-sm font-medium text-foreground">
              Your commissions — the record
            </span>
            <StatusPill tone="live" size="xs">
              Live · your own row
            </StatusPill>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            No commissions yet. When someone joins through your introduction,
            its receipt appears here — anchored on-chain.
          </p>
        </Card>
      ) : (
        <section aria-label="Commission receipts">
          {groups.map((g) => (
            <div key={g.label} className="mb-6">
              <div className="flex items-baseline gap-3 mb-2.5 px-0.5">
                <span className="syn-label text-muted-foreground">{g.label}</span>
                <span className="font-mono text-xs text-muted-foreground ml-auto tabular-nums">
                  {g.list.length} {g.list.length === 1 ? "commission" : "commissions"} ·{" "}
                  {usdExact(sumCommissionsRaw(g.list))}
                </span>
              </div>
              <div className="space-y-3">
                {g.list.map((r) => (
                  <CommissionReceipt key={r.transaction} row={r} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 3 · the reference expander — collapsed, bottom. */}
      <ReferenceExpander rateBps={rateBps} />

      {/* 4 · the legal seal — the boundary line sealed behind a dashed rule,
          pinned register text verbatim ("commission", plainly — the
          referrer-surface word; the ABI word never rides a surface). */}
      <div className="border-t border-dashed border-border mt-7 pt-3.5">
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-2xl">
          {referralProgram.boundaryLine}
        </p>
      </div>
    </div>
  );
}
