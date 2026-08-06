/**
 * Guard: raw sale-event indexer ENGINE behaves safely (offline / hermetic).
 * -----------------------------------------------------------------------
 * Exercises the pure engine with a MOCK transport + an IN-MEMORY persistence —
 * no network, no database, no real addresses. Proves the safety invariants:
 *   - chainId FIRST: on a wrong/unknown chain, zero eth_getLogs are issued and
 *     every unit is skipped (fail-closed);
 *   - idempotent inserts: re-scanning the same range inserts each row once;
 *   - resumable cursor: a second pass starts at lastScannedBlock + 1;
 *   - decode correctness: V1 / V2 / V3 events decode to exact field values
 *     (uints as decimal strings, addresses lowercased, bytes32 full, bools);
 *   - fail-closed decode: a matching-topic0 log with a bad data shape errors the
 *     unit and does NOT persist a partial row or advance the cursor;
 *   - address-free output: the run summary passes the address-leak guard even
 *     though the underlying logs carry (fake) addresses.
 *
 * Run:  pnpm --filter @workspace/api-server run sale-index:guard
 * Exit: 0 if every check passes, 1 otherwise.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import type { RpcTransport } from "../src/lib/protocol/rpcTransport";
import { assertAddressSafeAggregate } from "../src/lib/protocol/rpcTransport";
import {
  runSaleEventScan,
  type CursorKey,
  type CursorState,
  type CursorUpsert,
  type Persistence,
  type RawEventRecord,
  type ScanUnit,
  SALE_REORG_OVERLAP,
} from "../src/lib/protocol/saleEventIndexer";
import {
  MEMBERSHIP_PURCHASED_V3_DEF,
  PURCHASED_DEF,
  ROUTED_DEF,
  TOKENS_PURCHASED_DEF,
  decodeSaleEventLog,
  type EventParamType,
  type SaleEventDef,
} from "../src/lib/protocol/saleEventDecoders";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
}

// ── ABI word encoders (build on-wire test logs; mirror the decoders) ──────────
type FieldValue = string | boolean;

function encodeWord(type: EventParamType, value: FieldValue): string {
  switch (type) {
    case "address": {
      const hex = String(value).replace(/^0x/, "").toLowerCase();
      return "0".repeat(24) + hex.padStart(40, "0");
    }
    case "bytes32":
      return String(value).replace(/^0x/, "").toLowerCase().padStart(64, "0");
    case "bool":
      return "0".repeat(63) + (value === true ? "1" : "0");
    default:
      return BigInt(String(value)).toString(16).padStart(64, "0");
  }
}

type WireLog = {
  topics: string[];
  data: string;
  blockNumber: string;
  logIndex: string;
  transactionHash: string;
  blockHash: string;
  _block: number; // helper for range filtering (not on the real wire)
};

function buildLog(
  def: SaleEventDef,
  values: Record<string, FieldValue>,
  meta: { block: number; logIndex: number; txHash: string },
): WireLog {
  const indexed = def.params.filter((p) => p.indexed);
  const dataParams = def.params.filter((p) => !p.indexed);
  const topics = [
    def.topic0,
    ...indexed.map((p) => "0x" + encodeWord(p.type, values[p.name]!)),
  ];
  const data = "0x" + dataParams.map((p) => encodeWord(p.type, values[p.name]!)).join("");
  return {
    topics,
    data,
    blockNumber: "0x" + meta.block.toString(16),
    logIndex: "0x" + meta.logIndex.toString(16),
    transactionHash: meta.txHash,
    blockHash: "0x" + "cc".repeat(32),
    _block: meta.block,
  };
}

// ── Mock transport (records calls; filters logs by topic0 + block range) ──────
type MockCall = { method: string; from?: number; to?: number; topic0?: string };
function makeMockTransport(config: {
  chainIdHex: string;
  logs: WireLog[];
}): { transport: RpcTransport; calls: MockCall[] } {
  const calls: MockCall[] = [];
  const transport: RpcTransport = async (method, params) => {
    if (method === "eth_chainId") {
      calls.push({ method });
      return config.chainIdHex;
    }
    if (method === "eth_blockNumber") {
      calls.push({ method });
      return "0x0";
    }
    if (method === "eth_getLogs") {
      const p = (params[0] ?? {}) as { fromBlock?: string; toBlock?: string; topics?: string[] };
      const from = Number.parseInt(String(p.fromBlock), 16);
      const to = Number.parseInt(String(p.toBlock), 16);
      const topic0 = p.topics?.[0];
      calls.push({ method, from, to, topic0 });
      return config.logs.filter(
        (l) => l.topics[0] === topic0 && l._block >= from && l._block <= to,
      );
    }
    throw new Error(`unexpected method ${method}`);
  };
  return { transport, calls };
}

// ── In-memory persistence ─────────────────────────────────────────────────────
function makeMemoryStore() {
  const cursors = new Map<string, CursorState & { generation: string; lastError: string | null }>();
  const rows = new Map<string, RawEventRecord>();
  const ck = (k: CursorKey) => `${k.chainId}|${k.contractKey}|${k.eventName}`;
  const persistence: Persistence = {
    async getCursor(k) {
      const c = cursors.get(ck(k));
      return c
        ? { fromBlock: c.fromBlock, lastScannedBlock: c.lastScannedBlock, status: c.status, lastError: c.lastError }
        : null;
    },
    async upsertCursor(input: CursorUpsert) {
      cursors.set(ck(input.key), {
        fromBlock: input.fromBlock,
        lastScannedBlock: input.lastScannedBlock,
        status: input.status,
        generation: input.generation,
        lastError: input.lastError,
      });
    },
    async insertEvents(recs) {
      let inserted = 0;
      for (const r of recs) {
        const rk = `${r.chainId}|${r.transactionHash}|${r.logIndex}`;
        if (!rows.has(rk)) {
          rows.set(rk, r);
          inserted += 1;
        }
      }
      return inserted;
    },
  };
  return { persistence, cursors, rows, ck };
}

const V3_TOPIC = MEMBERSHIP_PURCHASED_V3_DEF.topic0;
const FAKE_ADDR = (b: string) => "0x" + b.repeat(20);
const FAKE_TX = (b: string) => "0x" + b.repeat(32);

function v3Values(): Record<string, FieldValue> {
  return {
    receiptId: "0x" + "ab".repeat(32),
    buyer: FAKE_ADDR("11"),
    recipient: FAKE_ADDR("22"),
    memberNumber: "7",
    grossUsdc: "1000000",
    acquisitionCost: "500000",
    protocolContribution: "500000",
    vaultAmount: "1",
    liquidityAmount: "2",
    operationsAmount: "3",
    synOut: "123456789012345678",
    synPerUsdc: "1000000",
    era: "1",
    chapter: "2",
    sourceId: "0x" + "00".repeat(32),
    sourceClass: "0",
    sourceWallet: FAKE_ADDR("33"),
    commissionBps: "0",
    attributionScope: "0",
    attributionWindowEndsAt: "0",
    sourceGrossRemaining: "0",
    buyerGrossRemaining: "0",
    firstSeat: true,
    receiptVersion: "1",
  };
}

function v3Unit(fromBlock: number): ScanUnit {
  return {
    chainId: 43114,
    contractKey: "MEMBERSHIP_SALE_V3",
    generation: "V3",
    address: FAKE_ADDR("aa"),
    eventName: "MembershipPurchasedV3",
    topic0: V3_TOPIC,
    fromBlock,
  };
}

async function main(): Promise<void> {
  // 1) chainId FIRST — wrong chain => no getLogs, all skipped, no rows.
  {
    const log = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const { transport, calls } = makeMockTransport({ chainIdHex: "0x1", logs: [log] });
    const store = makeMemoryStore();
    const summary = await runSaleEventScan({
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    });
    check("fail-closed: chainOk is false on wrong chain", summary.chainOk === false);
    check("fail-closed: unit skipped on wrong chain", summary.units[0]?.status === "skipped");
    check("fail-closed: zero eth_getLogs on wrong chain", !calls.some((c) => c.method === "eth_getLogs"));
    check("fail-closed: no rows persisted on wrong chain", store.rows.size === 0);
  }

  // 2) Happy path decode + persist (correct chain).
  {
    const log = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const { transport } = makeMockTransport({ chainIdHex: "0xa86a", logs: [log] });
    const store = makeMemoryStore();
    const summary = await runSaleEventScan({
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    });
    check("scan: chainOk true on Avalanche", summary.chainOk === true);
    check("scan: 1 log seen", summary.units[0]?.logsSeen === 1, String(summary.units[0]?.logsSeen));
    check("scan: 1 row inserted", summary.units[0]?.rowsInserted === 1, String(summary.units[0]?.rowsInserted));
    check("scan: cursor advanced to head", store.cursors.get(store.ck({ chainId: 43114, contractKey: "MEMBERSHIP_SALE_V3", eventName: "MembershipPurchasedV3" }))?.lastScannedBlock === 200);

    const row = [...store.rows.values()][0];
    check("decode: row present", Boolean(row));
    if (row) {
      const f = row.decodedJson;
      check("decode: memberNumber == 7", f["memberNumber"] === "7", String(f["memberNumber"]));
      check("decode: grossUsdc == 1000000", f["grossUsdc"] === "1000000");
      check("decode: synOut exact 18-ish string", f["synOut"] === "123456789012345678");
      check("decode: firstSeat === true (bool)", f["firstSeat"] === true);
      check("decode: buyer lowercased address", f["buyer"] === FAKE_ADDR("11"));
      check("decode: sourceWallet address", f["sourceWallet"] === FAKE_ADDR("33"));
      check("decode: receiptId bytes32", f["receiptId"] === "0x" + "ab".repeat(32));
    }

    // 2b) Address-free run summary passes the leak guard.
    let leaked = false;
    try {
      assertAddressSafeAggregate(JSON.stringify(summary));
    } catch {
      leaked = true;
    }
    check("safety: run summary is address-free", !leaked);
  }

  // 3) Idempotency — re-scan the SAME range inserts each row once.
  {
    const log = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const { transport } = makeMockTransport({ chainIdHex: "0xa86a", logs: [log] });
    const store = makeMemoryStore();
    const opts = {
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    };
    const first = await runSaleEventScan(opts);
    // Clear ONLY the cursor to force a genuine re-scan of the same range.
    store.cursors.clear();
    const second = await runSaleEventScan(opts);
    check("idempotent: first run inserts 1", first.units[0]?.rowsInserted === 1);
    check("idempotent: re-scan inserts 0", second.units[0]?.rowsInserted === 0, String(second.units[0]?.rowsInserted));
    check("idempotent: still exactly 1 row", store.rows.size === 1, String(store.rows.size));
  }

  // 3a-bis) ⛔ THE REFUSAL, MADE MECHANICAL: this lane may NOT gain a head
  // margin. `nativeAvaxScan` stops 200 blocks short of the head
  // (EXPLORER_LAG_MARGIN_BLOCKS) because it reads an explorer index that trails
  // the chain. Copying that here would be a DEFECT, not consistency: since
  // 2026-08-06 the routed fold is reconciled against the sale contracts' own
  // counters read at `latest`, so an index deliberately trailing the head would
  // come up SHORT of the anchor BY DESIGN — and the four public routed figures
  // on /, /tokenomics and /whitepaper would blank every time a purchase landed
  // inside the margin. The next person to "make the lanes consistent" meets this
  // check instead of a silent homepage blackout.
  {
    const src = readFileSync(
      path.join(import.meta.dirname, "..", "src", "lib", "protocol", "saleEventIndexer.ts"),
      "utf8",
    );
    const code = src
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("\n")
      .map((l) => l.replace(/(^|[^:"'`])\/\/[^\n]*/, "$1"))
      .join("\n");
    // ⚠ THIS GUARD'S check() IS (name, ok, detail) — NOT the (cond, pass, fail)
    // shape guard-money-flow uses. My first version of this block used the other
    // convention, so a truthy STRING landed in `ok` and both pins passed
    // unconditionally: two decorative checks inside the slice whose whole subject
    // is guards that do not fire. Caught by mutating the source and watching
    // 71/71 stay green. Two conventions in one estate is the real hazard here.
    const marginHit = /\bhead\s*-\s*[A-Z_0-9]+|MARGIN\s*=|safeHead/.exec(code);
    check(
      `margin: the sale lane scans to head — no head margin, deliberately (the routed anchor reads the contracts at \`latest\`)`,
      marginHit === null,
      marginHit === null
        ? undefined
        : `a head margin appeared (${marginHit[0]}). An index that trails the head BY DESIGN comes up short of the anchor BY DESIGN, and blanks four public money figures every time a purchase lands inside the margin. Overlap yes; margin no`,
    );
    check(
      `margin: the look-back is a bounded constant (${SALE_REORG_OVERLAP} blocks ≈ ${SALE_REORG_OVERLAP}s of chain at the measured ~1 s/block)`,
      SALE_REORG_OVERLAP > 0 && SALE_REORG_OVERLAP <= 200,
      `SALE_REORG_OVERLAP = ${SALE_REORG_OVERLAP} is outside the sane band — too small misses the tip, too large re-reads forever`,
    );
  }

  // 3b) ⛔ THE DEFECT'S OWN CONDITION — a node that serves the tip EMPTY, then
  // serves it (P1-01). This is the fixture the gate insisted on: one built on a
  // healthy node passes with OR without a look-back, so it would prove nothing.
  // Avalanche has immediate finality, so this is not a reorg — it is read
  // inconsistency: `resolveEndpoints` permits several endpoints, and the next
  // call may land on a node whose log index trails its own head.
  // Cycle 1 scans [100..200] and the node answers EMPTY for the block-190 log.
  // Cycle 2 scans to 300. WITHOUT the look-back it starts at 201 and block 190
  // is never read again — the purchase is lost permanently, and the engine
  // writes buyerSourceId once with no setter.
  {
    const tipLog = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, { ...v3Values(), memberNumber: "9" }, {
      block: 190,
      logIndex: 0,
      txHash: FAKE_TX("99"),
    });
    let serveTip = false;
    const calls: { from: number; to: number }[] = [];
    const transport: RpcTransport = async (method, params) => {
      if (method === "eth_chainId") return "0xa86a";
      if (method === "eth_blockNumber") return "0x0";
      if (method === "eth_getLogs") {
        const p = (params[0] ?? {}) as { fromBlock?: string; toBlock?: string; topics?: string[] };
        const from = Number.parseInt(String(p.fromBlock), 16);
        const to = Number.parseInt(String(p.toBlock), 16);
        calls.push({ from, to });
        if (!serveTip) return [];
        return p.topics?.[0] === tipLog.topics[0] && tipLog._block >= from && tipLog._block <= to
          ? [tipLog]
          : [];
      }
      throw new Error(`unexpected method ${method}`);
    };
    const store = makeMemoryStore();
    await runSaleEventScan({
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    });
    check(
      "lagging node: cycle 1 stores nothing (the node served the tip empty)",
      store.rows.size === 0,
      String(store.rows.size),
    );
    serveTip = true; // the node's log index catches up
    await runSaleEventScan({
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 300,
      chunkSize: 50,
    });
    check(
      "lagging node: cycle 2 RECOVERS the purchase the tip had withheld",
      store.rows.size === 1,
      `${store.rows.size} row(s); cycle-2 ranges: ${calls.slice(-4).map((c) => `${c.from}-${c.to}`).join(" ")}`,
    );
    const reReadCoversTip = calls.some((c) => c.from <= 190 && c.to >= 190 && c.from > 100);
    check(
      "lagging node: the look-back window actually re-covered block 190",
      reReadCoversTip,
      "no post-cursor range re-covered the withheld block — the look-back is not reaching it",
    );
  }

  // 3c) RE-READING IS CONSEQUENCE-FREE — the precondition for doing it EVERY
  // cycle rather than exceptionally. The row insert is idempotent (3 above);
  // this asserts the two quantities the continuity spine's cycle-side
  // short-circuit keys on (`continuitySpineRefresh.ts:25-26`: current
  // sale_event_raw count + max id against the memorialized provenance) are
  // UNCHANGED by a re-read. If they moved, every cycle would trigger a full
  // derived rebuild — a re-read that is idempotent in ROWS but not in WORK.
  {
    const log = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("77"),
    });
    const { transport } = makeMockTransport({ chainIdHex: "0xa86a", logs: [log] });
    const store = makeMemoryStore();
    const opts = {
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    };
    await runSaleEventScan(opts);
    const countAfterFirst = store.rows.size;
    const keysAfterFirst = [...store.rows.keys()].sort().join("|");
    await runSaleEventScan(opts); // the look-back re-reads block 150
    check(
      "re-read: row COUNT unchanged (the spine short-circuit sees no growth)",
      store.rows.size === countAfterFirst,
      `${countAfterFirst} → ${store.rows.size}`,
    );
    check(
      "re-read: the row IDENTITY set is unchanged (no shadow row under a new key)",
      [...store.rows.keys()].sort().join("|") === keysAfterFirst,
    );
  }

  // 4) Resume — a second pass looks back over the overlap and picks up new logs.
  {
    const first = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const later = buildLog(
      MEMBERSHIP_PURCHASED_V3_DEF,
      { ...v3Values(), memberNumber: "8" },
      { block: 250, logIndex: 0, txHash: FAKE_TX("22") },
    );
    const { transport, calls } = makeMockTransport({ chainIdHex: "0xa86a", logs: [first, later] });
    const store = makeMemoryStore();
    const runOne = await runSaleEventScan({
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    });
    calls.length = 0;
    const runTwo = await runSaleEventScan({
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 300,
      chunkSize: 50,
    });
    const firstGetLogs = calls.find((c) => c.method === "eth_getLogs");
    check("resume: run 1 inserts the block-150 row", runOne.units[0]?.rowsInserted === 1);
    // ⛔ THIS CHECK USED TO DEMAND THE DEFECT (P1-01, corrected 2026-08-06).
    // It asserted `=== 201` — cursor + 1 — which is exactly the behaviour that
    // made the tip window readable ONCE, EVER. A guard that pins the defect as
    // law is the third instance of that class found this session
    // (guard-referral-memory:239-240 and its hop regex were the first two), and
    // it is why this one is now written against the CONSTANT rather than a
    // number: if the overlap changes, this follows instead of going red.
    check(
      "resume: run 2 re-reads the look-back window (cursor + 1 − SALE_REORG_OVERLAP)",
      (firstGetLogs?.from ?? -1) === 201 - SALE_REORG_OVERLAP,
      `${String(firstGetLogs?.from)} (expected ${201 - SALE_REORG_OVERLAP})`,
    );
    check("resume: run 2 inserts the block-250 row", runTwo.units[0]?.rowsInserted === 1);
    check("resume: 2 rows total", store.rows.size === 2, String(store.rows.size));
  }

  // 5) Fail-closed decode — bad data shape errors the unit, no partial row.
  {
    const good = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const bad: WireLog = { ...good, data: good.data.slice(0, good.data.length - 64) }; // drop one word
    const { transport } = makeMockTransport({ chainIdHex: "0xa86a", logs: [bad] });
    const store = makeMemoryStore();
    const summary = await runSaleEventScan({
      transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    });
    check("fail-closed decode: unit status is error", summary.units[0]?.status === "error", summary.units[0]?.error ?? "");
    check("fail-closed decode: no partial rows persisted", store.rows.size === 0);
    const cur = store.cursors.get(store.ck({ chainId: 43114, contractKey: "MEMBERSHIP_SALE_V3", eventName: "MembershipPurchasedV3" }));
    check("fail-closed decode: cursor not advanced to head", (cur?.lastScannedBlock ?? 0) < 200);
    check("fail-closed decode: cursor status error", cur?.status === "error");
  }

  // 5b) Error must NOT REGRESS a pre-existing cursor. A successful run leaves the
  //     cursor at block 200; a later run that errors mid-scan must preserve that
  //     progress (never rewind to fromBlock - 1), else every transient RPC blip on
  //     a ~2M-block backfill restarts the whole unit from the deploy block.
  {
    const good = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const laterGood = buildLog(
      MEMBERSHIP_PURCHASED_V3_DEF,
      { ...v3Values(), memberNumber: "8" },
      { block: 250, logIndex: 0, txHash: FAKE_TX("22") },
    );
    const bad: WireLog = { ...laterGood, data: laterGood.data.slice(0, laterGood.data.length - 64) };
    const store = makeMemoryStore();

    // Run 1: clean scan of 100..200 → cursor should land at 200 (complete).
    const good1 = makeMockTransport({ chainIdHex: "0xa86a", logs: [good] });
    await runSaleEventScan({
      transport: good1.transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    });
    const afterOne = store.cursors.get(store.ck({ chainId: 43114, contractKey: "MEMBERSHIP_SALE_V3", eventName: "MembershipPurchasedV3" }));
    check("no-regress: run 1 cursor at 200", afterOne?.lastScannedBlock === 200, String(afterOne?.lastScannedBlock));

    // Run 2: head 400, hits a malformed log at 250 → errors mid-scan.
    const bad2 = makeMockTransport({ chainIdHex: "0xa86a", logs: [bad] });
    const runTwo = await runSaleEventScan({
      transport: bad2.transport,
      persistence: store.persistence,
      units: [v3Unit(100)],
      headOverride: 400,
      chunkSize: 50,
    });
    const afterTwo = store.cursors.get(store.ck({ chainId: 43114, contractKey: "MEMBERSHIP_SALE_V3", eventName: "MembershipPurchasedV3" }));
    check("no-regress: run 2 unit errored", runTwo.units[0]?.status === "error", runTwo.units[0]?.error ?? "");
    check("no-regress: cursor NOT rewound below prior progress", (afterTwo?.lastScannedBlock ?? -1) >= 200, String(afterTwo?.lastScannedBlock));
    check("no-regress: cursor status error", afterTwo?.status === "error");
    check("no-regress: no partial rows persisted on error", store.rows.size === 1, String(store.rows.size));
  }

  // 6) V1 / V2 direct decode correctness (via the shared decoder).
  {
    const v1 = buildLog(
      TOKENS_PURCHASED_DEF,
      {
        buyer: FAKE_ADDR("11"),
        purchaseId: "1",
        usdcAmount: "1000000",
        synAmount: "5",
        vaultAmount: "1",
        liquidityAmount: "2",
        operationsAmount: "3",
      },
      { block: 10, logIndex: 0, txHash: FAKE_TX("aa") },
    );
    const d1 = decodeSaleEventLog(TOKENS_PURCHASED_DEF, v1);
    check("v1 decode: ok", d1.ok === true);
    if (d1.ok) {
      check("v1 decode: NO memberNumber field", !("memberNumber" in d1.fields));
      check("v1 decode: purchaseId == 1", d1.fields["purchaseId"] === "1");
      check("v1 decode: usdcAmount == 1000000", d1.fields["usdcAmount"] === "1000000");
    }

    const v2p = buildLog(
      PURCHASED_DEF,
      {
        buyer: FAKE_ADDR("11"),
        memberNumber: "3",
        era: "1",
        usdcIn: "2000000",
        synOut: "9",
        synPerUsdc: "1000000",
        firstSeat: true,
      },
      { block: 20, logIndex: 0, txHash: FAKE_TX("bb") },
    );
    const d2 = decodeSaleEventLog(PURCHASED_DEF, v2p);
    check("v2 Purchased decode: ok", d2.ok === true);
    if (d2.ok) {
      check("v2 Purchased: memberNumber == 3", d2.fields["memberNumber"] === "3");
      check("v2 Purchased: era == 1", d2.fields["era"] === "1");
      check("v2 Purchased: firstSeat === true", d2.fields["firstSeat"] === true);
    }

    const v2r = buildLog(
      ROUTED_DEF,
      {
        memberNumber: "3",
        vaultAmount: "1",
        liquidityAmount: "2",
        operationsAmount: "3",
        referralAmount: "0",
      },
      { block: 21, logIndex: 1, txHash: FAKE_TX("cc") },
    );
    const d3 = decodeSaleEventLog(ROUTED_DEF, v2r);
    check("v2 Routed decode: ok", d3.ok === true);
    if (d3.ok) {
      check("v2 Routed: memberNumber == 3", d3.fields["memberNumber"] === "3");
      check("v2 Routed: referralAmount == 0", d3.fields["referralAmount"] === "0");
    }

    // Wrong-topic0 log must fail-close.
    const mismatch = decodeSaleEventLog(PURCHASED_DEF, v1);
    check("decode: topic0 mismatch fails closed", mismatch.ok === false);
  }

  // 7) Dry-run COUNT mode (persistence absent) — good log is counted, not persisted.
  {
    const log = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const { transport } = makeMockTransport({ chainIdHex: "0xa86a", logs: [log] });
    const summary = await runSaleEventScan({
      transport,
      persistence: null, // dry-run: structural count mode
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    });
    const u = summary.units[0];
    check("count-mode: unit status ok", u?.status === "ok", u?.error ?? "");
    check("count-mode: decodedOk == 1", u?.decodedOk === 1, String(u?.decodedOk));
    check("count-mode: decodeErrors == 0", u?.decodeErrors === 0, String(u?.decodeErrors));
    check("count-mode: txCount == 1", u?.txCount === 1, String(u?.txCount));
    check(
      "count-mode: first==last==150",
      u?.firstMatchedBlock === 150 && u?.lastMatchedBlock === 150,
      `${u?.firstMatchedBlock}..${u?.lastMatchedBlock}`,
    );
    check("count-mode: chunksScanned >= 1", (u?.chunksScanned ?? 0) >= 1, String(u?.chunksScanned));
    check("count-mode: no rows persisted (dry-run)", u?.rowsInserted === 0);
    let leaked = false;
    try {
      assertAddressSafeAggregate(JSON.stringify(summary));
    } catch {
      leaked = true;
    }
    check("count-mode: summary address-free (with 64-hex tx)", !leaked);
  }

  // 8) Dry-run COUNT mode — a bad-shape log is REPORTED (not thrown): the unit
  //    stays "ok" and the decode failure surfaces as a count + class. This is the
  //    key divergence from the strict (persistence-present) fail-closed path.
  {
    const good = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 150,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const bad: WireLog = { ...good, data: good.data.slice(0, good.data.length - 64) }; // drop one word
    const { transport } = makeMockTransport({ chainIdHex: "0xa86a", logs: [bad] });
    const summary = await runSaleEventScan({
      transport,
      persistence: null,
      units: [v3Unit(100)],
      headOverride: 200,
      chunkSize: 50,
    });
    const u = summary.units[0];
    check("count-mode bad: unit status STILL ok (reported, not failed)", u?.status === "ok", u?.error ?? "");
    check("count-mode bad: decodeErrors == 1", u?.decodeErrors === 1, String(u?.decodeErrors));
    check("count-mode bad: decodedOk == 0", u?.decodedOk === 0, String(u?.decodedOk));
    check("count-mode bad: logsSeen == 1 (matched but undecodable)", u?.logsSeen === 1, String(u?.logsSeen));
    check(
      "count-mode bad: decodeErrorClasses non-empty",
      (u?.decodeErrorClasses?.length ?? 0) >= 1,
      (u?.decodeErrorClasses ?? []).join(","),
    );
  }

  // 9) Adaptive splitter — a provider that 413s wide ranges but serves narrow ones
  //    is handled by halving the window; the scan still completes and finds the log.
  {
    const log = buildLog(MEMBERSHIP_PURCHASED_V3_DEF, v3Values(), {
      block: 120,
      logIndex: 0,
      txHash: FAKE_TX("11"),
    });
    const WIDTH_LIMIT = 2500;
    let getLogsCalls = 0;
    const transport: RpcTransport = async (method, params) => {
      if (method === "eth_chainId") return "0xa86a";
      if (method === "eth_blockNumber") return "0x0";
      if (method === "eth_getLogs") {
        getLogsCalls += 1;
        const p = (params[0] ?? {}) as { fromBlock?: string; toBlock?: string; topics?: string[] };
        const from = Number.parseInt(String(p.fromBlock), 16);
        const to = Number.parseInt(String(p.toBlock), 16);
        if (to - from + 1 > WIDTH_LIMIT) throw new Error("HTTP 413 payload too large");
        return [log].filter((l) => l.topics[0] === p.topics?.[0] && l._block >= from && l._block <= to);
      }
      throw new Error(`unexpected method ${method}`);
    };
    const summary = await runSaleEventScan({
      transport,
      persistence: null,
      units: [v3Unit(100)],
      headOverride: 10099,
      chunkSize: 10000,
      minChunkSize: 500,
      maxSplitDepth: 5,
    });
    const u = summary.units[0];
    check("adaptive: unit ok after 413-driven split", u?.status === "ok", u?.error ?? "");
    check("adaptive: found the log via smaller chunks", u?.logsSeen === 1, String(u?.logsSeen));
    check("adaptive: chunksScanned reflects splits (>= 4)", (u?.chunksScanned ?? 0) >= 4, String(u?.chunksScanned));
    check("adaptive: getLogs call count bounded (<= 40)", getLogsCalls <= 40, String(getLogsCalls));
  }

  // 10) Adaptive splitter floor — a provider that 413s at EVERY width must fail
  //     closed after a BOUNDED number of calls (never retry endlessly).
  {
    let getLogsCalls = 0;
    const transport: RpcTransport = async (method) => {
      if (method === "eth_chainId") return "0xa86a";
      if (method === "eth_blockNumber") return "0x0";
      if (method === "eth_getLogs") {
        getLogsCalls += 1;
        throw new Error("HTTP 413 payload too large");
      }
      throw new Error(`unexpected method ${method}`);
    };
    const summary = await runSaleEventScan({
      transport,
      persistence: null,
      units: [v3Unit(100)],
      headOverride: 10099,
      chunkSize: 10000,
      minChunkSize: 500,
      maxSplitDepth: 5,
    });
    const u = summary.units[0];
    check("adaptive floor: unit errors (fail-closed)", u?.status === "error", u?.error ?? "");
    check("adaptive floor: bounded call count (no runaway)", getLogsCalls <= 100, String(getLogsCalls));
  }

  // ── report ──────────────────────────────────────────────────────────────────
  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed += 1;
    const tag = r.ok ? "PASS" : "FAIL";
    const detail = r.detail ? `  (${r.detail})` : "";
    process.stdout.write(`[${tag}] ${r.name}${r.ok ? "" : detail}\n`);
  }
  process.stdout.write(`\nsale-event indexer engine: ${results.length - failed}/${results.length} passed\n`);
  if (failed > 0) process.exit(1);
}

void main();
