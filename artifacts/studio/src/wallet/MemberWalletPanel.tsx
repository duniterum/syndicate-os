// wallet/MemberWalletPanel.tsx (build-time-gated wallet module)
//
// ARC SLICE D — the WALLET DOOR's live panel (§11 point 7):
//   · the wallet's OWN SYN + USDC balances, read live (fail-closed);
//   · the APPROVALS PANEL: the member's own allowances toward EVERY canon sale
//     engine — the active V3 always, and each SEALED sale (V1 · V2a · V2b)
//     the moment a standing approval is found on it (footer audit 2026-07-30:
//     "Sale V3 today" left an abandoned checkout's approval on a retired sale
//     invisible while the panel read "clean");
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
  confirmTransaction,
  publicClient,
  readAllowance,
  readSaleUsdcToken,
  readTokenBalance,
} from "@/lib/chainReads";
import { formatRawUnits, formatRawUnitsDisplay } from "@/lib/rawUnits";
import { useOwnArchiveHoldings } from "./ownReads";
import { SignInWall } from "./SignInWall";

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

// The SEALED sale engines (server verify-links ids + their served labels).
// Addresses stay server-sourced — these are only the ids to ask the registry for.
const RETIRED_SALES = [
  { id: "membershipSaleV1", label: "Membership Sale V1 (sealed)" },
  { id: "membershipSaleV2A", label: "Membership Sale V2a (sealed)" },
  { id: "membershipSaleV2", label: "Membership Sale V2b (sealed)" },
] as const;

type RetiredAllowance = { id: string; label: string; addr: string; allowance: bigint };

type Reads = {
  syn: string | null;
  usdc: string | null;
  usdcAllowanceToSale: bigint | null;
};

// The panel BODY — rendered ONLY when the session is S4 (SignInWall gates it),
// so the live balance reads never fire for an unsigned wallet. A member whose
// wallet is disconnected but session still lives (Q-B) lands on the reconnect
// state below, never the sign-in wall.
function WalletPanelBody() {
  const { address, chainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();

  const { data } = useGetProtocolVerifyLinks();
  const urlFor = (id: string) => data?.links?.find((l) => l.id === id)?.url ?? null;
  const saleAddr = urlFor("membershipSaleV3") ? addressFromUrl(urlFor("membershipSaleV3")!) : null;
  const synAddr = urlFor("synToken") ? addressFromUrl(urlFor("synToken")!) : null;
  const poolUrl = urlFor("lpPair");
  // The ONE explorer-origin derivation (mirrors useAddressExplorerUrl — the
  // shared sourceRegistry link, never a hardcoded host).
  const explorerOrigin =
    urlFor("sourceRegistry")?.match(/^https?:\/\/[^/]+/)?.[0] ?? null;
  const retiredSpenders: { id: string; label: string; addr: string }[] =
    RETIRED_SALES.flatMap((s) => {
      const u = urlFor(s.id);
      const addr = u ? addressFromUrl(u) : null;
      return addr ? [{ id: s.id as string, label: s.label as string, addr }] : [];
    });
  const retiredKey = retiredSpenders.map((s) => s.addr).join(",");

  const [reads, setReads] = useState<Reads>({ syn: null, usdc: null, usdcAllowanceToSale: null });
  const [retiredAllowances, setRetiredAllowances] = useState<RetiredAllowance[] | null>(null);
  const [retiredUnreadable, setRetiredUnreadable] = useState(0);
  // D-TRUTH D5: own Archive artifact holdings (live ERC-1155 reads).
  const artifacts = useOwnArchiveHoldings(address);
  const [usdcToken, setUsdcToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  // `isLive` is the staleness guard (adversarial review 2026-07-30, confirmed
  // 2/2): on an account switch mid-flight, the OLD wallet's late-resolving
  // read must never write into the NEW wallet's panel — balances, allowance,
  // or the sealed-engine approval rows (each carrying a live Revoke button).
  // The house pattern is ReceiptTicket's `let active`; every setState below
  // is gated on it.
  const refresh = useCallback(async (isLive: () => boolean = () => true) => {
    if (!address) return;
    const usdcAddr = saleAddr ? await readSaleUsdcToken(saleAddr) : null;
    if (!isLive()) return;
    setUsdcToken(usdcAddr);
    const [syn, usdc, allowance] = await Promise.all([
      synAddr ? readTokenBalance(synAddr, address) : Promise.resolve(null),
      usdcAddr ? readTokenBalance(usdcAddr, address) : Promise.resolve(null),
      usdcAddr && saleAddr ? readAllowance(usdcAddr, address, saleAddr) : Promise.resolve(null),
    ]);
    // The sealed engines: a standing approval left on a retired sale (an
    // abandoned checkout step-1) must surface — the panel can never read
    // "clean" while an old spender still holds one. Fail-closed: an
    // unreadable state is COUNTED and said, never assumed clean.
    if (usdcAddr && retiredSpenders.length > 0) {
      const rows = await Promise.all(
        retiredSpenders.map(async (s) => {
          try {
            const a = await readAllowance(usdcAddr, address, s.addr);
            return a !== null ? { ...s, allowance: a } : null;
          } catch {
            return null;
          }
        }),
      );
      if (!isLive()) return;
      const ok = rows.filter((r): r is RetiredAllowance => r !== null);
      setRetiredAllowances(ok);
      // Engines whose verify-link never arrived are UNKNOWN too — counted
      // with the failed reads, never silently dropped.
      setRetiredUnreadable(rows.length - ok.length + (RETIRED_SALES.length - retiredSpenders.length));
    } else {
      if (!isLive()) return;
      setRetiredAllowances(null);
      // FAIL-CLOSED (adversarial review 2026-07-30, confirmed 2/2): landing
      // here with no readable USDC token (or no served links) means EVERY
      // sealed engine's state is unknown — and because a sealed row renders
      // only on a nonzero allowance, silence here IS how "clean" displays.
      // The old `setRetiredUnreadable(0)` made an RPC hiccup render exactly
      // like "all sealed engines checked and clean". Unknown is counted.
      setRetiredUnreadable(RETIRED_SALES.length);
    }
    if (!isLive()) return;
    setReads({
      // Human display (S7-e, readability floor): 2 decimals, TRUNCATED. This
      // line said "exact half-up" until 2026-07-26, naming a rule abolished
      // that day — rounding up states more money than the member holds, which
      // one explorer click refutes. formatRawUnitsDisplay borrows the one
      // truncation in lib/amountFormat.ts and carries its "< 0.01" floor, so
      // the 0.004 SYN that used to read a flat "0" here now reads as dust.
      syn: syn !== null ? formatRawUnitsDisplay(syn.toString(), 18, 2) : null,
      usdc: usdc !== null ? formatRawUnitsDisplay(usdc.toString(), 6, 2) : null,
      usdcAllowanceToSale: allowance,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- retiredKey stands
    // for retiredSpenders (a per-render array; the joined addresses are the fact)
  }, [address, saleAddr, synAddr, retiredKey]);

  useEffect(() => {
    let alive = true;
    void refresh(() => alive);
    return () => {
      alive = false;
    };
  }, [refresh]);

  const onAvalanche = chainId === avalanche.id;

  // REVOKE = approve(spender, 0), the member's own wallet act — the SAME act
  // for the active sale and a sealed one (generalized 2026-07-30 with the
  // sealed-engine rows). Simulate first — a transaction that would revert is
  // never offered for signature.
  const revoke = useCallback(
    async (spender: string) => {
      if (!address || !usdcToken || busy) return;
      setBusy(true);
      setError(null);
      try {
        await publicClient.simulateContract({
          address: getAddress(usdcToken),
          abi: ERC20_APPROVE_ABI,
          functionName: "approve",
          args: [getAddress(spender), 0n],
          account: getAddress(address),
        });
        const hash = await writeContractAsync({
          address: getAddress(usdcToken),
          abi: ERC20_APPROVE_ABI,
          functionName: "approve",
          args: [getAddress(spender), 0n],
          chainId: avalanche.id,
        });
        // The chain can REFUSE a mined transaction (2026-08-04 twin search):
        // presenting its hash as the act's receipt would be a false receipt.
        const outcome = await confirmTransaction(hash);
        if (outcome.kind === "refused") {
          setError(
            `The chain refused this revocation (${hash.slice(0, 10)}…${hash.slice(-6)}) — your approval is unchanged. Only the network fee was spent.`,
          );
          await refresh();
          return;
        }
        // "unread" says nothing about the transaction, so the honest move is
        // the one this panel already makes: re-read the allowance from chain.
        if (outcome.kind === "accepted") setLastTx(hash);
        await refresh();
      } catch (e) {
        setError(explainError(e));
      } finally {
        setBusy(false);
      }
    },
    [address, usdcToken, busy, writeContractAsync, refresh],
  );

  // Signed (SignInWall let us through) but the wallet is disconnected (Q-B):
  // the session/membership is intact, but reading LIVE balances needs the
  // connected wallet's address. Offer a reconnect — never the sign-in wall.
  if (!address) {
    return (
      <Card className="p-5 border-border/50 bg-card/40">
        <p className="text-sm text-muted-foreground">
          You're signed in, but your wallet is disconnected. Reconnect it to read
          your live balances and approvals — own-row only, never a lookup of anyone else.
        </p>
        <Button size="sm" variant="outline" className="mt-3" onClick={() => openConnectModal?.()}>
          <WalletIcon className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" /> Reconnect wallet
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

      {/* D-TRUTH D5: your OWN Archive artifact holdings — a live per-artifact
          balance read (the own-balance class), zero shown as a real zero. */}
      <Card className="p-4 border-border/50 bg-card/40">
        <p className="text-xs text-muted-foreground mb-1">Your Archive artifacts</p>
        {artifacts !== null ? (
          <div
            className="flex flex-wrap items-baseline gap-x-6 gap-y-1"
            data-testid="wallet-artifact-holdings"
          >
            {artifacts.map((a) => (
              <p key={a.id} className="font-mono text-lg text-foreground">
                {a.count}{" "}
                <span className="text-xs text-muted-foreground">
                  × {a.label}
                </span>
              </p>
            ))}
          </div>
        ) : (
          <p
            className="font-mono text-lg text-foreground"
            data-testid="wallet-artifact-holdings"
          >
            —{" "}
            <span className="font-sans text-xs text-muted-foreground">
              holdings unreadable right now (nothing is assumed)
            </span>
          </p>
        )}
      </Card>

      {/* THE APPROVALS PANEL — known protocol spenders only, own-row. */}
      <Card className="p-5 border-border/50 bg-card/40">
        <h3 className="text-base font-medium text-foreground mb-1">Approvals — known spenders</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
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
              <p className="text-xs text-muted-foreground mt-0.5" data-testid="wallet-usdc-allowance">
                {allowance === null
                  ? "allowance unreadable right now (nothing is assumed)"
                  : allowance === 0n
                    ? "no standing approval — clean"
                    : <span className="font-mono">{`approved: ${formatRawUnits(allowance.toString(), 6)} USDC`}</span>}
              </p>
            </div>
            {allowance !== null && allowance > 0n && saleAddr ? (
              !onAvalanche ? (
                <Button size="sm" variant="outline" disabled={switching} onClick={() => switchChain({ chainId: avalanche.id })}>
                  {switching ? "Switching…" : "Switch to Avalanche"}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void revoke(saleAddr)}
                  data-testid="button-revoke-usdc-sale"
                >
                  {busy ? "Waiting for your wallet…" : "Revoke (approve 0) — you sign"}
                </Button>
              )
            ) : null}
          </div>
        </div>
        {/* Sealed engines — a row appears ONLY when a standing approval is
            found on one (an abandoned checkout's leftover); revoking is the
            same signed act. */}
        {(retiredAllowances ?? [])
          .filter((s) => s.allowance > 0n)
          .map((s) => (
            <div key={s.id} className="rounded-md border border-warning/40 bg-background/40 p-3 mt-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-foreground">USDC → {s.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5" data-testid={`wallet-usdc-allowance-${s.id}`}>
                    <span className="font-mono">{`approved: ${formatRawUnits(s.allowance.toString(), 6)} USDC`}</span>{" "}
                    — a standing approval on a sealed engine; it can only be
                    revoked here, never used by a new purchase.
                  </p>
                </div>
                {!onAvalanche ? (
                  <Button size="sm" variant="outline" disabled={switching} onClick={() => switchChain({ chainId: avalanche.id })}>
                    {switching ? "Switching…" : "Switch to Avalanche"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy}
                    onClick={() => void revoke(s.addr)}
                    data-testid={`button-revoke-usdc-${s.id}`}
                  >
                    {busy ? "Waiting for your wallet…" : "Revoke (approve 0) — you sign"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        {retiredUnreadable > 0 ? (
          <p className="text-xs text-muted-foreground mt-2">
            {retiredUnreadable} sealed engine&apos;s approval state could not be
            read right now — nothing is assumed clean.
          </p>
        ) : null}
        {error ? (
          <p className="flex items-start gap-2 text-xs text-destructive mt-3">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
          </p>
        ) : null}
        {lastTx ? (
          <p className="text-xs text-muted-foreground mt-3">
            Revoked — your own signed transaction:{" "}
            {explorerOrigin ? (
              <a
                href={`${explorerOrigin}/tx/${lastTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-proof transition-colors hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:rounded-sm"
              >
                {lastTx.slice(0, 10)}…{lastTx.slice(-6)}
                <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
              </a>
            ) : (
              <span className="font-mono">{lastTx.slice(0, 10)}…{lastTx.slice(-6)}</span>
            )}
          </p>
        ) : null}
      </Card>

      {/* The pool pointer — INTERNAL to /liquidity (L-1 law: the LP links
          never travel without their page context and Risk Notice). */}
      <Card className="p-4 border-border/50 bg-card/20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-foreground">SYN/USDC pool (LFJ)</p>
            <p className="text-sm text-muted-foreground mt-0.5">
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

// The member-account gate wraps the panel: nothing personal renders (and no
// live read fires) until the session is S4. Resolved from the SESSION, never
// the wagmi address — this is the fix for the "balances while logged out" leak.
export default function MemberWalletPanel() {
  return (
    <SignInWall
      teaser={
        <p className="text-sm text-foreground leading-relaxed">
          Your own SYN and USDC balances, your Archive artifacts, and your
          approvals toward the protocol's known contracts live here — read live
          from the chain, own-row only.
        </p>
      }
    >
      <WalletPanelBody />
    </SignInWall>
  );
}
