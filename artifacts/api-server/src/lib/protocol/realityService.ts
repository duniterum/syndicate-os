/**
 * Protocol-reality service (SERVED, canon-free) — Slice 2.23A.
 * ---------------------------------------------------------
 * Orchestrates the strictly read-only reads (eth_chainId → eth_getCode →
 * eth_call) and normalizes them into the ONE protocol-reality envelope. Pure
 * given an injected transport (so guards can drive it with mock transports);
 * a 30s in-memory cache + request coalescing wraps the default served path.
 *
 * Fail-closed discipline:
 *   - eth_chainId is ALWAYS first; nothing downstream runs unless chainId === 43114.
 *   - chain not verified  → value null, lifecycle PAUSED_BY_PRECAUTION, UNKNOWN.
 *   - read/decode failure → value null, lifecycle PENDING_ADAPTER, LOW.
 *   - canon mismatch      → value null, LOW + failureReason (never normalized).
 * No private key, no wallet, no transaction, no write. No fabricated values.
 */

import {
  CONTRACT_TARGETS,
  TOKEN_TARGETS,
  ARCHIVE_TARGET,
  ARCHIVE_ARTIFACTS,
  SALE_TARGETS,
  SOURCE_LINKAGE_TARGET,
  type ContractTarget,
  type TokenTarget,
  type ArchiveTarget,
  type ArchiveArtifactTarget,
  type SaleTarget,
  type SaleNumericRead,
  type SourceLinkageTarget,
} from "../../data/protocolTargets";
import {
  DEFAULT_TIMEOUT_MS,
  EXPECTED_CHAIN_ID,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
  type RpcTransport,
} from "./rpcTransport";
import { ethCall, probeChain, readCodePresent, type ChainProbe } from "./evmRead";
import { SELECTOR_DECIMALS, SELECTOR_SYMBOL, decodeAbiString, decodeUint8 } from "./erc20Decoders";
import {
  SELECTOR_GET_ARTIFACT_CORE,
  SELECTOR_PAUSED,
  callData,
  decodeArtifactCoreExists,
  decodeBool,
  encodeUint256,
} from "./archiveDecoders";
import {
  SELECTOR_IS_CONCLUDED,
  SELECTOR_AVAILABLE_SYN,
  SELECTOR_TOTAL_GROSS_USDC,
  SELECTOR_RECEIPT_COUNT,
  decodeUint256Decimal,
} from "./saleDecoders";
import { SELECTOR_SOURCE_REGISTRY, decodeAddressWord } from "./sourceDecoders";
import {
  buildItem,
  type ProtocolRealityEnvelope,
  type ProtocolRealityItem,
} from "./realityEnvelope";

// LOCKSTEP: this value is enum-pinned in lib/api-spec/openapi.yaml
// (cacheTtlMs enum [30000]) and re-validated by the route's zod parse.
// Changing it requires spec + codegen + guard 7d in ONE atomic change,
// or every served response fails closed at 500.
const CACHE_TTL_MS = 30_000;

export type BuildOpts = {
  transport: RpcTransport;
  contractTargets: readonly ContractTarget[];
  tokenTargets: readonly TokenTarget[];
  archiveTarget: ArchiveTarget;
  archiveArtifacts: readonly ArchiveArtifactTarget[];
  saleTargets: readonly SaleTarget[];
  sourceLinkageTarget: SourceLinkageTarget;
  now?: () => Date;
};

/** Reason text for why live reads were skipped because the chain is not verified. */
function chainSkipReason(probe: ChainProbe): string {
  if (!probe.rpcReachable) return "RPC unreachable; live read skipped (fail closed)";
  if (probe.wrongChain) return `unexpected chain id (expected ${EXPECTED_CHAIN_ID}); read skipped`;
  return "chain identity unverified; live read skipped (fail closed)";
}

// ── chain group ──────────────────────────────────────────────────────────────
function buildChainGroup(probe: ChainProbe, asOf: string): ProtocolRealityItem[] {
  const items: ProtocolRealityItem[] = [];

  items.push(
    buildItem({
      id: "chain.network",
      label: "Expected network",
      value: "Avalanche C-Chain",
      sourceType: "SERVER_SIDE_CANON",
      sourceRef: "chain-registry.ts",
      chainId: EXPECTED_CHAIN_ID,
      contractRole: null,
      confidence: "HIGH",
      lifecycle: "READ_ONLY_PROOF",
      note: "Protocol targets the Avalanche C-Chain (id 43114).",
      failureReason: null,
      asOf,
    }),
  );

  const reachable = probe.rpcReachable;
  items.push(
    buildItem({
      id: "chain.rpcReachable",
      label: "RPC endpoint reachable",
      value: reachable,
      sourceType: "LIVE_CHAIN_RPC",
      sourceRef: "Avalanche C-Chain RPC (eth_chainId)",
      chainId: probe.chainIdActual,
      contractRole: null,
      confidence: "HIGH",
      lifecycle: reachable ? "READ_ONLY_PROOF" : "PAUSED_BY_PRECAUTION",
      note: reachable
        ? "A read-only RPC endpoint responded."
        : "No read-only RPC endpoint responded; live reads are paused.",
      failureReason: reachable ? null : "RPC endpoints did not respond",
      asOf,
    }),
  );

  let value: boolean | null;
  let confidence: ProtocolRealityItem["confidence"];
  let lifecycle: ProtocolRealityItem["lifecycle"];
  let failureReason: string | null;
  let note: string;
  if (!probe.rpcReachable) {
    value = null;
    confidence = "UNKNOWN";
    lifecycle = "PAUSED_BY_PRECAUTION";
    failureReason = "RPC unreachable; chain identity unverified";
    note = "Chain identity could not be verified; reads fail closed.";
  } else if (probe.chainIdOk) {
    value = true;
    confidence = "HIGH";
    lifecycle = "READ_ONLY_PROOF";
    failureReason = null;
    note = "Live chain identity matches the expected Avalanche C-Chain.";
  } else {
    value = null;
    confidence = "LOW";
    lifecycle = "PAUSED_BY_PRECAUTION";
    failureReason = `unexpected chain id (expected ${EXPECTED_CHAIN_ID})`;
    note = "Live chain identity did not match the expected network; reads fail closed.";
  }
  items.push(
    buildItem({
      id: "chain.identityVerified",
      label: "Chain identity verified",
      value,
      sourceType: "CANON_RECONCILED_RPC",
      sourceRef: "Avalanche C-Chain RPC (eth_chainId)",
      chainId: probe.chainIdActual,
      contractRole: null,
      confidence,
      lifecycle,
      note,
      failureReason,
      asOf,
    }),
  );

  return items;
}

// ── contracts group (code presence) ──────────────────────────────────────────
async function buildContractsGroup(
  transport: RpcTransport,
  probe: ChainProbe,
  targets: readonly ContractTarget[],
  asOf: string,
): Promise<ProtocolRealityItem[]> {
  const items: ProtocolRealityItem[] = [];
  for (const target of targets) {
    let value: boolean | null = null;
    let sourceType: ProtocolRealityItem["sourceType"] = "LIVE_CHAIN_RPC";
    let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let failureReason: string | null = chainSkipReason(probe);
    let note = "Contract code presence was not read (chain not verified).";

    if (probe.chainIdOk) {
      try {
        const present = await readCodePresent(transport, target.address);
        sourceType = "CANON_RECONCILED_RPC";
        if (present) {
          value = true;
          confidence = "HIGH";
          lifecycle = "READ_ONLY_PROOF";
          failureReason = null;
          note = "Canon-listed contract has on-chain code (deployment confirmed).";
        } else {
          value = null;
          confidence = "LOW";
          lifecycle = "PAUSED_BY_PRECAUTION";
          failureReason = "expected deployed code not found on chain";
          note = "Canon lists this contract as deployed, but no on-chain code was found; failing closed.";
        }
      } catch {
        value = null;
        sourceType = "LIVE_CHAIN_RPC";
        confidence = "UNKNOWN";
        lifecycle = "PAUSED_BY_PRECAUTION";
        failureReason = "code read unavailable";
        note = "Contract code presence could not be read.";
      }
    }

    items.push(
      buildItem({
        id: `contracts.${target.key}`,
        label: `${target.label} code present`,
        value,
        sourceType,
        sourceRef: `contract-registry.ts:${target.key}`,
        chainId: probe.chainIdActual,
        contractRole: target.role,
        confidence,
        lifecycle,
        note,
        failureReason,
        asOf,
      }),
    );
  }
  return items;
}

// ── tokens group (ERC-20 symbol + decimals) ──────────────────────────────────
function metadataItem(args: {
  id: string;
  label: string;
  contractRole: ProtocolRealityItem["contractRole"];
  selectorRef: string;
  chainId: number | null;
  asOf: string;
  read: string | number | null;
  decodeFailed: boolean;
  expected: string | number | null | undefined;
}): ProtocolRealityItem {
  const { read, decodeFailed, expected } = args;
  let value: ProtocolRealityItem["value"] = null;
  let sourceType: ProtocolRealityItem["sourceType"] = "LIVE_CHAIN_RPC";
  let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
  let lifecycle: ProtocolRealityItem["lifecycle"] = "PENDING_ADAPTER";
  let failureReason: string | null = null;
  let note: string;

  if (decodeFailed || read === null) {
    value = null;
    confidence = "LOW";
    lifecycle = "PENDING_ADAPTER";
    failureReason = "metadata decode failed";
    note = "The metadata view could not be decoded; reported as unavailable.";
  } else if (expected != null) {
    sourceType = "CANON_RECONCILED_RPC";
    if (read === expected) {
      value = read;
      confidence = "HIGH";
      lifecycle = "READ_ONLY_PROOF";
      note = "Live metadata matches the vendored canon expectation.";
    } else {
      value = null;
      confidence = "LOW";
      lifecycle = "PAUSED_BY_PRECAUTION";
      failureReason = "live value did not match canon (reported as unavailable, never normalized)";
      note = "Live metadata did not match canon; failing closed rather than normalizing.";
    }
  } else {
    value = read;
    confidence = "MEDIUM";
    lifecycle = "READ_ONLY_PROOF";
    note = "Live metadata read with no canon expectation to reconcile against.";
  }

  return buildItem({
    id: args.id,
    label: args.label,
    value,
    sourceType,
    sourceRef: args.selectorRef,
    chainId: args.chainId,
    contractRole: args.contractRole,
    confidence,
    lifecycle,
    note,
    failureReason,
    asOf: args.asOf,
  });
}

function unreadMetadataItem(args: {
  id: string;
  label: string;
  contractRole: ProtocolRealityItem["contractRole"];
  selectorRef: string;
  chainId: number | null;
  asOf: string;
  failureReason: string;
}): ProtocolRealityItem {
  return buildItem({
    id: args.id,
    label: args.label,
    value: null,
    sourceType: "LIVE_CHAIN_RPC",
    sourceRef: args.selectorRef,
    chainId: args.chainId,
    contractRole: args.contractRole,
    confidence: "UNKNOWN",
    lifecycle: "PAUSED_BY_PRECAUTION",
    note: "Metadata was not read (chain not verified or no on-chain code).",
    failureReason: args.failureReason,
    asOf: args.asOf,
  });
}

async function buildTokensGroup(
  transport: RpcTransport,
  probe: ChainProbe,
  targets: readonly TokenTarget[],
  asOf: string,
): Promise<ProtocolRealityItem[]> {
  const items: ProtocolRealityItem[] = [];
  const chainId = probe.chainIdActual;

  for (const token of targets) {
    const symbolRef = "Avalanche C-Chain RPC (eth_call symbol)";
    const decimalsRef = "Avalanche C-Chain RPC (eth_call decimals)";

    if (!probe.chainIdOk) {
      const reason = chainSkipReason(probe);
      items.push(unreadMetadataItem({ id: `tokens.${token.key}.symbol`, label: `${token.label} symbol`, contractRole: token.role, selectorRef: symbolRef, chainId, asOf, failureReason: reason }));
      items.push(unreadMetadataItem({ id: `tokens.${token.key}.decimals`, label: `${token.label} decimals`, contractRole: token.role, selectorRef: decimalsRef, chainId, asOf, failureReason: reason }));
      continue;
    }

    let hasCode = false;
    try {
      hasCode = await readCodePresent(transport, token.address);
    } catch {
      hasCode = false;
    }
    if (!hasCode) {
      const reason = "no on-chain code; metadata read skipped";
      items.push(unreadMetadataItem({ id: `tokens.${token.key}.symbol`, label: `${token.label} symbol`, contractRole: token.role, selectorRef: symbolRef, chainId, asOf, failureReason: reason }));
      items.push(unreadMetadataItem({ id: `tokens.${token.key}.decimals`, label: `${token.label} decimals`, contractRole: token.role, selectorRef: decimalsRef, chainId, asOf, failureReason: reason }));
      continue;
    }

    let symbol: string | null = null;
    let symbolThrew = false;
    try {
      symbol = decodeAbiString(await ethCall(transport, token.address, SELECTOR_SYMBOL));
    } catch {
      symbolThrew = true;
    }
    items.push(
      metadataItem({
        id: `tokens.${token.key}.symbol`,
        label: `${token.label} symbol`,
        contractRole: token.role,
        selectorRef: symbolRef,
        chainId,
        asOf,
        read: symbol,
        decodeFailed: symbolThrew,
        expected: token.expect?.symbol,
      }),
    );

    let decimals: number | null = null;
    let decimalsThrew = false;
    try {
      decimals = decodeUint8(await ethCall(transport, token.address, SELECTOR_DECIMALS));
    } catch {
      decimalsThrew = true;
    }
    items.push(
      metadataItem({
        id: `tokens.${token.key}.decimals`,
        label: `${token.label} decimals`,
        contractRole: token.role,
        selectorRef: decimalsRef,
        chainId,
        asOf,
        read: decimals,
        decodeFailed: decimalsThrew,
        expected: token.expect?.decimals,
      }),
    );
  }
  return items;
}

// ── archive group (global pause + configured-on-chain artifact ids) ───────────
async function buildArchiveGroup(
  transport: RpcTransport,
  probe: ChainProbe,
  archive: ArchiveTarget,
  artifacts: readonly ArchiveArtifactTarget[],
  asOf: string,
): Promise<ProtocolRealityItem[]> {
  const items: ProtocolRealityItem[] = [];
  const chainId = probe.chainIdActual;

  // Read code once and reuse for every archive read this run.
  let hasCode = false;
  if (probe.chainIdOk) {
    try {
      hasCode = await readCodePresent(transport, archive.address);
    } catch {
      hasCode = false;
    }
  }

  // archive.paused
  {
    let value: boolean | null = null;
    let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let failureReason: string | null = chainSkipReason(probe);
    let note = "Archive pause flag was not read (chain not verified).";
    let sourceType: ProtocolRealityItem["sourceType"] = "LIVE_CHAIN_RPC";

    if (probe.chainIdOk && !hasCode) {
      failureReason = "no on-chain code; pause flag read skipped";
      note = "Archive pause flag was not read (no on-chain code).";
    } else if (probe.chainIdOk) {
      let paused: boolean | null = null;
      let threw = false;
      try {
        paused = decodeBool(await ethCall(transport, archive.address, SELECTOR_PAUSED));
      } catch {
        threw = true;
      }
      if (threw || paused === null) {
        value = null;
        confidence = "LOW";
        lifecycle = "PENDING_ADAPTER";
        failureReason = "pause flag decode failed";
        note = "The archive pause flag could not be decoded; reported as unavailable.";
      } else {
        value = paused;
        confidence = "MEDIUM";
        lifecycle = "READ_ONLY_PROOF";
        failureReason = null;
        note = "Global archive pause flag read from chain.";
      }
    }

    items.push(
      buildItem({
        id: "archive.paused",
        label: "Archive globally paused",
        value,
        sourceType,
        sourceRef: "Avalanche C-Chain RPC (eth_call paused)",
        chainId,
        contractRole: "archive1155",
        confidence,
        lifecycle,
        note,
        failureReason,
        asOf,
      }),
    );
  }

  // archive.artifact.<id> configured-on-chain
  for (const artifact of artifacts) {
    let value: boolean | null = null;
    let sourceType: ProtocolRealityItem["sourceType"] = "LIVE_CHAIN_RPC";
    let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let failureReason: string | null = chainSkipReason(probe);
    let note = "Artifact configuration was not read (chain not verified).";

    if (probe.chainIdOk && !hasCode) {
      failureReason = "no on-chain code; artifact read skipped";
      note = "Artifact configuration was not read (no on-chain code).";
    } else if (probe.chainIdOk) {
      const data = callData(SELECTOR_GET_ARTIFACT_CORE, [encodeUint256(BigInt(artifact.id))]);
      let decoded: ReturnType<typeof decodeArtifactCoreExists> | null = null;
      try {
        decoded = decodeArtifactCoreExists(await ethCall(transport, archive.address, data));
      } catch {
        decoded = { ok: false, reason: "artifact core read threw" };
      }
      if (!decoded.ok) {
        value = null;
        confidence = "LOW";
        lifecycle = "PENDING_ADAPTER";
        failureReason = `artifact core decode failed: ${decoded.reason}`;
        note = "The artifact core view could not be decoded; reported as unavailable.";
      } else if (artifact.configuredOnChain) {
        sourceType = "CANON_RECONCILED_RPC";
        if (decoded.configured) {
          value = true;
          confidence = "HIGH";
          lifecycle = "READ_ONLY_PROOF";
          failureReason = null;
          note = "On-chain artifact configuration matches the canon expectation.";
        } else {
          value = null;
          confidence = "LOW";
          lifecycle = "PAUSED_BY_PRECAUTION";
          failureReason = "canon expects this artifact configured, but chain reports otherwise";
          note = "Canon/chain disagreement on artifact configuration; failing closed.";
        }
      } else {
        value = decoded.configured;
        confidence = "MEDIUM";
        lifecycle = "READ_ONLY_PROOF";
        failureReason = null;
        note = "On-chain artifact configuration read with no canon expectation.";
      }
    }

    items.push(
      buildItem({
        id: `archive.artifact.${artifact.id}`,
        label: `${artifact.label} (id ${artifact.id}) configured on-chain`,
        value,
        sourceType,
        sourceRef: `archive-id-registry.ts:id=${artifact.id}`,
        chainId,
        contractRole: "archive1155",
        confidence,
        lifecycle,
        note,
        failureReason,
        asOf,
      }),
    );
  }

  return items;
}

// ── sale group (lifecycle flags only: paused + concluded) ────────────────────
/**
 * Normalize one sale lifecycle boolean (paused/isConcluded) into an item,
 * mirroring the archive.paused posture: a live read with NO canon expectation
 * (the flag is mutable), MEDIUM confidence when read, and fail-closed to null
 * on wrong-chain, missing code, or decode failure. Surfaces the raw flag ONLY —
 * never derives an "active sale" / purchase surface from it.
 */
function buildSaleFlag(args: {
  probe: ChainProbe;
  hasCode: boolean;
  flagValue: boolean | null;
  decodeThrew: boolean;
  id: string;
  label: string;
  sourceRef: string;
  chainId: number | null;
  asOf: string;
}): ProtocolRealityItem {
  const { probe, hasCode, flagValue, decodeThrew } = args;
  let value: boolean | null = null;
  let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
  let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
  let failureReason: string | null = chainSkipReason(probe);
  let note = "Sale lifecycle flag was not read (chain not verified).";

  if (probe.chainIdOk && !hasCode) {
    failureReason = "no on-chain code; lifecycle flag read skipped";
    note = "Sale lifecycle flag was not read (no on-chain code).";
  } else if (probe.chainIdOk) {
    if (decodeThrew || flagValue === null) {
      value = null;
      confidence = "LOW";
      lifecycle = "PENDING_ADAPTER";
      failureReason = "lifecycle flag decode failed";
      note = "The sale lifecycle flag could not be decoded; reported as unavailable.";
    } else {
      value = flagValue;
      confidence = "MEDIUM";
      lifecycle = "READ_ONLY_PROOF";
      failureReason = null;
      note = "Read-only sale contract lifecycle flag; not a transaction surface.";
    }
  }

  return buildItem({
    id: args.id,
    label: args.label,
    value,
    sourceType: "LIVE_CHAIN_RPC",
    sourceRef: args.sourceRef,
    chainId: args.chainId,
    contractRole: "sale",
    confidence,
    lifecycle,
    note,
    failureReason,
    asOf: args.asOf,
  });
}

/** Maps a founder-scoped sale view to its canon keccak selector. */
const SALE_VIEW_SELECTOR: Record<SaleNumericRead["view"], string> = {
  availableSyn: SELECTOR_AVAILABLE_SYN,
  totalGrossUsdc: SELECTOR_TOTAL_GROSS_USDC,
  receiptCount: SELECTOR_RECEIPT_COUNT,
};

/**
 * Normalize one public uint256 sale view into an item as an EXACT raw-base-unit
 * string (never a JS number, never humanized/normalized). Same fail-closed
 * posture as the lifecycle flags: MEDIUM live read with no canon expectation,
 * null + failureReason on wrong-chain, missing code, or decode failure.
 */
function buildSaleNumeric(args: {
  probe: ChainProbe;
  hasCode: boolean;
  rawValue: string | null;
  decodeThrew: boolean;
  id: string;
  label: string;
  note: string;
  sourceRef: string;
  chainId: number | null;
  asOf: string;
}): ProtocolRealityItem {
  const { probe, hasCode, rawValue, decodeThrew } = args;
  let value: string | null = null;
  let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
  let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
  let failureReason: string | null = chainSkipReason(probe);
  let note = "Sale figure was not read (chain not verified).";

  if (probe.chainIdOk && !hasCode) {
    failureReason = "no on-chain code; sale figure read skipped";
    note = "Sale figure was not read (no on-chain code).";
  } else if (probe.chainIdOk) {
    if (decodeThrew || rawValue === null) {
      value = null;
      confidence = "LOW";
      lifecycle = "PENDING_ADAPTER";
      failureReason = "sale figure decode failed";
      note = "The sale figure could not be decoded; reported as unavailable.";
    } else {
      value = rawValue;
      confidence = "MEDIUM";
      lifecycle = "READ_ONLY_PROOF";
      failureReason = null;
      note = args.note;
    }
  }

  return buildItem({
    id: args.id,
    label: args.label,
    value,
    sourceType: "LIVE_CHAIN_RPC",
    sourceRef: args.sourceRef,
    chainId: args.chainId,
    contractRole: "sale",
    confidence,
    lifecycle,
    note,
    failureReason,
    asOf: args.asOf,
  });
}

async function buildSaleGroup(
  transport: RpcTransport,
  probe: ChainProbe,
  targets: readonly SaleTarget[],
  asOf: string,
): Promise<ProtocolRealityItem[]> {
  const items: ProtocolRealityItem[] = [];
  const chainId = probe.chainIdActual;

  for (const sale of targets) {
    // Read code once and reuse for every lifecycle flag on this contract.
    let hasCode = false;
    if (probe.chainIdOk) {
      try {
        hasCode = await readCodePresent(transport, sale.address);
      } catch {
        hasCode = false;
      }
    }

    // paused() — present on every sale version.
    let paused: boolean | null = null;
    let pausedThrew = false;
    if (probe.chainIdOk && hasCode) {
      try {
        paused = decodeBool(await ethCall(transport, sale.address, SELECTOR_PAUSED));
      } catch {
        pausedThrew = true;
      }
    }
    items.push(
      buildSaleFlag({
        probe,
        hasCode,
        flagValue: paused,
        decodeThrew: pausedThrew,
        id: `sale.${sale.key}.paused`,
        label: `${sale.label} pause flag`,
        sourceRef: `contract-registry.ts:${sale.key} (eth_call paused)`,
        chainId,
        asOf,
      }),
    );

    // isConcluded() — V2/V3 only (V1's canon ABI has no such view).
    if (sale.hasIsConcluded) {
      let concluded: boolean | null = null;
      let concludedThrew = false;
      if (probe.chainIdOk && hasCode) {
        try {
          concluded = decodeBool(await ethCall(transport, sale.address, SELECTOR_IS_CONCLUDED));
        } catch {
          concludedThrew = true;
        }
      }
      items.push(
        buildSaleFlag({
          probe,
          hasCode,
          flagValue: concluded,
          decodeThrew: concludedThrew,
          id: `sale.${sale.key}.concluded`,
          label: `${sale.label} concluded flag`,
          sourceRef: `contract-registry.ts:${sale.key} (eth_call isConcluded)`,
          chainId,
          asOf,
        }),
      );
    }

    // Founder-scoped public figures (Sprint 2: V3 only) as EXACT raw base units.
    for (const nr of sale.numericReads) {
      let raw: string | null = null;
      let threw = false;
      if (probe.chainIdOk && hasCode) {
        try {
          raw = decodeUint256Decimal(
            await ethCall(transport, sale.address, SALE_VIEW_SELECTOR[nr.view]),
          );
        } catch {
          threw = true;
        }
      }
      items.push(
        buildSaleNumeric({
          probe,
          hasCode,
          rawValue: raw,
          decodeThrew: threw,
          id: `sale.${sale.key}.${nr.idSuffix}`,
          label: nr.label,
          note: nr.unitNote,
          sourceRef: `contract-registry.ts:${sale.key} (eth_call ${nr.view})`,
          chainId,
          asOf,
        }),
      );
    }
  }

  return items;
}

// ── source group (Verified Introduction posture: linkage + canon policy) ─────
/**
 * Read-only Verified Introduction (source) posture:
 *   - registryLinkage: the ACTIVE V3 engine's SOURCE_REGISTRY() view must
 *     resolve to the canon registry address. Compared SERVER-SIDE only — the
 *     item value is a boolean; no address is ever emitted. Mismatch → null +
 *     failureReason (never normalized).
 *   - creationPolicy / zeroSourceJoin: static canon facts (owner-only source
 *     creation; the engine accepts the zero source id as the no-source path).
 */
async function buildSourceGroup(
  transport: RpcTransport,
  probe: ChainProbe,
  target: SourceLinkageTarget,
  asOf: string,
): Promise<ProtocolRealityItem[]> {
  const items: ProtocolRealityItem[] = [];
  const chainId = probe.chainIdActual;

  // source.registryLinkage — live canon-reconciled boolean.
  {
    let value: boolean | null = null;
    let sourceType: ProtocolRealityItem["sourceType"] = "LIVE_CHAIN_RPC";
    let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let failureReason: string | null = chainSkipReason(probe);
    let note = "Registry linkage was not read (chain not verified).";

    if (probe.chainIdOk) {
      let hasCode = false;
      try {
        hasCode = await readCodePresent(transport, target.saleAddress);
      } catch {
        hasCode = false;
      }
      if (!hasCode) {
        failureReason = "no on-chain code; registry linkage read skipped";
        note = "Registry linkage was not read (no on-chain code on the active engine).";
      } else {
        let linked: string | null = null;
        let threw = false;
        try {
          linked = decodeAddressWord(
            await ethCall(transport, target.saleAddress, SELECTOR_SOURCE_REGISTRY),
          );
        } catch {
          threw = true;
        }
        sourceType = "CANON_RECONCILED_RPC";
        if (threw || linked === null) {
          value = null;
          confidence = "LOW";
          lifecycle = "PENDING_ADAPTER";
          failureReason = "registry linkage decode failed";
          note = "The engine's registry view could not be decoded; reported as unavailable.";
        } else if (linked === target.registryAddress.toLowerCase()) {
          value = true;
          confidence = "HIGH";
          lifecycle = "READ_ONLY_PROOF";
          failureReason = null;
          note =
            "The active membership engine's on-chain registry linkage matches the vendored canon registry.";
        } else {
          value = null;
          confidence = "LOW";
          lifecycle = "PAUSED_BY_PRECAUTION";
          failureReason =
            "live registry linkage did not match canon (reported as unavailable, never normalized)";
          note = "Live registry linkage did not match canon; failing closed rather than normalizing.";
        }
      }
    }

    items.push(
      buildItem({
        id: "source.registryLinkage",
        label: "Active engine linked to canon Source Registry",
        value,
        sourceType,
        sourceRef: `contract-registry.ts:${target.saleKey} (eth_call SOURCE_REGISTRY)`,
        chainId,
        contractRole: "source-registry",
        confidence,
        lifecycle,
        note,
        failureReason,
        asOf,
      }),
    );
  }

  // source.creationPolicy — static canon fact (owner-only creation/activation).
  items.push(
    buildItem({
      id: "source.creationPolicy",
      label: "Source creation policy",
      value: "OWNER_ONLY",
      sourceType: "SERVER_SIDE_CANON",
      sourceRef: `contract-registry.ts:${target.key}`,
      chainId: EXPECTED_CHAIN_ID,
      contractRole: "source-registry",
      confidence: "HIGH",
      lifecycle: "FOUNDER_GATED",
      note:
        "New Verified Introduction sources are created and activated only by the protocol owner on-chain. No self-service source creation surface exists in this app.",
      failureReason: null,
      asOf,
    }),
  );

  // source.zeroSourceJoin — static canon fact (zero source id = no-source path).
  items.push(
    buildItem({
      id: "source.zeroSourceJoin",
      label: "Joining without a source link is valid",
      value: true,
      sourceType: "SERVER_SIDE_CANON",
      sourceRef: `contract-registry.ts:${target.saleKey}`,
      chainId: EXPECTED_CHAIN_ID,
      contractRole: "source-registry",
      confidence: "HIGH",
      lifecycle: "READ_ONLY_PROOF",
      note:
        "The membership engine accepts the zero source id as the canonical no-source path; a Verified Introduction link is optional by design.",
      failureReason: null,
      asOf,
    }),
  );

  return items;
}

/** Pure build: transport injected, no cache, no network of its own beyond it. */
export async function buildProtocolReality(opts: BuildOpts): Promise<ProtocolRealityEnvelope> {
  const now = opts.now ?? (() => new Date());
  const asOf = now().toISOString();
  const probe = await probeChain(opts.transport);

  const [contracts, tokens, archive, sale, source] = await Promise.all([
    buildContractsGroup(opts.transport, probe, opts.contractTargets, asOf),
    buildTokensGroup(opts.transport, probe, opts.tokenTargets, asOf),
    buildArchiveGroup(opts.transport, probe, opts.archiveTarget, opts.archiveArtifacts, asOf),
    buildSaleGroup(opts.transport, probe, opts.saleTargets, asOf),
    buildSourceGroup(opts.transport, probe, opts.sourceLinkageTarget, asOf),
  ]);

  return {
    mode: "READ_ONLY_PROTOCOL_REALITY",
    expectedChainId: EXPECTED_CHAIN_ID,
    asOf,
    cached: false,
    cacheTtlMs: CACHE_TTL_MS,
    groups: {
      chain: buildChainGroup(probe, asOf),
      contracts,
      tokens,
      archive,
      sale,
      source,
    },
  };
}

// ── Short in-memory cache + request coalescing (served default path) ──────────
let cacheEntry: { at: number; result: ProtocolRealityEnvelope } | null = null;
let inFlight: Promise<ProtocolRealityEnvelope> | null = null;

/** A build whose chain identity verified against canon (a real successful read). */
function isChainVerified(e: ProtocolRealityEnvelope): boolean {
  return e.groups.chain.some(
    (i) => i.id === "chain.identityVerified" && i.value === true,
  );
}

/** Test/maintenance hook: clear the in-memory cache + in-flight coalescing. */
export function __resetProtocolRealityCache(): void {
  cacheEntry = null;
  inFlight = null;
}

function defaultBuildOpts(): BuildOpts {
  const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
  return {
    transport,
    contractTargets: CONTRACT_TARGETS,
    tokenTargets: TOKEN_TARGETS,
    archiveTarget: ARCHIVE_TARGET,
    archiveArtifacts: ARCHIVE_ARTIFACTS,
    saleTargets: SALE_TARGETS,
    sourceLinkageTarget: SOURCE_LINKAGE_TARGET,
  };
}

export async function getProtocolReality(
  opts?: Partial<BuildOpts> & { ttlMs?: number },
): Promise<ProtocolRealityEnvelope> {
  const ttl = opts?.ttlMs ?? CACHE_TTL_MS;
  if (cacheEntry && Date.now() - cacheEntry.at < ttl) {
    return { ...cacheEntry.result, cached: true };
  }
  if (inFlight) return inFlight; // coalesce concurrent callers onto one request
  const { ttlMs: _ttlMs, ...overrides } = opts ?? {};
  inFlight = (async () => {
    try {
      const merged: BuildOpts = { ...defaultBuildOpts(), ...overrides };
      const result = await buildProtocolReality(merged);
      // Success-only caching: a build whose chain identity did NOT verify
      // (unreachable RPC / wrong chain → fail-closed nulls) is served live
      // but never pinned as bounded-age truth — the next request re-reads
      // immediately instead of replaying a degraded snapshot for the TTL.
      if (isChainVerified(result)) {
        cacheEntry = { at: Date.now(), result };
      }
      return result;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}
