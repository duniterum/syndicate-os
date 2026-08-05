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
// The arrival is captured app-wide (founder ruling ③, 2026-08-05): a link may
// land on ANY route, and only /join used to read it. Both callers are searched
// for the resolver so the guard follows the app instead of naming a target.
const APP = path.join(srcDir, "App.tsx");

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
    resolveJoinSource?: (urlSource: string | null) => string | null;
    REFERRAL_MEMORY_KEY?: string;
  };
  const next = m.nextRememberedSource;

  // ── H1 + H2: THE WRAPPER IS EXECUTED, NOT ONLY THE PURE RULE ──────────────
  // An adversarial pass (2026-08-05) gutted `resolveJoinSource` to
  // `nextRememberedSource(null, url)` — the memory is read and thrown away, the
  // ENTIRE defect restored — and this guard stayed GREEN on all 29 checks,
  // because it only ever executed the pure rule. A guard that tests the helper
  // and not the behaviour is decoration. So the wrapper itself now runs against
  // a fake store, and the row that H1 killed is the second one.
  // ⛔ THE ENTRY POINT IS DISCOVERED FROM THE APP, NEVER NAMED HERE.
  // Round 1 executed only the pure rule; round 2 executed a WRAPPER the app had
  // stopped calling. Both times the whole 600-USDC defect could be restored with
  // every check green — the second time by gutting `resolveJoinIntroduction`
  // while `resolveJoinSource` stayed correct. A guard that names its own target
  // measures whatever it was told to, not what ships. So the name is read out of
  // the code that CALLS it, and if the app renames or re-routes its resolver
  // this guard follows or goes red.
  const callers = [PAGE, APP].filter((f) => existsSync(f));
  const entryNames = new Set<string>();
  for (const f of callers) {
    for (const hit of stripComments(readFileSync(f, "utf8")).matchAll(/\bresolveJoin(\w+)\s*\(/g)) {
      entryNames.add(`resolveJoin${hit[1]}`);
    }
  }
  check(
    entryNames.size > 0,
    `referral-memory: the app's own resolver is discoverable (${[...entryNames].join(", ")})`,
    "referral-memory: no resolveJoin*() call found in JoinProtocol.tsx or App.tsx — the arrival is not resolved through the ONE module, which IS the defect this guard exists for",
  );

  const A = "0x" + "a".repeat(64);
  const B = "0x" + "b".repeat(64);
  const ZERO32 = "0x" + "0".repeat(64);
  /** A row that deliberately does not assert the stored residue. */
  const DONT_CARE = " dont-care";
  const key = m.REFERRAL_MEMORY_KEY ?? "syndicate.join.source";

  for (const entryName of entryNames) {
    const entry = (m as Record<string, unknown>)[entryName];
    check(
      typeof entry === "function",
      `referral-memory: ${entryName} is exported and callable`,
      `referral-memory: the app calls ${entryName}() but referralMemory.ts does not export it`,
    );
    if (typeof entry !== "function") continue;
    const call = entry as (a: string | null, b?: string | null) => unknown;

    const store = new Map<string, string>();
    let throwOnWrite = false;
    const fakeWindow: Record<string, unknown> = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          if (throwOnWrite) throw new Error("QuotaExceeded / private mode");
          store.set(k, v);
        },
      },
    };
    fakeWindow.top = fakeWindow;
    fakeWindow.self = fakeWindow;
    const g = globalThis as { window?: unknown };
    const hadWindow = "window" in g;
    const previous = g.window;
    g.window = fakeWindow;

    /** The SOURCE the store holds, whatever shape it is serialized in. */
    const storedSource = (): string | null => {
      const raw = store.get(key) ?? null;
      if (raw === null) return null;
      if (!raw.startsWith("{")) return raw;
      try {
        return (JSON.parse(raw) as { s?: string }).s ?? null;
      } catch {
        return null;
      }
    };
    /** The channel TAG the store holds — the half round 2 left unexecuted. */
    const storedVia = (): string | null => {
      const raw = store.get(key) ?? null;
      if (raw === null || !raw.startsWith("{")) return null;
      try {
        return (JSON.parse(raw) as { v?: string | null }).v ?? null;
      } catch {
        return null;
      }
    };
    const sourceOf = (r: unknown): string | null =>
      typeof r === "string" ? r : r && typeof r === "object" ? ((r as { sourceId?: string }).sourceId ?? null) : null;

    // seed (raw stored value or null) · arriving source · arriving via
    //   → the source it must ANSWER · the source the store must HOLD · the tag it must HOLD
    type Row = readonly [
      string | null, string | null, string | null,
      string | null, string | null, string | null,
    ];
    const ROWS: readonly Row[] = [
      // the arrival is taken AND persisted
      [null, A, null, A, A, null],
      // ⛔ THE ROW EVERY GUTTING KILLS: nothing in the URL → the MEMORY answers
      [JSON.stringify({ s: A, v: null }), null, null, A, A, null],
      [A, null, null, A, A, null], // the legacy bare-string value still recalls
      // LAST TOUCH — in the answer and in the store
      [JSON.stringify({ s: A, v: "twitter" }), B, null, B, B, null],
      // ⛔ THE CHANNEL HALF, EXECUTED: a tag rides in with its link…
      [null, A, "twitter", A, A, "twitter"],
      // …and a NEWER link with no tag CLEARS it — never inherits
      [JSON.stringify({ s: A, v: "twitter" }), B, null, B, B, null],
      // …and an off-law tag is dropped, not stored
      [null, A, "NOT A TAG!!", A, A, null],
      // a mangled arrival never destroys a good memory, tag included
      [JSON.stringify({ s: A, v: "print" }), "garbage", "twitter", A, A, "print"],
      [JSON.stringify({ s: A, v: "print" }), null, null, A, A, "print"],
      // ⛔ bytes32(0) is the ABSENCE of an introduction — never wins, never stored
      [JSON.stringify({ s: A, v: null }), ZERO32, null, A, A, null],
      // POISONED / ZERO STORE — a user or an extension can edit it. THE PROPERTY
      // IS THAT IT IS NEVER ANSWERED, so it can never reach buy(). Whether the
      // junk is also scrubbed from storage is NOT asserted (DONT_CARE): it is
      // never believed and the next real arrival overwrites it, and pinning the
      // residue would pin an implementation detail instead of the rule.
      [JSON.stringify({ s: ZERO32, v: null }), null, null, null, DONT_CARE, DONT_CARE],
      [ZERO32, null, null, null, DONT_CARE, DONT_CARE],
      ["not-json-at-all", null, null, null, DONT_CARE, DONT_CARE],
      ['{"s":"garbage","v":"twitter"}', null, null, null, DONT_CARE, DONT_CARE],
      ['{"s":123}', null, null, null, DONT_CARE, DONT_CARE],
      ['{"__proto__":{"s":"' + A + '"}}', null, null, null, DONT_CARE, DONT_CARE],
      ["{", null, null, null, DONT_CARE, DONT_CARE],
      // …and a poisoned store still yields to a real arrival
      ["not-json-at-all", B, "blog", B, B, "blog"],
    ];

    try {
      for (const [seed, src, via, wantAnswer, wantStored, wantVia] of ROWS) {
        tableRows += 1;
        store.clear();
        if (seed !== null) store.set(key, seed);
        let raw: unknown = "THREW";
        try {
          raw = call(src, via);
        } catch {
          raw = "THREW";
        }
        const answer = raw === "THREW" ? "THREW" : sourceOf(raw);
        const heldSource = storedSource();
        const heldVia = storedVia();
        // The tag is only asserted for an entry point that takes one.
        const viaOk = wantVia === DONT_CARE || call.length < 2 || heldVia === wantVia;
        const storeOk = wantStored === DONT_CARE || heldSource === wantStored;
        check(
          answer === wantAnswer && storeOk && viaOk,
          `referral-memory: ${entryName}(${src === null ? "null" : src.slice(0, 6) + "…"}${call.length > 1 ? `, ${JSON.stringify(via)}` : ""}) on ${seed === null ? "empty" : "seeded"} store → ${wantAnswer === null ? "null" : wantAnswer.slice(0, 6) + "…"}`,
          `referral-memory: ${entryName}(${JSON.stringify(src)}, ${JSON.stringify(via)}) with the store seeded ${JSON.stringify(seed)} answered ${JSON.stringify(answer)} and left {source: ${JSON.stringify(heldSource)}, via: ${JSON.stringify(heldVia)}} — expected ${JSON.stringify(wantAnswer)} / ${JSON.stringify(wantStored)} / ${JSON.stringify(wantVia)}. A failing recall row means the memory is dead and the original defect is back.`,
        );
      }

      // ── THE PURE RULE, ASKED DIRECTLY WITH A POISONED MEMORY ───────────────
      // The wrapper validates before it hands anything over, so gutting the pure
      // rule's own check changed no wrapper row and the guard stayed green. But
      // the rule is EXPORTED — any future caller can hand it a value straight
      // out of storage. The rule must defend itself, and that is asserted here
      // rather than assumed from its only current caller.
      const pure = (m as Record<string, unknown>)[
        entryName === "resolveJoinIntroduction" ? "nextRememberedIntroduction" : "nextRememberedSource"
      ];
      if (typeof pure === "function") {
        const askPure = pure as (r: unknown, s: string | null, v?: string | null) => unknown;
        const POISON: readonly (readonly [unknown, string])[] = [
          [{ sourceId: "garbage", via: "twitter" }, "a malformed remembered source"],
          [{ sourceId: ZERO32, via: null }, "bytes32(0) as the remembered source"],
          [{ sourceId: "", via: null }, "an empty remembered source"],
          [{ via: "twitter" }, "a remembered value with no source at all"],
        ];
        for (const [poisoned, label] of POISON) {
          tableRows += 1;
          let out: unknown = "THREW";
          try {
            out = askPure(poisoned, null, null);
          } catch {
            out = "THREW";
          }
          check(
            sourceOf(out) === null,
            `referral-memory: the rule refuses ${label}`,
            `referral-memory: handed ${label} directly, the rule answered ${JSON.stringify(sourceOf(out))} instead of null — a value straight out of storage would reach buy() as a source id`,
          );
        }
      }

      // ── FRAMED: it must not WRITE, and must not OVERWRITE ──────────────────
      // MEASURED on prod 2026-08-05: /join serves no X-Frame-Options and no CSP
      // frame-ancestors, so any site can hide <iframe src="…?source=THEIRS">.
      // This module writes with no click and no wallet, and the engine writes
      // buyerSourceId once with no setter — so a framed write costs the honest
      // referrer that member for life. Round 2 defeated the old pin by refusing
      // only when the store was EMPTY; the property is that a framed page
      // changes nothing.
      store.clear();
      store.set(key, JSON.stringify({ s: B, v: "print" }));
      fakeWindow.top = { notUs: true };
      try {
        call(A, "twitter");
      } catch {
        /* a throw is also "did not overwrite" */
      }
      check(
        storedSource() === B && storedVia() === "print",
        `referral-memory: ${entryName} — a framed page can neither write nor OVERWRITE the memory`,
        `referral-memory: while window.top !== window.self, ${entryName} left {source: ${JSON.stringify(storedSource())}, via: ${JSON.stringify(storedVia())}} instead of B/print — ANY website can then overwrite a visitor's real introduction with its own, permanently and with no click`,
      );
      fakeWindow.top = fakeWindow;

      // ── A THROWING STORE NEVER TAKES THE PAGE DOWN ─────────────────────────
      store.clear();
      throwOnWrite = true;
      let survived = true;
      try {
        call(A, "twitter");
      } catch {
        survived = false;
      }
      throwOnWrite = false;
      check(
        survived,
        `referral-memory: ${entryName} survives a storage that throws (Safari private mode)`,
        `referral-memory: ${entryName} threw when the store refused a write — Safari private mode and storage-disabled wallet browsers would take the whole join page down for a convenience feature`,
      );

      // ── NO CLOCK: the same inputs answer the same, whenever ────────────────
      // Round 2 smuggled a 30-day window in as `performance.timeOrigin +
      // performance.now()`, defeating a vocabulary scan. The PROPERTY is that
      // this rule has no time input at all, so moving every clock forty days
      // forward may not change a single answer.
      store.clear();
      store.set(key, JSON.stringify({ s: A, v: "print" }));
      const beforeClock = sourceOf(call(null, null));
      const realNow = performance.now.bind(performance);
      const FORTY_DAYS_MS = 40 * 24 * 60 * 60 * 1000;
      (performance as { now: () => number }).now = () => realNow() + FORTY_DAYS_MS;
      const afterClock = sourceOf(call(null, null));
      (performance as { now: () => number }).now = realNow;
      check(
        beforeClock === A && afterClock === A,
        `referral-memory: ${entryName} answers the same after forty days (no expiry, his ruling ⓐ)`,
        `referral-memory: moving the clock forty days forward changed ${entryName}'s answer (${JSON.stringify(beforeClock)} → ${JSON.stringify(afterClock)}) — an expiry is in there somewhere. The on-chain link is FOR LIFE; a browser window decides only whether a referrer is attached AT ALL, once, irreversibly.`,
      );
    } finally {
      if (hadWindow) g.window = previous;
      else delete (g as { window?: unknown }).window;
    }
  }
  check(
    typeof next === "function",
    "referral-memory: nextRememberedSource is exported",
    "referral-memory: referralMemory.ts must export nextRememberedSource(remembered, arriving)",
  );

  if (typeof next === "function") {
    const A = "0x" + "a".repeat(64);
    const B = "0x" + "b".repeat(64);
    const UPPER = "0x" + "A".repeat(64); // SOURCE_ID_RE accepts both cases
    const ZERO = "0x" + "0".repeat(64); // the engine's "no introduction" value
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
      // ⛔ bytes32(0) IS NOT A SOURCE ID — IT IS THE ABSENCE OF ONE.
      // Found live 2026-08-05: it passes the plain hex format check, so the
      // link ?source=0x000…000 — which anyone can type — used to WIN by last
      // touch and overwrite a real stored introduction. Pin 3's "silent theft
      // in a new costume", shipped. It is also the exact value the engine reads
      // as "no introduction", so it must never be remembered or signed.
      [A, ZERO, A],
      [ZERO, null, null],
      [ZERO, B, B],
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
  // PER FUNCTION, not per file (H7, 2026-08-05): the file-wide test was
  // satisfied by readStore's try{ alone, so writeStore's could be deleted and
  // the guard stayed green — Safari private mode then takes /join down.
  for (const fn of ["readStore", "writeStore"]) {
    const body = new RegExp(`function\\s+${fn}\\s*\\([^)]*\\)[^{]*\\{([\\s\\S]*?)\\n\\}`).exec(modBody);
    check(
      body !== null && /try\s*{/.test(body[1]),
      `referral-memory: ${fn} guards its own storage access`,
      `referral-memory: ${fn}() touches web storage without its OWN try/catch — Safari private mode throws and would take the whole /join page down for a convenience feature`,
    );
  }
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
  // Either resolver is the ONE home — `resolveJoinSource` delegates to
  // `resolveJoinIntroduction`, which resolves the whole arrival (source + tag).
  const attachDecl =
    /const\s+(\w+)\s*=\s*[^;]*?resolveJoin(?:Source|Introduction)\s*\(/.exec(page);
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

  // ⛔ THE SIGNED ARGUMENTS MUST HONOUR A PROVEN REFUSAL (2026-08-05 review).
  // `applySourceId = sourceId !== null ? sourceId : ZERO` ignored `sourceDrop`,
  // so a source the engine had ALREADY refused was re-armed and re-probed; if
  // that second probe answered "unreadable" (any RPC blip — decideSourceApplication
  // fails OPEN by his ruling, correctly) the known-bad id went on chain and the
  // whole purchase REVERTED. The buyer pays gas for a purchase that would have
  // succeeded. Removing a proven-refused introduction is exactly what his ruling
  // ⑥ permits — it is not a refusal to send.
  check(
    /applySourceId[^=]*=\s*[\s\S]{0,120}?sourceDrop === null/.test(checkout),
    "referral-memory: the signed source honours a proven engine refusal",
    "referral-memory: the sourceId handed to buy() ignores `sourceDrop` — an introduction the engine has ALREADY refused is re-armed, and one unreadable probe later it reverts the buyer's whole purchase. Gate it on `sourceId !== null && sourceDrop === null`.",
  );

  // ⛔ THE CLICK-TIME DROP MUST TELL THE PAGE (2026-08-05 review). The drop
  // inside handleBuy set a local notice and called onVerdict, but never
  // setSourceDrop — so the attribution paragraph kept promising a commission
  // for the entire wallet-prompt window while the transaction being signed
  // carried bytes32(0). The commit claiming the line "cannot drift from what is
  // actually sent" was false on the one path that matters.
  // ⛔ NO RATE MAY BE TYPED ON THE MONEY PATH (his red line; SPEC §⑧① — the
  // rate comes from the QUOTE, never from a literal). The first version of the
  // attribution line said "5%", read from nowhere, false for every introducer
  // above the ladder's first rung, one click before a signature. The engine's
  // own figure is already rendered in the breakdown above.
  const attribution = /data-testid="text-checkout-attribution"[\s\S]{0,2200}?<\/p>/.exec(checkout);
  check(
    attribution !== null && !/\d+(?:\.\d+)?\s*%/.test(attribution[0]),
    "referral-memory: the attribution line types no commission rate",
    "referral-memory: a percentage literal appeared in the checkout's attribution line — the rate comes from the QUOTE (SPEC §⑧①). A typed rate is false for every introducer above the first rung and the chain refutes it, one click before a signature.",
  );

  // ⛔ AN UNREADABLE ENGINE IS NOT AN ACCEPTANCE (founder decision ①, 2026-08-05).
  // `askEngineAboutSource` fails OPEN — correctly, his ruling ⑥ — so an RPC that
  // could not be reached returned the SAME shape as a clean acceptance, and the
  // attribution line asserted "an introduction is attached" one click before a
  // signature on a check that never completed. The link still goes out; the
  // CLAIM is what must be withdrawn. Three properties, none of them a spelling:
  check(
    /verdict === "unreadable"/.test(checkout),
    "referral-memory: the checkout distinguishes an UNREADABLE engine from an acceptance",
    'referral-memory: JoinCheckout never inspects `verdict === "unreadable"` — an engine we could not reach is being reported to the buyer as a confirmed attribution, one click before he signs',
  );
  const attributionBranches = attribution?.[0] ?? "";
  check(
    /could not reach the engine/i.test(attributionBranches),
    "referral-memory: the buyer is told when the engine could not be reached",
    "referral-memory: the attribution line has no branch for an unreadable engine — it promises an attribution that was never verified",
  );
  const reset = /setSourceDrop\(null\)[\s\S]{0,900}?\}, \[([^\]]*)\]/.exec(checkout);
  check(
    reset !== null && /\bsourceId\b/.test(reset[1]),
    "referral-memory: a verdict is forgotten when the LINK changes, not only the amount or wallet",
    "referral-memory: the verdict-reset effect does not depend on `sourceId` — open a second link and the FIRST link's verdict survives: the new one is never probed, is zeroed at the signature, and is stripped from the quote, while the page advertises that a newer link takes over. Its referrer earns nothing, permanently.",
  );

  const clickDrop = /answer\.decision === "drop"[\s\S]{0,900}?\}/.exec(checkout);
  check(
    clickDrop !== null && /setSourceDrop\s*\(/.test(clickDrop[0]),
    "referral-memory: the click-time drop is reported to the page before signing",
    "referral-memory: the drop inside handleBuy never calls setSourceDrop, so the attribution line still says an introduction is attached while a zero is signed — the exact contradiction the always-on line exists to prevent",
  );
}

// ── 10. THE CHANNEL TAG IS THE SOURCE'S TWIN ────────────────────────────────
// ⛔ THE TWIN SEARCH I OWED AND DID NOT DO (his law ①, caught by the review).
// My own commit's cause line reads: "`?source=` was read at ONE line and
// persisted NOWHERE." Its identical twin — `&via=`, read from
// `window.location.search` and persisted nowhere — was shipping in the same
// file family, and I fixed the instance instead of the pattern.
// CONSEQUENCE, and it is newly false BECAUSE of my fix: a visitor arrives on
// `?source=X&via=twitter`, leaves, comes back to a bare /join, and buys. The
// money now survives (that was the point) — but the conversion beacon reads
// `via` from the CURRENT url, finds none, and returns. Recorded: one twitter
// click, zero conversions. Before the memory that visitor did not convert, so
// zero was TRUE; now it is a lie, and it is worst on exactly the slow channels
// (print, QR, blog) the memory exists to serve.
// AND THE MIRROR: the click beacon fired on the EFFECTIVE source, so
// `/join?via=telegram` with no `?source=` counted a click for a REMEMBERED
// source — a (source, channel) pair no link ever carried.
// A source and the tag that says where it was handed out arrive in ONE link.
// One fact, ONE home.
const CHANNEL_PING = path.join(srcDir, "lib", "channelPing.ts");
if (existsSync(CHANNEL_PING)) {
  const ping = stripComments(readFileSync(CHANNEL_PING, "utf8"));
  check(
    !/window\.location/.test(ping),
    "referral-memory: the channel beacons do not read the live URL for the tag",
    "referral-memory: channelPing.ts still reads `window.location` — that is the twin defect. The landing's query string is NOT present at receipt time any more (the memory is precisely what lets a buyer return without it), so the conversion is never recorded and the channel report under-counts exactly the journeys the memory exists to serve.",
  );
}
if (moduleExists) {
  const modBodyTwin = stripComments(readFileSync(MODULE, "utf8"));
  check(
    /\bvia\b/i.test(modBodyTwin),
    "referral-memory: the memory carries the channel tag with its source",
    "referral-memory: referralMemory.ts remembers the source but not the `via` tag it arrived with — one link, one fact, ONE home (the twin-search law). Remembering half of a link is what makes the channel report lie.",
  );
}
if (pageExists) {
  const pageTwin = stripComments(readFileSync(PAGE, "utf8"));
  const clickCall = /pingChannelClick\s*\(([^)]*)\)/.exec(pageTwin);
  check(
    clickCall !== null && /sourceParam/.test(clickCall[1]),
    "referral-memory: a click is counted only for a link actually opened",
    "referral-memory: pingChannelClick is fed the EFFECTIVE source, so a URL carrying only `&via=` counts a click for a REMEMBERED source — a (source, channel) pair no link ever carried. A click beacon must key on what was in the address bar.",
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
