// source-status-truth.guard.ts — the served posture registry can never rot
// back into the read-only era (S4 structural cure, server side).
// ---------------------------------------------------------------------------
// The S2/S4 audits found the /api/source-status static canon frozen at
// 2026-07-03 — pre-C5, pre-backbone, pre-chronicle — serving "not wired" for
// surfaces that had been live for days. This guard pins the registry to
// TODAY'S protocol reality: the promoted postures can never silently regress,
// era vocabulary can never return to the served notes, and the canon-lock
// date can never fall behind the promotions it carries.
// Case-INSENSITIVE throughout (the S2 lesson: capital "Read-only" slipped a
// case-sensitive sweep).

import { sourceStatusResponse } from "../src/data/sourceStatus";

let failures = 0;
let passes = 0;
function check(name: string, ok: boolean, detail = ""): void {
  if (ok) {
    passes += 1;
  } else {
    failures += 1;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

const cats = sourceStatusResponse.categories;

// 1) Era vocabulary is dead in every served note/label (claim-shaped phrases).
const ERA = [
  /not wired/i,
  /none is wired/i,
  /nothing is minted/i,
  /awaiting a verified source/i,
  /not yet vendored/i,
  /read[- ]only (foundation|shell|site|protocol|era)/i,
];
for (const [key, item] of Object.entries(cats)) {
  for (const re of ERA) {
    check(
      `note[${key}] carries no era vocabulary (${re.source.slice(0, 24)}…)`,
      !re.test(item.note) && !re.test(item.label),
      item.note.slice(0, 80),
    );
  }
}

// 2) The S4 promotions are pinned — these surfaces are LIVE and can never
//    silently regress to NOT_WIRED/FUTURE without this guard going red.
const PROMOTED: Record<string, string> = {
  proof: "READ_ONLY_PROOF",
  membership: "READ_ONLY_PROOF",
  treasury: "READ_ONLY_PROOF",
  routing: "READ_ONLY_PROOF",
  chronicle: "READ_ONLY_PROOF",
  learning: "READ_ONLY_PROOF",
  indexer: "READ_ONLY_PROOF",
  archive: "READ_ONLY_PROOF",
  source: "READ_ONLY_PROOF",
  sale: "READ_ONLY_PROOF",
  buyReadiness: "LIVE_ACTION",
  // Fossil sweep (2026-07-19): receipts live (checkout ticket + /receipts
  // binder) and the operator wall + audited controls live — pinned so they
  // can never regress.
  receipt: "READ_ONLY_PROOF",
  operator: "READ_ONLY_PROOF",
};
for (const [key, posture] of Object.entries(PROMOTED)) {
  check(`posture[${key}] holds its live promotion (${posture})`, cats[key]?.posture === posture, String(cats[key]?.posture));
}

// 3) The canon-lock date can never fall behind the promotions it carries.
check(
  "asOf is at or after the S4 reconciliation (2026-07-14)",
  Date.parse(sourceStatusResponse.asOf) >= Date.parse("2026-07-14T00:00:00.000Z"),
  sourceStatusResponse.asOf,
);

// 4) Positive truth pins — the notes must STATE the live facts, not merely
//    avoid the dead ones.
check("note[proof] names the live event backbone", /event backbone/i.test(cats.proof?.note ?? ""));
check("note[chronicle] names the committed register + no silent edits", /founder/i.test(cats.chronicle?.note ?? "") && /silent edits/i.test(cats.chronicle?.note ?? ""));
check("note[archive] states artifacts are minted on-chain today", /minted on-chain/i.test(cats.archive?.note ?? ""));
check("note[routing] states the 70/20/10 figures are served live", /70\/20\/10/.test(cats.routing?.note ?? "") && /live/i.test(cats.routing?.note ?? ""));
check("note[source] states own standing + the public paid aggregate are served", /own standing/i.test(cats.source?.note ?? "") && /paid-to-referrers/i.test(cats.source?.note ?? ""));

if (failures > 0) {
  console.error(`source-status truth guard: ${failures} FAILURE(S) (${passes} passed)`);
  process.exit(1);
}
console.log(`source-status truth guard: all ${passes} checks passed.`);
