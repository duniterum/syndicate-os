// Explicit .ts extension (tsconfig `allowImportingTsExtensions`) so
// guard-referral-memory can import this module directly and EXECUTE its truth
// table instead of only text-matching it.
import { isSourceIdFormat } from "./rawUnits.ts";

// referralMemory.ts — A REFERRAL LINK MUST SURVIVE THE VISIT.
// ===========================================================================
// THE DEFECT THIS MODULE EXISTS FOR — his own friend, his own money, 2026-08-05.
//
//   He sent https://thesyndicate.money/join?source=0x8338e9ff…cf620
//   His friend paid 600 USDC. He was paid NOTHING.
//
// MEASURED ON MAINNET the same day, every figure from a command:
//   · the friend's tx 0xf333b663…401b signed sourceId = bytes32(0);
//     commission 0; 600 USDC split 420/120/60.
//   · REPLAYED at block 92,095,300, the block before he signed:
//       buy(600 USDC, his wallet, THAT source) → ACCEPTED
//       quote(600 USDC, his wallet, THAT source).acquisitionCost = 30,000,000
//     ⛔ THE ENGINE WOULD HAVE PAID 30.00 USDC.
//   · the live server agreed — /api/join/quote answered sourceValid: true.
//   · the drop path could not have fired anywhere in the window: at a zero
//     allowance the engine answers Error("ERC20: transfer amount exceeds
//     allowance"), never one of the four source refusals; after his approval it
//     answers ACCEPTED. THE LINK WAS NOT DROPPED. IT WAS ABSENT.
//
// CAUSE: `?source=` was read at ONE line of JoinProtocol and persisted NOWHERE.
// Attribution was as durable as one browser tab's query string — a reload, a
// click to the terms and back, or a wallet's in-app browser, and a referrer's
// commission was destroyed in silence, with nobody told.
//
// ⛔ AND THE COST IS NOT THE 30 USDC. MEASURED: MembershipSaleV3 writes
// `buyerSourceId` at exactly ONE line (479), inside a successful attributed
// buy, and no owner function can set it. A wallet that takes its seat with no
// introduction can NEVER be attached to one — buy(WITH the link) on that seat
// answers SourceNotEligible() today and forever. One missed link is not one
// missed commission; it is that member, permanently.
//
// HIS TWO RULINGS, 2026-08-05, and they ARE the code below:
//
// ⓐ NO EXPIRY. He asked what happens after 30 days, and the question broke the
//    recommendation. On this protocol the on-chain link is FOR LIFE — measured:
//    seats #13/#14/#17 carry expiresAt 0 (contract line 609 reads 0 as "never")
//    and a fresh 100 USDC repeat purchase still quotes 5.00 USDC to their
//    introducer. So a browser window never shortens what a referrer earns. It
//    decides WHETHER HE IS ATTACHED AT ALL — once, irreversibly. A 30-day
//    window would only manufacture permanent losses. The link is kept until it
//    is used.
//
// ⓑ LAST TOUCH WINS. Two links before a purchase → the most recent one; that is
//    the person who actually convinced the buyer.
//
// ⓒ LAST TOUCH WINS **AMONG PROVEN LINKS** (founder, 2026-08-06 — the audit's
//    P0-3). Ruling ⓑ is unchanged; what changed is WHICH touches count.
//
//    THE DEFECT: `isUsableSourceId` tests SHAPE ONLY, so any 64-hex string a
//    stranger can type displaced a real remembered introduction. Posting
//    `?source=0x<random>` in a forum reply was enough — capture fires on EVERY
//    route at render, with no click — and because the engine writes
//    buyerSourceId once with no setter, every visitor who opened it lost their
//    honest referrer FOR LIFE. The old guard PINNED that behaviour as law.
//
//    THE RULE NOW: a remembered introduction carries a CONFIRMATION MARKER —
//    set once the chain has answered that the link exists and is active.
//      · a CONFIRMED arrival always replaces, and is stored confirmed;
//      · an UNCONFIRMED arrival replaces only an EMPTY or UNCONFIRMED memory
//        (equal rank → ⓑ still decides), and is stored unconfirmed;
//      · a CONFIRMED memory is never displaced by an unproven arrival, and is
//        never downgraded;
//      · a REFUSAL ERASES NOTHING. A registry pause is reversible, and erasing
//        on a transient refusal would destroy a real introduction — the very
//        harm this module exists to stop. The checkout's engine probe is the
//        backstop for a link that cannot attach.
//
//    ⛔ MIGRATION, DECIDED EXPLICITLY (founder, same ruling): an introduction
//    already sitting in a visitor's browser carries NO marker, and is read as
//    UNCONFIRMED. Those are exactly the browsers that may be holding a link
//    planted by the defect above. Reading a legacy value as CONFIRMED would
//    freeze that damage in place — a genuine link could never displace it. So a
//    legacy memory is displaceable, and the first proven arrival repairs the
//    browser.
//
//    Capture stays SYNCHRONOUS and instant (nothing is lost while the network
//    is asked); only the PROMOTION over an existing proven link waits on proof.
//
// WHAT THIS CANNOT DO, said plainly because a referrer's money rides on it: a
// browser that clears its data, a buyer who signs from a different device, or a
// wallet in-app browser opened without ever loading our link, are all beyond any
// client memory. That is why the checkout must also SAY when it is about to sign
// without an introduction — silence is what made this defect invisible for
// twenty purchases.
// ===========================================================================

/** The ONE storage key for the remembered introduction. */
export const REFERRAL_MEMORY_KEY = "syndicate.join.source";

/**
 * ⛔ bytes32(0) IS NOT AN INTRODUCTION — IT IS THE ABSENCE OF ONE.
 * It is the exact value `buy()` reads as "no source", and it passes a plain hex
 * format check. Found live in review 2026-08-05: the link `?source=0x000…000`,
 * which anyone can type, therefore WON by last touch and overwrote a real
 * stored introduction. That is the silent theft this module exists to stop,
 * wearing a new costume. A source id is a real id or it is nothing.
 */
const ZERO_SOURCE_ID = `0x${"0".repeat(64)}`;

function isUsableSourceId(value: string): boolean {
  return isSourceIdFormat(value) && value.toLowerCase() !== ZERO_SOURCE_ID;
}

/**
 * THE RULE, pure — no storage, no clock, no window. Given what we remembered
 * and what (if anything) arrived in the URL, what should be remembered and used?
 *
 * ⛔ There is no time input here BY DESIGN (his ruling ⓐ). If a future session
 * feels the urge to add one, read the ruling above first: the window does not
 * bound a commission, it bounds whether a referrer is ever attached.
 *
 * Both arguments are untrusted strings — one comes from a URL a stranger can
 * type, the other from storage a user or an extension can edit. Neither is
 * believed without the format check, so a corrupt value degrades to "nothing
 * remembered" and can never travel to the chain as a source id.
 */
export function nextRememberedSource(
  remembered: string | null,
  arriving: string | null,
): string | null {
  // ⛔ ONE RULE, ONE HOME (CLAUDE.md ①). This used to restate the rule — «a
  // valid arrival always wins» — which is precisely the sentence ruling ⓒ
  // narrowed. Two homes for one decision is how the defect above survived a
  // fix, so this DELEGATES and cannot drift from the rule it names.
  //
  // A bare string carries no confirmation marker, so it is UNCONFIRMED by the
  // migration rule; an arrival through this path is unconfirmed too. Equal
  // rank, so ⓑ decides and the behaviour is exactly what it always was.
  return nextRememberedIntroduction(
    remembered === null ? null : { sourceId: remembered, via: null, confirmed: false },
    arriving,
    null,
    false,
  )?.sourceId ?? null;
}

/** Storage that cannot throw — Safari private mode throws on write, and a join
 *  page must never die for a convenience feature. Every path fails to "no
 *  memory", never to an exception. */
function readStore(): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFERRAL_MEMORY_KEY);
  } catch {
    return null;
  }
}

/**
 * ⛔ A REAL VISIT — the gate the frame check alone did not close.
 *
 * The frame refusal stopped `<iframe src="…?source=THEIRS">`. It did NOT stop
 * the vector that actually pays: `window.open()`. A popunder is a TOP-LEVEL
 * window — `top === self` — so the write fired at render, with no click and no
 * wallet, and the opener could close it milliseconds later. Same for a
 * prerendered page the visitor never chose to open.
 *
 * So the write asks three questions, and all three are about whether a HUMAN is
 * actually looking at our page:
 *   · not inside a frame;
 *   · the document is VISIBLE (kills prerender and background tabs);
 *   · the window has FOCUS, or this human has already interacted with it
 *     (a popunder has neither; a real visit has focus from its first frame).
 *
 * A visit that starts unfocused is NOT lost — see `rememberWhenReal`: the write
 * is replayed the moment focus or the first interaction arrives. Losing an
 * honest capture would be the very defect this module exists to stop.
 */
let humanHasInteracted = false;
let pendingWrite: string | null = null;
let listenersBound = false;

function isRealVisit(): boolean {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") return false;
    if (window.top !== window.self) return false;
    if (document.visibilityState !== "visible") return false;
    return document.hasFocus() || humanHasInteracted;
  } catch {
    return false;
  }
}

/** Replay a refused write once the visit proves itself real. */
function bindRealVisitListeners(): void {
  if (listenersBound) return;
  listenersBound = true;
  const wake = () => {
    humanHasInteracted = true;
    if (pendingWrite !== null && isRealVisit()) {
      const value = pendingWrite;
      pendingWrite = null;
      writeStore(value);
    }
  };
  try {
    for (const ev of ["focus", "pointerdown", "keydown", "touchstart", "visibilitychange"]) {
      window.addEventListener(ev, wake, { once: false, passive: true });
    }
  } catch {
    /* no event target — the visit simply cannot be confirmed */
  }
}

function writeStore(value: string): void {
  try {
    if (typeof window === "undefined") return;
    // ⛔ AN INVITATION LINK IS OPENED — IT IS NEVER FRAMED (security review,
    // 2026-08-05). MEASURED on prod the same day: `curl -D - /join` returns NO
    // X-Frame-Options and NO Content-Security-Policy, so any site can hide
    // <iframe src="…/join?source=THEIRS">. This module writes at render — no
    // click, no wallet — so that iframe would silently plant the attacker's
    // introduction in the visitor's browser and keep it, and because the engine
    // writes buyerSourceId exactly once with no owner setter, the honest
    // referrer loses that member FOREVER. Classic affiliate cookie-stuffing,
    // and it is the MEMORY that makes it pay: before this module the same
    // iframe stole nothing, because the id died with the tab.
    // This half is ours and ships now; the response headers are the serving
    // layer's and are handed to Replit separately. Defence in depth: either
    // alone closes it, and we do not wait on the other.
    //
    // ⛔ AND THE FRAME CHECK ALONE WAS NOT ENOUGH — a `window.open()` popunder is
    // a TOP-LEVEL window (`top === self`) and sailed straight through it. The
    // full question is whether a human is looking at this page; a refused write
    // is REPLAYED the moment focus or a first interaction proves it.
    if (!isRealVisit()) {
      pendingWrite = value;
      bindRealVisitListeners();
      return;
    }
    window.localStorage.setItem(REFERRAL_MEMORY_KEY, value);
  } catch {
    /* no memory available — the visit still works, the link just cannot survive it */
  }
}

/**
 * THE ONE ENTRY POINT the join page uses: given the `?source=` of the current
 * URL (null when there is none), return the introduction this visit should
 * actually use — remembering a new one on the way.
 *
 * Idempotent: calling it repeatedly with the same URL writes the same value and
 * returns the same answer.
 * ⛔ <s>so it is safe inside a render-time memo</s> — STRUCK 2026-08-06. It
 * WRITES. A write during render is a side effect on a pass React is free to
 * discard, and this sentence is precisely what licensed a `useState` initializer
 * that did exactly that. The render-phase read is `peekJoinIntroduction`; this
 * entry point belongs in an effect or an event handler, where remembering the
 * arrival is the whole point.
 *
 * NOT CLEARED AFTER A PURCHASE, deliberately. Once a buyer is attributed the
 * ENGINE holds the link for life and applies it on a zero id, so a stale memory
 * costs nothing: if it names the same source the engine accepts it, and if it
 * names a different one the engine answers SourceAlreadyLinked, the checkout
 * drops it, and the buyer's real introducer is paid anyway. Adding a clearing
 * rule could only ever destroy a link that was still worth something.
 */
export function resolveJoinSource(urlSource: string | null): string | null {
  // Delegates — ONE home for the whole arrival. Keeping a second read/write
  // path here is how the source and its channel drifted apart in the first place.
  return resolveJoinIntroduction(urlSource, null)?.sourceId ?? null;
}

// ===========================================================================
// THE CHANNEL TAG TRAVELS WITH ITS SOURCE — THE TWIN I OWED (his law ①).
//
// My own commit's cause line read: «`?source=` was read at ONE line and
// persisted NOWHERE». Its identical twin, `&via=`, was read from
// `window.location.search` at receipt time and persisted nowhere — and the
// review caught that I had fixed the instance instead of the pattern.
//
// The premise written in channelPing.ts said it plainly: «the /join checkout
// never navigates, so the landing's query string is still present at receipt
// time». THAT WAS TRUE UNTIL THIS MODULE EXISTED. The memory is precisely what
// lets a buyer come back to a bare /join and still be attributed — so the money
// now survives the journey and the channel report does not. A visitor arriving
// on `?source=X&via=twitter` who returns later and buys was recorded as ONE
// twitter click and ZERO conversions. Before the memory that visitor simply did
// not convert, so zero was TRUE; my fix is what turned it into a lie, and it
// lies worst about the slow channels — print, QR, a blog post — which are
// exactly the ones the memory was built to serve.
//
// A link carries both halves at once: WHO is paid (`source`, on-chain money)
// and WHERE it was handed out (`via`, off-chain analytics) — SPEC §④. They are
// one arrival. So they are remembered together, in one key, by one function.
// ⛔ And a tag NEVER outlives its own link: a newer link with no tag clears it,
// because inheriting the previous link's channel would invent a fact.
// ===========================================================================

/** The channel-tag law — the ONE spelling, mirrored from the server's pin. */
const VIA_RE = /^[a-z0-9][a-z0-9_-]{0,23}$/;

export interface RememberedIntroduction {
  sourceId: string;
  /** The channel this exact link was handed out on, or null when it carried none. */
  via: string | null;
  /**
   * Has the CHAIN answered that this link exists and is active? (ruling ⓒ)
   * false = provisional — kept, usable, and displaceable by a newer link.
   * A legacy value with no marker reads as false; see the migration note above.
   */
  confirmed: boolean;
}

/** Normalize a raw `via` value; null when absent or off-law. */
export function normalizeVia(raw: string | null): string | null {
  if (raw === null) return null;
  const via = raw.trim().toLowerCase();
  return VIA_RE.test(via) ? via : null;
}

/**
 * THE RULE for the whole arrival, pure. Same two rulings as the source alone —
 * last touch wins, nothing expires — with the tag bound to the link it came on.
 */
export function nextRememberedIntroduction(
  remembered: RememberedIntroduction | null,
  arrivingSource: string | null,
  arrivingVia: string | null,
  arrivalConfirmed: boolean = false,
): RememberedIntroduction | null {
  // A poisoned memory is NOTHING — never a rank. An edited localStorage value
  // claiming `c:true` beside a source the rule refuses must not be able to make
  // a browser permanently unattributable to any honest link.
  const held =
    remembered !== null && isUsableSourceId(remembered.sourceId) ? remembered : null;

  if (arrivingSource !== null && isUsableSourceId(arrivingSource)) {
    // THE RANK RULE (ⓒ). An arrival may take the place of a held introduction
    // only when it OUTRANKS it or ties with it:
    //   · proven arrival  → always (it outranks anything unproven, and ties
    //                       with a proven one, where ⓑ last-touch decides);
    //   · unproven arrival→ only over an empty or unproven memory (equal rank,
    //                       ⓑ again). NEVER over a proven one.
    if (arrivalConfirmed || held === null || !held.confirmed) {
      // A new link replaces BOTH halves. Its own tag, or none — never the old one.
      return {
        sourceId: arrivingSource,
        via: normalizeVia(arrivingVia),
        confirmed: arrivalConfirmed,
      };
    }
    // Outranked: the proven memory stands, untouched and undowngraded.
    return held;
  }
  return held;
}

function readIntroduction(): RememberedIntroduction | null {
  const raw = readStore();
  if (raw === null) return null;
  // Tolerates the source-only value an earlier build wrote. NO MARKER ⇒
  // UNCONFIRMED (the migration decision, ⓒ) — a legacy browser stays repairable.
  if (!raw.startsWith("{")) {
    return isUsableSourceId(raw) ? { sourceId: raw, via: null, confirmed: false } : null;
  }
  try {
    const parsed = JSON.parse(raw) as { s?: unknown; v?: unknown; c?: unknown };
    if (typeof parsed.s !== "string" || !isUsableSourceId(parsed.s)) return null;
    return {
      sourceId: parsed.s,
      via: typeof parsed.v === "string" ? normalizeVia(parsed.v) : null,
      // Only a literal `true` is proof. Absent, missing or any other value reads
      // as UNCONFIRMED — a marker is never inferred.
      confirmed: parsed.c === true,
    };
  } catch {
    return null;
  }
}

/** The ONE serializer — the store's shape lives in exactly one place. */
function writeIntroduction(next: RememberedIntroduction): void {
  writeStore(JSON.stringify({ s: next.sourceId, v: next.via, c: next.confirmed }));
}

/**
 * The join page reads the memory at its first paint and again in an effect
 * (<s>in a render-time memo</s> — STRUCK 2026-08-06, see `peekJoinIntroduction`),
 * so a PROMOTION that lands after that paint has to tell it. The founder's
 * ruling on the
 * confirmation moment (2026-08-06): the screen shows the INCUMBENT introduction
 * while the chain is being asked — that is what would actually be signed at
 * that instant, so the screen stays true — and switches once the newer link is
 * proven. Blanking it would flicker the money line.
 */
export const REFERRAL_PROMOTED_EVENT = "syndicate.referral.promoted";

function announcePromotion(): void {
  try {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event(REFERRAL_PROMOTED_EVENT));
  } catch {
    /* no event target — the next render picks it up anyway */
  }
}

/**
 * THE SAME ANSWER, REMEMBERING NOTHING — the render-phase read (2026-08-06).
 *
 * The join page needs this answer TWICE, with two different rights. At the first
 * paint it may only READ: React calls a `useState` initializer DURING RENDER, on
 * a pass it is free to discard, so writing there plants an arrival off a render
 * that may never have happened. After commit, in an effect, it may REMEMBER.
 *
 * So this is `resolveJoinIntroduction` minus the persist, and the RULE is not
 * re-derived here — both call `nextRememberedIntroduction`, and
 * `guard-referral-memory` EXECUTES both against the same fixtures asserting they
 * answer identically and that this one leaves the store byte-identical. A pure
 * read that drifted from the rule would paint one introduction while the
 * checkout signed another — worse than the flicker it exists to prevent.
 *
 * Why the first paint may not simply be blank: on a bare `/join` carrying a
 * remembered link, seeding from nothing paints an empty introduction that pops
 * in after commit. The founder ruled against that on 2026-08-06 — the strip
 * shows the incumbent introduction, because that is what would be signed at
 * that instant.
 */
export function peekJoinIntroduction(
  urlSource: string | null,
  urlVia: string | null,
): RememberedIntroduction | null {
  return nextRememberedIntroduction(readIntroduction(), urlSource, urlVia, false);
}

/**
 * THE ENTRY POINT for the whole arrival: the introduction this visit will use,
 * and the channel it was handed out on — remembering a new one on the way.
 */
export function resolveJoinIntroduction(
  urlSource: string | null,
  urlVia: string | null,
): RememberedIntroduction | null {
  const remembered = readIntroduction();
  // ⛔ UNCONFIRMED BY CONSTRUCTION. This path is the SYNCHRONOUS capture — it
  // cannot reach the chain, so it can never claim proof. Capture stays instant
  // (an honest arrival is never lost while the network is asked); proving it is
  // `confirmJoinIntroduction`'s job, and only proof outranks a proven memory.
  const next = nextRememberedIntroduction(remembered, urlSource, urlVia, false);
  if (next === null) return null;
  if (
    next.sourceId !== remembered?.sourceId ||
    next.via !== remembered?.via ||
    next.confirmed !== remembered?.confirmed
  ) {
    writeIntroduction(next);
  }
  return next;
}

/**
 * THE PROOF STEP (ruling ⓒ). Asks the chain — through our own read-only
 * endpoint — whether the link in the address bar really exists and is active,
 * and promotes it only if it does.
 *
 * Raw I/O lives here, matching `joinQuoteProbe`'s convention, and the validator
 * is INJECTABLE so the guard can execute this rule without a network.
 *
 * ⛔ FAIL-CLOSED ON PROMOTION, NEVER ON MEMORY. A refusal, a timeout, a 429, a
 * dead network — every one of them promotes NOTHING and ERASES NOTHING. The
 * held introduction is returned untouched. There is no path in this function
 * that can remove or downgrade a memory.
 */
async function validateAgainstRegistry(sourceId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/source/validate?sourceId=${encodeURIComponent(sourceId)}`,
      { method: "GET" },
    );
    if (!res.ok) return false;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return false;
    const b = body as Record<string, unknown>;
    // All three, and each must be a literal true — the endpoint is fail-closed
    // and reports `exists: null` when it could not read. Null is not proof.
    return b["chainVerified"] === true && b["exists"] === true && b["active"] === true;
  } catch {
    return false;
  }
}

export async function confirmJoinIntroduction(
  urlSource: string | null,
  urlVia: string | null,
  validate: (sourceId: string) => Promise<boolean> = validateAgainstRegistry,
): Promise<RememberedIntroduction | null> {
  // Nothing arrived worth proving — the memory answers, unchanged.
  if (urlSource === null || !isUsableSourceId(urlSource)) return readIntroduction();

  const held = readIntroduction();
  // Already proven, and it is this exact link: nothing to ask, nothing to write.
  if (held !== null && held.confirmed && held.sourceId.toLowerCase() === urlSource.toLowerCase()) {
    return held;
  }

  let confirmed = false;
  try {
    confirmed = await validate(urlSource);
  } catch {
    // ⛔ ABSORB, NEVER RETHROW. The caller is a fire-and-forget `void` in
    // App.tsx, so an escaping rejection is an unhandled one — and a promotion
    // that cannot be proven is simply not a promotion. No proof, no change.
    confirmed = false;
  }
  // Refused, or unreachable: promote nothing, erase nothing.
  if (!confirmed) return readIntroduction();

  // Re-read: the store may have moved while the network was answering.
  const current = readIntroduction();
  const next = nextRememberedIntroduction(current, urlSource, urlVia, true);
  if (next === null) return null;
  if (
    next.sourceId !== current?.sourceId ||
    next.via !== current?.via ||
    next.confirmed !== current?.confirmed
  ) {
    writeIntroduction(next);
    announcePromotion();
  }
  return next;
}

/**
 * The channel tag remembered FOR THIS EXACT SOURCE — never a loose tag.
 *
 * ⛔ Reading the tag independently of the source that actually applied credited
 * conversions to channels that never carried the buyer (review, 2026-08-05).
 * Two real paths: the engine drops the arriving link and auto-applies the
 * buyer's PREVIOUSLY recorded introduction, so the receipt names a different
 * source than the memory does; or a second tab opens a newer link mid-session.
 * Either way the beacon reported a (source, channel) pair that never existed —
 * the same defect the click beacon was just fixed to avoid.
 */
export function rememberedViaFor(sourceId: string): string | null {
  const held = readIntroduction();
  if (held === null) return null;
  return held.sourceId.toLowerCase() === sourceId.toLowerCase() ? held.via : null;
}

/**
 * Did this visit's introduction come from MEMORY rather than from the address
 * bar? The page uses it to say so — a buyer is never quietly attributed to
 * someone he cannot see on screen.
 */
export function isRecalledSource(urlSource: string | null, effective: string | null): boolean {
  if (effective === null) return false;
  // Same usability test as the rule itself — otherwise a `?source=0x000…000`
  // arrival counts as "came from the URL" while the memory is what was used.
  return urlSource === null || !isUsableSourceId(urlSource);
}
