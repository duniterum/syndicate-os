// SourceLinkBuilder — public /source: Verified Introduction link builder.
// ---------------------------------------------------------------------------
// Public Online Integration MVP (founder-approved). Read-only end to end:
//   - an introduction id (bytes32) is validated against the on-chain source
//     registry via the server's read-only validate endpoint (the server never
//     echoes the id back — the id in the built link is client-side input);
//   - a valid, ACTIVE introduction yields a shareable attribution link to
//     /join?source=<id>; nothing is created, activated, or written here —
//     source creation and activation are owner-only on-chain acts;
//   - the live registry linkage renders through the shared
//     ProtocolRealityPanel (same truth-labelling as /status).

import { useState } from "react";
import { Link } from "wouter";
import { Check, Copy, Link2, Network } from "lucide-react";
import {
  getGetSourceValidateQueryKey,
  useGetSourceValidate,
} from "@workspace/api-client-react";
import { PublicPage } from "@/components/PublicPage";
import { ProtocolRealityPanel } from "@/components/ProtocolReality";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/field/Field";
import { isSourceIdFormat } from "@/lib/rawUnits";
import { ctas } from "@/config/sharedCopy";

function ValidationResult({ sourceId }: { sourceId: string }) {
  const { data, isLoading, isError } = useGetSourceValidate(
    { sourceId },
    { query: { queryKey: getGetSourceValidateQueryKey({ sourceId }) } },
  );
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="text-validate-loading">
        Validating against the on-chain registry…
      </p>
    );
  }
  if (isError || !data) {
    return (
      <p className="text-sm text-destructive" data-testid="text-validate-error">
        Validation unavailable right now (possibly rate-limited) — nothing is
        assumed. Try again shortly.
      </p>
    );
  }
  if (!data.chainVerified) {
    return (
      <p className="text-sm text-destructive" data-testid="text-validate-failed">
        The registry could not be read:{" "}
        {data.failureReason ?? "live read unavailable"}. No result is invented
        in its place.
      </p>
    );
  }
  if (data.exists === false) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="text-validate-notfound">
        This introduction id is not registered on-chain. Only the protocol
        owner can register a source — nothing can be created from this page.
      </p>
    );
  }
  if (data.exists === true && data.active === false) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="text-validate-inactive">
        Registered but not active on-chain. Activation is an owner-side on-chain
        act; until then this id carries no attribution.
      </p>
    );
  }
  if (data.exists === true && data.active === true) {
    const link = `${window.location.origin}/join?source=${sourceId}`;
    const copy = async () => {
      try {
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable — the link is still shown as text below.
      }
    };
    return (
      <div data-testid="panel-validate-active">
        <p className="text-sm text-foreground mb-3">
          Verified introduction recognized — registered and active on-chain. The
          link you build carries this introduction id; whether a join records
          that attribution is an on-chain step that is not active yet.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <code className="font-mono text-xs bg-muted/60 border border-border/50 rounded px-3 py-2 break-all" data-testid="text-attribution-link">
            {link}
          </code>
          <Button variant="outline" size="sm" onClick={copy} data-testid="button-copy-link">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? "Copied" : "Copy link"}
          </Button>
        </div>
      </div>
    );
  }
  return (
    <p className="text-sm text-destructive" data-testid="text-validate-unknown">
      Introduction state could not be read: {data.failureReason ?? "unknown"}.
    </p>
  );
}

export default function SourceLinkBuilder() {
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  const validate = () => {
    const trimmed = input.trim();
    if (!isSourceIdFormat(trimmed)) {
      setSubmitted(null);
      setInputError(
        "An introduction id is a bytes32 hex value: 0x followed by exactly 64 hex characters.",
      );
      return;
    }
    setInputError(null);
    setSubmitted(trimmed);
  };

  return (
    <PublicPage
      eyebrow="Referral"
      title="Build your referral link"
      lead="Validate your referral code against the on-chain registry and build a shareable join link — read-only. Nothing is created, activated, or written from this page."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      {/* How referrals work — honest framing (program ACTIVE since 2026-07-13) */}
      <Card className="bg-primary/5 border-primary/20 p-6 mb-12">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-md bg-primary/10 text-primary shrink-0">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground mb-2">
              A referral is an on-chain fact
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Referral codes (the protocol calls them sources) live in the
              on-chain registry. Only the protocol owner can register one, and
              only the owner can activate it. Under the active terms, an
              eligible completed introduction pays a bounded commission to the
              introducer's wallet inside the buyer's own transaction — shown by
              receipt, never a promise. This page can only read the registry:
              paste your code below to check it and, if it is active, build
              your link.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mt-2">
              New here?{" "}
              <Link href={ctas.exploreSource.href} className="text-primary hover:underline">
                How attribution works
              </Link>{" "}
              explains verified introductions in full — this page is the
              read-only tool.
            </p>
          </div>
        </div>
      </Card>

      {/* Validate + build */}
      <Card className="bg-card/40 border-border/50 p-6 mb-12" data-testid="panel-link-builder">
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 rounded-md bg-primary/10 text-primary shrink-0">
            <Link2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground">
              Check an introduction id
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1 max-w-2xl">
              The id is validated server-side against the live registry and is
              never echoed back or logged. The link you build carries the id
              you pasted — share it only if it is yours to share.
            </p>
          </div>
        </div>

        <Field
          label="Introduction id"
          help="A bytes32 hex value: 0x followed by exactly 64 hex characters."
          error={inputError}
          placeholder="0x… introduction id (bytes32)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") validate();
          }}
          className="font-mono"
          fieldClassName="max-w-[420px] mb-3"
          data-testid="input-source-id"
        />
        <Button onClick={validate} data-testid="button-validate-source">
          Validate read-only
        </Button>

        {submitted !== null ? (
          <div className="border-t border-border/50 pt-4 mt-4">
            <ValidationResult sourceId={submitted} />
          </div>
        ) : null}
      </Card>

      {/* Live registry linkage — same truth-labelled read as /status */}
      <h2 className="type-h2 text-foreground mb-2">
        The registry behind this page
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
        Live read-only linkage between the active engine and the source
        registry. Identical to the read on{" "}
        <Link href="/status" className="text-primary hover:underline">
          /status
        </Link>
        ; any value that cannot be verified renders as null with a reason.
      </p>
      <div className="mb-12">
        <ProtocolRealityPanel groups={["source"]} />
      </div>

      <h2 className="text-base font-medium text-foreground mb-4">Next steps</h2>
      <div className="flex flex-wrap gap-3 mb-12">
        <Link href={ctas.requestSeat.href}>
          <Button>{ctas.requestSeat.label}</Button>
        </Link>
        <Link href={ctas.exploreSource.href}>
          <Button variant="outline">{ctas.exploreSource.label}</Button>
        </Link>
        <Link href={ctas.viewStatus.href}>
          <Button variant="outline">{ctas.viewStatus.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
