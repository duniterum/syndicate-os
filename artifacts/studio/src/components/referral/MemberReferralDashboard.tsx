// components/referral/MemberReferralDashboard.tsx
//
// The member-facing referral dashboard — REAL figures only (S7 truth sweep,
// 2026-07-16). The program is ACTIVE (LIVE_ACTION, founder 2026-07-13) and
// the R5 introduction indexer is live: every figure rendered here is the
// signed wallet's OWN indexed standing (counts, commission paid, escrow,
// ladder progress) plus live registry reads — never a sample. The old
// paused-era SAMPLE blocks (fake summary/trend/history dollars) died with
// the sweep; the one honestly-not-served piece — per-receipt introduction
// rows — renders as a labeled coming-soon card, never a fake figure.

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { ladderProgress } from "@/config/connectorLadder";
import { payingSourceId } from "@/lib/sourceIdentity";
import { readSourceConfig } from "@/lib/chainReads";
import { Copy, Check, Link2, ShieldCheck, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/stat-card/StatCard";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { ShareCard } from "@/components/referral/ShareCard";
import { ShareMenu } from "@/components/referral/ShareMenu";
import { QrCodeBlock } from "@/components/referral/QrCodeBlock";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { referralProgram } from "@/config/referralProgram";

// R5 — the signed wallet's OWN indexed introduction standing (counts from the
// introduction snapshot + live registry existence), fetched through the
// gated wallet module via a runtime dynamic import (guard rule 15). Null =
// not loaded / no session / read failed → the section renders its honest
// sign-in state; a figure only ever comes from the readback.
type StandingReadback = import("@/wallet/walletSession").SourceStandingReadback;

function useOwnSourceStanding(): StandingReadback | null {
  const [standing, setStanding] = useState<StandingReadback | null>(null);
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;
    // Re-read on session changes (S7): the member connects on the door band
    // and this section resolves in place — no reload needed.
    void Promise.all([
      import("@/wallet/walletSession"),
      import("@/wallet/sessionEvents"),
    ]).then(([ws, ev]) => {
      if (!active) return;
      const read = () => {
        void ws.fetchSourceStanding().then((r) => {
          if (active) setStanding(r);
        });
      };
      read();
      window.addEventListener(ev.SESSION_CHANGED_EVENT, read);
      cleanup = () => window.removeEventListener(ev.SESSION_CHANGED_EVENT, read);
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, []);
  return standing;
}

/**
 * S7-e — server diagnostics never reach a member verbatim (Human-First Law):
 * known reasons get their human sentence; anything else gets the honest
 * generic. The exact reason stays available to verifiers via the tooltip.
 */
function humanReadFailure(reason: string | null | undefined): string | null {
  if (!reason) return null;
  if (reason.includes("no on-chain referral source")) {
    return "No referral source exists for this wallet yet — a new source is a founder-signed on-chain act.";
  }
  return "The live read didn't answer just now — nothing is assumed, nothing is invented. Try again in a moment.";
}

function usd(raw: string): string {
  const n = BigInt(raw);
  const whole = n / 1_000_000n;
  const cents = ((n % 1_000_000n) / 10_000n).toString().padStart(2, "0");
  return `$${whole}.${cents}`;
}

// The indexed standing + the Connector ladder progress. The four figures are
// REAL (the R5 snapshot + live escrow read, labeled as-of block); the bar is
// never empty (the pinned UI law); the summit stays a road, not a promise.
function IntroductionStanding({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;
  if (readback === null || s === null) {
    // Three DISTINCT honest states (S7-b — the founder's screenshot caught
    // "Sign in required" shown to a SIGNED-IN member whose wallet simply has
    // no source yet; a badge must never claim the wrong reason):
    //   · signed in, no source/standing → no badge; the failureReason says it
    //   · signed out (S1)               → "Sign in required"
    //   · read failed / not loaded      → honest unavailable, nothing assumed
    const signedIn = readback?.state === "S4";
    return (
      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">Your introduction standing</span>
          {readback !== null && !signedIn ? (
            <LifecycleBadge lifecycle="AUTH_REQUIRED" />
          ) : null}
        </div>
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          title={readback?.failureReason ?? undefined}
        >
          {signedIn
            ? (humanReadFailure(readback?.failureReason) ??
              "No referral standing exists for this wallet yet — a new source is a founder-signed on-chain act.")
            : readback !== null
              ? "The standing read is live — sign in with your wallet to see your own. No figure is shown without the read."
              : "The standing read is unavailable right now — nothing is assumed, nothing is invented."}
        </p>
      </Card>
    );
  }
  const p = ladderProgress(s.durableIntroductions);
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm font-medium text-foreground">Your introduction standing</span>
        <span className="font-mono text-xs text-muted-foreground">
          recorded up to block {s.asOfBlock.toLocaleString("en-US")}
        </span>
      </div>
      {/* D-TRUTH D2: when the standing resolved through the founder-signed
          fallback, say so — these figures belong to that source, not to the
          wallet's canonical link (which the link card derives separately). */}
      {readback?.sourceOrigin === "founder-signed" ? (
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          These figures are the record of your founder-signed source — the
          source whose commission is paid to this wallet. The referral-link
          card shows your wallet&apos;s canonical link, which is its own
          separate source.
        </p>
      ) : null}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Introductions">{String(s.introducedMembers)}</StatCard>
        <StatCard label="Durable introductions">{String(s.durableIntroductions)}</StatCard>
        <StatCard label="Commission paid">{usd(s.commissionPaidRaw)}</StatCard>
        <StatCard label="Held in escrow">{usd(s.escrowOwedRaw)}</StatCard>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="text-foreground/90">
            {p.current.title} · {p.current.bps / 100}%
          </span>
          {p.next ? (
            <span className="text-muted-foreground">
              {p.next.raisesRate
                ? `Next: ${p.next.title} at ${p.next.durableThreshold} durable introductions — the rate rises to ${p.next.bps / 100}%`
                : `Next: ${p.next.title} at ${p.next.durableThreshold} durable introductions — a recognition title; the rate stays`}
            </span>
          ) : (
            <span className="text-muted-foreground">the summit — the on-chain cap</span>
          )}
        </div>
        <div
          className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden"
          role="progressbar"
          aria-label="Progress to the next Connector rung"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={p.ratio}
        >
          <div className="h-full rounded-full bg-primary/70" style={{ width: `${p.ratio * 100}%` }} />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A durable introduction is an introduced member whose wallet still holds SYN.
          The threshold decides a promotion; the founder&apos;s signature executes it.
          An acquired rate never decreases.
        </p>
        {/* FOUNDER RULE (simple + transparency): the waiting between the
            threshold crossing and the signature is VISIBLE and DATED — never
            compensated. The public SourceTermsUpdated event dates the raise. */}
        {s.promotionDue ? (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5 mt-1">
            <p className="text-xs text-foreground font-medium">
              Promotion due — awaiting founder signature: {s.entitledTitle} ·{" "}
              {s.entitledBps / 100}%
              {s.crossedAtDateUtc ? ` (threshold crossed ${s.crossedAtDateUtc})` : ""}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              The new rate applies from its on-chain recording; it is never
              retroactive. The signing is a public on-chain event — the raise is
              dated for everyone to verify.
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

// The §11-2b card implementation: permanent derived link + live two-state
// honesty + copy/QR/share, all wired to the REAL link (the sample is gone).
function MyReferralLinkCard({ readback }: { readback: StandingReadback | null }) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  // Live registry state for the derived source: true=ACTIVE · false=known but
  // not active OR not created yet · null=read unavailable (fail closed — the
  // permanence statement stands; no activity claim is made).
  const [active, setActive] = useState<boolean | null>(null);
  const { data: verifyData } = useGetProtocolVerifyLinks();
  const registryUrl =
    verifyData?.links?.find((l) => l.id === "sourceRegistry")?.url ?? null;
  const registryAddr = registryUrl
    ? (registryUrl.match(/\/address\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null)
    : null;
  // Ruling ① (2026-07-16): advertise the source that PAYS this wallet —
  // the server-resolved id first, canonical derivation as the fallback.
  const founderSigned = readback?.sourceOrigin === "founder-signed";
  const sourceId = payingSourceId(readback?.sourceIdHex, address);
  const link = sourceId ? `https://thesyndicate.money/join?source=${sourceId}` : null;

  useEffect(() => {
    let alive = true;
    setActive(null);
    if (!registryAddr || !sourceId) return;
    void readSourceConfig(registryAddr, sourceId).then((r) => {
      if (alive) setActive(r === null ? null : r.active);
    });
    return () => {
      alive = false;
    };
  }, [registryAddr, sourceId]);

  function copyLink() {
    if (!link) return;
    void navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Your referral link</span>
        {active === true ? (
          <StatusPill tone="proof" size="xs">Source active</StatusPill>
        ) : null}
      </div>
      {link ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input readOnly value={link} className="font-mono text-xs" data-testid="input-my-referral-link" />
            <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
              {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed" data-testid="text-link-state">
            {active === true
              ? founderSigned
                ? "This is your founder-signed source's link — the source whose commission is paid to this wallet, ACTIVE inside the buyer's own transaction."
                : "Your source is ACTIVE — the commission is paid inside the buyer's own transaction, live."
              : founderSigned
                ? "This is your founder-signed source's link — the source whose commission is paid to this wallet."
                : "Your link is permanent — derived from your wallet, it never changes. The commission activates when your source is founder-signed."}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => setShowQr((v) => !v)}>
              <QrCode className="h-4 w-4 mr-1.5" />
              Get QR code
            </Button>
            <ShareMenu url={link} text="Join The Syndicate with my verified introduction." />
          </div>
          {showQr ? (
            <div className="mt-4 pt-4 border-t border-border/50">
              <QrCodeBlock value={link} />
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connect and sign in with your wallet to derive your permanent referral
          link. It exists before anyone signs anything — one wallet, one link,
          forever.
        </p>
      )}
    </Card>
  );
}

export function MemberReferralDashboard() {
  const readback = useOwnSourceStanding();
  const { address } = useAccount();
  const s = readback?.standing ?? null;
  // Ruling ① (2026-07-16): the share card carries the SAME paying-source
  // link as the link card — one resolver, zero drift between surfaces.
  const sourceId = payingSourceId(readback?.sourceIdHex, address);
  const shareLink = sourceId
    ? `https://thesyndicate.money/join?source=${sourceId}`
    : null;

  return (
    <div>
      <div className="mt-8 mb-2 flex flex-wrap items-center gap-3">
        <h3 className="text-base font-medium text-foreground">Your referral</h3>
        <LifecycleBadge lifecycle={referralProgram.lifecycle} />
      </div>

      <Card className="bg-primary/5 border-primary/30 p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-0.5">{referralProgram.statusCopy.status}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every figure below is your own — indexed introductions and live
              registry reads, only ever your own row. Never a sample.
            </p>
          </div>
        </div>
      </Card>

      {/* R5 — the OWN indexed standing + Connector ladder progress (real). */}
      <IntroductionStanding readback={readback} />

      {/* Shareable verified-introducer card — REAL figures from the standing
          above + the member's real link; renders only when the standing read
          answered (never a sample, never a fake dollar). */}
      {s !== null && shareLink !== null ? (
        <ShareCard
          introduced={s.introducedMembers}
          commissionPaidUsd={s.commissionPaidRaw !== "0" ? usd(s.commissionPaidRaw) : null}
          link={shareLink}
        />
      ) : null}

      {/* THE REFERRAL LINK CARD (§11 slot 2b) — REAL, replacing the sample:
          the member's PERMANENT link, derived from their wallet (SPEC §③ —
          the sourceId never changes; the emitter will compute the same).
          TWO honest states, read live from the registry:
            ACTIVE      → the commission is paid inside the buyer's own tx;
            not signed  → the link is permanent; commission activates when the
                          source is founder-signed. Same link forever. */}
      <MyReferralLinkCard readback={readback} />

      {/* Per-receipt introduction history — the ONE genuinely-not-served
          piece, said honestly (the counts above are already indexed and
          live). Never a fake table, never a sample dollar (S7 truth sweep). */}
      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Per-introduction receipts</span>
          <LifecycleBadge lifecycle="PENDING_ADAPTER" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Receipt-backed proof of each individual introduction — the
          per-receipt history arrives with row-level serving. Your counts
          above are already indexed and live.
        </p>
      </Card>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{referralProgram.boundaryLine}</p>
    </div>
  );
}
