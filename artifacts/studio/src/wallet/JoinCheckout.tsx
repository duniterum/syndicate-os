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
  publicClient,
  readAllowance,
  readSaleUsdcToken,
  readTokenBalance,
} from "@/lib/chainReads";
import { resolveHistoricalGate, type HistoricalGateVerdict } from "@/lib/historicalMembers";
import { pingChannelConversionFromLocation } from "@/lib/channelPing";
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

const SALE_BUY_ABI = [
  {
    type: "function",
    name: "buy",
    stateMutability: "nonpayable",
    inputs: [
      { name: "grossUsdc", type: "uint256" },
      { name: "recipient", type: "address" },
      { name: "sourceId", type: "bytes32" },
      { name: "minSynOut", type: "uint256" },
      { name: "v1Proof", type: "bytes32[]" },
    ],
    outputs: [],
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
};

export default function JoinCheckout({
  saleAddress,
  explorerBase,
  grossUsdcRaw,
  sourceId,
  usdcDecimals,
  synDecimals,
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
      try {
        await publicClient.waitForTransactionReceipt({ hash });
      } catch {
        setError(
          `Your approval was sent (${hash.slice(0, 10)}…) but its confirmation could not be read from here. Nothing is assumed — the transaction stands on the chain regardless of this page; retry in a moment or verify it on the explorer.`,
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
      // AUDIT FIX (1.2) — quote/purchase divergence: the read-only quote merely
      // previews 0% for a non-applying source, but buy() with an EXPLICIT
      // sourceId REVERTS on it (_resolveSource :440-476). Pass the sourceId
      // ONLY when the FRESH quote at this click confirms it applies; otherwise
      // bytes32 zero (the contract still auto-applies a previously LINKED
      // source gracefully on a zero id — nothing is lost).
      const applySourceId =
        sourceId !== null && q.sourceProvided === true && q.sourceValid === true
          ? sourceId
          : ZERO_BYTES32;
      const hash = await writeContractAsync({
        address: saleAddress as `0x${string}`,
        abi: SALE_BUY_ABI,
        functionName: "buy",
        args: [
          gross!,
          address, // recipient EXPLICITLY = the connected wallet (Q12; gifting = C4)
          applySourceId as `0x${string}`,
          BigInt(minSynOut),
          [], // v1Proof MUST be empty on a direct buy (Q10)
        ],
        chainId: avalanche.id,
      });
      // Same read-vs-write split as handleApprove: the purchase is already
      // signed and broadcast; a receipt-read failure is the app's, not the
      // buyer's, and the message must not claim the purchase failed.
      let txReceipt: Awaited<ReturnType<typeof publicClient.waitForTransactionReceipt>>;
      try {
        txReceipt = await publicClient.waitForTransactionReceipt({ hash });
      } catch {
        setError(
          `Your purchase was sent (${hash.slice(0, 10)}…) but its confirmation could not be read from here. Nothing is assumed — the transaction stands on the chain regardless of this page; verify it on the explorer or reload in a moment.`,
        );
        return;
      }
      // Law 4: the seat is read from the receipt EVENT only.
      const events = parseEventLogs({
        abi: PURCHASE_EVENT_ABI,
        logs: txReceipt.logs,
        eventName: "MembershipPurchasedV3",
      });
      const ev = events[0];
      if (!ev) {
        setError(
          `The transaction confirmed (${hash.slice(0, 10)}…) but the receipt event could not be decoded here. Your wallet and the explorer hold the truth — verify the transaction directly.`,
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
      });
      // SPEC R3 — the channel beacon: if the landing carried a `&via=` tag,
      // report the sealed conversion (the EVENT's own sourceId — the on-chain
      // truth of which source applied — plus the tx hash). Fire-and-forget,
      // AFTER the receipt is sealed, entirely off the money path; the server
      // verifies the tx on-chain itself before recording anything.
      pingChannelConversionFromLocation(ev.args.sourceId, hash);
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
            {txUrl ? (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-proof/80 transition-colors hover:text-proof"
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
