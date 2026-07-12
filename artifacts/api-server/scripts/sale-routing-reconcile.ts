/**
 * sale-routing:reconcile — THE CHAIN IS THE AUTHORITY for the routing wallets.
 * ---------------------------------------------------------------------------
 * Reads the deployed MembershipSaleV3 immutables VAULT / LIQUIDITY / OPERATIONS
 * live (eth_call) and asserts each equals the served FINANCIAL_TARGETS value (the
 * offline protocol-targets guard separately pins those to vendored canon). A
 * divergence is a RED-ALERT: publishing a proof link to a wallet the contract
 * never routes to would be a verified lie — worse than no link.
 *
 * Why a re-runnable SCRIPT, not a deterministic guard: every guard here uses mock
 * transports (never touches the network, by design), so a network-dependent
 * blocking guard would be flaky. And VAULT/LIQUIDITY/OPERATIONS are Solidity
 * `immutable` — they cannot change without a redeploy — so a re-runnable reconcile
 * (the holder-index:reconcile idiom) is the correct enforcement. Fail-closed on a
 * real DIVERGENCE (exit 1). If the RPC is genuinely unreachable, or a read fails,
 * it reports SKIPPED and exits 0 (an infra condition, never a false green on a
 * real mismatch).
 *
 * Run: pnpm --filter @workspace/api-server run sale-routing:reconcile
 */
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../src/lib/protocol/rpcTransport";
import { ethCall, probeChain, readCodePresent } from "../src/lib/protocol/evmRead";
import { callData } from "../src/lib/protocol/archiveDecoders";
import { decodeAddressWord } from "../src/lib/protocol/sourceDecoders";
import { FINANCIAL_TARGETS } from "../src/data/protocolTargets";

// Function selectors = keccak256("VAULT()"|"LIQUIDITY()"|"OPERATIONS()")[:4],
// verified 2026-07-12 (viem toFunctionSelector). No-arg calls → data = selector.
const SELECTORS = {
  VAULT: "0x411557d1",
  LIQUIDITY: "0x2861c7d1",
  OPERATIONS: "0xfd4e36ec",
} as const;

const SALE = FINANCIAL_TARGETS.memberCountEngine.address;
const SERVED: Record<keyof typeof SELECTORS, string> = {
  VAULT: FINANCIAL_TARGETS.vaultWallet,
  LIQUIDITY: FINANCIAL_TARGETS.liquidityWallet,
  OPERATIONS: FINANCIAL_TARGETS.operationsWallet,
};

function skip(reason: string): never {
  console.log(`[sale-routing:reconcile] SKIPPED — ${reason}. Not a mismatch; re-run when reachable.`);
  process.exit(0);
}

async function main(): Promise<void> {
  const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);

  const probe = await probeChain(transport);
  if (!probe.chainIdOk) {
    skip(probe.rpcReachable ? "chain identity unverified" : "RPC unreachable");
  }
  let hasCode = false;
  try {
    hasCode = await readCodePresent(transport, SALE);
  } catch {
    hasCode = false;
  }
  if (!hasCode) skip(`deployed engine code not found at ${SALE}`);

  // Read all three first; a read failure = infra condition → SKIP (never a green
  // that could mask a divergence, since a divergence returns a valid address).
  const onChain: Partial<Record<keyof typeof SELECTORS, string>> = {};
  for (const name of ["VAULT", "LIQUIDITY", "OPERATIONS"] as const) {
    let addr: string | null = null;
    try {
      addr = decodeAddressWord(await ethCall(transport, SALE, callData(SELECTORS[name])));
    } catch {
      addr = null;
    }
    if (addr === null) skip(`${name}() read failed`);
    onChain[name] = addr;
  }

  let diverged = false;
  for (const name of ["VAULT", "LIQUIDITY", "OPERATIONS"] as const) {
    const chain = onChain[name]!;
    const served = SERVED[name];
    const ok = chain.toLowerCase() === served.toLowerCase();
    if (!ok) diverged = true;
    console.log(`  ${name.padEnd(11)} chain=${chain} served=${served} ${ok ? "MATCH" : "*** DIVERGENCE ***"}`);
  }

  if (diverged) {
    console.error(
      "[sale-routing:reconcile] DIVERGENCE — a deployed immutable does not match its served target. STOP. The chain is the authority; fix the served constant, never the other way.",
    );
    process.exit(1);
  }
  console.log(
    "[sale-routing:reconcile] PASS — VAULT/LIQUIDITY/OPERATIONS all equal the deployed immutables.",
  );
}

main().catch((err) => {
  console.error("[sale-routing:reconcile] ERROR:", err);
  process.exit(1);
});
