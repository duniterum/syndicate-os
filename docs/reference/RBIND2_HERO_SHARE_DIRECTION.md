# R-BIND-2 — THE HERO RAIL + DUAL SHARE DIRECTION (founder orders 2026-07-19)

**Provenance.** Founder orders on the live binder (2026-07-19): the 4-5 open-tickets hero designed
for the future, mobile-adapted; the native share sheet KEPT but RENAMED + the referral network
menu added; the rotating link-preview idea answered factually. Built by the 5-lens research
workflow `wf_a0c4cdce-90c` (Google Wallet/Apple Wallet/NN-g/Baymard rails · YouTube-Music/Spotify
dual-share naming · X/WhatsApp/Facebook OG cache mechanics · Stripe receipt pages · the repo
constraint lens). **Durable — never re-search.** The mockup: `docs/design/receipts-hero-share-mockup.html`.
Founder approval of the mockup gates the build; /receipt/{txHash} + the rotation ride their own
engraved slices (§3-§4).

---

# R-BIND-2 — THE ONE DIRECTION (synthesis of 5 lenses)

Decisive verdicts. One recommendation per question. Founder-facing words are human throughout.

---

## §1 THE HERO RAIL VERDICT

**The architecture (settled by the evidence): a capped shelf of the 5 most-recent receipts fully open, newest first at position 1 — the binder below absorbs the hundreds forever.** This is exactly where Google Wallet's 2026 redesign landed (curated set on top + browsable archive below, 9to5Google) and it sits precisely on NN/g's empirical ceiling (users abandon carousels after 3–4 steps; ≤5 frames). The hero mounts at most 5 tickets no matter how large the archive grows — "designed for hundreds" is solved at the data layer, not with a longer rail. An explicit "All receipts (N)" bridge sits under the rail; no receipt is ever reachable only by paging the hero (Baymard req. 2).

**Desktop:** as many full open tickets as fit, as a **static row — no rail chrome when nothing overflows** (Baymard's desktop-scroll-strip caution + NN/g horizontal-scroll findings both convict building a scroll strip you don't need). At 1280px that's 3 open tickets (340px paper + gaps); 4–5 at wider. When the capped set overflows the viewport: rail with **always-visible paired arrows** (never hover-only — NN/g), a real cut-off partial ticket at the edge as the continuation cue, single-step navigation, `scroll-snap-stop: normal` (mouse users aren't trapped stepping one-by-one).

**Mobile (375px, the founder-allowed adaptation):** one open ticket per viewport, `scroll-snap-align: center`, **`scroll-snap-stop: always`** — boarding-pass discipline: one swipe, one receipt, a fling can never blow past documents (MDN; the Alaska/United pattern for documents that must be USED). Real peek of the next ticket's edge (~16–24px of actual paper, never a gradient fade — the one affordance NN/g proved works), page gutters so swipes stay off the iOS back-gesture edge, a **counter "2 of 5"** (dots are "a particularly poor cue on mobile" — NN/g) plus small prev/next buttons BELOW the rail (fingers don't cover the paper; drag-only is inaccessible — Smashing/W3C). `overscroll-behavior-x: contain` so the rail end never chains into page scroll.

**N=1 / N=2 — no rail theatre:** one receipt = one centered open document, ZERO chrome — no scroll container, peek, counter, or arrows, all conditionally unrendered (out of the DOM, not visually hidden). N=2 desktop = two tickets side by side, still no chrome; N=2 mobile = the rail with "1 of 2". Chrome earns its existence only when overflow exists.

**Performance discipline:** cap N architecturally first (the hero never mounts a 6th ticket); `content-visibility: auto` + exact `contain-intrinsic-size` on off-viewport rail tickets (the fixed 340px geometry makes this free of layout jumps — web.dev measured 7×); defer QR generation until near-viewport via IntersectionObserver; animate transform/opacity only; virtualization belongs to the binder list later, never the shelf.

**A11y (W3C APG):** rail as `<ul>`/`<li>`; container `role="region"` + `aria-roledescription="carousel"` + label "Your latest receipts"; each ticket a group named by its real identity ("Receipt — [source], [date]", position naming sanctioned); arrow keys move between tickets; prev/next buttons never steal focus; offscreen interactive content `inert` — never half-hidden; `prefers-reduced-motion` drops smooth-scroll animation, same layout. No autorotation exists in this design, period.

**Repo anchor:** the rail mounts inside `BinderBody` in `artifacts/studio/src/wallet/ReceiptsBinderPanel.tsx` (between the record header, ends line 228, and the month groups, line 238 — with the header compacted to one line so the page opens ON the tickets, Work-First law). Everything added there is scanned by `guard-receipt-ticket.ts` pins (RED_LINE words, buyer's-tongue literals, no amount arithmetic, no truncate in ticket literals) — the rail copy and code must stay green.

---

## §2 THE SHARE BLOCK VERDICT

**Composition — one Share button in Zone G opens ONE dual surface** (mobile: bottom sheet with drag handle; desktop: anchored popover), containing in strict order:

1. **Copy link — first, always, primary** with a confirmed "Copied" state (the Coinbase-praised pattern; the only action that works on 100% of platforms).
2. **Network row — six labeled icon tiles, order: X → WhatsApp → Telegram → LinkedIn → Facebook → Email.** (Crypto-native audience skews X + messaging; Email last — mailto dead-ends webmail users, CSS-Tricks.) This REORDERS the render of the existing `artifacts/studio/src/lib/shareTargets.ts` list (its current order is x, facebook, whatsapp…) — reuse the module's URLs and labels verbatim, reorder at the menu, don't fork the intents. Actions bracket the networks (iOS sheet stratification): Copy first, OS trigger last, never a Copy tile mixed among network tiles.
3. **The renamed native trigger — a full-width button, last.**

**THE LABEL: "Share with other apps."** This is Google's own label for exactly our case — YouTube Music's redesigned share sheet has precisely two primaries, "Copy link" and "Share with other apps," the second opening the system sheet. Self-describing, honest, human. **Alternates: "Other apps"** (short form if it must fit a tile) and **"More" (⋯, labeled)** — acceptable only as the terminal tile of the network row, ambiguous as a standalone button. Rejected: "Share via…" (chooser-era jargon), any bare glyph (the iOS share icon recognition-tests as "download" — every icon gets a label).

The full-width variant (not a tail tile) is right for us: the founder likes the OS sheet, and it honestly IS the richest option — **it is the only channel that can carry the ticket PNG itself** (Web Share Level 2 files; every network intent is text/URL only). The button copy can carry a one-line subtitle in the sheet: "Sends the ticket image too."

**Desktop-Windows reality (the inversion):** show the native button **only when `navigator.share` feature-detects true** (+ `navigator.canShare({files})` for the image claim). On Windows Chromium it exists but the sheet lists Microsoft-Store apps only (Mail, Phone Link — no social networks); on Firefox and Linux Chrome it doesn't exist at all. So on desktop, **Copy link + the network row lead; the native button appears last when real, disappears when absent** — never a dead button, never a faked lookalike sheet. (web.dev: use Web Share when available, custom UI as the fallback; Spotify desktop reached the same conclusion — Copy Link only, no OS sheet.)

**What each network tile can actually carry (hard truth table — build nothing that pretends otherwise):** X = text + URL; WhatsApp = one text field (URL inside it); Telegram = URL + editable draft text (the user-in-control model); **Facebook and LinkedIn = URL ONLY** — every text param is ignored, the unfurl comes 100% from the link's preview tags; Email = plain subject + body. **No network intent can attach an image.** The picture travels two ways only: the native sheet (the PNG file) and the link's preview card (§3). Instagram stays omitted — no web intent exists; a tile would be a broken promise. No share counters, no prefilled hype — the draft text stays the current honest form (coordinate + sealed-proof link), user-editable.

**Repo anchors:** reuse `ShareMenu.tsx`'s popover mechanics + `shareTargets.ts` intents; rework `handleShare` in `ReceiptTicket.tsx` (lines 177–229) into the dual surface — and fix the known gap while there: today if the card PNG builds but `canShare({files})` is false, NO native sheet is attempted (it skips straight to download+clipboard); the rework should attempt text-only `navigator.share` in that case. Share-link pins bind: exactly ONE `join?source=` construction site, `referralLink` passed down never rebuilt, card mounts only with a resolved link.

---

## §3 THE LINK STORY

**What Copy link copies THIS slice: the explorer proof link (txUrl), unchanged.** It's the one URL that works for anyone, forever, with zero new infrastructure — and it is the honest state of today. The known cost, stated plainly: Snowtrace ships ZERO preview metadata (observed live — its page head has no og: tags at all), so a copied link pasted into X or WhatsApp unfurls as a bare domain. Today the VISUAL travels as the 1200×630 ticket PNG through the native sheet and Save image; the link is the proof, not the poster.

**The per-receipt public page `/receipt/{txHash}` — feasible on our layer, but it is a real slice, not a rider.** The repo lens is unambiguous: `serve.mjs` resolves exact paths + a literal route table with a hard "NO SPA fallback / unknown → real 404" invariant and no wildcard or prefix matching anywhere; the SEO registry documents "the app has no dynamic/param routes today"; prerender bakes one flat shell per literal route. Introducing the page touches FOUR coordinated layers (App.tsx router, registry + matchRoute param awareness, prerender, serve.mjs route mechanism) plus the pin-10 amendment — whose failure message already carries the exact instruction: "amend this pin, dated, at the /receipt/{txHash} slice." And the roadmap engraved in `protocolCommerceReceipt.ts:28–32` already names it NEXT in order, with the dedicated PDF engine riding it. The direction is set; the slice exists; this mockup slice is not it.

**When that slice lands, its unfurl:** `twitter:card: summary_large_image` + a **dynamically generated 1200×630 preview image per receipt** (satori + resvg runs in plain Node/Express — no Chromium needed; under 300 KB so WhatsApp doesn't drop it; absolute URL, no auth, path never robots-Disallowed or all cards die). The image carries everything — ticket aesthetic, exact amount, date, status — because since Oct 2023 the X card shows essentially ONLY the image plus the domain; description text is invisible there. This leapfrogs the entire explorer category: best-in-class today (Etherscan) is dynamic text + a static brand image. Indexing posture: **`noindex, follow` meta on individual receipt pages** (shares unfurl perfectly, strangers with the link see everything, but search never accumulates a browsable corpus of purchase pages — the Venmo-shaped risk is corpus + browsability). That posture is a founder choice at that slice's gate, not now.

**THE ROTATION ANSWER — for the founder, in plain words:**
"One link whose preview changes by itself over time — the platforms make that impossible, on purpose. When someone shares a link, X, Facebook, WhatsApp and the rest photograph the page ONCE and show that photograph from their own copy for about a week (X, LinkedIn, Telegram) up to a month (Facebook). WhatsApp even freezes the preview into each sent message forever. Nothing we serve can change a photograph they already took. **But your idea works a better way: the rotation lives in the LINK, not the preview.** Every time someone presses Share, we hand them a link with the next fact already inside it — different share, different link, different preview, each one honest and permanent. And each receipt's own page already gives every receipt its own picture with its real numbers. Our own little server can do all of it — nothing new to buy. It belongs to the receipt-page slice (the living-previews arc), because it needs the server to paint those preview pictures; nothing rotates in this slice, and nothing is lost by waiting — no link we hand out today gets worse."

(Technical footnotes for that future slice, settled now: variant URLs must return 200 with their own meta — no redirect, X collapses to the destination's cache; each variant's og:url must be self-referential or Facebook collapses it to the canonical; the rotating fact must be rendered INSIDE the image because X shows nothing else.)

---

## §4 WHAT RIDES THIS SLICE vs LATER

**RIDES R-BIND-2 (mockup now, build at its gate):**
- The hero rail, complete: cap-5 shelf, desktop static-row/overflow-rail, mobile snap rail with peek + counter + buttons, N=1/2 chrome collapse, full a11y semantics, performance discipline, compact record bar above it.
- The dual share surface: Copy link first with copied state → six network tiles in the new order (reusing shareTargets.ts) → "Share with other apps" full-width, feature-detected, hidden when absent.
- The handleShare rework including the canShare-gap fix; Save image and Verify unchanged in Zone G.
- Guard compliance throughout (binder file is pin-scanned); DESIGN_ROADMAP tick + mockup copied into docs/design/ in the same commit.

**LATER — each its own slice, in this order:**
1. **`/receipt/{txHash}` public page** (engraved next in the spine roadmap): the four-layer serving/routing work, pin-10 amendment, the page anatomy from Lens 4 (verdict-first status, exact amount, the human name of the thing bought, short-form addresses, verify affordances, receipt number, owner layer by session), the dedicated PDF engine, per-receipt preview card, indexing-posture decision at its gate. Once live, Copy link retargets to it (explorer stays one click deeper as Verify).
2. **The living-previews arc**: the server-side preview-image endpoint + the founder's fact rotation across shares.
3. Binder virtualization (only if the archive actually grows long) and network-tile reorder from real tap counts.

**Nothing in this slice blocks or prejudices the later slices; the later slices need nothing from this one redone.**

---

## §5 THE MOCKUP SPEC (R-BIND-2)

**One HTML mockup, both themes, two widths (375px and 1280px+), saved into docs/design/ per standing rule.**

**Zones, top to bottom:**
- **Z1 — Record bar (compact, one line):** "Your receipts" + live pill + count. Never taller than one line; the page opens on the work.
- **Z2 — THE HERO RAIL:** open tickets per §1. Desktop 1280px: 3 full tickets in a static row (state variant: 5 tickets → rail with paired arrows + cut ticket at edge). Mobile 375px: one centered ticket, 16–24px real peek right, gutters, counter "n of 5" + prev/next below. "All receipts (N)" bridge link under the rail.
- **Z3 — Dual share surface** (shown open as an overlay state on a ticket's Share): mobile bottom sheet — ticket thumbnail + exact amount at top, Copy link primary, six tiles (X · WhatsApp · Telegram · LinkedIn · Facebook · Email), full-width "Share with other apps"; desktop popover — same minus the native button in the no-navigator.share variant.
- **Z4 — Month-grouped archive** (existing binder rows, unchanged, shown to prove the rail sits above it correctly).
- **Z5 — nothing else.** No reference material; anything diagnostic stays out or collapsed per the Work-First law.

**States the mockup must show:** N=5 (full rail), N=1 (centered, zero chrome), N=2 (desktop pair / mobile "1 of 2"), loading (skeleton tickets in the rail), empty (existing copy), share sheet open (mobile) + popover open (desktop, both with- and without-native-button variants), Copy link's "Copied" state, reduced-motion note. Every visible image loaded (Visual-Change-Law §④ check before the URL is handed over).

**Labels (human, final for the mockup):** "Your receipts" · "All receipts (N)" · "n of 5" · "Copy link"/"Copied" · "X · WhatsApp · Telegram · LinkedIn · Facebook · Email" · "Share with other apps" · "Save image" · "Verify". No jargon anywhere a member reads.

**Gate path:** mockup → founder visual approval (desktop AND 375px, both themes) → build slice → PREVIEW GATE at the rig → commit. Deploy verdict comes at the build slice, not the mockup.