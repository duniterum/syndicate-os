// guard-source-eligibility.ts — A REFERRAL LINK IS A BONUS, NEVER AN OBSTACLE. BLOCKING.
// ---------------------------------------------------------------------------
// THE DEFECT THIS EXISTS FOR (founder-reproduced on live prod, 2026-08-03/04):
// a member who already holds a seat opened a referral link, the quote proudly
// applied the introduction (−0.25 USDC, «A verified referral is applied to this
// quote»), he signed — and the engine REVERTED. Seven times, on his own money.
//
// MEASURED ON MAINNET (2026-08-04, block 91,957,979 — the reads that set these
// pins; do not re-derive them from any doc):
//   · buy(10 USDC, seat #5, THAT sourceId) → REVERT SourceNotEligible() (0x2abb57d6)
//   · buy(10 USDC, seat #5, bytes32(0))    → SUCCEEDS
//   · buy( 5 USDC, seat #14/#13, sourceId) → REVERT SourceAlreadyLinked()
//   · the source's own appliesToRepeatPurchases is TRUE — the earlier handoff
//     named it as the cause and was WRONG. The ENGINE decides eligibility; this
//     app must never re-derive that decision from the source's terms.
//
// THE PINS:
//   1. THE DECISION IS ONE PURE FUNCTION, and this guard EXECUTES its whole
//      truth table (a guard that only greps can pass over a gutted body).
//   2. NEVER DROP AN UNPROVEN REFERRAL. A drop requires PROOF: the buy refused
//      WITH the source and accepted WITHOUT it. Anything less keeps the source
//      (a silently dropped referral steals a real commission from a referrer).
//   3. THE PROBE IS DIFFERENTIAL — both legs, or it proves nothing.
//   4. THE PROBE RUNS BEFORE THE SIGNATURE. A check after writeContractAsync
//      protects nobody.
//   5. THE RECEIPT'S STATUS IS READ BEFORE ITS LOGS. A reverted tx carries no
//      logs; without this the buyer is told «the transaction confirmed» for a
//      purchase the engine refused — a failed purchase reported as CONFIRMED,
//      on the money path.
//   6. NO RE-DERIVATION of eligibility in the client (no sourceConfig terms, no
//      seat read deciding whether a source applies). The engine is the authority.
//   7. THE DROP SPEAKS. A purchase that went through un-attributed says so.
//   8. BOTH MEASURED REFUSALS HAVE HUMAN WORDS.
//
// NOT COVERED (stated): whether the live RPC agrees with the wallet's own node
// at signing time · the founder's on-chain source TERMS (a per-source decision
// he signs, not a code path) · the server quote's anonymous verdict, which can
// only ever mean «this link exists and is active», never «it will apply to you».
// Scans are comment-stripped (line-first, closer-preserving lookaheads).

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const MODULE = path.join(srcDir, "lib", "sourceEligibility.ts");
const CHAIN_READS = path.join(srcDir, "lib", "chainReads.ts");
const CHECKOUT = path.join(srcDir, "wallet", "JoinCheckout.tsx");

function stripComments(code: string): string {
  return code
    .replace(/^[ \t]*\/\/(?![^\n]*\*\/).*$/gm, "")
    .replace(/([^:"'])\/\/(?![^\n"']*\*\/)[^\n"']*$/gm, "$1")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

const moduleExists = existsSync(MODULE);
const mod = moduleExists ? stripComments(readFileSync(MODULE, "utf8")) : "";
const reads = stripComments(readFileSync(CHAIN_READS, "utf8"));
const checkout = stripComments(readFileSync(CHECKOUT, "utf8"));

// ── 1 + 2. THE DECISION, EXECUTED ───────────────────────────────────────────
check(
  moduleExists,
  "source-eligibility: the decision module exists",
  "source-eligibility: src/lib/sourceEligibility.ts MISSING — the decision must live in ONE pure, executable function",
);

if (moduleExists) {
  const m = (await import(pathToFileURL(MODULE).href)) as {
    decideSourceApplication?: (a: string, b: string) => string;
    SOURCE_DROPPED_NOTICE?: string;
  };
  const decide = m.decideSourceApplication;
  check(
    typeof decide === "function",
    "source-eligibility: decideSourceApplication is exported",
    "source-eligibility: sourceEligibility.ts must export decideSourceApplication(withSource, withoutSource)",
  );

  if (typeof decide === "function") {
    // THE WHOLE TABLE. `drop` appears on EXACTLY ONE row — the proven one.
    const TABLE: readonly (readonly [string, string, string])[] = [
      ["accepted", "accepted", "apply"],
      ["accepted", "refused", "apply"],
      ["accepted", "unreadable", "apply"],
      ["unreadable", "accepted", "apply"],
      ["unreadable", "refused", "apply"],
      ["unreadable", "unreadable", "apply"],
      ["refused", "accepted", "drop"],
      ["refused", "refused", "abort"],
      ["refused", "unreadable", "abort"],
    ];
    let rows = 0;
    for (const [withSource, withoutSource, expected] of TABLE) {
      let got: string;
      try {
        got = decide(withSource, withoutSource);
      } catch (e) {
        got = `THREW ${(e as Error).message}`;
      }
      check(
        got === expected,
        `source-eligibility: (${withSource}, ${withoutSource}) → ${expected}`,
        `source-eligibility: (${withSource}, ${withoutSource}) must decide "${expected}" — got "${got}"`,
      );
      rows += 1;
    }
    check(
      rows === 9,
      "source-eligibility: the full 9-row truth table ran",
      "source-eligibility: the truth table did not run in full",
    );
    // The property, not today's spelling: a drop is NEVER reachable without a
    // proven accepted no-source leg.
    const dropRows = TABLE.filter(([a, b]) => {
      try {
        return decide(a, b) === "drop";
      } catch {
        return false;
      }
    });
    check(
      dropRows.length === 1 && dropRows[0]![0] === "refused" && dropRows[0]![1] === "accepted",
      "source-eligibility: a referral is dropped ONLY on proof (refused with, accepted without)",
      "source-eligibility: some other combination decides `drop` — a referral may only be dropped when the engine PROVED the source is the obstacle",
    );
  }

  check(
    typeof m.SOURCE_DROPPED_NOTICE === "string" && m.SOURCE_DROPPED_NOTICE.length > 40,
    "source-eligibility: the drop has words for the buyer",
    "source-eligibility: SOURCE_DROPPED_NOTICE must exist — a purchase that went through un-attributed TELLS the buyer",
  );
}

// ── 3. THE PROBE IS DIFFERENTIAL, AND LIVES IN THE CHAIN-READ LAYER ─────────
check(
  /export async function simulateBuy\b/.test(reads),
  "source-eligibility: simulateBuy lives in chainReads (the client/server boundary law)",
  "source-eligibility: the buy simulation must live in src/lib/chainReads.ts — the client chain-read layer, per its own boundary law",
);
check(
  /simulateBuy\s*\(/.test(checkout) &&
    (checkout.match(/simulateBuy\s*\(/g) ?? []).length >= 2,
  "source-eligibility: the probe runs BOTH legs (with the source, and without)",
  "source-eligibility: the checkout must simulate the buy WITH the source AND WITHOUT it — one leg proves nothing",
);
check(
  /ZERO_BYTES32/.test(checkout) && /simulateBuy/.test(checkout),
  "source-eligibility: the no-source leg uses the canonical zero id",
  "source-eligibility: the second leg must use ZERO_BYTES32 — the engine's own no-source path",
);

// ── 4. THE PROBE RUNS BEFORE THE SIGNATURE ─────────────────────────────────
const iProbe = checkout.indexOf("simulateBuy(");
const iWrite = checkout.indexOf("writeContractAsync({");
const iBuyFn = checkout.indexOf("async function handleBuy");
const iWriteBuy = checkout.indexOf("functionName: \"buy\"");
check(
  iProbe > -1 && iWriteBuy > -1 && iProbe < iWriteBuy && iProbe > iBuyFn,
  "source-eligibility: the engine is asked BEFORE the buyer signs",
  "source-eligibility: the buy simulation must run INSIDE handleBuy and BEFORE the buy signature — a check after the signature protects nobody",
);

// THE TWO BRANCHES MUST ACT, not merely be computed. The named failure mode
// (2026-08-03) is a slice whose whole body can be gutted while every "is it
// mentioned" pin stays green — so the region BETWEEN the probe and the
// signature is read, and each verdict must do its one job there.
const region = iProbe > -1 && iWriteBuy > iProbe ? checkout.slice(iProbe, iWriteBuy) : "";
check(
  /decision === "drop"/.test(region) &&
    /applySourceId = ZERO_BYTES32/.test(region) &&
    /SOURCE_DROPPED_NOTICE/.test(region),
  "source-eligibility: a proven-blocked link is actually REMOVED from the signed call",
  "source-eligibility: the `drop` verdict must set applySourceId to ZERO_BYTES32 AND raise the notice before the signature — computing a verdict and signing anyway changes nothing",
);
check(
  /decision === "abort"/.test(region) && /return;/.test(region),
  "source-eligibility: an abort verdict signs NOTHING",
  "source-eligibility: the `abort` verdict must return before the signature — otherwise the buyer still pays gas for a transaction the engine already refused",
);

// ── 5. THE RECEIPT'S STATUS IS READ BEFORE ITS LOGS ─────────────────────────
// PINNED AS A PROPERTY, NOT AS TODAY'S SPELLING (the lesson of the inverted
// focus tint, 2026-08-03): the judgement itself now lives in chainReads, so
// what this file owes is that the logs it parses come from a receipt that was
// JUDGED ACCEPTED — and that the refusal branch returns before them.
const iConfirm = checkout.lastIndexOf("confirmTransaction(");
const iLogs = checkout.indexOf("logs: txReceipt.logs");
const iRefused = checkout.lastIndexOf('outcome.kind === "refused"');
check(
  iConfirm > -1 && iLogs > -1 && iConfirm < iLogs,
  "source-eligibility: the purchase receipt is CONFIRMED before its logs are parsed",
  "source-eligibility: the buy path must pass its receipt through confirmTransaction BEFORE parsing logs — a reverted tx carries none, and the buyer is then told the decode failed instead of the truth",
);
check(
  iRefused > -1 && iLogs > -1 && iRefused < iLogs,
  "source-eligibility: a refused purchase returns before any log is read",
  "source-eligibility: the buy path must branch on a `refused` outcome BEFORE parsing logs — that branch is the whole difference between «the engine refused you» and «the transaction confirmed»",
);
check(
  /const txReceipt = outcome\.receipt/.test(checkout),
  "source-eligibility: the parsed receipt IS the judged one",
  "source-eligibility: the receipt whose logs are parsed must be the one confirmTransaction judged — a second, unjudged await re-opens the defect",
);

// ── 5-bis. THE WHOLE CLASS, NOT THIS ONE INSTANCE ───────────────────────────
// The twin search that found it (2026-08-04): FIVE write surfaces awaited a
// receipt and none of them judged it — the join buy, the join approval, the
// founder's createSource and setSourceStatus, and the ladder promotion. The
// activation one went further and closed a member's queue request off a
// transaction that may have reverted. A rule that lives in five places is one
// rule waiting to disagree with itself, so it lives in ONE: every write surface
// waits through chainReads.confirmTransaction, which returns the verdict and
// cannot be used without reading it. This pin is what stops the sixth.
const WRITE_SURFACES = ["wallet", "components", "pages", "admin"] as const;
const offenders: string[] = [];
{
  const stack: string[] = [srcDir];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (/\.(ts|tsx)$/.test(entry.name) && full !== CHAIN_READS) {
        if (/waitForTransactionReceipt/.test(stripComments(readFileSync(full, "utf8")))) {
          offenders.push(path.relative(srcDir, full).replace(/\\/g, "/"));
        }
      }
    }
  }
}
check(
  offenders.length === 0,
  `source-eligibility: every write surface confirms through the ONE helper (${WRITE_SURFACES.length} surface families swept, ${offenders.length} raw receipt waits)`,
  `source-eligibility: waitForTransactionReceipt is called OUTSIDE chainReads.ts — a receipt awaited there is a receipt nobody judged: ${offenders.join(", ")}`,
);
check(
  /export async function confirmTransaction\b/.test(reads) &&
    /status !== "success"/.test(reads),
  "source-eligibility: confirmTransaction exists and judges the receipt's status",
  "source-eligibility: chainReads must export confirmTransaction, and it must judge status — a helper that only waits repeats the defect in one more place",
);

// ── 6. NO RE-DERIVATION — THE ENGINE DECIDES ────────────────────────────────
check(
  !/appliesToRepeatPurchases/.test(checkout),
  "source-eligibility: the checkout does not re-derive eligibility from the source's terms",
  "source-eligibility: JoinCheckout reads appliesToRepeatPurchases — eligibility is the ENGINE's decision (that very term is TRUE on the source that reverted); ask buy(), never re-implement _resolveSource",
);
check(
  !/memberNumberOf|knownMember/.test(checkout) || !/sourceId/.test(checkout.slice(checkout.indexOf("memberNumberOf"))),
  "source-eligibility: no seat read decides whether a source applies",
  "source-eligibility: a seat/member read must not gate the source decision — the engine's own refusal is the authority",
);

// ── 7. THE DROP SPEAKS ──────────────────────────────────────────────────────
check(
  /SOURCE_DROPPED_NOTICE/.test(checkout),
  "source-eligibility: an un-attributed purchase tells the buyer",
  "source-eligibility: the checkout must surface SOURCE_DROPPED_NOTICE when it drops the link — a silent drop is a lie of omission on the money path",
);

// ── 8. BOTH MEASURED REFUSALS HAVE HUMAN WORDS ──────────────────────────────
for (const name of ["SourceNotEligible", "SourceAlreadyLinked"] as const) {
  check(
    new RegExp(`\\["${name}",`).test(checkout),
    `source-eligibility: ${name} is translated for the buyer`,
    `source-eligibility: ${name} has no human translation in KNOWN_REVERTS — it is a MEASURED live refusal, not a hypothetical`,
  );
}

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:source-eligibility] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(`[guard:source-eligibility] PASS — ${ok.length}/${ok.length} source-eligibility pins hold.`);
