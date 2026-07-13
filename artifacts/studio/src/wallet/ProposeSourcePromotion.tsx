// wallet/ProposeSourcePromotion.tsx (build-time-gated wallet module)
//
// LADDER-PROMOTION-SCREEN — the founder's PERSISTENT REMINDER + the promotion
// PROPOSE flow (Constitution §④ Form 2, second instance of the pattern).
//
// The laws (CONNECTOR_LADDER_POLICY + the founder's simple-transparency rule):
//   · The threshold DECIDES; nobody grants or refuses; the signature EXECUTES.
//   · updateSourceTerms with ONLY commissionBps changed — every other term is
//     resubmitted VERBATIM from the LIVE record; the contract itself reverts
//     on any wallet drift (SourceWalletMismatch / PayoutWalletChangeRequiresRecovery).
//   · No gap compensation: the rate applies at on-chain recording, never
//     retroactively; the waiting is visible and dated (the member's screen
//     and the public SourceTermsUpdated event carry the dates).
//   · The reminder is persistent: this panel announces the due count whenever
//     ANY promotion is unsigned, until every one is signed.
//
// Identity discipline: the served snapshot is OPAQUE (no raw sourceIds — the
// R5 privacy boundary), so binding a due row to a signable transaction is a
// FOUNDER ACT: he enters the member's wallet; the screen derives the
// canonical sourceId, hashes it, and only proceeds when it MATCHES the due
// row. No directory exists and none is created here.

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";
import { avalanche } from "viem/chains";
import { BellRing, CheckCircle2, ExternalLink, ShieldAlert } from "lucide-react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  publicClient,
  readRegistryOwner,
  readSourceRecord,
  type SourceRecordRead,
} from "@/lib/chainReads";
import { deriveSourceId } from "@/lib/sourceIdentity";
import {
  INTRODUCTION_INDEX_SNAPSHOT,
  type IntroductionIndexSourceStats,
} from "@/config/introductionIndexSnapshot";

// updateSourceTerms — field names/order transcribed from SourceRegistryV1.sol
// (struct SourceTerms lines 83–95; updateSourceTerms line 190).
const REGISTRY_UPDATE_ABI = [
  {
    type: "function",
    name: "updateSourceTerms",
    stateMutability: "nonpayable",
    inputs: [
      { name: "sourceId", type: "bytes32" },
      {
        name: "terms",
        type: "tuple",
        components: [
          { name: "sourceWallet", type: "address" },
          { name: "sourceClass", type: "uint8" },
          { name: "commissionBps", type: "uint16" },
          { name: "scope", type: "uint8" },
          { name: "startTime", type: "uint64" },
          { name: "endTime", type: "uint64" },
          { name: "grossCap", type: "uint256" },
          { name: "perBuyerCap", type: "uint256" },
          { name: "appliesToRepeatPurchases", type: "bool" },
          { name: "payoutWallet", type: "address" },
          { name: "metadataHash", type: "bytes32" },
        ],
      },
    ],
    outputs: [],
  },
] as const;

const KNOWN_REVERTS: readonly (readonly [string, string])[] = [
  ["SourceWalletMismatch", "The source wallet does not match the record — terms are resubmitted verbatim; nothing else may change."],
  ["PayoutWalletChangeRequiresRecovery", "The commission-destination wallet cannot change in a promotion — that is a separate owner recovery act."],
  ["InvalidCommission", "The rate is above the contract's cap for this class."],
  ["UnknownSource", "The registry does not know this source id."],
  ["MissingMetadata", "The terms-document hash is required for this class and scope."],
  ["OwnableUnauthorizedAccount", "The connected wallet is not the registry owner — only the owner can sign this."],
] as const;

function explainError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/user rejected|denied|rejected the request/i.test(raw)) {
    return "You declined the signature. Nothing was sent.";
  }
  for (const [name, text] of KNOWN_REVERTS) {
    if (raw.includes(name)) return text;
  }
  return `The transaction did not go through: ${(raw.split("\n")[0] ?? raw).slice(0, 160)}.`;
}

function addressFromExplorerUrl(url: string): string | null {
  return url.match(/\/address\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}
function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Browser twin of the server's opaque sourceKey (sha256, prefixed, 24 hex). */
async function sourceKeyOfBrowser(sourceId: string): Promise<string> {
  const bytes = new TextEncoder().encode(sourceId.toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `src_${hex.slice(0, 24)}`;
}

type DueRow = readonly [string, IntroductionIndexSourceStats];

export default function ProposeSourcePromotion() {
  const { address, chainId: walletChainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();

  const { data: verifyData } = useGetProtocolVerifyLinks();
  const registryUrl =
    verifyData?.links?.find((l) => l.id === "sourceRegistry")?.url ?? null;
  const registryAddr = registryUrl ? addressFromExplorerUrl(registryUrl) : null;

  const due: DueRow[] = Object.entries(INTRODUCTION_INDEX_SNAPSHOT.bySource).filter(
    ([, s]) => s.promotionDue,
  );

  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  const [walletInput, setWalletInput] = useState("");
  const [bound, setBound] = useState<{
    row: DueRow;
    sourceId: `0x${string}`;
    record: SourceRecordRead;
  } | null>(null);
  const [bindError, setBindError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  useEffect(() => {
    if (!registryAddr) return;
    let active = true;
    void readRegistryOwner(registryAddr).then((o) => {
      if (active) setOwner(o);
    });
    return () => {
      active = false;
    };
  }, [registryAddr]);

  const onAvalanche = walletChainId === avalanche.id;
  const connectedIsOwner =
    !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  // Bind a wallet to a due row: derive → hash → MATCH a due row → read the
  // live record. Fail closed at every step; nothing is signed over a guess.
  const bind = useCallback(async () => {
    setBindError(null);
    setBound(null);
    const wallet = walletInput.trim();
    if (!registryAddr || !isAddress(wallet)) {
      setBindError("Enter a valid member wallet address.");
      return;
    }
    const sourceId = deriveSourceId(wallet);
    if (!sourceId) {
      setBindError("The source id could not be derived.");
      return;
    }
    const key = await sourceKeyOfBrowser(sourceId);
    const row = due.find(([k]) => k === key) ?? null;
    if (!row) {
      setBindError(
        "This wallet's source does not match any DUE promotion row — nothing to sign for it.",
      );
      return;
    }
    const record = await readSourceRecord(registryAddr, sourceId);
    if (!record || !record.exists) {
      setBindError("The live registry record could not be read (fail closed).");
      return;
    }
    if (record.commissionBps !== row[1].currentBps) {
      setBindError(
        "The live rate differs from the indexed rate — rebuild the introduction index before signing (fail closed).",
      );
      return;
    }
    setBound({ row, sourceId, record });
  }, [walletInput, registryAddr, due]);

  const sign = useCallback(async () => {
    if (!bound || !registryAddr || !connectedIsOwner || !onAvalanche) return;
    setBusy(true);
    setError(null);
    try {
      // Terms VERBATIM from the live record; ONLY commissionBps changes.
      const r = bound.record;
      const hash = await writeContractAsync({
        address: registryAddr as `0x${string}`,
        abi: REGISTRY_UPDATE_ABI,
        functionName: "updateSourceTerms",
        args: [
          bound.sourceId,
          {
            sourceWallet: r.sourceWallet as `0x${string}`,
            sourceClass: r.sourceClass,
            commissionBps: bound.row[1].entitledBps,
            scope: r.scope,
            startTime: BigInt(r.startTime),
            endTime: BigInt(r.endTime),
            grossCap: BigInt(r.grossCap),
            perBuyerCap: BigInt(r.perBuyerCap),
            appliesToRepeatPurchases: r.appliesToRepeatPurchases,
            payoutWallet: r.payoutWallet as `0x${string}`,
            metadataHash: r.metadataHash,
          },
        ],
        chainId: avalanche.id,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setLastTx(hash);
      setBound(null);
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(false);
    }
  }, [bound, registryAddr, connectedIsOwner, onAvalanche, writeContractAsync]);

  if (due.length === 0) {
    return (
      <Card className="p-4 border-border/50 bg-card/40">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Connector ladder: no promotion is due as of block{" "}
          {INTRODUCTION_INDEX_SNAPSHOT.asOfBlock}. The reminder returns here the
          moment a threshold is crossed.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-primary/40 bg-primary/5 space-y-4">
      {/* THE PERSISTENT REMINDER — renders until every due promotion is signed. */}
      <div className="flex items-start gap-2">
        <BellRing className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <h3 className="text-base font-medium text-foreground">
            {due.length} promotion{due.length > 1 ? "s" : ""} due — awaiting your signature
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The threshold decided; your signature executes. Only the rate
            changes — every other term is resubmitted verbatim (the contract
            reverts otherwise). The raise applies at on-chain recording, never
            retroactively; the waiting stays visible and dated on the
            member&apos;s screen.
          </p>
        </div>
      </div>

      <div className="rounded-md border border-border/50 bg-background/40 p-3 text-xs space-y-1.5">
        {due.map(([key, s]) => (
          <div key={key} className="flex items-baseline justify-between gap-3">
            <span className="font-mono text-muted-foreground">{key}</span>
            <span className="text-foreground">
              {s.durableIntroductions} durable · {(s.currentBps / 100).toFixed(1)}% →{" "}
              {(s.entitledBps / 100).toFixed(1)}% ({s.entitledTitle})
              {s.crossedAtDateUtc ? ` · crossed ${s.crossedAtDateUtc}` : ""}
            </span>
          </div>
        ))}
        <p className="text-muted-foreground pt-1">
          Rows are identity-free by design. To sign one, enter the member&apos;s
          wallet — the screen derives its source id and only proceeds on an
          exact match with a due row.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
          spellCheck={false}
          placeholder="member wallet 0x…"
          className="flex-1 rounded-md border border-border/50 bg-background/60 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-primary/60"
          data-testid="input-promotion-wallet"
        />
        <Button variant="outline" size="sm" onClick={() => void bind()}>
          Match a due row
        </Button>
      </div>
      {bindError ? <p className="text-xs text-destructive">{bindError}</p> : null}

      {bound ? (
        <div className="rounded-md border border-border/50 bg-background/40 p-3 text-xs space-y-1.5">
          <p className="text-foreground font-medium">
            Ready to sign: {(bound.row[1].currentBps / 100).toFixed(1)}% →{" "}
            {(bound.row[1].entitledBps / 100).toFixed(1)}% ({bound.row[1].entitledTitle})
            for source wallet {short(bound.record.sourceWallet)}
          </p>
          <p className="text-muted-foreground">
            updateSourceTerms · ONLY commissionBps changes · commission
            destination {short(bound.record.payoutWallet)} unchanged (the
            contract enforces it) · public SourceTermsUpdated event dates the
            raise.
          </p>
          {!address ? (
            <Button size="sm" variant="outline" onClick={() => openConnectModal?.()}>
              Connect wallet
            </Button>
          ) : owner && !connectedIsOwner ? (
            <p className="flex items-start gap-2 text-destructive">
              <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              Only the registry owner {short(owner)} can sign — connect that wallet.
            </p>
          ) : address && !onAvalanche ? (
            <Button
              size="sm"
              variant="outline"
              disabled={switching}
              onClick={() => switchChain({ chainId: avalanche.id })}
            >
              {switching ? "Switching…" : "Switch to Avalanche C-Chain (43114)"}
            </Button>
          ) : (
            <Button
              size="sm"
              disabled={busy || !connectedIsOwner}
              onClick={() => void sign()}
              data-testid="button-propose-promotion-sign"
            >
              {busy ? "Waiting for your wallet…" : "Build updateSourceTerms — sign in your wallet"}
            </Button>
          )}
        </div>
      ) : null}

      {error ? (
        <p className="flex items-start gap-2 text-xs text-destructive">
          <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
        </p>
      ) : null}
      {lastTx && registryUrl ? (
        <p className="text-xs text-muted-foreground">
          Signed. Rebuild the introduction index so the served counters and the
          member&apos;s screen catch up.{" "}
          <a
            href={`${registryUrl.split("/address/")[0]}/tx/${lastTx}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-proof/80 hover:text-proof"
          >
            View the public event <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      ) : null}
    </Card>
  );
}
