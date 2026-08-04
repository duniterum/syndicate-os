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
const PAGE = path.join(srcDir, "pages", "JoinProtocol.tsx");

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
const page = stripComments(readFileSync(PAGE, "utf8"));

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
    // THE WHOLE TABLE. `drop` appears on EXACTLY ONE row — the proven one —
    // and NO row may produce anything but `apply` or `drop`: the founder ruled
    // on 2026-08-04 that this checkout may never refuse to send a purchase
    // («est-ce que j'ai le droit de laisser le checkout REFUSER d'envoyer un
    // achat tout seul ?» → NON). Only the chain says no.
    const TABLE: readonly (readonly [string, string, string])[] = [
      ["accepted", "accepted", "apply"],
      ["accepted", "refused", "apply"],
      ["accepted", "unreadable", "apply"],
      ["unreadable", "accepted", "apply"],
      ["unreadable", "refused", "apply"],
      ["unreadable", "unreadable", "apply"],
      ["refused", "accepted", "drop"],
      ["refused", "refused", "apply"],
      ["refused", "unreadable", "apply"],
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
    // HIS RULING, MADE MECHANICAL: no input may ever produce a third verdict.
    const verdicts = new Set(
      TABLE.map(([a, b]) => {
        try {
          return decide(a, b);
        } catch {
          return "THREW";
        }
      }),
    );
    const illegal = [...verdicts].filter((v) => v !== "apply" && v !== "drop");
    check(
      illegal.length === 0,
      "source-eligibility: only `apply` and `drop` exist — the checkout can never refuse to send",
      `source-eligibility: the decision produced ${JSON.stringify(illegal)} — the founder ruled 2026-08-04 that this checkout may NEVER refuse to send a purchase. Only the chain says no.`,
    );
  }

  // ── THE ORDER INVARIANT, EXECUTED AGAINST A FAKE ENGINE ───────────────────
  // The defeat this closes (second review, 2026-08-04): the two simulations
  // could be SWAPPED so the fix did the exact opposite — dropping every valid
  // referral and keeping every refused one — with every pin still green,
  // because a scanner cannot see which id went into which call. The question is
  // now ONE function, and here it is run with a fake engine that records the
  // order it was asked in.
  const ask = m.askEngineAboutSource;
  check(
    typeof ask === "function",
    "source-eligibility: the whole question is ONE function the call site cannot mis-order",
    "source-eligibility: sourceEligibility.ts must export askEngineAboutSource(sourceId, probe) — two loose simulations at the call site can be swapped, and were",
  );
  if (typeof ask === "function") {
    const ZERO = "0x" + "0".repeat(64);
    const LINK = "0x" + "ab".repeat(32);
    const fake = (answers: Record<string, string>, seen: string[]) => ({
      zeroSourceId: ZERO,
      refusalNameOf: (e: unknown) => (e as { name?: string } | null)?.name ?? null,
      simulate: async (id: string) => {
        seen.push(id);
        return { verdict: answers[id] ?? "unreadable", error: { name: "SourceNotEligible" } };
      },
    });

    // ① refused WITH the link, accepted WITHOUT → drop, and the ORDER is pinned.
    const seen1: string[] = [];
    const r1 = await ask(LINK, fake({ [LINK]: "refused", [ZERO]: "accepted" }, seen1));
    check(
      seen1[0] === LINK,
      "source-eligibility: the FIRST question is always asked WITH the buyer's link",
      `source-eligibility: the first simulation used ${seen1[0]} — it must be the buyer's own link, or the whole differential is inverted`,
    );
    check(
      seen1[1] === ZERO,
      "source-eligibility: the SECOND question is always the no-link path",
      `source-eligibility: the second simulation used ${seen1[1]} — it must be the zero id`,
    );
    check(
      r1?.decision === "drop" && r1?.refusalName === "SourceNotEligible",
      "source-eligibility: a proven-blocked link drops, carrying the ENGINE's own reason",
      `source-eligibility: refused-with + accepted-without must drop with the engine's reason — got ${JSON.stringify(r1)}`,
    );

    // ② The INVERTED world must NOT drop: accepted with the link, refused without.
    const seen2: string[] = [];
    const r2 = await ask(LINK, fake({ [LINK]: "accepted", [ZERO]: "refused" }, seen2));
    check(
      r2?.decision === "apply" && seen2.length === 1,
      "source-eligibility: an accepted link is applied, and the second question is not even asked",
      `source-eligibility: an ACCEPTED link must be applied untouched — got ${JSON.stringify(r2)} after ${seen2.length} question(s)`,
    );

    // ③ Refused both ways → the purchase still goes (founder ruling, 2026-08-04).
    const seen3: string[] = [];
    const r3 = await ask(LINK, fake({ [LINK]: "refused", [ZERO]: "refused" }, seen3));
    check(
      r3?.decision === "apply" && r3?.refusalName === null,
      "source-eligibility: refused both ways still SENDS — only the chain says no",
      `source-eligibility: refused-both-ways must apply and name no reason — got ${JSON.stringify(r3)}`,
    );

    // ④ An unreadable second leg proves nothing → never a drop.
    const seen4: string[] = [];
    const r4 = await ask(LINK, fake({ [LINK]: "refused", [ZERO]: "unreadable" }, seen4));
    check(
      r4?.decision === "apply",
      "source-eligibility: an unreadable no-link answer never strips a referral",
      `source-eligibility: refused-with + unreadable-without must apply — got ${JSON.stringify(r4)}`,
    );
  }

  // THE REASON COMES FROM THE ENGINE, NEVER FROM US. The first version of this
  // notice invented a cause and the chain refuted it for the very wallet the
  // fix was built from. So the notice is a FUNCTION of the engine's own error
  // name, and its unknown-name branch must not name a cause at all.
  const notice = m.droppedSourceNotice;
  check(
    typeof notice === "function",
    "source-eligibility: the drop's words are a function of the engine's own reason",
    "source-eligibility: sourceEligibility.ts must export droppedSourceNotice(refusalName, when) — a constant sentence cannot carry the engine's reason and is how a cause gets invented",
  );
  if (typeof notice === "function") {
    const known = notice("SourceAlreadyLinked", "after");
    const unknown = notice(null, "after");
    const before = notice(null, "before");
    check(
      known !== unknown && known.length > 40,
      "source-eligibility: a decoded refusal changes the sentence",
      "source-eligibility: droppedSourceNotice ignores the engine's reason — then it is a constant with extra steps",
    );
    check(
      !/already settled|already recorded|first purchase|once per wallet/i.test(unknown),
      "source-eligibility: an UNDECODED refusal invents no cause",
      "source-eligibility: the unknown-reason sentence asserts a cause. That is the exact defect caught in review: the chain refuted it for seat #5. Say only that the engine would not accept it.",
    );
    check(
      before !== known && before.length > 40 && unknown.length > 40,
      "source-eligibility: the before-signature and after-receipt wordings both exist here",
      "source-eligibility: both wordings must live in this module — assembling one from the other by string surgery at the call site is how they drift",
    );
  }
}

// ── 3. THE PROBE IS DIFFERENTIAL, AND LIVES IN THE CHAIN-READ LAYER ─────────
check(
  /export async function simulateBuy\b/.test(reads),
  "source-eligibility: simulateBuy lives in chainReads (the client/server boundary law)",
  "source-eligibility: the buy simulation must live in src/lib/chainReads.ts — the client chain-read layer, per its own boundary law",
);
// THE CALL SITE MAY NOT BUILD ITS OWN DIFFERENTIAL (hardening, 2026-08-04, his
// answer ③). Two loose simulations were swappable; one entry point is not.
check(
  !/simulateBuy\s*\(/.test(checkout),
  "source-eligibility: the checkout never assembles the two legs itself",
  "source-eligibility: JoinCheckout calls simulateBuy directly — it must go through askEngineAboutSource, the one entry point whose argument ORDER is executed by this guard. A hand-rolled differential can be inverted, and was.",
);
check(
  (checkout.match(/askEngineAboutSource\s*\(/g) ?? []).length >= 2 &&
    /makeEngineProbe\s*\(/.test(checkout),
  "source-eligibility: both drop paths ask the same bound question",
  "source-eligibility: both the pre-signature check and the click-time check must call askEngineAboutSource with a bound probe",
);

// ── 4. THE PROBE RUNS BEFORE THE SIGNATURE ─────────────────────────────────
// THE PROBE INSIDE handleBuy — not the advisory one that runs earlier, on
// mount. Searching from the start of handleBuy is what keeps the region below
// free of the ordinary pre-flight validations (allowance, fresh quote, price
// floor), which legitimately refuse to send and always have: the founder's
// ruling is about refusing AFTER asking the engine about the introduction.
const iBuyFn = checkout.indexOf("async function handleBuy");
const iWriteBuy = checkout.indexOf("functionName: \"buy\"");
const iProbe = iBuyFn > -1 ? checkout.indexOf("askEngineAboutSource(", iBuyFn) : -1;
check(
  iProbe > -1 && iWriteBuy > -1 && iProbe < iWriteBuy && iProbe > iBuyFn,
  "source-eligibility: the engine is asked BEFORE the buyer signs",
  "source-eligibility: the buy simulation must run INSIDE handleBuy and BEFORE the buy signature — a check after the signature protects nobody",
);

// THE VERDICT MUST ACT, not merely be computed. The named failure mode
// (2026-08-03) is a slice whose whole body can be gutted while every "is it
// mentioned" pin stays green — so the region BETWEEN the probe and the
// signature is read, and the verdict must do its one job there.
const region = iProbe > -1 && iWriteBuy > iProbe ? checkout.slice(iProbe, iWriteBuy) : "";
check(
  /=== "drop"/.test(region) &&
    /applySourceId = ZERO_BYTES32/.test(region) &&
    /droppedSourceNotice\(/.test(region),
  "source-eligibility: a proven-blocked link is actually REMOVED from the signed call",
  "source-eligibility: the `drop` verdict must set applySourceId to ZERO_BYTES32 AND raise the engine's own notice before the signature — computing a verdict and signing anyway changes nothing",
);
// BOTH DROP PATHS TELL THE PAGE (second-review blocking finding: the click-time
// drop was silent, so the breakdown kept a referrer line above a receipt saying
// the introduction was not attached).
check(
  (checkout.match(/onSourceUnusable\?\.\(/g) ?? []).length >= 2,
  "source-eligibility: BOTH drop paths tell the page",
  "source-eligibility: every path that drops the link must call onSourceUnusable — a silent drop leaves «paid to your referrer» on screen above a receipt that contradicts it",
);
// ⛔ NOTHING MAY AWAIT BETWEEN RECORDING THE REFUSAL AND TELLING THE PAGE
// (third review, 2026-08-04). `sourceDrop` is in the probe effect's OWN
// dependency list, so setting it re-runs the effect, whose cleanup flips the
// cancelled flag — and an await placed between the two lines returned into that
// flag, so the page was NEVER told. Measured: the read took 102–193 ms, the
// teardown under 1 ms. It was a certainty, not a race, and it silently
// re-opened the contradiction the commit before it had closed. Presence of the
// call is not enough; its REACHABILITY is the property.
{
  const iSet = checkout.indexOf("setSourceDrop({");
  const iTell = iSet > -1 ? checkout.indexOf("onSourceUnusable?.(", iSet) : -1;
  const between = iSet > -1 && iTell > iSet ? checkout.slice(iSet, iTell) : "MISSING";
  check(
    iSet > -1 && iTell > iSet && !/\bawait\b/.test(between),
    "source-eligibility: the refusal and the page notice land back to back, with nothing awaited between",
    "source-eligibility: an `await` sits between setSourceDrop(...) and onSourceUnusable(...) — setting that state re-runs the effect and cancels the continuation, so the page is never told and the money breakdown keeps a referrer line the receipt contradicts",
  );
}

// A NEW AMOUNT IS A NEW QUESTION — both sides must forget the old verdict, or
// the company's figure freezes at the amount it was read for (third review).
check(
  /setSourceDrop\(null\)/.test(checkout),
  "source-eligibility: the checkout forgets its verdict when the amount changes",
  "source-eligibility: JoinCheckout must clear sourceDrop when the amount changes — otherwise the engine is never re-asked and the page keeps figures read for a different amount",
);
check(
  /setTrueSplit\(null\)/.test(page) && /setSourceUnusable\(false\)/.test(page),
  "source-eligibility: the page forgets the captured split when the amount changes",
  "source-eligibility: JoinProtocol must clear sourceUnusable AND trueSplit when the amount changes — a split captured at $10 rendered above a $1,000 price is a wrong company figure that never self-corrects",
);
// AND NO ENGINE FIGURE IS EVER SHOWN WHILE ITS OWN ANSWER IS IN FLIGHT. Holding
// the previous answer is what keeps the checkout mounted; showing its FIGURES is
// a 100x over-promise when the amount just changed (measured: $41 rendered above
// 3,700 SYN, which belongs to $37).
check(
  /isPlaceholderData \?/.test(page) && /text-quote-refreshing/.test(page),
  "source-eligibility: held-over engine figures are replaced by an honest reading line",
  "source-eligibility: while the quote is placeholder data, the engine-derived figures must be replaced by a reading line — the price updates instantly from the button while every engine figure lags it",
);

// AND THEY HAND UP THE ENGINE'S OWN FIGURES, NOT THE ANONYMOUS ONES (founder
// answer ④): an introduction already recorded for a wallet is still paid on a
// no-link purchase, so a split claiming otherwise misdescribes the company's money.
check(
  /readEngineQuoteForBuyer\s*\(/.test(checkout) &&
    /export async function readEngineQuoteForBuyer\b/.test(reads),
  "source-eligibility: a dropped link reports the ENGINE's true split for this buyer",
  "source-eligibility: after a drop the page must be given readEngineQuoteForBuyer's figures — the served quote is anonymous and would claim nobody is paid when the engine still pays the buyer's recorded introduction",
);

// THE ARGUMENTS ACTUALLY SIGNED (review defeat #1, 2026-08-04): the region
// above STOPS at `functionName`, so on its own it could not see the args list
// — the whole drop could be computed and then the raw sourceId signed anyway,
// with every pin green. So the signed args are read directly.
const iArgs = checkout.indexOf("args: [", iWriteBuy);
const argsBlock = iArgs > -1 ? checkout.slice(iArgs, iArgs + 400) : "";
check(
  /\bapplySourceId\b/.test(argsBlock),
  "source-eligibility: the buy SIGNS the decided id, not the raw one",
  "source-eligibility: the buy's args must pass `applySourceId` — the variable the decision writes. Signing anything else makes the whole probe decorative",
);
check(
  !/\bsourceId\b\s*(as|,|\))/.test(argsBlock.replace(/applySourceId/g, "")),
  "source-eligibility: the raw link never reaches the signature directly",
  "source-eligibility: the buy's args reference the raw `sourceId` — the decided `applySourceId` is the only value that may be signed",
);

// HIS RULING, AT THE CALL SITE (2026-08-04): between asking the engine and
// signing, this code may change the ARGUMENTS. It may not decide not to send.
check(
  !/setError\([\s\S]{0,400}?\n\s*return;/.test(region),
  "source-eligibility: the checkout never refuses to send a purchase",
  "source-eligibility: a `setError(...) … return;` sits between the probe and the signature — that is the checkout refusing to send a purchase on its own, which the founder ruled out on 2026-08-04. Only the chain says no.",
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
// The twin search that found it (2026-08-04). RECOUNTED FROM ITS OWN LIST
// after review: SIX receipt reads, not five — the count first written here and
// in three documents dropped the wallet-revoke surface, which this same commit
// repaired. The real command and its real output:
//   $ git grep -n "waitForTransactionReceipt" 32cd85a -- 'artifacts/studio/src'
//     wallet/JoinCheckout.tsx:382         (the join approval)
//     wallet/JoinCheckout.tsx:448,450     (the join purchase)
//     wallet/MemberWalletPanel.tsx:216    (revoke approval)
//     wallet/ProposeSourceCreate.tsx:350  (createSource)
//     wallet/ProposeSourceCreate.tsx:407  (setSourceStatus)
//     wallet/ProposeSourcePromotion.tsx:227 (updateSourceTerms)
// SIX reads across FOUR files, and NONE judged the receipt's status. The
// activation one went further and closed a member's queue request off a
// transaction that may have reverted. A rule that lives in six places is one
// rule waiting to disagree with itself, so it lives in ONE: every write surface
// waits through chainReads.confirmTransaction, which returns the verdict and
// cannot be used without reading it. This pin is what stops the seventh.
const offenders: string[] = [];
let sweptFiles = 0;
{
  const stack: string[] = [srcDir];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (/\.(ts|tsx)$/.test(entry.name) && full !== CHAIN_READS) {
        sweptFiles += 1;
        if (/waitForTransactionReceipt/.test(stripComments(readFileSync(full, "utf8")))) {
          offenders.push(path.relative(srcDir, full).replace(/\\/g, "/"));
        }
      }
    }
  }
}
check(
  offenders.length === 0,
  `source-eligibility: every write surface confirms through the ONE helper (${sweptFiles} files swept, ${offenders.length} raw receipt waits)`,
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
// REWRITTEN AFTER REVIEW (defeat #3, 2026-08-04): the previous spelling read
// `checkout.slice(checkout.indexOf("memberNumberOf"))`, and indexOf returns -1
// when the name is absent — so slice(-1) looked at ONE character and the pin
// passed for free, including when `knownMember` alone was used. It is the
// REGION that matters, and the region is now read directly.
// CASE-INSENSITIVE ON PURPOSE — the second hole in this very pin, found by
// attacking it (2026-08-04): the wrapper is `readMemberNumberOf`, which does
// NOT contain the lowercase `memberNumberOf` the contract function is named
// after. A pin that only knows one capitalisation of a concept is a pin that
// waves the concept through under any other name.
const seatReads = ["memberNumberOf", "knownMember", "sourceRecord", "sourceConfig", "seatHeld"];
const seatInRegion = seatReads.filter((n) =>
  new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(region),
);
check(
  seatInRegion.length === 0,
  "source-eligibility: no seat or terms read decides whether a source applies",
  `source-eligibility: ${seatInRegion.join(", ")} sits between the probe and the signature — a seat or terms read must not gate the source decision. The engine's own refusal is the authority (that source's appliesToRepeatPurchases is TRUE and it was refused anyway)`,
);

// ── 7. THE DROP SPEAKS, WITH THE ENGINE'S OWN REASON ────────────────────────
check(
  /droppedSourceNotice\(/.test(checkout),
  "source-eligibility: an un-attributed purchase tells the buyer",
  "source-eligibility: the checkout must surface droppedSourceNotice when it drops the link — a silent drop is a lie of omission on the money path",
);
// PINNED AS THE PROPERTY, NOT THE OLD SPELLING: the decoding moved inside the
// bound probe, so what this file owes is that every notice argument comes from
// the ENGINE's answer and never from a hand-written cause.
check(
  !/droppedSourceNotice\(\s*["'`]/.test(checkout) &&
    /droppedSourceNotice\((answer\.refusalName|sourceDrop\.reason)/.test(checkout),
  "source-eligibility: the buyer is given the ENGINE's reason, not ours",
  "source-eligibility: every droppedSourceNotice call must be fed the engine's own decoded refusal (answer.refusalName / sourceDrop.reason) — a literal cause is exactly the defect review caught: the chain refuted it for the very wallet this fix was built from",
);
check(
  /refusalNameOf:\s*revertName/.test(reads),
  "source-eligibility: the probe decodes the refusal with the engine's own error name",
  "source-eligibility: makeEngineProbe must wire refusalNameOf to revertName — otherwise the reason handed to the buyer is not the engine's",
);

// ── 8. BOTH MEASURED REFUSALS HAVE HUMAN WORDS, IN BOTH PLACES ──────────────
// These two are the only refusal names SELECTOR-VERIFIED against live mainnet
// reverts. They must be translated where an error is shown (KNOWN_REVERTS) AND
// where a drop is explained (sourceEligibility's own map).
for (const name of ["SourceNotEligible", "SourceAlreadyLinked"] as const) {
  check(
    new RegExp(`\\["${name}",`).test(checkout),
    `source-eligibility: ${name} is translated where an error is shown`,
    `source-eligibility: ${name} has no human translation in KNOWN_REVERTS — it is a MEASURED live refusal, not a hypothetical`,
  );
  check(
    new RegExp(`${name}:`).test(mod),
    `source-eligibility: ${name} is translated where a drop is explained`,
    `source-eligibility: ${name} has no human wording in sourceEligibility's refusal map — the buyer would get the generic sentence for a refusal we have actually measured`,
  );
}

// ── verdict ─────────────────────────────────────────────────────────────────
if (errors.length > 0) {
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error(`[guard:source-eligibility] ${errors.length} FAILURE(S) (${ok.length} pins green).`);
  process.exit(1);
}
console.log(
  `[guard:source-eligibility] PASS — ${ok.length} pins hold (9-row truth table EXECUTED; ${sweptFiles} files swept for raw receipt waits).`,
);
console.log(
  "[guard:source-eligibility] NOT CHECKED, and no green run here claims otherwise: nothing is RENDERED (wrapping, both themes, mobile — the preview gate's job) · no wallet signs anything · whether the wallet's own node agrees with this app's RPC at the instant of signing · the 12 refusal names that are NAME-DERIVED (the engine's source is not in this repo; only SourceNotEligible and SourceAlreadyLinked are selector-verified) · the SERVER quote route (api-side guards own it).",
);
