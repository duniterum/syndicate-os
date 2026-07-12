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
  createPublicClient,
  fallback,
  getAddress,
  http,
  isAddress,
  zeroAddress,
} from "viem";
import { avalanche } from "viem/chains";

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
  /** WHO gets paid (the address the contract pushes the acquisition cost to). */
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
] as const;

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
