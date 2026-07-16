// wallet/MemberYourSeat.tsx (build-time-gated wallet module)
//
// S7-b — THE IDENTITY BAND (founder art direction at the S7 seal, 2026-07-16:
// the connected state becomes a full-width dashboard; the giant hero card
// floating in a void dies). This is the dashboard's zone 1: a compact,
// full-width identity strip — sigil · Member #N · Seat Held · capital rung ·
// era/chapter meta on the left; the receipt chip + share + verify on the
// right. Reads the signed wallet's OWN standing (member-standing) + address;
// own-row only (ADR-003); every figure fail-closed. Reached via a lazy
// import from /member (guard-access-state rule 15: only App.tsx statically
// reaches @/wallet). The SYN balance moved to the KPI row (MemberKpiRow) —
// one figure, one home.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAccount } from "wagmi";
import { Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { MemberSigil } from "@/components/member/MemberSigil";
import { chapterForSeat } from "@/lib/chapters";
import { useOwnCapitalRung } from "./ownReads";
import {
  fetchMemberStanding,
  shortAddress,
  type MemberStandingReadback,
} from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

type Receipt = { transaction: string; explorerUrl: string };

type Status =
  | { kind: "checking" }
  | { kind: "signedOut" }
  | { kind: "member"; seat: string; era: string | null; receipt: Receipt | null }
  | { kind: "noSeat" }
  | { kind: "signedIn" }; // S4 but standing unreadable — never a fake seat

function classify(r: MemberStandingReadback | null): Status {
  if (r === null || r.state !== "S4") return { kind: "signedOut" };
  if (r.chainVerified && r.recognized === true && r.memberNumber !== null) {
    return { kind: "member", seat: r.memberNumber, era: r.era, receipt: r.receipt };
  }
  if (r.chainVerified && r.recognized === false) return { kind: "noSeat" };
  return { kind: "signedIn" };
}

/** Human era label — raw enums never reach the user (Genesis is the badge). */
function eraLabel(era: string | null): string | null {
  if (era === "PART_B_FREEZE_ROOT") return "Genesis";
  if (era === "V3_EMITTED") return "Member";
  return null;
}

export default function MemberYourSeat() {
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const [readNonce, setReadNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const { address } = useAccount();
  const rung = useOwnCapitalRung(status.kind === "member" ? status.seat : null);

  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchMemberStanding().then((r) => {
        if (active) setStatus(classify(r));
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, [readNonce]);

  function copyProof(url: string) {
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // Signed out: the page's door band owns this state (defense in depth here).
  if (status.kind === "signedOut") return null;

  // Still resolving: a calm honest line — never a fake seat.
  if (status.kind === "checking") {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-testid="member-your-seat-checking"
      >
        Reading your own record from the chain…
      </p>
    );
  }

  const seated = status.kind === "member";
  const chapter = seated ? chapterForSeat(status.seat) : null;

  return (
    <div
      className="rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/10 via-gold/5 to-transparent p-4 sm:p-5"
      data-testid="member-your-seat"
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {/* Left cluster — the identity. */}
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="shrink-0">
            <MemberSigil address={address ?? null} size={48} />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                {seated ? `Member #${status.seat}` : "Signed in"}
              </h1>
              {seated ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"
                  data-testid="seat-status-held"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                  Seat Held
                </span>
              ) : status.kind === "noSeat" ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"
                  data-testid="seat-status-none"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
                  No Seat Yet
                </span>
              ) : null}
              {/* The capital-axis rung: title only, from the canon walk —
                  recognition, never an amount, never a "next rung"
                  (anti-scarcity). Absent when not derivable. */}
              {seated && rung !== null ? (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-medium text-gold"
                  title="Your footprint on the capital axis — recognition on the public record, never revoked."
                  data-testid="seat-capital-rung"
                >
                  {rung}
                </span>
              ) : null}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              {address ? <span className="font-mono">{shortAddress(address)}</span> : null}
              {seated && eraLabel(status.era) ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-gold">{eraLabel(status.era)}</span>
                </>
              ) : null}
              {chapter ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span data-testid="text-seat-chapter">
                    Chapter {chapter.roman} · {chapter.name}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right cluster — proof in hand: the receipt chip + share + verify. */}
        {seated && status.receipt !== null ? (
          <div
            className="flex flex-wrap items-center gap-2"
            data-testid="text-standing-receipt"
          >
            <a
              href={status.receipt.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Your receipt — the on-chain purchase that established this seat. Yours to keep and to show; no one has to take your word."
              className="inline-flex items-center gap-1.5 rounded-md border border-gold/25 bg-gold/5 px-2.5 py-1.5 font-mono text-xs text-proof hover:underline"
              data-testid="link-standing-receipt"
            >
              <span className="font-mono text-xs uppercase tracking-wider text-gold">
                Receipt
              </span>
              {status.receipt.transaction.slice(0, 8)}…{status.receipt.transaction.slice(-4)}
              <ExternalLink className="h-3 w-3" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={() => copyProof(status.receipt!.explorerUrl)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
              data-testid="button-standing-receipt-share"
            >
              {copied ? (
                <Check className="h-3 w-3 text-proof" aria-hidden="true" />
              ) : (
                <Copy className="h-3 w-3" aria-hidden="true" />
              )}
              {copied ? "Copied" : "Share my proof"}
            </button>
            <VerifyOnChain ids={["membershipSaleV3"]} />
          </div>
        ) : null}
      </div>

      {status.kind === "signedIn" ? (
        <div className="mt-3" data-testid="text-standing-unreadable">
          <p className="text-sm text-muted-foreground">
            Your standing could not be read right now — nothing is assumed,
            nothing is invented.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setReadNonce((n) => n + 1)}
            data-testid="button-standing-retry"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
            Retry read
          </Button>
        </div>
      ) : null}

      {status.kind === "noSeat" ? (
        <div className="mt-3">
          <p className="text-sm text-muted-foreground">
            Your wallet is connected, but no seat is anchored to it.
          </p>
          <Link href="/join" className="mt-2 inline-flex">
            <Button
              size="sm"
              className="rounded-xl bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
            >
              Take your seat
            </Button>
          </Link>
        </div>
      ) : null}

      {/* The verify teaching (guard-pinned): human words FIRST, the machinery
          term only in parentheses for verifiers (Human-First Law; S7-e —
          founder-flagged: the old line read as a builder instruction). */}
      {seated ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Your seat is read live from the public engine — never assigned by
          hand. Anyone can verify it on-chain (the engine&apos;s own{" "}
          <code>memberNumberOf</code> record).
        </p>
      ) : null}
    </div>
  );
}
