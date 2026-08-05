// guard-referral-memory.ts — A REFERRAL LINK MUST SURVIVE THE VISIT. BLOCKING.
// ---------------------------------------------------------------------------
// THE DEFECT THIS EXISTS FOR (founder-reproduced with a real friend and real
// money, 2026-08-05). He sent
//   https://thesyndicate.money/join?source=0x8338e9ff…cf620
// his friend paid 600 USDC, and he was paid NOTHING.
//
// MEASURED ON MAINNET the same day — every line from a command, none inferred:
//   · the friend's tx 0xf333b663…401b signed sourceId = bytes32(0), commission 0,
//     600 USDC split 420/120/60 to vault/liquidity/operations.
//   · REPLAYED at block 92,095,300 (the block before he signed):
//       buy(600 USDC, his wallet, THAT source) → ACCEPTED
//       quote(600 USDC, his wallet, THAT source).acquisitionCost = 30,000,000
//     THE ENGINE WOULD HAVE PAID 30.00 USDC.
//   · the live server agreed: /api/join/quote for that exact link returned
//     sourceValid: true, acquisitionCost 30000000.
//   · the drop path could not have fired, across the WHOLE window: with a zero
//     allowance the engine answers Error("ERC20: transfer amount exceeds
//     allowance") — not one of the four source refusals — and after his approval
//     it answers ACCEPTED. So the link was never DROPPED. It was ABSENT.
//   · cause: `?source=` was read at ONE place (JoinProtocol) and persisted
//     NOWHERE — no storage of any kind. Attribution was as durable as one tab's
//     query string. Any reload, any navigation, any wallet in-app browser, and
//     a referrer's commission was destroyed in silence.
//
// AND THE COST IS NOT THE 30 USDC. MEASURED: `buyerSourceId` is written at
// exactly ONE line of MembershipSaleV3 (479), inside a successful attributed
// buy, and NO owner function can set it. A wallet that takes its seat with no
// link can never be attached to one — buy(WITH the link) on seat #20 today
// answers SourceNotEligible(). The referrer loses that member FOREVER.
// Whole-protocol scale at the time of writing: 20 purchases, 1,250.00 USDC
// gross, 4 attributed, 1.00 USDC of commission ever paid.
//
// HIS TWO RULINGS, 2026-08-05 — the pins below are these, in code:
//   ⓐ NO EXPIRY. He asked what happens after 30 days, and he was right to: on
//     this protocol the on-chain link is FOR LIFE (measured: seats #13/#14/#17
//     carry expiresAt 0 — contract line 609 reads 0 as "never" — and a fresh
//     100 USDC repeat purchase still quotes 5.00 USDC to their introducer). So
//     the browser window never decides HOW LONG a referrer is paid; it decides
//     WHETHER HE IS ATTACHED AT ALL, once, permanently. A 30-day window would
//     manufacture permanent losses and contradict the model. The link is kept
//     until it is used.
//   ⓑ LAST TOUCH WINS. Two links before a purchase → the most recent one.
//
// THE PINS:
//   1. THE RULE IS ONE PURE FUNCTION, and this guard EXECUTES its whole truth
//      table (a guard that only greps passes over a gutted body).
//   2. LAST TOUCH: a valid arriving link always replaces a remembered one.
//   3. A MANGLED OR ABSENT ARRIVAL NEVER DESTROYS A GOOD MEMORY — that would be
//      the same silent theft in a new costume.
//   4. STORAGE IS NEVER TRUSTED: a corrupt remembered value is treated as absent
//      and can never reach the chain as a source id.
//   5. ⛔ NO EXPIRY, NO TTL, NO MAX-AGE anywhere in the module (his ruling ⓐ).
//   6. THE PAGE ACTUALLY RECALLS: JoinProtocol must resolve its effective source
//      THROUGH this module, never from the URL alone — that is the defect.
//   7. ONE HOME: no second storage key for the referral anywhere in src.
//   8. FAIL-CLOSED I/O: every storage touch is guarded (private mode throws),
//      and a throw degrades to "no memory", never to a crashed join page.
//
// NOT COVERED, stated plainly: a browser that clears its data, a purchase made
// from a different device or browser, or a wallet's in-app browser opened
// without ever loading our link — no client memory can survive those. That is
// exactly why the SECOND piece of this slice (the checkout must SAY it is about
// to sign without an introduction) is not optional.
// Scans are comment-stripped (line-first, closer-preserving lookaheads).

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const MODULE = path.join(srcDir, "lib", "referralMemory.ts");
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

// ── 1–4. THE RULE, EXECUTED ─────────────────────────────────────────────────
check(
  moduleExists,
  "referral-memory: the memory module exists",
  "referral-memory: src/lib/referralMemory.ts MISSING — the remember/recall rule must live in ONE pure, executable function",
);

let tableRows = 0;
if (moduleExists) {
  const m = (await import(pathToFileURL(MODULE).href)) as {
    nextRememberedSource?: (remembered: string | null, arriving: string | null) => string | null;
    REFERRAL_MEMORY_KEY?: string;
  };
  const next = m.nextRememberedSource;
  check(
    typeof next === "function",
    "referral-memory: nextRememberedSource is exported",
    "referral-memory: referralMemory.ts must export nextRememberedSource(remembered, arriving)",
  );

  if (typeof next === "function") {
    const A = "0x" + "a".repeat(64);
    const B = "0x" + "b".repeat(64);
    const UPPER = "0x" + "A".repeat(64); // SOURCE_ID_RE accepts both cases
    const SHORT = "0x" + "a".repeat(63);
    const NOPREFIX = "a".repeat(64);
    const JUNK = "not-a-source-id";

    // remembered, arriving, expected
    const TABLE: readonly (readonly [string | null, string | null, string | null])[] = [
      // nothing remembered — a valid arrival is taken
      [null, A, A],
      [null, null, null],
      // ⓑ LAST TOUCH: a valid arrival always replaces what was remembered
      [A, B, B],
      [B, A, A],
      [A, A, A],
      [A, UPPER, UPPER],
      // a mangled arrival NEVER destroys a good memory (pin 3)
      [A, SHORT, A],
      [A, NOPREFIX, A],
      [A, JUNK, A],
      [A, "", A],
      [A, null, A],
      // storage is never trusted (pin 4) — a corrupt memory is simply absent
      [JUNK, null, null],
      [SHORT, null, null],
      [JUNK, B, B],
      [NOPREFIX, null, null],
      ["", null, null],
    ];

    for (const [remembered, arriving, expected] of TABLE) {
      tableRows += 1;
      let got: string | null | "THREW";
      try {
        got = next(remembered, arriving);
      } catch {
        got = "THREW";
      }
      // Labels carry the LENGTH: sliced to 10 chars a valid id and a truncated
      // one read identically, and two different rows printed the same line.
      const show = (v: string | null) =>
        v === null ? "null" : v === "" ? '""' : `${v.slice(0, 8)}…[${v.length}]`;
      check(
        got === expected,
        `referral-memory: (${show(remembered)}, ${show(arriving)}) → ${show(expected)}`,
        `referral-memory: nextRememberedSource(${JSON.stringify(remembered)}, ${JSON.stringify(arriving)}) returned ${JSON.stringify(got)} — expected ${JSON.stringify(expected)}`,
      );
    }
  }

  // ── 5. NO EXPIRY (his ruling ⓐ) ───────────────────────────────────────────
  const modBody = stripComments(readFileSync(MODULE, "utf8"));
  // ⛔ PIN THE PROPERTY — "this module knows nothing about time" — NOT today's
  // spelling of an expiry. The first version listed words with \b anchors and
  // `THIRTY_DAYS_MS` sailed straight through it (`_` is a word character, so
  // there is no boundary before DAYS): an adversarial pass caught the pin GREEN
  // while a 30-day window sat in the file. A guard that only knows the spellings
  // I happened to imagine protects nothing — the same lesson as the focus-tint
  // guard that enshrined its own defect.
  const TIME_VOCAB =
    /\w*(?:expir|ttl|stale|max_?age|timeout|deadline|elapsed|duration|day|hour|week|month|year|forget_?after|valid_?until)\w*/i;
  const timeIdent = TIME_VOCAB.exec(modBody);
  check(
    timeIdent === null,
    "referral-memory: the module knows nothing about time — no expiry vocabulary of any spelling",
    `referral-memory: time vocabulary "${timeIdent?.[0] ?? ""}" appeared in referralMemory.ts — FOUNDER RULING 2026-08-05 forbids an expiry. The on-chain link is FOR LIFE (seats #13/#14/#17 carry expiresAt 0, and a fresh repeat purchase still quotes 5.00 USDC to their introducer). A browser window does not shorten a commission — it decides whether a referrer is ever attached, once, irreversibly: a seated wallet with no link answers SourceNotEligible() forever.`,
  );
  // The same window expressed as a clock read or a duration literal instead of
  // a name. Any Date at all is banned: this rule has no time input by design.
  check(
    !/\bDate\b/.test(modBody),
    "referral-memory: no clock is read anywhere in the module",
    "referral-memory: a Date reference appeared in referralMemory.ts — an expiry in disguise. See the ruling above.",
  );
  const durationLiteral =
    /\b(?:1_?000|60_?000|3_?600_?000|86_?400_?000|86_?400|604_?800|2_?592_?000|30\s*\*\s*24)\b/.exec(modBody);
  check(
    durationLiteral === null,
    "referral-memory: no duration literal in the module",
    `referral-memory: the duration literal ${durationLiteral?.[0] ?? ""} appeared in referralMemory.ts — a window with its name filed off. See the ruling above.`,
  );

  // ── 8. FAIL-CLOSED I/O ────────────────────────────────────────────────────
  const storageTouches = (modBody.match(/\b(?:localStorage|sessionStorage)\b/g) ?? []).length;
  check(
    storageTouches === 0 || /try\s*{/.test(modBody),
    "referral-memory: storage access is guarded (private mode throws)",
    "referral-memory: referralMemory.ts touches web storage without a try/catch — Safari private mode throws on write and would take the whole /join page down with it",
  );
}

// ── 6. THE PAGE ACTUALLY RECALLS ────────────────────────────────────────────
const pageExists = existsSync(PAGE);
check(pageExists, "referral-memory: the join page exists", `referral-memory: ${PAGE} MISSING`);

if (pageExists) {
  const page = stripComments(readFileSync(PAGE, "utf8"));
  check(
    /from\s+"@\/lib\/referralMemory"/.test(page),
    "referral-memory: JoinProtocol imports the memory module",
    "referral-memory: JoinProtocol.tsx does not import @/lib/referralMemory — THIS IS THE DEFECT ITSELF. Reading ?source= and nothing else is what cost a real referrer 30.00 USDC and that member forever.",
  );
  // The effective source handed to the checkout must come from the module, not
  // from a bare URL read. Pinned on the PROPERTY (the value flowing into the
  // checkout), never on today's variable name.
  // `[^;]*?` keeps the match INSIDE one statement. A `[\s\S]{0,400}?` window was
  // tried first and captured `search` from `const search = useSearch();` four
  // lines above — a pin that reads the wrong identifier is a pin that protects
  // nothing, and it was caught only because it happened to fail. Proven by
  // reverting the wiring: this version goes RED, the window version did not.
  const attachDecl = /const\s+(\w+)\s*=\s*[^;]*?resolveJoinSource\s*\(/.exec(page);
  check(
    attachDecl !== null,
    "referral-memory: the effective source is resolved through the module",
    "referral-memory: JoinProtocol.tsx must derive the source it hands to the checkout from resolveJoinSource(...) — a bare `new URLSearchParams(search).get(\"source\")` is the defect this guard exists for",
  );
  if (attachDecl !== null) {
    const name = attachDecl[1];
    check(
      new RegExp(`sourceId=\\{${name}\\}`).test(page),
      `referral-memory: the checkout is handed the resolved source (${name})`,
      `referral-memory: the value resolved through referralMemory (${name}) is not the one passed as sourceId to the quote/checkout — a remembered link that never reaches the signature is not a fix`,
    );
  }
}

// ── 9. NO SILENT ZERO AT THE SIGNATURE ──────────────────────────────────────
// The second half of the same defect. The checkout gated the signed source on
// the SERVER's `sourceValid` — an ANONYMOUS verdict, computed for the zero
// address, that cannot know this buyer. When it was anything but true the
// checkout signed bytes32(0) and said NOTHING: a referrer's commission gone,
// nobody told, no trace. That contradicts his own rulings ③ and ⑥ ("the reason
// comes from the ENGINE" · "only the chain says no") and guard-source-eligibility
// pin 6 (no re-derivation — the engine is the authority). It is also redundant:
// a source that does not exist or is not active makes buy() revert
// SourceNotEligible(), which the engine probe already catches AND explains.
// So: the signature carries the buyer's link, the ENGINE alone may remove it,
// and every removal speaks.
const CHECKOUT = path.join(srcDir, "wallet", "JoinCheckout.tsx");
if (existsSync(CHECKOUT)) {
  const checkout = stripComments(readFileSync(CHECKOUT, "utf8"));
  check(
    !/sourceValid\s*===\s*true/.test(checkout),
    "referral-memory: the signature is not gated on the server's anonymous verdict",
    "referral-memory: JoinCheckout gates the signed sourceId on the server's `sourceValid` — that branch signs bytes32(0) IN SILENCE, which is exactly how a referrer loses a member forever. The ENGINE decides (his rulings ③ and ⑥), and every removal must speak.",
  );
  // And the buyer is told, before signing, what will happen either way — the
  // silence is what made twenty purchases lose their attribution unnoticed.
  check(
    /data-testid="text-checkout-attribution"/.test(checkout),
    "referral-memory: the checkout states the attribution BEFORE the signature",
    'referral-memory: JoinCheckout must render a data-testid="text-checkout-attribution" line stating, before the signature, whether an introduction will be attached to this purchase — a buyer who expected one has no other way to notice it is missing',
  );
}

// ── 7. ONE HOME ─────────────────────────────────────────────────────────────
function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry !== "node_modules" && entry !== "dist") walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}
if (existsSync(srcDir)) {
  const offenders: string[] = [];
  for (const file of walk(srcDir)) {
    if (path.resolve(file) === path.resolve(MODULE)) continue;
    const body = stripComments(readFileSync(file, "utf8"));
    // Any other module writing a referral-shaped key into web storage.
    if (/\b(?:localStorage|sessionStorage)\s*\.\s*setItem\s*\(\s*["'`][^"'`]*(?:referr|source)/i.test(body)) {
      offenders.push(path.relative(srcDir, file));
    }
  }
  check(
    offenders.length === 0,
    "referral-memory: one home — no second referral store in src",
    `referral-memory: a second referral store exists in ${offenders.join(", ")} — one fact, one home (the twin-search law)`,
  );
}

// ── report ──────────────────────────────────────────────────────────────────
for (const line of ok) console.log(`  ✓ ${line}`);
if (errors.length > 0) {
  console.error("\nguard-referral-memory FAILED:\n");
  for (const line of errors) console.error(`  ✗ ${line}`);
  console.error(
    `\n${errors.length} violation(s). SCOPE: this guard proves the remember/recall RULE (${tableRows} executed rows) and that the join page uses it. It does NOT prove a browser keeps its storage, nor that a buyer arrives in the same browser he clicked in.\n`,
  );
  process.exit(1);
}
console.log(
  `\nguard-referral-memory: ${ok.length} checks green (${tableRows} truth-table rows EXECUTED). A referral link survives the visit; last touch wins; no expiry (founder ruling 2026-08-05).`,
);
