/**
 * Guard: sale-event SEMANTIC BRIDGE reconciles to vendored canon.
 * --------------------------------------------------------------
 * The served semantic bridge (`src/lib/protocol/saleEventSemantics.ts`) cannot
 * import the tsconfig-excluded canon, so it MIRRORS the canon kind/category it
 * binds each raw sale event to. This guard runs via tsx (OUTSIDE the app
 * typecheck) and therefore MAY import canon; it proves the mirror is honest and
 * that the bridge encodes exactly the accepted semantics — no second taxonomy:
 *   - every mirrored kind is a real canon ProtocolEventKind;
 *   - every mirrored category is a real canon ProtocolEventCategory;
 *   - CATEGORY_FOR_KIND[kind] === the bound category (purchase → membership-sale);
 *   - `Routed` is NOT a standalone kind (folded into purchase) and no
 *     FUNDS_ROUTED / SOURCE_ATTRIBUTED_RECEIPT kind exists in canon;
 *   - source/referral maps only to PENDING FUTURE_EVENT_NAMESPACES;
 *   - the bridge's rawEvents/contractKey/posture match SALE_SCAN_TARGETS, and
 *     every gated field is a REAL decoded ABI param (never a phantom field);
 *   - the serialized bridge leaks no address.
 *
 * Run:  pnpm --filter @workspace/api-server run sale-semantics:guard
 * Exit: 0 if every check passes, 1 otherwise.
 */

import {
  CATEGORY_FOR_KIND,
  FUTURE_EVENT_NAMESPACES,
  RECOMMENDED_SURFACES_FOR_CATEGORY,
} from "../src/canon/the-syndicate/proof/protocol-event-registry";

import {
  ROUTED_IS_STANDALONE_PUBLIC_KIND,
  SALE_EVENT_SEMANTICS,
  SALE_EVENT_SEMANTICS_BY_GENERATION,
} from "../src/lib/protocol/saleEventSemantics";
import {
  SALE_SCAN_TARGETS,
  type SaleGeneration,
} from "../src/data/protocolTargets";
import { SALE_EVENT_DEFS_BY_NAME } from "../src/lib/protocol/saleEventDecoders";
import { assertAddressSafeAggregate } from "../src/lib/protocol/rpcTransport";

// ── tiny check harness ───────────────────────────────────────────────────────
type Check = { name: string; ok: boolean; detail?: string };
const results: Check[] = [];
function check(name: string, ok: boolean, detail?: string): void {
  results.push({ name, ok, detail });
}

const CANON_KINDS = new Set(Object.keys(CATEGORY_FOR_KIND));
const CANON_CATEGORIES = new Set(Object.keys(RECOMMENDED_SURFACES_FOR_CATEGORY));
const GENERATIONS: readonly SaleGeneration[] = ["V1", "V2A", "V2B", "V3"];

function main(): void {
  // 0) Cardinality: exactly one bridge entry per generation.
  check("counts: 4 semantic entries", SALE_EVENT_SEMANTICS.length === 4, String(SALE_EVENT_SEMANTICS.length));
  for (const g of GENERATIONS) {
    check(`gen: ${g} present in bridge`, Boolean(SALE_EVENT_SEMANTICS_BY_GENERATION[g]));
  }

  // 1) Every mapping reconciles to canon (the anti-drift core).
  for (const s of SALE_EVENT_SEMANTICS) {
    check(`kind: ${s.generation} kind is a real canon kind`, CANON_KINDS.has(s.kind), s.kind);
    check(
      `category: ${s.generation} category is a real canon category`,
      CANON_CATEGORIES.has(s.category),
      s.category,
    );
    check(
      `bind: ${s.generation} CATEGORY_FOR_KIND[${s.kind}] === ${s.category}`,
      CATEGORY_FOR_KIND[s.kind as keyof typeof CATEGORY_FOR_KIND] === s.category,
      String(CATEGORY_FOR_KIND[s.kind as keyof typeof CATEGORY_FOR_KIND]),
    );
  }

  // 2) Bridge overlay is honest to the raw scan targets.
  for (const s of SALE_EVENT_SEMANTICS) {
    const t = SALE_SCAN_TARGETS.find((x) => x.generation === s.generation);
    check(`scan: ${s.generation} has a scan target`, Boolean(t));
    if (!t) continue;
    check(`scan: ${s.generation} contractKey matches`, s.contractKey === t.key, `${s.contractKey} vs ${t.key}`);
    check(
      `scan: ${s.generation} posture matches status`,
      s.posture === t.status,
      `${s.posture} vs ${t.status}`,
    );
    check(
      `scan: ${s.generation} rawEvents match scan events`,
      s.rawEvents.length === t.events.length && s.rawEvents.every((e, i) => e === t.events[i]),
      s.rawEvents.join(","),
    );
    for (const e of s.rawEvents) {
      check(`def: ${s.generation} raw event ${e} is pinned`, Boolean(SALE_EVENT_DEFS_BY_NAME[e]));
    }
  }

  // 3) Routed is folded into purchase — never a standalone/public kind.
  check("routed: not a standalone public kind (const)", ROUTED_IS_STANDALONE_PUBLIC_KIND === false);
  check("routed: no 'routed' kind in canon", !CANON_KINDS.has("routed"));
  check("routed: no 'funds-routed' kind in canon", !CANON_KINDS.has("funds-routed"));
  for (const s of SALE_EVENT_SEMANTICS) {
    if (s.rawEvents.includes("Routed")) {
      check(`routed: ${s.generation} kind is purchase`, s.kind === "purchase", s.kind);
      check(`routed: ${s.generation} declares a pairing rule`, s.pairing !== null);
    }
  }

  // 4) Source/referral has a PENDING home in canon and no live kind.
  const ns = new Map(FUTURE_EVENT_NAMESPACES.map((n) => [n.id, n.status]));
  check("source: referral-attribution is PENDING", ns.get("referral-attribution") === "PENDING");
  check("source: referral-reward is PENDING", ns.get("referral-reward") === "PENDING");
  check("source: no 'source-attributed-receipt' kind in canon", !CANON_KINDS.has("source-attributed-receipt"));

  // 5) Every gated field is a REAL decoded ABI param for its generation.
  for (const s of SALE_EVENT_SEMANTICS) {
    const paramNames = new Set<string>();
    for (const e of s.rawEvents) {
      const def = SALE_EVENT_DEFS_BY_NAME[e];
      for (const p of def?.params ?? []) paramNames.add(p.name);
    }
    for (const f of s.gatedServerOnlyFields) {
      check(`gated: ${s.generation} field '${f}' is a real ABI param`, paramNames.has(f), f);
    }
  }

  // 6) The serialized bridge leaks no address.
  let leakThrew = false;
  try {
    assertAddressSafeAggregate(JSON.stringify(SALE_EVENT_SEMANTICS));
  } catch {
    leakThrew = true;
  }
  check("safety: serialized bridge passes address-leak guard", !leakThrew);

  // ── report ──────────────────────────────────────────────────────────────────
  let failed = 0;
  for (const r of results) {
    if (!r.ok) failed += 1;
    const tag = r.ok ? "PASS" : "FAIL";
    const detail = r.detail ? `  (${r.detail})` : "";
    process.stdout.write(`[${tag}] ${r.name}${r.ok ? "" : detail}\n`);
  }
  process.stdout.write(
    `\nsale-event semantics reconcile: ${results.length - failed}/${results.length} passed\n`,
  );
  if (failed > 0) process.exit(1);
}

main();
