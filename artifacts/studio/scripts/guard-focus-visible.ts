// guard-focus-visible.ts — EVERY ACTIVATOR IS REACHABLE BY KEYBOARD AND SHOWS IT. BLOCKING.
// ---------------------------------------------------------------------------
// THE DEFECT (senior review, 2026-07-26). /activity — 1,309 lines across
// pages/Activity.tsx + components/activity/* — declared NOT ONE focus-visible
// style. `DESIGN_ROADMAP.md` ticks "states — hover / focus / disabled / empty /
// error" as done. It is not. The honest count on that surface, resolved through
// the atoms (see below), is FIVE bare activators, not thirteen:
//   · LiveActivityFeed.tsx:895  the facet chip — ONE mapped raw <button> that
//     renders all 13 chips, so every chip is bare
//   · LiveActivityFeed.tsx:918  the "More ▾ / Less ▴" chip toggle
//   · LiveActivityFeed.tsx:1053 the methodology <summary> (a native tab stop)
//   · LiveActivityFeed.tsx:733/740 the seat-history <Link> + a verify anchor
//   · MilestonesPanel.tsx:230   the sealed-milestones <summary>, :104 an anchor
// The review's "Re-read" and "Load more" buttons are in fact COVERED: both are
// the shadcn <Button> atom (ui/button.tsx), whose base class carries
// `focus-visible:ring-1 focus-visible:ring-ring`. Recording that correctly is
// half this guard's job — a guard that flagged all 65 <Button> call sites would
// be noise, and the next session would switch it off.
//
// THE AUTHORITY.
//   · ADR-001 §2/§3 — one semantic focus token: `--focus-ring → primitive.gold`.
//     Live today as `--ring: var(--gold-500)` in BOTH themes (src/index.css:76 and
//     :194), i.e. the utility `ring-ring` IS the house ring. The cyan-ring bug the
//     ADR was written to kill is fixed; what is missing is the ring being DECLARED.
//   · ADR-001 amendment 2026-07-16 (the readability floor, researched against
//     A11Y Collective / WebAIM / Section508) rule 6: "Liens : affordance visible
//     (couleur + hover, jamais la taille seule)". A focus indicator is the same
//     obligation for the keyboard: WCAG 2.4.7 Focus Visible (AA), 2.4.11 Focus
//     Not Obscured (AA), 1.4.11 Non-text Contrast (the indicator needs 3:1).
//   · FOUNDER RULING 2026-07-20 (his own screenshot shortcut lit :focus-visible
//     on a tab and drew "a floating rectangle"): a TAB's focus indicator is a
//     rounded background TINT, never an OFFSET boxing ring. The fix is recorded
//     verbatim at components/referral/MemberReferralDashboard.tsx:65-71 and
//     twinned at pages/admin/sections.tsx:182-184. §③ + §⑤ pin it in place.
//   · THE DIAGNOSIS this guard exists to answer: "the page passes every design
//     law that has a guard behind it, and fails most of the laws that do not —
//     that is not a coincidence, it is the diagnosis."
//
// THE STATE OF THE CODEBASE, reported so the sweep uses ONE ring and not fifteen.
// There is NO shared focus module. Four private, unexported constants each spell
// their own ring, and none of them agrees with the atoms:
//   · components/member/MemberShell.tsx:83     FOCUS_RING         ring-2 ring-gold/65 + ring-offset-2
//   · components/referral/MemberReferralDashboard.tsx:70 TAB_FOCUS_STYLE  bg-gold/10 tint (no ring)
//   · pages/admin/sections.tsx:183             SOURCES_TAB_FOCUS  bg-gold/10 tint (no ring)
//   · pages/Faq.tsx:27                         linkCls            ring-2 ring-ring
// plus components/prose/Prose.tsx:34, which rings every <a> in its subtree via
// `[&_a:focus-visible]:…`. The atoms use `ring-ring` (the semantic token); two of
// the constants use `ring-gold/65` (a primitive) — an ADR-001 §3 drift the sweep
// should collapse onto ONE exported constant built from `ring-ring`. This guard
// deliberately does NOT pin which one wins: a separate workstream is producing a
// new type/spacing scale, and a guard that pins today's exact ring values as
// eternal would have to be rewritten the day the scale lands. It pins the RULE
// (an activator declares a focus indicator) and the FLOOR (never strip the
// outline without replacing it), and carries the exceptions as dated debt.
//
// WHAT THIS GUARD CANNOT SEE — read this before trusting a green run.
//  ① COMPONENTS THAT SPREAD AN INTERACTIVE PROP. A component defined inside src
//     is treated as TRANSPARENT: its own DOM is scanned in its own file, so
//     `<KpiTile onClick=…>` is judged at wallet/MemberKpiRow.tsx, not at the call
//     site. That resolution is only as good as the component's own markup: if it
//     spreads `{...props}` onto a plain <div> with no literal onClick, NOTHING
//     here sees a tab stop. §⑥ closes the OTHER direction (an unknown
//     non-transparent component must be registered) but not this one.
//  ② RUNTIME. Tailwind class strings are read as text. A class arriving from a
//     helper call, an object lookup, a props chain or a cva variant this guard
//     does not resolve reads as absent. §⑤'s positive pins are the antidote:
//     they PROVE the shared carriers still carry their ring instead of assuming.
//  ③ A RING CLIPPED BY AN ANCESTOR. §③ catches an offset ring on a TAB and an
//     offset ring clipped by the element's OWN overflow. It cannot see an
//     ancestor's overflow, because that needs a DOM, not a regex. The live
//     suspect, recorded here rather than pretended away: MemberShell.tsx:177's
//     door chips carry FOCUS_RING (with `ring-offset-2`) inside the
//     `overflow-x-auto` strip at :168 — mild today (the strip has px-4/pb-2
//     breathing room) but it is the founder-caught class one edit away. The
//     sweep should move those chips to the tint idiom; only a rendered check can
//     confirm the clip.
//  ④ CONTRAST AND SIZE. Whether the gold ring actually reaches 3:1 against
//     `bg-card` (WCAG 1.4.11), and whether a hit target clears 44px (Apple HIG /
//     Material, ADR-001 bis rule 4), are rendered facts. Not visible here.
//  ⑤ FOCUS ORDER, focus TRAPS, and whether a modal returns focus on close.
//     Nothing static can answer those. The preview gate and a real keyboard can.
//  ⑥ `src/components/ui/**` IS NOT SWEPT. It is the vendored shadcn primitive
//     layer — the CARRIER layer, not an authoring surface, and its Radix roving
//     -focus idioms (`outline-none` + `data-[selected]`/`focus:bg-accent`) are the
//     library's own pattern. §⑤ pins each carrier's ring so that layer can never
//     silently lose one; §⑥ reds on the first app-code use of an unregistered one.
//
// THE LEDGER. Two debt lists, both printed at every build:
//   ALLOWLIST         — files with activators that declare no focus indicator.
//                       Each value BEGINS with the count in that file: the
//                       per-file RATCHET. A new bare activator → RED. Debt paid
//                       → also RED, telling you to lower the number in the same
//                       commit. The number can only ever shrink, and it is
//                       visible on every run.
//   OUTLINE_KILL_DEBT — the worst class (§②): the outline removed with NOTHING
//                       put back, so a keyboard user sees literally nothing.
//                       A file's presence in ALLOWLIST NEVER forgives this; it
//                       needs its own entry here, and this list exists to empty.
// Regenerating the ledger after a sweep commit, instead of hand-counting:
//   GUARD_FOCUS_LEDGER=1 node scripts/guard-focus-visible.ts
//
// Runs as: node scripts/guard-focus-visible.ts

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");
const UI = "components/ui/"; // the vendored primitive layer — see limit ⑥

// ── THE DEBT (§①) ───────────────────────────────────────────────────────────
// file (repo-relative to src) → "N · why". N is the number of activators in that
// file that declare no focus indicator and use no carrier — the per-file ratchet.
// Grouped by surface family so the founder's own surfaces are legible as a block.
// Recorded 2026-07-26 from a clean run; owed by the focus sweep the 2026-07-16
// ADR amendment already booked ("RESTE : le reste du site … + un guard").
// A recurring sub-class worth naming once, because the fix differs: `<Link>`
// wrapping a `<Button>` (pages/PublicHome.tsx:62 and friends). The Button rings,
// but the wouter anchor AROUND it is its own tab stop and rings nothing — so the
// keyboard gets two stops, one of them blind. The sweep's answer is the ring on
// the Link (or `asChild`), not a second ring on the Button.
const ALLOWLIST: Record<string, string> = {
  // ── PUBLIC surfaces — a visitor's keyboard. Highest priority of the sweep. ──
  // RATCHETED DOWN 5 → 3 (2026-07-26, the /activity rebuild): the feed row's
  // proof anchor became a real 112×44px button WITH the gold ring, in both the
  // internal-record <Link> and the explorer <a> variants — so the two row-level
  // stops the ledger was forgiving are PAID, not deferred. What remains is the
  // page chrome: the mapped facet-chip <button> (all 13 chips), the More/Less
  // toggle, and the methodology <summary>. The guard itself caught the stale
  // count, which is the whole point of a counter that must be recounted.
  // RATCHETED 3 → 2 (2026-07-26): the methodology <summary> became the
  // Disclosure atom, which declares its own gold focus ring. What remains is
  // the mapped facet-chip <button> (all 13 chips) and the More/Less toggle.
  "components/activity/LiveActivityFeed.tsx":
    "2 · the mapped facet-chip <button> (all 13 chips) and the More/Less toggle. The methodology summary and the row proof anchors were fixed 2026-07-26",
  // MilestonesPanel.tsx entry DELETED 2026-07-26: both activators it forgave
  // are now covered atoms — the sealed-record <summary> is the Disclosure and the
  // milestone verify <a> is the ProofAnchor, each declaring its own ring. The
  // ledger must describe the tree, so a debt that no longer exists is removed.
  "components/faq/FaqAccordion.tsx": "1 · the clear-search <button> inside the search box (the box itself rings via focus-within)",
  "components/guide/SyndicateGuide.tsx": "5 · the greeting bubble <button> (also the one OUTLINE-KILL below) + 4 guide <Link>s",
  "components/hero/HeroLedger.tsx": "1 · a ledger toggle <button> on the public home hero",
  "components/hero/ProtocolOverviewPanel.tsx": "3 · 2 route <Link>s + 1 explorer <a>",
  "components/hero/SeatFlowDiagram.tsx": "1 · the diagram's route <Link>",
  "components/layout/PublicLayout.tsx":
    "4 · the last 4 bare stops in the public chrome (3 <Link> + 1 <a>) — the header nav, mobile doors and footer sections already carry the gold ring, so this file is nearly clean and should finish first",
  "components/layout/Shell.tsx": "2 · 2 shell <Link>s",
  "components/receipt/PublicReceiptPanel.tsx": "1 · the public receipt's explorer <a>",
  "components/season/HomeRegisterBand.tsx": "2 · 2 season-register <Link>s on the public home",
  "components/season/HomeSeasonSection.tsx": "3 · 2 season <Link>s + 1 explorer <a>",
  "components/SurfaceMapSection.tsx": "1 · a surface-map <Link>",
  "components/TeaserSurface.tsx": "2 · 2 teaser <Link>s",
  "components/VerifyOnChain.tsx":
    "2 · both explorer anchors share the local `anchorClass` constant, which styles colour + hover but no focus state — one constant to fix, two call sites healed",
  "pages/Archive.tsx": "5 · 5 archive navigation <Link>s",
  "pages/ContractMemory.tsx": "2 · 2 contract-memory <Link>s",
  // pages/Docs.tsx entry DELETED 2026-07-30 (footer audit): its 3 card links
  // now carry the shared CONTENT_LINK_CLS ring constant (lib/contentLink.ts) —
  // the same one /faq's cards use; the guard itself demanded the deletion.
  // RESTORED 2026-07-26: the Founder reverted the ProofAnchor swap on this page
  // (the complaint was type size, not composition), so the bare verify <a> is back
  // and the ledger must describe the tree as it IS, not as I preferred it.
  "pages/FireLedger.tsx": "1 · the per-burn verify <a> on the Proof of Burn record",
  "pages/JoinProtocol.tsx": "6 · the checkout door — 1 <a>, 1 <summary>, 1 <button>, 3 <Link>. A money surface: high priority. (7 → 6 on 2026-07-28: the inline /status link went with the raw engine read the founder removed — debt paid by deletion, not by a fix.)",
  "pages/Learning.tsx": "3 · 3 Learn & Earn <Link>s",
  "pages/Liquidity.tsx": "1 · the pool's explorer <a>",
  "pages/not-found.tsx": "1 · the 404's way-home <Link>",
  "pages/OperatorOverview.tsx": "2 · 2 operator-overview <Link>s (public explainer, not the console)",
  "pages/OperatorPreview.tsx": "1 · the operator preview's <Link>",
  "pages/ProofDashboard.tsx": "4 · 4 proof <Link>s",
  "pages/ProtocolMap.tsx": "1 · a protocol-map <Link>",
  "pages/PublicHome.tsx": "5 · 5 hero/band <Link>s, several of them the Link-wrapping-Button sub-class described above. The most-visited page: sweep with the chrome",
  "pages/Recognition.tsx": "3 · 3 recognition <Link>s",
  "pages/SeasonRanking.tsx":
    "5 · the season board's 2 role=\"tab\" <button>s (they need the TINT idiom, never an offset ring — founder ruling 2026-07-20) + 3 explorer <a>s on the ranking rows",
  "pages/SourceAttribution.tsx": "4 · 1 <a> + 3 <Link> on the attribution page",
  "pages/SourceLinkBuilder.tsx": "3 · 3 <Link>s in the referrer link builder (2 paid 2026-07-31 — the /status pointer and the pitch link joined CONTENT_LINK_CLS)",

  // ── MEMBER surfaces — behind the sign-in wall; the founder's own cockpit. ──
  "components/member/ChronicleLatest.tsx": "1 · the chronicle card's <Link>",
  "components/member/MemberPulse.tsx": "2 · the pulse card's <Link> + 1 explorer <a>",
  "components/member/MemberQuickActions.tsx": "1 · a quick-action <Link>",
  "components/member/ProtocolSnapshot.tsx": "1 · the snapshot's <Link>",
  "components/referral/ActivationDoor.tsx": "3 · 2 <Link> + 1 <a> on the operator activation door",
  "components/referral/MemberReferralDashboard.tsx":
    "1 · one explorer <a>. NOTE: this file already holds TAB_FOCUS_STYLE — the founder's tab tint — so it is the natural home of the shared focus constant the sweep should export",
  "components/referral/NotificationComposerFields.tsx": "2 · 2 composer <button>s",
  "components/referral/ReferralCommissionsPanel.tsx": "7 · 6 <button> (filters/actions) + 1 <a> on the commissions panel (was 8; the share row's intent button moved into the ShareIntentIconButton atom, which carries the house ring — 2026-08-03)",
  "components/referral/ReferralIntroductionsPanel.tsx": "1 · an introductions <a>",
  "components/referral/ReferralLinkPanel.tsx": "3 · 2 copy/share <button>s + 1 <a>",
  "components/referral/ReferralOverviewPanel.tsx": "1 · an overview <Link>",
  "components/referral/ReferralToolsPanel.tsx": "7 · 6 <button> (the arsenal's copy/download actions, incl. the local CopyButton's own button) + 1 <a>",
  "components/referral/ShareCard.tsx": "2 · 1 share <a> + 1 <Link>",
  "components/referral/ShareMenu.tsx": "2 · 2 share-target <button>s",
  "pages/MemberAccess.tsx": "1 · the sign-in door's <Link>",
  "wallet/CapitalAxisCard.tsx": "3 · 2 <summary> expanders + 1 explorer <a> on the capital card",
  "wallet/HeroSeatCta.tsx": "1 · the seat CTA's <Link>",
  "wallet/JoinCheckout.tsx": "1 · one explorer <a> in checkout (the checkout buttons are the Button atom and already ring)",
  "wallet/JoinHistoricalGate.tsx": "1 · the historical gate's <a>",
  "wallet/MemberAttention.tsx": "2 · 2 attention-lane <Link>s",
  "wallet/MemberHeaderAffordance.tsx": "7 · 5 <Link> + 2 <a> in the member header affordance — chrome, so it should ride the PublicLayout sweep",
  "wallet/MemberKpiRow.tsx": "1 · the KPI tile's <Link> (inside the local KpiTile component)",
  "wallet/MemberNotificationsBell.tsx": "3 · the bell <button> + 2 <Link>s in the dropdown",
  "wallet/MemberNotificationsPanel.tsx": "3 · 2 <button> (mark-read / filters) + 1 <Link>",
  "wallet/MemberRecentActivity.tsx": "3 · 2 <Link> + 1 explorer <a>",
  "wallet/MemberSettings.tsx": "1 · a settings <Link>",
  "wallet/MemberWalletPanel.tsx": "1 · the wallet panel's <Link>",
  "wallet/MemberYourSeat.tsx": "5 · 2 <a> + 1 <button> + 2 <Link> on the seat panel",
  "wallet/PublicReceiptTicket.tsx": "2 · 1 <Link> + 1 explorer <a> on the public receipt ticket",
  "wallet/ReceiptsBinderPanel.tsx": "5 · 3 <button> (the binder's paging/actions) + 2 <a>",
  "wallet/ReceiptTicket.tsx": "2 · 1 <Link> + 1 <a> on the receipt ticket — a money document, high priority (was 5; the dual-share box's 3 buttons moved into ShareSurface, which carries the house ring — 2026-08-03)",

  // ── ADMIN + OPERATOR — the founder's console. Same law, lower blast radius. ──
  "components/admin/AdminShell.tsx": "3 · 3 console <Link>s (the shell's ⌘K trigger already rings)",
  "components/referral/AdminOperatorsCrud.tsx": "1 · one CRUD <button>",
  "operator/AccessStateSimulator.tsx": "1 · the access-state simulator's <button> (a dev/preview tool)",
  "pages/admin/AdminHome.tsx": "2 · 2 dashboard <button>s",
  "pages/admin/BusinessBand.tsx": "2 · 1 <button> + 1 <a> on the business band",
  "pages/admin/memberLedger.tsx": "7 · 5 <button> (the register's sort/filter controls) + 2 <a>",
  "pages/admin/panels.tsx": "4 · 1 <button> + 3 <Link> across the admin panels",
  "pages/admin/SeasonsRails.tsx": "1 · one explorer <a> on the seasons rail",
  "pages/admin/SourcePerformancePanel.tsx": "1 · one performance <button>",
  "wallet/ProposeSourceCreate.tsx": "6 · 3 <a> + 3 <button> on the chain-signing surface (the sign buttons themselves are the Button atom and ring)",
  "wallet/ProposeSourcePromotion.tsx": "1 · one explorer <a>",
};

// ── THE WORST CLASS (§②) ────────────────────────────────────────────────────
// Outline removed, nothing put back. NOT forgiven by ALLOWLIST — an entry here
// is a named, dated promise, and every run prints it by name.
const OUTLINE_KILL_DEBT: Record<string, string> = {
  "components/guide/SyndicateGuide.tsx":
    'the greeting bubble\'s "Open the Guide →" <button> (line 185) sets `focus-visible:outline-none` and stops there — ' +
    "the outline is taken away and nothing is put back, so a keyboard user tabbing onto it sees NOTHING. " +
    "The sibling dismiss <button> two lines above already does it right (outline-none + ring-2 ring-ring): " +
    "copy that class list. Recorded 2026-07-26 — this list exists to go to zero, and it is the one entry in it.",
};

// ── CARRIERS (§⑤) ───────────────────────────────────────────────────────────
// Capitalized components that provide the focus indicator THEMSELVES, so a call
// site needs none. Each value is "file :: the exact substring that proves the
// ring" — read by hand on 2026-07-26 and re-checked by this guard on every run,
// so the carrier layer can never quietly drop a ring under a green build.
// Radix-driven items legitimately use `focus:` rather than `focus-visible:`:
// Radix moves real DOM focus with the arrow keys, so `focus:` IS the keyboard
// indicator there.
const CARRIERS: Record<string, string> = {
  Button: "components/ui/button.tsx :: focus-visible:ring-1 focus-visible:ring-ring",
  AlertDialogAction: "components/ui/alert-dialog.tsx :: cn(buttonVariants(), className)",
  AlertDialogCancel: 'components/ui/alert-dialog.tsx :: buttonVariants({ variant: "outline" })',
  DropdownMenuItem: "components/ui/dropdown-menu.tsx :: focus:bg-accent focus:text-accent-foreground",
  Input: "components/ui/input.tsx :: focus-visible:ring-1 focus-visible:ring-ring",
  Textarea: "components/ui/textarea.tsx :: focus-visible:ring-1 focus-visible:ring-ring",
  Checkbox: "components/ui/checkbox.tsx :: focus-visible:ring-1 focus-visible:ring-ring",
  Switch: "components/ui/switch.tsx :: focus-visible:ring-2 focus-visible:ring-ring",
  Toggle: "components/ui/toggle.tsx :: focus-visible:ring-1 focus-visible:ring-ring",
  Slider: "components/ui/slider.tsx :: focus-visible:ring-1 focus-visible:ring-ring",
  RadioGroupItem: "components/ui/radio-group.tsx :: focus-visible:ring-1 focus-visible:ring-ring",
  SelectTrigger: "components/ui/select.tsx :: focus:ring-1 focus:ring-ring",
  SelectItem: "components/ui/select.tsx :: focus:bg-accent",
  CommandItem: "components/ui/command.tsx :: data-[selected=true]:bg-accent",
};

// Components that render a raw interactive DOM node and pass className STRAIGHT
// THROUGH without adding a ring. They are judged exactly like the element they
// render — the call site must declare the indicator itself.
const PASSTHROUGH: Record<string, string> = {
  Link: "wouter — renders a bare <a>, adds no class of its own",
};

// A carrier that rings its whole SUBTREE by descendant selector: every <a> (and
// every wouter <Link>, which renders an <a>) inside it is covered.
const DESCENDANT_CARRIERS: Record<string, string> = {
  Prose: "components/prose/Prose.tsx :: [&_a:focus-visible]:ring-2",
};

// Registered as REFUSED, not as covered: it HAS a ring, but an offset one on a
// tab — the exact shape the founder rejected. Using it must red the build at the
// point of entry, not be discovered later on a screenshot.
const REJECTED: Record<string, string> = {
  TabsTrigger:
    "the shadcn TabsTrigger rings with `focus-visible:ring-offset-2` — the OFFSET boxing ring " +
    "the founder rejected on tabs (2026-07-20). Use the tint idiom: see TAB_FOCUS_STYLE at " +
    "components/referral/MemberReferralDashboard.tsx:70.",
};

// ── plumbing ────────────────────────────────────────────────────────────────
function walk(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}
const rel = (p: string) => relative(SRC, p).split("\\").join("/");

// Comments are not code: a header that QUOTES a banned idiom must never trip the
// guard that bans it. Block comments (including JSX `{/* … */}`) are blanked to
// spaces so line numbers survive; whole `//` lines are emptied.
function stripComments(text: string): string {
  const noBlocks = text.replace(/\{?\/\*[\s\S]*?\*\/\}?/g, (m) => m.replace(/[^\n]/g, " "));
  return noBlocks
    .split("\n")
    .map((ln) => (/^\s*(\/\/|\*)/.test(ln) ? "" : ln))
    .join("\n");
}

// JSX opening tags, read with a small hand scanner rather than one regex: an
// attribute region holds nested braces, arrow bodies, template literals and `>`
// inside expressions, and a regex that tries to span all of that is the kind of
// half-truth this codebase gets bitten by. Quote- and brace-aware; stops at the
// first `>` outside both.
type Tag = { name: string; attrs: string; line: number; at: number };
function tags(text: string): Tag[] {
  const out: Tag[] = [];
  const NAME = /^<([A-Za-z][A-Za-z0-9_.]*)/;
  let line = 1;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "\n") { line += 1; continue; }
    if (text[i] !== "<") continue;
    const m = NAME.exec(text.slice(i, i + 80));
    if (!m) continue;
    let j = i + m[0].length;
    let depth = 0;
    let quote = "";
    let newlines = 0;
    while (j < text.length) {
      const c = text[j];
      if (c === "\n") newlines += 1;
      if (quote) { if (c === quote) quote = ""; }
      else if (c === '"' || c === "'" || c === "`") quote = c;
      else if (c === "{") depth += 1;
      else if (c === "}") depth -= 1;
      else if (c === ">" && depth === 0) break;
      j += 1;
    }
    out.push({ name: m[1]!, attrs: text.slice(i + m[0].length, j), line, at: i });
    line += newlines;
    i = j;
  }
  return out;
}

// A DECLARED focus indicator: a focus-visible: (or Radix's focus:) utility that
// is not merely the removal of the outline. Deliberately shape-agnostic — ring,
// tint, border, underline and outline-[…] all qualify, because the new type and
// spacing scale must be free to change what the indicator LOOKS like without
// rewriting this guard.
const DECLARES_FOCUS = /focus-visible:(?!outline-(?:none|hidden))[\w[-]|(?<![-\w])focus:(?!outline-(?:none|hidden))[\w[-]/;
// The outline killed — with or without the focus/focus-visible prefix.
const KILLS_OUTLINE = /(?:^|[\s"'`{])(?:focus(?:-visible)?:)?outline-(?:none|hidden)(?:$|[\s"'`}])/;
// A REPLACEMENT for a killed outline: any declared focus style, or a Radix data-
// state that paints the focused/selected row.
const REPLACES_OUTLINE = /data-\[(?:state|selected|highlighted|active)/;
// The width form of the ring offset (`ring-offset-2`), never the colour form
// (`ring-offset-background`) — only the width pushes the ring outside the box.
const OFFSET_RING = /focus(?:-visible)?:ring-offset-(?:\d|\[)/;
const TAB_SHAPE = /role=\{?"tab"|\bborder-b-2\b/;
const OWN_CLIP = /\boverflow-(?:hidden|clip)\b/;
const ROLE_INTERACTIVE = /role=\{?"(button|tab|link|menuitem|menuitemcheckbox|menuitemradio|switch|checkbox|radio|option|combobox)"/;
const TABINDEX = /tabIndex=\{?["']?(-?\d+)/;
const NATIVE_FORM = ["input", "select", "textarea"];

// ── the two file sets ───────────────────────────────────────────────────────
const constFiles = walk(SRC, [".ts", ".tsx"]);
const sweptFiles = walk(SRC, [".tsx"]).filter((f) => !rel(f).startsWith(UI));

let failures = 0;
const fail = (m: string) => {
  failures += 1;
  console.error(`  ✗ ${m}`);
};

// ── ⑤ POSITIVE PINS — the carriers this guard's coverage DEPENDS on ─────────
// Everything below counts an element as covered because one of these carries a
// ring. If a pin stops matching, the coverage claim is void — so a missing pin
// is a FAILURE, never a silent pass.
for (const [name, pin] of Object.entries(CARRIERS)) {
  const [file, proof] = pin.split(" :: ");
  let text = "";
  try { text = readFileSync(join(SRC, file!), "utf8"); } catch { /* reported below */ }
  if (!text) {
    fail(`carrier <${name}>: ${file} is unreadable — the registry no longer describes the tree. Re-read the atom and fix the pin.`);
  } else if (!text.includes(proof!)) {
    fail(
      `carrier <${name}> lost its focus ring: ${file} no longer contains "${proof}". ` +
        `Either the atom stopped declaring a focus indicator — in which case every one of its call ` +
        `sites is now a bare tab stop — or the class was reworded and this pin needs updating in the ` +
        `SAME commit. ADR-001 §2/§3 (one semantic focus token).`,
    );
  }
}
for (const [name, pin] of Object.entries(DESCENDANT_CARRIERS)) {
  const [file, proof] = pin.split(" :: ");
  const text = readFileSync(join(SRC, file!), "utf8");
  if (!text.includes(proof!)) {
    fail(
      `descendant carrier <${name}> lost its ring: ${file} no longer contains "${proof}". ` +
        `Every anchor inside <${name}> was counted as covered BECAUSE of that selector; ` +
        `without it the prose pages are full of bare links.`,
    );
  }
}
// The founder's tab fix, pinned where he made it: the tint, never an offset ring.
const TAB_TINT_PINS: [string, string][] = [
  ["components/referral/MemberReferralDashboard.tsx", "TAB_FOCUS_STYLE"],
  ["pages/admin/sections.tsx", "SOURCES_TAB_FOCUS"],
];
for (const [file, name] of TAB_TINT_PINS) {
  const text = readFileSync(join(SRC, file), "utf8");
  const decl = new RegExp(`const\\s+${name}\\s*=\\s*(?:\\n\\s*)?("(?:[^"\\\\]|\\\\.)*")`).exec(text);
  if (!decl) {
    fail(`${file} — the tab focus constant ${name} is gone. The founder's 2026-07-20 tab fix (a background TINT, never an offset ring) must stay declared here or move to a shared module and be re-pinned in this guard.`);
  } else if (!DECLARES_FOCUS.test(decl[1]!)) {
    fail(`${file} — ${name} no longer declares a focus indicator. A tab strip with no focus state is invisible to the keyboard (WCAG 2.4.7).`);
  } else if (OFFSET_RING.test(decl[1]!)) {
    fail(`${file} — ${name} now carries an OFFSET ring. The founder rejected exactly that on 2026-07-20 ("a floating rectangle around the active tab"): the tab indicator is a rounded background tint.`);
  }
}

// ── the constants that carry a ring, resolved file-locally then globally ────
// A className referencing one of these IS covered. Resolution is file-local
// first (a name means what it means where it is written) with `export const`
// promoted to a global fallback, so a shared focus module — which the sweep
// should create — works without touching this guard.
const CONST_RE =
  /(export\s+)?(?:const|let)\s+([A-Za-z_$][\w$]*)\s*(?::[^=\n]+)?=\s*(?:\n\s*)?("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g;
// name → the literal it holds, so §③ can ask whether a SHARED constant is the
// thing carrying the offset (MemberShell's FOCUS_RING does) instead of only
// seeing offsets spelled inline.
const localRingConsts = new Map<string, Map<string, string>>();
const exportedRingConsts = new Map<string, string>();
for (const file of constFiles) {
  const here = new Map<string, string>();
  for (const m of stripComments(readFileSync(file, "utf8")).matchAll(CONST_RE)) {
    if (!DECLARES_FOCUS.test(m[3]!)) continue;
    here.set(m[2]!, m[3]!);
    if (m[1]) exportedRingConsts.set(m[2]!, m[3]!);
  }
  localRingConsts.set(rel(file), here);
}

// Capitalized components defined in the SWEPT part of src are TRANSPARENT: their
// own DOM is judged in their own file (see limit ①). Components defined only
// under components/ui/ are NOT transparent — that layer is never swept — so they
// must be registered as a carrier, and §⑥ says so by name if they are not.
const transparent = new Set<string>();
for (const file of constFiles) {
  if (rel(file).startsWith(UI)) continue;
  for (const m of readFileSync(file, "utf8").matchAll(/(?:function|const|class)\s+([A-Z][\w$]*)/g)) {
    transparent.add(m[1]!);
  }
}

// ── the sweep (§① §② §③ §⑥) ─────────────────────────────────────────────────
let activators = 0;
let coveredOwn = 0;
let coveredConst = 0;
let coveredAtom = 0;
let coveredDescendant = 0;
const ledger = new Map<string, string[]>();

for (const file of sweptFiles) {
  const r = rel(file);
  const text = stripComments(readFileSync(file, "utf8"));
  const lines = text.split("\n");
  const ringConsts = new Map([...exportedRingConsts, ...(localRingConsts.get(r) ?? [])]);
  const namesUsed = (attrs: string) =>
    [...ringConsts].filter(([c]) => new RegExp(`(?<![\\w$])${c}(?![\\w$])`).test(attrs));
  const usesRingConst = (attrs: string) => namesUsed(attrs).length > 0;

  // subtree ranges of the descendant carriers present in this file
  const subtrees: [number, number][] = [];
  for (const name of Object.keys(DESCENDANT_CARRIERS)) {
    let from = 0;
    for (;;) {
      const open = text.indexOf(`<${name}`, from);
      if (open < 0) break;
      const close = text.indexOf(`</${name}>`, open);
      if (close < 0) break;
      subtrees.push([open, close]);
      from = close + 1;
    }
  }

  for (const t of tags(text)) {
    const lower = /^[a-z]/.test(t.name);
    const click = /\bonClick=/.test(t.attrs);
    const href = /\bhref=/.test(t.attrs);
    const role = ROLE_INTERACTIVE.exec(t.attrs);
    const tabIdx = TABINDEX.exec(t.attrs);
    const nativeForm = lower && NATIVE_FORM.includes(t.name);

    // Is this thing something a keyboard lands on?
    const interactive = lower
      ? t.name === "button" || t.name === "summary" || nativeForm || (t.name === "a" && href) ||
        click || !!role || (!!tabIdx && Number(tabIdx[1]) >= 0)
      : t.name in CARRIERS || t.name in PASSTHROUGH || click || href || !!role;

    // ── ② the worst class: the outline removed with nothing put back ────────
    // Checked on EVERY interactive element, native form fields included, and NOT
    // forgiven by ALLOWLIST — only by its own named entry in OUTLINE_KILL_DEBT.
    if (interactive && KILLS_OUTLINE.test(t.attrs)) {
      const replaced =
        DECLARES_FOCUS.test(t.attrs) || REPLACES_OUTLINE.test(t.attrs) || usesRingConst(t.attrs);
      // The legitimate exception: the element sits inside a wrapper that shows
      // the state for it (`focus-within:` on the label/box). Read from the 15
      // lines above — a wrapper, not an arbitrary distance. Honest limit: this
      // is proximity, not a parse tree.
      const wrapper = lines
        .slice(Math.max(0, t.line - 16), t.line)
        .some((ln) => /focus-within:(?!outline-(?:none|hidden))[\w[-]/.test(ln));
      if (!replaced && !wrapper && !(r in OUTLINE_KILL_DEBT)) {
        fail(
          `${r}:${t.line} <${t.name}> — the focus OUTLINE is removed and NOTHING replaces it. ` +
            `A keyboard user lands here and sees no change at all (WCAG 2.4.7 Focus Visible, AA). ` +
            `Either drop the outline-none, or pair it with a focus-visible: indicator in the SAME ` +
            `class list (the house ring is 'focus-visible:ring-2 focus-visible:ring-ring'), or let a ` +
            `'focus-within:' wrapper show the state. ADR-001 amendment 2026-07-16 (visible affordance).`,
        );
      }
    }

    // ── ③ an offset ring that clips ─────────────────────────────────────────
    // The offset may be spelled inline OR live inside a shared ring constant the
    // element references (MemberShell's FOCUS_RING is the live example).
    const offsetHere =
      OFFSET_RING.test(t.attrs) || namesUsed(t.attrs).some(([, v]) => OFFSET_RING.test(v));
    if (offsetHere) {
      if (TAB_SHAPE.test(t.attrs)) {
        fail(
          `${r}:${t.line} <${t.name}> — an OFFSET focus ring on a TAB. The founder caught exactly ` +
            `this on 2026-07-20: the offset ring "drew a floating rectangle around the active tab" ` +
            `the moment a key was pressed while it held click-focus. A tab's indicator is a rounded ` +
            `background TINT — copy TAB_FOCUS_STYLE (components/referral/MemberReferralDashboard.tsx:70). ` +
            `WCAG stays satisfied: tint + underline + weight is shape-and-colour, never colour alone.`,
        );
      } else if (OWN_CLIP.test(t.attrs)) {
        fail(
          `${r}:${t.line} <${t.name}> — an OFFSET focus ring on an element that clips its own ` +
            `overflow: the ring is drawn outside the box and then cut off, so the indicator is ` +
            `partly or wholly invisible (WCAG 2.4.11 Focus Not Obscured). Use a non-offset ring, ` +
            `an inset ring, or a background tint. (founder ruling 2026-07-20, the tab class.)`,
        );
      }
    }

    if (!interactive) continue;

    // ── ⑥ every capitalized interactive component must be RESOLVED ──────────
    if (!lower) {
      if (t.name in REJECTED) {
        fail(`${r}:${t.line} <${t.name}> — ${REJECTED[t.name]}`);
        continue;
      }
      if (t.name in CARRIERS) { activators += 1; coveredAtom += 1; continue; }
      if (!(t.name in PASSTHROUGH)) {
        if (transparent.has(t.name)) continue; // judged in its own file (limit ①)
        fail(
          `${r}:${t.line} <${t.name}> is interactive but this guard cannot tell whether it shows ` +
            `focus. It is defined neither in the swept part of src nor in this guard's registries. ` +
            `READ the component, then register it: in CARRIERS if it declares its own focus ` +
            `indicator (with the file :: proof substring), in PASSTHROUGH if it forwards className ` +
            `onto a bare interactive element, or in REJECTED if its indicator breaks a founder ruling. ` +
            `Silence is not coverage.`,
        );
        continue;
      }
    }

    // Native form fields are out of §①: the browser draws their own focus ring
    // and they carry a border state, so "no house ring declared" is not a defect
    // there. §② still guards them — killing that outline IS.
    if (nativeForm) continue;

    activators += 1;
    if (DECLARES_FOCUS.test(t.attrs)) { coveredOwn += 1; continue; }
    if (usesRingConst(t.attrs)) { coveredConst += 1; continue; }
    if ((t.name === "a" || t.name in PASSTHROUGH) && subtrees.some(([a, b]) => t.at > a && t.at < b)) {
      coveredDescendant += 1;
      continue;
    }
    const shape = lower
      ? t.name === "a" || t.name === "button" || t.name === "summary"
        ? `<${t.name}>`
        : role ? `<${t.name} role=${role[1]}>` : `<${t.name} onClick>`
      : `<${t.name}>`;
    const l = ledger.get(r) ?? [];
    l.push(`${t.line} ${shape}`);
    ledger.set(r, l);
  }
}

// ── §① the ratchet ──────────────────────────────────────────────────────────
const WHY =
  "declares no focus indicator and uses no carrier, so a keyboard user cannot see where they are " +
  "(WCAG 2.4.7 Focus Visible, AA). Add the house ring — 'focus-visible:outline-none " +
  "focus-visible:ring-2 focus-visible:ring-ring' — or, on a tab, the tint idiom. " +
  "ADR-001 amendment 2026-07-16, rule 6 (visible affordance) + the 2026-07-26 /activity review.";

let debtOccurrences = 0;
for (const [file, sites] of ledger) {
  const entry = ALLOWLIST[file];
  if (entry === undefined) {
    for (const s of sites) {
      const [line, shape] = s.split(" ");
      fail(`${file}:${line} ${shape} — ${WHY}`);
    }
    continue;
  }
  const budget = Number(/^(\d+)/.exec(entry)?.[1] ?? "-1");
  if (budget < 0) {
    fail(`ALLOWLIST["${file}"] must begin with the count of bare activators in that file (the ratchet), e.g. "3 · …". Got: "${entry}".`);
    continue;
  }
  if (sites.length > budget) {
    fail(
      `${file} — ${sites.length} activators declare no focus indicator, but the debt ledger allows ${budget}. ` +
        `NEW bare tab stop(s) added to an already-indebted file: ${sites.join(", ")}. ` +
        `Give the new element the house ring; the ledger number only ever goes DOWN.`,
    );
  } else if (sites.length < budget) {
    fail(
      `${file} — the debt ledger says ${budget} but only ${sites.length} remain: ${budget - sites.length} paid off. ` +
        `Lower ALLOWLIST["${file}"] to "${sites.length} · …" in the SAME commit (delete the entry at 0). ` +
        `A debt counter that is not recounted stops being a counter.`,
    );
  }
  debtOccurrences += sites.length;
}
// An allowlist entry with nothing left to forgive is a fossil.
for (const file of Object.keys(ALLOWLIST)) {
  if (!ledger.has(file)) {
    fail(`ALLOWLIST["${file}"] forgives a debt that no longer exists (0 bare activators found). DELETE the entry — the ledger must describe the tree.`);
  }
}

// ── the ledger regenerator (see the header) ─────────────────────────────────
if (process.env.GUARD_FOCUS_LEDGER) {
  console.log("\n// ── regenerated ledger — paste into ALLOWLIST, then write a real reason on each line ──");
  for (const [file, sites] of [...ledger].sort(([a], [b]) => a.localeCompare(b))) {
    const kinds = new Map<string, number>();
    for (const s of sites) {
      const k = s.split(" ").slice(1).join(" ");
      kinds.set(k, (kinds.get(k) ?? 0) + 1);
    }
    const summary = [...kinds].map(([k, n]) => `${n}×${k}`).join(", ");
    console.log(`  "${file}": "${sites.length} · ${summary} — REASON",`);
  }
}

const outlineDebt = Object.keys(OUTLINE_KILL_DEBT);
if (failures > 0) {
  console.error(
    `[guard:focus-visible] ${failures} FAILURE(S). Every activator is reachable by keyboard and SHOWS it.`,
  );
  process.exit(1);
}
for (const [file, why] of Object.entries(OUTLINE_KILL_DEBT)) {
  console.log(`[guard:focus-visible] OUTLINE-KILL DEBT — ${file}: ${why}`);
}
// The PASS line has to ADD UP, or it is a story. covered + debt === activators.
const covered = coveredOwn + coveredConst + coveredAtom + coveredDescendant;
console.log(
  `[guard:focus-visible] PASS — ${activators} activators judged across ${sweptFiles.length} swept files; ` +
    `${covered} RESOLVED AS COVERED (${coveredOwn} declare their own focus-visible utility · ` +
    `${coveredConst} via a shared ring constant · ${coveredAtom} via a shared atom from the ` +
    `${Object.keys(CARRIERS).length}-entry carrier registry · ${coveredDescendant} via a descendant ` +
    `carrier), every carrier PROVEN to still declare its ring; DEBT = ${debtOccurrences} bare ` +
    `activators in ${Object.keys(ALLOWLIST).length} allowlisted files (the per-file ratchet held) ` +
    `+ ${outlineDebt.length} outline-kill${outlineDebt.length === 1 ? "" : "s"} named above; ` +
    `${covered} + ${debtOccurrences} = ${activators}. No offset ring on a tab or on a self-clipping ` +
    `element; every capitalized interactive component resolved to a registry entry or to its own file. ` +
    `NOT CHECKED: native <input>/<select>/<textarea> under §① (they keep the browser's own ring — ` +
    `§② still guards them), ring CONTRAST and hit-target SIZE (rendered facts), focus ORDER and traps, ` +
    `a ring clipped by an ANCESTOR's overflow, class strings assembled at runtime, a component that ` +
    `SPREADS an interactive prop onto a plain element, and components/ui/** (the vendored carrier ` +
    `layer — pinned by §⑤, not swept).`,
);
