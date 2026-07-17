// wallet/MemberAttention.tsx (build-time-gated wallet module)
//
// ③ HOME Z3 — NEEDS YOUR ATTENTION (approved wireframe 2026-07-16 §3 + the
// founder's Z3 verdict: "session expiring" DROPPED — a system event, not a
// decision — replaced by the standing-approval card). 0–3 cards derived ONLY
// from real, readable state; EMPTY renders one honest line. Never marketing,
// never urgency theater — the anti-scarcity law binds this zone.
// Card classes readable TODAY (each answers "what do I act on now?"):
//   ① Promotion due — the Connector ladder threshold is crossed and the
//     founder's signature is pending (own-row source-standing read).
//   ② A standing USDC approval is open to the sale engine — the member may
//     want to revoke it after a purchase (own-wallet live allowance read).
// The wireframe's third class ("a milestone your seat witnessed") is NOT
// readable today — no live source ties a milestone to a seat; it joins when
// its read exists (B1 territory), never invented before that.
// HONESTY STATE MACHINE (adversarial-review catches, all three): the quiet
// line renders ONLY when EVERY class gave a definitive answer; a class that
// could not be read gets the could-not-read line (never "quiet"); a fetch
// that FAILED is never shown as still reading (settled ≠ succeeded).

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAccount } from "wagmi";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { readAllowance, readSaleUsdcToken } from "@/lib/chainReads";
import { fetchSourceStanding, type SourceStandingReadback } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";
import { usdFromRaw } from "./ownReads";

/** The approved empty line — verbatim from the GO'd wireframe (guard-pinned). */
const QUIET_LINE = "Nothing needs you — the record is quiet.";

// Above this raw-USDC allowance (one billion dollars) the exact figure stops
// meaning "an amount you granted" and starts meaning "no effective cap" (the
// wallet's max-approval pattern) — saying so is more honest than 72 digits.
const EFFECTIVELY_UNLIMITED_RAW = 1_000_000_000n * 1_000_000n;

function addressFromUrl(url: string): string | null {
  return url.match(/\/(?:token|address)\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}

/** Own source standing with SETTLEMENT tracked: undefined = a read is in
 * flight · null = the read FAILED (transport/shape) · readback = served. */
function useSettledSourceStanding(): SourceStandingReadback | null | undefined {
  const [state, setState] = useState<SourceStandingReadback | null | undefined>(
    undefined,
  );
  useEffect(() => {
    let active = true;
    const read = () => {
      setState(undefined);
      void fetchSourceStanding().then((r) => {
        if (active) setState(r);
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);
  return state;
}

/** The wallet's live standing approval to the sale engine.
 * undefined = still reading · null = unreadable (incl. wallet not connected
 * in this browser) · bigint = a definitive answer (0n is a real zero). */
function useStandingApproval(): bigint | null | undefined {
  const { address } = useAccount();
  const { data, isError } = useGetProtocolVerifyLinks();
  const saleUrl =
    data?.links?.find((l) => l.id === "membershipSaleV3")?.url ?? null;
  const saleAddr = saleUrl ? addressFromUrl(saleUrl) : null;
  const [allowance, setAllowance] = useState<bigint | null | undefined>(
    undefined,
  );
  useEffect(() => {
    let active = true;
    setAllowance(undefined);
    if (data === undefined && !isError) return; // verify-links still loading
    if (!address || !saleAddr) {
      // No connected wallet, links failed, or no verified engine address —
      // the figure is honestly unreadable from this browser, never assumed
      // zero (and never shown as still-reading: this read is over).
      setAllowance(null);
      return;
    }
    void readSaleUsdcToken(saleAddr).then((usdc) => {
      if (!active) return;
      if (usdc === null) {
        setAllowance(null);
        return;
      }
      void readAllowance(usdc, address, saleAddr).then((a) => {
        if (active) setAllowance(a);
      });
    });
    return () => {
      active = false;
    };
    // data/isError in deps: links resolving WITHOUT a sale link (saleAddr
    // stays null) must still flip this read from in-flight to unreadable.
  }, [address, saleAddr, data, isError]);
  return allowance;
}

export default function MemberAttention() {
  const sourceStanding = useSettledSourceStanding();
  const approval = useStandingApproval();

  // A class is READ only on a definitive answer; anything else is honest
  // uncertainty. sourceOnChain === false is a definitive "no source" — the
  // promotion class is read (nothing can be due); a served standing:null
  // WITHOUT that definitive marker is an unreadable index/RPC state.
  const standing = sourceStanding?.standing ?? null;
  const promotionRead =
    sourceStanding != null &&
    (standing !== null || sourceStanding.sourceOnChain === false);
  const promotionUnreadable = sourceStanding !== undefined && !promotionRead;
  const approvalRead = typeof approval === "bigint";
  const approvalUnreadable = approval === null;
  const stillReading = sourceStanding === undefined || approval === undefined;

  const cards: React.ReactNode[] = [];
  if (standing !== null && standing.promotionDue === true) {
    cards.push(
      <Card
        key="promotion-due"
        className="bg-card/40 border-gold/30 p-4"
        data-testid="attention-promotion-due"
      >
        <p className="text-sm font-medium text-foreground">
          Promotion due — awaiting the founder&apos;s signature
        </p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Your introductions crossed the {standing.entitledTitle} threshold
          {standing.crossedAtDateUtc ? ` on ${standing.crossedAtDateUtc}` : ""}.
          The rate change is a public on-chain act — the founder signs it;
          nothing is owed until then, and a rung never descends.
        </p>
        <Link
          href="/member#referral-dashboard"
          className="mt-2 inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-gold/90 hover:text-gold"
          data-testid="attention-promotion-door"
        >
          See your ladder →
        </Link>
      </Card>,
    );
  }
  if (approvalRead && approval > 0n) {
    // An exact figure below the cap; the wallet's max-approval pattern above
    // it — a 72-digit "$115792…" would misstate "no cap" as an amount.
    const approvalDisplay =
      approval >= EFFECTIVELY_UNLIMITED_RAW
        ? "an effectively unlimited amount"
        : usdFromRaw(approval.toString());
    cards.push(
      <Card
        key="standing-approval"
        className="bg-card/40 border-border/60 p-4"
        data-testid="attention-standing-approval"
      >
        <p className="text-sm font-medium text-foreground">
          A standing USDC approval is open
        </p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Your wallet still lets the sale engine draw up to{" "}
          <span className="font-mono break-all text-foreground/90">
            {approvalDisplay}
          </span>{" "}
          — read live from the token contract. After a purchase you can close
          it: revoke is your own signed act, from your own wallet.
        </p>
        <Link
          href="/wallet"
          className="mt-2 inline-flex items-center font-mono text-xs uppercase tracking-[0.14em] text-gold/90 hover:text-gold"
          data-testid="attention-approval-door"
        >
          Review in Wallet →
        </Link>
      </Card>,
    );
  }

  return (
    <section data-testid="member-attention">
      <h2 className="text-base font-medium text-foreground mb-3">
        Needs your attention
      </h2>
      {cards.length > 0 ? (
        <>
          <div className="grid gap-3">{cards}</div>
          {promotionUnreadable || approvalUnreadable ? (
            <p className="mt-2 text-xs text-muted-foreground leading-snug">
              Part of your live state could not be read right now — anything
              unread is simply not shown, never assumed.
            </p>
          ) : null}
        </>
      ) : stillReading ? (
        <p className="text-sm text-muted-foreground">
          Reading your live state…
        </p>
      ) : promotionUnreadable || approvalUnreadable ? (
        // A card class was UNREADABLE — saying "quiet" would overclaim.
        <p className="text-sm text-muted-foreground leading-relaxed">
          Part of your live state could not be read from this browser right
          now — nothing is assumed. What could be read needs nothing from you.
        </p>
      ) : (
        <p
          className="text-sm text-muted-foreground"
          data-testid="attention-quiet"
        >
          {QUIET_LINE}
        </p>
      )}
    </section>
  );
}
