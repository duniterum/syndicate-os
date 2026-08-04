// chainReads.ts — the CLIENT chain-read layer (viem public client).
// ===========================================================================
// THE CLIENT/SERVER BOUNDARY LAW — the WHY this file exists (do not optimize away):
//
//   THE SERVER SERVES THE PROTOCOL.   The client reads WHAT IS YOURS.
//
//   SERVER (cached, aggregate, ONE read for everyone):
//     the reality spine · burn · memberCount · vault · LP · the /join QUOTE ·
//     verifyLinks. A visitor on the homepage NEVER touches the chain — everything
//     comes from the server, cached.
//   CLIENT (live, personal, only when relevant — a wallet in hand):
//     sourceConfig(sourceId).payoutWallet — who gets paid, before I sign
//     knownMember + V1_MEMBER_ROOT        — the historical gate (irreversible)
//     balanceOf                           — MY SYN
//     allowance                           — MY approval
//
//   The PUBLIC RPC is enough because client volume is tiny: a few calls, once,
//   per connected wallet. The heavy, repeated reads are the server's, and cached.
//
//   The SERVER discipline does NOT change: it emits no MEMBER address and no
//   source terms (member-standing = own-row; source = two booleans). The CLIENT
//   reads the PUBLIC chain like an explorer — CANON_VISIBILITY_LAW: the chain is
//   public; showing a payoutWallet the buyer must see before signing is the law
//   working, not a violation. Contract ADDRESSES reach this layer FROM the server
//   (verifyLinks) — never hardcoded in the client bundle.
// ===========================================================================

import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  ExecutionRevertedError,
  fallback,
  getAddress,
  http,
  isAddress,
  zeroAddress,
  type TransactionReceipt,
} from "viem";
import { avalanche } from "viem/chains";
import type { BuySimulationVerdict } from "@/lib/sourceEligibility";

// Public, keyless Avalanche C-Chain RPC (same endpoints the server defaults to).
// Optional VITE_ overrides (validated https) — we will almost certainly never need
// them; the client's read volume is tiny. Four lines of insurance, not a plan.
const APPROVED_ENDPOINTS = [
  "https://api.avax.network/ext/bc/C/rpc",
  "https://avalanche-c-chain-rpc.publicnode.com",
] as const;

function httpsOrNull(v: unknown): string | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  try {
    return new URL(v).protocol === "https:" ? v : null;
  } catch {
    return null;
  }
}

const OVERRIDES = [
  httpsOrNull(import.meta.env.VITE_AVALANCHE_RPC_URL),
  httpsOrNull(import.meta.env.VITE_AVALANCHE_RPC_URL_FALLBACK),
].filter((u): u is string => u !== null);

const ENDPOINTS = OVERRIDES.length > 0 ? OVERRIDES : [...APPROVED_ENDPOINTS];

/** One public read client, created once. Read-only; never signs, never writes. */
export const publicClient = createPublicClient({
  chain: avalanche,
  transport: fallback(ENDPOINTS.map((u) => http(u))),
});

// SourceRegistryV1.sourceConfig(sourceId) → SourceRecord. Component order MUST
// match the contract struct exactly (canon: SOURCE_REGISTRY_V1_ABI). We read only
// payoutWallet (WHO gets paid — _payAcquisition pushes to payoutWallet, not
// sourceWallet), plus sourceWallet + status to assert the source is real & active.
const SOURCE_CONFIG_ABI = [
  {
    type: "function",
    name: "sourceConfig",
    stateMutability: "view",
    inputs: [{ name: "sourceId", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "sourceWallet", type: "address" },
          { name: "sourceClass", type: "uint8" },
          { name: "commissionBps", type: "uint16" },
          { name: "status", type: "uint8" },
          { name: "scope", type: "uint8" },
          { name: "startTime", type: "uint64" },
          { name: "endTime", type: "uint64" },
          { name: "grossCap", type: "uint256" },
          { name: "perBuyerCap", type: "uint256" },
          { name: "appliesToRepeatPurchases", type: "bool" },
          { name: "payoutWallet", type: "address" },
          { name: "metadataHash", type: "bytes32" },
          { name: "createdBy", type: "address" },
          { name: "updatedAt", type: "uint64" },
        ],
      },
    ],
  },
] as const;

// SourceStatus enum: NONE=0, ACTIVE=1, PAUSED=2, REVOKED=3.
const STATUS_ACTIVE = 1;

const SOURCE_ID_RE = /^0x[0-9a-fA-F]{64}$/;

export interface SourceRead {
  /** WHO gets paid (the address the contract pushes the acquisitionCost to). */
  readonly payoutWallet: string;
  /** The source's identity wallet (may differ from payoutWallet — deliberate). */
  readonly sourceWallet: string;
  /** Real (known) AND currently ACTIVE on the registry. */
  readonly active: boolean;
}

// MembershipSaleV3 reads for the historical gate (C1.3): knownMember tells us
// whether the live engine already knows a wallet; V1_MEMBER_ROOT is the
// immutable on-chain commitment the local historical set must re-verify
// against before the gate asserts anything. Both fail closed to null.
const HISTORICAL_GATE_ABI = [
  {
    type: "function",
    name: "knownMember",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "V1_MEMBER_ROOT",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bytes32" }],
  },
  {
    type: "function",
    name: "memberNumberOf",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * The connected wallet's OWN seat number on the live engine (0n = not a
 * member). Own-row only — used so the /join seat line can tell a seated
 * member the truth (a further buy adds SYN, never a second seat) instead of
 * the generic next-seat preview. Null on any failure — the caller falls back
 * to the generic, always-honest preview line.
 */
export async function readMemberNumberOf(
  saleAddress: string,
  wallet: string,
): Promise<bigint | null> {
  if (!isAddress(saleAddress) || !isAddress(wallet)) return null;
  try {
    return await publicClient.readContract({
      address: getAddress(saleAddress),
      abi: HISTORICAL_GATE_ABI,
      functionName: "memberNumberOf",
      args: [getAddress(wallet)],
    });
  } catch {
    return null;
  }
}

/**
 * Does the live sale engine already know this wallet (claimed or bought)?
 * Returns null on ANY failure — the caller must treat null as unverified and
 * fail closed (block), never guess.
 */
export async function readKnownMember(
  saleAddress: string,
  wallet: string,
): Promise<boolean | null> {
  if (!isAddress(saleAddress) || !isAddress(wallet)) return null;
  try {
    return await publicClient.readContract({
      address: getAddress(saleAddress),
      abi: HISTORICAL_GATE_ABI,
      functionName: "knownMember",
      args: [getAddress(wallet)],
    });
  } catch {
    return null;
  }
}

/**
 * The live historical-member Merkle root (immutable constructor constant on the
 * deployed sale). Null on any failure — fail closed.
 */
export async function readV1MemberRoot(
  saleAddress: string,
): Promise<`0x${string}` | null> {
  if (!isAddress(saleAddress)) return null;
  try {
    return await publicClient.readContract({
      address: getAddress(saleAddress),
      abi: HISTORICAL_GATE_ABI,
      functionName: "V1_MEMBER_ROOT",
    });
  } catch {
    return null;
  }
}

// C2 checkout reads: the sale's own USDC token (the EXACT token buy() pulls —
// read from the deployed immutable, never hardcoded), the buyer's allowance
// toward the sale (resumability: skip approve when already sufficient, never
// approve twice), and the buyer's balance (honest pre-check). All fail closed
// to null — the checkout blocks rather than guesses.
const SALE_USDC_ABI = [
  {
    type: "function",
    name: "USDC",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

const ERC20_READ_ABI = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** The deployed sale's USDC token address (its immutable). Null on failure. */
export async function readSaleUsdcToken(saleAddress: string): Promise<string | null> {
  if (!isAddress(saleAddress)) return null;
  try {
    return await publicClient.readContract({
      address: getAddress(saleAddress),
      abi: SALE_USDC_ABI,
      functionName: "USDC",
    });
  } catch {
    return null;
  }
}

/** Live ERC-20 allowance(owner → spender), raw base units. Null on failure. */
export async function readAllowance(
  tokenAddress: string,
  owner: string,
  spender: string,
): Promise<bigint | null> {
  if (!isAddress(tokenAddress) || !isAddress(owner) || !isAddress(spender)) return null;
  try {
    return await publicClient.readContract({
      address: getAddress(tokenAddress),
      abi: ERC20_READ_ABI,
      functionName: "allowance",
      args: [getAddress(owner), getAddress(spender)],
    });
  } catch {
    return null;
  }
}

// ── THE ONE PLACE A TRANSACTION IS CONFIRMED ────────────────────────────────
// A SIGNED TRANSACTION HAS THREE OUTCOMES, NEVER TWO. It can be accepted, it
// can be MINED AND REFUSED (`status: "reverted"` — included in a block, all
// effects rolled back, no logs), or it can be unreadable from here. Awaiting
// the receipt answers only the third; code that stops there treats a refusal
// as a success.
//
// The twin search on 2026-08-04 found that shape in FIVE places at once — the
// join buy, the join approval, createSource, setSourceStatus and the ladder
// promotion — and the founder had already hit it live: seven purchases the
// engine refused were announced to him as «the transaction confirmed». The
// activation site was worse than cosmetic: it closed a member's queue request
// and rang his bell off a transaction that may have reverted.
//
// So the rule lives HERE, once, and every write surface imports it. A caller
// cannot use this without reading the verdict — the receipt is inside it.
// `guard-source-eligibility` pins that no surface calls
// waitForTransactionReceipt directly again.
export type TransactionOutcome =
  /** Mined and accepted. The receipt's logs are real. */
  | { kind: "accepted"; receipt: TransactionReceipt }
  /** Mined and REFUSED by the contract. Nothing happened but the fee. */
  | { kind: "refused"; receipt: TransactionReceipt }
  /**
   * The wait itself failed. This says NOTHING about the transaction, which
   * stands or falls on the chain regardless of this app — callers must never
   * report it as a failure.
   */
  | { kind: "unread" };

export async function confirmTransaction(hash: `0x${string}`): Promise<TransactionOutcome> {
  let receipt: TransactionReceipt;
  try {
    receipt = await publicClient.waitForTransactionReceipt({ hash });
  } catch {
    return { kind: "unread" };
  }
  // THE RECEIPT MUST BE THIS TRANSACTION'S OWN (review catch, 2026-08-04).
  // viem follows a REPLACEMENT — if the buyer hits Cancel or Speed Up in his
  // wallet while the purchase is pending, the receipt that comes back belongs
  // to the replacing transaction. Reporting it as this one's would announce a
  // purchase confirmed and then link to a hash the chain does not hold.
  // A replacement is not this transaction, and we say nothing about it.
  if (receipt.transactionHash.toLowerCase() !== hash.toLowerCase()) {
    return { kind: "unread" };
  }
  return receipt.status !== "success"
    ? { kind: "refused", receipt }
    : { kind: "accepted", receipt };
}

// ── THE BUY CALL, and the only place its shape is written ───────────────────
// ONE buy ABI for the whole app: the write surface (JoinCheckout) imports it
// from here, so the call that is SIMULATED and the call that is SIGNED can
// never drift apart — a probe testing a different shape than the signature
// would prove nothing about the signature.
//
// THE CUSTOM ERRORS ARE PART OF THE ABI ON PURPOSE. Without them viem cannot
// decode a revert, and every honest translation in the checkout's KNOWN_REVERTS
// is unreachable — the buyer gets "reverted for an unknown reason" instead of
// words. Two of these are SELECTOR-VERIFIED against live mainnet reverts
// (2026-08-04): SourceNotEligible() = 0x2abb57d6 (a seated wallet re-buying on
// an explicit introduction) and SourceAlreadyLinked() (a wallet whose
// introduction is already recorded). The rest are name-derived from the
// engine's documented errors — decoding is BEST-EFFORT by design: an error
// this ABI cannot decode falls through to the raw reported message, which the
// checkout presents as reported and never as its own claim.
export const SALE_BUY_ABI = [
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
  { type: "error", name: "SourceNotEligible", inputs: [] },
  { type: "error", name: "SourceAlreadyLinked", inputs: [] },
  { type: "error", name: "SelfReferral", inputs: [] },
  { type: "error", name: "ReferrerNotSeated", inputs: [] },
  { type: "error", name: "SaleConcluded", inputs: [] },
  { type: "error", name: "BelowEraMinimum", inputs: [] },
  { type: "error", name: "ExceedsTxMax", inputs: [] },
  { type: "error", name: "AddressEraCapExceeded", inputs: [] },
  { type: "error", name: "SlippageExceeded", inputs: [] },
  { type: "error", name: "EraInventoryInsufficient", inputs: [] },
  { type: "error", name: "InsufficientInventory", inputs: [] },
  { type: "error", name: "ReserveFloorViolation", inputs: [] },
  { type: "error", name: "EnforcedPause", inputs: [] },
  { type: "error", name: "InvalidProof", inputs: [] },
] as const;

/**
 * Did the engine REFUSE, or did we simply fail to reach it? The difference
 * decides whether a referral may be dropped, so it is never guessed: a refusal
 * must be an actual revert surfaced by viem. Anything else — timeout, transport
 * error, wrong chain — is UNREADABLE and proves nothing.
 */
function verdictFromError(err: unknown): BuySimulationVerdict {
  if (err instanceof BaseError) {
    const reverted = err.walk(
      (e) => e instanceof ContractFunctionRevertedError || e instanceof ExecutionRevertedError,
    );
    if (reverted) return "refused";
  }
  // NO STRING SNIFFING (review catch, 2026-08-04). The earlier version also
  // graded any message CONTAINING "execution reverted" as a refusal, so a node
  // that wraps an unrelated failure in that wording could have stripped a
  // referral a referrer had earned. Only a revert viem itself identified
  // counts; everything else proves nothing and is unreadable.
  return "unreadable";
}

/**
 * The engine's own error NAME for a refusal (`SourceNotEligible`,
 * `SourceAlreadyLinked`, …), or null when it could not be decoded — which is
 * the honest answer for any error this ABI does not declare. The caller must
 * treat null as "no cause known" and never fill it in.
 */
export function revertName(err: unknown): string | null {
  if (!(err instanceof BaseError)) return null;
  const reverted = err.walk((e) => e instanceof ContractFunctionRevertedError);
  if (!(reverted instanceof ContractFunctionRevertedError)) return null;
  return reverted.data?.errorName ?? null;
}

/**
 * Ask the engine whether ONE EXACT purchase would go through — a static
 * eth_call from the buyer's own address. Signs nothing, moves nothing, changes
 * no state.
 *
 * SCOPE, stated because the caller acts on it: this answers for the CURRENT
 * chain state as seen by THIS app's RPC. It does not promise the wallet's own
 * node agrees, and it does not survive a state change between the probe and
 * the signature (the same race the fresh-quote law already accepts). It is
 * used ONLY to compare two calls that differ in one argument — the source id —
 * which is exactly the comparison that race cannot invert.
 */
export async function simulateBuy(args: {
  saleAddress: string;
  buyer: string;
  grossUsdc: bigint;
  sourceId: `0x${string}`;
  minSynOut: bigint;
}): Promise<{ verdict: BuySimulationVerdict; error: unknown }> {
  const { saleAddress, buyer, grossUsdc, sourceId, minSynOut } = args;
  if (!isAddress(saleAddress) || !isAddress(buyer)) {
    return { verdict: "unreadable", error: null };
  }
  try {
    await publicClient.simulateContract({
      address: getAddress(saleAddress),
      abi: SALE_BUY_ABI,
      functionName: "buy",
      args: [grossUsdc, getAddress(buyer), sourceId, minSynOut, []],
      account: getAddress(buyer),
    });
    return { verdict: "accepted", error: null };
  } catch (err) {
    return { verdict: verdictFromError(err), error: err };
  }
}

/** Live ERC-20 balanceOf(owner), raw base units. Null on failure. */
export async function readTokenBalance(
  tokenAddress: string,
  owner: string,
): Promise<bigint | null> {
  if (!isAddress(tokenAddress) || !isAddress(owner)) return null;
  try {
    return await publicClient.readContract({
      address: getAddress(tokenAddress),
      abi: ERC20_READ_ABI,
      functionName: "balanceOf",
      args: [getAddress(owner)],
    });
  } catch {
    return null;
  }
}

// D-TRUTH D5: the member's OWN Archive artifact holdings — a plain public
// ERC-1155 view (the boundary law's "what is yours" class: the client reads
// own balances; the contract address arrives from verify-links, never
// hardcoded). Minimal fragment authored here, the ERC20_READ_ABI precedent;
// shape pinned by the vendored canon ABI (archive-nft-abi.ts).
const ERC1155_READ_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** Live ERC-1155 balanceOf(account, id), raw count. Null on failure. */
export async function readArtifactBalance(
  contractAddress: string,
  owner: string,
  id: number,
): Promise<bigint | null> {
  if (!isAddress(contractAddress) || !isAddress(owner)) return null;
  if (!Number.isSafeInteger(id) || id < 0) return null;
  try {
    return await publicClient.readContract({
      address: getAddress(contractAddress),
      abi: ERC1155_READ_ABI,
      functionName: "balanceOf",
      args: [getAddress(owner), BigInt(id)],
    });
  } catch {
    return null;
  }
}

// R2 PROPOSE reads (Constitution §④ Form 2): the registry's live owner() —
// the ONLY wallet that can sign createSource/setSourceStatus (Ownable2Step) —
// and the FULL source record so the PROPOSE screen can show a derived
// sourceId's real state (unknown / PAUSED / ACTIVE / REVOKED) before proposing
// anything. Both fail closed to null; the screen shows no button it cannot prove.
const REGISTRY_OWNER_ABI = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

/** The registry's live owner() — who must sign governance writes. Null on failure. */
export async function readRegistryOwner(registryAddress: string): Promise<string | null> {
  if (!isAddress(registryAddress)) return null;
  try {
    return await publicClient.readContract({
      address: getAddress(registryAddress),
      abi: REGISTRY_OWNER_ABI,
      functionName: "owner",
    });
  } catch {
    return null;
  }
}

/** SourceStatus enum (SourceRegistryV1.sol): NONE=0, ACTIVE=1, PAUSED=2, REVOKED=3. */
export type SourceStatusCode = 0 | 1 | 2 | 3;

export interface SourceRecordRead {
  readonly exists: boolean;
  readonly sourceWallet: string;
  readonly payoutWallet: string;
  readonly sourceClass: number;
  readonly commissionBps: number;
  readonly status: SourceStatusCode;
  readonly scope: number;
  readonly appliesToRepeatPurchases: boolean;
  readonly metadataHash: `0x${string}`;
  // Verbatim-resubmission fields (updateSourceTerms requires the FULL terms;
  // exact decimal strings so nothing is rounded on the way back on-chain).
  readonly startTime: string;
  readonly endTime: string;
  readonly grossCap: string;
  readonly perBuyerCap: string;
}

/**
 * The FULL source record, live (PROPOSE-screen state read). `exists` mirrors
 * the contract's own existence test (sourceWallet != 0). Null on ANY failure —
 * the caller must fail closed (no create/activate button on an unproven state).
 */
export async function readSourceRecord(
  registryAddress: string,
  sourceId: string,
): Promise<SourceRecordRead | null> {
  if (!isAddress(registryAddress) || !SOURCE_ID_RE.test(sourceId)) return null;
  try {
    const r = await publicClient.readContract({
      address: getAddress(registryAddress),
      abi: SOURCE_CONFIG_ABI,
      functionName: "sourceConfig",
      args: [sourceId as `0x${string}`],
    });
    const status = Number(r.status);
    return {
      exists: r.sourceWallet !== zeroAddress,
      sourceWallet: r.sourceWallet,
      payoutWallet: r.payoutWallet,
      sourceClass: Number(r.sourceClass),
      commissionBps: Number(r.commissionBps),
      status: (status >= 0 && status <= 3 ? status : 0) as SourceStatusCode,
      scope: Number(r.scope),
      appliesToRepeatPurchases: r.appliesToRepeatPurchases,
      metadataHash: r.metadataHash,
      startTime: r.startTime.toString(),
      endTime: r.endTime.toString(),
      grossCap: r.grossCap.toString(),
      perBuyerCap: r.perBuyerCap.toString(),
    };
  } catch {
    return null;
  }
}

/**
 * Read a source's payoutWallet LIVE from the registry. The registry ADDRESS comes
 * from the server (verifyLinks `sourceRegistry`) — no hardcoded client address.
 * Returns null on ANY failure (fail closed — the UI shows no destination it cannot
 * verify). The AMOUNT and RATE never come from here — they come from the quote
 * (the contract's own effective computation); this read is ONLY the destination.
 */
export async function readSourceConfig(
  registryAddress: string,
  sourceId: string,
): Promise<SourceRead | null> {
  if (!isAddress(registryAddress) || !SOURCE_ID_RE.test(sourceId)) return null;
  try {
    const r = await publicClient.readContract({
      address: getAddress(registryAddress),
      abi: SOURCE_CONFIG_ABI,
      functionName: "sourceConfig",
      args: [sourceId as `0x${string}`],
    });
    const payoutWallet = r.payoutWallet;
    const sourceWallet = r.sourceWallet;
    const active =
      sourceWallet !== zeroAddress &&
      payoutWallet !== zeroAddress &&
      Number(r.status) === STATUS_ACTIVE;
    return { payoutWallet, sourceWallet, active };
  } catch {
    return null;
  }
}
