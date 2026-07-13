// wallet/ProposeSourceCreate.tsx (build-time-gated wallet module)
//
// R2 — THE FIRST MEMBER SOURCE, via Constitution §④ FORM 2 ("PROPOSE"):
// the admin fills a form, the SYSTEM builds the transaction, and THE FOUNDER
// SIGNS IT IN HIS OWN WALLET. No key ever touches a server. This is the
// reusable PROPOSE pattern (Constitution §⑪ slice 4) — the first instance.
//
// The laws this screen obeys (SPEC_REFERRAL_SYSTEM + SourceRegistryV1.sol,
// read line-by-line — names lie, the .sol decides):
//   · createSource is onlyOwner: the screen reads the registry's owner() LIVE
//     and states WHICH wallet must sign; a mismatched connected wallet gets an
//     honest warning and no enabled button.
//   · Every source is BORN PAUSED (contract line 165). Create ≠ activate:
//     activation (setSourceStatus → ACTIVE) is a SECOND, separate signed act,
//     after the fail-closed behaviour is verified on the live /join quote.
//   · MEMBER_INTRODUCTION + LIFETIME REQUIRES metadataHash ≠ 0 — the hash of
//     the PUBLISHED program terms. The screen fetches the served terms file
//     and computes keccak256 over its raw bytes (lib/termsDocument): no
//     hardcoded hash, nothing to drift. No file → no create button.
//   · sourceId = keccak256("SYN.SOURCE.V1", wallet) — deterministic, permanent
//     (SPEC §③, closed list §⑫). The screen derives it and shows it.
//   · Params are the founder-decided SPEC §② terms: class MEMBER_INTRODUCTION,
//     500 bps, LIFETIME, no caps, repeat purchases apply, payoutWallet =
//     sourceWallet. Everything is displayed IN CLEAR before signing, with the
//     irreversible parts named (Constitution Form 2: "chaque paramètre, en
//     clair, et ce qui est IRRÉVERSIBLE").
//
// Fail-closed everywhere: any live read that fails removes the action instead
// of guessing. The registry address comes from the server's verify-links —
// never hardcoded in the client bundle.

import { useCallback, useEffect, useState } from "react";
import { useAccount, useSwitchChain, useWriteContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";
import { avalanche } from "viem/chains";
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  PenLine,
  RefreshCw,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  publicClient,
  readRegistryOwner,
  readSourceRecord,
  type SourceRecordRead,
} from "@/lib/chainReads";
import { deriveSourceId, SOURCE_ID_NAMESPACE } from "@/lib/sourceIdentity";
import { fetchTermsHash, TERMS_CANONICAL_URL } from "@/lib/termsDocument";

// SPEC §② — the founder-decided first-source terms (closed list §⑫).
// Enum codes verified against SourceRegistryV1.sol enum declarations:
//   SourceClass.MEMBER_INTRODUCTION = 0 · AttributionScope.LIFETIME = 3
//   SourceStatus: ACTIVE = 1, PAUSED = 2, REVOKED = 3.
const CLASS_MEMBER_INTRODUCTION = 0;
const SCOPE_LIFETIME = 3;
const STATUS_ACTIVE = 1;
const STATUS_PAUSED = 2;
const STATUS_REVOKED = 3;
const COMMISSION_BPS = 500;

// Write ABI — field names, order, and types transcribed from
// SourceRegistryV1.sol (struct SourceTerms, lines 83–95; createSource line
// 156; setSourceStatus line 233). Enums are uint8 on the wire.
const REGISTRY_WRITE_ABI = [
  {
    type: "function",
    name: "createSource",
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
  {
    type: "function",
    name: "setSourceStatus",
    stateMutability: "nonpayable",
    inputs: [
      { name: "sourceId", type: "bytes32" },
      { name: "status", type: "uint8" },
    ],
    outputs: [],
  },
] as const;

// Honest revert translation for the registry's custom errors (from the .sol
// error list) + Ownable. Anything unrecognized falls through — never invented.
const KNOWN_REVERTS: readonly (readonly [string, string])[] = [
  ["SourceExists", "A source with this id already exists — re-read the state below; there is nothing to create."],
  ["MissingMetadata", "The contract requires the terms-document hash for this class and scope — the screen must show a computed hash before signing."],
  ["InvalidCommission", "The commission rate is above the contract's cap for this class."],
  ["ZeroSourceId", "The source id is empty — enter a valid wallet so the id can be derived."],
  ["ZeroAddress", "The source or destination wallet is empty."],
  ["UnknownSource", "The registry does not know this source id."],
  ["InvalidStatus", "That status change is not allowed by the contract."],
  ["OwnableUnauthorizedAccount", "The connected wallet is not the registry owner — only the owner can sign this."],
] as const;

function explainError(e: unknown): string {
  const raw = e instanceof Error ? e.message : String(e);
  if (/user rejected|denied|rejected the request/i.test(raw)) {
    return "You declined the signature. Nothing was sent.";
  }
  if (/chain mismatch|ChainMismatch|does not match the target chain/i.test(raw)) {
    return "Your wallet is on another network. Switch to Avalanche C-Chain (43114) and retry — nothing was sent.";
  }
  for (const [name, text] of KNOWN_REVERTS) {
    if (raw.includes(name)) return text;
  }
  const firstLine = raw.split("\n")[0] ?? raw;
  return `The transaction did not go through: ${firstLine.slice(0, 180)}. Nothing is assumed — verify your wallet activity on the explorer.`;
}

function addressFromExplorerUrl(url: string): string | null {
  return url.match(/\/address\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}
function explorerBaseFromUrl(url: string): string | null {
  return url.match(/^(.*)\/address\/0x[0-9a-fA-F]{40}\b/)?.[1] ?? null;
}
function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
function shortHash(h: string): string {
  return `${h.slice(0, 10)}…${h.slice(-6)}`;
}

// The terms document, fetched from this origin and hashed over the raw bytes
// (lib/termsDocument — the exact commitment the contract stores). Fail closed.
type TermsState =
  | { kind: "loading" }
  | { kind: "unavailable" }
  | { kind: "ready"; hash: `0x${string}`; bytes: number };

function useTermsHash(): TermsState {
  const [state, setState] = useState<TermsState>({ kind: "loading" });
  useEffect(() => {
    let active = true;
    void fetchTermsHash().then((read) => {
      if (!active) return;
      setState(read ? { kind: "ready", hash: read.hash, bytes: read.bytes } : { kind: "unavailable" });
    });
    return () => {
      active = false;
    };
  }, []);
  return state;
}

type Busy = "create" | "activate" | null;

export default function ProposeSourceCreate() {
  const { address, chainId: walletChainId } = useAccount();
  const { switchChain, isPending: switching } = useSwitchChain();
  const { openConnectModal } = useConnectModal();
  const { writeContractAsync } = useWriteContract();

  // Registry address + explorer base: server-sourced (verify-links), never
  // hardcoded. Fail closed when absent.
  const { data: verifyData } = useGetProtocolVerifyLinks();
  const registryUrl =
    verifyData?.links.find((l) => l.id === "sourceRegistry")?.url ?? null;
  const registryAddr = registryUrl ? addressFromExplorerUrl(registryUrl) : null;
  const explorerBase = registryUrl ? explorerBaseFromUrl(registryUrl) : null;

  const terms = useTermsHash();

  // The wallet the source is FOR (sourceWallet AND payoutWallet — SPEC §②).
  // Defaults to the connected wallet once known; the admin may enter another.
  const [walletInput, setWalletInput] = useState("");
  useEffect(() => {
    if (address && walletInput === "") setWalletInput(address);
  }, [address, walletInput]);
  const sourceWallet = isAddress(walletInput.trim()) ? walletInput.trim() : null;
  const sourceId = sourceWallet ? deriveSourceId(sourceWallet) : null;

  // Live registry state: owner() (who must sign) + the derived id's record.
  const [owner, setOwner] = useState<string | null | undefined>(undefined);
  const [record, setRecord] = useState<SourceRecordRead | null | undefined>(undefined);
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!registryAddr) return;
    const [o, r] = await Promise.all([
      readRegistryOwner(registryAddr),
      sourceId ? readSourceRecord(registryAddr, sourceId) : Promise.resolve(undefined),
    ]);
    setOwner(o);
    if (sourceId) setRecord(r);
    else setRecord(undefined);
  }, [registryAddr, sourceId]);

  useEffect(() => {
    setOwner(undefined);
    setRecord(undefined);
    void refresh();
  }, [refresh]);

  const onAvalanche = walletChainId === avalanche.id;
  const connectedIsOwner =
    !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  // One gate for BOTH signed acts, fail-closed: every live read proven, the
  // right chain, the right signer. (record === null means the state read
  // FAILED — that also blocks; unknown state is never signed over.)
  const signingReady =
    !!registryAddr &&
    !!sourceWallet &&
    !!sourceId &&
    terms.kind === "ready" &&
    owner !== undefined &&
    owner !== null &&
    connectedIsOwner &&
    onAvalanche &&
    record !== undefined &&
    record !== null;

  const doCreate = useCallback(async () => {
    if (!signingReady || !registryAddr || !sourceId || !sourceWallet) return;
    if (terms.kind !== "ready") return;
    setBusy("create");
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: registryAddr as `0x${string}`,
        abi: REGISTRY_WRITE_ABI,
        functionName: "createSource",
        args: [
          sourceId,
          {
            sourceWallet: sourceWallet as `0x${string}`,
            sourceClass: CLASS_MEMBER_INTRODUCTION,
            commissionBps: COMMISSION_BPS,
            scope: SCOPE_LIFETIME,
            startTime: 0n,
            endTime: 0n,
            grossCap: 0n,
            perBuyerCap: 0n,
            appliesToRepeatPurchases: true,
            payoutWallet: sourceWallet as `0x${string}`,
            metadataHash: terms.hash,
          },
        ],
        chainId: avalanche.id,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setLastTx(hash);
      await refresh();
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(null);
    }
  }, [signingReady, registryAddr, sourceId, sourceWallet, terms, writeContractAsync, refresh]);

  const doActivate = useCallback(async () => {
    if (!signingReady || !registryAddr || !sourceId) return;
    setBusy("activate");
    setError(null);
    try {
      const hash = await writeContractAsync({
        address: registryAddr as `0x${string}`,
        abi: REGISTRY_WRITE_ABI,
        functionName: "setSourceStatus",
        args: [sourceId, STATUS_ACTIVE],
        chainId: avalanche.id,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setLastTx(hash);
      await refresh();
    } catch (e) {
      setError(explainError(e));
    } finally {
      setBusy(null);
    }
  }, [signingReady, registryAddr, sourceId, writeContractAsync, refresh]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!registryAddr) {
    return (
      <Card className="p-5 border-border/50 bg-card/40">
        <PanelHeading />
        <p className="text-sm text-muted-foreground">
          The Source Registry address could not be read from the server&apos;s
          verify-links. Nothing is proposed on an unproven address.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-5 border-border/50 bg-card/40 space-y-5">
      <PanelHeading />

      {/* WHO MUST SIGN — owner() read live, stated before anything else. */}
      <div className="rounded-md border border-border/50 bg-background/40 p-3 text-sm space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Registry owner (read live) — the wallet that must sign</span>
          <span className="font-mono text-xs text-foreground">
            {owner === undefined ? "reading…" : owner === null ? "unavailable — fail closed" : short(owner)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-muted-foreground">Connected wallet</span>
          <span className="font-mono text-xs text-foreground">
            {address ? short(address) : "not connected"}
          </span>
        </div>
        {!address ? (
          <Button size="sm" variant="outline" onClick={() => openConnectModal?.()} className="mt-1">
            <Wallet className="h-3.5 w-3.5 mr-1.5" /> Connect wallet
          </Button>
        ) : owner && !connectedIsOwner ? (
          <p className="flex items-start gap-2 text-xs text-destructive pt-1">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            The connected wallet is not the registry owner. The transaction can
            only be signed by {short(owner)} — connect that wallet to proceed.
          </p>
        ) : null}
        {address && !onAvalanche ? (
          <Button
            size="sm"
            variant="outline"
            disabled={switching}
            onClick={() => switchChain({ chainId: avalanche.id })}
            className="mt-1"
          >
            {switching ? "Switching…" : "Switch to Avalanche C-Chain (43114)"}
          </Button>
        ) : null}
      </div>

      {/* THE TERMS DOCUMENT — fetched + hashed in the browser, fail closed. */}
      <div className="rounded-md border border-border/50 bg-background/40 p-3 text-sm space-y-1.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          <FileText className="h-3.5 w-3.5" />
          Program terms document (hashed on-chain as metadataHash)
        </div>
        {terms.kind === "loading" ? (
          <p className="text-xs text-muted-foreground">Fetching and hashing the served document…</p>
        ) : terms.kind === "unavailable" ? (
          <p className="flex items-start gap-2 text-xs text-destructive">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            The terms document could not be fetched from this origin. Without
            the document there is no hash, and the contract would revert
            (MissingMetadata) — nothing to sign.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">keccak256 (computed from the served bytes just now)</span>
              <span className="font-mono text-xs text-foreground">{shortHash(terms.hash)}</span>
            </div>
            <a
              href={TERMS_CANONICAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-proof/80 hover:text-proof transition-colors"
            >
              {TERMS_CANONICAL_URL} <ExternalLink className="h-3 w-3" />
            </a>
          </>
        )}
      </div>

      {/* THE FORM — one input; everything else is the founder-decided terms. */}
      <div className="space-y-2">
        <label htmlFor="propose-source-wallet" className="text-sm text-muted-foreground">
          Member wallet this source is for (sourceWallet — also the wallet that
          receives the commission)
        </label>
        <input
          id="propose-source-wallet"
          value={walletInput}
          onChange={(e) => setWalletInput(e.target.value)}
          spellCheck={false}
          placeholder="0x…"
          className="w-full rounded-md border border-border/50 bg-background/60 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-primary/60"
          data-testid="input-propose-source-wallet"
        />
        {walletInput.trim() !== "" && !sourceWallet ? (
          <p className="text-xs text-destructive">Not a valid address.</p>
        ) : null}
      </div>

      {/* EVERY PARAMETER IN CLEAR + what is irreversible (Form 2 law). */}
      {sourceWallet && sourceId ? (
        <div className="rounded-md border border-border/50 bg-background/40 p-3 text-xs space-y-1.5">
          <ParamRow
            label="sourceId (permanent — derived, never changes)"
            value={shortHash(sourceId)}
            mono
          />
          <ParamRow label="derivation" value={`keccak256("${SOURCE_ID_NAMESPACE}", wallet)`} mono />
          <ParamRow label="sourceClass" value="MEMBER_INTRODUCTION (0) — requires the member's wallet to hold SYN at each referred purchase" />
          <ParamRow label="commissionBps" value="500 (5% — Emerging Connector, the starting rung)" />
          <ParamRow label="scope" value="LIFETIME (3) — no window; repeat purchases apply" />
          <ParamRow label="grossCap / perBuyerCap" value="0 / 0 — no caps" />
          <ParamRow label="appliesToRepeatPurchases" value="true" />
          <ParamRow
            label="payoutWallet (IRREVERSIBLE by term updates — changing it later is a separate owner recovery act)"
            value={short(sourceWallet)}
            mono
          />
          <ParamRow
            label="metadataHash (the terms document above)"
            value={terms.kind === "ready" ? shortHash(terms.hash) : "— required, missing"}
            mono
          />
          <p className="text-muted-foreground pt-1">
            Irreversible by design: the source is created PAUSED and can later
            be paused or revoked, but never deleted; the sourceId and the
            creation event are permanent on-chain records.
          </p>
        </div>
      ) : null}

      {/* THE STATE + THE ONE NEXT ACT — from the live record, fail closed. */}
      {sourceId ? (
        <StateAndAction
          record={record}
          signingReady={signingReady}
          busy={busy}
          onCreate={doCreate}
          onActivate={doActivate}
          onRefresh={() => void refresh()}
          sourceId={sourceId}
          explorerBase={explorerBase}
          registryAddr={registryAddr}
          termsHash={terms.kind === "ready" ? terms.hash : null}
        />
      ) : null}

      {error ? (
        <p className="flex items-start gap-2 text-xs text-destructive">
          <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" /> {error}
        </p>
      ) : null}
      {lastTx && explorerBase ? (
        <a
          href={`${explorerBase}/tx/${lastTx}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-proof/80 hover:text-proof transition-colors"
        >
          Last signed transaction: {shortHash(lastTx)} <ExternalLink className="h-3 w-3" />
        </a>
      ) : null}
    </Card>
  );
}

function PanelHeading() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <PenLine className="h-4 w-4 text-primary" />
        <h3 className="text-base font-medium text-foreground">
          Create a member referral source — Propose, founder signs
        </h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Form 2 of the authority constitution: this screen builds the exact
        on-chain transaction and shows every parameter; only the registry
        owner&apos;s wallet can sign it. Nothing here moves without that
        signature.
      </p>
    </div>
  );
}

function ParamRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-foreground text-right ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

// The derived id's live state and the SINGLE next act it allows:
//   unknown → CREATE (born PAUSED) · PAUSED → verify fail-closed, then
//   ACTIVATE · ACTIVE → done (the shareable link) · REVOKED → no act.
function StateAndAction({
  record,
  signingReady,
  busy,
  onCreate,
  onActivate,
  onRefresh,
  sourceId,
  explorerBase,
  registryAddr,
  termsHash,
}: {
  record: SourceRecordRead | null | undefined;
  signingReady: boolean;
  busy: Busy;
  onCreate: () => void;
  onActivate: () => void;
  onRefresh: () => void;
  sourceId: `0x${string}`;
  explorerBase: string | null;
  registryAddr: string;
  termsHash: `0x${string}` | null;
}) {
  const joinPath = `/join?source=${sourceId}`;
  const joinUrl = `https://thesyndicate.money${joinPath}`;

  if (record === undefined) {
    return <p className="text-xs text-muted-foreground">Reading the live registry state for this id…</p>;
  }
  if (record === null) {
    return (
      <p className="flex items-start gap-2 text-xs text-destructive">
        <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        The registry state for this id could not be read. Fail closed — nothing
        is signed over an unknown state.
        <Button size="sm" variant="ghost" onClick={onRefresh} className="ml-1 h-6 px-2">
          <RefreshCw className="h-3 w-3 mr-1" /> Re-read
        </Button>
      </p>
    );
  }

  if (!record.exists) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          This sourceId does not exist on the registry yet. Signing the
          transaction below creates it in PAUSED status — creation and
          activation are two separate signed acts, on purpose: while PAUSED,
          the live /join quote must show NO referral line (the fail-closed
          proof), and only then is activation signed.
        </p>
        <Button
          disabled={!signingReady || busy !== null}
          onClick={onCreate}
          data-testid="button-propose-create-source"
        >
          {busy === "create" ? "Waiting for your wallet…" : "Build createSource — sign in your wallet"}
        </Button>
      </div>
    );
  }

  const hashMatches = termsHash !== null && record.metadataHash.toLowerCase() === termsHash.toLowerCase();

  if (record.status === STATUS_PAUSED) {
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Source created — status: PAUSED (as designed).
        </p>
        {!hashMatches ? (
          <p className="flex items-start gap-2 text-xs text-destructive">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            The on-chain metadataHash does not match the served terms document.
            Do not activate until they match — the published document must be
            the committed one.
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Fail-closed check before activating: open{" "}
          <a href={joinPath} className="text-proof/80 hover:text-proof underline underline-offset-2">
            {joinPath.slice(0, 24)}…
          </a>{" "}
          — the quote must show NO referral line while the source is PAUSED.
          Once verified, sign the activation.
        </p>
        <Button
          disabled={!signingReady || busy !== null || !hashMatches}
          onClick={onActivate}
          data-testid="button-propose-activate-source"
        >
          {busy === "activate" ? "Waiting for your wallet…" : "Build setSourceStatus(ACTIVE) — sign in your wallet"}
        </Button>
      </div>
    );
  }

  if (record.status === STATUS_ACTIVE) {
    return (
      <div className="space-y-2">
        <p className="flex items-center gap-2 text-sm text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Source ACTIVE — the referral link is live.
        </p>
        <p className="font-mono text-xs text-foreground break-all">{joinUrl}</p>
        <p className="text-xs text-muted-foreground">
          The rate shown to a buyer always comes from the live quote (the
          contract&apos;s own effective computation), never from the registry&apos;s
          configured rate.
        </p>
        {explorerBase ? (
          <a
            href={`${explorerBase}/address/${registryAddr}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-proof/80 hover:text-proof transition-colors"
          >
            Verify on the registry <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
      </div>
    );
  }

  if (record.status === STATUS_REVOKED) {
    return (
      <p className="flex items-start gap-2 text-xs text-destructive">
        <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        This source is REVOKED on the registry. This screen proposes no act on
        a revoked source.
      </p>
    );
  }

  // Exists but a status this screen does not act on (defensive: NONE with an
  // existing wallet should be impossible per the contract).
  return (
    <p className="text-xs text-muted-foreground">
      Source exists with status code {record.status} — no act proposed.
      <Button size="sm" variant="ghost" onClick={onRefresh} className="ml-1 h-6 px-2">
        <RefreshCw className="h-3 w-3 mr-1" /> Re-read
      </Button>
    </p>
  );
}
