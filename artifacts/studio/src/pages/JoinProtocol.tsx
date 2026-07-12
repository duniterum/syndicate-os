// JoinProtocol — public /join: the read-only joining surface.
// ---------------------------------------------------------------------------
// Public Online Integration MVP (founder-approved). Everything here is a live
// READ of the active membership engine or an exact read-only computation:
//   - the live sale group renders through the shared ProtocolRealityPanel
//     (same truth-labelling as /status — nothing bespoke, nothing invented);
//   - the quote is the engine's own public quote view, surfaced as EXACT raw
//     base-unit strings; formatted values are client-side projections and the
//     raw string is always shown alongside;
//   - an optional ?source= introduction id is validated read-only against the
//     on-chain registry (the server never echoes the id back);
//   - HARD BOUNDARY: no transaction is ever initiated, signed, or submitted
//     from this app. The buy-readiness card below says so explicitly.

import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Link, useSearch } from "wouter";
import { ExternalLink, Link2, ShieldAlert } from "lucide-react";
import {
  getGetJoinQuoteQueryKey,
  getGetSourceValidateQueryKey,
  useGetJoinQuote,
  useGetProtocolVerifyLinks,
  useGetSourceValidate,
  type VerifyLinkId,
} from "@workspace/api-client-react";
import { PublicPage } from "@/components/PublicPage";
import { ProtocolRealityPanel } from "@/components/ProtocolReality";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatRawUnits,
  isSourceIdFormat,
  usdcInputToRaw,
} from "@/lib/rawUnits";
import {
  computeMinSynOutRaw,
  computeRoutingSplit,
  toCheckoutQuote,
} from "@/lib/checkoutVocabulary";
import { readSourceConfig } from "@/lib/chainReads";
import { JOIN_AMOUNTS_USDC } from "@/config/joinAmounts";
import { ctas } from "@/config/sharedCopy";

// C1.3 — the historical gate (wallet-aware, so it lives in the gated wallet
// module and is reached ONLY via a runtime dynamic import — guard rule 15).
// When the connected wallet is an unclaimed historical member, it declares the
// buy path BLOCKED ("claim your seat first") before any buy button ever exists.
const JoinHistoricalGate = lazy(() => import("@/wallet/JoinHistoricalGate"));

// The gate needs the deployed sale address — server-sourced from the
// membershipSaleV3 verify-link, never hardcoded client-side. Render the gate
// only once the verify-links query settles so a slow response doesn't flash a
// transient fail-closed card at a historical wallet.
function HistoricalGateSlot() {
  const { data, isLoading } = useGetProtocolVerifyLinks();
  if (isLoading) return null;
  const saleUrl = data?.links.find((l) => l.id === "membershipSaleV3")?.url ?? null;
  return (
    <Suspense fallback={null}>
      <JoinHistoricalGate
        saleAddress={saleUrl ? addressFromExplorerUrl(saleUrl) : null}
        saleUrl={saleUrl}
      />
    </Suspense>
  );
}

// ── Introduction (?source=) status ──────────────────────────────────────────

function IntroductionStatus({ sourceId }: { sourceId: string }) {
  const formatValid = isSourceIdFormat(sourceId);
  const { data, isLoading, isError } = useGetSourceValidate(
    { sourceId },
    {
      query: {
        enabled: formatValid,
        queryKey: getGetSourceValidateQueryKey({ sourceId }),
      },
    },
  );

  let line: string;
  let ok = false;
  if (!formatValid) {
    line =
      "The introduction id in this link is not a valid id format — a join would proceed without attribution.";
  } else if (isLoading) {
    line = "Validating the introduction against the on-chain registry…";
  } else if (isError || !data) {
    line =
      "Introduction validation is unavailable right now (possibly rate-limited) — nothing is assumed; reload to retry.";
  } else if (!data.chainVerified) {
    line = `Introduction could not be validated: ${data.failureReason ?? "live registry read unavailable"}.`;
  } else if (data.exists === false) {
    line =
      "This introduction id is not registered on-chain — a join would proceed without attribution.";
  } else if (data.exists === true && data.active === false) {
    line =
      "This introduction is registered but not active — a join today would proceed without attribution.";
  } else if (data.exists === true && data.active === true) {
    ok = true;
    line =
      "Verified introduction recognized — a join through this link would be attributed to the introducer on-chain.";
  } else {
    line = `Introduction state could not be read: ${data.failureReason ?? "unknown"}.`;
  }

  return (
    <Card
      className={`p-5 mb-10 ${ok ? "border-primary/30 bg-primary/5" : "bg-card/40 border-border/50"}`}
      data-testid="panel-join-introduction"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
          <Link2 className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-foreground mb-1">
            Introduction link detected
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-introduction-status">
            {line}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-2">
            Read-only registry validation · the server never echoes the id back
          </p>
        </div>
      </div>
    </Card>
  );
}

// ── Quote result rendering ──────────────────────────────────────────────────

function QuoteLine({
  label,
  primary,
  sub,
  testId,
}: {
  label: string;
  primary: ReactNode;
  sub?: ReactNode;
  testId?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-border/40 last:border-b-0">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-right">
        <div className="text-base font-medium text-foreground tabular-nums" data-testid={testId}>
          {primary}
        </div>
        {sub ? <div className="text-xs text-muted-foreground mt-0.5 max-w-[16rem]">{sub}</div> : null}
      </div>
    </div>
  );
}

// The full address + explorer base are DERIVED from a server verify-links URL
// (server-sourced, infra-only emission); the client holds no address in its bundle.
function addressFromExplorerUrl(url: string): string | null {
  return url.match(/\/address\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}
function explorerBaseFromUrl(url: string): string | null {
  return url.match(/^(.*)\/address\/0x[0-9a-fA-F]{40}\b/)?.[1] ?? null;
}

// A truncated, clickable proof of a wallet. The full address is read from the URL;
// for infra wallets the URL comes from verify-links, for the referrer's payoutWallet
// it is built from the verify-links explorer base + the client chain read.
function AddressProof({ url }: { url: string }) {
  const addr = addressFromExplorerUrl(url);
  if (!addr) return null;
  const short = `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`${addr} — open in block explorer`}
      className="inline-flex items-center gap-1 font-mono text-[10px] text-proof/80 transition-colors hover:text-proof"
    >
      {short}
      <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
    </a>
  );
}

// The source-payment line (C1.2b): the referrer, paid FROM the purchase tx before
// the net is sent. TWO corrections the founder caught in the contract:
//   · the RATE + AMOUNT come from the QUOTE (acquisitionCost = the contract's own
//     EFFECTIVE _previewCommissionBps result — 0 in six cases the registry's
//     configured bps ignores), never from sourceConfig.commissionBps;
//   · the ADDRESS is sourceConfig(sourceId).payoutWallet (client read), never
//     sourceWallet — _payAcquisition pays payoutWallet, and the two can differ.
// Consistency, fail-closed: the quote says a payment applies; if the live registry
// read cannot confirm an ACTIVE source with a real payoutWallet, we show NO
// destination (contradiction or read failure). The quote wins on the money; we
// show nothing rather than something wrong.
function SourcePaymentLine({
  sourceId,
  grossUsdcRaw,
  sourcePaymentRaw,
  usdcDecimals,
  registryUrl,
}: {
  sourceId: string;
  grossUsdcRaw: string;
  sourcePaymentRaw: string;
  usdcDecimals: number;
  registryUrl: string | null;
}) {
  const registryAddr = registryUrl ? addressFromExplorerUrl(registryUrl) : null;
  const explorerBase = registryUrl ? explorerBaseFromUrl(registryUrl) : null;
  const [state, setState] = useState<
    { kind: "loading" } | { kind: "ok"; payoutUrl: string } | { kind: "unverified" }
  >({ kind: "loading" });

  useEffect(() => {
    let active = true;
    if (!registryAddr || !explorerBase) {
      setState({ kind: "unverified" });
      return;
    }
    setState({ kind: "loading" });
    void readSourceConfig(registryAddr, sourceId).then((r) => {
      if (!active) return;
      setState(
        r && r.active
          ? { kind: "ok", payoutUrl: `${explorerBase}/address/${r.payoutWallet}` }
          : { kind: "unverified" },
      );
    });
    return () => {
      active = false;
    };
  }, [sourceId, registryAddr, explorerBase]);

  // The RATE comes from the QUOTE (bps = sourcePayment / gross), never the registry.
  const pct = `${Number((BigInt(sourcePaymentRaw) * 10_000n) / BigInt(grossUsdcRaw)) / 100}%`;

  if (state.kind === "ok") {
    return (
      <div className="flex items-baseline justify-between gap-3 text-sm pb-3 mb-3 border-b border-border/40">
        <span className="text-muted-foreground">
          Paid to your referrer <span className="text-[11px] text-muted-foreground/70">{pct}</span>
        </span>
        <span className="flex items-baseline gap-3">
          <span className="tabular-nums text-foreground" data-testid="source-amount">
            −{formatRawUnits(sourcePaymentRaw, usdcDecimals)} USDC
          </span>
          <AddressProof url={state.payoutUrl} />
        </span>
      </div>
    );
  }
  return (
    <p
      className="text-xs text-muted-foreground pb-3 mb-3 border-b border-border/40"
      data-testid="text-source-proof-unavailable"
    >
      A source payment of {pct} applies to this quote. Its destination is{" "}
      {state.kind === "loading" ? "loading" : "not confirmed on-chain right now"} — reload to verify.
      No destination is shown unverified.
    </p>
  );
}

// The money path (C1.2a + C1.2b): the referrer payment (if any), then the NET sent
// to the company, split 70/20/10 to three wallets — each with its amount AND a
// verifiable destination. The buyer sees WHO is paid, HOW MUCH, and verifies it
// BEFORE signing. All-or-nothing on the proof links: no amount is shown without its
// verifiable destination (fail-closed). The buyer's OWN address is never shown (it
// answers "who am I", not "where does my money go"); the gifting-recipient case —
// recipient ≠ buyer — is C4.
function MoneyPath({
  netProtocolRaw,
  usdcDecimals,
  sourceId,
  grossUsdcRaw,
  sourcePaymentRaw,
}: {
  netProtocolRaw: string;
  usdcDecimals: number;
  sourceId: string | null;
  grossUsdcRaw: string;
  sourcePaymentRaw: string;
}) {
  const { data } = useGetProtocolVerifyLinks();
  const split = computeRoutingSplit(netProtocolRaw);
  const urlFor = (id: VerifyLinkId) => data?.links.find((l) => l.id === id)?.url ?? null;
  const vaultUrl = urlFor("vaultWallet");
  const liqUrl = urlFor("liquidityWallet");
  const opsUrl = urlFor("operationsWallet");
  const allProof = Boolean(vaultUrl && liqUrl && opsUrl);
  const hasSourcePayment =
    sourceId !== null && /^[0-9]+$/.test(sourcePaymentRaw) && BigInt(sourcePaymentRaw) > 0n;

  return (
    <div className="mt-4 border-t border-border/40 pt-4" data-testid="panel-money-path">
      {hasSourcePayment && sourceId ? (
        <SourcePaymentLine
          sourceId={sourceId}
          grossUsdcRaw={grossUsdcRaw}
          sourcePaymentRaw={sourcePaymentRaw}
          usdcDecimals={usdcDecimals}
          registryUrl={urlFor("sourceRegistry")}
        />
      ) : null}
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm font-medium text-foreground">Sent to the Syndicate</div>
        <div className="text-base font-medium text-foreground tabular-nums" data-testid="money-net">
          {formatRawUnits(netProtocolRaw, usdcDecimals)} USDC
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-0.5 mb-2.5 max-w-md">
        The membership money is the company's. It is split on-chain to three wallets, each
        verifiable. No member has a claim on it.
      </p>
      {allProof && split ? (
        <div className="space-y-1.5">
          {[
            { label: "Vault wallet", pct: "70%", raw: split.vaultRaw, url: vaultUrl! },
            { label: "Liquidity wallet", pct: "20%", raw: split.liquidityRaw, url: liqUrl! },
            { label: "Operations wallet", pct: "10%", raw: split.operationsRaw, url: opsUrl! },
          ].map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="text-muted-foreground">
                {r.label} <span className="text-[11px] text-muted-foreground/70">{r.pct}</span>
              </span>
              <span className="flex items-baseline gap-3">
                <span className="tabular-nums text-foreground">
                  {formatRawUnits(r.raw, usdcDecimals)} USDC
                </span>
                <AddressProof url={r.url} />
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground" data-testid="text-routing-proof-unavailable">
          On-chain split: 70% Vault · 20% Liquidity · 10% Operations. The live proof links are
          unavailable right now — reload to retry. No amount is shown without its verifiable
          destination.
        </p>
      )}
    </div>
  );
}

// The buyer-facing quote core (C1.1): what you pay · what you receive (SYN + the
// LIVE era rate, never a frozen card figure) · your seat (a preview — the real
// number is the receipt event) · the slippage floor. The routing breakdown
// (source payment + 70/20/10 with proof links) lands in C1.2. Figures are exact
// engine reads; the raw base-unit strings stay one click away (verify).
function QuotePanel({
  grossUsdcRaw,
  sourceId,
}: {
  grossUsdcRaw: string;
  sourceId: string | null;
}) {
  const params = sourceId
    ? { grossUsdc: grossUsdcRaw, sourceId }
    : { grossUsdc: grossUsdcRaw };
  const { data, isLoading, isError } = useGetJoinQuote(params, {
    query: { queryKey: getGetJoinQuoteQueryKey(params) },
  });

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="text-quote-loading">
        Reading your exact quote from the live engine…
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className="text-sm text-destructive" data-testid="text-quote-error">
        Quote read unavailable right now (possibly rate-limited) — nothing is
        assumed. Try again shortly.
      </p>
    );
  }
  if (!data.chainVerified || data.quote === null) {
    return (
      <p className="text-sm text-destructive" data-testid="text-quote-failed">
        The engine could not be read:{" "}
        {data.failureReason ?? "live quote unavailable"}. No value is invented
        in its place.
      </p>
    );
  }

  const q = toCheckoutQuote(data.quote);
  const floorRaw = computeMinSynOutRaw(q.synOutRaw);
  const sourceLine =
    data.sourceProvided && data.sourceValid === true
      ? "A verified introduction is applied to this quote."
      : data.sourceProvided
        ? "The introduction link is not valid or not active — this quote is computed without it."
        : "No introduction — a direct join.";

  return (
    <div className="animate-in fade-in duration-300" data-testid="panel-quote-result">
      <QuoteLine
        label="What you pay"
        primary={`${formatRawUnits(grossUsdcRaw, data.decimals.usdc)} USDC`}
        testId="quote-pay"
      />
      <QuoteLine
        label="What you receive"
        primary={`${formatRawUnits(q.synOutRaw, data.decimals.syn)} SYN`}
        sub={`Era ${q.era} · ${q.synPerUsdcRaw} SYN per $1 — read live from the engine, and it changes between eras.`}
        testId="quote-syn"
      />
      <QuoteLine
        label="Your seat"
        primary={`Seat #${formatRawUnits(q.seatIfFirstRaw, 0)}`}
        sub="If yours is the next join. The real number is set by the transaction receipt — never predicted here."
        testId="quote-seat"
      />
      {floorRaw !== null ? (
        <QuoteLine
          label="Slippage floor"
          primary={`≥ ${formatRawUnits(floorRaw, data.decimals.syn)} SYN`}
          sub="The least SYN a purchase would accept — it protects you if the era rate moves before you sign."
          testId="quote-floor"
        />
      ) : null}

      <MoneyPath
        netProtocolRaw={q.netProtocolRaw}
        usdcDecimals={data.decimals.usdc}
        sourceId={sourceId}
        grossUsdcRaw={grossUsdcRaw}
        sourcePaymentRaw={q.sourcePaymentRaw}
      />

      <p className="text-xs text-muted-foreground mt-4" data-testid="text-quote-source-line">
        {sourceLine}
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground">
          Exact raw base units — verify
        </summary>
        <div className="mt-2 space-y-1 font-mono text-[10px] text-muted-foreground break-all">
          <div>synOutRaw {q.synOutRaw}</div>
          <div>seatIfFirstRaw {q.seatIfFirstRaw}</div>
          <div>synPerUsdcRaw {q.synPerUsdcRaw}</div>
          <div>era {q.era}</div>
          {floorRaw !== null ? <div>minSynOut · 0.5% tolerance {floorRaw}</div> : null}
          <div className="pt-1 text-muted-foreground/70">
            Exact strings from the engine's public quote view · formatted values
            are client-side projections of the raw string · as of{" "}
            {new Date(data.asOf).toISOString().slice(0, 19).replace("T", " ")} UTC
          </div>
        </div>
      </details>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function JoinProtocol() {
  const search = useSearch();
  const sourceParam = new URLSearchParams(search).get("source");
  const attachSource =
    sourceParam !== null && isSourceIdFormat(sourceParam) ? sourceParam : null;

  const [amountInput, setAmountInput] = useState("");
  const [submittedRaw, setSubmittedRaw] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const requestQuote = (value?: string) => {
    const raw = usdcInputToRaw(value ?? amountInput);
    if (raw === null) {
      setSubmittedRaw(null);
      setInputError(
        "Enter a positive USDC amount with at most 6 decimal places (for example 100 or 250.50).",
      );
      return;
    }
    setInputError(null);
    setSubmittedRaw(raw);
  };

  // Selecting a featured amount fills the input and reads its quote in one act.
  const selectAmount = (amt: number) => {
    const s = String(amt);
    setAmountInput(s);
    requestQuote(s);
  };

  return (
    <PublicPage
      eyebrow="Membership"
      title="Take your seat"
      lead="Choose an amount, or enter your own. Every seat is equal — $5 and $10,000 buy the same seat. Read-only: nothing is signed or sent from this page."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      {/* C1.3 historical gate — blocks the (future) buy path for an unclaimed
          historical wallet; renders nothing for everyone else. */}
      <HistoricalGateSlot />

      {/* Optional verified-introduction attribution (?source=) */}
      {sourceParam !== null ? <IntroductionStatus sourceId={sourceParam} /> : null}

      {/* Exact quote calculator — live engine computation, raw base units */}
      <Card className="bg-card/40 border-border/50 p-6 mb-12" data-testid="panel-join-quote">
        {/* Featured amounts — AMOUNT ONLY: no names, badges, tiers, or bands.
            The seat is binary; every amount buys the same seat. */}
        <div className="mb-5">
          <p className="text-sm text-muted-foreground mb-3">Choose an amount</p>
          <div className="flex flex-wrap gap-2">
            {JOIN_AMOUNTS_USDC.map((amt) => {
              const active =
                submittedRaw !== null && usdcInputToRaw(String(amt)) === submittedRaw;
              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => selectAmount(amt)}
                  aria-pressed={active}
                  data-testid={`chip-amount-${amt}`}
                  className={`min-h-11 rounded-xl border px-4 text-sm font-medium tabular-nums transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-transparent text-foreground hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  ${amt.toLocaleString("en-US")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Or a custom amount */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-full max-w-[220px]">
            <Input
              inputMode="decimal"
              placeholder="Or enter your own (USDC)"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") requestQuote();
              }}
              data-testid="input-join-amount"
            />
          </div>
          <Button onClick={() => requestQuote()} data-testid="button-join-quote">
            Read my quote
          </Button>
        </div>
        {inputError ? (
          <p className="text-sm text-destructive mb-2" data-testid="text-quote-input-error">
            {inputError}
          </p>
        ) : null}

        {submittedRaw !== null ? (
          <div className="border-t border-border/50 pt-4 mt-4">
            <QuotePanel grossUsdcRaw={submittedRaw} sourceId={attachSource} />
          </div>
        ) : null}
      </Card>

      {/* HARD BOUNDARY — transaction sending deliberately not enabled */}
      <Card
        className="border-warning/30 bg-warning/5 p-6 mb-12"
        data-testid="panel-buy-readiness"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-md bg-warning/10 text-warning shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground mb-2">
              Not enabled here: sending the join transaction
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              This app never initiates, signs, or submits a transaction, and
              never asks you to send funds. The join itself is an on-chain USDC
              transaction from your own wallet, and that path is enabled only
              when the founder publishes it. Until then, everything on this
              page is a read of the live engine — nothing more.
            </p>
          </div>
        </div>
      </Card>

      {/* The live engine itself — same truth-labelled read as /status */}
      <h2 className="type-h2 text-foreground mb-2">
        The engine you would be joining
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
        Live read-only membership-sale state from the Avalanche C-Chain —
        lifecycle flags for every engine generation and the active engine's
        public figures as exact raw base units. Identical to the read on{" "}
        <Link href="/status" className="text-primary hover:underline">
          /status
        </Link>
        ; any value that cannot be verified renders as null with a reason.
      </p>
      <div className="mb-12">
        <ProtocolRealityPanel groups={["sale"]} />
      </div>

      <h2 className="text-base font-medium text-foreground mb-4">Next steps</h2>
      <div className="flex flex-wrap gap-3 mb-12">
        <Link href="/member">
          <Button>Read your standing (wallet sign-in)</Button>
        </Link>
        <Link href={ctas.buildLink.href}>
          <Button variant="outline">{ctas.buildLink.label}</Button>
        </Link>
        <Link href={ctas.viewStatus.href}>
          <Button variant="outline">{ctas.viewStatus.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
