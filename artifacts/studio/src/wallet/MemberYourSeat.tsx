// wallet/MemberYourSeat.tsx (build-time-gated wallet module)
//
// S7 — THE "YOUR SEAT" HERO (founder-approved wireframe, 2026-07-15): the
// identity strip GREW into the member state's page hero. Reads the signed
// wallet's OWN standing (member-standing) + its own address, and makes the
// SEAT the headline. Honest states only — no invented seat; own-row only
// (ADR-003). Reached via a lazy import from /member (guard-access-state
// rule 15: only App.tsx statically reaches @/wallet).
//
// Carries (each fail-closed, absent when unreadable — never stale, never
// invented):
//   · sigil · Member #N · Seat Held / No Seat Yet · short address
//   · the seat's capital-axis RUNG (S7): title only, read from the server's
//     canon walk via lib/capitalStanding — recognition, never an amount,
//     never a next-rung shape (the anti-scarcity pin);
//   · era + Chapter line (lib/chapters) · live SYN balance (verify-links
//     token address, never hardcoded);
//   · the RECEIPT + "Share my proof" (one receipt surface, zero twins);
//   · the verify teaching folded in from the retired session panel: the
//     engine's own memberNumberOf answers for the seat.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAccount } from "wagmi";
import { Check, Copy, ExternalLink, RefreshCw } from "lucide-react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { MemberSigil } from "@/components/member/MemberSigil";
import { readTokenBalance } from "@/lib/chainReads";
import { formatRawUnits } from "@/lib/rawUnits";
import { chapterForSeat } from "@/lib/chapters";
import { fetchCapitalRung } from "@/lib/capitalStanding";
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

/** Token address out of a verify-links explorer URL (token or address form). */
function addressFromUrl(url: string): string | null {
  return url.match(/\/(?:token|address)\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}

/**
 * The wallet's OWN live SYN balance. Fail closed to null on any failure —
 * the line simply does not render; a figure is never invented or cached
 * stale. Token address comes from the server's verify-links (synToken).
 */
function useOwnSynBalance(wallet: string | undefined): string | null {
  const { data } = useGetProtocolVerifyLinks();
  const tokenUrl = data?.links?.find((l) => l.id === "synToken")?.url ?? null;
  const tokenAddr = tokenUrl ? addressFromUrl(tokenUrl) : null;
  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setBalance(null);
    if (!wallet || !tokenAddr) return;
    void readTokenBalance(tokenAddr, wallet).then((raw) => {
      if (active && raw !== null) setBalance(formatRawUnits(raw.toString(), 18));
    });
    return () => {
      active = false;
    };
  }, [wallet, tokenAddr]);
  return balance;
}

/**
 * S7: the seat's OWN capital-axis rung — the server's canon walk, title only.
 * Fail closed to null (no line); a rung is never invented.
 */
function useOwnCapitalRung(seat: string | null): string | null {
  const [rung, setRung] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setRung(null);
    if (seat === null) return;
    void fetchCapitalRung(seat).then((r) => {
      if (active && r !== null) setRung(r);
    });
    return () => {
      active = false;
    };
  }, [seat]);
  return rung;
}

export default function MemberYourSeat() {
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const [readNonce, setReadNonce] = useState(0);
  const [copied, setCopied] = useState(false);
  const { address } = useAccount();
  const synBalance = useOwnSynBalance(address);
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

  // Still resolving: a calm honest line — never a fake seat, never a spinner
  // pretending to know.
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
      className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent p-6 sm:p-8"
      data-testid="member-your-seat"
    >
      <div className="flex items-start gap-5">
        <span className="shrink-0">
          <MemberSigil address={address ?? null} size={72} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
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
            {/* S7 — the capital-axis rung: title only, read from the canon
                walk; recognition on the public record, never an amount,
                never a "next rung" (anti-scarcity). Absent when unreadable. */}
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

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
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
            {synBalance !== null ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono" data-testid="text-seat-syn-balance">
                  {synBalance} SYN
                </span>
              </>
            ) : null}
          </div>

          {status.kind === "signedIn" ? (
            <div className="mt-4" data-testid="text-standing-unreadable">
              <p className="text-sm text-muted-foreground">
                Your standing could not be read right now — nothing is assumed,
                nothing is invented.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setReadNonce((n) => n + 1)}
                data-testid="button-standing-retry"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" aria-hidden="true" />
                Retry read
              </Button>
            </div>
          ) : null}

          {status.kind === "noSeat" ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Your wallet is connected, but no seat is anchored to it.
              </p>
              <Link href="/join" className="mt-3 inline-flex">
                <Button
                  size="sm"
                  className="rounded-xl bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
                >
                  Take your seat
                </Button>
              </Link>
            </div>
          ) : null}

          {seated ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your seat is recognized on-chain — read live, never assigned by
              hand. This is your Member Home.
            </p>
          ) : null}

          {/* The member's OWN receipt (one receipt surface, zero twins).
              Own-row, canonical explorer URL, fail-closed: absent receipt
              never degrades the standing. */}
          {seated && status.receipt !== null ? (
            <div
              className="mt-4 rounded-md border border-gold/25 bg-gold/5 p-3"
              data-testid="text-standing-receipt"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-gold">
                Your receipt — proof this seat is real
              </p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">
                Seat #{status.seat} was established by this on-chain purchase.
                It&apos;s yours to keep and to show — no one has to take your word.
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <a
                  href={status.receipt.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open your membership receipt on the block explorer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-proof hover:underline"
                  data-testid="link-standing-receipt"
                >
                  {status.receipt.transaction.slice(0, 10)}…{status.receipt.transaction.slice(-6)}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => copyProof(status.receipt!.explorerUrl)}
                  className="inline-flex items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-gold/40 hover:text-foreground"
                  data-testid="button-standing-receipt-share"
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-proof" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3 w-3" aria-hidden="true" />
                  )}
                  {copied ? "Copied" : "Share my proof"}
                </button>
              </div>
            </div>
          ) : null}

          {/* Verify teaching (folded in from the retired session panel): the
              engine itself answers for the seat — anyone can check. */}
          {seated ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <VerifyOnChain ids={["membershipSaleV3"]} />
              <p className="font-mono text-[10px] text-muted-foreground">
                Verify it yourself: the engine&apos;s own record answers for
                your seat — call <code>memberNumberOf</code> with your address.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
