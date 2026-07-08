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
import {
  TOKEN_SPEC,
  CONTRACTS,
  SYN_BURN_ADDRESS,
  LP_POOL,
  MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS,
} from "../src/canon/the-syndicate/contracts/syndicate-config";
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
  SELECTOR_SOURCE_EXISTS,
  SELECTOR_SOURCE_IS_ACTIVE,
  SELECTOR_SOURCE_REGISTRY,
  SELECTOR_QUOTE,
  SELECTOR_MEMBER_NUMBER_OF,
} from "../src/lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET, FINANCIAL_TARGETS } from "../src/data/protocolTargets";
import {
  SELECTOR_TOTAL_USDC_RAISED,
  SELECTOR_BALANCE_OF,
  SELECTOR_GET_RESERVES,
  SELECTOR_TOKEN0,
  SELECTOR_MEMBER_COUNT,
  encodeAddressArg,
  decodeReservesPair,
  sumDecimalStrings,
} from "../src/lib/protocol/financialDecoders";
import {
  SALE_ABI,
  SALE_V2_ABI,
  SALE_V3_ABI,
  SOURCE_REGISTRY_V1_ABI,
  PAIR_ABI,
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
  check("selector: sourceExists(bytes32) derived", SELECTOR_SOURCE_EXISTS === functionSelector("sourceExists(bytes32)"), SELECTOR_SOURCE_EXISTS);
  check("selector: isActive(bytes32) derived", SELECTOR_SOURCE_IS_ACTIVE === functionSelector("isActive(bytes32)"), SELECTOR_SOURCE_IS_ACTIVE);
  check("selector: SOURCE_REGISTRY() derived", SELECTOR_SOURCE_REGISTRY === functionSelector("SOURCE_REGISTRY()"), SELECTOR_SOURCE_REGISTRY);
  check("selector: quote(uint256,address,bytes32) derived", SELECTOR_QUOTE === functionSelector("quote(uint256,address,bytes32)"), SELECTOR_QUOTE);
  check("selector: memberNumberOf(address) derived", SELECTOR_MEMBER_NUMBER_OF === functionSelector("memberNumberOf(address)"), SELECTOR_MEMBER_NUMBER_OF);
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

  // 7) Source linkage target reconciles to canon: registry + active engine
  //    addresses/roles/status, and every read the public MVP performs exists in
  //    the canon ABI with the exact expected shape.
  {
    const t = SOURCE_LINKAGE_TARGET;
    check("source: registry address is a full address", FULL_ADDRESS_RE.test(t.registryAddress), t.registryAddress.slice(0, 6));
    check("source: sale address is a full address", FULL_ADDRESS_RE.test(t.saleAddress), t.saleAddress.slice(0, 6));
    const regCanon = contractByKey("SOURCE_REGISTRY_V1");
    check("source canon: SOURCE_REGISTRY_V1 present in registry", Boolean(regCanon));
    if (regCanon) {
      check("source canon: registry address matches", eqAddr(t.registryAddress, regCanon.address), `${t.registryAddress} vs ${regCanon.address ?? "null"}`);
      check("source canon: registry role is source-registry", regCanon.role === "source-registry", regCanon.role);
      check("source canon: registry status is LIVE/DEPLOYED", regCanon.status === "LIVE" || regCanon.status === "DEPLOYED", regCanon.status);
    }
    const v3Canon = contractByKey("MEMBERSHIP_SALE_V3");
    check("source canon: sale address matches MEMBERSHIP_SALE_V3", eqAddr(t.saleAddress, v3Canon?.address ?? null), `${t.saleAddress} vs ${v3Canon?.address ?? "null"}`);
    const servedV3 = SALE_TARGETS.find((s) => s.key === "MEMBERSHIP_SALE_V3");
    check("source: linkage sale address equals the served V3 sale target", eqAddr(t.saleAddress, servedV3?.address ?? null));

    const regAbi = SOURCE_REGISTRY_V1_ABI as unknown as readonly AbiEntry[];
    const boolView = (abi: readonly AbiEntry[], name: string): boolean =>
      abi.some(
        (e) =>
          e.type === "function" &&
          e.name === name &&
          e.stateMutability === "view" &&
          Array.isArray(e.outputs) &&
          e.outputs.length === 1 &&
          e.outputs[0]?.type === "bool",
      );
    check("source abi: registry sourceExists(bytes32) is a bool view", boolView(regAbi, "sourceExists"));
    check("source abi: registry isActive(bytes32) is a bool view", boolView(regAbi, "isActive"));

    const v3Abi = SALE_V3_ABI as unknown as readonly AbiEntry[];
    const sourceRegistryView = v3Abi.find(
      (e) => e.type === "function" && e.name === "SOURCE_REGISTRY" && e.stateMutability === "view",
    );
    check("source abi: V3 SOURCE_REGISTRY() is an address view", Array.isArray(sourceRegistryView?.outputs) && sourceRegistryView.outputs.length === 1 && sourceRegistryView.outputs[0]?.type === "address");
    const quoteView = v3Abi.find(
      (e) => e.type === "function" && e.name === "quote" && e.stateMutability === "view",
    );
    check("source abi: V3 quote(...) is a view with 6 outputs", Array.isArray(quoteView?.outputs) && quoteView.outputs.length === 6);
    const memberNumberView = v3Abi.find(
      (e) => e.type === "function" && e.name === "memberNumberOf" && e.stateMutability === "view",
    );
    check("source abi: V3 memberNumberOf(address) is a uint256 view", Array.isArray(memberNumberView?.outputs) && memberNumberView.outputs.length === 1 && memberNumberView.outputs[0]?.type === "uint256");
  }

  // 8) FINANCIAL TARGETS (Slice N1) reconcile to canon: every selector derived,
  //    every address matches its canon authority, every read exists in the
  //    canon ABI with the exact shape, and the pure decoders behave fail-closed.
  {
    // 8a) Selector derivations.
    check("fin selector: totalUsdcRaised() derived", SELECTOR_TOTAL_USDC_RAISED === functionSelector("totalUsdcRaised()"), SELECTOR_TOTAL_USDC_RAISED);
    check("fin selector: balanceOf(address) derived", SELECTOR_BALANCE_OF === functionSelector("balanceOf(address)"), SELECTOR_BALANCE_OF);
    check("fin selector: getReserves() derived", SELECTOR_GET_RESERVES === functionSelector("getReserves()"), SELECTOR_GET_RESERVES);
    check("fin selector: token0() derived", SELECTOR_TOKEN0 === functionSelector("token0()"), SELECTOR_TOKEN0);
    check("fin selector: memberCount() derived", SELECTOR_MEMBER_COUNT === functionSelector("memberCount()"), SELECTOR_MEMBER_COUNT);

    // 8b) Inflow cardinality + order + per-engine canon authority.
    const F = FINANCIAL_TARGETS;
    check("fin inflows: exactly 3, deployment order V2a → V2b → V3", F.inflows.length === 3 && F.inflows[0]?.key === "MEMBERSHIP_SALE_V2A" && F.inflows[1]?.key === "MEMBERSHIP_SALE_V2" && F.inflows[2]?.key === "MEMBERSHIP_SALE_V3", F.inflows.map((i) => i.key).join(","));
    for (const i of F.inflows) {
      check(`fin addr-shape: inflow ${i.key} is a full address`, FULL_ADDRESS_RE.test(i.address), i.address.slice(0, 6));
    }
    const v2a = F.inflows.find((i) => i.key === "MEMBERSHIP_SALE_V2A");
    check("fin canon: V2a address matches syndicate-config (sealed continuity engine)", eqAddr(v2a?.address ?? "", MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS), `${v2a?.address} vs ${MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS ?? "null"}`);
    check("fin canon: V2a is deliberately ABSENT from the contract registry (config-only canon)", contractByKey("MEMBERSHIP_SALE_V2A") === undefined);
    check("fin canon: V2a view is totalUsdcRaised", v2a?.view === "totalUsdcRaised");
    const v2b = F.inflows.find((i) => i.key === "MEMBERSHIP_SALE_V2");
    check("fin canon: V2b address matches contract registry", eqAddr(v2b?.address ?? "", contractByKey("MEMBERSHIP_SALE_V2")?.address ?? null));
    check("fin canon: V2b view is totalUsdcRaised", v2b?.view === "totalUsdcRaised");
    const v3f = F.inflows.find((i) => i.key === "MEMBERSHIP_SALE_V3");
    check("fin canon: V3 address matches contract registry", eqAddr(v3f?.address ?? "", contractByKey("MEMBERSHIP_SALE_V3")?.address ?? null));
    check("fin canon: V3 view is totalGrossUsdc (the active engine's own figure)", v3f?.view === "totalGrossUsdc");
    check("fin canon: V3 inflow address equals the served V3 sale target", eqAddr(v3f?.address ?? "", SALE_TARGETS.find((s) => s.key === "MEMBERSHIP_SALE_V3")?.address ?? null));

    // 8c) Inflow views exist in the canon ABIs as uint256 views.
    type FinAbiEntry = { type: string; name?: string; stateMutability?: string; outputs?: readonly { type: string }[] };
    const finHasView = (abi: readonly FinAbiEntry[], name: string, outType: string): boolean =>
      abi.some((e) => e.type === "function" && e.name === name && e.stateMutability === "view" && Array.isArray(e.outputs) && e.outputs.length === 1 && e.outputs[0]?.type === outType);
    const v2Abi = SALE_V2_ABI as unknown as readonly FinAbiEntry[];
    const v3Abi = SALE_V3_ABI as unknown as readonly FinAbiEntry[];
    const v1Abi = SALE_ABI as unknown as readonly FinAbiEntry[];
    check("fin abi: totalUsdcRaised() is a uint256 view in SALE_V2_ABI (V2a same-source)", finHasView(v2Abi, "totalUsdcRaised", "uint256"));
    check("fin abi: totalGrossUsdc() is a uint256 view in SALE_V3_ABI", finHasView(v3Abi, "totalGrossUsdc", "uint256"));
    check("fin abi: memberCount() is a uint256 view in SALE_V3_ABI", finHasView(v3Abi, "memberCount", "uint256"));
    // Founder-approved N1 scope: inflows are exactly V2a + V2b + V3. V1's canon
    // ABI DOES expose totalUsdcRaised() — its exclusion is a deliberate scope
    // decision, so the guard pins BOTH facts: the ABI fact stays true AND no
    // V1 inflow target sneaks in without a deliberate guard change.
    check("fin scope: V1 ABI exposes totalUsdcRaised (exclusion is scope, not capability)", finHasView(v1Abi, "totalUsdcRaised", "uint256"));
    check("fin scope: NO V1 inflow target (founder-scoped to V2a+V2b+V3)", F.inflows.every((i) => (i.key as string) !== "MEMBERSHIP_SALE"));

    // 8d) Wallet/token/pair addresses reconcile to their canon authorities.
    check("fin canon: vaultWallet == CONTRACTS.VAULT_WALLET", eqAddr(F.vaultWallet, CONTRACTS.VAULT_WALLET));
    check("fin canon: synBurnAddress == SYN_BURN_ADDRESS (canonical 0x…dEaD)", eqAddr(F.synBurnAddress, SYN_BURN_ADDRESS) && F.synBurnAddress.toLowerCase().endsWith("dead"));
    check("fin canon: usdcTokenAddress matches contract registry USDC", eqAddr(F.usdcTokenAddress, contractByKey("USDC")?.address ?? null));
    check("fin canon: synTokenAddress matches contract registry SYN_TOKEN", eqAddr(F.synTokenAddress, contractByKey("SYN_TOKEN")?.address ?? null));
    check("fin canon: lpPair matches LP_POOL.pairAddress", eqAddr(F.lpPair, LP_POOL.pairAddress));
    check("fin canon: lpPair matches contract registry LP_PAIR", eqAddr(F.lpPair, contractByKey("LP_PAIR")?.address ?? null));
    check("fin canon: memberCountEngine is the active V3 engine", F.memberCountEngine.key === "MEMBERSHIP_SALE_V3" && eqAddr(F.memberCountEngine.address, contractByKey("MEMBERSHIP_SALE_V3")?.address ?? null));
    for (const [label, addr] of [["vaultWallet", F.vaultWallet], ["synBurnAddress", F.synBurnAddress], ["usdcTokenAddress", F.usdcTokenAddress], ["synTokenAddress", F.synTokenAddress], ["lpPair", F.lpPair], ["memberCountEngine", F.memberCountEngine.address]] as const) {
      check(`fin addr-shape: ${label} is a full address`, FULL_ADDRESS_RE.test(addr), addr.slice(0, 6));
    }

    // 8e) PAIR_ABI shape: token0 address view; getReserves 3 outputs (uint112, uint112, uint32).
    const pairAbi = PAIR_ABI as unknown as readonly FinAbiEntry[];
    check("fin abi: PAIR token0() is an address view", finHasView(pairAbi, "token0", "address"));
    const reserves = pairAbi.find((e) => e.type === "function" && e.name === "getReserves" && e.stateMutability === "view");
    check("fin abi: PAIR getReserves() is a view with exactly (uint112, uint112, uint32)", Array.isArray(reserves?.outputs) && reserves.outputs.length === 3 && reserves.outputs[0]?.type === "uint112" && reserves.outputs[1]?.type === "uint112" && reserves.outputs[2]?.type === "uint32");

    // 8f) Pure decoder fail-closed self-tests (executed, not assumed).
    const enc = encodeAddressArg(SELECTOR_BALANCE_OF, F.vaultWallet);
    check("fin pure: encodeAddressArg = selector + left-padded lowercase word", enc === SELECTOR_BALANCE_OF + F.vaultWallet.slice(2).toLowerCase().padStart(64, "0") && enc.length === 10 + 64);
    check("fin pure: encodeAddressArg rejects malformed addresses (null, fail closed)", encodeAddressArg(SELECTOR_BALANCE_OF, "0x1234") === null && encodeAddressArg(SELECTOR_BALANCE_OF, "not-an-address") === null);
    const w = (v: bigint): string => v.toString(16).padStart(64, "0");
    const r0 = 987654321000000000000n;
    const r1 = 4321000000n;
    const goodReserves = "0x" + w(r0) + w(r1) + w(100n);
    const dec = decodeReservesPair(goodReserves);
    check("fin pure: decodeReservesPair exact strings from a 192-hex payload", dec?.reserve0 === r0.toString() && dec?.reserve1 === r1.toString());
    check("fin pure: decodeReservesPair rejects short/overlong/non-hex payloads", decodeReservesPair("0x" + w(r0) + w(r1)) === null && decodeReservesPair(goodReserves + "00") === null && decodeReservesPair("0xzz") === null && decodeReservesPair(null) === null);
    const overUint112 = "0x" + w((1n << 112n)) + w(r1) + w(100n);
    check("fin pure: decodeReservesPair rejects a reserve above uint112 max", decodeReservesPair(overUint112) === null);
    check("fin pure: sumDecimalStrings exact bigint sum above MAX_SAFE_INTEGER", sumDecimalStrings(["9007199254740993", "1", "16000000000000000000000"]) === "16000009007199254740994");
    check("fin pure: sumDecimalStrings fails closed on ANY null/malformed component", sumDecimalStrings(["1", null, "2"]) === null && sumDecimalStrings(["1", "-2"]) === null && sumDecimalStrings(["1", "2.5"]) === null);
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
