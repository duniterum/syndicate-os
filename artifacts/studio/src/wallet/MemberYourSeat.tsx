// wallet/MemberYourSeat.tsx (build-time-gated wallet module)
//
// Member Home §4 block 1 — the "Your Seat" identity strip. Reads the signed
// wallet's OWN standing (member-standing) + its own address, and makes the SEAT
// STATUS the headline (green "Seat Held" / amber "No Seat Yet"), never a tab.
// Honest states only — no invented seat; own-row only (ADR-003). Reached via a
// lazy import from /member (guard-access-state rule 15: only App.tsx statically
// reaches @/wallet).
//
// MEMBER SHELL slice (§4 block 4 fold-ins):
//   · the RECEIPT + "Share my proof" MOVED here from WalletSessionPanel
//     (moved, not rebuilt — one receipt surface, zero twins);
//   · live SYN balanceOf rendered (LIVE-PRODUCTION rule: readable → rendered;
//     token address from the server's verify-links, never hardcoded; fail
//     closed → no figure, never a stale one);
//   · the Chapter line from lib/chapters.ts (recognition only — "when you
//     joined the story", never a rank or a benefit).

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAccount } from "wagmi";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { MemberSigil } from "@/components/member/MemberSigil";
import { readTokenBalance } from "@/lib/chainReads";
import { formatRawUnits } from "@/lib/rawUnits";
import { chapterForSeat } from "@/lib/chapters";
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

export default function MemberYourSeat() {
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const [copied, setCopied] = useState(false);
  const { address } = useAccount();
  const synBalance = useOwnSynBalance(address);

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
  }, []);

  function copyProof(url: string) {
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  // Signed-out / still checking: the page's own connect flow handles it.
  if (status.kind === "checking" || status.kind === "signedOut") return null;

  const seated = status.kind === "member";
  const chapter = seated ? chapterForSeat(status.seat) : null;

  return (
    <div
      className="rounded-2xl border border-gold/25 bg-gold/5 p-5 sm:p-6"
      data-testid="member-your-seat"
    >
      <div className="flex items-start gap-4">
        <span className="shrink-0">
          <MemberSigil address={address ?? null} size={56} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">
              {seated ? `Member #${status.seat}` : "Signed in"}
            </h2>
            {seated ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"
                data-testid="seat-status-held"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                Seat Held
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"
                data-testid="seat-status-none"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
                No Seat Yet
              </span>
            )}
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
            {synBalance !== null ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono" data-testid="text-seat-syn-balance">
                  {synBalance} SYN
                </span>
              </>
            ) : null}
          </div>

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
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Your seat is recognized on-chain — read live, never assigned by hand.
              This is your Member Home.
            </p>
          ) : null}

          {/* The member's OWN receipt — MOVED from WalletSessionPanel (one
              receipt surface, zero twins). Own-row, canonical explorer URL,
              fail-closed: absent receipt never degrades the standing. */}
          {seated && status.receipt !== null ? (
            <div
              className="mt-3 rounded-md border border-gold/25 bg-gold/5 p-2.5"
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
        </div>
      </div>
    </div>
  );
}
