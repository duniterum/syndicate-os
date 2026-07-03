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

import { useState } from "react";
import { Link, useSearch } from "wouter";
import { Calculator, Link2, ShieldAlert } from "lucide-react";
import {
  getGetJoinQuoteQueryKey,
  getGetSourceValidateQueryKey,
  useGetJoinQuote,
  useGetSourceValidate,
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
import { ctas } from "@/config/sharedCopy";

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

function QuoteRow({
  label,
  wireKey,
  raw,
  decimals,
}: {
  label: string;
  wireKey: string;
  raw: string;
  decimals: number | null;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-border/40 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="font-mono text-[10px] text-muted-foreground">{wireKey}</div>
      </div>
      <div className="text-right shrink-0">
        {decimals !== null ? (
          <div className="text-sm text-foreground tabular-nums">
            {formatRawUnits(raw, decimals)}
          </div>
        ) : null}
        <div className="font-mono text-[10px] text-muted-foreground break-all">
          raw {raw}
        </div>
      </div>
    </div>
  );
}

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
        Reading your exact quote from the active engine…
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

  const q = data.quote;
  const sourceLine =
    data.sourceProvided && data.sourceValid === true
      ? "Computed with the provided verified introduction applied."
      : data.sourceProvided
        ? "The provided introduction is not valid or not active — computed without attribution."
        : "Computed without an introduction (a direct join is allowed).";

  return (
    <div data-testid="panel-quote-result">
      <div className="mb-1">
        <QuoteRow
          label={`SYN allocated for ${formatRawUnits(grossUsdcRaw, data.decimals.usdc)} USDC`}
          wireKey="synOutRaw"
          raw={q.synOutRaw}
          decimals={data.decimals.syn}
        />
        <QuoteRow
          label="Seat number if yours is the next join"
          wireKey="seatIfFirstRaw"
          raw={q.seatIfFirstRaw}
          decimals={0}
        />
        <QuoteRow
          label="Member acquisition routing (USDC)"
          wireKey="acquisitionCostRaw"
          raw={q.acquisitionCostRaw}
          decimals={data.decimals.usdc}
        />
        <QuoteRow
          label="Protocol treasury routing (USDC)"
          wireKey="protocolContributionRaw"
          raw={q.protocolContributionRaw}
          decimals={data.decimals.usdc}
        />
        <QuoteRow
          label="Engine rate figure (exact, uninterpreted)"
          wireKey="synPerUsdcRaw"
          raw={q.synPerUsdcRaw}
          decimals={null}
        />
        <QuoteRow label="Engine era" wireKey="era" raw={String(q.era)} decimals={null} />
      </div>
      <p className="text-xs text-muted-foreground mt-3" data-testid="text-quote-source-line">
        {sourceLine}
      </p>
      <p className="font-mono text-[10px] text-muted-foreground mt-2">
        Exact raw base-unit strings from the engine's public quote view ·
        formatted values are client-side projections of the raw string · as of{" "}
        {new Date(data.asOf).toISOString().slice(0, 19).replace("T", " ")} UTC
      </p>
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

  const requestQuote = () => {
    const raw = usdcInputToRaw(amountInput);
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

  return (
    <PublicPage
      eyebrow="Membership"
      title="Join the protocol"
      lead="This page reads the live membership engine and computes your exact join quote — read-only. No transaction is initiated, signed, or submitted from this app."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      {/* Optional verified-introduction attribution (?source=) */}
      {sourceParam !== null ? <IntroductionStatus sourceId={sourceParam} /> : null}

      {/* Exact quote calculator — live engine computation, raw base units */}
      <Card className="bg-card/40 border-border/50 p-6 mb-12" data-testid="panel-join-quote">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 rounded-md bg-primary/10 text-primary shrink-0">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              Your exact quote
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1 max-w-2xl">
              Enter a USDC membership size and the active engine computes the
              exact allocation and routing — the same public quote view any
              on-chain reader sees. Figures are surfaced as exact raw
              base-unit strings, never rounded.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-3 mb-2">
          <div className="w-full max-w-[220px]">
            <Input
              inputMode="decimal"
              placeholder="USDC amount (e.g. 100)"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") requestQuote();
              }}
              data-testid="input-join-amount"
            />
          </div>
          <Button onClick={requestQuote} data-testid="button-join-quote">
            Compute exact quote
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
        className="border-amber-500/30 bg-amber-500/5 p-6 mb-12"
        data-testid="panel-buy-readiness"
      >
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
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
      <h2 className="text-xl font-light tracking-tight text-foreground mb-2">
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
