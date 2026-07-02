/**
 * Read-only EVM read primitives (SERVED, canon-free) — Slice 2.23A.
 * ----------------------------------------------------------------
 * The smallest set of read calls used by the protocol-reality service:
 *   1. probeChain  — eth_chainId FIRST; nothing is trusted until it verifies.
 *   2. readCodePresent — eth_getCode (deployment existence) — caller decides
 *      to call this ONLY after probeChain reports chainIdOk.
 *   3. ethCall — a single eth_call (used for ERC-20 / archive view selectors).
 *
 * No private key, no wallet, no transaction, no write. eth_* method names are
 * used only because Avalanche C-Chain is EVM-compatible.
 */

import { EXPECTED_CHAIN_ID, type RpcTransport } from "./rpcTransport";

export type ChainProbe = {
  rpcReachable: boolean;
  chainIdActual: number | null;
  chainIdActualHex: string | null;
  chainIdOk: boolean;
  wrongChain: boolean;
};

/** eth_chainId FIRST. Reachable-but-unparseable and unreachable both fail closed. */
export async function probeChain(transport: RpcTransport): Promise<ChainProbe> {
  let rpcReachable = false;
  let chainIdActual: number | null = null;
  let chainIdActualHex: string | null = null;
  try {
    const raw = await transport("eth_chainId", []);
    rpcReachable = true;
    if (typeof raw === "string" && /^0x[0-9a-fA-F]+$/.test(raw)) {
      chainIdActualHex = raw.toLowerCase();
      chainIdActual = Number.parseInt(raw, 16);
    }
  } catch {
    rpcReachable = false;
  }
  const chainIdOk = chainIdActual === EXPECTED_CHAIN_ID;
  const wrongChain = chainIdActual !== null && chainIdActual !== EXPECTED_CHAIN_ID;
  return { rpcReachable, chainIdActual, chainIdActualHex, chainIdOk, wrongChain };
}

/** True only when the address has on-chain bytecode. Throws on RPC failure. */
export async function readCodePresent(transport: RpcTransport, address: string): Promise<boolean> {
  const code = await transport("eth_getCode", [address, "latest"]);
  return typeof code === "string" && code !== "0x" && code !== "0x0" && code.length > 2;
}

/** A single read-only eth_call against a contract view selector. */
export async function ethCall(
  transport: RpcTransport,
  to: string,
  data: string,
): Promise<unknown> {
  return transport("eth_call", [{ to, data }, "latest"]);
}

/** Current chain head block number. Throws on RPC/parse failure (fail closed). */
export async function ethBlockNumber(transport: RpcTransport): Promise<number> {
  const raw = await transport("eth_blockNumber", []);
  if (typeof raw !== "string" || !/^0x[0-9a-fA-F]+$/.test(raw)) {
    throw new Error("eth_blockNumber: unparseable result");
  }
  return Number.parseInt(raw, 16);
}

/** A raw log entry as returned by eth_getLogs (opaque; decoded elsewhere). */
export type RawLogEntry = {
  address?: unknown;
  topics?: unknown;
  data?: unknown;
  blockNumber?: unknown;
  blockHash?: unknown;
  transactionHash?: unknown;
  logIndex?: unknown;
};

export type GetLogsRange = {
  address: string;
  /** Inclusive block bounds. */
  fromBlock: number;
  toBlock: number;
  /** topic0 filter (event signature hash); further topics left unconstrained. */
  topic0: string;
};

/** A block header subset as returned by eth_getBlockByNumber (opaque; parsed by caller). */
export type RawBlockHeader = {
  number?: unknown;
  hash?: unknown;
  timestamp?: unknown;
};

/**
 * Read-only eth_getBlockByNumber (header only, no transactions). Throws on RPC
 * failure, a null block, or a non-object result (fail closed — the caller must
 * treat the block as NOT enriched; it never invents a timestamp).
 */
export async function ethGetBlockByNumber(
  transport: RpcTransport,
  blockNumber: number,
): Promise<RawBlockHeader> {
  const raw = await transport("eth_getBlockByNumber", [
    "0x" + blockNumber.toString(16),
    false,
  ]);
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("eth_getBlockByNumber: null or non-object result");
  }
  return raw as RawBlockHeader;
}

/**
 * Read-only eth_getLogs over an inclusive block range for a single address and
 * a single topic0. Returns the raw log array verbatim (server-only). Throws on
 * RPC failure or a non-array result (fail closed — the caller does not advance).
 */
export async function ethGetLogs(
  transport: RpcTransport,
  range: GetLogsRange,
): Promise<RawLogEntry[]> {
  const params = [
    {
      address: range.address,
      fromBlock: "0x" + range.fromBlock.toString(16),
      toBlock: "0x" + range.toBlock.toString(16),
      topics: [range.topic0],
    },
  ];
  const raw = await transport("eth_getLogs", params);
  if (!Array.isArray(raw)) {
    throw new Error("eth_getLogs: non-array result");
  }
  return raw as RawLogEntry[];
}
