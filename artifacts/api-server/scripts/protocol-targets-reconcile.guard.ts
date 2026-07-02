/**
 * Guard: Protocol-reality TARGETS / SELECTORS reconcile to vendored canon — 2.23A.
 * ------------------------------------------------------------------------------
 * The served protocol-reality engine lives under `src/` and is forbidden from
 * importing the vendored canon (the api-server tsconfig excludes `src/canon`).
 * So it HARDCODES the curated contract/token/archive targets and the ERC-20 /
 * archive function selectors. This guard — which runs via tsx OUTSIDE the app's
 * typecheck and therefore MAY import canon — proves those hardcoded values still
 * match the canon:
 *   - every served contract target's address + role match CONTRACT_REGISTRY and
 *     its canon status is LIVE or DEPLOYED (a contract that has code to read);
 *   - SYN/USDC token addresses match canon; SYN's symbol/decimals expectation
 *     matches TOKEN_SPEC; USDC carries no expectation;
 *   - the archive address matches canon and each surfaced artifact id's name +
 *     configured-on-chain flag match ARCHIVE_ID_REGISTRY;
 *   - every hardcoded selector equals keccak256(signature)[:4];
 *   - no served target is a wallet/EOA, null, or a non-address string.
 *
 * Run:  pnpm --filter @workspace/api-server run protocol-targets:guard
 * Exit: 0 if every check passes, 1 otherwise.
 */

import { CONTRACT_REGISTRY, contractByKey } from "../src/canon/the-syndicate/contracts/contract-registry";
import { TOKEN_SPEC } from "../src/canon/the-syndicate/contracts/syndicate-config";
import { ARCHIVE_ID_REGISTRY } from "../src/canon/the-syndicate/archive/archive-id-registry";

import { functionSelector, keccak256Hex } from "./avalanche-archive-posture-check";

import {
  CONTRACT_TARGETS,
  TOKEN_TARGETS,
  ARCHIVE_TARGET,
  ARCHIVE_ARTIFACTS,
  SALE_TARGETS,
} from "../src/data/protocolTargets";
import { FULL_ADDRESS_RE } from "../src/lib/protocol/rpcTransport";
import {
  SELECTOR_NAME,
  SELECTOR_SYMBOL,
  SELECTOR_DECIMALS,
} from "../src/lib/protocol/erc20Decoders";
import {
  SELECTOR_PAUSED,
  SELECTOR_GET_ARTIFACT_CORE,
} from "../src/lib/protocol/archiveDecoders";
import {
  SELECTOR_IS_CONCLUDED,
  SELECTOR_AVAILABLE_SYN,
  SELECTOR_TOTAL_GROSS_USDC,
  SELECTOR_RECEIPT_COUNT,
} from "../src/lib/protocol/saleDecoders";
import {
  SALE_ABI,
  SALE_V2_ABI,
  SALE_V3_ABI,
} from "../src/canon/the-syndicate/contracts/abi/sale-abi";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
}
const eqAddr = (a: string, b: string | null | undefined): boolean =>
  typeof b === "string" && a.toLowerCase() === b.toLowerCase();

function main(): void {
  // 0) keccak self-test + every served selector equals keccak256(sig)[:4].
  check(
    "keccak: empty-string digest",
    keccak256Hex(new Uint8Array(0)) ===
      "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  );
  check("selector: name() derived", SELECTOR_NAME === functionSelector("name()"), SELECTOR_NAME);
  check("selector: symbol() derived", SELECTOR_SYMBOL === functionSelector("symbol()"), SELECTOR_SYMBOL);
  check("selector: decimals() derived", SELECTOR_DECIMALS === functionSelector("decimals()"), SELECTOR_DECIMALS);
  check("selector: paused() derived", SELECTOR_PAUSED === functionSelector("paused()"), SELECTOR_PAUSED);
  check(
    "selector: getArtifactCore(uint256) derived",
    SELECTOR_GET_ARTIFACT_CORE === functionSelector("getArtifactCore(uint256)"),
    SELECTOR_GET_ARTIFACT_CORE,
  );
  check("selector: isConcluded() derived", SELECTOR_IS_CONCLUDED === functionSelector("isConcluded()"), SELECTOR_IS_CONCLUDED);
  check("selector: availableSyn() derived", SELECTOR_AVAILABLE_SYN === functionSelector("availableSyn()"), SELECTOR_AVAILABLE_SYN);
  check("selector: totalGrossUsdc() derived", SELECTOR_TOTAL_GROSS_USDC === functionSelector("totalGrossUsdc()"), SELECTOR_TOTAL_GROSS_USDC);
  check("selector: receiptCount() derived", SELECTOR_RECEIPT_COUNT === functionSelector("receiptCount()"), SELECTOR_RECEIPT_COUNT);

  // 1) Cardinality (adding a target must be deliberate).
  check("counts: 8 contract targets", CONTRACT_TARGETS.length === 8, String(CONTRACT_TARGETS.length));
  check("counts: 2 token targets", TOKEN_TARGETS.length === 2, String(TOKEN_TARGETS.length));
  check("counts: 2 archive artifacts", ARCHIVE_ARTIFACTS.length === 2, String(ARCHIVE_ARTIFACTS.length));
  check("counts: 3 sale targets", SALE_TARGETS.length === 3, String(SALE_TARGETS.length));

  // 2) Every served address is a real 0x[40] and NOT a wallet role.
  for (const t of CONTRACT_TARGETS) {
    check(`addr-shape: ${t.key} is a full address`, FULL_ADDRESS_RE.test(t.address), t.address.slice(0, 6));
    check(`role: ${t.key} is not a wallet/EOA`, (t.role as string) !== "wallet");
  }

  // 3) Contract targets reconcile to canon (address + role + deployable status).
  for (const t of CONTRACT_TARGETS) {
    const canon = contractByKey(t.key);
    check(`canon: ${t.key} present in registry`, Boolean(canon));
    if (!canon) continue;
    check(`canon: ${t.key} address matches`, eqAddr(t.address, canon.address), `${t.address} vs ${canon.address ?? "null"}`);
    check(`canon: ${t.key} role matches`, t.role === canon.role, `${t.role} vs ${canon.role}`);
    check(
      `canon: ${t.key} status is LIVE/DEPLOYED`,
      canon.status === "LIVE" || canon.status === "DEPLOYED",
      canon.status,
    );
  }

  // 3b) Served targets never reference a PENDING / null-address canon entry.
  const servedKeys = new Set(CONTRACT_TARGETS.map((t) => t.key));
  for (const c of CONTRACT_REGISTRY) {
    if (servedKeys.has(c.key)) {
      check(`canon: served ${c.key} has a non-null address`, typeof c.address === "string");
    }
  }

  // 4) Token targets: addresses match canon; SYN expectation == TOKEN_SPEC.
  const syn = TOKEN_TARGETS.find((t) => t.key === "SYN");
  const usdc = TOKEN_TARGETS.find((t) => t.key === "USDC");
  check("token: SYN present", Boolean(syn));
  check("token: USDC present", Boolean(usdc));
  if (syn) {
    check("token: SYN address matches canon", eqAddr(syn.address, contractByKey("SYN_TOKEN")?.address ?? null));
    check("token: SYN symbol expectation == TOKEN_SPEC", syn.expect?.symbol === TOKEN_SPEC.symbol, `${syn.expect?.symbol} vs ${TOKEN_SPEC.symbol}`);
    check("token: SYN decimals expectation == TOKEN_SPEC", syn.expect?.decimals === TOKEN_SPEC.decimals, `${syn.expect?.decimals} vs ${TOKEN_SPEC.decimals}`);
  }
  if (usdc) {
    check("token: USDC address matches canon", eqAddr(usdc.address, contractByKey("USDC")?.address ?? null));
    check("token: USDC carries NO canon expectation", usdc.expect === undefined);
  }

  // 5) Archive address + artifact ids reconcile to canon.
  check("archive: address matches canon", eqAddr(ARCHIVE_TARGET.address, contractByKey("ARCHIVE_1155")?.address ?? null));
  for (const a of ARCHIVE_ARTIFACTS) {
    const canon = ARCHIVE_ID_REGISTRY.find((e) => e.id === a.id);
    check(`archive: id ${a.id} present in registry`, Boolean(canon));
    if (!canon) continue;
    check(`archive: id ${a.id} name matches`, a.label === canon.name, `${a.label} vs ${canon.name}`);
    check(`archive: id ${a.id} configuredOnChain matches`, a.configuredOnChain === canon.configuredOnChain);
  }

  // 6) Sale targets reconcile to canon (address/role/status), hasIsConcluded
  //    matches the canon ABI, every numeric view exists as a uint256 view, and
  //    only V3 surfaces numeric reads this sprint (V1/V2 stay flags-only).
  type AbiEntry = {
    type: string;
    name?: string;
    stateMutability?: string;
    outputs?: readonly { type: string }[];
  };
  const abiByKey: Record<string, readonly AbiEntry[]> = {
    MEMBERSHIP_SALE: SALE_ABI as unknown as readonly AbiEntry[],
    MEMBERSHIP_SALE_V2: SALE_V2_ABI as unknown as readonly AbiEntry[],
    MEMBERSHIP_SALE_V3: SALE_V3_ABI as unknown as readonly AbiEntry[],
  };
  const hasView = (abi: readonly AbiEntry[] | undefined, name: string): boolean =>
    Array.isArray(abi) &&
    abi.some(
      (e) =>
        e.type === "function" &&
        e.name === name &&
        e.stateMutability === "view" &&
        Array.isArray(e.outputs) &&
        e.outputs.length === 1 &&
        e.outputs[0]?.type === "uint256",
    );

  for (const s of SALE_TARGETS) {
    check(`sale addr-shape: ${s.key} is a full address`, FULL_ADDRESS_RE.test(s.address), s.address.slice(0, 6));
    check(`sale role: ${s.key} is 'sale'`, s.role === "sale", s.role);
    const canon = contractByKey(s.key);
    check(`sale canon: ${s.key} present in registry`, Boolean(canon));
    if (canon) {
      check(`sale canon: ${s.key} address matches`, eqAddr(s.address, canon.address), `${s.address} vs ${canon.address ?? "null"}`);
      check(`sale canon: ${s.key} role matches`, canon.role === "sale", canon.role);
      check(
        `sale canon: ${s.key} status is LIVE/DEPLOYED`,
        canon.status === "LIVE" || canon.status === "DEPLOYED",
        canon.status,
      );
    }
    // hasIsConcluded reflects the canon ABI (V1 has none; V2/V3 do).
    const abi = abiByKey[s.key];
    const abiHasConcluded =
      Array.isArray(abi) && abi.some((e) => e.type === "function" && e.name === "isConcluded" && e.stateMutability === "view");
    check(`sale abi: ${s.key} hasIsConcluded matches canon`, s.hasIsConcluded === abiHasConcluded, `${s.hasIsConcluded} vs ${abiHasConcluded}`);
    // Every surfaced numeric view must be a real uint256 view in the canon ABI.
    for (const nr of s.numericReads) {
      check(`sale abi: ${s.key} view ${nr.view} exists (uint256)`, hasView(abi, nr.view));
    }
  }
  // Sprint-2 scope lock: numeric reads are V3-only, exactly the 3 approved views.
  const byKey = (k: string) => SALE_TARGETS.find((t) => t.key === k);
  check("sale scope: V1 has no numeric reads", (byKey("MEMBERSHIP_SALE")?.numericReads.length ?? -1) === 0);
  check("sale scope: V2 has no numeric reads", (byKey("MEMBERSHIP_SALE_V2")?.numericReads.length ?? -1) === 0);
  check("sale scope: V3 surfaces exactly 3 numeric reads", (byKey("MEMBERSHIP_SALE_V3")?.numericReads.length ?? -1) === 3);
  {
    const v3Views = (byKey("MEMBERSHIP_SALE_V3")?.numericReads ?? []).map((n) => n.view).sort().join(",");
    check("sale scope: V3 numeric views are the approved set", v3Views === "availableSyn,receiptCount,totalGrossUsdc", v3Views);
  }

  // ── report ──────────────────────────────────────────────────────────────────
  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed += 1;
    const tag = r.ok ? "PASS" : "FAIL";
    const detail = r.detail ? `  (${r.detail})` : "";
    process.stdout.write(`[${tag}] ${r.name}${r.ok ? "" : detail}\n`);
  }
  process.stdout.write(`\nprotocol-targets reconcile: ${results.length - failed}/${results.length} passed\n`);
  if (failed > 0) process.exit(1);
}

main();
