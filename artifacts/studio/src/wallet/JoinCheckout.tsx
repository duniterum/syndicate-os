// wallet/JoinCheckout.tsx (build-time-gated wallet module)
//
// C2 — APPROVE → BUY: the first and only write surface of the public app.
// Reached ONLY when config/checkoutGate.ts CHECKOUT_ENABLED is true (a founder
// go-live act) AND via a runtime dynamic import (guard rule 15).
//
// The four C2 laws (from the verified contract, MembershipSaleV3.sol):
//   1. TWO SEPARATE SIGNATURES, never fused. Step ① approve(sale, EXACT gross)
//      on the sale's own USDC token; step ② buy(). The buy button only enables
//      after the allowance is CONFIRMED ON-CHAIN — never on a tx promise.
//   2. RESUMABLE, never approve twice: the live allowance is read first; if it
//      already covers the amount, step ① is skipped entirely.
//   3. RE-QUOTE BEFORE SIGNING: minSynOut comes from a FRESH quote fetched at
//      the moment of the buy click (Q5 — the only real risk is an era flip),
//      via computeMinSynOutRaw. A stale figure is never signed.
//   4. THE SEAT COMES FROM THE EVENT ONLY (Q8): MembershipPurchasedV3 in the
//      tx receipt. Nothing predicted, nothing inferred.
//
// Other invariants: chain 43114 asserted before anything; the historical gate
// (C1.3) is RE-CONSULTED here and blocks the whole flow fail-closed; the USDC
// token address is read from the deployed sale's own immutable USDC() — never
// hardcoded; v1Proof is ALWAYS [] (Q10 — the contract reverts otherwise);
// recipient is EXPLICITLY the connected wallet (Q12; gifting = C4, and the
// historical gate must then run on the RECIPIENT).

import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { parseEventLogs } from "viem";
import { avalanche } from "viem/chains";
import { CheckCircle2, ExternalLink, ShieldAlert, Wallet } from "lucide-react";
import {
  getGetJoinQuoteQueryKey,
  useGetJoinQuote,
} from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  confirmTransaction,
  makeEngineProbe,
  publicClient,
  readAllowance,
  readEngineQuoteForBuyer,
  readSaleUsdcToken,
  readTokenBalance,
  SALE_BUY_ABI,
  type EngineQuoteForBuyer,
} from "@/lib/chainReads";
import { shortTxHash } from "@/lib/txDisplay";
import {
  askEngineAboutSource,
  droppedSourceNotice,
} from "@/lib/sourceEligibility";
import { resolveHistoricalGate, type HistoricalGateVerdict } from "@/lib/historicalMembers";
import { pingChannelConversion } from "@/lib/channelPing";
import { computeMinSynOutRaw } from "@/lib/checkoutVocabulary";
import { formatRawUnits } from "@/lib/rawUnits";
import {
  buildMembershipReceipt,
  type ConfirmedMembershipPurchase,
} from "@/lib/protocolCommerceReceipt";

// THE TICKET (receipt slice, 2026-07-16) — the confirmed purchase prints its
// solemn paper right here, killing the post-purchase dead end. Lazy: the
// ticket (QR + rasterizer) loads only after a purchase actually confirms.
const ReceiptTicket = lazy(() => import("@/wallet/ReceiptTicket"));

const ZERO_BYTES32 =
  "0x0000000000000000000000000000000000000000000000000000000000000000" as const;

const ERC20_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// The receipt event — EXACT field order from MembershipSaleV3.sol :72-97.
// The seat number is read from THIS and nowhere else.
const PURCHASE_EVENT_ABI = [
  {
    type: "event",
    name: "MembershipPurchasedV3",
    inputs: [
      { name: "receiptId", type: "bytes32", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "recipient", type: "address", indexed: true },
      { name: "memberNumber", type: "uint256", indexed: false },
      { name: "grossUsdc", type: "uint256", indexed: false },
      { name: "acquisitionCost", type: "uint256", indexed: false },
      { name: "protocolContribution", type: "uint256", indexed: false },
      { name: "vaultAmount", type: "uint256", indexed: false },
      { name: "liquidityAmount", type: "uint256", indexed: false },
      { name: "operationsAmount", type: "uint256", indexed: false },
      { name: "synOut", type: "uint256", indexed: false },
      { name: "synPerUsdc", type: "uint64", indexed: false },
      { name: "era", type: "uint16", indexed: false },
      { name: "chapter", type: "uint16", indexed: false },
      { name: "sourceId", type: "bytes32", indexed: false },
      { name: "sourceClass", type: "uint8", indexed: false },
      { name: "sourceWallet", type: "address", indexed: false },
      { name: "commissionBps", type: "uint16", indexed: false },
      { name: "attributionScope", type: "uint8", indexed: false },
      { name: "attributionWindowEndsAt", type: "uint256", indexed: false },
      { name: "sourceGrossRemaining", type: "uint256", indexed: false },
      { name: "buyerGrossRemaining", type: "uint256", indexed: false },
      { name: "firstSeat", type: "bool", indexed: false },
      { name: "receiptVersion", type: "uint8", indexed: false },
    ],
  },
] as const;

// Honest revert translation for the contract's known custom errors (Q11).
// Anything unrecognized falls through to the raw message — never invented.
const KNOWN_REVERTS: readonly (readonly [string, string])[] = [
  ["SaleConcluded", "The sale is concluded — no further joins on this engine."],
  ["BelowEraMinimum", "This amount is below the current era's minimum."],
  ["ExceedsTxMax", "This amount is above the per-transaction maximum."],
  ["AddressEraCapExceeded", "This wallet has reached its cap for the current era."],
  ["SlippageExceeded", "The rate moved between the quote and your signature. Nothing was taken — read a fresh quote and retry."],
  ["EraInventoryInsufficient", "The current era does not have enough SYN left for this amount."],
  ["InsufficientInventory", "The engine does not have enough SYN left for this amount."],
  ["ReserveFloorViolation", "This purchase would break the engine's reserve floor."],
  ["EnforcedPause", "The engine is paused right now."],
  ["InvalidProof", "The engine rejected the membership proof for this wallet."],
  // Source reverts (AUDIT FIX 1.3) — an EXPLICIT sourceId can revert where the
  // read-only quote merely previews 0% (MembershipSaleV3 _resolveSource :440-476).
  ["SourceAlreadyLinked", "This wallet is already linked to a different introduction — the engine keeps the first link. Retry from Join without this introduction link."],
  ["SourceNotEligible", "This introduction is not eligible for this purchase. Retry from Join without the introduction link — the join itself is unaffected."],
  ["SelfReferral", "An introduction cannot pay its own buyer. Retry from Join without the introduction link."],
  ["ReferrerNotSeated", "The introducer's wallet no longer holds SYN, so the introduction cannot apply. Retry from Join without the introduction link."],
] as const;

function explainError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/user rejected|denied|rejected the request/i.test(raw)) {
    return "You declined the signature. Nothing was sent.";
  }
  // AUDIT FIX (1.1): the write itself refuses a wrong-chain wallet (wagmi
  // ChainMismatchError) — translate it instead of leaking the raw message.
  if (/chain mismatch|ChainMismatch|does not match the target chain/i.test(raw)) {
    return "Your wallet is on another network. Switch to Avalanche C-Chain (43114) and retry — nothing was sent.";
  }
  for (const [name, text] of KNOWN_REVERTS) {
    if (raw.includes(name)) return text;
  }
  // P2 human-tongue (founder GO 2026-07-17) + the adversarial-review catch:
  // the raw line can come from the wallet, viem, or an RPC node — so it is
  // presented as "the reported reason", never attributed to a speaker this
  // code cannot prove; a truncated quote is MARKED (…), never passed off as
  // the whole. This fallback is only reached when writeContractAsync itself
  // threw — no hash exists, so "did not go through" is honest here.
  const firstLine = raw.split("\n")[0] ?? raw;
  const shown = firstLine.length > 160 ? `${firstLine.slice(0, 160)}…` : firstLine;
  return `The transaction did not go through. The reported reason: "${shown}". Nothing is assumed — verify your wallet activity on the explorer.`;
}

type Phase =
  | { kind: "reading" }
  | { kind: "blocked_gate"; verdict: HistoricalGateVerdict }
  | { kind: "unavailable"; reason: string }
  | {
      kind: "ready";
      usdcToken: string;
      allowance: bigint;
      balance: bigint;
    };

type Receipt = {
  seat: string;
  firstSeat: boolean;
  txHash: string;
  synOutRaw: string;
  /** The full confirmed event, verbatim — the ticket's only source (law 4). */
  event: ConfirmedMembershipPurchase;
  blockNumber: string;
  /** Sealing-block UNIX timestamp, or null when the block read failed. */
  blockTimestamp: number | null;
  /**
   * Set when the engine PROVED it would refuse this purchase with the
   * introduction link and accept it without — the purchase was then signed
   * un-attributed, and the buyer is told so on the proof panel.
   */
  sourceNotice: string | null;
};

export default function JoinCheckout({
  saleAddress,
  explorerBase,
  grossUsdcRaw,
  sourceId,
  usdcDecimals,
  synDecimals,
  onVerdict,
}: {
  /** Deployed sale address — server-sourced from the verify-link. */
  saleAddress: string | null;
  /** Explorer base URL derived from the same verify-link (for the tx proof). */
  explorerBase: string | null;
  /** The quoted amount, raw 6-dec USDC base units. */
  grossUsdcRaw: string;
  /** Applied verified introduction, or null → bytes32 zero on-chain. */
  sourceId: string | null;
  usdcDecimals: number;
  synDecimals: number;
  /**
   * Called ONCE, when the engine has PROVEN the introduction cannot attach to
   * this wallet. The page then recomputes its own quote without the link, so
   * the money breakdown above can never show a commission line while this
   * panel says the introduction was not attached (review catch, 2026-08-04:
   * two contradicting money statements on one screen).
   */
  onVerdict?: (v: { dropped: boolean; figures: EngineQuoteForBuyer | null }) => void;
}) {
  // AUDIT FIX (1.1): the WALLET's actual chain, not the config's. useChainId()
  // returns the config chain (always 43114 on a single-chain config), so it can
  // never detect a wallet sitting on another network — useAccount().chainId can.
  const { address, chainId: walletChainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();

  const [phase, setPhase] = useState<Phase>({ kind: "reading" });
  const [busy, setBusy] = useState<"approve" | "buy" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  /**
   * Set once the engine has PROVEN the introduction cannot attach to this
   * wallet. `reason` is the engine's own error name, or null when it could not
   * be decoded — null never becomes an invented cause.
   */
  const [sourceDrop, setSourceDrop] = useState<{ reason: string | null } | null>(null);
  /**
   * True once the engine could NOT BE READ for this link — never a refusal.
   * The link still goes out (his ruling ⑥, «only the chain says no»); what is
   * withdrawn is the CLAIM. Before this, an unreadable probe left the screen
   * asserting «an introduction is attached» on a check that never completed.
   */
  const [sourceUnverified, setSourceUnverified] = useState(false);

  const gross = /^[0-9]+$/.test(grossUsdcRaw) ? BigInt(grossUsdcRaw) : null;
  const onAvalanche = walletChainId === avalanche.id;

  // Fresh-quote source for the buy click (law 3). Kept disabled; fetched
  // imperatively at the moment of signing so minSynOut is never stale.
  const quoteParams = sourceId
    ? { grossUsdc: grossUsdcRaw, sourceId }
    : { grossUsdc: grossUsdcRaw };
  const freshQuote = useGetJoinQuote(quoteParams, {
    query: { queryKey: getGetJoinQuoteQueryKey(quoteParams), enabled: false },
  });

  // Resolve everything the flow depends on, fail-closed: the historical gate
  // verdict, the sale's own USDC token, the live allowance and balance.
  const resolve = useCallback(async () => {
    if (!address || !saleAddress || gross === null) return;
    setPhase({ kind: "reading" });
    const verdict = await resolveHistoricalGate(saleAddress, address);
    if (verdict.kind === "blocked_unclaimed" || verdict.kind === "blocked_unverified") {
      setPhase({ kind: "blocked_gate", verdict });
      return;
    }
    const usdcToken = await readSaleUsdcToken(saleAddress);
    if (!usdcToken) {
      setPhase({ kind: "unavailable", reason: "the engine's payment token could not be read" });
      return;
    }
    const [allowance, balance] = await Promise.all([
      readAllowance(usdcToken, address, saleAddress),
      readTokenBalance(usdcToken, address),
    ]);
    if (allowance === null || balance === null) {
      setPhase({ kind: "unavailable", reason: "your live allowance or balance could not be read" });
      return;
    }
    setPhase({ kind: "ready", usdcToken, allowance, balance });
  }, [address, saleAddress, gross]);

  useEffect(() => {
    if (!address || !saleAddress || gross === null || !onAvalanche) return;
    void resolve();
  }, [address, saleAddress, gross, onAvalanche, resolve]);

  // THE VERDICT IS REACHED BEFORE THE SIGNATURE, NOT AFTER IT (founder's
  // preview answer + review catch, 2026-08-04). Asking the engine only at the
  // click meant the buyer learned his introduction had been left out AFTER his
  // money had moved, on a page whose money breakdown still showed a commission
  // line. ⛔ ~~So the moment the approval covers the amount — the first moment
  // the engine can answer the source question without an allowance failure
  // masking it — we ask~~ STRUCK 2026-08-04, his own counter-example: that is
  // exactly the gate that made the whole check unreachable, because a member
  // arriving on a link has approved nothing yet. We ask AS SOON AS the page is
  // ready; the engine names a source refusal with a zero allowance because it
  // resolves the source before it pulls the token. The answer travels UP to the
  // page, which is where the ONE verdict lives.
  //
  // SCOPE, stated: this probe uses a price floor of ZERO on purpose. It asks
  // ONLY «can this introduction attach to this wallet», so a moving rate can
  // never colour the answer. The signing path re-asks with the real floor.
  // A NEW AMOUNT IS A NEW QUESTION (third review, 2026-08-04). The verdict and
  // the figures behind it belong to ONE amount. Left standing across a change,
  // they froze the company's figure at the amount they were read for — «you pay
  // 1,000 USDC» above «sent to the Syndicate 10.00 USDC», permanently, because
  // nothing ever re-asked. Clearing here makes the probe below run again for
  // the new amount, and the page is re-told with figures that match it.
  useEffect(() => {
    setSourceDrop(null);
    // AND RETRACT IT ON THE PAGE. This component is the ONLY one that knows the
    // wallet changed (guard rule 15 keeps wagmi out of the page), so if it does
    // not retract, the page keeps a verdict that belonged to another wallet —
    // which silently stripped a new buyer's referral and paid his referrer
    // nothing (fourth review, 2026-08-04).
    onVerdict?.({ dropped: false, figures: null });
    // ⛔ AND ON A SOURCE SWITCH (review, flagged twice before it was fixed).
    // Without `sourceId` here, opening a second link kept the FIRST link's
    // verdict: the new link was never probed, was zeroed at the signature, and
    // was stripped from the quote — while the page advertised that a newer link
    // "takes over". Its referrer earned nothing, permanently.
    setSourceUnverified(false);
  }, [gross, address, sourceId, onVerdict]);

  useEffect(() => {
    if (!sourceId || !address || !saleAddress || gross === null) return;
    // ⛔ NO ALLOWANCE GATE HERE — that gate is what made the whole check
    // unreachable (founder's own counter-example, seat #8, 2026-08-04). It read
    // `phase.allowance < gross` and returned, so a member who had not yet
    // approved — which is EVERY member arriving on a link — was never told, and
    // the breakdown above kept «Paid to your referrer −0.25 USDC» for a
    // purchase the engine would refuse. The engine names a source refusal with
    // a ZERO allowance (measured), so nothing needs to be approved first.
    if (phase.kind !== "ready") return;
    if (sourceDrop !== null) return;
    let cancelled = false;
    void (async () => {
      const bound = { saleAddress, buyer: address, grossUsdc: gross, minSynOut: 0n };
      const answer = await askEngineAboutSource(sourceId, makeEngineProbe(bound));
      if (cancelled) return;
      // ⛔ THE SCREEN MUST KNOW WHEN WE COULD NOT HEAR THE ENGINE (founder
      // decision ①, 2026-08-05). An unreadable answer used to leave `sourceDrop`
      // null, indistinguishable from a clean acceptance — so the attribution
      // line asserted «an introduction is attached» one click before a
      // signature, on a check that never completed. The link still goes out
      // (ruling ⑥, «only the chain says no»); only the CLAIM is withdrawn.
      // askEngineAboutSource already retried once before answering this.
      setSourceUnverified(answer.verdict === "unreadable");
      if (answer.decision !== "drop") return;
      // THE TRUE SPLIT FOR THIS BUYER (founder answer ④). The engine still pays
      // an introduction already recorded for this wallet, even on a zero id —
      // so the page must show the figures the purchase will really produce,
      // never the anonymous ones that claim nobody is paid.
      //
      // ⛔ THIS READ HAPPENS *BEFORE* ANY STATE IS SET, AND THE TWO UPDATES THEN
      // LAND BACK TO BACK (third review, 2026-08-04). The previous order set
      // `sourceDrop` first and awaited the read afterwards — but `sourceDrop` is
      // in this effect's own dependencies, so setting it re-ran the effect,
      // whose cleanup flipped `cancelled`, so the await below returned into a
      // `return` and THE PAGE WAS NEVER TOLD. Not a race: the read measured
      // 102–193 ms against a teardown well under 1 ms. The consequence was the
      // exact contradiction the commit before it claimed to close — the panel
      // above kept «Paid to your referrer 0.50 USDC» while this panel said the
      // introduction would not attach. Nothing may await between these two
      // lines again.
      const trueFigures = await readEngineQuoteForBuyer({
        saleAddress,
        buyer: address,
        grossUsdc: gross,
        sourceId: ZERO_BYTES32,
      });
      if (cancelled) return;
      setSourceDrop({ reason: answer.refusalName });
      onVerdict?.({ dropped: true, figures: trueFigures });
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceId, address, saleAddress, gross, phase, sourceDrop, onVerdict]);

  // ── guards before any UI ──────────────────────────────────────────────────
  if (gross === null) return null;

  if (!address) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground mb-3">
          Connect your wallet to complete the join. Two separate signatures — an
          exact USDC approval, then the join itself. Nothing moves without both.
        </p>
        {openConnectModal ? (
          <Button onClick={() => openConnectModal()} data-testid="button-checkout-connect">
            <Wallet className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Connect wallet
          </Button>
        ) : null}
      </Shell>
    );
  }

  if (!onAvalanche) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground mb-3">
          Your wallet is on another network. The join is an Avalanche C-Chain
          transaction (43114) — switch before anything can be signed.
        </p>
        <Button
          onClick={() => switchChain({ chainId: avalanche.id })}
          disabled={switching}
          data-testid="button-checkout-switch-chain"
        >
          {switching ? "Switching…" : "Switch to Avalanche"}
        </Button>
      </Shell>
    );
  }

  if (!saleAddress) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground" data-testid="text-checkout-unavailable">
          The engine's verified address is unavailable right now — nothing can
          be signed against an unverified destination. Reload to retry.
        </p>
      </Shell>
    );
  }

  if (phase.kind === "reading") {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground" data-testid="text-checkout-reading">
          Reading your live on-chain state — your eligibility, your spending
          approval, your balance…
        </p>
      </Shell>
    );
  }

  if (phase.kind === "blocked_gate") {
    return (
      <Shell tone="destructive">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-muted-foreground" data-testid="text-checkout-gate-blocked">
            This wallet holds an unclaimed historical seat
            {phase.verdict.kind === "blocked_unclaimed"
              ? ` (#${phase.verdict.memberNumber})`
              : ""}{" "}
            — buying now would mint a duplicate. Claim the seat first; the full
            explanation is at the top of this page. Nothing can be signed here.
          </p>
        </div>
      </Shell>
    );
  }

  if (phase.kind === "unavailable") {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground" data-testid="text-checkout-read-failed">
          Live verification didn&apos;t succeed: {phase.reason}. For your
          safety, nothing can be signed until every live check passes. Reload
          to retry.
        </p>
      </Shell>
    );
  }

  // ── ready ─────────────────────────────────────────────────────────────────
  const { usdcToken, allowance, balance } = phase;
  const allowanceOk = allowance >= gross;
  const balanceOk = balance >= gross;
  const grossDisplay = `${formatRawUnits(grossUsdcRaw, usdcDecimals)} USDC`;

  async function handleApprove() {
    if (busy) return;
    setBusy("approve");
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: usdcToken as `0x${string}`,
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [saleAddress as `0x${string}`, gross!],
        chainId: avalanche.id,
      });
      // The receipt wait runs on the app's OWN RPC client, after the wallet
      // already signed and broadcast — a failure HERE is a read failure,
      // never a failed approval, and must never be blamed on the wallet
      // (adversarial-review catch: a timeout would have rendered "did not
      // go through" for an approval that stands on the chain).
      const approval = await confirmTransaction(hash);
      if (approval.kind === "unread") {
        setError(
          `Your approval was sent (${shortTxHash(hash)}) but its confirmation could not be read from here. Nothing is assumed — the transaction stands on the chain regardless of this page; retry in a moment or verify it on the explorer.`,
        );
        return;
      }
      if (approval.kind === "refused") {
        setError(
          `Your approval was refused on-chain (${shortTxHash(hash)}). Nothing was approved and nothing was taken beyond the network fee — try step 1 again.`,
        );
        return;
      }
      // The chain is the truth — re-read the allowance rather than assume it.
      await resolve();
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(null);
    }
  }

  async function handleBuy() {
    if (busy || !address) return;
    setBusy("buy");
    setError(null);
    try {
      // Law 2/1 re-checked at the click: live allowance must still cover.
      const liveAllowance = await readAllowance(usdcToken, address, saleAddress!);
      if (liveAllowance === null || liveAllowance < gross!) {
        setError("The live allowance no longer covers this amount — approve again (step 1).");
        await resolve();
        return;
      }
      // Law 3: a FRESH quote at the moment of signing → fresh minSynOut.
      const fresh = await freshQuote.refetch();
      const q = fresh.data;
      if (!q || !q.chainVerified || q.quote === null) {
        setError("A fresh quote could not be read right before signing — nothing was signed.");
        return;
      }
      const minSynOut = computeMinSynOutRaw(q.quote.synOutRaw);
      if (minSynOut === null) {
        setError("Your minimum-received protection could not be computed from the fresh quote — nothing was signed.");
        return;
      }
      // ⛔ THE SILENT ZERO IS GONE (founder, 2026-08-05 — his friend's 600 USDC).
      // ~~Pass the sourceId ONLY when the FRESH quote at this click confirms it
      // applies; otherwise bytes32 zero~~ STRUCK. That gate read the SERVER's
      // `sourceValid`, an ANONYMOUS verdict computed for the zero address which
      // by construction cannot know this buyer — and when it was anything but
      // true the checkout signed bytes32(0) AND SAID NOTHING. A referrer lost
      // his commission, and because the engine can never attach a source to an
      // already-seated wallet, he lost that member permanently. Nobody was told.
      //
      // It was also redundant: a source that does not exist, is not active, or
      // cannot apply makes buy() revert with a name — SourceNotEligible() — and
      // the engine probe below already catches that AND explains it in human
      // words. So the buyer's link goes into the arguments, THE ENGINE alone may
      // remove it (his rulings ③ «the reason comes from the engine» and ⑥ «only
      // the chain says no»), and every removal speaks.
      //
      // ⛔ AND IT HONOURS A REFUSAL THE ENGINE HAS ALREADY PROVEN (review,
      // 2026-08-05). Without `sourceDrop === null` this re-armed an id the
      // engine had demonstrably rejected: the probe below runs again, and if
      // that second answer is "unreadable" — any RPC blip, and the decision
      // fails OPEN by his ruling, correctly — the known-bad id goes on chain
      // and reverts the buyer's WHOLE purchase. He pays gas for a join that
      // would have succeeded. Removing a proven-refused introduction is exactly
      // what ruling ⑥ permits; it is never a refusal to send.
      let applySourceId: `0x${string}` =
        sourceId !== null && sourceDrop === null ? (sourceId as `0x${string}`) : ZERO_BYTES32;

      // THE ENGINE IS ASKED BEFORE THE BUYER SIGNS (2026-08-04 — the founder
      // reproduced SEVEN reverted purchases on live prod, his own money each
      // time). The server verdict above can only ever mean "this link exists
      // and is active": it is computed for an ANONYMOUS recipient, so it cannot
      // know THIS buyer. The engine can, and does — measured on mainnet the
      // same day: buy(10 USDC, that seated wallet, that sourceId) REVERTS with
      // SourceNotEligible(), while the identical purchase on bytes32(0)
      // SUCCEEDS. The quote never looked, because quote() previews the
      // commission for that same wallet regardless (250000, measured).
      //
      // THE ONLY THING THIS MAY DO IS REMOVE A PROVEN-BLOCKED INTRODUCTION
      // (founder ruling 2026-08-04: this checkout may never refuse to send a
      // purchase — only the chain says no). If the engine still refuses, the
      // transaction goes out, the chain refuses it in public, and the receipt
      // path below says so honestly.
      let sourceNotice: string | null = null;
      if (applySourceId !== ZERO_BYTES32) {
        const probe = {
          saleAddress: saleAddress!,
          buyer: address,
          grossUsdc: gross!,
          minSynOut: BigInt(minSynOut),
        };
        const answer = await askEngineAboutSource(applySourceId, makeEngineProbe(probe));
        if (answer.decision === "drop") {
          // The purchase goes through UN-ATTRIBUTED rather than reverting — and
          // the buyer is told, with the ENGINE's own reason, never one of ours.
          applySourceId = ZERO_BYTES32;
          sourceNotice = droppedSourceNotice(answer.refusalName);
          // ⛔ AND TELL THIS PANEL, NOT ONLY THE PAGE (review, 2026-08-05).
          // This branch called onVerdict but never setSourceDrop, so the
          // attribution line right above the button kept promising a commission
          // for the whole wallet-prompt window while the transaction being
          // signed carried bytes32(0) — the exact contradiction that line was
          // added to prevent. It must land BEFORE the await below, so the
          // screen is already true when the wallet opens.
          setSourceDrop({ reason: answer.refusalName });
          // TELL THE PAGE — the same call the mount-time drop makes (review
          // catch, 2026-08-04: this second drop path was silent, so the
          // breakdown above kept its «paid to your referrer» line, with that
          // referrer's address and explorer proof, while the receipt printed
          // underneath said the introduction was not attached).
          onVerdict?.({
            dropped: true,
            figures: await readEngineQuoteForBuyer({
              saleAddress: saleAddress!,
              buyer: address,
              grossUsdc: gross!,
              sourceId: ZERO_BYTES32,
            }),
          });
        }
      } else if (sourceDrop !== null) {
        // The page already removed the link because this same test proved it
        // could not attach — the receipt still owes the buyer the explanation.
        sourceNotice = droppedSourceNotice(sourceDrop.reason);
      }
      const hash = await writeContractAsync({
        address: saleAddress as `0x${string}`,
        abi: SALE_BUY_ABI,
        functionName: "buy",
        args: [
          gross!,
          address, // recipient EXPLICITLY = the connected wallet (Q12; gifting = C4)
          applySourceId,
          BigInt(minSynOut),
          [], // v1Proof MUST be empty on a direct buy (Q10)
        ],
        chainId: avalanche.id,
      });
      // Same read-vs-write split as handleApprove: the purchase is already
      // signed and broadcast; a receipt-read failure is the app's, not the
      // buyer's, and the message must not claim the purchase failed.
      // THE RECEIPT IS JUDGED BEFORE ITS LOGS ARE READ (2026-08-04). A reverted
      // transaction carries NO logs, so before this the buyer of a purchase the
      // engine REFUSED was told "the transaction confirmed … but the receipt
      // event could not be decoded" — a failed purchase reported as confirmed,
      // on the money path. The founder hit exactly this, seven times. Nothing
      // is inferred: `status` is the receipt's own field, judged in the one
      // helper every write surface now shares.
      const outcome = await confirmTransaction(hash);
      if (outcome.kind === "unread") {
        setError(
          `Your purchase was sent (${shortTxHash(hash)}) but its confirmation could not be read from here. Nothing is assumed — the transaction stands on the chain regardless of this page; verify it on the explorer or reload in a moment.`,
        );
        return;
      }
      if (outcome.kind === "refused") {
        setError(
          `The engine refused this purchase on-chain (${shortTxHash(hash)}). No SYN was bought and no seat changed — only the network fee was spent. Nothing else was taken. Reload and try again; if you arrived on an introduction link, try once from Join without it.`,
        );
        return;
      }
      const txReceipt = outcome.receipt;
      // Law 4: the seat is read from the receipt EVENT only.
      const events = parseEventLogs({
        abi: PURCHASE_EVENT_ABI,
        logs: txReceipt.logs,
        eventName: "MembershipPurchasedV3",
      });
      const ev = events[0];
      if (!ev) {
        setError(
          `The transaction confirmed (${shortTxHash(hash)}) but the receipt event could not be decoded here. Your wallet and the explorer hold the truth — verify the transaction directly.`,
        );
        return;
      }
      // The ticket's date line: the sealing block's own timestamp. A failed
      // read degrades honestly — the ticket anchors on the block number alone.
      let blockTimestamp: number | null = null;
      try {
        const block = await publicClient.getBlock({ blockNumber: txReceipt.blockNumber });
        blockTimestamp = Number(block.timestamp);
      } catch {
        blockTimestamp = null;
      }
      setReceipt({
        seat: ev.args.memberNumber.toString(),
        firstSeat: ev.args.firstSeat,
        txHash: hash,
        synOutRaw: ev.args.synOut.toString(),
        // Every ticket figure below is the event's OWN field, verbatim
        // (law 4 + the ticket's no-recompute filter).
        event: {
          memberNumber: ev.args.memberNumber.toString(),
          recipient: ev.args.recipient,
          grossUsdcRaw: ev.args.grossUsdc.toString(),
          acquisitionCostRaw: ev.args.acquisitionCost.toString(),
          protocolContributionRaw: ev.args.protocolContribution.toString(),
          vaultAmountRaw: ev.args.vaultAmount.toString(),
          liquidityAmountRaw: ev.args.liquidityAmount.toString(),
          operationsAmountRaw: ev.args.operationsAmount.toString(),
          synOutRaw: ev.args.synOut.toString(),
          synPerUsdc: ev.args.synPerUsdc.toString(),
          era: ev.args.era,
          firstSeat: ev.args.firstSeat,
          sourceId: ev.args.sourceId,
          sourceWallet: ev.args.sourceWallet,
        },
        blockNumber: txReceipt.blockNumber.toString(),
        blockTimestamp,
        sourceNotice,
      });
      // SPEC R3 — the channel beacon: if the landing carried a `&via=` tag,
      // report the sealed conversion (the EVENT's own sourceId — the on-chain
      // truth of which source applied — plus the tx hash). Fire-and-forget,
      // AFTER the receipt is sealed, entirely off the money path; the server
      // verifies the tx on-chain itself before recording anything.
      pingChannelConversion(ev.args.sourceId, hash);
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(null);
    }
  }

  if (receipt) {
    const txUrl = explorerBase ? `${explorerBase}/tx/${receipt.txHash}` : null;
    // THE TICKET — born from the confirmed event's own fields only. A null
    // model (malformed anchor) falls back to the plain proof panel: the
    // headline + explorer link never depend on the ticket rendering.
    const ticketModel = buildMembershipReceipt({
      event: receipt.event,
      proof: {
        txHash: receipt.txHash,
        blockNumber: receipt.blockNumber,
        explorerTxUrl: txUrl,
      },
      blockTimestamp: receipt.blockTimestamp,
      usdcDecimals,
      synDecimals,
    });
    return (
      <Shell tone="proof">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-proof shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground" data-testid="text-checkout-receipt">
              {receipt.firstSeat
                ? `Seat #${receipt.seat} is yours — written on-chain.`
                : `Repeat purchase recorded — your seat stays #${receipt.seat}.`}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatRawUnits(receipt.synOutRaw, synDecimals)} SYN sent to your wallet.
              Your ticket below is printed from the sealed transaction itself.
            </p>
            {/* The introduction the engine would not attach. Said HERE, on the
                proof panel, because that is where the buyer learns what his
                purchase actually recorded — never omitted, never an error tone:
                the purchase succeeded exactly as shown. */}
            {receipt.sourceNotice ? (
              <p
                className="text-xs text-muted-foreground mt-2 max-w-2xl"
                data-testid="text-checkout-source-dropped"
              >
                {receipt.sourceNotice}
              </p>
            ) : null}
            {txUrl ? (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="type-eyebrow mt-2 inline-flex items-center gap-1 text-proof transition-colors hover:text-proof-hover"
                data-testid="link-checkout-receipt-tx"
              >
                Your receipt transaction
                <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
        {ticketModel ? (
          <div className="mt-5 flex justify-center">
            <Suspense fallback={null}>
              <ReceiptTicket model={ticketModel} wallet={address} />
            </Suspense>
          </div>
        ) : null}
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-sm font-medium text-foreground mb-1">
        Complete the join — two separate signatures
      </p>
      <p className="text-xs text-muted-foreground mb-4 max-w-2xl">
        Step 1 approves the exact amount, nothing more. Step 2 signs the join
        itself. They are never combined into one signature, and step 2 only
        unlocks once the approval is confirmed on-chain.
      </p>

      {!balanceOk ? (
        <div className="mb-3" data-testid="text-checkout-balance-short">
          <p className="text-sm text-destructive">
            This wallet holds {formatRawUnits(balance.toString(), usdcDecimals)} USDC{" "}
            <strong>on Avalanche C-Chain</strong> — less than {grossDisplay}. Nothing
            can be signed until the balance covers the amount.
          </p>
          {/* The multichain-wallet trap (founder-reported, 2026-07-13): wallets
              now show ONE aggregated total across all networks, so "5 USDC" in
              the wallet UI may live on Ethereum/Base/etc. — invisible to the
              engine, which takes native Avalanche USDC only. Say it plainly. */}
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
            The join takes <strong>native USDC on Avalanche</strong> only. Your wallet
            may display one total across all networks — USDC sitting on another chain,
            or bridged USDC.e, does not count here. Bridge or swap it to native USDC
            on Avalanche C-Chain, then reload this page.
          </p>
        </div>
      ) : null}

      {/* THE INTRODUCTION THE ENGINE WILL NOT ATTACH — said BEFORE the
          signature, never after it. Neutral tone on purpose: nothing has gone
          wrong, the join is unaffected, and the reason is the engine's own. */}
      {sourceDrop ? (
        <p
          className="text-xs text-muted-foreground mb-3 max-w-2xl"
          data-testid="text-checkout-source-unusable"
        >
          {droppedSourceNotice(sourceDrop.reason, "before")}
        </p>
      ) : null}

      {/* ⛔ WHAT WILL BE SIGNED, SAID OUT LOUD — ALWAYS, not only when something
          fails (founder, 2026-08-05). Twenty purchases went through this
          checkout and only four carried an introduction; not one buyer, and not
          one referrer, could see which was which before the money moved. His
          friend's 600 USDC purchase was un-attributed and NOTHING on this page
          said so. An absence has no error state — the only way to make it
          visible is to state the presence too. This line reads the SAME two
          values the signature does (`sourceId` and the engine's verdict), so it
          cannot drift from what is actually sent. */}
      <p
        className={`text-sm leading-relaxed mb-4 max-w-2xl ${
          sourceId !== null && sourceDrop === null ? "text-muted-foreground" : "text-foreground"
        }`}
        data-testid="text-checkout-attribution"
      >
        {sourceDrop !== null
          ? // The reason is already stated above, in the engine's own words. Repeating
            // "open it again before you sign" HERE was false advice: the engine has
            // just refused THIS link for THIS wallet, and reopening it changes nothing.
            "This purchase will be signed without an introduction, for the reason above. Your price is unchanged."
          : sourceId !== null && sourceUnverified
            ? // ⛔ THE FOURTH STATE, and it used to masquerade as the first (founder
              // decision ①, 2026-08-05). The engine could not be READ — the buyer's
              // connection, a rate-limited public endpoint, a node that stripped the
              // revert data. Nothing was refused and nothing was proven, so nothing
              // is promised. The link still goes out: only the chain says no.
              "Your referral link will be signed with this purchase, but we could not reach the engine to check it first. Your join goes through either way, at the price shown above — if the engine cannot accept the link, it simply is not attached."
            : sourceId !== null
            ? // ⛔ NO RATE IS WRITTEN HERE (his red line; SPEC §⑧①: the rate comes from
              // the QUOTE, never from a number we type). The first version said "5%" —
              // a figure read from nowhere, false for every introducer above the first
              // rung of the ladder, one click before a signature. The exact amount is
              // already on screen in the money breakdown above, computed by the engine.
              "An introduction is attached and will be signed with this purchase. Your introducer is paid out of the protocol's own share — your price is exactly the amount shown above, with or without it."
            : // "No introduction" is said about the LINK, which is all this page knows.
              // A wallet that already carries an introducer on-chain is still paid by the
              // engine on a zero id (_resolveSource :431-434), so claiming nobody is paid
              // would be a claim the chain refutes.
              "No introduction link is attached to this purchase — your price is exactly the same either way. If someone did send you an invitation link, open it again before you sign: an introduction can only be recorded at the moment a seat is taken. (If your wallet already has an introducer recorded on-chain, the engine still pays them.)"}
      </p>

      <div className="space-y-3">
        {/* Step 1 — approve the EXACT amount (resumable: skipped when covered) */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-14">
            Step 1
          </span>
          {allowanceOk ? (
            <span className="text-sm text-muted-foreground" data-testid="text-checkout-approved">
              <CheckCircle2 className="inline h-4 w-4 text-proof mr-1.5 -mt-0.5" aria-hidden="true" />
              Approval already covers {grossDisplay} — confirmed on-chain, nothing to sign again.
            </span>
          ) : (
            <Button
              onClick={() => void handleApprove()}
              disabled={busy !== null || !balanceOk}
              data-testid="button-checkout-approve"
            >
              {busy === "approve" ? "Waiting for your wallet…" : `Approve exactly ${grossDisplay}`}
            </Button>
          )}
        </div>

        {/* Step 2 — the join itself (enabled ONLY on live-confirmed allowance) */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground w-14">
            Step 2
          </span>
          <Button
            onClick={() => void handleBuy()}
            disabled={busy !== null || !allowanceOk || !balanceOk}
            data-testid="button-checkout-buy"
          >
            {busy === "buy" ? "Waiting for your wallet…" : `Sign the join — ${grossDisplay}`}
          </Button>
          <span className="text-xs text-muted-foreground">
            A fresh rate is read at the moment you sign; your floor protects you
            if it moves.
          </span>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive mt-4" data-testid="text-checkout-error">
          {error}
        </p>
      ) : null}
    </Shell>
  );
}

// Local shell — keeps every state of the flow in one consistent frame.
function Shell({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "destructive" | "proof";
}) {
  const toneClass =
    tone === "destructive"
      ? "border-destructive/40 bg-destructive/5"
      : tone === "proof"
        ? "border-proof/40 bg-proof/5"
        : "border-border/50 bg-card/40";
  return (
    <Card className={`${toneClass} p-5 mt-4`} data-testid="panel-join-checkout">
      {children}
    </Card>
  );
}
