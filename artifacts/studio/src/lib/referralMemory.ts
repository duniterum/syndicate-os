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
  // A valid arrival always wins — LAST TOUCH (his ruling ⓑ).
  if (arriving !== null && isUsableSourceId(arriving)) return arriving;
  // A mangled, ZERO or absent arrival NEVER destroys a good memory: that would
  // be the same silent theft in a new costume (someone shares a truncated link,
  // or types ?source=0x000…000, and the referrer who actually earned the visit
  // loses it).
  if (remembered !== null && isUsableSourceId(remembered)) return remembered;
  return null;
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
    if (window.top !== window.self) return;
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
 * returns the same answer, so it is safe inside a render-time memo.
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
): RememberedIntroduction | null {
  if (arrivingSource !== null && isUsableSourceId(arrivingSource)) {
    // A new link replaces BOTH halves. Its own tag, or none — never the old one.
    return { sourceId: arrivingSource, via: normalizeVia(arrivingVia) };
  }
  if (remembered !== null && isUsableSourceId(remembered.sourceId)) return remembered;
  return null;
}

function readIntroduction(): RememberedIntroduction | null {
  const raw = readStore();
  if (raw === null) return null;
  // Tolerates the source-only value an earlier build wrote.
  if (!raw.startsWith("{")) return isUsableSourceId(raw) ? { sourceId: raw, via: null } : null;
  try {
    const parsed = JSON.parse(raw) as { s?: unknown; v?: unknown };
    if (typeof parsed.s !== "string" || !isUsableSourceId(parsed.s)) return null;
    return { sourceId: parsed.s, via: typeof parsed.v === "string" ? normalizeVia(parsed.v) : null };
  } catch {
    return null;
  }
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
  const next = nextRememberedIntroduction(remembered, urlSource, urlVia);
  if (next === null) return null;
  if (next.sourceId !== remembered?.sourceId || next.via !== remembered?.via) {
    writeStore(JSON.stringify({ s: next.sourceId, v: next.via }));
  }
  return next;
}

/** The channel tag this visit's introduction arrived on, from the ONE home. */
export function rememberedVia(): string | null {
  return readIntroduction()?.via ?? null;
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
