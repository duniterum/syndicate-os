// pages/ReferralTerms.tsx — THE PROGRAM TERMS' DESIGNED HOME (/referral-terms).
//
// The founder's live-prod catch (2026-08-03): the member referral program's
// terms are a hash-anchored plain document (its keccak256 is every member
// source's on-chain metadataHash) — served raw, with no designed home and no
// footer door. This page is the SHELL around THE document, never a second
// copy: the body is FETCHED from the served file (TERMS_PATH — the one
// authority) and rendered verbatim; the live keccak256 commitment + its
// on-chain verify door ride above it (TermsCommitmentHash — the same
// mechanic /referral carries). A retyped body would drift from the anchored
// bytes; guard-referral-terms forbids it.

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { PublicPage } from "@/components/PublicPage";
import { Button } from "@/components/ui/button";
import { TermsCommitmentHash } from "@/components/referral/TermsCommitmentHash";
import { TERMS_PATH } from "@/lib/termsDocument";

type DocState =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ok"; text: string };

export default function ReferralTerms() {
  const [doc, setDoc] = useState<DocState>({ kind: "loading" });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    void fetch(TERMS_PATH)
      .then((r) => (r.ok ? r.text() : null))
      .then((text) => {
        if (!active) return;
        setDoc(text !== null ? { kind: "ok", text } : { kind: "error" });
      })
      .catch(() => {
        if (active) setDoc({ kind: "error" });
      });
    return () => {
      active = false;
    };
  }, [nonce]);

  return (
    <PublicPage
      eyebrow="Legal"
      title="Member referral program terms"
      lead="The program's governing document, exactly as served. Its digital fingerprint (keccak256) is recorded on-chain as every member referral source's terms fingerprint — anyone can verify that what they read here is what the chain committed to."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
      variant="app"
    >
      {/* The commitment spine: the live hash computed from the served bytes,
          the on-chain verify door, and the raw file itself. */}
      <Card className="border-border/50 bg-card/40 p-5 mb-8" data-testid="panel-terms-commitment">
        <p className="text-sm leading-relaxed text-muted-foreground measure">
          The document below is fetched from its canonical file as you read
          this; the fingerprint under it is computed from those exact bytes.
        </p>
        <TermsCommitmentHash />
        <a
          href={TERMS_PATH}
          className="mt-3 inline-flex min-h-11 items-center rounded-sm text-sm text-proof transition-colors hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-testid="link-terms-raw-file"
        >
          The canonical file (plain text, v1)
        </a>
      </Card>

      {/* THE DOCUMENT — fetched, verbatim, honest states. */}
      {doc.kind === "loading" ? (
        <p className="text-sm text-muted-foreground" data-testid="terms-loading">
          Reading the served document…
        </p>
      ) : doc.kind === "error" ? (
        <div data-testid="terms-error">
          <p className="text-sm text-muted-foreground measure">
            The document could not be read just now — nothing is shown rather
            than something retyped.
          </p>
          <Button variant="outline" className="mt-3" onClick={() => setNonce((n) => n + 1)}>
            Try again
          </Button>
        </div>
      ) : (
        <Card className="border-border/50 bg-card/40 p-6 mb-12" data-testid="terms-document">
          <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-foreground">
            {doc.text}
          </pre>
        </Card>
      )}
    </PublicPage>
  );
}
