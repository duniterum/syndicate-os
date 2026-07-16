/**
 * Guard: sale-event SCAN targets + event decoders reconcile to vendored canon.
 * ---------------------------------------------------------------------------
 * The served indexer lives under `src/` and cannot import the vendored canon, so
 * it PINS each scan contract (address + deploy block), each event's canonical
 * signature, its keccak256 topic0, and its static parameter layout. This guard
 * runs via tsx (OUTSIDE the app typecheck) and therefore MAY import canon; it
 * proves those pinned values still match `sale-abi.ts` + `syndicate-config.ts`:
 *   - every pinned event signature == the canon ABI signature (types in order);
 *   - every pinned topic0 == keccak256(signature);
 *   - every pinned param (name/type/indexed) matches the canon event input;
 *   - every scan target's address + fromBlock match canon;
 *   - V2a is HISTORICAL_SEALED, scan-only, and NEVER an active sale target
 *     (absent from SALE_TARGETS; its address matches none of them);
 *   - V3 is ACTIVE and its scan address == the active SALE_TARGETS V3 address;
 *   - every scan target is scanOnly (no write/buy path) and no address leaks
 *     into an address-free scan-unit summary.
 *
 * Run:  pnpm --filter @workspace/api-server run sale-scan:guard
 * Exit: 0 if every check passes, 1 otherwise.
 */

import {
  CONTRACTS,
  MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS,
  MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS,
  MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS,
  SALE_DEPLOYMENT_BLOCK,
  SALE_V2A_DEPLOYMENT_BLOCK,
  SALE_V2_DEPLOYMENT_BLOCK,
  SALE_V3_DEPLOYMENT_BLOCK,
} from "../src/canon/the-syndicate/contracts/syndicate-config";
import {
  SALE_ABI,
  SALE_V2_ABI,
  SALE_V3_ABI,
} from "../src/canon/the-syndicate/contracts/abi/sale-abi";

import { keccak256Hex } from "./avalanche-archive-posture-check";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  SALE_SCAN_TARGETS,
  SALE_TARGETS,
  type SaleGeneration,
} from "../src/data/protocolTargets";
import {
  SALE_EVENT_DEFS_BY_NAME,
  type EventParam,
} from "../src/lib/protocol/saleEventDecoders";
import { FULL_ADDRESS_RE, assertNoAddressLeak } from "../src/lib/protocol/rpcTransport";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
}
const eqAddr = (a: string, b: string | null | undefined): boolean =>
  typeof b === "string" && a.toLowerCase() === b.toLowerCase();

type AbiInput = { name: string; type: string; indexed?: boolean };
type AbiEvent = { type: string; name?: string; inputs?: readonly AbiInput[] };

const topic0FromSig = (sig: string): string =>
  "0x" + keccak256Hex(new TextEncoder().encode(sig));

function canonEvent(abi: readonly AbiEvent[], name: string): AbiEvent | undefined {
  return abi.find((e) => e.type === "event" && e.name === name);
}
function sigFromAbi(ev: AbiEvent): string {
  const types = (ev.inputs ?? []).map((i) => i.type).join(",");
  return `${ev.name}(${types})`;
}

// generation → canon facts (address, deploy block, ABI, events).
const GEN: Record<
  SaleGeneration,
  {
    key: string;
    address: string | null;
    block: bigint | null;
    abi: readonly AbiEvent[];
    events: readonly string[];
  }
> = {
  V1: {
    key: "MEMBERSHIP_SALE",
    address: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS,
    block: SALE_DEPLOYMENT_BLOCK,
    abi: SALE_ABI as unknown as readonly AbiEvent[],
    events: ["TokensPurchased"],
  },
  V2A: {
    key: "MEMBERSHIP_SALE_V2A",
    address: MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS,
    block: SALE_V2A_DEPLOYMENT_BLOCK,
    abi: SALE_V2_ABI as unknown as readonly AbiEvent[],
    events: ["Purchased", "Routed"],
  },
  V2B: {
    key: "MEMBERSHIP_SALE_V2",
    address: MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS,
    block: SALE_V2_DEPLOYMENT_BLOCK,
    abi: SALE_V2_ABI as unknown as readonly AbiEvent[],
    events: ["Purchased", "Routed"],
  },
  V3: {
    key: "MEMBERSHIP_SALE_V3",
    address: MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS,
    block: SALE_V3_DEPLOYMENT_BLOCK,
    abi: SALE_V3_ABI as unknown as readonly AbiEvent[],
    events: ["MembershipPurchasedV3"],
  },
};

// Which canon ABI + generation each pinned event belongs to.
const EVENT_ABI: Record<string, readonly AbiEvent[]> = {
  TokensPurchased: GEN.V1.abi,
  Purchased: GEN.V2B.abi,
  Routed: GEN.V2B.abi,
  MembershipPurchasedV3: GEN.V3.abi,
};

function paramsMatch(
  served: readonly EventParam[],
  canonInputs: readonly AbiInput[],
): boolean {
  if (served.length !== canonInputs.length) return false;
  for (let i = 0; i < served.length; i++) {
    const s = served[i]!;
    const c = canonInputs[i]!;
    if (s.name !== c.name || s.type !== c.type || s.indexed !== Boolean(c.indexed)) {
      return false;
    }
  }
  return true;
}

function main(): void {
  // 0) keccak self-test.
  check(
    "keccak: empty-string digest",
    keccak256Hex(new Uint8Array(0)) ===
      "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470",
  );

  // 1) Each pinned event def reconciles to its canon ABI event.
  for (const [name, abi] of Object.entries(EVENT_ABI)) {
    const def = SALE_EVENT_DEFS_BY_NAME[name];
    check(`def: ${name} pinned`, Boolean(def));
    const ev = canonEvent(abi, name);
    check(`canon: ${name} event present in ABI`, Boolean(ev));
    if (!def || !ev) continue;
    const sig = sigFromAbi(ev);
    check(`sig: ${name} == canon ABI signature`, def.signature === sig, `${def.signature} vs ${sig}`);
    check(`topic0: ${name} == keccak256(sig)`, def.topic0 === topic0FromSig(sig), def.topic0);
    check(`params: ${name} layout matches canon`, paramsMatch(def.params, ev.inputs ?? []));
  }

  // 1b) No speculative defs: every pinned def maps to a real canon event.
  for (const name of Object.keys(SALE_EVENT_DEFS_BY_NAME)) {
    check(`def: ${name} has a canon ABI home`, Boolean(EVENT_ABI[name]));
  }

  // 2) Cardinality + distinctness of scan targets.
  check("counts: 4 scan targets", SALE_SCAN_TARGETS.length === 4, String(SALE_SCAN_TARGETS.length));
  const distinctAddrs = new Set(SALE_SCAN_TARGETS.map((t) => t.address.toLowerCase()));
  check("counts: 4 distinct scan addresses", distinctAddrs.size === 4, String(distinctAddrs.size));

  // 3) Each scan target reconciles to canon (address, fromBlock, events, flags).
  for (const t of SALE_SCAN_TARGETS) {
    const g = GEN[t.generation];
    check(`scan: ${t.key} key matches generation`, t.key === g.key, `${t.key} vs ${g.key}`);
    check(`scan addr-shape: ${t.key} is a full address`, FULL_ADDRESS_RE.test(t.address), t.address.slice(0, 6));
    check(`scan canon: ${t.key} address matches`, eqAddr(t.address, g.address), `${t.address} vs ${g.address ?? "null"}`);
    check(
      `scan canon: ${t.key} fromBlock matches canon deploy block`,
      g.block !== null && t.fromBlock === Number(g.block),
      `${t.fromBlock} vs ${g.block === null ? "null" : String(g.block)}`,
    );
    check(`scan: ${t.key} role is 'sale'`, t.role === "sale", t.role);
    check(`scan: ${t.key} is scanOnly`, t.scanOnly === true);
    check(
      `scan: ${t.key} status matches generation`,
      t.status === (t.generation === "V3" ? "ACTIVE" : "HISTORICAL_SEALED"),
      t.status,
    );
    check(
      `scan: ${t.key} events match canon set`,
      t.events.length === g.events.length && t.events.every((e, i) => e === g.events[i]),
      t.events.join(","),
    );
    // Every scanned event exists in the generation's canon ABI + is pinned.
    for (const eventName of t.events) {
      check(`scan: ${t.key} event ${eventName} in canon ABI`, Boolean(canonEvent(g.abi, eventName)));
      check(`scan: ${t.key} event ${eventName} pinned`, Boolean(SALE_EVENT_DEFS_BY_NAME[eventName]));
    }
  }

  // 4) V2a is scan-only history, NEVER an active sale target.
  const v2a = SALE_SCAN_TARGETS.find((t) => t.generation === "V2A");
  check("v2a: present as a scan target", Boolean(v2a));
  if (v2a) {
    check("v2a: status is HISTORICAL_SEALED", v2a.status === "HISTORICAL_SEALED", v2a.status);
    check("v2a: is scanOnly", v2a.scanOnly === true);
    check(
      "v2a: absent from active SALE_TARGETS (by key)",
      !SALE_TARGETS.some((s) => s.key === v2a.key),
    );
    check(
      "v2a: address matches NO active SALE_TARGETS address",
      !SALE_TARGETS.some((s) => eqAddr(v2a.address, s.address)),
    );
  }

  // 5) V3 scan target IS the active engine (address == active SALE_TARGETS V3).
  const v3scan = SALE_SCAN_TARGETS.find((t) => t.generation === "V3");
  const v3active = SALE_TARGETS.find((s) => s.key === "MEMBERSHIP_SALE_V3");
  check("v3: scan target present", Boolean(v3scan));
  check("v3: active sale target present", Boolean(v3active));
  if (v3scan && v3active) {
    check("v3: scan status is ACTIVE", v3scan.status === "ACTIVE", v3scan.status);
    check("v3: scan address == active SALE_TARGETS V3", eqAddr(v3scan.address, v3active.address));
  }

  // 6) Address-free scan-unit summary never leaks an address.
  const safeSummary = SALE_SCAN_TARGETS.flatMap((t) =>
    t.events.map((e) => ({
      contractKey: t.key,
      generation: t.generation,
      eventName: e,
      fromBlock: t.fromBlock,
      status: t.status,
      scanOnly: t.scanOnly,
    })),
  );
  let leakThrew = false;
  try {
    assertNoAddressLeak(JSON.stringify(safeSummary));
  } catch {
    leakThrew = true;
  }
  check("safety: address-free scan summary passes leak guard", !leakThrew);

  // ── AUD-TRUTH-3 (founder catch, 2026-07-16): PUBLIC INVENTORY COMPLETENESS ──
  // The class that slipped every lens: an ABSENCE. Four sale engines exist
  // on-chain (V1 · V2a · V2b · V3, all four scanned above) — the public
  // /contracts memory listed three, and its "V2" card was really V2b. This
  // pin reconciles the STUDIO inventory against the engine truth forever:
  // one precisely-labelled card per engine, and the ambiguous bare "V2"
  // label can never return. (The api-guard-pins-studio-files precedent:
  // introduction-index.guard.)
  {
    const studioContractMemory = readFileSync(
      resolve(
        dirname(fileURLToPath(import.meta.url)),
        "..", "..", "studio", "src", "config", "contractMemory.ts",
      ),
      "utf8",
    );
    for (const label of [
      "Membership Sale (v1)",
      "Membership Sale V2a",
      "Membership Sale V2b",
      "Membership Sale V3",
    ]) {
      check(
        `public inventory: /contracts carries the "${label}" card (one card per on-chain engine)`,
        studioContractMemory.includes(`label: "${label}"`),
      );
    }
    check(
      'public inventory: the ambiguous bare "Membership Sale V2" label never returns',
      !studioContractMemory.includes('label: "Membership Sale V2"'),
    );
  }

  // ── report ──────────────────────────────────────────────────────────────────
  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed += 1;
    const tag = r.ok ? "PASS" : "FAIL";
    const detail = r.detail ? `  (${r.detail})` : "";
    process.stdout.write(`[${tag}] ${r.name}${r.ok ? "" : detail}\n`);
  }
  process.stdout.write(`\nsale-event scan reconcile: ${results.length - failed}/${results.length} passed\n`);
  if (failed > 0) process.exit(1);
}

main();
