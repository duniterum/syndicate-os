// ─────────────────────────────────────────────────────────────────────────────
  // Vendored from duniterum/TheSyndicate main @ cf4ca34c74599de1324e77052f1a81dd15cb1cc0
  // source path: src/lib/archive-nft-abi.ts
  // Read-only canon asset. Do not edit logic.
  // NOTE: This directory is excluded from the api-server TypeScript program and is
  // not yet imported by active app code. It exists as pinned local canon so future
  // status/contracts/proof/archive/token/sale wiring reads real files, not memory.
  // A future wiring slice owns any strict-mode / server-runtime adaptation.
  // ─────────────────────────────────────────────────────────────────────────────

  // Read/write ABI subset for SyndicateArchive1155 V1.
//
// Contract: 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d (Avalanche C-Chain).
// Phase: DEPLOYED · VALIDATION. No write paths are exposed here.
//
// Source of truth for the deployed shape: verified Sourcify ABI for
// 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d.
// Important: deployed contract exposes getArtifactCore/getArtifactText, not
// getArtifact. UI must normalize tuple arrays explicitly; viem does not return
// named-object fields for this getter.

export const ARCHIVE_NFT_ABI = [
  {
    type: "function",
    stateMutability: "view",
    name: "remainingSupply",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "walletRemaining",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "wallet", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "isMintable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "wallet", type: "address" },
      { name: "quantity", type: "uint64" },
    ],
    outputs: [{ type: "bool" }],
  },
  // Public write — restricted scope: only used for ID 1 (The First Signal).
  // Caller must have approved Archive contract on native Avalanche USDC for
  // the required amount (priceUsdc * quantity). Reverts if active=false,
  // walletLimit exceeded, supply exhausted, or USDC pull fails.
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "mint",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "quantity", type: "uint64" },
    ],
    outputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    name: "uri",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
  // OpenZeppelin Pausable.paused() — global pause flag for the contract.
  // Read with allowFailure=true; if the function is absent on-chain, the UI
  // treats the result as "not paused" rather than blocking the mint surface.
  {
    type: "function",
    stateMutability: "view",
    name: "paused",
    inputs: [],
    outputs: [{ type: "bool" }],
  },
  // OpenZeppelin Ownable.owner() — the wallet authorized to withdraw proceeds.
  // Read with allowFailure=true; if absent on-chain the UI shows PENDING and
  // never fabricates an address.
  {
    type: "function",
    stateMutability: "view",
    name: "owner",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  // treasury() — the address withdrawUSDC pays out to (the actual NFT-revenue
  // DESTINATION; not necessarily the owner). Mutable on-chain via setTreasury.
  // Read with allowFailure=true; degrades to PENDING when unreadable.
  {
    type: "function",
    stateMutability: "view",
    name: "treasury",
    inputs: [],
    outputs: [{ type: "address" }],
  },

  {
    type: "function",
    stateMutability: "view",
    name: "getArtifactCore",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "configured",       type: "bool"    },
      { name: "active",           type: "bool"    },
      { name: "ownerOnly",        type: "bool"    },
      { name: "definitionFrozen", type: "bool"    },
      { name: "rendererMode",     type: "uint8"   },
      { name: "maxSupply",        type: "uint64"  },
      { name: "walletLimit",      type: "uint64"  },
      { name: "priceUsdc",        type: "uint256" },
      { name: "minted",           type: "uint256" },
    ],
  },
] as const;

export type ArchiveArtifact = {
  configured: boolean;
  active: boolean;
  ownerOnly: boolean;
  definitionFrozen: boolean;
  rendererMode: number;
  maxSupply: bigint;
  walletLimit: bigint;
  totalMinted: bigint;
  priceUsdc: bigint;
};

export type ArchiveArtifactCoreTuple = readonly [
  boolean,
  boolean,
  boolean,
  boolean,
  number,
  bigint,
  bigint,
  bigint,
  bigint,
];

// Strict tuple validation for getArtifactCore. Returns either the normalized
// artifact or a structured error describing exactly which field failed and
// why — so the read-health panel can show the real reason, not a vague
// "Read failed". viem's anonymous-tuple decoding returns a positional array
// of unknown shape; we validate field-by-field instead of trusting indexes.
export type ArtifactDecodeError = {
  reason: string;
  fieldIndex?: number;
  field?: string;
  receivedType?: string;
};

export function decodeArtifactCore(
  result: unknown,
): { ok: true; value: ArchiveArtifact } | { ok: false; error: ArtifactDecodeError } {
  if (!Array.isArray(result)) {
    return { ok: false, error: { reason: `Expected tuple/array, got ${typeof result}` } };
  }
  if (result.length < 9) {
    return {
      ok: false,
      error: { reason: `Tuple too short: expected 9 fields, got ${result.length}` },
    };
  }
  const t = result as readonly unknown[];
  const expect = (i: number, field: string, kind: "boolean" | "bigint" | "number"): string | null => {
    const v = t[i];
    if (kind === "boolean" && typeof v !== "boolean") return `field ${i} (${field}) expected boolean, got ${typeof v}`;
    if (kind === "bigint" && typeof v !== "bigint") return `field ${i} (${field}) expected bigint, got ${typeof v}`;
    if (kind === "number" && typeof v !== "number" && typeof v !== "bigint")
      return `field ${i} (${field}) expected number/bigint, got ${typeof v}`;
    return null;
  };
  const checks: Array<[number, string, "boolean" | "bigint" | "number"]> = [
    [0, "configured", "boolean"],
    [1, "active", "boolean"],
    [2, "ownerOnly", "boolean"],
    [3, "definitionFrozen", "boolean"],
    [4, "rendererMode", "number"],
    [5, "maxSupply", "bigint"],
    [6, "walletLimit", "bigint"],
    [7, "priceUsdc", "bigint"],
    [8, "minted", "bigint"],
  ];
  for (const [i, field, kind] of checks) {
    const err = expect(i, field, kind);
    if (err) {
      return {
        ok: false,
        error: {
          reason: err,
          fieldIndex: i,
          field,
          receivedType: typeof t[i],
        },
      };
    }
  }
  return {
    ok: true,
    value: {
      configured: t[0] as boolean,
      active: t[1] as boolean,
      ownerOnly: t[2] as boolean,
      definitionFrozen: t[3] as boolean,
      rendererMode: Number(t[4]),
      maxSupply: t[5] as bigint,
      walletLimit: t[6] as bigint,
      priceUsdc: t[7] as bigint,
      totalMinted: t[8] as bigint,
    },
  };
}

// Back-compat wrapper retained for existing call sites. Returns undefined on
// decode failure so the legacy multicall path keeps surfacing per-id errors.
// New code should call `decodeArtifactCore` directly to get structured errors.
export function normalizeArtifactCore(result: unknown): ArchiveArtifact | undefined {
  const decoded = decodeArtifactCore(result);
  return decoded.ok ? decoded.value : undefined;
}

export const RENDERER_MODE_LABEL: Record<number, string> = {
  0: "NONE",
  1: "ONCHAIN_SVG",
  2: "EXTERNAL_URI",
};

// Reference wallet used only for unconnected display reads. It is deliberately
// non-zero because some Avalanche RPC paths reject zero-address simulations.
// Mint eligibility still uses the connected wallet only.
export const REFERENCE_WALLET = "0x0000000000000000000000000000000000000001" as const;
