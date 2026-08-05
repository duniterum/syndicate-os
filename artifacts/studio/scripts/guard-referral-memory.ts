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
  // ⛔ AND THE ARRIVAL IS CAPTURED APP-WIDE, not on one page (founder decision
  // ③, 2026-08-05). Only /join ever read a link: one pasted as
  // thesyndicate.money/?source=… , a shared receipt, /referral, /member — every
  // one silently dropped the attribution, and the engine writes buyerSourceId
  // ONCE with no setter, so each was a member the referrer lost for life.
  // «The link survives the visit» is a property of the APP, not of a page.
  check(
    existsSync(APP) && /\bresolveJoin\w+\s*\(/.test(stripComments(readFileSync(APP, "utf8"))),
    "referral-memory: the arrival is captured app-wide, on every route",
    "referral-memory: App.tsx does not resolve an arriving link — capture is back on a single page, so a referral landing anywhere else is dropped in silence and that member is lost permanently",
  );

  const A = "0x" + "a".repeat(64);
  const B = "0x" + "b".repeat(64);
  const ZERO32 = "0x" + "0".repeat(64);
  /** A row that deliberately does not assert the stored residue. */
  // A sentinel for rows that deliberately do not assert the stored residue.
  // NOT a NUL byte: the first version used  and every grep, diff and
  // editor then treated this file as BINARY — a guard nobody can read is a
  // guard nobody will maintain.
  const DONT_CARE = "<dont-care>";
  const key = m.REFERRAL_MEMORY_KEY ?? "syndicate.join.source";

  // ⛔ THE CONFIRMING ENTRY POINT IS DISCOVERED TOO, never named here — same
  // reason the resolver is: a guard that names its own target measures what it
  // was told to, not what ships. If the app stops confirming, this goes red.
  const confirmNames = new Set<string>();
  for (const f of callers) {
    for (const hit of stripComments(readFileSync(f, "utf8")).matchAll(/\bconfirmJoin(\w+)\s*\(/g)) {
      confirmNames.add(`confirmJoin${hit[1]}`);
    }
  }
  check(
    confirmNames.size > 0,
    `referral-memory: the app confirms an arriving link against the chain (${[...confirmNames].join(", ")})`,
    "referral-memory: no confirmJoin*() call found in App.tsx or JoinProtocol.tsx — nothing ever proves an arriving link is real, so the memory can only ever rank links as equal and an unproven link keeps displacing a proven one. That IS the defect.",
  );
  let confirmTested = false;

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
    // A REAL VISIT, modelled: a top-level window, a visible document, and focus.
    // Each of those three is a separate attack surface and each is varied below.
    const fakeDocument = {
      visibilityState: "visible" as string,
      hasFocus: () => focused,
      addEventListener: () => {},
    };
    let focused = true;
    const fakeWindow: Record<string, unknown> = {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          if (throwOnWrite) throw new Error("QuotaExceeded / private mode");
          store.set(k, v);
        },
      },
      addEventListener: () => {},
      document: fakeDocument,
    };
    fakeWindow.top = fakeWindow;
    fakeWindow.self = fakeWindow;
    const g = globalThis as { window?: unknown; document?: unknown };
    const hadWindow = "window" in g;
    const hadDocument = "document" in g;
    const previous = g.window;
    const previousDoc = g.document;
    g.window = fakeWindow;
    g.document = fakeDocument;

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
    /**
     * ⛔ THE CONFIRMATION MARKER — and the MIGRATION DECISION, encoded here.
     *
     * An introduction is CONFIRMED once the chain has answered that it exists
     * and is active; until then it is provisional. The marker is what makes the
     * ranking possible at all: a confirmed memory is never displaced by an
     * unconfirmed arrival, while two unconfirmed links rank EQUAL and last
     * touch decides between them (founder ruling ⑭, preserved).
     *
     * ABSENT ⇒ UNCONFIRMED, deliberately (founder decision, this slice).
     * Introductions already sitting in visitors' browsers carry no marker, and
     * those are exactly the browsers that may be carrying a link planted by the
     * defect this module exists to close. Reading a legacy value as CONFIRMED
     * would freeze that damage in place — a genuine link could never displace
     * it. So a legacy memory is displaceable, and the first confirmed arrival
     * repairs the browser.
     */
    const storedConfirmed = (): boolean => {
      const raw = store.get(key) ?? null;
      if (raw === null || !raw.startsWith("{")) return false;
      try {
        return (JSON.parse(raw) as { c?: unknown }).c === true;
      } catch {
        return false;
      }
    };
    const sourceOf = (r: unknown): string | null =>
      typeof r === "string" ? r : r && typeof r === "object" ? ((r as { sourceId?: string }).sourceId ?? null) : null;

    // seed (raw stored value or null) · arriving source · arriving via
    //   → the source it must ANSWER · the source the store must HOLD · the tag
    //     it must HOLD · the CONFIRMATION the store must HOLD
    //
    // ⛔ EVERY ARRIVAL IN THIS TABLE IS UNCONFIRMED. These entry points are the
    // synchronous capture — they cannot reach the chain, so they may never
    // promote an arrival over a CONFIRMED memory. The confirmed path has its
    // own block below, driven through a stubbed validator.
    type Row = readonly [
      string | null, string | null, string | null,
      string | null, string | null, string | null,
      boolean | string,
    ];
    const ROWS: readonly Row[] = [
      // the arrival is taken AND persisted — provisionally, never confirmed
      [null, A, null, A, A, null, false],
      // ⛔ THE ROW EVERY GUTTING KILLS: nothing in the URL → the MEMORY answers
      [JSON.stringify({ s: A, v: null }), null, null, A, A, null, false],
      [A, null, null, A, A, null, false], // the legacy bare-string value still recalls
      // ⛔ THE RANK RULE — THE PAIR THAT DEFINES IT. Neither half alone is a
      // check: "always keep" satisfies the first, "always replace" satisfies the
      // second. Only together do they pin last-touch-AMONG-EQUALS.
      //   ① a CONFIRMED memory is NEVER displaced by an unconfirmed arrival…
      [JSON.stringify({ s: A, v: "twitter", c: true }), B, null, A, A, "twitter", true],
      //   ② …but two UNCONFIRMED links rank equal, and the newer one wins (⑭)
      [JSON.stringify({ s: A, v: "twitter", c: false }), B, null, B, B, null, false],
      //   ③ a LEGACY memory carries no marker and is therefore displaceable —
      //      this is the migration decision, executed, not merely commented
      [JSON.stringify({ s: A, v: "twitter" }), B, null, B, B, null, false],
      [A, null, null, A, A, null, false],
      //   ④ and a confirmed memory is never DOWNGRADED by a no-op visit
      [JSON.stringify({ s: A, v: "twitter", c: true }), null, null, A, A, "twitter", true],
      // ⛔ THE CHANNEL HALF, EXECUTED: a tag rides in with its link…
      [null, A, "twitter", A, A, "twitter", false],
      // …and a NEWER link with no tag CLEARS it — never inherits (equal rank)
      [JSON.stringify({ s: A, v: "twitter", c: false }), B, null, B, B, null, false],
      // …and an off-law tag is dropped, not stored
      [null, A, "NOT A TAG!!", A, A, null, false],
      // a mangled arrival never destroys a good memory, tag included
      [JSON.stringify({ s: A, v: "print" }), "garbage", "twitter", A, A, "print", false],
      [JSON.stringify({ s: A, v: "print" }), null, null, A, A, "print", false],
      // ⛔ bytes32(0) is the ABSENCE of an introduction — never wins, never stored
      [JSON.stringify({ s: A, v: null }), ZERO32, null, A, A, null, false],
      // POISONED / ZERO STORE — a user or an extension can edit it. THE PROPERTY
      // IS THAT IT IS NEVER ANSWERED, so it can never reach buy(). Whether the
      // junk is also scrubbed from storage is NOT asserted (DONT_CARE): it is
      // never believed and the next real arrival overwrites it, and pinning the
      // residue would pin an implementation detail instead of the rule.
      [JSON.stringify({ s: ZERO32, v: null }), null, null, null, DONT_CARE, DONT_CARE, DONT_CARE],
      [ZERO32, null, null, null, DONT_CARE, DONT_CARE, DONT_CARE],
      ["not-json-at-all", null, null, null, DONT_CARE, DONT_CARE, DONT_CARE],
      ['{"s":"garbage","v":"twitter"}', null, null, null, DONT_CARE, DONT_CARE, DONT_CARE],
      ['{"s":123}', null, null, null, DONT_CARE, DONT_CARE, DONT_CARE],
      ['{"__proto__":{"s":"' + A + '"}}', null, null, null, DONT_CARE, DONT_CARE, DONT_CARE],
      ["{", null, null, null, DONT_CARE, DONT_CARE, DONT_CARE],
      // …and a poisoned store still yields to a real arrival — a poisoned value
      // is not a confirmed one, so this is an equal-rank replacement
      ["not-json-at-all", B, "blog", B, B, "blog", false],
      // ⛔ AND A POISONED STORE CANNOT FORGE A RANK: `c:true` beside a source the
      // rule refuses is not a confirmed introduction, it is nothing — so a real
      // arrival still displaces it. Otherwise one edited localStorage value
      // would make a browser permanently unattributable to any honest link.
      [JSON.stringify({ s: "garbage", v: null, c: true }), B, "blog", B, B, "blog", false],
      [JSON.stringify({ s: ZERO32, v: null, c: true }), B, null, B, B, null, false],
    ];

    try {
      for (const [seed, src, via, wantAnswer, wantStored, wantVia, wantConfirmed] of ROWS) {
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
        const heldConfirmed = storedConfirmed();
        // The tag is only asserted for an entry point that takes one.
        const viaOk = wantVia === DONT_CARE || call.length < 2 || heldVia === wantVia;
        const storeOk = wantStored === DONT_CARE || heldSource === wantStored;
        const confirmedOk = wantConfirmed === DONT_CARE || heldConfirmed === wantConfirmed;
        check(
          answer === wantAnswer && storeOk && viaOk && confirmedOk,
          `referral-memory: ${entryName}(${src === null ? "null" : src.slice(0, 6) + "…"}${call.length > 1 ? `, ${JSON.stringify(via)}` : ""}) on ${seed === null ? "empty" : "seeded"} store → ${wantAnswer === null ? "null" : wantAnswer.slice(0, 6) + "…"}${wantConfirmed === DONT_CARE ? "" : ` (confirmed:${String(wantConfirmed)})`}`,
          `referral-memory: ${entryName}(${JSON.stringify(src)}, ${JSON.stringify(via)}) with the store seeded ${JSON.stringify(seed)} answered ${JSON.stringify(answer)} and left {source: ${JSON.stringify(heldSource)}, via: ${JSON.stringify(heldVia)}, confirmed: ${String(heldConfirmed)}} — expected ${JSON.stringify(wantAnswer)} / ${JSON.stringify(wantStored)} / ${JSON.stringify(wantVia)} / confirmed:${String(wantConfirmed)}. A failing recall row means the memory is dead and the original defect is back; a failing CONFIRMED column means an unproven link can displace a proven one, which is that defect wearing the marker's costume.`,
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

      // ── THE CONFIRMED PATH, EXECUTED AGAINST A STUBBED CHAIN ───────────────
      // The rank rule is only worth anything if something can actually RAISE a
      // link's rank. This drives the confirming entry point with a stub in place
      // of /api/source/validate, so the promotion is proven without a network.
      // ⛔ AND REFUSAL ERASES NOTHING (founder, this slice): a registry pause is
      // reversible, and erasing on a transient refusal would destroy a real
      // introduction — the very harm this module exists to stop.
      if (!confirmTested) {
        confirmTested = true;
        for (const confirmName of confirmNames) {
          const fn = (m as Record<string, unknown>)[confirmName];
          check(
            typeof fn === "function",
            `referral-memory: ${confirmName} is exported and callable`,
            `referral-memory: the app calls ${confirmName}() but referralMemory.ts does not export it — nothing can raise a link's rank, so a proven link can never displace an unproven one`,
          );
          if (typeof fn !== "function") continue;
          const confirm = fn as (
            s: string | null,
            v: string | null,
            validate?: (id: string) => Promise<boolean>,
          ) => Promise<unknown>;
          const YES = async () => true;
          const NO = async () => false;
          const BOOM = async () => {
            throw new Error("RPC unreachable / throttled");
          };
          // seed · arriving · stub → stored source · stored confirmed · label
          const CONFIRM_ROWS: readonly (readonly [
            string | null, string | null, () => Promise<boolean>, string, boolean, string,
          ])[] = [
            [JSON.stringify({ s: A, v: "twitter", c: true }), B, YES, B, true,
              "a PROVEN arrival displaces a proven memory (⑭ among confirmed)"],
            [JSON.stringify({ s: A, v: "twitter", c: true }), B, NO, A, true,
              "a refused arrival leaves a proven memory untouched, and erases nothing"],
            [JSON.stringify({ s: A, v: "twitter" }), B, YES, B, true,
              "a PROVEN arrival repairs a LEGACY browser — the migration, executed"],
            [null, B, YES, B, true, "a proven arrival into an empty browser is stored confirmed"],
            [JSON.stringify({ s: A, v: "twitter", c: false }), B, BOOM, A, false,
              "an unreachable chain promotes nothing and erases nothing"],
            [JSON.stringify({ s: A, v: "twitter", c: true }), B, BOOM, A, true,
              "an unreachable chain cannot downgrade a proven memory"],
          ];
          for (const [seed, arriving, stub, wantSource, wantConfirmed, label] of CONFIRM_ROWS) {
            tableRows += 1;
            store.clear();
            if (seed !== null) store.set(key, seed);
            // ⛔ A THROW IS NOT AN ACCEPTABLE OUTCOME, and this guard used to
            // swallow one. Found 2026-08-06 by the author's own mutation pass:
            // a botched revert left the catch block re-calling the validator, so
            // an unreachable chain threw twice and the second throw ESCAPED —
            // and every row still passed, because the store was unchanged and
            // the swallow hid it. The caller is a fire-and-forget `void`, so an
            // escaping rejection is an UNHANDLED one. The contract is that this
            // function absorbs everything and answers, so the throw is asserted.
            let threw: string | null = null;
            try {
              await confirm(arriving, null, stub);
            } catch (e) {
              threw = e instanceof Error ? e.message : String(e);
            }
            check(
              threw === null &&
                storedSource() === wantSource &&
                storedConfirmed() === wantConfirmed,
              `referral-memory: ${label}`,
              `referral-memory: ${confirmName} — ${label}: ${threw !== null ? `it THREW (${threw}) instead of answering — the caller is a fire-and-forget void, so this is an unhandled rejection; ` : ""}the store left {source: ${JSON.stringify(storedSource())}, confirmed: ${String(storedConfirmed())}} but must hold {source: ${JSON.stringify(wantSource)}, confirmed: ${String(wantConfirmed)}}`,
            );
          }
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

      // ── THE POPUNDER: a TOP-LEVEL window that no human is looking at ───────
      // The frame refusal did not stop this one — `window.open()` gives
      // `top === self`, so the write fired at render with no click and no
      // wallet, and the opener could close the window milliseconds later. That
      // is the vector that actually pays for cookie-stuffing. A page with no
      // focus and no interaction may not write, and a prerendered (hidden)
      // page may not either.
      for (const [label, setup] of [
        ["a popunder (no focus, no interaction)", () => { focused = false; }],
        ["a prerendered / background page", () => { fakeDocument.visibilityState = "hidden"; }],
      ] as const) {
        store.clear();
        store.set(key, JSON.stringify({ s: B, v: "print" }));
        setup();
        try {
          call(A, "twitter");
        } catch {
          /* a throw is also "did not write" */
        }
        check(
          storedSource() === B,
          `referral-memory: ${label} cannot plant an introduction`,
          `referral-memory: ${label} wrote ${JSON.stringify(storedSource())} — any site can then open a hidden window on us and plant its own introduction in a visitor's browser, permanently, with no click and no wallet`,
        );
        focused = true;
        fakeDocument.visibilityState = "visible";
      }

      // ── AND AN HONEST VISIT THAT STARTS UNFOCUSED IS NOT LOST ──────────────
      // The gate must not become the defect it prevents: a real arrival whose
      // first paint had no focus has to be REPLAYED, not discarded.
      store.clear();
      focused = false;
      call(A, "twitter");
      const refused = storedSource();
      focused = true;
      call(A, "twitter");
      check(
        refused === null && storedSource() === A,
        "referral-memory: an honest visit that starts unfocused is replayed, never lost",
        `referral-memory: after a first write refused for lack of focus, the arrival was ${JSON.stringify(storedSource())} once focus arrived — expected it to be remembered. Losing an honest capture is the very defect this module exists to stop.`,
      );

      // ── THE TAG BELONGS TO ITS SOURCE — EXECUTED, not text-matched ─────────
      // A text pin here went green while the lookup ignored its argument. The
      // property is behavioural: ask for a DIFFERENT source and you get nothing.
      // It matters because the engine can auto-apply a previously-linked source
      // the memory knows nothing about, and a second tab can rewrite the memory
      // mid-session — either way the beacon would credit a channel that never
      // carried this buyer.
      const viaFor = (m as Record<string, unknown>)["rememberedViaFor"];
      if (typeof viaFor === "function") {
        const ask = viaFor as (s: string) => string | null;
        store.clear();
        store.set(key, JSON.stringify({ s: A, v: "print" }));
        tableRows += 2;
        check(
          ask(A) === "print",
          "referral-memory: the remembered tag is returned for its OWN source",
          `referral-memory: rememberedViaFor(A) returned ${JSON.stringify(ask(A))} with {A, "print"} stored — a real conversion loses its channel`,
        );
        check(
          ask(B) === null,
          "referral-memory: the remembered tag is NOT returned for a different source",
          `referral-memory: rememberedViaFor(B) returned ${JSON.stringify(ask(B))} while the memory holds A's tag — the beacon would credit a conversion to a channel that never carried this buyer`,
        );
      }

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
      if (hadDocument) g.document = previousDoc;
      else delete (g as { document?: unknown }).document;
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
  // ⛔ THE CHECKOUT RECEIVES THE RAW ARRIVAL, NEVER A VALUE THE PAGE NULLS ON
  // ITS OWN VERDICT (live regression, found and fixed 2026-08-05 within hours of
  // shipping). Adding `sourceId` to the reset effect's dependencies — correct in
  // itself — closed a feedback loop with the page:
  //   probe drops → onVerdict(dropped) → the page nulls the source it passes →
  //   the prop changes → the reset effect clears the verdict → the page restores
  //   the source → the probe runs again → drops again. UNBOUNDED.
  // The screen flapped between «Paid to your referrer −X USDC» and the true
  // split, and at the click `sourceDrop` could be null, neutralising the very
  // guard that stops a proven-refused id from being signed. The checkout already
  // owns `sourceDrop` as the sole authority over what it signs; the page needs
  // its dropped view only for its OWN quote key and money breakdown.
  if (pageExists) {
    const pageWiring = stripComments(readFileSync(PAGE, "utf8"));
    const slot = /<CheckoutSlot[\s\S]{0,400}?\/>/.exec(pageWiring);
    const passed = slot ? /sourceId=\{(\w+)\}/.exec(slot[0])?.[1] ?? "" : "";
    const nulledOnVerdict =
      passed.length > 0 &&
      new RegExp(`const\\s+${passed}\\s*=[^;]*(?:dropped|Unusable)`).test(pageWiring);
    check(
      slot !== null && passed.length > 0 && !nulledOnVerdict,
      `referral-memory: the checkout receives the raw arrival (${passed}), not a verdict-derived value`,
      `referral-memory: CheckoutSlot is handed \`${passed}\`, which the page nulls from its own dropped verdict — that closes a feedback loop (drop → prop change → verdict reset → drop …) which flaps the money breakdown and can leave sourceDrop null at the signature, re-arming a source the engine already refused`,
    );
  }

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
  // ⛔ PIN THE ORDER, NOT THE SPELLING. Banning `window.location` outright was
  // the first attempt and it was wrong twice over: it forbade a URL read that is
  // the correct FALLBACK (storage is unavailable in Safari private mode and in
  // wallet in-app browsers — exactly the population that buys, and the click was
  // counted from the URL a moment earlier), and it would have gone green on any
  // other way of reading the same query string. The property is that the
  // REMEMBERED arrival is asked FIRST, and asked for THIS source.
  const conversion = /export function pingChannelConversion[\s\S]{0,1400}?\n\}/.exec(ping);
  const body = conversion?.[0] ?? "";
  const viaFromMemory = body.indexOf("rememberedViaFor");
  const viaFromUrl = body.search(/location\s*\.\s*search|location\?\.\s*search/);
  check(
    viaFromMemory !== -1 && (viaFromUrl === -1 || viaFromMemory < viaFromUrl),
    "referral-memory: the conversion asks the REMEMBERED arrival first, the URL only as a fallback",
    "referral-memory: pingChannelConversion reads the live URL for the channel tag before (or instead of) the remembered arrival — that is the twin defect. The landing's query string is NOT present at receipt time any more (the memory is precisely what lets a buyer return without it), so the conversion goes unrecorded and the channel report under-counts exactly the journeys the memory exists to serve.",
  );
  check(
    !/\brememberedVia\s*\(/.test(ping),
    "referral-memory: the conversion tag is bound to the source that actually applied",
    "referral-memory: the channel tag is read independently of the sourceId on the receipt — the engine can auto-apply a DIFFERENT, previously-linked source, and a second tab can rewrite the memory, so the beacon would credit a conversion to a channel that never carried this buyer. Ask `rememberedViaFor(sourceId)`.",
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
  // The beacon lives wherever the ARRIVAL is captured — since founder decision
  // ③ (2026-08-05) that is App.tsx, because a link can land on ANY route. Both
  // callers are searched and exactly ONE must fire it: two callers drift apart
  // the same way the source and its channel tag did.
  const twinBodies = [PAGE, APP]
    .filter((f) => existsSync(f))
    .map((f) => stripComments(readFileSync(f, "utf8")));
  const firing = twinBodies.filter((b) => /pingChannelClick\s*\(/.test(b));
  check(
    firing.length === 1,
    `referral-memory: the click beacon has ONE home (${firing.length} caller)`,
    `referral-memory: pingChannelClick fires from ${firing.length} places — one fact, one home (the twin-search law)`,
  );
  // ⛔ PIN THE PROVENANCE, NOT THE VARIABLE NAME. The first version demanded the
  // identifier `sourceParam` and went red the moment the beacon moved to a file
  // that spells the same fact differently. The property: the id counted as a
  // CLICK is read from the ADDRESS BAR, never from the resolver — otherwise a
  // URL carrying only `&via=` counts a click for a REMEMBERED source, a
  // (source, channel) pair no link ever carried. A click is a real arrival.
  const firingBody = firing[0] ?? "";
  const clickCall = /pingChannelClick\s*\(([^)]*)\)/.exec(firingBody);
  const clickArg = (clickCall?.[1] ?? "").split(",")[0]?.trim() ?? "";
  const declared = clickArg.length > 0
    ? new RegExp(`(?:const|let)\\s+${clickArg}\\s*=[^;]*`).exec(firingBody)?.[0] ?? ""
    : "";
  check(
    clickCall !== null &&
      /URLSearchParams|get\("source"\)/.test(declared) &&
      !/resolveJoin/.test(declared),
    `referral-memory: a click is counted only for a link actually opened (${clickArg})`,
    `referral-memory: pingChannelClick is fed \`${clickArg}\`, which is not read from the address bar (or comes from the resolver) — a URL carrying only a channel tag then counts a click for a REMEMBERED source, a (source, channel) pair no link ever carried`,
  );
}

// ── 11. A FAILED RE-READ MAY NOT TEAR THE CHECKOUT DOWN ─────────────────────
// The most expensive defect the twelve-hat review found. `placeholderData`
// covered only the LOADING case, so an `isError` — or a 200 whose server-side
// chain read failed — early-returned past <CheckoutSlot> and UNMOUNTED the
// checkout with everything it holds, including the receipt. And the query's key
// changes at the worst possible moment: dropping the link flips the effective
// source ~15 lines before writeContractAsync, so the new-key fetch lands while
// the wallet prompt is open. The buyer could sign, succeed on-chain, be shown a
// fresh Step 1 with no seat and no ticket, and pay AGAIN.
if (pageExists) {
  const pageBody = stripComments(readFileSync(PAGE, "utf8"));
  check(
    /lastConfirmed/.test(pageBody),
    "referral-memory: the last CONFIRMED quote is retained across a failed re-read",
    "referral-memory: JoinProtocol keeps no last-confirmed quote — a failed re-read early-returns past the checkout and unmounts it mid-signature, destroying the receipt and letting the buyer pay twice",
  );
  // The early return must be reachable ONLY when there is nothing confirmed to
  // show — never on the raw error/unverified conditions that used to fire it.
  // ⛔ PIN THE PROPERTY, NOT THE SPELLING. The first version demanded the literal
  // `if (shown === null || shown === undefined` — and went RED the moment the page
  // correctly DROPPED the `null` half (react-query's data is `T | undefined`, the
  // ref is seeded `undefined`, so `shown === null` was dead code that made the
  // loading branch unreachable and showed every first-time buyer a red error).
  // Replit's deploy caught it: the page was right, the pin had not followed the
  // refactor. The property is that the bail-out asks «is there anything confirmed
  // to show?» — never the raw error/unverified conditions that used to tear the
  // checkout down mid-signature.
  const bail = /if \(([^)]*?)\)\s*\{[\s\S]{0,200}?text-quote-(?:error|failed)/.exec(pageBody);
  const cond = bail?.[1] ?? "";
  check(
    bail !== null && /shown/.test(cond) && !/isError|chainVerified/.test(cond),
    `referral-memory: the quote panel bails out only when NOTHING was ever confirmed (${cond.trim().slice(0, 60)})`,
    `referral-memory: the quote panel's early return tests \`${cond.trim().slice(0, 80)}\` — it must test the RETAINED value (\`shown\`), never a raw error or unverified read, or a failed re-read tears the checkout down mid-signature and the buyer can pay twice`,
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
