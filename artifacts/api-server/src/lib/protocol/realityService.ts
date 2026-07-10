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
  FINANCIAL_TARGETS,
  type ContractTarget,
  type TokenTarget,
  type ArchiveTarget,
  type ArchiveArtifactTarget,
  type SaleTarget,
  type SaleNumericRead,
  type SourceLinkageTarget,
  type FinancialTargets,
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
  decodeArtifactCoreRead,
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
import { REFERRAL_ATTRIBUTION_SNAPSHOT } from "./referralAttributionSnapshot";
import {
  SELECTOR_TOTAL_USDC_RAISED,
  SELECTOR_BALANCE_OF,
  SELECTOR_GET_RESERVES,
  SELECTOR_TOKEN0,
  SELECTOR_MEMBER_COUNT,
  SELECTOR_TOTAL_SUPPLY,
  encodeAddressArg,
  decodeReservesPair,
  sumDecimalStrings,
} from "./financialDecoders";
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
  financialTargets: FinancialTargets;
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

  // archive.artifact.<id> configured-on-chain + archive.artifact.<id>.minted
  // (ONE eth_call per artifact — both items decode from the same tuple return)
  for (const artifact of artifacts) {
    let value: boolean | null = null;
    let sourceType: ProtocolRealityItem["sourceType"] = "LIVE_CHAIN_RPC";
    let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let failureReason: string | null = chainSkipReason(probe);
    let note = "Artifact configuration was not read (chain not verified).";

    // Minted count posture (independent signal, same fail-closed doctrine as
    // every financial figure: EXACT raw base-unit string, never invented).
    let mintedValue: string | null = null;
    let mintedConfidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let mintedLifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let mintedFailureReason: string | null = chainSkipReason(probe);
    let mintedNote = "Minted count was not read (chain not verified).";

    // Mint price posture (word 7 of the same tuple; raw 6-dec USDC base-unit
    // string, same fail-closed doctrine — EXACT or withheld, never invented).
    let priceValue: string | null = null;
    let priceConfidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let priceLifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let priceFailureReason: string | null = chainSkipReason(probe);
    let priceNote = "Mint price was not read (chain not verified).";

    if (probe.chainIdOk && !hasCode) {
      failureReason = "no on-chain code; artifact read skipped";
      note = "Artifact configuration was not read (no on-chain code).";
      mintedFailureReason = "no on-chain code; minted count read skipped";
      mintedNote = "Minted count was not read (no on-chain code).";
      priceFailureReason = "no on-chain code; mint price read skipped";
      priceNote = "Mint price was not read (no on-chain code).";
    } else if (probe.chainIdOk) {
      const data = callData(SELECTOR_GET_ARTIFACT_CORE, [encodeUint256(BigInt(artifact.id))]);
      let decoded: ReturnType<typeof decodeArtifactCoreRead> | null = null;
      try {
        decoded = decodeArtifactCoreRead(await ethCall(transport, archive.address, data));
      } catch {
        decoded = { ok: false, reason: "artifact core read threw" };
      }
      if (!decoded.ok) {
        value = null;
        confidence = "LOW";
        lifecycle = "PENDING_ADAPTER";
        failureReason = `artifact core decode failed: ${decoded.reason}`;
        note = "The artifact core view could not be decoded; reported as unavailable.";
        mintedValue = null;
        mintedConfidence = "LOW";
        mintedLifecycle = "PENDING_ADAPTER";
        mintedFailureReason = `artifact core decode failed: ${decoded.reason}`;
        mintedNote = "The minted count could not be decoded; reported as unavailable.";
        priceValue = null;
        priceConfidence = "LOW";
        priceLifecycle = "PENDING_ADAPTER";
        priceFailureReason = `artifact core decode failed: ${decoded.reason}`;
        priceNote = "The mint price could not be decoded; reported as unavailable.";
      } else {
        // Minted count is a live mutable figure with NO canon expectation.
        mintedValue = decoded.minted.toString();
        mintedConfidence = "MEDIUM";
        mintedLifecycle = "READ_ONLY_PROOF";
        mintedFailureReason = null;
        mintedNote = `Total minted count for ${artifact.label} (id ${artifact.id}) read live from Archive1155 getArtifactCore — an EXACT raw count string.`;
        // Mint price is likewise a live mutable figure with NO canon expectation.
        priceValue = decoded.priceUsdc.toString();
        priceConfidence = "MEDIUM";
        priceLifecycle = "READ_ONLY_PROOF";
        priceFailureReason = null;
        priceNote = `Mint price for ${artifact.label} (id ${artifact.id}) read live from Archive1155 getArtifactCore — an EXACT raw 6-decimal USDC base-unit string.`;

        if (artifact.configuredOnChain) {
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
            // A canon/chain disagreement poisons trust in the whole tuple:
            // fail the minted count closed too rather than surface a figure
            // from a contract state that contradicts canon.
            mintedValue = null;
            mintedConfidence = "LOW";
            mintedLifecycle = "PAUSED_BY_PRECAUTION";
            mintedFailureReason = "canon/chain disagreement on artifact configuration";
            mintedNote = "Minted count withheld: canon/chain disagreement on artifact configuration; failing closed.";
            priceValue = null;
            priceConfidence = "LOW";
            priceLifecycle = "PAUSED_BY_PRECAUTION";
            priceFailureReason = "canon/chain disagreement on artifact configuration";
            priceNote = "Mint price withheld: canon/chain disagreement on artifact configuration; failing closed.";
          }
        } else {
          value = decoded.configured;
          confidence = "MEDIUM";
          lifecycle = "READ_ONLY_PROOF";
          failureReason = null;
          note = "On-chain artifact configuration read with no canon expectation.";
        }
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

    items.push(
      buildItem({
        id: `archive.artifact.${artifact.id}.minted`,
        label: `${artifact.label} (id ${artifact.id}) — total minted`,
        value: mintedValue,
        sourceType: "LIVE_CHAIN_RPC",
        sourceRef: `Avalanche C-Chain RPC (eth_call getArtifactCore id=${artifact.id}, word 8)`,
        chainId,
        contractRole: "archive1155",
        confidence: mintedConfidence,
        lifecycle: mintedLifecycle,
        note: mintedNote,
        failureReason: mintedFailureReason,
        asOf,
      }),
    );

    items.push(
      buildItem({
        id: `archive.artifact.${artifact.id}.price`,
        label: `${artifact.label} (id ${artifact.id}) — mint price (USDC raw @6dec)`,
        value: priceValue,
        sourceType: "LIVE_CHAIN_RPC",
        sourceRef: `Avalanche C-Chain RPC (eth_call getArtifactCore id=${artifact.id}, word 7)`,
        chainId,
        contractRole: "archive1155",
        confidence: priceConfidence,
        lifecycle: priceLifecycle,
        note: priceNote,
        failureReason: priceFailureReason,
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

// ── financial group (aggregate live on-chain figures — Slice N1 + Reconciliation
//    slice, July 2026: FOUR inflow engines V1+V2a+V2b+V3, vault + operations
//    USDC balances (70/20/10 reconciliation), and the static hash-pinned
//    attribution ACTIVITY COUNT snapshot — admin-side) ──────────────────────────
/**
 * Normalize one aggregate financial uint256 read into an item as an EXACT raw
 * base-unit string (never a JS number, never humanized, NEVER a canon-constant
 * fallback). Same fail-closed posture as the sale figures: MEDIUM live read,
 * null + failureReason on wrong-chain, missing code, or decode failure.
 */
function buildFinancialNumeric(args: {
  probe: ChainProbe;
  hasCode: boolean;
  rawValue: string | null;
  decodeThrew: boolean;
  id: string;
  label: string;
  contractRole: ProtocolRealityItem["contractRole"];
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
  let note = "Financial figure was not read (chain not verified).";

  if (probe.chainIdOk && !hasCode) {
    failureReason = "no on-chain code; financial figure read skipped";
    note = "Financial figure was not read (no on-chain code at the read target).";
  } else if (probe.chainIdOk) {
    if (decodeThrew || rawValue === null) {
      value = null;
      confidence = "LOW";
      lifecycle = "PENDING_ADAPTER";
      failureReason = "financial figure decode failed";
      note = "The financial figure could not be decoded; reported as unavailable (never a fallback constant).";
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
    contractRole: args.contractRole,
    confidence,
    lifecycle,
    note,
    failureReason,
    asOf: args.asOf,
  });
}

/**
 * Aggregate on-chain financial reads (admin-side first; public wiring is N2):
 *   - per-engine cumulative gross USDC inflow (V2a + V2b totalUsdcRaised();
 *     V3 totalGrossUsdc()) + a server-side bigint aggregate that fails closed
 *     if ANY component is unavailable;
 *   - vault reserve wallet USDC balance — live balanceOf() on the USDC contract;
 *   - AMM pair reserves — live getReserves(), oriented against the canon token
 *     addresses SERVER-SIDE via token0() (mismatch → null, never guessed);
 *   - burned SYN — live balanceOf() of the canonical burn address on the SYN
 *     contract (the chain figure, NEVER canon's recorded ceremony constant);
 *   - live memberCount() on the active V3 engine (a count only — no wallets);
 *   - referral registry liveness — code presence + engine linkage reconciled
 *     against canon (the registry exposes no global program flag on-chain, so
 *     none is invented).
 * Every figure is LIVE_CHAIN_RPC (or CANON_RECONCILED_RPC for the linkage
 * boolean) and fails closed independently. No canon constant is ever surfaced
 * as a value; canon supplies only the server-side addresses to read.
 */
async function buildFinancialGroup(
  transport: RpcTransport,
  probe: ChainProbe,
  targets: FinancialTargets,
  sourceLinkage: SourceLinkageTarget,
  asOf: string,
): Promise<ProtocolRealityItem[]> {
  const items: ProtocolRealityItem[] = [];
  const chainId = probe.chainIdActual;

  // Read each target's code presence at most once (server-side only).
  const codeCache = new Map<string, boolean>();
  async function hasCodeAt(address: string): Promise<boolean> {
    if (!probe.chainIdOk) return false;
    const key = address.toLowerCase();
    const cached = codeCache.get(key);
    if (cached !== undefined) return cached;
    let present = false;
    try {
      present = await readCodePresent(transport, address);
    } catch {
      present = false;
    }
    codeCache.set(key, present);
    return present;
  }

  /** One uint256 eth_call → exact decimal string (null + threw on failure). */
  async function readUint(
    to: string,
    data: string,
  ): Promise<{ raw: string | null; threw: boolean }> {
    try {
      return { raw: decodeUint256Decimal(await ethCall(transport, to, data)), threw: false };
    } catch {
      return { raw: null, threw: true };
    }
  }

  // 1) Per-engine cumulative gross USDC inflow + fail-closed aggregate.
  const inflowRaws: (string | null)[] = [];
  const inflowFailedKeys: string[] = [];
  for (const t of targets.inflows) {
    const selector =
      t.view === "totalUsdcRaised" ? SELECTOR_TOTAL_USDC_RAISED : SELECTOR_TOTAL_GROSS_USDC;
    const hasCode = await hasCodeAt(t.address);
    let raw: string | null = null;
    let threw = false;
    if (probe.chainIdOk && hasCode) {
      ({ raw, threw } = await readUint(t.address, selector));
    }
    if (raw === null) inflowFailedKeys.push(t.key);
    inflowRaws.push(raw);
    items.push(
      buildFinancialNumeric({
        probe,
        hasCode,
        rawValue: raw,
        decodeThrew: threw,
        id: `financial.inflow.${t.key}`,
        label: `${t.label} cumulative gross USDC inflow (raw base units)`,
        contractRole: "sale",
        note: `Exact on-chain uint256 in 6-decimal USDC base units, read live via ${t.view}(). Cumulative membership-fee inflow recorded by this engine; read-only, never a canon constant.`,
        sourceRef: `contract-registry.ts:${t.key} (eth_call ${t.view})`,
        chainId,
        asOf,
      }),
    );
  }
  {
    const aggregate = probe.chainIdOk ? sumDecimalStrings(inflowRaws) : null;
    let value: string | null = null;
    let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let failureReason: string | null = chainSkipReason(probe);
    let note = "Aggregate inflow was not computed (chain not verified).";
    if (probe.chainIdOk) {
      if (aggregate === null) {
        confidence = "LOW";
        failureReason = `aggregate fails closed: component read(s) unavailable (${inflowFailedKeys.join(", ") || "unknown"})`;
        note = "One or more per-engine inflow reads failed, so the aggregate is reported unavailable rather than summing a partial truth.";
      } else {
        value = aggregate;
        confidence = "MEDIUM";
        lifecycle = "READ_ONLY_PROOF";
        failureReason = null;
        note = "Server-side bigint sum of the four live per-engine inflow reads (V1 + V2a + V2b + V3); exact 6-decimal USDC base units. Fails closed if any component is unavailable. Provenance: this figure includes founder test transactions made during protocol buildout — it is cumulative on-chain inflow, never external customer revenue.";
      }
    }
    items.push(
      buildItem({
        id: "financial.inflow.aggregate",
        label: "All-engine cumulative gross USDC inflow (raw base units)",
        value,
        sourceType: "LIVE_CHAIN_RPC",
        sourceRef: "eth_call totalUsdcRaised/totalGrossUsdc (V1 + V2a + V2b + V3, summed server-side)",
        chainId,
        contractRole: "sale",
        confidence,
        lifecycle,
        note,
        failureReason,
        asOf,
      }),
    );
  }

  // 2) Vault reserve wallet USDC balance (balanceOf on the USDC contract).
  {
    const data = encodeAddressArg(SELECTOR_BALANCE_OF, targets.vaultWallet);
    const hasCode = await hasCodeAt(targets.usdcTokenAddress);
    let raw: string | null = null;
    let threw = false;
    if (probe.chainIdOk && hasCode && data !== null) {
      ({ raw, threw } = await readUint(targets.usdcTokenAddress, data));
    } else if (probe.chainIdOk && hasCode && data === null) {
      threw = true;
    }
    items.push(
      buildFinancialNumeric({
        probe,
        hasCode,
        rawValue: raw,
        decodeThrew: threw,
        id: "financial.vault.usdcBalance",
        label: "Vault reserve wallet USDC balance (raw base units)",
        contractRole: "stablecoin",
        note: "Live balanceOf() read on the canon USDC contract for the protocol vault reserve wallet; exact 6-decimal base units. Aggregate balance only — the wallet address stays server-side. This is the wallet's CURRENT balance, not cumulative inflow: engines route USDC 70/20/10 to vault / liquidity / operations, so vault + operations + pool USDC together approximate the cumulative inflow figure.",
        sourceRef: "contract-registry.ts:USDC (eth_call balanceOf VAULT_WALLET)",
        chainId,
        asOf,
      }),
    );
  }

  // 2b) Operations wallet USDC balance — the routed-split reconciliation read.
  {
    const data = encodeAddressArg(SELECTOR_BALANCE_OF, targets.operationsWallet);
    const hasCode = await hasCodeAt(targets.usdcTokenAddress);
    let raw: string | null = null;
    let threw = false;
    if (probe.chainIdOk && hasCode && data !== null) {
      ({ raw, threw } = await readUint(targets.usdcTokenAddress, data));
    } else if (probe.chainIdOk && hasCode && data === null) {
      threw = true;
    }
    items.push(
      buildFinancialNumeric({
        probe,
        hasCode,
        rawValue: raw,
        decodeThrew: threw,
        id: "financial.ops.usdcBalance",
        label: "Operations wallet USDC balance (raw base units)",
        contractRole: "stablecoin",
        note: "Live balanceOf() read on the canon USDC contract for the protocol operations wallet; exact 6-decimal base units. Aggregate balance only — the wallet address stays server-side. Read so the 70/20/10 routed split (vault / liquidity / operations) can be reconciled against the cumulative inflow aggregate.",
        sourceRef: "contract-registry.ts:USDC (eth_call balanceOf OPERATIONS_WALLET)",
        chainId,
        asOf,
      }),
    );
  }

  // 3) AMM pair reserves, oriented server-side against the canon token addresses.
  {
    const hasCode = await hasCodeAt(targets.lpPair);
    let reserveSyn: string | null = null;
    let reserveUsdc: string | null = null;
    let threw = false;
    let orientationFailed = false;
    if (probe.chainIdOk && hasCode) {
      try {
        const [token0Raw, reservesRaw] = await Promise.all([
          ethCall(transport, targets.lpPair, SELECTOR_TOKEN0),
          ethCall(transport, targets.lpPair, SELECTOR_GET_RESERVES),
        ]);
        const token0 = decodeAddressWord(token0Raw);
        const reserves = decodeReservesPair(reservesRaw);
        if (token0 === null || reserves === null) {
          // decode failure path: values stay null → PENDING_ADAPTER via builder
        } else if (token0 === targets.synTokenAddress.toLowerCase()) {
          reserveSyn = reserves.reserve0;
          reserveUsdc = reserves.reserve1;
        } else if (token0 === targets.usdcTokenAddress.toLowerCase()) {
          reserveSyn = reserves.reserve1;
          reserveUsdc = reserves.reserve0;
        } else {
          orientationFailed = true;
        }
      } catch {
        threw = true;
      }
    }
    const orientationNote =
      "Live getReserves() read on the canon SYN/USDC pair, oriented against the canon token addresses server-side via token0(). Raw pool reserve in exact base units; not a valuation.";
    for (const side of [
      {
        id: "financial.lp.reserveSyn",
        label: "SYN/USDC pair — SYN reserve (raw base units)",
        value: reserveSyn,
        decimalsNote: "18-decimal SYN base units. " + orientationNote,
      },
      {
        id: "financial.lp.reserveUsdc",
        label: "SYN/USDC pair — USDC reserve (raw base units)",
        value: reserveUsdc,
        decimalsNote: "6-decimal USDC base units. " + orientationNote,
      },
    ]) {
      const item = buildFinancialNumeric({
        probe,
        hasCode,
        rawValue: side.value,
        decodeThrew: threw,
        id: side.id,
        label: side.label,
        contractRole: "lp-pair",
        note: side.decimalsNote,
        sourceRef: "contract-registry.ts:LP_PAIR (eth_call getReserves + token0)",
        chainId,
        asOf,
      });
      items.push(
        orientationFailed
          ? {
              ...item,
              value: null,
              valueType: "null",
              confidence: "LOW",
              lifecycle: "PAUSED_BY_PRECAUTION",
              failureReason:
                "pair token0 matched neither canon token (reported unavailable, never guessed)",
              note: "The pair's token0 did not match either canon token address; reserves fail closed rather than guessing an orientation.",
            }
          : item,
      );
    }
  }

  // 4) Burned SYN — live balanceOf() of the canonical burn address.
  {
    const data = encodeAddressArg(SELECTOR_BALANCE_OF, targets.synBurnAddress);
    const hasCode = await hasCodeAt(targets.synTokenAddress);
    let raw: string | null = null;
    let threw = false;
    if (probe.chainIdOk && hasCode && data !== null) {
      ({ raw, threw } = await readUint(targets.synTokenAddress, data));
    } else if (probe.chainIdOk && hasCode && data === null) {
      threw = true;
    }
    items.push(
      buildFinancialNumeric({
        probe,
        hasCode,
        rawValue: raw,
        decodeThrew: threw,
        id: "financial.burn.synBalance",
        label: "Burned SYN — canonical burn address balance (raw base units)",
        contractRole: "token",
        note: "Live balanceOf() read on the canon SYN contract for the canonical burn address — the cumulative on-chain burned figure in exact 18-decimal base units. Always the chain's figure, never a recorded ceremony constant.",
        sourceRef: "contract-registry.ts:SYN_TOKEN (eth_call balanceOf burn address)",
        chainId,
        asOf,
      }),
    );
  }

  // 5) Live member tally — memberCount() on the active engine (count only).
  {
    const engine = targets.memberCountEngine;
    const hasCode = await hasCodeAt(engine.address);
    let raw: string | null = null;
    let threw = false;
    if (probe.chainIdOk && hasCode) {
      ({ raw, threw } = await readUint(engine.address, SELECTOR_MEMBER_COUNT));
    }
    items.push(
      buildFinancialNumeric({
        probe,
        hasCode,
        rawValue: raw,
        decodeThrew: threw,
        id: "financial.members.memberCount",
        label: "Members — active engine memberCount()",
        contractRole: "sale",
        note: "Live aggregate member tally read from the active V3 engine. A count only — no wallet or wallet↔member-number mapping is read or exposed (PII boundary holds).",
        sourceRef: `contract-registry.ts:${engine.key} (eth_call memberCount)`,
        chainId,
        asOf,
      }),
    );
  }

  // 6) Referral registry liveness — code presence + engine linkage vs canon.
  {
    let value: boolean | null = null;
    let sourceType: ProtocolRealityItem["sourceType"] = "LIVE_CHAIN_RPC";
    let confidence: ProtocolRealityItem["confidence"] = "UNKNOWN";
    let lifecycle: ProtocolRealityItem["lifecycle"] = "PAUSED_BY_PRECAUTION";
    let failureReason: string | null = chainSkipReason(probe);
    let note = "Registry liveness was not read (chain not verified).";

    if (probe.chainIdOk) {
      const registryHasCode = await hasCodeAt(sourceLinkage.registryAddress);
      const engineHasCode = await hasCodeAt(sourceLinkage.saleAddress);
      if (!registryHasCode || !engineHasCode) {
        failureReason = "expected on-chain code not found; registry liveness fails closed";
        note = "Registry or engine code was not found on chain; liveness fails closed.";
      } else {
        let linked: string | null = null;
        let threw = false;
        try {
          linked = decodeAddressWord(
            await ethCall(transport, sourceLinkage.saleAddress, SELECTOR_SOURCE_REGISTRY),
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
          note = "The engine's registry view could not be decoded; liveness reported unavailable.";
        } else if (linked === sourceLinkage.registryAddress.toLowerCase()) {
          value = true;
          confidence = "HIGH";
          lifecycle = "READ_ONLY_PROOF";
          failureReason = null;
          note =
            "The Verified Introduction registry has on-chain code and the active engine's live linkage matches canon. The registry exposes only per-source views (existence/active/config by source id) — there is no global on-chain program flag, so none is reported or invented; per-source status is validated per link on request.";
        } else {
          value = null;
          confidence = "LOW";
          lifecycle = "PAUSED_BY_PRECAUTION";
          failureReason =
            "live registry linkage did not match canon (reported as unavailable, never normalized)";
          note = "Live registry linkage did not match canon; liveness fails closed rather than normalizing.";
        }
      }
    }

    items.push(
      buildItem({
        id: "financial.referral.registryLive",
        label: "Verified Introduction registry live on-chain",
        value,
        sourceType,
        sourceRef: `contract-registry.ts:${sourceLinkage.key} (eth_getCode + eth_call SOURCE_REGISTRY)`,
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

  // 7) Referral attribution ACTIVITY COUNT — static hash-pinned snapshot of a
  //    founder-gated chunked eth_getLogs scan (the provider caps ranges at
  //    10,000 blocks, so a per-request live count is impossible). Fails closed
  //    if the snapshot's gate/chain identity does not match expectations.
  {
    const snap = REFERRAL_ATTRIBUTION_SNAPSHOT;
    const snapshotValid =
      snap.gate === "REFERRAL_ATTRIBUTION_ACTIVITY_V1" &&
      snap.status === "VERIFIED" &&
      snap.chainId === EXPECTED_CHAIN_ID &&
      snap.registryKey === "SOURCE_REGISTRY_V1" &&
      Number.isInteger(snap.totalEvents) &&
      snap.totalEvents >= 0 &&
      Number.isInteger(snap.asOfBlock) &&
      snap.asOfBlock > snap.fromBlock;
    items.push(
      buildItem({
        id: "financial.referral.attributionActivity",
        label: "Verified Introduction registry — attribution activity count (lifecycle events)",
        value: snapshotValid ? String(snap.totalEvents) : null,
        sourceType: "INDEXED_CHAIN_SCAN",
        sourceRef: `referralAttributionSnapshot.ts (${snap.snapshotHash.slice(0, 18)}…, chunked eth_getLogs scan)`,
        chainId: snapshotValid ? snap.chainId : null,
        contractRole: "source-registry",
        confidence: snapshotValid ? "MEDIUM" : "LOW",
        lifecycle: snapshotValid ? "READ_ONLY_PROOF" : "PAUSED_BY_PRECAUTION",
        note: snapshotValid
          ? `Count of SourceRegistryV1 lifecycle events observed on-chain (indexed as of block ${snap.asOfBlock}, scan floor block ${snap.fromBlock}) — an ACTIVITY COUNT only, never a USDC or commission figure. No commission has ever been paid on-chain; CommissionRouterV1 is not deployed. Not a live per-request read: the RPC provider caps eth_getLogs ranges, so the count is served from a founder-gated, hash-pinned indexed snapshot.`
          : "The attribution activity snapshot failed its gate/chain-identity checks; the count is reported unavailable rather than served from an unverified snapshot.",
        failureReason: snapshotValid
          ? null
          : "attribution snapshot gate/chain mismatch (fail closed — regenerate via the founder-gated build)",
        asOf,
      }),
    );
  }

  // 8) SYN total supply — live totalSupply() on the canon SYN token. The
  //    fixed-supply figure read FROM CHAIN, never asserted from a canon constant.
  {
    const hasCode = await hasCodeAt(targets.synTokenAddress);
    let raw: string | null = null;
    let threw = false;
    if (probe.chainIdOk && hasCode) {
      ({ raw, threw } = await readUint(targets.synTokenAddress, SELECTOR_TOTAL_SUPPLY));
    }
    items.push(
      buildFinancialNumeric({
        probe,
        hasCode,
        rawValue: raw,
        decodeThrew: threw,
        id: "financial.token.synTotalSupply",
        label: "SYN total supply (raw base units)",
        contractRole: "token",
        note: "Live totalSupply() read on the canon SYN contract — the fixed supply in exact 18-decimal base units, read from chain (never a canon constant).",
        sourceRef: "contract-registry.ts:SYN_TOKEN (eth_call totalSupply)",
        chainId,
        asOf,
      }),
    );
  }

  // 9) SYN allocation-wallet balances — live balanceOf(SYN) per canon allocation
  //    wallet: the tokenomics distribution AS IT STANDS ON-CHAIN NOW. Each is a
  //    live figure that legitimately differs from the mint-time design allocation
  //    as SYN sells / vests / moves. Aggregate balance only; no address emitted.
  {
    const hasCode = await hasCodeAt(targets.synTokenAddress);
    for (const w of targets.allocationWallets) {
      const data = encodeAddressArg(SELECTOR_BALANCE_OF, w.address);
      let raw: string | null = null;
      let threw = false;
      if (probe.chainIdOk && hasCode && data !== null) {
        ({ raw, threw } = await readUint(targets.synTokenAddress, data));
      } else if (probe.chainIdOk && hasCode && data === null) {
        threw = true;
      }
      items.push(
        buildFinancialNumeric({
          probe,
          hasCode,
          rawValue: raw,
          decodeThrew: threw,
          id: `financial.distribution.${w.key}.balance`,
          label: `${w.label} allocation — current SYN balance (raw base units)`,
          contractRole: "token",
          note: `Live balanceOf() read on the canon SYN contract for the ${w.label} allocation wallet; exact 18-decimal base units. Aggregate balance only — the wallet address stays server-side. This is the wallet's CURRENT on-chain balance, which legitimately differs from the mint-time design allocation as SYN sells / vests / moves.`,
          sourceRef: `syndicate-config.ts:ALLOCATION_WALLETS[${w.key}] (eth_call balanceOf)`,
          chainId,
          asOf,
        }),
      );
    }
  }

  return items;
}

/** Pure build: transport injected, no cache, no network of its own beyond it. */
export async function buildProtocolReality(opts: BuildOpts): Promise<ProtocolRealityEnvelope> {
  const now = opts.now ?? (() => new Date());
  const asOf = now().toISOString();
  const probe = await probeChain(opts.transport);

  const [contracts, tokens, archive, sale, source, financial] = await Promise.all([
    buildContractsGroup(opts.transport, probe, opts.contractTargets, asOf),
    buildTokensGroup(opts.transport, probe, opts.tokenTargets, asOf),
    buildArchiveGroup(opts.transport, probe, opts.archiveTarget, opts.archiveArtifacts, asOf),
    buildSaleGroup(opts.transport, probe, opts.saleTargets, asOf),
    buildSourceGroup(opts.transport, probe, opts.sourceLinkageTarget, asOf),
    buildFinancialGroup(opts.transport, probe, opts.financialTargets, opts.sourceLinkageTarget, asOf),
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
      financial,
    },
  };
}

// ── Short in-memory cache + request coalescing + stale-while-revalidate ──────
// Served default path. Fresh (< TTL) is served from cache; stale-but-bounded
// (< TTL + SWR_MAX_STALE_MS) is served INSTANTLY while ONE coalesced refresh
// runs in the background (success-only pinning — a degraded refresh never
// overwrites a verified entry); beyond the hard-stale bound the caller awaits
// a fresh build. Public traffic therefore never triggers an RPC per request,
// and no entry is ever served past the bounded stale window.
const SWR_MAX_STALE_MS = 300_000; // 5 min hard bound beyond the TTL
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

/** Test hook: the current coalesced (background) build, if any. */
export function __getProtocolRealityInFlight(): Promise<ProtocolRealityEnvelope> | null {
  return inFlight;
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
    financialTargets: FINANCIAL_TARGETS,
  };
}

/** One coalesced build: success-only pinning, never throws away a verified entry. */
function startBuild(overrides: Partial<BuildOpts>): Promise<ProtocolRealityEnvelope> {
  if (inFlight) return inFlight; // coalesce concurrent callers onto one request
  inFlight = (async () => {
    try {
      const merged: BuildOpts = { ...defaultBuildOpts(), ...overrides };
      const result = await buildProtocolReality(merged);
      // Success-only caching: a build whose chain identity did NOT verify
      // (unreachable RPC / wrong chain → fail-closed nulls) is served live
      // but never pinned as bounded-age truth — a degraded refresh never
      // overwrites a previously verified entry.
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

export async function getProtocolReality(
  opts?: Partial<BuildOpts> & { ttlMs?: number; maxStaleMs?: number },
): Promise<ProtocolRealityEnvelope> {
  const ttl = opts?.ttlMs ?? CACHE_TTL_MS;
  const maxStale = opts?.maxStaleMs ?? SWR_MAX_STALE_MS;
  const { ttlMs: _ttlMs, maxStaleMs: _maxStaleMs, ...overrides } = opts ?? {};
  if (cacheEntry) {
    const age = Date.now() - cacheEntry.at;
    if (age < ttl) {
      return { ...cacheEntry.result, cached: true };
    }
    if (age < ttl + maxStale) {
      // Stale-while-revalidate: serve the bounded-age verified entry
      // instantly and refresh in the background (coalesced). A background
      // failure is swallowed here — the entry stays until the hard-stale
      // bound, after which callers await a fresh build again.
      void startBuild(overrides).catch(() => {});
      return { ...cacheEntry.result, cached: true };
    }
  }
  // No entry, or hard-stale beyond the SWR bound: await a fresh build
  // (fail-closed live — a degraded build is served but never pinned).
  return startBuild(overrides);
}
