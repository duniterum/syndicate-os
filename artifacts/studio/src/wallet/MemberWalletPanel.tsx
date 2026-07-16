// wallet/MemberWalletPanel.tsx (build-time-gated wallet module)
//
// ARC SLICE D — the WALLET DOOR's live panel (§11 point 7):
//   · the wallet's OWN SYN + USDC balances, read live (fail-closed);
//   · the APPROVALS PANEL: the member's own allowances toward KNOWN spenders
//     (Sale V3 today — the list grows only with known protocol spenders);
//   · APPROVE ≠ PAYMENT in plain words (the law that cost six versions);
//   · REVOKE via approve(spender, 0) — a transaction the MEMBER signs in
//     THEIR OWN wallet (simulate-first, honest revert translation, NEVER a
//     server write; the page only builds the transaction, like every PROPOSE
//     surface in this protocol).
// Addresses are server-sourced (verify-links) — never hardcoded client-side.

import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { getAddress } from "viem";
import { avalanche } from "viem/chains";
import { ExternalLink, ShieldAlert, Wallet as WalletIcon } from "lucide-react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  publicClient,
  readAllowance,
  readSaleUsdcToken,
  readTokenBalance,
} from "@/lib/chainReads";
import { formatRawUnits, formatRawUnitsDisplay } from "@/lib/rawUnits";

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

function explainError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/user rejected|denied|rejected the request/i.test(raw)) {
    return "You declined the signature. Nothing was sent.";
  }
  if (/chain mismatch|does not match the target chain/i.test(raw)) {
    return "Your wallet is on another network. Switch to Avalanche C-Chain (43114) and retry.";
  }
  return `The transaction did not go through: ${(raw.split("\n")[0] ?? raw).slice(0, 160)}.`;
}

function addressFromUrl(url: string): string | null {
  return url.match(/\/(?:token|address)\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}

type Reads = {
  syn: string | null;
  usdc: string | null;
  usdcAllowanceToSale: bigint | null;
};

export default function MemberWalletPanel() {
  const { address, chainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();

  const { data } = useGetProtocolVerifyLinks();
  const urlFor = (id: string) => data?.links?.find((l) => l.id === id)?.url ?? null;
  const saleAddr = urlFor("membershipSaleV3") ? addressFromUrl(urlFor("membershipSaleV3")!) : null;
  const synAddr = urlFor("synToken") ? addressFromUrl(urlFor("synToken")!) : null;
  const poolUrl = urlFor("lpPair");

  const [reads, setReads] = useState<Reads>({ syn: null, usdc: null, usdcAllowanceToSale: null });
  const [usdcToken, setUsdcToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    const usdcAddr = saleAddr ? await readSaleUsdcToken(saleAddr) : null;
    setUsdcToken(usdcAddr);
    const [syn, usdc, allowance] = await Promise.all([
      synAddr ? readTokenBalance(synAddr, address) : Promise.resolve(null),
      usdcAddr ? readTokenBalance(usdcAddr, address) : Promise.resolve(null),
      usdcAddr && saleAddr ? readAllowance(usdcAddr, address, saleAddr) : Promise.resolve(null),
    ]);
    setReads({
      // Human display (S7-e, readability floor): 2 decimals, exact half-up.
      syn: syn !== null ? formatRawUnitsDisplay(syn.toString(), 18, 2) : null,
      usdc: usdc !== null ? formatRawUnitsDisplay(usdc.toString(), 6, 2) : null,
      usdcAllowanceToSale: allowance,
    });
  }, [address, saleAddr, synAddr]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onAvalanche = chainId === avalanche.id;

  // REVOKE = approve(sale, 0), the member's own wallet act. Simulate first —
  // a transaction that would revert is never offered for signature.
  const revoke = useCallback(async () => {
    if (!address || !usdcToken || !saleAddr || busy) return;
    setBusy(true);
    setError(null);
    try {
      await publicClient.simulateContract({
        address: getAddress(usdcToken),
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [getAddress(saleAddr), 0n],
        account: getAddress(address),
      });
      const hash = await writeContractAsync({
        address: getAddress(usdcToken),
        abi: ERC20_APPROVE_ABI,
        functionName: "approve",
        args: [getAddress(saleAddr), 0n],
        chainId: avalanche.id,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setLastTx(hash);
      await refresh();
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(false);
    }
  }, [address, usdcToken, saleAddr, busy, writeContractAsync, refresh]);

  if (!address) {
    return (
      <Card className="p-5 border-border/50 bg-card/40">
        <p className="text-sm text-muted-foreground">
          Connect and sign in with your wallet to read your own balances and
          approvals. Nothing here is a directory — you only ever see your own row.
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => openConnectModal?.()}>
          <WalletIcon className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" /> Connect wallet
        </Button>
      </Card>
    );
  }

  const allowance = reads.usdcAllowanceToSale;
  return (
    <div className="space-y-6">
      {/* Own balances — live, fail-closed (no figure on a failed read). */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-4 border-border/50 bg-card/40">
          <p className="text-xs text-muted-foreground mb-1">Your SYN</p>
          <p className="font-mono text-lg text-foreground" data-testid="wallet-syn-balance">
            {reads.syn ?? "—"} <span className="text-xs text-muted-foreground">SYN</span>
          </p>
        </Card>
        <Card className="p-4 border-border/50 bg-card/40">
          <p className="text-xs text-muted-foreground mb-1">Your USDC (Avalanche-native)</p>
          <p className="font-mono text-lg text-foreground" data-testid="wallet-usdc-balance">
            {reads.usdc ?? "—"} <span className="text-xs text-muted-foreground">USDC</span>
          </p>
        </Card>
      </div>

      {/* THE APPROVALS PANEL — known protocol spenders only, own-row. */}
      <Card className="p-5 border-border/50 bg-card/40">
        <h3 className="text-base font-medium text-foreground mb-1">Approvals — known spenders</h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          <span className="text-foreground font-medium">An approval is not a payment.</span>{" "}
          Approving lets a contract pull up to the approved amount later — no
          money moves when you approve, and an approval you no longer need can
          be revoked here at any time. The seat purchase flow approves the
          EXACT amount of a purchase, never unlimited.
        </p>
        <div className="rounded-md border border-border/50 bg-background/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-foreground">USDC → Membership Sale V3</p>
              <p className="font-mono text-xs text-muted-foreground mt-0.5" data-testid="wallet-usdc-allowance">
                {allowance === null
                  ? "allowance unreadable right now (nothing is assumed)"
                  : allowance === 0n
                    ? "no standing approval — clean"
                    : `approved: ${formatRawUnits(allowance.toString(), 6)} USDC`}
              </p>
            </div>
            {allowance !== null && allowance > 0n ? (
              !onAvalanche ? (
                <Button size="sm" variant="outline" disabled={switching} onClick={() => switchChain({ chainId: avalanche.id })}>
                  {switching ? "Switching…" : "Switch to Avalanche"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void revoke()}
                  data-testid="button-revoke-usdc-sale"
                >
                  {busy ? "Waiting for your wallet…" : "Revoke (approve 0) — you sign"}
                </Button>
              )
            ) : null}
          </div>
        </div>
        {error ? (
          <p className="flex items-start gap-2 text-xs text-destructive mt-3">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
          </p>
        ) : null}
        {lastTx ? (
          <p className="text-xs text-muted-foreground mt-3">
            Revoked — your own signed transaction:{" "}
            <span className="font-mono">{lastTx.slice(0, 10)}…{lastTx.slice(-6)}</span>
          </p>
        ) : null}
      </Card>

      {/* The pool pointer — INTERNAL to /liquidity (L-1 law: the LP links
          never travel without their page context and Risk Notice). */}
      <Card className="p-4 border-border/50 bg-card/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-foreground">SYN/USDC pool (Trader Joe)</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Why the pool exists, its live reserves, and the LP-side actions —
              with the Risk Notice they belong with. The pool is a courtesy, not
              a promise; the market is free and may decide otherwise.
            </p>
          </div>
          <Link href="/liquidity" className="inline-flex">
            <Button size="sm" variant="outline">
              Liquidity &amp; trading
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
