// guard-type-scale.ts — THE READABILITY FLOOR, made structural. BLOCKING.
// ---------------------------------------------------------------------------
// THIS IS THE GUARD ADR-001 PROMISED ON 2026-07-16 AND NEVER GOT.
//
// THE AUTHORITY. ADR-001 amendment 2026-07-16, "LE PLANCHER DE LISIBILITÉ",
// written after the founder read the S7-b preview and said « des petits textes
// pas très lisibles, pas la bonne taille », and researched against A11Y
// Collective · Orange a11y · WebAIM · Section508. Its six type rules:
//   ① reading copy (sentences, notes, explanations, legal) ≥ 14px + leading-relaxed
//   ② labels / meta / provenance (one line, mono uppercase) ≥ 12px
//   ③ prose page body 16px+ (`type-body`)
//   ④ NOTHING user-visible under 12px — the arbitrary classes text-[9px] /
//     text-[10px] / text-[11px] are FORBIDDEN; the tokens outrank arbitrary sizes
//   ⑤ tile/KPI values ≥ 18px; card titles ≥ 16px
//   ⑥ links: visible affordance (colour + hover), never size alone
// This guard makes rule ④ — the FLOOR, the only one of the six a static scan can
// judge honestly — a RED BUILD. Read the "CANNOT SEE" section before assuming it
// covers the other five. IT DOES NOT.
//
// THE DEFECT. That same amendment, at its own lines 128-132, applied the rules to
// the /member composition, wrote the REST OF THE SITE down as an owed sweep, and
// promised « un guard `no-sub-12px-text` qui rendra le plancher structurel ». The
// guard was never written. Ten days later, 2026-07-26, a fresh count found 277
// sub-12px arbitrary classes across 57 files — 223 of them across 48 files on
// PUBLIC surfaces a stranger sees — including five at 8px. The founder's question,
// asked angrily and rightly: « et c'est quoi nos regles de design maintenant ??!! »
// The senior review's one-sentence diagnosis, which this file exists to answer:
// "the page passes every design law that has a guard behind it, and fails most of
// the laws that do not — that is not a coincidence, it is the diagnosis."
//
// THE NAMED SUB-DEFECT (why a base-class-only rule would have been decoration).
// StatusPill's `xs` variant rendered 9px and widened only to 10px at `sm:` — a
// responsive step that CAPPED BELOW THE FLOOR. A guard that reads only the base
// class sees `text-[9px]` there and calls it one violation; it never sees that the
// widening was also illegal. So this guard resolves the FULL utility token —
// variant chain included (`sm:` `lg:` `2xl:` `max-lg:` `hover:` `group-hover:`
// `dark:` `[&_code]:` `data-[state=open]:` …) — and judges every step on its own.
// StatusPill was fixed to the floor the same day; §⑤ pins it so it can never slide
// back, and its twin `components/tag/Tag.tsx` line 20 still carries the identical
// `text-[9px] sm:text-[10px]` shape as dated debt in the allowlist below.
//
// WHY THIS GUARD DOES NOT PIN TODAY'S SCALE. A separate workstream is producing a
// NEW type and spacing scale right now, because the founder judged the live page
// "barely readable on a 27-inch screen" and "too condensed". A guard that enshrined
// 141 occurrences of text-[10px] as correct would be RIPPED OUT by that slice
// instead of surviving it. So what is encoded here is the RULE and the FLOOR — a
// readability law, researched, that no scale change repeals — while every exception
// lives in the dated allowlist. FLOOR_PX is one named constant; the scale itself is
// nowhere in this file.
//
// THE TWO SEVERITIES, kept apart on purpose:
//   §① THE FLOOR (< 12px) — BLOCKING. This is the a11y violation.
//   §② OFF-SCALE AT ALL (≥ 12px arbitrary) — REPORT ONLY, never red in this first
//      version. An arbitrary size is off-scale by definition, but the 94 of them
//      counted on 2026-07-26 are load-bearing today (the receipt/ticket painters,
//      the referral panels, two vendored shadcn files) and the new scale has not
//      landed to replace them. Failing on them now would
//      force a hundred wrong choices in one afternoon. TO TURN THEM RED LATER:
//      land the new scale with a token per step, sweep these files onto tokens,
//      then flip FAIL_ON_OFF_SCALE to true — one word, and the second list becomes
//      a second floor. The count is printed at every build so the decision stays
//      in front of whoever reads it.
//   §③ CSS TOKENS — BLOCKING, counted and reported SEPARATELY, because a token is
//      ONE decision and a class is 277. ADR-001 line 124 names `--text-caption`
//      (then 11px) as "à réévaluer au sweep" and line 131 names `syn-label` /
//      `syn-caption` at 9-10px. All three have since been raised to 12px. The token
//      debt is therefore ZERO today, and this rule's job is to keep it there.
//
// ─── WHAT THIS GUARD CANNOT SEE (read this before trusting it) ───────────────
// A guard that overstates its own coverage teaches the next session to trust it
// past its edge. The honest limits:
//   · IT JUDGES ONE OF SIX RULES. Rules ①/③/⑤ (reading copy ≥ 14px, prose body
//     16px+, KPI ≥ 18px, card titles ≥ 16px) need to know what an element IS —
//     a sentence, a tile value, a card title. Nothing here knows that. Rule ⑥
//     (link affordance) is a colour/hover question, invisible to a size scan.
//     A page can be green here and still fail four of the six laws.
//   · IT ONLY SEES ARBITRARY SIZES. `text-xs` is 12px today and passes by name,
//     not by measurement. If the new scale redefines `text-xs` below 12px, or a
//     component sets `style={{ fontSize: 10 }}`, or a size arrives through a
//     `cva` variant assembled from fragments, or a `text-[length:var(--x)]`
//     resolves small at runtime — this guard is BLIND. It reads static tokens.
//   · REM ASSUMES A 16px ROOT. `text-[0.7rem]` is judged at 11.2px because
//     nothing in index.css overrides the root font-size (verified 2026-07-26).
//     Set `html { font-size: … }` and every rem verdict here silently shifts.
//   · `em` AND `%` ARE NOT JUDGED AT ALL. They are relative to the parent, which
//     no static scan knows. `[&_code]:text-[0.9em]` in Prose.tsx is counted in the
//     "unresolvable" bucket and reported, never failed. That bucket is a real hole:
//     an `em` size CAN render under 12px.
//   · A FILE IN THE ALLOWLIST IS FORGIVEN UP TO ITS CEILING, and the ceiling is
//     the only thing checked. The entry says "these N occurrences were judged
//     deferrable on this date"; it never says the file is readable, and it never
//     says the N are the same N.
//   · THE PUBLIC/ADMIN SPLIT IS A PATH HEURISTIC — `pages/admin/**` and
//     `components/admin/**` are ADMIN, everything else is PUBLIC. That is the
//     convention the 223/48 count used, and it deliberately counts nine
//     operator-gated files that sit OUTSIDE the admin/ path
//     (`components/referral/Admin*`, `operator/*`, `pages/Operator*` — 27
//     occurrences) as PUBLIC. The over-count leans the uncomfortable way on
//     purpose. Their allowlist reasons name what they really are.
//
// RUN: node scripts/guard-type-scale.ts

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");

// THE FLOOR. Not a scale value — a researched readability law (ADR-001 2026-07-16
// §4; WebAIM / A11Y Collective / Section508 all land on 12px as the practical
// minimum). The new type scale may move every step above this line; it does not
// move this line.
const FLOOR_PX = 12;

// rem → px. No `html`/`:root` font-size override exists in index.css (verified
// 2026-07-26), so the browser default holds. See CANNOT SEE.
const ROOT_PX = 16;

// §② is a REPORT, not a gate, until the new type scale lands. Flip to true in the
// same commit that finishes the token sweep — see "TO TURN THEM RED LATER" above.
const FAIL_ON_OFF_SCALE = false;

// ─── THE DEBT ───────────────────────────────────────────────────────────────
// Convention: "<ceiling> · <written reason>". The leading integer is the number of
// sub-12px occurrences forgiven in that file, counted from a real scan on
// 2026-07-26 — NOT copied from any prior tally. It is a CEILING, so it works as a
// ratchet in both directions: one MORE violation than the number reds the build
// (new debt in a deferred file), and FEWER prints a "debt paid, lower the number"
// note without ever punishing the slice that paid it. When a file reaches zero its
// entry is DELETED, and the atoms graduate into NO_ARBITRARY (§⑤).
//
// TOTALS AT LAST RECOUNT (2026-07-26, this guard's own scan):
//   277 occurrences across 57 files
//   PUBLIC  223 across 48 files   ← pages a stranger sees
//   ADMIN    54 across  9 files
//   worst single file: components/hero/HeroLedger.tsx (21)
//   by size: 8px×5 · 9px×26 · 9.5px×4 · 10px×141 · 10.5px×13 · 11px×83 · 11.5px×5
//   all five 8px occurrences are in components/hero/SeatFlowDiagram.tsx
// Every figure above was recounted by this guard's own scan before being written
// here (PRE-HANDOFF GATE §③), never copied from a prior tally.

const ALLOWLIST: Record<string, string> = {
  // ══ PUBLIC SURFACES — 223 occurrences across 48 files ══════════════════════
  // A stranger reads every one of these. This block is the uncomfortable one.

  // — the home hero composition: the densest debt on the site, and the first
  //   thing anyone sees. Owned by the type-scale slice, which rebuilds this
  //   composition's rhythm wholesale; patching sizes here before the new scale
  //   exists would be work done twice.
  "components/hero/HeroLedger.tsx": "19 · PUBLIC home hero. 2 eyebrow paid 2026-07-27 (§⑥). A THIRD was attempted and REVERTED after measuring it in the browser: the item label at the 12px floor needs 89px for the word MEMBERSHIP inside this card's 80px content box and spills 9px past it at `sm:grid-cols-3` (desktop only — mobile's 2-column grid was clean). Raising it needs WIDER CARDS, i.e. the recomposition this entry always reserved for the type-scale slice. The 2 held occurrences are that one label's 9px base and its `sm:` 10px step",
  "components/hero/SeatFlowDiagram.tsx": "11 · PUBLIC home hero — holds the five 8px occurrences, the smallest text on the site. Deferred to the type-scale slice; these five are its first target",
  "components/hero/ProtocolOverviewPanel.tsx": "8 · PUBLIC home hero panel — 1 eyebrow paid 2026-07-27 (§⑥); the rest deferred to the type-scale slice",
  "components/hero/HeroStatusChips.tsx": "2 · PUBLIC home hero chips — 1 eyebrow paid 2026-07-27 (§⑥); the rest deferred to the type-scale slice",
  "components/hero/HeroSeatLine.tsx": "2 · PUBLIC home hero seat line — deferred to the type-scale slice",
  "pages/PublicHome.tsx": "1 · PUBLIC home page shell — deferred to the type-scale slice (4 paid by the 2026-07-30 eyebrow conversion)",

  // — the season surfaces: designed 2026-07-23 against the season dossier, whose
  //   §0 rulings govern their composition. The sizes ride the type-scale slice so
  //   the dossier's geometry is re-read once, not twice.
  "pages/SeasonRanking.tsx": "8 · PUBLIC season board (the pride/vanity surface) — 2 eyebrow paid 2026-07-27 (§⑥) + 2 by the 2026-07-30 conversion; the rest deferred to the type-scale slice, read against the season dossier §0",
  "components/season/HomeSeasonSection.tsx": "7 · PUBLIC home season band — 1 eyebrow paid 2026-07-27 (§⑥) + 2 by the 2026-07-30 conversion; the rest deferred to the type-scale slice",
  "components/season/HomeRegisterBand.tsx": "2 · PUBLIC home register band — deferred to the type-scale slice (4 paid by the 2026-07-30 eyebrow conversion)",
  "components/season/EffortRewardCard.tsx": "1 · PUBLIC season card — deferred to the type-scale slice",

  // — the ATOMS. One fix in each clears many surfaces at once, which makes them
  //   the highest-leverage targets of the sweep and the first candidates to
  //   graduate into NO_ARBITRARY (§⑤). StatusPill already did, on 2026-07-26.
  "components/tag/Tag.tsx": "3 · ATOM (every tag on the site) — its `xs` variant still carries the exact `text-[9px] sm:text-[10px]` shape that was fixed in StatusPill the same day. Highest-leverage single fix; first target of the sweep",
  "components/amount/Amount.tsx": "5 · ATOM (money rendering) — deferred to the sweep; the figures themselves are pinned by guard-one-figure",
  "components/stat-card/StatCard.tsx": "2 · ATOM (KPI tiles) — deferred to the sweep; note ADR-001 §5 (KPI values ≥ 18px) is NOT checked by this guard",
  "components/data-table/DataTable.tsx": "1 · ATOM (tables) — a single 9px occurrence; deferred to the sweep",

  // — public chrome and truth surfaces
  "components/layout/PublicLayout.tsx": "3 · PUBLIC site chrome (header/footer, every page). RECOUNTED 2026-07-26: the brand tagline paid off its pair (a `text-[10px]` widening to a `sm:` step that capped at 11px, i.e. below the floor at EVERY width) and is now the `text-xs` token. Six sub-floor sizes remain in the chrome, deferred to the type-scale slice",
  "components/ProtocolReality.tsx": "8 · PUBLIC reality band — deferred to the general sweep",
  "components/ProtocolReservesBand.tsx": "4 · PUBLIC home reserves band — 2 eyebrow paid 2026-07-27 (§⑥), 1 more paid since, 1 by the 2026-07-30 conversion; the rest deferred to the general sweep.",
  "components/ProtocolAssetsCard.tsx": "4 · PUBLIC /contracts assets card — 2 eyebrow paid 2026-07-27 (§⑥), which ARE the founder's §(b)② finding \"ProtocolAssetsCard's 10px labels\"; the 4 left are 11px meta lines, deferred to the general sweep",
  "components/guide/SyndicateGuide.tsx": "2 · PUBLIC guide — deferred to the general sweep (4 paid by the 2026-07-30 eyebrow conversion)",
  "components/TeaserSurface.tsx": "2 · PUBLIC teaser surface — 1 eyebrow paid 2026-07-27 (§⑥); the rest deferred to the general sweep",
  "components/living/SectionIndex.tsx": "1 · PUBLIC section index — deferred to the general sweep (1 paid by the 2026-07-30 eyebrow conversion)",
  "components/living/LivingSignature.tsx": "1 · PUBLIC page signature — deferred to the general sweep",
  "components/registry/registryPosture.tsx": "2 · PUBLIC posture labels — deferred to the general sweep",

  // — public pages
  "pages/SystemStatus.tsx": "8 · PUBLIC status page — deferred to the general sweep (1 paid by the 2026-07-30 eyebrow conversion)",
  "pages/Liquidity.tsx": "5 · PUBLIC liquidity page — deferred to the general sweep (3 paid by the 2026-07-30 eyebrow conversion)",
  "pages/Docs.tsx": "1 · PUBLIC docs — a PROSE page; ADR-001 §3 (body 16px+) is NOT checked by this guard, so read this one by eye at the sweep (4 paid by the 2026-07-30 eyebrow conversion)",
  // pages/FireLedger.tsx entry DELETED 2026-07-26: CLEARED, zero sub-12px left —
  // its 11px banners and 10px row meta moved onto the named steps. The guard asked
  // for the deletion itself; a ledger that forgives a debt that no longer exists
  // stops describing the tree.
  "pages/JoinProtocol.tsx": "5 · PUBLIC join page (the conversion surface) — deferred to the general sweep",
  "pages/OsMap.tsx": "4 · PUBLIC OS map — deferred to the general sweep",
  "pages/ProtocolMap.tsx": "4 · PUBLIC protocol map — deferred to the general sweep",
  "pages/Learning.tsx": "1 · PUBLIC learning page — deferred to the general sweep (1 paid by the 2026-07-30 eyebrow conversion)",

  // — member surfaces: behind the sign-in wall, but a MEMBER is a user and the
  //   floor is a user law, not a visitor law. Counted PUBLIC.
  "wallet/SeasonStandingCard.tsx": "5 · MEMBER season standing card — deferred to the type-scale slice",
  "wallet/JoinCheckout.tsx": "2 · MEMBER checkout — money surface; ADR-001 line 131 named checkout in the owed sweep. Deferred (1 paid by the 2026-07-30 eyebrow conversion)",
  "wallet/SeasonQuestsCard.tsx": "2 · MEMBER quests card — deferred to the type-scale slice",
  "wallet/MemberWalletPanel.tsx": "1 · MEMBER wallet panel — a single 11px occurrence; deferred to the sweep",

  // — OPERATOR-GATED, but outside the admin/ path, so the path heuristic counts
  //   them PUBLIC. Named honestly here: they are consoles, not visitor pages, and
  //   they belong to the ADMIN sweep. 27 occurrences across 9 files.
  "components/referral/AdminOperatorsCrud.tsx": "9 · OPERATOR console (outside admin/ — counted PUBLIC by the path rule) — deferred to the admin sweep",
  "components/referral/AdminOperatorSurfaces.tsx": "5 · OPERATOR console (outside admin/) — deferred to the admin sweep",
  "components/referral/AdminModulesConsole.tsx": "2 · OPERATOR console (outside admin/) — deferred to the admin sweep",
  "components/referral/AdminReferralCrud.tsx": "2 · OPERATOR console (outside admin/) — deferred to the admin sweep",
  "components/referral/AdminReferralPanel.tsx": "2 · OPERATOR console (outside admin/) — deferred to the admin sweep",
  "operator/AccessStateSimulator.tsx": "3 · OPERATOR diagnostic tool (outside admin/) — deferred to the admin sweep",
  "operator/LiveEvidencePanel.tsx": "2 · OPERATOR diagnostic panel (outside admin/) — deferred to the admin sweep",
  "pages/OperatorOverview.tsx": "1 · OPERATOR overview (outside admin/) — deferred to the admin sweep",
  "pages/OperatorPreview.tsx": "1 · OPERATOR preview (outside admin/) — deferred to the admin sweep",

  // ══ ADMIN SURFACES — 54 occurrences across 9 files ═════════════════════════
  // The founder's own console. Same floor, same law — his eyes are eyes — but it
  // is one reader on known hardware, so it is sequenced AFTER the public sweep.
  "pages/admin/panels.tsx": "18 · ADMIN console panels — the worst admin file; deferred to the admin sweep",
  "pages/admin/memberLedger.tsx": "12 · ADMIN member register — deferred to the admin sweep",
  "pages/admin/SeasonsRails.tsx": "6 · ADMIN season rails — deferred to the admin sweep (2 paid by the 2026-07-30 eyebrow conversion)",
  "components/admin/AdminShell.tsx": "7 · ADMIN shell chrome (every admin page) — deferred to the admin sweep",
  "pages/admin/AdminHome.tsx": "3 · ADMIN home — deferred to the admin sweep",
  "pages/admin/BusinessBand.tsx": "2 · ADMIN business band — deferred to the admin sweep",
  "pages/admin/SourcePerformancePanel.tsx": "2 · ADMIN source performance — deferred to the admin sweep",
  "components/admin/ChroniclePrepare.tsx": "1 · ADMIN chronicle prep — deferred to the admin sweep",
  "pages/admin/sections.tsx": "1 · ADMIN section registry — deferred to the admin sweep",
};

// §⑤ — files where an arbitrary text size of ANY value is RED, floor or not.
// These are the atoms whose sizes cascade site-wide and which have been PROVEN
// clean, so the only possible next state is a regression. As the sweep clears
// each atom above, it moves OUT of ALLOWLIST and INTO this list — that is how the
// debt becomes a ratchet in both directions rather than a list that only shrinks
// on trust.
const NO_ARBITRARY: Record<string, string> = {
  "components/status-pill/StatusPill.tsx":
    "the named defect's home: `xs` rendered 9px and widened only to 10px at `sm:` — a responsive step that capped BELOW the floor. Fixed to a real scale step on 2026-07-26 (both variants on the 12px floor, separated by SHAPE not size). It may never carry an arbitrary size again, at any value.",
};

// §⑥ — THE EYEBROW IS ONE DECISION, NOT TWENTY-FIVE. BLOCKING.
//
// THE DEFECT (measured 2026-07-27, by this guard's own scan before this section
// was written). The site's section-label treatment — mono + uppercase + the
// 0.14em tracking that makes it read as an eyebrow — was hand-typed at 25 call
// sites across 18 files, and answered the SAME question SIX different ways:
//   9px×2 · 10px×8 · 11px×3 · 12px(text-xs)×10 · 14px(text-sm)×1 · 16px×1
// Thirteen of those 25 render BELOW the 12px floor, on public surfaces. Nobody
// decided that; it is what copy-paste produces. The founder's §(b)② finding
// "ProtocolAssetsCard's 10px labels" is two of the thirteen — and patching those
// two would have left eleven identical defects and the mechanism that makes more.
//
// THE RULE (CLAUDE.md ①, the TWIN SEARCH): a rule that lives in 2+ places is made
// ONE place and imported. The eyebrow now lives at `.type-eyebrow` in index.css,
// which reads `--text-caption` — so the floor moves it, not a typist. COLOUR stays
// a utility at the call site: 20 sites are muted, 4 foreground, 3 gold, and that
// IS a per-site decision. Size, family, weight, case and tracking are not.
//
// WIDENED 2026-07-30 — §⑥ now covers the by-BEHAVIOUR family, not one tracking
// value. The 2026-07-29 correction on this spot recorded the debt honestly (~38
// mono+uppercase labels on OTHER tracking values, including a public hero label
// at 8px/0.12em); this widening is the slice that closes it. An eyebrow is a
// BEHAVIOUR: mono + uppercase + wide tracking. The entry bar is 0.1em because
// Tailwind's own `tracking-widest` is exactly 0.1em — the named narrower steps
// (`wider` = 0.05em) and the 0.06–0.08em data-figure ring are letter-spaced
// FIGURES, not eyebrows, and stay out on purpose.
// WHAT THIS SECTION STILL CANNOT SEE: an eyebrow assembled at runtime, and a
// line whose `font-mono`/`uppercase` arrives from a PARENT element — the test
// is per-line, stated so a PASS is never read as more than it is.
// CLASS-CARRIED TWINS (2026-07-30 adversarial review): `.syn-eyebrow` was a
// LIVE second eyebrow class (0.2em) whose one call site rode invisibly under
// this section — behaviour carried by a class name defeats a utility scan. It
// is deleted; the detector now REDs the NAME, and the class-definition check
// below REDs its CSS coming back. `.syn-label` (0.16em, 5 sites) and
// `.syn-caption` (0.12em, 3 sites) are the remaining class-carried twins —
// at the 12px floor, so no readability violation, but still second answers to
// the tracking question; folding them is the type-scale slice's work, and
// they are named here so this PASS is never read as "one class everywhere".
const EYEBROW_SHAPE = /tracking-\[0\.14em\]/;
const TRACKING_ARBITRARY = /tracking-\[(0\.\d+)em\]/;
function isEyebrowShaped(ln: string): boolean {
  if (EYEBROW_SHAPE.test(ln)) return true;
  if (/\bsyn-eyebrow\b/.test(ln)) return true;
  if (!/\bfont-mono\b/.test(ln) || !/\buppercase\b/.test(ln)) return false;
  if (/\btracking-widest\b/.test(ln)) return true;
  const m = TRACKING_ARBITRARY.exec(ln);
  return m !== null && Number.parseFloat(m[1]!) >= 0.1;
}

// §⑦ — A READING PAGE READS AT THE PROSE SIZE. BLOCKING.
//
// ADR-001 rule ③ ("prose page body 16px+") is one of the five this guard's header
// says it does NOT judge — because judging it needs to know what an element IS.
// This section answers that for the one case where the answer is unambiguous: a
// page whose JOB is reading, and an element carrying `.measure`, the 68ch class
// that exists for nothing but a reading column.
//
// THE FOUNDER'S FINDINGS (§(b)②, both of them, measured 2026-07-27):
//   · "Terms/Risk/Privacy are one step SMALLER than every other reading surface"
//     — all three render their body at `text-sm` (14px) while `type-body` runs
//     16px→20px fluid. Six call sites.
//   · "/chronicle prose at 14px under 34px headings" — `text-sm` body under a
//     `type-h2` that caps at 2.15rem = 34.4px. His measurement was exact.
// The TWIN SEARCH found the shape is site-wide: 45 `.measure` columns exist and
// they render at type-body, text-sm, text-xs, text-[12.5px], text-base and
// text-lg. This section gates the READING PAGES — where a small body is
// unambiguously wrong — and REPORTS the rest, which is the same two-severity
// split §① and §② already use. Widening the gate is a later slice, not a
// silent one.
//
// WHY A POSITIVE RULE AND NOT A SIZE COMPARISON: requiring `type-body` needs no
// named-step table and no rem arithmetic, so it cannot drift when the scale
// moves — `type-body` reads `--text-body`, wherever that lands.
const READING_COLUMN = /\bmeasure\b/;
const PROSE_SIZE = /\btype-body\b/;

// Pages whose job is reading. Adding one here is a promise that every reading
// column on it carries the prose size.
const READING_SURFACES: Record<string, string> = {
  "pages/Terms.tsx": "the terms a member is asked to rely on",
  "pages/Risk.tsx": "the risk disclosure — the page it is least acceptable to make small",
  "pages/Privacy.tsx": "the personal-data page",
  "pages/ChronicleTeaser.tsx": "/chronicle — the protocol's written record, read end to end",
};

// Call sites where the eyebrow shape is DELIBERATELY not the eyebrow class, each
// with the reason. Convention matches ALLOWLIST: "<ceiling> · <written reason>".
// The integer is a CEILING — one more occurrence in that file reds the build, so
// an exemption cannot quietly grow.
const EYEBROW_EXEMPT: Record<string, string> = {
  "components/activity/LiveActivityFeed.tsx":
    "1 · NOT an eyebrow — it is the feed's DATE-GROUP HEADING (`text-sm`, 14px), a structural divider between days, and the comment above it records the defect that sized it: at 10px it read as the same 10px as the gap between two rows and the grouping vanished on screen. Shrinking it to the 12px eyebrow would restore that defect.",
  "wallet/ReceiptShareCard.tsx":
    "1 · NOT a surface — it is the satori-PAINTED share card, whose geometry is fixed pixel arithmetic against a 34px figure beside it (`TOTAL PAID` at 16px). Satori renders this to a bitmap; a fluid rem token would resolve against a root font size that does not exist inside the painter.",
  "components/ProtocolAssetsCard.tsx":
    "2 · ONE permanent + ONE convertible. Permanent: the asset ROW LABEL carries a bridged TICKER whose case is meaning — BTC.b and WETH.e are the canonical Avalanche-bridged symbols and the lowercase suffix IS the bridge marker; uppercased by the class, this row printed VAULT BTC.B beside a value reading 0.00077818 BTC.b (founder-caught 2026-07-29). Convertible: the 11px/0.1em section header the 2026-07-30 widening surfaced — pay it by converting to the class and lowering this ceiling back to 1 in the same commit.",
  "components/layout/PublicLayout.tsx":
    "1 · NOT an eyebrow — the header's BRAND TAGLINE (0.3em display tracking, gold, whitespace-nowrap), part of the header composition MEASURED at the 2026-07-28 slice: it returns at exactly 1700px, staggered above the 2xl cliff, at a measured 302px width. Re-tracking it to 0.14em moves that measured geometry. The file's two footer group titles DID convert (2026-07-30).",
  "components/layout/Shell.tsx":
    "1 · NOT an eyebrow — the operator console shell's BRAND WORDMARK (an h1 at text-sm). A wordmark is identity, not a section label; shrinking it to the caption size demotes the console's masthead.",
  "components/hero/HeroLedger.tsx":
    "7 · ONE permanent + SIX awaiting the founder's type-scale wireframe. Permanent: the hero ledger's ITEM LABEL, the only exemption here earned by MEASUREMENT — converted to the class, rendered, probed: at the 12px floor the word MEMBERSHIP needs 89px inside an 80px content box and hangs 9px out of its card at `sm:grid-cols-3` (desktop-only; mobile clean). Raising it needs wider cards — a COMPOSITION change the founder has not seen. The six others are the file's other-tracking family labels the 2026-07-30 widening surfaced, in the SAME geometry-bound composition, deferred with it; the wireframe slice pays all seven together.",
};

// THE EYEBROW-FAMILY DEBT — every hand-typed occurrence the WIDENED detector
// found on 2026-07-30, counted by its own RED run (74 across 38 files), never
// estimated. This is the "~38 labels on other trackings" prose note turned
// into ratcheted code — the prose said 38 because it counted only the
// sub-floor ones; the behaviour is hand-typed at every size and every copy is
// the same duplicated decision. Pay an entry by converting its file to
// `.type-eyebrow` (colour utility stays) and lowering the ceiling in the SAME
// commit; both directions and staleness are RED. The four hero files
// (SeatFlowDiagram · HeroSeatLine · HeroStatusChips · ProtocolOverviewPanel)
// are geometry-bound (fixed medallions, chip rows, 80px content boxes — the
// HeroLedger lesson) and wait for the founder's type-scale wireframe.
const EYEBROW_DEBT: Record<string, number> = {
  "components/hero/SeatFlowDiagram.tsx": 2,
  "components/hero/ProtocolOverviewPanel.tsx": 2,
  "components/hero/HeroStatusChips.tsx": 2,
  "components/hero/HeroSeatLine.tsx": 2,
};

// ─── the scan ───────────────────────────────────────────────────────────────

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(tsx|ts|css)$/.test(name)) out.push(p);
  }
  return out;
}
const rel = (p: string) => relative(SRC, p).split("\\").join("/");

// Tests, mockups, sandboxes and fixtures are not user-visible surfaces. None exist
// under src today (verified 2026-07-26) — the rule is here so the first one added
// is exempt by construction rather than by someone remembering.
const EXEMPT_RE = /(^|\/)(__tests__|__mocks__)\/|\.(test|spec|stories)\.[tj]sx?$|(^|\/)(mock|mocks|sandbox|fixtures?|playground)\//i;

// ADMIN by path convention — the convention the 223/48 count used. See CANNOT SEE.
const isAdmin = (r: string) => r.startsWith("pages/admin/") || r.startsWith("components/admin/");

/** A resolved length in px, or null when no static scan can know it. */
function toPx(raw: string): number | null {
  const v = raw.trim();
  // A fluid ramp's FLOOR is its clamp() minimum — that is the value a small
  // viewport actually renders, so that is the value the floor law judges.
  const clamped = /^clamp\(\s*([^,()]+)\s*,/.exec(v);
  if (clamped) return toPx(clamped[1]!);
  const m = /^(\d*\.?\d+)(px|rem|pt|em|%)?$/.exec(v);
  if (!m) return null; // var(), calc(), length:…, keywords
  const n = parseFloat(m[1]!);
  if (m[2] === "px") return n;
  if (m[2] === "rem") return n * ROOT_PX;
  if (m[2] === "pt") return n * (96 / 72);
  return null; // em / % / unitless — relative to the parent, see CANNOT SEE
}

type Hit = { token: string; value: string; px: number | null };

/**
 * Every arbitrary text-size utility on one line, with its FULL token so a
 * variant step (`sm:text-[10px]`) is judged on its own — the StatusPill lesson.
 * Walks back to the token boundary rather than pattern-matching the variant
 * chain, which keeps arbitrary variants (`[&_code]:`, `data-[state=open]:`)
 * intact instead of guessing at their grammar.
 */
function scanLine(line: string): Hit[] {
  const hits: Hit[] = [];
  for (const m of line.matchAll(/text-\[([^\]]+)\]/g)) {
    const at = m.index ?? 0;
    let start = at;
    while (start > 0 && !/[\s"'`{}(),;]/.test(line[start - 1]!)) start -= 1;
    const token = line.slice(start, at + m[0].length);
    // `text-[` must sit at a utility boundary: token start, a variant colon, or
    // the `!` important modifier. Anything else means it is the tail of another
    // identifier, not a font-size utility.
    const before = line.slice(start, at).slice(-1);
    if (before !== "" && before !== ":" && before !== "!") continue;
    hits.push({ token, value: m[1]!, px: toPx(m[1]!) });
  }
  return hits;
}

const isComment = (ln: string) => /^\s*(\/\/|\*|\/\*)/.test(ln);

let failures = 0;
const fail = (m: string) => {
  failures += 1;
  console.error(`  ✗ ${m}`);
};
const notes: string[] = [];

// ─── ① THE FLOOR — nothing user-visible under 12px. BLOCKING. ───────────────
const files = walk(SRC).filter((f) => !EXEMPT_RE.test(rel(f)));
const floorByFile = new Map<string, { line: number; token: string; px: number }[]>();
const offScale: { r: string; line: number; token: string; px: number }[] = [];
let unresolvable = 0;

for (const file of files) {
  const r = rel(file);
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((ln, i) => {
      if (isComment(ln)) return; // quoting a banned size in a comment is not a violation
      for (const h of scanLine(ln)) {
        if (h.px === null) {
          unresolvable += 1;
          continue;
        }
        if (h.px < FLOOR_PX) {
          const list = floorByFile.get(r) ?? [];
          list.push({ line: i + 1, token: h.token, px: h.px });
          floorByFile.set(r, list);
        } else {
          offScale.push({ r, line: i + 1, token: h.token, px: h.px });
        }
      }
    });
}

let forgiven = 0;
let forgivenPublic = 0;
let forgivenFiles = 0;
let worst = { file: "—", n: 0 };

for (const [r, hits] of [...floorByFile].sort((a, b) => b[1].length - a[1].length)) {
  const entry = ALLOWLIST[r];
  if (entry === undefined) {
    for (const h of hits) {
      fail(
        `${r}:${h.line} — \`${h.token}\` renders ${h.px}px, UNDER the ${FLOOR_PX}px readability floor. ` +
          `Nothing user-visible goes below ${FLOOR_PX}px: use a scale step (text-xs is the floor step) or a ` +
          `token (type-caption / type-label / syn-label), never an arbitrary size — and check the whole ` +
          `variant chain, a \`sm:\` step that caps under the floor is the same defect. ` +
          `ADR-001 amendment 2026-07-16 §4 (researched: WebAIM · A11Y Collective · Section508).`,
      );
    }
    continue;
  }
  const parsed = /^(\d+)\s*·\s*(\S.*)$/.exec(entry);
  if (!parsed) {
    fail(
      `ALLOWLIST["${r}"] does not follow the convention "<ceiling> · <written reason>" (got "${entry}"). ` +
        `The leading integer is the debt ceiling this guard ratchets against; without it the entry forgives ` +
        `an unbounded amount and stops being a debt counter.`,
    );
    continue;
  }
  const ceiling = Number(parsed[1]);
  if (hits.length > ceiling) {
    const added = hits.slice(ceiling).map((h) => `${h.line} (${h.token})`).join(", ");
    fail(
      `${r} — ${hits.length} sub-${FLOOR_PX}px occurrences, but this file is forgiven only ${ceiling}. ` +
        `NEW debt was added to a file already deferred (see lines ${added}). A deferred file may shrink or ` +
        `hold; it may never grow. Put the new text on a scale step, or pay some of the ${ceiling} down first. ` +
        `ADR-001 amendment 2026-07-16 §4.`,
    );
  } else if (hits.length < ceiling) {
    notes.push(
      `${r} — debt PAID: ${hits.length} left, ceiling still says ${ceiling}. Lower the number in this guard's ` +
        `ALLOWLIST (same commit), so it can never drift back up.`,
    );
  }
  forgiven += hits.length;
  forgivenFiles += 1;
  if (!isAdmin(r)) forgivenPublic += hits.length;
  if (hits.length > worst.n) worst = { file: r, n: hits.length };
}

// An allowlist entry with nothing left to forgive is stale debt. A vanished FILE is
// a lying allowlist — red, because a rename must carry its entry in the same commit.
for (const r of Object.keys(ALLOWLIST)) {
  if (!existsSync(join(SRC, r))) {
    fail(
      `ALLOWLIST names "${r}", which does not exist under src. A rename or deletion must move or remove its ` +
        `entry IN THE SAME COMMIT — otherwise the debt counter counts a file nobody can read.`,
    );
  } else if (!floorByFile.has(r)) {
    notes.push(`${r} — CLEARED (zero sub-${FLOOR_PX}px left). DELETE its ALLOWLIST entry; if it is an atom, move it into NO_ARBITRARY.`);
  }
}

// ─── ⑤ the atoms proven clean may never carry an arbitrary size again ───────
for (const [r, why] of Object.entries(NO_ARBITRARY)) {
  const p = join(SRC, r);
  if (!existsSync(p)) {
    fail(`NO_ARBITRARY names "${r}", which does not exist under src — the regression pin cannot be checked.`);
    continue;
  }
  if (r in ALLOWLIST) {
    fail(
      `"${r}" is in BOTH NO_ARBITRARY and ALLOWLIST. It cannot be forgiven and pinned at once — ${why}`,
    );
    continue;
  }
  readFileSync(p, "utf8")
    .split("\n")
    .forEach((ln, i) => {
      if (isComment(ln)) return;
      for (const h of scanLine(ln)) {
        fail(
          `${r}:${i + 1} — \`${h.token}\` is an ARBITRARY size in a file pinned to the scale. ` +
            `Any arbitrary value is red here, floor or not: ${why} Use a scale step or a token.`,
        );
      }
    });
}

// ─── ⑥ THE EYEBROW — hand-typed anywhere but the class is RED ───────────────
// The class must exist before the pin can mean anything: if `.type-eyebrow` is
// ever deleted from the CSS, every call site silently loses its size and this
// guard would go green on a site-wide regression. So the class is checked first.
const eyebrowClassDefined = files
  .filter((f) => f.endsWith(".css"))
  .some((f) => /^\s*\.type-eyebrow\s*\{/m.test(readFileSync(f, "utf8")));
if (!eyebrowClassDefined) {
  fail(
    "`.type-eyebrow` is not defined in any CSS file under src. It is the ONE place the site's " +
      "section-label treatment lives (mono · uppercase · 0.14em · the --text-caption floor); without it " +
      "every call site below renders unstyled and the §⑥ pin certifies nothing.",
  );
}
// The dead twin stays dead: a second eyebrow CLASS is the one shape a utility
// scan cannot see at the call site (2026-07-30 review — .syn-eyebrow rode a
// whole conversion arc invisibly).
const synEyebrowDefined = files
  .filter((f) => f.endsWith(".css"))
  .some((f) => /^\s*\.syn-eyebrow\s*\{/m.test(readFileSync(f, "utf8")));
if (synEyebrowDefined) {
  fail(
    "`.syn-eyebrow` is defined again in CSS. It was a live TWIN of `.type-eyebrow` (deleted " +
      "2026-07-30) and a class-carried eyebrow is invisible to the call-site scan — the eyebrow has " +
      "ONE class; extend `.type-eyebrow` instead of resurrecting the twin.",
  );
}

let eyebrowExempted = 0;
let eyebrowDebtForgiven = 0;
const eyebrowByFile = new Map<string, number>();
for (const file of files.filter((f) => /\.tsx$/.test(f))) {
  const r = rel(file);
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((ln, i) => {
      if (isComment(ln) || !isEyebrowShaped(ln)) return;
      eyebrowByFile.set(r, (eyebrowByFile.get(r) ?? 0) + 1);
      if (r in EYEBROW_EXEMPT) {
        eyebrowExempted += 1;
        return;
      }
      if (r in EYEBROW_DEBT) {
        eyebrowDebtForgiven += 1;
        return;
      }
      fail(
        `${r}:${i + 1} — the eyebrow treatment is hand-typed here (mono + uppercase + wide tracking, ` +
          `or the class's own 0.14em). It is ONE decision and it lives at \`.type-eyebrow\`: use the ` +
          `class and keep only the colour utility. Hand-typed, this shape answered one question six ` +
          `different ways across 18 files and put thirteen labels under the ${FLOOR_PX}px floor; the ` +
          `by-behaviour sweep then found ~38 more on other trackings, one of them 8px on the public hero.`,
      );
    });
}
for (const [r, why] of Object.entries(EYEBROW_EXEMPT)) {
  if (!existsSync(join(SRC, r))) {
    fail(`EYEBROW_EXEMPT names "${r}", which does not exist under src — move or remove its entry in the same commit.`);
    continue;
  }
  const ceiling = Number.parseInt(why, 10);
  const actual = eyebrowByFile.get(r) ?? 0;
  if (actual > ceiling) {
    fail(
      `${r} — ${actual} hand-typed eyebrow(s), above its ceiling of ${ceiling}. An exemption is for the ` +
        `case it names, never a licence for the file: ${why}`,
    );
  } else if (actual < ceiling) {
    // RED, not a note (2026-07-30 review): a notes-only paydown left the freed
    // slots pre-armed for the next hand-typed eyebrow — the same fossil class
    // the DEBT arm already fails on. Both ledgers now ratchet identically.
    fail(
      `${r} — ${actual} hand-typed eyebrow(s) against an exemption ceiling of ${ceiling}. ` +
        `Lower the ceiling (or delete the entry at zero) in this same commit — a spare exemption slot ` +
        `silently forgives the next hand-typed eyebrow in that file.`,
    );
  }
}
// The debt ratchet — both directions RED, staleness RED (the touch guard's
// fossil lesson, 2026-07-30): a paid file must lower its ceiling in the same
// commit, and an entry at zero must be deleted, or it silently forgives the
// next hand-typed eyebrow in that file.
for (const [r, ceiling] of Object.entries(EYEBROW_DEBT)) {
  if (!existsSync(join(SRC, r))) {
    fail(`EYEBROW_DEBT names "${r}", which does not exist under src — move or remove its entry in the same commit.`);
    continue;
  }
  const actual = eyebrowByFile.get(r) ?? 0;
  if (actual > ceiling) {
    fail(
      `${r} — ${actual} hand-typed eyebrow-family label(s), above its debt ceiling of ${ceiling}. ` +
        `The debt only shrinks: convert to \`.type-eyebrow\` — never add a copy.`,
    );
  } else if (actual < ceiling) {
    fail(
      `${r} — ${actual} hand-typed eyebrow-family label(s) against a debt ceiling of ${ceiling}. ` +
        `Good — lower the ceiling to ${actual} (delete the entry at zero) in this same commit so the ` +
        `payment cannot be silently undone.`,
    );
  }
}

// ─── ⑦ READING PAGES READ AT THE PROSE SIZE ─────────────────────────────────
let readingColumnsElsewhere = 0;
const readingFilesElsewhere = new Set<string>();
for (const file of files.filter((f) => /\.tsx$/.test(f))) {
  const r = rel(file);
  const pinned = r in READING_SURFACES;
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((ln, i) => {
      if (isComment(ln) || !READING_COLUMN.test(ln) || !/className/.test(ln)) return;
      if (PROSE_SIZE.test(ln)) return;
      if (!pinned) {
        readingColumnsElsewhere += 1;
        readingFilesElsewhere.add(r);
        return;
      }
      fail(
        `${r}:${i + 1} — a reading column (\`measure\`) on a READING PAGE that does not carry \`type-body\`. ` +
          `ADR-001 rule ③: prose page body is 16px+. ${READING_SURFACES[r]!} may not be set smaller than ` +
          `every other reading surface on the site — that is the founder's §(b)② finding, and \`type-body\` ` +
          `is where the site's other reading surfaces already are.`,
      );
    });
}
if (!existsSync(join(SRC, "components/prose/Prose.tsx"))) {
  fail("components/prose/Prose.tsx is gone — §⑦ compares reading pages against the prose treatment it defines.");
}

// ─── ③ CSS TOKENS — one decision each, counted apart from the 277 classes ───
// A token below the floor is worse than a class below it: it puts the violation
// one `@apply` away from every surface at once. Reported separately so the founder
// reads "the tokens are clean, the classes are not" and not one blended number.
let tokenSites = 0;
let tokenBad = 0;
for (const file of files.filter((f) => f.endsWith(".css"))) {
  const r = rel(file);
  readFileSync(file, "utf8")
    .split("\n")
    .forEach((ln, i) => {
      if (isComment(ln)) return;
      // `font-size: <v>` declarations AND `--text-*` custom properties (the two
      // ways this codebase names a type step). Deliberately narrow: a broad
      // number scan would swallow line-height and letter-spacing.
      for (const m of ln.matchAll(/(?:\bfont-size\s*:|--text-[a-z0-9-]+\s*:)\s*([^;{]+)/gi)) {
        tokenSites += 1;
        const px = toPx(m[1]!);
        if (px === null || px >= FLOOR_PX) continue;
        tokenBad += 1;
        fail(
          `${r}:${i + 1} — the type TOKEN \`${m[0]!.trim()}\` resolves to ${px}px, under the ${FLOOR_PX}px floor. ` +
            `A token is ONE decision that reaches every surface that uses it — raise it to the floor. ` +
            `ADR-001 amendment 2026-07-16 §4 already named --text-caption (11px) and syn-label/syn-caption ` +
            `(9-10px) as owed; all three were raised to 12px on the sweep and must stay there.`,
        );
      }
    });
}

// ─── ④ BEHAVIOUR — the matcher, tested against the shapes it must catch ─────
// The whole value of this guard is that it sees a variant step. Assert it, in
// process, on every build: a matcher that silently stops matching is decoration.
const CASES: [string, string, unknown, unknown][] = [
  ["a bare floor violation", 'className="text-[9px]"', scanLine('className="text-[9px]"').map((h) => h.px), [9]],
  // The named defect: base AND `sm:` step, both under the floor, judged separately.
  ["the StatusPill/Tag shape — both steps seen", "text-[9px] sm:text-[10px] uppercase", scanLine("text-[9px] sm:text-[10px] uppercase").map((h) => `${h.token}=${h.px}`), ["text-[9px]=9", "sm:text-[10px]=10"]],
  ["a 2xl step is a step too", "2xl:text-[11.5px]", scanLine("2xl:text-[11.5px]").map((h) => `${h.token}=${h.px}`), ["2xl:text-[11.5px]=11.5"]],
  ["a max-* variant", "max-lg:text-[10px]", scanLine("max-lg:text-[10px]").map((h) => h.px), [10]],
  ["an arbitrary variant", '[&_p]:text-[11px]', scanLine('[&_p]:text-[11px]').map((h) => `${h.token}=${h.px}`), ["[&_p]:text-[11px]=11"]],
  ["a data-attribute variant", 'data-[state=open]:text-[10px]', scanLine('data-[state=open]:text-[10px]').map((h) => h.px), [10]],
  ["the important modifier", "!text-[10px]", scanLine("!text-[10px]").map((h) => h.px), [10]],
  ["rem resolves against the root", "text-[0.7rem]", scanLine("text-[0.7rem]").map((h) => h.px), [11.2]],
  ["rem above the floor is not a floor violation", "text-[0.8rem]", scanLine("text-[0.8rem]").map((h) => h.px), [12.8]],
  ["a fluid ramp is judged at its clamp MINIMUM", "text-[clamp(0.6rem,1vw,2rem)]", scanLine("text-[clamp(0.6rem,1vw,2rem)]").map((h) => h.px), [9.6]],
  ["em is NOT judged (parent-relative — a real hole)", "[&_code]:text-[0.9em]", scanLine("[&_code]:text-[0.9em]").map((h) => h.px), [null]],
  ["a runtime var is NOT judged", "text-[length:var(--x)]", scanLine("text-[length:var(--x)]").map((h) => h.px), [null]],
  ["exactly at the floor is legal", "text-[12px]", scanLine("text-[12px]").map((h) => h.px! < FLOOR_PX), [false]],
  // Neighbouring arbitrary utilities that share the bracket grammar and must NOT
  // be mistaken for a font size — the false-positive class that would make this
  // guard un-runnable.
  ["a width is not a font size", 'className="max-w-[420px] min-h-[26px]"', scanLine('className="max-w-[420px] min-h-[26px]"').length, 0],
  ["tracking is not a font size", "tracking-[0.14em] leading-[10px]", scanLine("tracking-[0.14em] leading-[10px]").length, 0],
  ["a colour is not a font size", "text-[#ff0000]", scanLine("text-[#ff0000]").map((h) => h.px), [null]],
  ["a comment line is not code", "// text-[9px] is forbidden", isComment("// text-[9px] is forbidden"), true],
  ["a css block comment is not code", " * text-[8px]", isComment(" * text-[8px]"), true],
  ["a real class line is code", '  <p className="text-[9px]">', isComment('  <p className="text-[9px]">'), false],
  ["the css token reader resolves rem", "--text-caption: 0.6875rem", toPx("0.6875rem"), 11],
  ["the css token reader resolves a clamp min", "clamp(1rem, 2vw, 3rem)", toPx("clamp(1rem, 2vw, 3rem)"), 16],
  ["path exemption: a test file", "x.test.tsx", EXEMPT_RE.test("components/x.test.tsx"), true],
  ["path exemption: a sandbox dir", "sandbox/x.tsx", EXEMPT_RE.test("pages/sandbox/x.tsx"), true],
  ["a real surface is not exempt", "pages/PublicHome.tsx", EXEMPT_RE.test("pages/PublicHome.tsx"), false],
  ["admin classification", "pages/admin/panels.tsx", isAdmin("pages/admin/panels.tsx"), true],
  ["an operator console outside admin/ counts PUBLIC (documented over-count)", "components/referral/AdminOperatorsCrud.tsx", isAdmin("components/referral/AdminOperatorsCrud.tsx"), false],
];
for (const [label, input, got, want] of CASES) {
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    fail(`behaviour — ${label} [${input}]: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}.`);
  }
}

// ─── ② OFF-SCALE AT ALL (≥ floor) — reported, not gated (this version) ──────
const offByFile = new Map<string, number>();
for (const o of offScale) offByFile.set(o.r, (offByFile.get(o.r) ?? 0) + 1);
const offRanked = [...offByFile].sort((a, b) => b[1] - a[1]);

if (offScale.length > 0) {
  console.log(
    `[guard:type-scale] SECOND LIST — ${offScale.length} arbitrary text size(s) at or above the floor, ` +
      `across ${offByFile.size} file(s). Off-scale by definition, NOT a floor violation and NOT failing the ` +
      `build in this version (FAIL_ON_OFF_SCALE=false — the new type scale has not landed to replace them):`,
  );
  for (const [r, n] of offRanked) {
    const sizes = [...new Set(offScale.filter((o) => o.r === r).map((o) => o.px))].sort((a, b) => a - b);
    console.log(`    · ${String(n).padStart(3)}  ${isAdmin(r) ? "ADMIN " : "PUBLIC"}  ${r}  (${sizes.join("px, ")}px)`);
  }
  if (FAIL_ON_OFF_SCALE) {
    for (const o of offScale) {
      fail(
        `${o.r}:${o.line} — \`${o.token}\` (${o.px}px) is an ARBITRARY size, off the type scale. ` +
          `Use a scale step or a token. ADR-001 amendment 2026-07-16 §4 (tokens outrank arbitrary sizes).`,
      );
    }
  }
}

for (const n of notes) console.log(`[guard:type-scale] NOTE — ${n}`);

if (failures > 0) {
  console.error(
    `[guard:type-scale] ${failures} FAILURE(S). The ${FLOOR_PX}px readability floor is law on every surface — ` +
      `ADR-001 amendment 2026-07-16, promised as a guard that day and finally written 2026-07-26.`,
  );
  process.exit(1);
}

// THE DEBT COUNTER. Its whole job is to be uncomfortable at every build, and to
// state its own edges in the same breath — a guard that prints only what it caught
// teaches the reader it caught everything.
console.log(
  `[guard:type-scale] PASS — ${FLOOR_PX}px floor held on ${files.length - forgivenFiles} of ${files.length} files. ` +
    `DEBT: ${forgivenFiles} allowlisted file(s) forgiving ${forgiven} sub-${FLOOR_PX}px occurrence(s), ` +
    `${forgivenPublic} of them on PUBLIC surfaces a stranger sees; worst single file ${worst.file} (${worst.n}). ` +
    `Tokens: ${tokenSites} font-size/--text-* declaration(s) read in CSS, ${tokenBad} below the floor (a token is ONE decision — kept apart from the class debt on purpose). ` +
    `${offScale.length} arbitrary size(s) at/above the floor listed but NOT gated (flip FAIL_ON_OFF_SCALE when the new scale lands). ` +
    `${unresolvable} size(s) unresolvable statically (em/%/var — a real hole, see the header). ` +
    `${CASES.length} matcher behaviour cases green; ${Object.keys(NO_ARBITRARY).length} atom(s) pinned scale-only. ` +
    `EYEBROW (§⑥): one class, ${Object.keys(EYEBROW_EXEMPT).length} written exemption(s); the widened ` +
    `by-behaviour detector counts ${eyebrowDebtForgiven} hand-typed family label(s) as ratcheted debt across ` +
    `${Object.keys(EYEBROW_DEBT).length} file(s) (pay by converting to the class; ceilings two-way). ` +
    `PROSE (§⑦): ${Object.keys(READING_SURFACES).length} reading page(s) pinned to type-body; ` +
    `${readingColumnsElsewhere} reading column(s) across ${readingFilesElsewhere.size} OTHER file(s) render ` +
    `below it and are REPORTED, not gated — widening that gate is its own slice. ` +
    `NOT CHECKED: reading copy ≥14px, prose body 16px+, KPI ≥18px, card titles ≥16px, link affordance ` +
    `(ADR-001 rules ①③⑤⑥ — they need to know what an element IS), named steps like text-xs (trusted by name), ` +
    `inline style fontSize, and any size assembled at runtime.`,
);
