# SESSION_STATE — read FIRST, every session

Authoritative resume point. **The real repo always wins over any spec.**

> **▶ ⏭️ READ-FIRST BOOT (2026-07-18, the founder's standing order — "stop making
> me re-explain; make the canonical files the thing you read before any work").
> BEFORE touching anything, READ these, in order, and do NOT re-derive or re-ask
> what they already answer:**
> 1. `docs/direction/CANON_ACCESS_MODEL.md` (TIER-0) — the site-wide ACCESS MODEL
>    (tiers · the seat=membership law · the operator wall · the sign-in wall ·
>    no-hero-when-connected · shell-continuity · full-screen S7-d) + the applied
>    `tier × surface` pattern. **Every member surface follows it via
>    `MemberAppPage`; change the pattern once, all pages follow — never page by page.**
> 2. `docs/direction/MEMBER_HOME_FINISH_ORDER.md` — the ordered plan to finish Member Home.
> 3. `docs/direction/BACKLOG.html` — the full 173-item backlog, 14 categories.
> 4. `docs/direction/OPEN_QUEUE.md` — in-flight decisions.
>
> **WHERE WE ARE (2026-07-18, this session):**
> - ✅ **SEALED IN PROD — access-model SLICE 1 (`b2e3e85`, Replit 6/6):** the
>   session-resolved **sign-in wall** on member-account surfaces (the `/wallet`
>   "balances while logged out" leak CLOSED — gate on the SESSION, never the
>   wagmi address; Q-B handled), **full-width** `/wallet`+`/toolkit` (the narrow
>   `max-w-5xl` column dead), **no explanatory hero when connected** (opens on the
>   work), and the `/member` "Your referral" dedup. Shared pieces: `SignInWall`,
>   `MemberAppPage`, `lib/useSignedIn`.
> - 🚀 **DEPLOY BACKLOG (committed, NOT yet deployed) — SLICE 2 (`1b0c51b`):**
>   the GENERAL member-surface layout. `MemberAppPage` is now THE wrapper every
>   member door uses (`kind="content"` public doors → in-shell + light header when
>   connected, SEO-safe public hero when not; `kind="account"` /wallet+/toolkit →
>   straight to the work). **Shell continuity:** the 6 content doors (Chronicle ·
>   Activity · Archive · Recognition · Fire Ledger · Liquidity) now render INSIDE
>   the dashboard shell when connected (they used to break out). **Hero copy
>   humanized** — the honesty is `session ≠ SEAT` (the seat IS the membership), in
>   plain words: no `≠` symbol, no "your own row". The INVARIANT is unchanged, so
>   `guard-access-state` + the `guard-auth-zone` dist probe are **re-pinned to the
>   same truth in human words** ("proves control of a wallet" kept verbatim — the
>   security probe untouched). **VERDICT: 🚀 DEPLOY, client-only, no migration.**
>   Replit: *pull main, deploy, report* — note the auth-zone dist probe changed
>   `"ever your own row"` → `"no list of members"` (both are honest own-row
>   strings shipped in the copy).
> - **NEXT (after slice 2 deploys):** ① pagination (`/activity` newest-first feed +
>   the newsroom Chronicle sort/filter/pagination = `chr-newsroom-page`); ②
>   `/member` FULL migration to `MemberAppPage` (it is the one bespoke page left —
>   its own door/dashboard fork works and is full-width, but it does not yet use
>   the shared wrapper); ③ then continue the `MEMBER_HOME_FINISH_ORDER` (the Phase-A
>   defects: founder BUILDER_SOURCE derivation, genesis footprint "—", etc.).
> - **DO NOT build member-facing layout/composition without the founder** (VISUAL
>   CHANGE LAW: wireframe → preview gate). Copy = full text on screen first.
>
> **HARD-WON DOCTRINE (this session — do NOT re-litigate):**
> - **SEAT = the on-chain membership, ALWAYS** (binary, numbered). A session
>   proves wallet control; the SEAT is the membership. Never confuse
>   session/seat/membership; the `Sx` access-state codes are internal (S7 ≠ Seat 7).
> - **WE SHOW THE MONEY** (Visibility Law TIER-0 — "company, not charity"; hiding
>   an on-chain amount is theatre). XP/Learn&Earn = recognition, never cash; the
>   season cagnotte = REAL company USDC (merit, lawyer-gated = `gam-payout`,
>   Phase-5 deferred). "never a cash figure" copy was itself a defect.
> - A member surface: connected = the WORK (no explanatory hero); not-signed =
>   the teaser/hero. Own-row only, never a directory (ADR-003).
> - Prod manual acts leave NO repo trace — never recite a stale "founder to-do";
>   grep the transcripts for evidence, not memory (the Q43 lesson).

> **▶ 🧭 CLEAN HANDOFF — THE NOTIFICATION CENTER IS COMPLETE & LIVE (2026-07-18,
> session end; verified by a 4-lens completeness audit — API/security SHIP-READY,
> studio/UX PASS, doctrine grade-AAA, no forgotten wiring). Q43 NOTIF-1 → NOTIF-2
> → NOTIF-2b → the icon fix → the read-path hardening → the Select dropdown fix
> ALL SEALED IN PROD through `51e68de` (Replit verified EACH cycle 5/5–6/6;
> founder-pasted seal reports on record — not from memory). **DEPLOY BACKLOG:
> EMPTY. Tree clean.** THE NOTIFICATION CENTER IS 100% COMPLETE AND LIVE.**
>
> **WHAT'S LIVE (the whole channel — no email, ever; in-app is THE channel):**
> ① NOTIF-1 (`881b166` + WORK-FIRST recomposition `a45d8b8`) — the member BELL in
> the §11 header slot (badge = own UNSEEN count; tabs All/Protocol/Mine; View all
> → the dedicated `/notifications` page) · the two-tier seen/read receipts (badge
> clears on open, an item reads on CLICK) · per-member contact from the ledger row
> (client sends SEAT only; server resolves seat→wallet) · broadcast-all · the
> honest admin bell. The FOUNDER ACTED THE SEAL: his first broadcast
> "This message opens the record." lit his own bell.
> ② NOTIF-2 (`8905df9`, its own migration cycle — 3 ADDITIVE nullable columns
> icon/link_path/category, idempotent/drift-free push, prod schema confirmed on
> neondb) — operator-chosen ICON (curated lucide palette) + internal DEEP-LINK,
> both from the SINGLE SOURCE `lib/os-contracts/src/notifications.ts` (API
> validator + studio renderer + pickers + guard all import the one literal);
> anti-phishing = EXACT-MATCH internal whitelist (never a `/`-prefix; `//`/`\`
> refused; NO free-text URL field, permanent); mechanism-decides palette (vault/
> gift/trophy/receipt kept, gain-promise glyphs banned). Icon + destination
> pickers in BOTH composers (broadcast + ledger message).
> ③ NOTIF-2b (`f100640`, NO migration) — NO DEAD CLICKS (every popover row is a
> link: with a destination → the subject; without → the full page) · founder-gated
> AUDITED DELETE (`POST /api/operator/notifications/delete`, cascade receipts +
> `notification.delete` audit row) with a Trash button + confirm on each Sent row.
> ④ ICON FIX (`ac3f30c`, client-only) — consistent GOLD type-icon decoupled from
> read-state (dark `--muted-foreground` was reading stark-white); read-state moved
> to the title (bold/foreground unread · normal/muted read).
>
> **✅ THE FINAL POLISH/HARDENING SEALED (Replit 6/6 at `51e68de`, 3-commit
> no-migration batch):** (a) the member-inbox READ path re-validates icon∈palette
> + link∈whitelist server-side (nulls anything off-list before serving) — the
> internal-only guarantee is server-authoritative on BOTH write and read, never
> client-dependent, future-proof against a v2 generator that ever skipped
> validation (`49f4d39`); (b) the operator "Sent" list icon → gold (`49f4d39`);
> (c) the shared shadcn Select dropdown is height-capped + scrolls — the
> destination picker of 16 items ran off-screen; now caps at ~10 + scrolls,
> fixes EVERY Select app-wide (`f0ded93`). All gates green at the sealed counts
> (auth-zone 920 · notif-vocab 62/62 · operator-gate 2650 · admin-dist 93);
> byte-identity confirmed; the wall holds; endpoints 401/200-S1; engine healthy.
> **DEPLOY BACKLOG: EMPTY.**
>
> **✅ HOUSEKEEPING DONE + Q43 CLOSED (EVIDENCE-confirmed 2026-07-18):** the 3 TEST
> notifications were deleted from /admin/broadcast → "Sent"; only **"This message
> opens the record."** (the real first Founder broadcast) remains. Q43 THE
> NOTIFICATION CENTER is CLOSED. **PROOF (not memory):** in the prior "Admin and
> Membership" session the founder posted his OWN SCREENSHOT of the Sent list
> showing ONLY that one line — the 3 tests were already gone (he saw "nothing to
> click" because there was nothing left to delete). **NEVER re-raise this.** A prod
> manual act leaves NO repo trace, so this ledger's earlier "remaining manual act"
> block was STALE and contradicted the same session's own handoff — the exact
> from-memory drift the ledger exists to kill. When prod-only state is ever in
> doubt, grep the session transcripts (`~/.claude/projects/<proj>/*.jsonl`) for the
> real evidence; never recite a doc line or anyone's memory.
>
> **v2 GROWTH (next notification work, recorded — NOT built):** the AUTO
> protocol-event generator (a seat taken → notif, a promotion due → notif, a
> Chronicle entry → notif, a treasury swap → "the treasury acquired X, verify").
> `category` is seeded NULL in v1 so it needs NO second migration; the Supa 30-type
> quarry + the Binance/Kraken/Revolut synthesis are its seed; the full picture is
> `docs/reference/LIVING_NOTIFICATION_LAYER.md` (+ 3 sibling roadmap dossiers,
> `1923d30`; also: the swap/bridge ramp, the season/gamification engine + legal
> line, the Chronicle newsroom). Also recorded v2: severity/pinned tiers, the
> external verify-link (infra-only), per-category preferences, dismiss.
> **NEXT per the engraved order (on the founder's word):** A1 "My Activity" → B1
> THE FIRSTS → A2 → M-INT-2 → the Q42 wave (incl. chronicle-promote, which closes
> the manifesto's Chronicle loop) → Q39. Next session boots on "hi".
>
> **SESSION LAWS ENGRAVED (agent memory + docs):** mechanism-decides-not-symbol
> (ban gain-promise glyphs, keep honest function symbols; never over-apply
> anti-financialization against settled canon) · human-readable labels ("Account",
> never "Off-chain comfort") · the no-email canon + never-message-first = external
> only · the season-pot doctrine change (merit-measured payouts allowed, never
> chance) · the roadmap dossiers live in docs/reference/.

> **▶ ✅ NOTIF-2 SEALED IN PROD (2026-07-18, Replit 6/6 at HEAD `8905df9`; prod
> schema confirmed — the 3 columns + 2 indexes live on neondb, idempotent push
> proven) + 🔨 NOTIF-2b FOLLOW-UP ON MAIN (client + API, NO migration).** The
> founder's live test: icons render on the bell/page, and a broadcast WITH a
> destination is clickable (chevron → navigates). TWO gaps fixed this slice:
> ① NO DEAD CLICKS — a notification WITHOUT a destination was inert in the
> popover (truncated body unreadable); now EVERY popover row is a link (with a
> destination → the subject; without → the full /notifications page), always
> marks read + closes. ② DELETE CONTROL (founder ask "keep only the real first
> broadcast, erase the tests") — a founder-gated, AUDITED `POST
> /api/operator/notifications/delete` (removes the row + its receipts in one tx,
> action notification.delete) + a Trash button with a confirm dialog on each
> Broadcast "Sent" row. Doctrine: a founder-decided delete is an audited admin
> act (the origin had it), DISTINCT from the "nothing unread auto-expires"
> covenant. GREEN: api typecheck · auth-zone 920 (+ delete route/service pins) ·
> studio typecheck + all guards (notif-vocab 62/62, operator-gate 2650) · build
> 332 twins + admin-dist 93, "Delete this notification" ×1 console / 0 public.
> **🚀 DEPLOY — NO MIGRATION** (delete uses existing tables): Replit pulls main,
> deploys, reports. THEN the founder deletes the 3 test notifications from
> /admin/broadcast → Sent (Trash → confirm), keeping only "This message opens
> the record." (the real first Founder broadcast).

> **▶ 🔨 NOTIF-2 CLICKABLE + ICONS BUILT + ON MAIN (2026-07-18, founder GO — the
> "finish it perfect, don't come back" pass; 2 design workflows adversarially
> verified + 2 founder icon corrections applied).** Notifications now carry an
> optional ICON (curated lucide key) + an optional internal DEEP-LINK, both
> operator-chosen in the console composers, both rendered on the member bell +
> /notifications page (whole-row clickable when the destination is set).
> **SINGLE SOURCE:** `lib/os-contracts/src/notifications.ts` — the icon palette
> (23 keys), the internal link whitelist ({path,label}), the forbidden-icon set,
> and the (v2) category taxonomy — imported by the API validator, the studio
> renderer/pickers, and the guard, so server ↔ studio can NEVER drift.
> **DOCTRINE (founder, corrected):** "mechanism decides, not the symbol" — the
> palette carries honest FUNCTION glyphs (vault, gift, trophy, receipt) and bans
> only GAIN-PROMISE ones (rocket/moon/chart-up/diamond-pump/raining-money/dice);
> Chronicle got its icon (book-open) after the empty-slot catch. **ANTI-PHISHING
> (verifier's load-bearing fix):** links are internal-only by EXACT-MATCH Set
> membership — NEVER a `/`-prefix test (`//evil.com` satisfies `like '/%'`), and
> `//` / `/\` are refused explicitly; a client free-text URL field never exists.
> **MIGRATION:** 3 ADDITIVE nullable text columns (icon, link_path, category) —
> no new CHECK/index (expression-free → idempotent push); `category` is NULL in
> v1, added now so the v2 event-generator needs NO second migration. GREEN: api
> typecheck · studio typecheck · auth-zone 910 (+4 icon/link pins) ·
> notif-vocab 62/62 (new guard: palette∩forbidden=∅, every key mapped, every
> destination a real route) · operator-gate 2650 · build 332 twins + admin-dist
> 93, console strings 0 in the public entry · page clean desktop+mobile.
> v1 exclusions (recorded): the auto protocol-event generator (v2 — the taxonomy
> is seeded), the external verify/explorer link (v2, infra-only), dismiss /
> severity tiers. The 4 roadmap dossiers are in `docs/reference/` (`1923d30`).
> **🚀 DEPLOY — OWN CYCLE:** Replit pulls main, runs `pnpm --filter @workspace/db
> push` (3 additive columns — MUST re-push with zero drift), deploys, reports.
> Post-deploy seal = the founder sends a broadcast WITH an icon + a destination
> and it appears iconized + clickable on their own bell/page.

> **▶ ✅ Q43 NOTIF-1 SEALED IN PROD (2026-07-18, Replit 6/6 at HEAD `881b166`) +
> THE WORK-FIRST RECOMPOSITION (founder AAA rejection of the hero cut → fixed
> same session).** Replit: 2 tables migrated (`notification` +
> `notification_receipt`, dev DB; the known Drizzle truncate false-positive
> refused safely — continuity intact 1 run/12 records) · gates green at the
> new counts (auth-zone 906 · studio 3 659 · member-menu 35 · admin-dist 93)
> · prod battery: operator notifications 401 fail-closed · member-inbox 200
> honest S1 · wall ×6 404 · SHA identical · feed 78 · engine advancing.
> **THE FOUNDER ACTED THE SEAL:** smoke test = message to his OWN seat #1
> (`0x2445…c721` row) — the header bell lit with badge 1, popover tabs
> working, /notifications rendering the real row; THEN the FIRST FOUNDER
> BROADCAST sent (option A wording — "This message opens the record.", the
> Chronicle claim deferred until the promote pathway exists). THE CHANNEL IS
> ALIVE. **RECOMPOSITION on his rejection ("vraiment pas AAA"):**
> /notifications violated the WORK-FIRST LAW — full-screen marketing hero,
> duplicated lead, static "Sign in required" badge lying to a signed-in
> member, bell popover surviving navigation. Fixed: compact dashboard band
> (173px) → THE INBOX immediately · every duplicate line dead ("never
> emails" ×1) · NO static badge BY DECISION (every candidate lied in some
> state; honesty is state-aware in the panel, locked by a new
> guard-lifecycle-labels chassis check paying the exemption) · popover
> closes on View all. All green; awaiting one quick client-only cycle.
> NEXT after this seal: A1 "My Activity" → B1 → A2 → M-INT-2 · the Q42 wave
> (incl. chronicle-promote, which closes the broadcast's Chronicle loop) · Q39.

> **▶ 🔨 Q43 NOTIF-1 BUILT + ON MAIN (2026-07-18, founder GO ×3: slice → revised
> wireframe → commit; preview gate passed on the rig). THE NOTIFICATION CENTER —
> the no-email canon made real (in-app is the protocol's ONLY channel, ever):**
> ① SCHEMA (⚠ REAL MIGRATION, this slice's OWN deploy cycle, never batched):
> `notification` (audience MEMBER|ALL · recipient_wallet server-only, NULL for
> broadcasts · no seat column — the pairing lives only in the continuity spine)
> + `notification_receipt` (per-member seen/read — the two-tier world-class
> model: badge = UNSEEN, an item reads only when CLICKED; fixes the origin's
> recorded broadcast-read-state gap). ② API: founder_root-only writes POST
> /notifications/member (client sends SEAT only; server resolves seat→wallet)
> + /notifications/broadcast + masked GET list; member own-row GET /member-inbox
> (rows carry NO wallet) + THE FIRST member-side writes POST /member-inbox/seen
> + /read (own receipts only). ③ CONSOLE: ledger rows grew the ACTION MENU
> ("Message this member" — the interconnectivity pattern's first instance) ·
> Broadcast Send LIVE + sent history · the admin bell honest-live. ④ MEMBER:
> the HEADER BELL went live IN its §11 reserved slot (badge, tabs All/Protocol/
> Mine, View all) for EVERY signed session; the TROPHY stays reserved beside it
> (founder: both belong to all members, not only resolved seats) · /notifications
> dedicated page (FLAT route — the /member/* trap avoided) · menu door
> Notifications ABOVE Settings in the renamed **"Account"** group (founder:
> human words, never jargon — "Off-chain comfort" died everywhere member-visible)
> · "While you were away" reserved slot retired (its promise lives in the
> center; v2 = the protocol-event generator, recorded). Guards amended
> deliberately: auth-zone 828→906 (route pins + notificationService block +
> memberInbox = the THIRD auth DB bridge, write-capable own-row) ·
> continuity-schema 32 · holder-index 69 · member-menu 35 (14 rows) ·
> surface/SEO/modules registries + sitemap (25 INDEX) + routeTable all carry
> /notifications · build 332 twins + admin-dist 93, console strings isolated
> (entry 0). Research on record: the Supa quarry (3 subsystems, 30 types) + the
> world-class synthesis (Binance/Kraken/Revolut/Coinbase/GitHub/Linear, cited)
> — both in the transcript, the taxonomy is the v2 generator's seed. **🚀
> DEPLOY — OWN CYCLE: Replit pulls main, runs `pnpm --filter @workspace/db
> push` (2 new tables), deploys, reports.** Post-deploy seal = the founder
> sends the first broadcast from /admin/broadcast on his live session and it
> lights his own header bell.

> **▶ ✅ CONSOLE-POLISH SEALED IN PROD (2026-07-18, Replit 5/5 at HEAD `d2fe123`).**
> The batch (`d02af1e` + `c087829` WORK-FIRST + `39a010e` FULL-WIDTH) is live:
> Dashboard opens on Quick actions/Needs attention with diagnostics collapsed ·
> Operators leads with the registry, role hierarchy collapsed · work surfaces
> full-width · the blanket [Preview] section chip dead · ROOT_RECOVERY_CEREMONY
> in the repo. Proof: gates 100% green (auth-zone 828 · studio 3 601 PASS ·
> build 324 twins + admin-dist 90) · DOUBLE byte-identity (entry `c3876b4c…`,
> console chunk `0afc82bd…` prod == local) · wall 404-neutral ×4 · ledger 401
> fail-closed · dead strings 0 / living strings ×1 each in the served chunk,
> public entry 0 everywhere · healthz ok · feed 78/78 · engine self-healed to
> 6/6 after one documented fail-closed cycle (RPC under catch-up scan; cursor
> auto-repair, no intervention, no loss). **DEPLOY BACKLOG: EMPTY.**
> **TWO RESIDUES RULED LEGITIMATE (never re-ask):** ① `DESIGN_PREVIEW` ×1 in the
> chunk = the two honest per-panel chips (Content & Homepage + Source review
> queue, both genuinely design-preview) sharing one minifier-deduped literal.
> ② `max-w-6xl` ×1 = `OperatorOverview.tsx` (/studio launcher) — Claude Code
> ruling: the FULL-WIDTH law targets DENSE WORK TABLES; a card-grid launcher has
> none, the centered column is correct composition there. No action. (PublicHome
> + SystemStatus uses are public pages, out of scope.) Final prod visual = the
> founder's session at /admin. NEXT: **Q43 NOTIF-1 on the founder's GO** (own
> deploy cycle — real migration, never batched).

> **▶ 🧭 FINAL HANDOFF (2026-07-18, session end — supersedes the earlier handoff
> block below). VERIFIED AT THIS MOMENT: tree clean · zero unpushed commits ·
> HEAD `9bf8de7` · all 15 memory files + index present.**
>
> **IN FLIGHT: the CONSOLE-POLISH batch cycle** (handed to Replit at session end;
> all console-chunk client-side, NO migration): `d02af1e` (blanket [Preview]
> section chip dead + "Live · founder-gated writes" chip + ROOT_RECOVERY_CEREMONY
> one-pager) · `c087829` (THE WORK-FIRST PAGE LAW — permanent, in CLAUDE.md — +
> Dashboard opens on Quick actions/Needs attention with Protocol reality + KPI
> placeholders in collapsed expanders + Operators leads with the registry, role
> hierarchy collapsed) · `39a010e` (FULL-WIDTH work surfaces — the max-w-6xl
> centered column dead). Post-publish visual = the founder's session: Dashboard
> opens on the buttons, sections full-width, no blanket Preview chips.
>
> **NEXT SLICE ON THE FOUNDER'S GO: Q43 NOTIF-1** (queue `9bf8de7` carries the
> full plan + the recovered HARVEST-02/08 canon): per-member contact from the
> ledger row (client sends SEAT only; server resolves the wallet), broadcast-all
> live, member own-row inbox, the bell honest-live. ⚠ REAL MIGRATION (the
> notification table) — its OWN deploy cycle, never batched. THEN the order:
> A1 → B1 → A2 → M-INT-2 → the rest of the Q42 wave → Q39.
>
> **THE SESSION'S LAWS (all engraved in CLAUDE.md + memory, binding from boot):**
> the WORK-FIRST PAGE LAW (pages open on the work; reference in collapsed
> expanders; AAA on the first build) · FULL-WIDTH work surfaces · the STANDING
> RULE (gates only security/chain-truth/money/legal/go-live; never re-block an
> answered question) · the live-truth ledger · describe-by-function · the
> two-authorities model. Next session boots on "hi".

> **▶ ✅ M-INT-1 + Q40 SEALED IN PROD (2026-07-18, Replit 5/5 at HEAD `b77bec5` +
> independently curl-verified).** THE MEMBER LEDGER IS LIVE: GET
> /api/operator/member-ledger no-session → **401 fail-closed** (curl-proven) ·
> the wall holds (/admin → 404 neutral) · the ledger exists ONLY in the isolated
> console chunk (entry bundle: "Member ledger" ×0 — curl-proven) · DOUBLE
> byte-identity (entry `e8c6bd29…` AND console chunk `1db09ad7…` prod == local)
> · gates 100% green at the exact announced counts (the two formerly-red guards:
> member-continuity-schema 30/30 · holder-index 67) · feed 78/78 · engine 6/6
> head advancing · healthz ok. Q40 (live-reality-first dashboard) rode the same
> build. The founder had ALREADY validated the composition visually (the 14-row
> screenshot); the final prod visual = the founder's session at /admin →
> Members. **DEPLOY BACKLOG: `d02af1e`** (the completeness-audit catches: the
> blanket [Preview] section chip dies + the Operators panel "Live ·
> founder-gated writes" chip + ROOT_RECOVERY_CEREMONY.md) — 🚀 BATCHABLE, rides
> the next cycle. NEXT per the engraved order: **A1 "My Activity"** (own-row
> receipt binder) → B1 → A2 → M-INT-2 · the Q42 wave · Q39 — on the founder's
> word.

> **▶ 🧭 THE CLEAN HANDOFF (2026-07-18 — the founder's order: "the cleanest handoff
> possible, read back deeply, do not forget anything"). THE SESSION IN FULL:**
>
> **SEALED IN PROD (each triple-verified — Replit battery + founder eyes + independent curl):**
> ① the mechanical batch (Q33 *Teaser renames · Q22 compass repoint · Q8 spec
> reconcile · `assertAddressSafeAggregate` rename) · ② Q31 the gold favicon ·
> ③ SEO-TRANSPORT (serve.mjs: Brotli+gzip twins byte-verified, immutable/ETag
> caching — ~4× lighter, Pingdom A-95; CDN + www→apex PARKED for "the end") ·
> ④ /ADMIN-IN-PROD (the neutral wall: world → 404 neutral; Q36 founder_root
> ceremony `0x88ec…dd73` audited + Q37 tables; founder verified "Operator ·
> founder_root" live) · ⑤ THE TWO TRUTH SWEEPS (console + public: the read-only
> era vocabulary at 0 in the served bundles; the fabricated /admin/sources
> figures DELETED; "Entry Calculator" points at Join; /wallet + /toolkit wear
> LIVE_ACTION) · ⑥ Q41 founder-executed (TWO ACTIVE founder_root rows —
> `0x88ec…dd73` + `0x2445…c721`; the recovery property armed; quiet-root
> discipline noted).
>
> **ON MAIN, AWAITING ONE REPLIT CYCLE (the handoff point): M-INT-1 + Q40
> (`cadcb17`) + the guard-allowlist sync fix (`be0aace`).** Replit STOPPED
> fail-closed at 2 red guards (its diagnosis exact: the new lazy-DB service was
> missing from member-continuity-schema LAZY_DB_ALLOW + holder-index
> DB_LAZY_ALLOW — guard sync, not a perimeter violation); the fix is pushed and
> locally green (30/30 · 67 · auth-zone 828). LESSON ENGRAVED in the fix commit:
> a new zone lazy-DB file joins THREE guard lists. **The founder has ALREADY SEEN
> the ledger rendering the real 14 rows** (screenshot on record: seat #1 Patron
> $70 · 2 intro/2 durable/$0.50 paid · 13 active/1 settled — the dev preview);
> prod confirmation = the founder's session after the green cycle.
>
> **ENGRAVED THIS SESSION (survives every future session):** the STANDING RULE
> (gates ONLY security · chain-truth · money · legal/public copy · go-live; never
> re-block an answered question) — in the queue AND agent memory; the live-truth-
> ledger lesson (consult source-status/SESSION_STATE before re-research); the
> founder-describes-by-function lesson; the two-authorities model;
> MVP_FINAL_CHECKLIST (fires ONLY on the founder's words "MVP final, run the
> checklist").
>
> **THE FORWARD LIST (the engraved order):** ⓪ Replit re-runs the M-INT-1 cycle
> (HEAD `be0aace`) → founder confirms the ledger in prod → seal. ① A1 "My
> Activity" (own-row receipt binder) → ② B1 THE FIRSTS (Chronicle-candidates
> queue) → ③ A2 "My Chronicle" → ④ M-INT-2 (§D users-registry/audit tab).
> ⑤ THE Q42 WAVE (admin controllability, one slice each): audit READ → real
> flag writes + referral kill-switch → broadcast → modules real → support intake
> → content management → operator edit → /staff anti-impersonation → prospects
> lane (new scan lane) → notification center → Q38 step-up. ⑥ Q39 config-label
> relocation (+ the console breadcrumb "Page Not Found" fix). FOUNDER-ONLY:
> close Q31/Q36/Q37/Q41 · Q35 legal set · the MVP-final trigger · CDN at the end.
>
> **CARRIED NUANCES (named, none urgent):** the front rewrites asset
> Cache-Control public→private (browser cache fine via immutable) · Pingdom's
> "gzip D" is a legacy false-flag (Brotli not credited) · "Sign in as operator"
> string ships in the public wallet chunk (Q39-adjacent) · ChronicleTeaser.tsx
> renames the day the first entry is promoted · serve.mjs owns studio serving
> (routing generated from the registry; drift-guarded). Next session boots on "hi".

> **▶ M-INT-1 BUILT + ON MAIN (`cadcb17`, 2026-07-18) — THE MEMBER LEDGER + Q40.**
> GET /api/operator/member-ledger (FOUNDER-ONLY — §D pairing overlay; no params =
> no lookup API; masked walletShort; NO v1 anchors per A21; payload passes the
> 40-hex scanner; every read audit-rowed) serving per-seat dossiers joined from
> the ALREADY-INDEXED record only (continuity spine · capital axis · own-purchase
> R/F/M · R5 via the ownership index). Segments chain-anchored (recency vs the
> newest indexed purchase day; definitions served verbatim — no login data exists
> by design). Console: MemberLedgerPanel = the Members centerpiece (summary cards
> · dossier table · durable-ambassadors + footprints rankings · definitions
> legend · honest denied/unavailable). Q40 rode: AdminHome leads with live
> Protocol reality, placeholders demoted. guard-auth-zone 828 (route+service
> pins) · opgate adminGraph grew · all gates green · ledger strings isolated in
> the console chunk (entry clean). DEPLOY BACKLOG: M-INT-1 (`cadcb17`) — 🚀
> BATCHABLE, one cycle; the founder sees REAL rows on their live session
> post-deploy (the admin-go-live pattern). NEXT after the seal: A1 → B1 → A2 →
> M-INT-2 · the Q42 wave · Q39.

> **▶ ✅ THE TWO TRUTH SWEEPS SEALED IN PROD (2026-07-18, Replit 5/5 + independently
> curl-verified: dead class 0 in the served entry — "read-only signals reconciled"/
> "Read-only preview"/"Verified — view only"/"Read-only proof" all 0; living class
> served — Entry Calculator 1 · live signals verified 2 · Verified on-chain 3;
> console chunk clean of the fake figures, "Program status … LIVE on-chain" present;
> the wall holds (4 routes → 404 neutral); byte-identity `c928a289…85bab8`; feed
> 78/78, engine 6/6 head advancing). The founder's "GO LIVE EVERYWHERE" order is
> DONE: the site speaks living-production language everywhere, honesty intact.
> DEPLOY BACKLOG: EMPTY.**
>
> **▶ ✅ Q41 EXECUTED BY THE FOUNDER (2026-07-18, screenshot on record): TWO ACTIVE
> founder_root rows** — "Founder" `0x88ec…dd73` + "Founder Second Wallet"
> `0x2445…c721` (the founder's own 9-year wallet, historical seat #1 — canon-known,
> his choice per Q41's founder-decides). The canon recovery property is ARMED: lose
> either wallet → sign in with the other → suspend the lost row → invite a
> replacement; the last-ACTIVE-founder guard prevents zero-root. Both invites rode
> the live audited write path. AAA note (recorded, not a blocker): the second root
> is a daily-use wallet — the quiet-root discipline (root wallets do root acts only)
> stays the recommendation; the founder decided. Founder closes Q41.
> NEXT: **M-INT-1** (recon DONE — builds straight to the founder preview; the real
> R5 figures replace the deleted fakes) → the acted order → the Q42 wave.

> **▶ 2026-07-17 (night) — THE TWO TRUTH SWEEPS ON MAIN, deploy backlog = BOTH
> (🚀 BATCHABLE, one cycle):** ① CONSOLE sweep `89e43c4` (preview-gated/read-only-era
> fossils dead across /studio /os-map /admin; the FABRICATED /admin/sources sample
> figures DELETED; "Program status Paused" lie → LIVE on-chain truth; feature-flag
> states truthed; founder-controls "not switched on yet" dead). ② PUBLIC sweep
> `6fb2d2e` (founder GO copy): "read-only signals reconciled"→"live signals
> verified" · "Read-only proof"/"Verified — view only"→"Verified on-chain" ·
> Entry Preview→Entry Calculator pointing at Join · /wallet + /toolkit →
> LIVE_ACTION badges · the three sign-in tooltips humanized. Dead class proven
> absent from every built chunk. STANDING RULE engraved (queue + memory): gates
> ONLY for security/chain-truth/money/legal/go-live — never re-block on answered
> questions. Q42 (admin-controllability wave) queued with the full gap table.
> NEXT: deploy the sweeps (founder paste) → M-INT-1 (recon done, builds to
> preview) → the acted order → the Q42 wave.

> **▶ ✅ /ADMIN-IN-PROD SEALED — THE CONSOLE IS LIVE BEHIND THE WALL (2026-07-17,
> Replit full cycle + founder-verified in prod + independently curl-verified).**
> THE COMPLETE PROOF, all three sides: ① REPLIT: HEAD `5d30ab6` 16/16 blobs, gates
> green (studio 3,588 · admin-dist 90 · API 802/151/140/161 · DB 42/42), publish,
> wall battery (4 admin routes → 404 "Page Not Found", zero admin vocab, zero
> console-chunk ref, byte-identity `3e54631b…9458af`), Q37 (tables existed via
> Publish schema sync, contraints dev==prod, 0 rows, verify NOT SEEDED — the db push
> TRUNCATE false-positive on member_continuity_verification_run was REFUSED, right
> call), Q36 CEREMONY (dry-run → ✅ SEEDED founder_root `0x88ec…dd73` ACTIVE, audit
> row same transaction, disarmed, verify 1 row healthy, since 19:57:00Z). ② THE
> FOUNDER, on thesyndicate.money: signed in with `0x88EC…Dd73` → the console
> REVEALED — "Signed in as an operator · founder_root", badge "Operator ·
> founder_root", all 10 sections, live Protocol reality (screenshots on record).
> The header pill honestly said "no seat yet" — seat ≠ operator, the designed
> separation. ③ CLAUDE, independent curl: /admin no-session → 404 neutral zero
> vocab; operator-context no-session → fail-closed. **THE BOOTSTRAP TIMING QUIRK
> (founder question, answered):** the founder's first signed-in visit hit the wall
> because it happened in the window between the publish (wall live) and the
> ceremony (seed at 19:57Z) — the row didn't exist yet, the wall answered
> correctly. The MetaMask SYN-token add was UNRELATED (a local display list; the
> session is a server cookie, the role a DB row) — its only effect was causing the
> RELOAD, which re-read the role after the seed had landed. Steady-state has no
> such window (sign-in fires the re-read in place); the role-granted-while-page-
> open case was bootstrap-only. Q36+Q37 = done (founder closes). NEXT: M-INT-1
> (the member ledger, in /admin/members) · Q39 (config-label relocation) · NEW Q40
> (founder: reorder the admin dashboard — "what I need is at the bottom": demote
> the dead KPI placeholder cards, lead with the live content).

> **▶ 2026-07-17 (final) — Q36 PHASE 0 ON MAIN (`cb30915`): the founder_root SEED
> CEREMONY script + operator:verify.** Founder GO on the go-live plan; Q36 decision =
> the canon Founder wallet `0x88EC79AF…Dd73` (verified == FINANCIAL_TARGETS FOUNDER),
> option A (single root; backups OFFLINE, no online rows). The script: dual-armed
> (--write + FOUNDER_ROOT_SEED_APPROVED) · FIRST-SEED-ONLY (any existing founder_root
> → hard refuse; rotation/recovery = §F, never a re-run) · wallet PINNED to canon,
> never an input · one transaction (row + operator.seed-founder-root audit entry) ·
> post-write readback. Fail-closed proven live (no DATABASE_URL → refuses at the Q37
> gate). THE GO-LIVE CYCLE (one Replit session): deploy the wall → Q37 (drizzle push,
> tables, verify empty) → Q36 ceremony (dry-run → armed run → disarm → verify 1 ACTIVE
> founder_root) → founder phase-4 verification on thesyndicate.money (sign-in 0x88EC →
> /admin reveals → badge founder_root → Operators list loads → incognito /admin = 404).
> Q38 step-up deferred (own slice; writes are founder-only + audited meanwhile).
> LESSONS ENGRAVED in memory: founder describes screens by FUNCTION (match behavior,
> never literal labels; verify on the dev server before contradicting) + the TWO
> AUTHORITIES model (wallet-signed chain acts — the founder already signed the first
> referral source from /admin/sources, R2 2026-07-13 — vs server registry writes,
> which are what Q36+Q37 unlock).

> **▶ 2026-07-17 (end) — /ADMIN-IN-PROD: THE NEUTRAL WALL BUILT + ON MAIN
> (`02f24d6`+`cd823d8`), fail-closed. NOT YET LIVE for operators.** The console now
> SHIPS in prod but reveals ONLY after the server confirms an ACTIVE operator role
> (App.tsx OperatorRoute: fail-closed reveal seeded from the dev-only bypass →
> resolved by GET /api/auth/operator-context (isOperator && role) → re-read on
> SESSION_CHANGED_EVENT; non-operators get the EXACT catch-all 404). The console is
> an unconditional lazy() import = its own chunk, never the entry bundle, never
> fetched until revealed. `OperatorPreviewUnavailable` DELETED (its "Internal
> preview is not enabled" copy admitted a surface at the bare URL — the wall
> violation, now guard-forbidden). All 15 INTERNAL registry entries neutralized
> (title/desc mirror the 404 — kills the per-surface title bundle-string leak).
> guard-operator-gate RE-FIT (separate-chunk seam + full wall-shape + retired-copy
> dead); NEW guard-admin-dist.mjs (build gate: entry + 28 shells admin-clean of the
> console-code class, console isolated). VERIFIED: typecheck 0 · opgate 2589 ·
> access-state 981 · seo 435 · surface 296 · rewrites 52 · build 27 shells + 324
> byte-verified twins + admin-dist PASS · RUNTIME (serve.mjs): /admin /studio
> /os-map /admin/operators ALL → HTTP 404, `<title>Page Not Found</title>`, zero
> admin vocab, no console chunk in the served HTML.
> **GO-LIVE for operators needs (not this commit): Q36 the founder_root seed
> (founder act — which wallet) + Q37 Replit provisions DATABASE_URL + migrates the
> operator/audit tables. Until then NO operator can reveal — everyone gets the 404,
> so the wall is safe to ship now.** Deferred, tracked: Q39 — the SHARED-config
> operator labels (modules.ts, ride the entry via /status's import) relocate to a
> console-only source (a pre-existing, non-rendered leak; its own careful slice).
> DEPLOY: 🚀 BATCHABLE — client-only, fail-closed; rides the admin go-live with
> Q36+Q37.

> **▶ 2026-07-17 (end of session) — SESSION DEEP-READ VERIFIED + THE /ADMIN-IN-PROD
> INVENTORY CORRECTED (first-hand, against code AND live prod).** Session verification:
> 13 commits `1514bf6`→`1155e34`, ALL pushed (HEAD == origin/main), tree clean, every
> shipped slice PROD-SEALED by Replit (mechanical batch · favicon · SEO-TRANSPORT/Brotli)
> and independently curl-verified. MVP_FINAL_CHECKLIST engraved (`b0e1f45`), fires only
> on the founder's explicit word.
>
> **THE CORRECTED /ADMIN-IN-PROD FACTS (supersede the earlier gate's overstatement —
> "check what we already did," founder order; each verified first-hand):**
> - **Operator auth is ALREADY LIVE in prod** (probed 2026-07-17): `GET
>   /api/auth/operator-context` no-session → 200 `{isOperator:false,role:null}` (zone
>   EXPOSED, fail-closed — `SYNDICATE_AUTH_ENABLED` is set) · `GET /api/operator/operators`
>   no-session → **401** (the write zone is LIVE + auth-gated, not dark).
> - **The operator login UI is BUILT, not a stub**: `OperatorSignInAction.tsx` (RainbowKit
>   connect + SIWE, resolves role in place on SESSION_CHANGED_EVENT) + `OperatorBadge.tsx`
>   (live role chip from operator-context). The "WalletAuthComingSoon" stub is Shell.tsx
>   (the /studio overview chrome), NOT /admin — AdminShell carries the real login.
> - **The leak-prevention framework EXISTS**: guard-operator-gate (gated dynamic import ·
>   dist-grep probe strings · no-public-links · strict admin import graph). 4 live writes
>   (referral-terms/invite/suspend/list) each already writing audit_log rows.
> - **The REAL remaining delta for /admin-in-prod (small, focused):** ① the NEUTRAL WALL
>   — replace the build-flag reveal (OperatorConsole.tsx:42-46 says today's AccessGate is
>   "visibility/UX only") with the server-confirmed-role reveal; the current prod fallback
>   ("Internal preview is not enabled on this deployment") VIOLATES the wall (admits an
>   internal surface) → non-operators must get the exact NotFound composition, zero new
>   vocabulary. Serving layer needs NO change (INTERNAL routes already HTTP-404 at
>   serve.mjs; the SPA takes over post-hydration). ② guard-operator-gate RE-FIT (console
>   ships as a separate lazy chunk: prove entry-bundle-clean + reveal-only-on-server-role,
>   stricter never weaker) + registry fossils truthed. ③ Replit: confirm DATABASE_URL +
>   operator/audit tables migrated in prod (DB exists — partB guards green; table status
>   unconfirmed). ④ 🔴 FOUNDER: the founder_root wallet + one-time seed (offline act; no
>   self-service by design). ⑤ step-up signatures = design-only, founder-optional.
> - Dev keeps the OPERATOR_PREVIEW build-flag as a DEV-ONLY bypass; prod reveal = server
>   role, period.

> **▶ ✅ SEO-TRANSPORT SEALED IN PROD (2026-07-17, Replit 6/6 + independently
> curl-verified): thesyndicate.money now serves BROTLI.** The studio serves
> through `serve.mjs` (compression + caching), LIVE. MY OWN CURL vs prod: entry JS
> `Content-Encoding: br` **402,252 B** (vs 1,622,905 raw = ~4× lighter) · gzip
> FALLBACK confirmed (a gzip-only client gets `Content-Encoding: gzip`) · identity
> intact 1,622,905 · `/` br + no-cache · `/assets/*` immutable · direct `.br` → 404.
> Replit: 27 shells 200 + real 404, **byte-identity prod == local build**
> (SHA-256 `f24d766c…03cb4`), all studio+API gates, feed 78/78 zero-address, engine
> 6/6 (head 90,558,895 → 90,559,196), healthz ok, /api live (V3 6,994,000 SYN
> available). **Pingdom: grade A 95** (was B-), 450KB, 228ms. TWO benign nuances,
> NO ACTION: (a) the front (Google Frontend) rewrites asset `Cache-Control:
> public`→`private` — browser cache still fully works via `immutable`+max-age, only
> shared/intermediary caches excluded; (b) Pingdom's legacy "Compress with gzip"
> still reads D — a tooling artifact (it doesn't credit Brotli, which is superior,
> and the site serves the gzip fallback too); real-world compression is live and
> optimal. **DEPLOY BACKLOG: EMPTY. Compression dossier CLOSED** (founder confirms).
> Next order (unchanged): **/admin-in-prod → M-INT-1 → A1 → B1.**

> **▶ 2026-07-17 (later) — SEO-TRANSPORT ACTIVATED ON MAIN (`b62c3c3`), NOT YET
> LIVE — awaiting the founder's Replit publish click.** Replit confirmed the deploy
> reads the COMMITTED artifact.toml (repo = single source of truth; no divergent
> override) and validated the exact content. Committed the switch: artifact.toml
> static→`[services.production.run] node serve.mjs` + health "/", `BASE_PATH="/"`
> in BOTH build.env (Vite/prerender need it at build — Replit's one correction) and
> run.env, [services.env] dev kept; the 52 toml rewrites RETIRED (serve.mjs owns
> routing from the registry-generated `routeTable.generated.json`, seo:rewrites:check
> green on the table). VERIFIED on the real prod port 18425: health /→200 index.html,
> clean URLs→200, entry JS→402KB Brotli, real 404; full gate + 316 byte-verified
> twins. serve.mjs resolves dist/public from import.meta.url (cwd-independent —
> Replit's vigilance note, already satisfied). **GO-LIVE = the founder's Replit
> publish click:** founder tells Replit "c'est sur main" → Replit pulls (blob-verifies
> serve.mjs + precompress + toml byte-for-byte vs its validated local) + full gates +
> local smoke → publish card → founder clicks → post-publish battery (27 shells +
> real 404 · Content-Encoding: br + Vary on / and the entry JS · immutable on
> /assets/* · byte-identity via Accept-Encoding: identity). Prod stays on the current
> static build until that click.

> **▶ 2026-07-17 (later) — SEO-TRANSPORT: the studio Node server BUILT + ON MAIN
> (`1dc2031`), INERT. NOT YET LIVE.** Replit's compression verdict was (c) — the
> static layer can't compress or set headers. Founder chose the NON-CDN path (CDN
> parked for "the end"). Built the exact model the api-server already runs:
> `server/serve.mjs` (serves dist/public; clean-URL routing from the
> registry-generated `server/routeTable.generated.json`; `.br`/`.gz` twins by
> Accept-Encoding; Cache-Control immutable for /assets/*, no-cache+ETag for HTML,
> max-age=3600+ETag else; path-traversal safe; real 404) + `precompress-dist.mjs`
> (Brotli q11 + gzip 9 twins at build) + `precompress-verify.mjs` (build guard:
> every twin decompresses byte-identical). ZERO new runtime deps (node: builtins).
> Routing generated from the SAME registry as the toml rewrites, drift-guarded by
> seo:rewrites:check (now covers both outputs). VERIFIED locally vs the real dist:
> entry JS 1.62MB → 402KB Brotli (75%); byte-identity proven THREE ways (on-disk
> == raw-served == br-decompressed-from-wire, all f24d766c…); build guard 316/316
> twins byte-identical; 3-lens adversarial red-team = SHIP, all confirmed low
> findings fixed (direct .br/.gz→404 · fail-loud startup · read-body-before-headers
> · Accept-Encoding "*" · ETag/304 for all cacheable + If-None-Match list/"*").
> INERT: prod still serves static (Replit confirmed the host 404s the twins), so
> the CODE changes NOTHING live. **ACTIVATION = the artifact.toml switch** (remove
> `serve="static"`/`publicDir`/the 52 rewrites; add `[services.production.run]`
> node serve.mjs + PORT 18425 + health "/"), the ONE thing to settle with Replit:
> confirm its deploy reads the COMMITTED artifact.toml (single source of truth),
> NOT a diverging override; then commit the switch + one deploy + Replit's
> post-publish battery (routing/encoding/cache/byte-identity). Next order
> (unchanged): /admin-in-prod → M-INT-1 → A1 → B1.

> **▶ ✅ BATCH SEALED IN PROD (2026-07-17, Replit-verified 6/6 — ONE cycle):
> Q33 *Teaser renames + the `assertAddressSafeAggregate` api rename + the Q31
> gold favicon.** HEAD `6b5727e`, 9 commits ahead of anchor `7e6d8ee`, 26/26
> blobs SHA-verified (incl. the two Q33 file renames), no migration. Bundle
> BYTE-IDENTICAL: `index-BfqGonuU.js` SHA-256 `93c93b91…e3695` local == prod
> (renames don't touch shipped code, so the name held). Gates green: typecheck ·
> 27 shells · studio (access-state 983 · receipt 83 · menu 34 · home 30 ·
> surface 296 · seo 435 · rewrites 52) · api (auth-zone 802 · backbone 151 ·
> activity 140 · source-status 161 · DB 42/42) · feed 78/78 zero-address ·
> healthz ok · engine 6/6 head 90,554,524. **FAVICON CONFIRMED:** the gold
> syn-mark serves (/favicon.svg + /favicon-32.png + /apple-touch-icon.png all
> 200, cyan shield dead; Pingdom "favicon small & cacheable" A/100). **DEPLOY
> BACKLOG: EMPTY.**
>
> **COMPRESSION — VERDICT (c), MEASURED IN PROD (Replit):** the studio static
> host compresses NOTHING (no `Content-Encoding`/`Vary` on `/` or the entry JS;
> 1.62MB raw over the wire; the API too), serves NO pre-compressed `.br`/`.gz`
> siblings (both 404), and exposes NO host compression setting. So build-time
> precompression = DEAD WEIGHT — **NOT added** (per the founder's (c) rule).
> Pingdom also flags `cache-control: private` + no Expires (assets un-cacheable)
> — the SAME host-layer limit. **Both are DEFERRED to a new slice SEO-TRANSPORT:
> RECOMMENDED = a CDN in front of the domain (Cloudflare free = Brotli + edge
> cache + the www→apex 301, all at once, ZERO code, pure edge transport — it
> also subsumes the deferred www→apex item); alternative = fronting the static
> build with the Express server + compression/cache middleware (code, sensitive,
> touches asset delivery — the founder's explicit out-of-scope area).** Founder
> decides; nothing built. NEXT per the acted order (unchanged): **/admin-in-prod
> → M-INT-1 → A1 → B1.**

> **▶ 2026-07-17 — MECHANICAL / DECISION-LIGHT BATCH (founder "go in the right
> order"; 4 slices, committed + pushed to main `bcb686f`→`1746d2e`, no founder
> content/visual gate needed — renames + doc-truth only).**
> - **Q33 — *Teaser filename fossils truthed** (`1514bf6`): `ActivityTeaser`→
>   `Activity`, `FireLedgerTeaser`→`FireLedger` (both LIVE surfaces; git-mv
>   history kept). **ChronicleTeaser DELIBERATELY KEPT** — its register is empty
>   so its dominant state renders the FUTURE teaser; the name is accurate today
>   and renames only when the founder promotes the first Chronicle entry.
>   Studio gate green (tsc · all guards · seo 435 · surface 296 · rewrites 52 ·
>   build 27 shells). Founder closes the queue item.
> - **Q22 — Compass repoint** (`014238b`): §2/§4/§6 "current state / current
>   handoff" → the living `docs/SESSION_STATE.md` (the 2026-07-03 pointer had gone
>   ~2 weeks stale); 2026-07-03 handoff kept as the DB/durability checkpoint.
> - **Q8 — MASTER_BUILD_SPEC Phase-1 checkboxes reconciled** (`3902d80`): ticked
>   ONLY the two provably-done boxes (fluid type · color→0 guard BLOCKING);
>   LEFT OPEN the hero KPI grid (Q16) and PublicHome+TruthLabel→StatusPill
>   (`PublicHome.tsx` still renders `<TruthLabel>` — verified, not assumed). Added
>   the note that SESSION_STATE's "Phase 1 CLOSED" scopes to the 8 atoms — no
>   contradiction, no false tick.
> - **Guard rename** (`1746d2e`): `assertNoAddressLeak`→`assertAddressSafeAggregate`
>   across 14 api-server files (30 occurrences incl. the twin + backbone.guard's
>   code-as-string check); behavior byte-identical. api tsc 0 · backbone 151/151 ·
>   sale-semantics 67/67.
>
> **DEPLOY BACKLOG (was EMPTY after AUD-ROUTE):** now **Q33 studio rename (client)
> + the api leak-guard rename (server)** — BOTH 🚀 BATCHABLE, behavior/output-
> identical; prod runs the current build unchanged until the next cycle carries
> them. Q22 + Q8 = ✅ NO DEPLOY (internal docs). STILL OPEN (founder): Q31 icon
> artwork · Q32 the 23-descriptions meta wave · Q34 ConnectModal warning (own
> session) · Q35 the AUD-T legal set · older Q5/Q6/Q9/Q13/Q16/Q20. NEXT per the
> acted order UNCHANGED: **/admin-in-prod → M-INT-1 → A1 → B1**.

> **▶ ✅ SLICE AUD-ROUTE SEALED IN PROD (2026-07-17, Replit-verified ①–⑦
> ALL GREEN on thesyndicate.money — the studio AND the api-server rode ONE
> cycle: prod entry bundle `index-BfqGonuU.js` SHA-256 93c93b91…3695
> byte-identical to Replit's local rebuild, anchor `7e6d8ee`, 26/26
> blob-verified incl. the Home→OperatorOverview rename handled cleanly, no
> migration, no env change, no install. PROD PROOF: ② the six doors served
> (Activity · Fire Ledger · Liquidity · Chronicle · Wallet · Toolkit;
> /chronicle referenced 8× — the More menu's "Chronicle" finally delivers
> /chronicle); ③ the dead claims at 0 in the served bundle ("read live
> from the contract" · "artifact reads live"); ④ the served
> source-attribution.html carries rel=canonical →
> https://thesyndicate.money/referral, robots noindex,follow kept, 0
> sitemap occurrences; ⑤ og:site_name "The Syndicate" · twitter:site
> @TheSyndicateOne · theme-color #030711 served; ⑥ X-Robots-Tag: noindex,
> nofollow LIVE on all 5 probed /api routes — absent pre-publish, present
> post-publish = THE PROOF the api-server deploy landed; ⑦ feed 78/78
> byte-identical zero-address, engine boot-partial self-repaired via the
> persisted cursor (the known pattern — cycles ok:2/partial:1/failed:0,
> head 90,508,088 → 90,508,702, 6/6 scan units), healthz ok + 24 postures.
> Gates replayed green on Replit pre-publish (typecheck · 27 shells ·
> drift w/ the NEW reverse check · menu 34 · home 30 · receipt 83 ·
> access-state 983 · operator-gate green at the rename · surface 296 ·
> seo 435 · rewrites 52 · the 17 api guards + DB). **DEPLOY BACKLOG:
> EMPTY.** NEXT per the acted order: **/admin-in-prod** (Ruling ②: the
> neutral wall — zero admin vocabulary at the bare URL, console reveals
> only after the server confirms the operator role; server-side operator
> sessions per OPERATOR_WALLET_AUTH canon; public-sees-admin-never guard
> on dist chunks; deliberately BEFORE M-INT-1 — the ledger's home) →
> M-INT-1 → A1 (receipt binder + placements ②③ + V2 Routed fold) → B1
> (THE FIRSTS engine, §7b). CARRIED FOUNDER DECISIONS (open): the icon
> ARTWORK call (favicon.svg is an off-brand cyan shield — the
> apple-touch/PNG/manifest micro-slice waits on the mark choice; no local
> rasterizer exists, its own micro-slice) · the 23-descriptions >160-char
> meta wave (every rewrite read on screen) · entity + governing law ·
> durable contact channel · log retention · eligibility floor · checkout
> acceptance mechanics · on-chain hash commitment of legal docs ·
> never-message-first policy · counsel review lifts the draft label ·
> Q5/Q6/Q9/Q13/Q20 (older). Next session boots on "hi".): ROUTING + SEO
> RATIONALIZATION — the audit's lens 6+9 layer,
> RECONCILED against HEAD first (7-cluster fleet: several findings already
> dead via AUD-TRUTH/-2; the residue mapped precisely).** THE KILLS:
> ① THE ARCHIVE READ-LIVE CLAIM CLASS dead at NINE sites (the adversarial
> pass caught my first sweep missing the four most visible: /proof's facet
> card — header-primary! — /status's surface-map summary, routeMemory,
> truthStatus comments; plus contractMemory note rendered on /archive +
> /contracts, the Z8 door note, modules + moduleRegistry + the /archive SEO
> description): every site now speaks the truth — mints are OPEN and every
> mint rides the INDEXED RECORD; no page claims live reads it does not
> perform. ② THE CHROME WAYFINDING LIE dead: header "Chronicle" finally
> points AT /chronicle (it navigated to /archive); the SIX chrome-invisible
> live routes joined modules.ts + the footer (Protocol += Activity · Fire
> Ledger · Liquidity; Learn += Chronicle; Membership += Wallet · Toolkit;
> Liquidity deliberately NOT Membership — flow separation); nav.header
> flags corrected to MATCH headerSpec (contracts/member/recognition true;
> learning/home false; studio footer-flag lie dead); surfaceClassification
> carries the six moduleIds (the /status map speaks human labels) + its
> teaser fossils truthed. STRUCTURAL CURE: guard-route-nav-drift grew THE
> REVERSE CHECK (every PUBLIC/PENDING route must have a module — the
> six-invisible-routes ABSENCE class can never silently return) + all its
> textual scans now comment-stripped (the sibling-guard house pattern).
> ③ THE ALIAS CANONICAL implemented as documented: getCanonicalUrl emits
> the REDIRECT class's cross-canonical (/source-attribution →
> https://thesyndicate.money/referral, noindex,follow kept, out of
> sitemap); check-seo-registry grew the three-way branch (REDIRECT must
> cross-canonicalize into a registered INDEX target; all other non-INDEX
> stay null) — dist-proven in the alias shell. ④ FOSSILS truthed: registry
> banner (the rotted "14 routes" count REMOVED — parity is guard-enforced,
> never hand-counted), teaser comments (registry + App.tsx + surface-
> classification), catch-all soft-404 note, prerender-"not added yet"
> claims (registry + SeoHeadManager), index.html dead-era description →
> mirrors the registry "/" entry VERBATIM (parity now guard-checked).
> ⑤ SOCIAL/MACHINE LAYER: og:site_name · og:locale · og:image:alt ·
> twitter:site (@TheSyndicateOne) in all three head layers (template ·
> prerender · runtime; constants in brand.ts — one source); WebSite JSON-LD
> (homepage, NO SearchAction — the site has no search endpoint, declaring
> one would be invented) + BreadcrumbList JSON-LD (INDEX routes off-home,
> projected from the same registry breadcrumb the visible bar uses) baked +
> runtime-mirrored; theme-color meta synced live from the --background
> token (zero raw color — the no-raw-color guard caught my first hex
> attempt, as designed); /api serves X-Robots-Tag noindex,nofollow
> (deliberately NO robots Disallow — a crawl block would stop the header
> being read). ⑥ MISC: the 404 page's "Take your seat" now sources
> sharedCopy (→/join — the money path from the 404 can never drift);
> OperatorConsole's source console classifies against /os-source (the
> naming trap's FIRST VICTIM, caught by the reconcile fleet); Home.tsx →
> OperatorOverview.tsx (the founder-named Home-vs-PublicHome hazard dead;
> guard literals + replit.md updated — the adversarial pass caught the
> third literal at guard-operator-gate:123); routeMemory's two stale
> mappings truthed (dormant config). THE PRE-COMMIT ADVERSARIAL PASS: 11
> CONFIRMED all fixed · 1 refuted — headline: my own class-kill was
> INCOMPLETE (the /proof + /status renders survived it) and my slice
> summary CLAIMED an App.tsx edit never made; both corrected, the lesson
> recorded. DEFERRED (named, not silent): the 23-descriptions >160-char
> meta wave + guard ceiling (founder reads every rewrite on screen — its
> own copy slice) · the icon-asset micro-slice (apple-touch/PNG/manifest —
> BLOCKED on a founder artwork decision: today's favicon.svg is an
> OFF-BRAND cyan shield, not the gold mark; no local rasterizer exists —
> its own micro-slice) · the *Teaser filename renames. Gate: repo tsc 0 ·
> ALL studio guards exit 0 (drift 210 w/ reverse check · member-menu 34 ·
> member-home 30 · operator-gate green at the rename) · seo:check 435 ·
> surface:audit 296 · rewrites 52 · build + 27 shells · dist post-
> conditions proven (cross-canonical · WebSite/Breadcrumb · og:site_name ·
> theme-color · honest /archive description) · rig-verified (footer 6 new
> links + /studio dead-link absent · More dropdown Chronicle→/chronicle ·
> 404 CTA →/join · /proof + /status honest lines · API header live ·
> theme-color hsl token). **DEPLOY: 🚀 BATCHABLE (client + prerendered
> shells + ONE additive api header — fail-closed; prod keeps the old
> chrome until the next cycle). NEXT after founder GO: /admin-in-prod →
> M-INT-1 → A1 → B1.**

> **▶ ✅ ② MENU + ③ HOME SEALED IN PROD (2026-07-17, ONE Replit cycle as
> ordered — the batched deploy): prod entry bundle `index-8lM7E_3t.js`
> SHA-256 1751a00b…90f0 byte-identical to Replit's local rebuild PLUS the
> `MemberKpiRow-CaAhotU2.js` chunk byte-verified (a5108899…), anchor
> `e5de807`, 4 commits pulled (2b769d8 · 988616f docs + 1a8baac ② +
> e5de807 ③), 17/17 blob-verified, no migration, no env change.** PROD
> PROOF: ① /member + /toolkit both 200 serving the new bundle; ② the four
> menu groups in the served bundle (Member · The record · Growth ·
> Off-chain comfort); ③ the six KPI labels served incl. Receipts +
> Artifacts; ④ feed 78/78 byte-identical, zero 40-hex; ⑤ engine clean
> (cycles ok:2/failed:0, head 90,503,422 → 90,503,713, 6/6 scan units);
> ⑥ healthz ok + 24 source-status postures. Gates replayed green on Replit
> pre-publish (typecheck · build 27 shells · **member-menu 34/34 +
> member-home 30/30 now in the permanent chain** · receipt 83/83 ·
> access-state **983** — grew 959→983 by scanning the two new wallet
> modules, the guard working as designed · surface 278 · seo 431 ·
> rewrites 52 · the 17 api guards + DB). **The member menu (13 doors · 4
> groups · icons · gold active bar · the dead-click class dead) and the
> dashboard recomposition (my-work above world-news · 6 KPI tiles · the
> attention zone · own recent activity with verify anchors · the doors
> grid) are LIVE on thesyndicate.money. DEPLOY BACKLOG: EMPTY.** NEXT per
> the acted order: **AUD-ROUTE** (lens 6+9 P1s: alias canonical ·
> duplicates/orphans · the Home-vs-PublicHome class) → /admin-in-prod →
> M-INT-1 → A1 (receipt binder + placements ②③ + V2 Routed fold) → B1
> (THE FIRSTS engine). Next session boots on "hi".**

> **▶ 🏠 SLICE ③ HOME ✅ BUILT + FOUNDER GO AT THE PREVIEW GATE (2026-07-17):
> THE APPROVED DASHBOARD RECOMPOSITION — wireframe 2026-07-16 §3 zones
> Z1–Z8, sealed stays sealed.** Z2 KPI row 4→6 (`MemberKpiRow`): + Receipts (own D3
> rows.length — a served [] is a REAL 0, null is a dash) + Artifacts (own
> Archive ERC-1155 balances summed). Z3 `MemberAttention` (NEW): 0–2 cards
> from REAL state only — ① promotion due (own-row `promotionDue`, the
> founder-signature truth in calm words) · ② standing USDC approval open
> (live allowance read; ≥$1B renders "an effectively unlimited amount",
> never a 72-digit figure) — the founder's Z3 verdict honored (session-
> expiring dead; milestone-witnessed NOT readable today → honestly absent);
> empty = the approved quiet line VERBATIM, and the quiet line renders ONLY
> when EVERY class gave a definitive answer (an unreadable class gets the
> could-not-read line — overclaim killed). Z4 `MemberRecentActivity` (NEW):
> own last 5 purchases (block-desc), date · exact usdFromRaw amount ·
> engine · verify ↗ per row; View-receipt/binder affordances deliberately
> ABSENT (they ride A1 per the GO'd placement). Z5 pulse moved BELOW own
> work (my-work above world-news); referral + its anchor intact. Z8
> `MemberDoorsGrid` (NEW): the doors as grouped cards from THE one config +
> THE one exported icon table (can never fork from the menu); same-URL
> cards carry the same-door guard (no dead history entries). Visitor door
> composition UNTOUCHED. THE PRE-COMMIT ADVERSARIAL PASS (ultracode, 3
> lenses + refutation — 15 CONFIRMED all fixed · 3 refuted), the kills:
> ① the "printed its ticket at checkout" PAST-TENSE claim fabricated
> history for every pre-receipt-era purchase (V1 2026-06-04 onward) — now
> present-tense mechanism only ("a purchase made at checkout NOW prints
> its ticket"), guard-pinned; ② the quiet line could render while the
> promotion class was UNREADABLE (served standing:null without the
> definitive no-source marker) — the readability state machine now tracks
> each class; ③ failed fetches spun "Reading…" FOREVER — settled wrappers
> distinguish in-flight from failed (both zones); ④ unlimited approvals
> printed as astronomical dollars — named honestly; ⑤ Z8 same-URL cards
> pushed dead history entries — guarded; ⑥ guard-member-home scanned the
> WHOLE two-composition file (a visitor-branch mount satisfied dashboard
> pins — false green) — now region-scoped to the dashboard branch, ALL
> pins comment-stripped both directions, KPI-label regex prop-anchored,
> receipt-affordance ban widened. `guard-member-home` **30 pins**, wired
> into the guards chain. Rig-verified (the house injection, reverted +
> tsc-proven clean): Z-order exact (attention → recent → pulse), 6 KPI
> tiles, 13 door cards, honest fail-closed states everywhere (no session on
> the rig = could-not-read lines, never quiet, never stuck), 375 = zero
> overflow, images OK; the one sub-12px node is the SHARED LifecycleBadge
> atom (site-wide class, rides the queued P2 sweep — this slice authors no
> sub-12px). Gate: tsc ×2 · build 27 shells · ALL studio guards
> (member-home 30/30 · member-menu 34/34 · access-state 959 · receipt
> 83/83) · seo 431 · surface 278 · rewrites 52. **DEPLOY: 🚀 BATCHABLE
> (client-only, fail-closed, additive — prod keeps the S7-b dashboard until
> the next deploy). Deploy backlog: ② MENU (1a8baac) + ③ HOME — the next
> 🚀 DEPLOY carries both, ONE Replit cycle. NEXT per the acted order:
> AUD-ROUTE (lens 6+9 P1s) → /admin-in-prod → M-INT-1 → A1 → B1.**

> **▶ 🚪 SLICE ② MENU ✅ BUILT + GATE GREEN + FOUNDER GO AT THE GATE
> (2026-07-17, the wording rider rode): THE APPROVED MEMBER MENU — wireframe
> 2026-07-16 §2 realized.** `memberDoors.ts`: 13 rows in FOUR groups (Member:
> 5 primaries + Receipts locked-visible FUTURE "Coming later" via the EXISTING
> badge system · The record: Chronicle/Fire Ledger/Archive/Recognition/
> Protocol graph · Growth: Liquidity — the name stays, navigation never a
> member promise · Off-chain comfort: Settings pinned LAST, `separated`),
> a lucide icon KEY per door (config stays Node-loadable; MemberShell maps
> key→component, Record-total — a missing icon is a red build); label
> "Referral dashboard" → "Referral" (the approved table). `MemberShell.tsx`:
> compact icon rows; active = gold/10 tint + persistent 2px gold left bar +
> weight 600 + gold icon — shape AND color, never color alone (WCAG 1.4.1) —
> + `aria-current="page"` on rows AND mobile chips; hover border/45;
> focus-visible gold ring; group titles at the 12px floor (ADR-001 outranks
> the wireframe's 11px token); the /70 muted-foreground alphas purged (audit
> lens-8 light-theme contrast). THE DEAD-CLICK CLASS DIED (audit lens-14 P2 —
> it lives in these files): `RouteScrollManager` reads pathname+hash
> reactively via wouter's `useLocationProperty` (a wouter Link's pushState
> fires NO hashchange and wouter's location is pathname-only — the root
> cause) + a ~5s retry loop for late-mounting hash targets (#settings mounts
> only after session resolve), cancelled at the first user gesture; TIMER,
> never rAF — RIG-PROVEN: rAF never fires in a hidden/occluded tab (the same
> frame-freeze leaves mid-flight CSS transitions sampling stale colors — a
> rig artifact, not a code bug; pinned here for the next debugger).
> Rig-verified end-to-end: /toolkit → Referral door →
> /member#referral-dashboard scrolls the target to exactly the 80px header
> offset, aria-current follows; 13 chips at 44px, 375 zero overflow; both
> themes verified at the computed level (light gold #C3861D flips); images
> OK; zero slice console errors (the /wallet ConnectModal/Hydrate dev
> warning is PRE-EXISTING — proven at HEAD via stash; separate task noted).
> THE PRE-COMMIT ADVERSARIAL PASS (ultracode, 3 lenses + refutation — 11
> CONFIRMED all fixed · 5 refuted): same-door RE-CLICK now re-scrolls to its
> section with NO duplicate history entry (wouter Links never reach native
> same-hash behavior; preventDefault + the exported scrollToHash; rig-proven
> with the retry window dead — 1548px exact) · the retry loop RE-CORRECTS
> drift through its window (lazy content above the anchor pushes it away;
> Safari has no scroll anchoring) · cancel set grew pointer/mousedown
> (Firefox native-scrollbar = accepted residual, documented) · the inert
> mobile Receipts chip carries ITS badge "Coming later" (the chip row is the
> ONLY mobile menu; a dead tap must say why) · the guard was hardened
> against its own FALSE GREEN (an icon-less door used to render a 14th row
> while the count stayed green; pins now anchor to CODE shapes — a header
> comment can no longer satisfy them; bans widened to any px/rem sub-12 and
> any muted-foreground alpha). `guard-member-menu` **34 pins**, wired into
> the guards chain. THE WORDING RIDER (the queued P2 human-tongue checkout
> strings; full texts shown on screen at the gate; founder reply "GO menu /
> GO menu + wording" read as the fuller GO — recorded verbatim; ③ then
> CORRECTED by the adversarial pass, truth-first over the approved draft):
> ① "(claim gate · allowance · balance)" → "your eligibility, your spending
> approval, your balance…" · ② "slippage floor" → "Your minimum-received
> protection" · ③ the raw-error fallback is now attribution-NEUTRAL — 'The
> transaction did not go through. The reported reason: "<first line, marked
> … when truncated>"' (the line can be viem's or an RPC node's, not provably
> the wallet's — "Your wallet reported" was itself an invented claim, caught
> and killed pre-commit) — AND the receipt-wait is SPLIT from the write:
> after a signed+broadcast approve/buy, an RPC read failure now says "Your
> approval/purchase was sent (0x…) but its confirmation could not be read
> from here — the transaction stands on the chain regardless of this page"
> (the old path claimed "did not go through" for purchases that may have
> SUCCEEDED — the worst possible lie on the money path, dead). Bundle-proven:
> 5 living strings served ("The reported reason" · "Your approval was sent" ·
> "Your purchase was sent" · eligibility line · minimum-received line), the
> dead at 0 ("Your wallet reported" · the checkout "claim gate" parenthetical
> · "slippage floor could not" · "Referral dashboard"; the two surviving
> "claim gate" prose sites are the Chronicle entry + MembersProvenance
> historical truth, untouched by design). RIG RIDER (Windows): api-server
> `dev:rig` (the POSIX `export` dev script cannot run under cmd; the Replit
> path untouched) + launch.json points at it. Gate: tsc ×2 · build 27
> shells · ALL studio guards (access-state 959 · receipt 83/83 ·
> **member-menu 34/34**) · seo 431 · surface 278 · rewrites 52. **DEPLOY:
> 🚀 BATCHABLE (client-only, fail-closed, additive — prod keeps the previous
> menu + checkout strings until the next deploy; nothing breaks undeployed).
> Deploy backlog: THIS slice.** NEXT per the acted order: **③ HOME
> recomposition** (approved zones Z1–Z8; 6 KPIs; Z3 attention
> real-state-only; Z4 = D3 rows w/ View-receipt) → AUD-ROUTE →
> /admin-in-prod → M-INT-1 → A1 → B1.**

> **▶ ✅ THE COMPLETE RECEIPT PRODUCT SEALED IN PROD (2026-07-17, THE ONE-SHOT
> CYCLE — Replit-verified 6/6 on thesyndicate.money, prod entry bundle
> `index-BXOINcQ0.js` SHA-256 a02c6dae…dd58 byte-identical PLUS the
> JoinCheckout (9482b87c…) and ReceiptTicket (7909b1ed…) chunks byte-verified,
> anchor `cd2958f`, 14/14 blob-verified, no migration, html-to-image installed
> frozen-lockfile; pulled UNDER a GitHub REST outage via direct git smart-HTTP
> — pack-object cryptographic verification, an even stronger integrity proof):
> both commits live in ONE cycle as the founder ordered — `2f1ed57` THE
> RECEIPT SLICE + `cd2958f` THE SHARE-CARD RIDER. PROD PROOF: ① byte-identical
> bundles; ② /join 200 with the four living strings served ("Membership
> receipt — proof of purchase" · "WHERE YOUR MONEY WENT" · "TOTAL PAID" ·
> "syn-mark-gold" ×5); ③ the dead stay dead ("routing proof" 0× · "Referral
> payout" 0×); ④ feed 78/78 byte-identical, zero 40-hex; ⑤ engine clean boot
> (cycles ok:2/failed:0, head 90,495,238 → 90,495,534, 6/6 scan units — V1 ·
> V2A ×2 · V2B ×2 · V3); ⑥ healthz + 24 source-status postures. Replit gates
> replayed green pre-publish (tsc ×3 · 27 shells · receipt 83/83 ·
> access-state 959 · operator-gate 2563 · 17 api guards · surface 278 · seo
> 431 · rewrites 52 · dist probes). TWO HONEST CORRECTIONS RECORDED: the
> engine's canonical count is 6 SCAN UNITS (the earlier "10/10" counted
> verified files, not streams) · the public feed endpoint is
> `/api/backbone/feed` (`/activity` does not exist — my deploy block said
> /activity; Replit adapted and flagged it). **DEPLOY BACKLOG: EMPTY. The
> post-purchase dead end is dead IN PRODUCTION — a confirmed /join purchase
> now prints its ticket, exports its proofs, and shares the member's own
> card.** NEXT per the acted order: **② MENU** (the P2 human-tongue checkout
> rider may ride with it) → ③ HOME → AUD-ROUTE → /admin-in-prod → M-INT-1 →
> A1 (receipt binder + V2 Routed fold) → B1 (THE FIRSTS engine from §7b).
> Next session boots on "hi".**

> **▶ 🃏 RIDER RECEIPT-SHARE ✅ BUILT + FOUNDER GO ON THE RENDERED CARD
> (2026-07-17): THE 1200×630 SHARE CARD — and THE §6 ENGRAVING.** The card
> (`wallet/ReceiptShareCard.tsx`): 1.91:1 share standard, text inside the
> 90px central safe zone, ~130KB (300KB WhatsApp ceiling with quality
> step-down, pinned), **TOTAL PAID + the full proof line VISIBLE** — the
> founder caught my "recognition, never money" amount-hiding as a VISIBILITY
> LAW violation (the amount is already public in the tx the card's QR
> links to; hiding it is theatre). THE ORDERED ENGRAVING landed:
> `SETTLED_RULES_DO_NOT_RELITIGATE.md` **§6 RECEIPT & OUTWARD-ARTIFACT
> SETTLED BLOCK** (① amounts NEVER hidden — no-shame is doctrine; ② the
> buyer lexicon settled, dead words stay dead: contribution · routed/routing
> · payout · coupon-even-negated · net-routed; ③ REAL-ROW only, the mock
> class dead; ④ readability before decoration) — ENFORCED by guard pins
> (amounts-visible: the card MUST render commerce.total; canon-presence: the
> guard breaks if §6 leaves the doc; buyer's-tongue + red-line grew payout/
> net-routed; a violation is a RED BUILD, never a founder explanation). The
> card's QR = the member's OWN introduction link (prop from the ticket's ONE
> resolver site, pinned); Share = card file + proof text (native file-share
> when supported; fallback download + clipboard); print/PDF still carry the
> paper alone. Rig catch: the off-viewport clone rasterized BLANK — caught
> by LOOKING at the pixel artifact, fixed with the static-position clone
> override, pinned. **ALSO ENGRAVED: THE FIRSTS ENGINE
> (LIVING_ORGANISM_MASTER_PLAN §7b, founder-designed)** — firsts-per-class
> as an OPEN registry (never a hardcoded list; a new module's firsts join
> the watch structurally), the founder-reviewed seed inventory (B1 verifies
> EACH against the indexed chain — the record outranks the list), the
> receipt-witness tie (a FIRST is a milestone class; its ticket carries the
> gold witness; the Chronicle entry points back — verifiable museum pieces;
> historical FOMO only, never financial), doctrine whole (CHR-1 · anti-
> scarcity structural · Visibility Law), builds at B1's slot; nothing more
> rides early (the witness hook already shipped, pinned). Gate: tsc ×2 ·
> build 27 shells · ALL studio guards (**receipt 83/83** — the anti-mock pin
> went green at the injection revert, as designed) · seo 431 · surface 278 ·
> rewrites 52 · api guards green (2001 PASS). **DEPLOY: 🚀 THE ONE-SHOT —
> this rider + the sealed receipt slice (2f1ed57) ride ONE Replit cycle
> (founder order); the paste block handed at the session's part ③.**

> **▶ 🎫 SLICE RECEIPT ✅ BUILT + FOUNDER GO AT THE PREVIEW GATE (2026-07-16/17,
> FOUR live correction rounds ①–⑫ on the founder's screen — the approved
> wireframe realized, then corrected on sight): THE PROTOCOL RECEIPT — the
> post-purchase dead end is DEAD.** THE SPINE (`lib/protocolCommerceReceipt.ts`,
> kind-extensible): born ONLY from confirmed events (THE MIRROR FILTER — the
> type cannot express PARTIAL/PREVIEW), every figure the event's OWN field
> (NO-RECOMPUTE), TICKET-AMOUNTS-ARE-EXACT (full precision, lines sum),
> ORDINAL HONESTY (witness = caller-proven data or absent), ONE-DOOR-MAX.
> **⑫ FOUR-ENGINES HISTORY** (the founder's catch, twice — a bare "V2" tried
> to live in the spine comments and the new pin killed all three instances):
> V1 `TokensPurchased` (splits, no seat/era/rate) · V2a 0x0b883F…/V2b
> 0x507E9c… `Purchased`+paired `Routed` (a Purchased-alone ticket prints NO
> proof block — the fold rides A1) · V3 full 25 fields; HONEST ABSENCE typed
> (`| null`) and pinned. CHAIN-PROVEN AT THE GATE: the REAL #13 (V3) · THE
> FIRST PURCHASE (V1, block 87,158,947, 2026-06-04 — Seat #1, $3.50/$1.00/
> $0.50 summing to $5.00 exactly, NO era line) · seat #3's birth (V2a, block
> 88,105,075 — era/rate present, NO proof block) · 2 stress tickets from the
> REAL registries (Monolith $10,000 → 1,000,000 SYN · $9,999.99 cent-fractions
> $6,649.99335 summing exact). THE SURFACE (`wallet/ReceiptTicket.tsx`, zones
> A–G): the GOLD SYNDICATE MARK heads the paper (the issuer's seal — founder
> ⑤) · commerce block first ("Membership — Seat #N" from RECEIPT_PRODUCT_NAMES
> [kind] + **TOTAL PAID**) · proof block second ("WHERE YOUR MONEY WENT — in
> your own transaction" · "Referral · paid first" · "The remaining $X:" from
> the event's protocolContribution · Vault/Liquidity/Operations exact) ·
> doctrine line UPRIGHT full-contrast with gold accent (founder ⑩ — italic +
> font-serif now BANNED on the ticket by pin) · QR verify · ONE door from the
> wallet's REAL state (live First Signal read; both variants rig-proven) ·
> graceful degrade (founder ⑨: wide values wrap to their own right-aligned
> line; truncate/nowrap/ellipsis banned by pin; zero overflow at 375 through
> the stress maxima). EXPORTS PURE (founder ⑥): Save-image rasterizes the
> paper alone (toSvg + the house SVG→canvas path — toPng's decode() hangs,
> rig-proven), print-clean Save-as-PDF (print CSS + light-ink beforeprint
> hook), actions print-hidden outside the raster node. THE SHARE ARTIFACT
> (founder ⑪): share text = sealed proof + the member's OWN link via THE one
> resolver (payingSourceId, Ruling ① — pinned: reuse mandatory, ONE
> construction site, link NEVER in the paper region). BUYER'S TONGUE (founder
> ②③ + the ultracode 3-lens adversarial verify): "proof of purchase" (routing
> proof dead + pinned dead) · routed/routing + contribution banned from
> buyer-facing strings · "Avalanche C-Chain (43114)" · doors speak buyer
> words · the success line's "this page only reads it" family died. RIDERS
> FIXED IN PASSING: fonts `crossorigin` in index.html (Save-image would have
> failed IN PROD — CORS-unreadable stylesheet) · /join SEO note pre-C5 fossil
> ("transaction sending deliberately not enabled") truthed. **guard-receipt-
> ticket: 63/63 pins** incl. THE REAL-ROW CLASS PIN (founder ⑧ — no $-figure/
> hex literals in the module; NO page may ever mount the ticket/builder: the
> #14-mock class is structurally dead — the pin held the rig preview RED until
> its revert, exactly as designed) + the FOUR-ENGINES precision pin (bare "V2"
> can never return). DECISIONS AT THE GATE: product name "Membership" (④,
> approved as rendered) · share-card 1200×630 = the immediate next rider
> (⑦, the tall ticket's Save-image ships now) · placements ②③ (D3 rows "View
> receipt" + Receipts door + the V2 Routed fold) ride A1 per the GO'd plan ·
> /receipt/{txHash} = the engraved roadmap slice. QUEUED (P2 human-tongue
> wave, verifier finds, pre-existing): checkout "(claim gate · allowance ·
> balance)" · "slippage floor" · raw wallet-error passthrough. NEW DEP:
> html-to-image (rasterizer). ENV NOTE: pnpm --force stripped the win32
> native binaries (linux-only overrides by design) — restored durably
> (memory: windows-native-binaries-restore-recipe). Gate: tsc ×2 · build 27
> shells · ALL studio guards (access-state 948 · receipt 63/63 · era · copy ·
> 0 raw-color) · seo 431/43 routes · surface 278 · rewrites 52 · ALL 17 api
> guards (1268 PASS) · rig DOM-verified 5 tickets × 2 themes × 375+desktop,
> zero overflow, zero sub-12px, zero console errors; exports pixel-verified.
> **DEPLOY: 🚀 BATCHABLE (client-only, fail-closed, additive — prod's
> checkout keeps the previous success panel until the next deploy; nothing
> breaks undeployed). Deploy backlog: THIS slice.** NEXT per the GO'd plan:
> RECEIPT-SHARE rider (1200×630, its own mini-gate) → ② MENU → ③ HOME.

> **▶ ✅ THE DOUBLE DEPLOY SEALED IN PROD (2026-07-16, third-session boot —
> Replit-verified 6/6 on thesyndicate.money, prod bundle `index-Dakgj6M2.js`
> SHA-256 508a7535…1785229e byte-identical to the reproduced local build, anchor
> `2fcf348`, 72/72 blob-verified, no migration): the two pending truths are LIVE —
> ① the Holder Index serves memberTotal **14** (8 historical-freeze #1–#8 + 6
> V3-emitted #9–#14, timestamp coverage 14/14, run #5, snapshot hash 65acf2f1…
> exactly the founder-armed regeneration committed at 768c3c1) — the stale
> 2026-07-03 count of 10 is dead; ② /contracts serves ALL FOUR sale engines
> ("Membership Sale V2a" ×2 · "V2b" ×2 · "seats #3 to #5 were born here" in the
> served bundle; the bare "Membership Sale V2" label at 0 occurrences — the
> sale-scan 86/86 completeness pin holds in prod); ③ feed 78/78 reference lines
> intact, zero 40-hex; ④ engine 2 cycles OK, 6/6 units, head advancing
> 90,481,828 → 90,482,446, 10/10 protocol streams caught up (the boot partial
> self-repaired, known pattern); ⑤ /api/source-status serves its 24 postures;
> ⑥ the local-rig "V2 code present" residual flipped at deploy exactly as the
> AUD-TRUTH-3 seal predicted. Gates replayed green on Replit (tsc ×2 · build 27
> shells · ALL studio guards incl. access-state 935 · the 17 api guards incl.
> sale-scan 86/86, auth-zone 802, holder-index 66, member-continuity 92 ·
> surface 278 · seo 431/43 routes · rewrites 52); feed reference refreshed at 78;
> anchor advanced. Nothing to commit data-side — the snapshot pushed IS the one
> served. DEPLOY BACKLOG: EMPTY.** NEXT per the GO'd plan: **THE RECEIPT SLICE**
> (approved wireframe: zones A–G + identity head + living zone + next door).

> **▶ 🏁 SESSION SEAL (2026-07-16, second session) — THE CLEAN BASE DAY.**
> SEALED IN PROD TODAY (all Replit-verified on thesyndicate.money, every bundle
> byte-identical SHA-256): **D-TRUTH** (`index-BWApQcKx.js` — all 8 genesis seats
> stand: #1 Patron $70 · #6 Patron $50 · rest Citizen; feed byte-identical; D2
> ownership index warm; member-purchases route live; own Archive holdings on
> /wallet) · **BUILDER-LINK** (`index-DSnsVSxD.js` — every share surface advertises
> the PAYING source via ONE resolver; founder's end-to-end referral test unblocked)
> · **AUD-P0** (`index-D3GZLiNl.js` — /proof truth rewrite, the 3 converging P0s
> dead) · **AUD-T** (`index-ClCsdU33.js` — THE LEGAL LAYER: /terms /privacy /risk
> live, footer Legal group site-wide, the 4th P0 dead) · **AUD-TRUTH**
> (`index-Cw5BCIY1.js` — the lens-1/2/3 P1 era-drift sweep dead across 6 pages +
> FAQ JSON-LD + whitepaper + served API note; the checkout-ripping redirect fixed;
> pg pool crash-proofed; feed grew 75→78 with 3 GENUINE treasury moves) ·
> **AUD-TRUTH-2** (`index-DvclxgU9.js` — the founder's prod-walk fixes: admin map
> MOVED to /os-map via shared SurfaceMapSection, footer Console dead,
> PUBLIC-SEES-ADMIN-NEVER real; /recognition + /docs + Member Continuity promotion)
> — **plus the DATA STEP executed one-writer style: member-continuity run #5 (14
> records, on-chain match true) + holder-index snapshot REGENERATED (memberTotal
> 14, hash 65acf2f1…, reconciled 66/66) — committed here, prod says 14 at the next
> deploy.** ALSO TODAY: THE WIREFRAME ROUND (5 founder GOs: ticket incl. LIVING
> TICKET doctrine + real receipt #13 verbatim · menu 13 rows + icons · home zones ·
> THE RESEARCH-GROUNDED DESIGN METHOD LAW in ADR-001 with REAL-ROW + TICKET-
> AMOUNTS-ARE-EXACT · /admin neutral wall) at
> artifacts/mockup-sandbox/public/wireframes-2026-07-16.html · **THE TOTAL SITE
> AUDIT canon** at docs/audits/TOTAL_SITE_AUDIT_2026-07-16.md (31 agents, 184
> verified findings — ALL FOUR P0s NOW DEAD IN PROD; ~24 distinct P1s: lenses
> 1/2/3 killed today, lens-4 P1s ride /admin, a11y P1s ride menu/home slices) ·
> AUD-T's legal drafts archived at docs/legal/drafts/. **THE PLATEAU FOR THE NEXT
> SESSION (the founder-approved plan, in order): ① THE RECEIPT SLICE — wireframe
> approved: zones A–G + identity head + living zone + next door, OUR skin, both
> themes; kind-extensible ProtocolCommerceReceipt spine harvested from TheSyndicate
> quarry (protocol-commerce-receipt.ts + SuccessReceipt.tsx + source-attributed-
> receipts.ts, react-qr-code already a dep); born ONLY from indexed events
> (PARTIAL/PREVIEW die at the Mirror filter); figures from the event's own fields
> NEVER recomputed, EXACT precision (lines sum); REAL-ROW rule; V1 = checkout
> success (kills the post-purchase dead end) + print-clean Save-as-PDF; guard pins:
> ticket red line (discount/coupon/promo/reward/points/cashback/bonus banned in
> module), anti-scarcity living zone, one-door-max, ordinal honesty, no recompute
> literals; placements ②(A1 binder)+③(Receipts door) ride A1; the receipt roadmap
> (public /receipt/{txHash} · living ticket · receipt-as-artifact→lens 12) + hard
> filters engraved at build → ② MENU slice (approved: 5 primaries + THE RECORD +
> GROWTH + Settings pinned; gold tint + left bar + focus ring) → ③ HOME
> recomposition (approved zones Z1–Z8; 6 KPIs; Z3 attention real-state-only; Z4 =
> D3 rows w/ View-receipt) → ④ AUD-ROUTE (lens 6+9 P1s) → ⑤ /ADMIN-IN-PROD
> (Ruling ②: neutral wall, server-side operator sessions per OPERATOR_WALLET_AUTH
> canon, public-sees-admin-never guard on dist chunks; before M-INT-1 — the
> ledger's home) → ⑥ M-INT-1 → A1(binder) → B1 → A2 → M-INT-2 → S8 perf ·
> Archive→NFT naming decision (audit lens 12 options) · P2/P3 waves (incl. the
> API decimals field for raw figures · the 215 sub-12px sweep + guard).
> **AUD-TRUTH-3 (the founder's four-engines catch, sealed at handoff):** the founder
> asked "V1 V2 V2a V2b V3??" — chain truth: FOUR engines (V1 0x0020Df… · V2a
> 0x0b883F… · V2b 0x507E9c… · V3 0x2A6cFc…), no bare "V2" exists; but the public
> /contracts inventory listed THREE cards and its "V2" card was really V2b, and
> the canon CONTRACT_TARGETS label said "Membership Sale V2" for the V2b address.
> FIXED: V2a card added (seats #3–#5 born there) + V2b precisely labelled (cards
> + api label; internal KEYS untouched — they key DB rows) + THE STRUCTURAL CURE:
> sale-scan:guard grew the PUBLIC-INVENTORY-COMPLETENESS pin (86/86 — one
> precisely-labelled /contracts card per on-chain engine, the bare "V2" label can
> never return; the ABSENCE class now has a guard). WHY IT ESCAPED (recorded
> honestly): an absence has no string to scan — every truth lens verified CLAIMS,
> none reconciled inventory against the scan targets; the card predates the
> System-First law. Follow-up noted: the reality panel's code-present rows read
> from CONTRACT_TARGETS which carries no V2a key — adding it = a typed-union +
> live-read extension, its own micro-slice. OPEN FOUNDER DECISIONS CARRIED:
> entity + governing law · durable contact channel
> · log retention window · eligibility floor · checkout acceptance mechanics ·
> on-chain hash commitment of the legal docs · never-message-first policy ·
> counsel review lifts the draft label · Q5/Q6/Q9/Q13/Q20 (older). PENDING AT
> HANDOFF: the holder-index snapshot commit below needs its deploy (prod Holder
> Index says 10 until then — the paste block was handed with the seal). Next
> session boots on "hi" → THE RECEIPT SLICE.**

> **▶ 📷 SLICE AUD-TRUTH-2 ✅ BUILT + FOUNDER GO — COMMITTED, AWAITING DEPLOY
> (2026-07-16, the founder's own prod walk — 8 screenshots): ① /recognition
> "Archive memory: Not live yet" DIED → the honest dimension split (archive+
> chronicle live today; the recognition DIMENSION arrives with the model; badge
> FUTURE). ② /docs badge conflation DIED — docStatus labels say what the registry
> KNOWS: Open / Open · unlisted / Reference (READY-beside-nothing-stored and
> PENDING-beside-live-mints both dead). ③ PUBLIC-SEES-ADMIN-NEVER made real ahead
> of the /admin slice: the operator/admin surface map MOVED (never deleted) to
> /os-map via the NEW shared SurfaceMapSection (one registry projection, two
> homes, can never fork); public /status renders PUBLIC+MEMBER only; the footer
> Console group DIED site-wide (navigation.ts). ④ /status "Member Continuity —
> pending adapter" PROMOTED to READ_ONLY_PROOF (the own-row standing readback is
> live behind sign-in; note carries the sign-in truth; 161 pins green; postures
> never regress). ⑤ the raw-base-units figure on /status → rides the P2
> human-readable wave (needs an API decimals field, never string-sniffing).
> ⑥ Holder Index 10 vs 14 seats = the 2026-07-03 founder-gated snapshot is
> STALE — the rebuild rides THIS deploy's Replit instruction (Replit runs the
> gated builder, PASTES the regenerated snapshot, Claude Code commits — the
> one-writer choreography). Guard lesson: PostureBadge joined the lifecycle-label
> guard's accepted honesty labels (truthful widening). Gate: tsc ×2 · build 27
> shells · ALL studio + 17 api guards · seo 43 routes · surface 281 · rig
> DOM-verified (/status operator-free + map intact · /os-map all-audiences map
> w/ admin rows · /recognition · /docs · footer), zero console errors.
> DEPLOY: 🚀. ALSO ENGRAVED HERE — **AUD-TRUTH ✅ SEALED IN PROD (Replit 6/6,
> bundle `index-Cw5BCIY1.js` SHA-256 byte-identical, anchor `8705139`): the 4 new
> truths served · the 6 dead phrases at zero · source-status token /tokenomics ·
> FAQ JSON-LD two-ladders w/ Cornerstone=0 · feed 75→78 (3 GENUINE treasury moves
> indexed live during the window — living growth) · engine healthy, pool guard
> compiled in.** NEXT per the GO'd plan: THE RECEIPT SLICE (approved wireframe).

> **▶ 🧹 SLICE AUD-TRUTH ✅ BUILT + FOUNDER GO ON ALL TEXTS — COMMITTED, AWAITING
> DEPLOY (2026-07-16): THE SITE-WIDE ERA-DRIFT SWEEP — the audit's lens-1/2/3 P1
> layer dead (~13 distinct truth defects) + two P1 functional riders.** THE KILLS:
> /contracts (registry card speaks the PAYING truth, badge Paused→Verified · Proof
> of Fire live · "this app only reads" banner died) · /status ("Not live yet" gone
> from Contracts — live surface renders no label; operator source console badge now
> describes ITSELF (Preview), the retired sourceAttribution reason code no longer
> renders; the two "arrives with the backbone" summaries live-truthed) · /archive
> (the 4-lens Chronicle-denial defect dead: "solemn record is open" + Read-the-
> Chronicle button; the false this-page-reads-live claim died; "when the reads are
> wired" tail rewritten "what's here today, what's still building") · /learning (3
> pre-C5 fossils dead incl. "never as compensation" — the commission truth) ·
> /support (membership-live vs channel-unwired split honestly) · /docs (3 cards:
> "never a commission" died) · /faq (the REPEALED Citizen→Cornerstone SYN-balance
> rank system dead in the served JSON-LD — the two real ladders speak: capital axis
> Citizen→Monolith + Connector Emerging→Summit; banned rung title purged) ·
> /whitepaper (§8 PAUSED→VERIFIED "public minting is open today" · §10 referral +
> activity moved from future to "already active this way") · served API source-
> status token note (dead "nothing wired" + phantom /token surface → /tokenomics
> truth; 161 pins green). RIDERS: #40 the checkout-ripping redirect FIXED
> (FLOW_SURFACES list — sign-in inside /join /source /wallet /toolkit /liquidity
> resolves IN PLACE; out-of-flow still lands /member per the founder order) ·
> #41 pg pool "error" handler (an idle-connection error can no longer crash the
> api-server process). THE GUARD LEARNED 8 PHRASINGS (no-chronicle-entries ·
> reads-not-yet-wired · when-the-reads-are-wired · does-not-read-the-chain-yet ·
> never-a-commission · never-as-compensation · citizen-to-cornerstone ·
> arrives-with-the-backbone). Gate: tsc ×2 · build 27 shells · ALL studio guards
> (era stricter) · ALL 17 api guards (source-status 161) · seo 43 routes · surface
> 281 · rig DOM-verified 6 pages (old lies absent, new truths present, FAQ JSON-LD
> Cornerstone=0, zero console errors). DEPLOY: 🚀. NEXT per the GO'd plan: THE
> RECEIPT SLICE (approved wireframe + living-ticket doctrine + REAL-ROW/EXACT
> rules) → menu → home → AUD-ROUTE → /admin-in-prod → M-INT-1 → A1 → B1 → A2.

> **▶ ⚖️ SLICE AUD-T ✅ SEALED IN PROD (2026-07-16, Replit-verified 6/6 on
> thesyndicate.money, prod bundle `index-ClCsdU33.js` — SHA-256 a1bafe21…ba3dcfd0
> byte-identical to the reproduced local build — anchor `0ef9033`, 14/14
> blob-verified, no migration): THE LEGAL LAYER IS LIVE — /terms · /privacy · /risk
> all 200 with titles + the draft pill, the footer Legal group site-wide, sitemap 24
> INDEX incl. the three, the three key lines in the served bundle, feed byte-identical
> 75=75, engine healthy (10 protocol streams caughtUp). The audit's fourth P0 is dead:
> the protocol sells seats under published terms. Build + founder-GO record follows.**
> /terms + /privacy + /risk routed (PublicPage chassis, StatusPill "Version 1 —
> draft of 2026-07-16" — honestly awaiting qualified counsel per the doctrine's own
> header), footer-linked SITE-WIDE (new "Legal" group, registry-driven), SEO-registered
> (banned-word-free meta EVEN NEGATED per the truncation law), sitemap 21→24 INDEX,
> shells 24→27, surfaceClassification + modules entries added. The texts = the
> founder-approved drafts VERBATIM (7-agent fleet: canon+code harvest → draft →
> adversarial doctrine pass; 12 fact-corrections applied; drafts archived at
> docs/legal/drafts/). Founder-decision placeholders render as honest pending lines
> (entity/governing law/contact/retention — "arrives with the next version"), never
> invented. OPEN FOUNDER DECISIONS carried: entity+jurisdiction · durable contact
> channel · log retention window · eligibility floor · checkout acceptance mechanics
> (its own slice if adopted) · on-chain hash commitment of the docs · never-message-
> first policy · counsel review before the drafts lose their draft label. Guard
> lessons: negation-adjacency reflows + "financial product" prohibition phrasing +
> the storage-token note reword. Gate: tsc · build 27 shells · ALL studio guards ·
> seo 431 (43 routes) · surface 281 (27 public aligned) · rewrites 52 · ALL 17 api
> guards · rig-verified 3/3 (draft pills, key lines, footer Legal group, zero
> console errors, zero overflow). DEPLOY: 🚀. NEXT per the GO'd plan: AUD-TRUTH
> (the site-wide era-drift sweep, ~15 P1 defects) → receipt slice → menu → home.

> **▶ 🔥 SLICE AUD-P0 ✅ SEALED IN PROD (2026-07-16, Replit-verified 4/4 on
> thesyndicate.money, prod bundle `index-D3GZLiNl.js` — SHA-256 1218ef47…d8379c64
> byte-identical to the reproduced local build — anchor `e5598fb`, 41/41
> blob-verified, no migration): the audit's three converging P0s DEAD IN PROD —
> /proof serves the truth (title/pill/CTA/4 facet doors all in the served bundle),
> the 4 dead-era phrases at 0 occurrences in the whole served dist, feed
> byte-identical 75=75, engine healthy (known self-repairing boot cycle only).
> Build + founder-GO record follows: THE /PROOF TRUTH KILL.**
> ProofDashboard rewritten whole to today's truth (title "Proof, live from the chain." ·
> live lead/banner · 4 facets rewritten with doors to their living surfaces replacing
> dead badges · verification steps in present tense · honest StatusPill "Served from
> the public record" · CTA "Open the live record"); `safetyCopy.readOnly` ("view-only:
> no payments, no live chain reads") RETIRED at source with a dated never-revive note;
> the strengthened era-drift guard (4 new patterns: none-of-it-is-wired ·
> no-live-chain-reads · view-only-no-payments · paused-by-precaution) immediately
> caught + killed a SECOND live instance (OperatorPreview source panel's dead-registry
> claim → rewritten to the paying truth) — the P0 class can never ship again. SEO note
> rode. Gate: tsc · build 24 shells · ALL studio guards (era stricter) · ALL 17 api
> guards · seo 395 · rig-verified (lies absent, doors present, zero overflow).
> DEPLOY: 🚀 its own deploy per the GO'd slicing plan. NEXT: AUD-T (Terms/Privacy/Risk
> drafts — founder reads full text on screen) → AUD-TRUTH era-drift sweep (~15 P1
> defects) → receipt slice (approved wireframe) → the plan's order.

> **▶ ✅ THE WIREFRAME ROUND — ALL FIVE FOUNDER VERDICTS IN (2026-07-16; wireframes at
> artifacts/mockup-sandbox/public/wireframes-2026-07-16.html, committed as the approved
> record): ① TICKET GO** — with the founder's five figure-doubts ALL CONFIRMED against
> the chain (real receipt member #13 · block 90,160,483 · tx 0x353bf2…2178 decoded
> 2026-07-16: gross $5.00 → acquisitionCost $0.25 PAID FIRST → protocolContribution
> $4.75 → vault $3.325 / liquidity $0.95 / operations $0.475 — ALL the event's own
> fields, 25-field MembershipPurchasedV3; synOut 500 SYN at synPerUsdc 100; the mock's
> $5.50/11,478-SYN/fake-tx/stitched-date/Vanguard-pairing all corrected); THE REAL-ROW
> RULE + TICKET-AMOUNTS-ARE-EXACT engraved in ADR-001 with the METHOD LAW; PDF stance
> accepted (print-clean V1, engine at /receipt/{txHash}). **② MENU GO** (grouping+icons;
> GROWTH keeps its name — navigation, not a member promise; count corrected 12 doors +
> Receipts-at-its-slice = 13 rows). **③ HOME GO** (all zones; "session expiring"
> dropped from Z3 — founder instinct upheld: a system event, not a decision; replaced
> by standing-approval-revoke). **④ LAW GO verbatim** — in ADR-001. **⑤ /ADMIN: the
> neutral wall** (zero admin vocabulary at the bare URL; console reveals only after the
> server confirms the operator role); build after the audit. **THE TOTAL SITE AUDIT
> FLEET RETURNED (31/31 agents, 15 lenses + adversarial verification, zero errors)**
> — **CANON at docs/audits/TOTAL_SITE_AUDIT_2026-07-16.md: 184 verified findings
> (P0 ×4 · P1 ×41 (~24 distinct) · P2 ×64 · P3 ×75, 0 refuted, 9 corrected).
> THE P0s: three converge on /proof — the flagship verify page publicly claims
> "view-only: no payments, no live chain reads" + "none of it is wired yet" while the
> protocol SELLS SEATS LIVE (ProofDashboard.tsx:23-99 + sharedCopy.ts:34-35) — and
> the fourth is the MISSING TERMS OF USE during live sales (lens 7). SLICING PLAN
> (in the doc §Slicing plan, awaiting founder GO): ① AUD-P0 /proof truth kill →
> ② AUD-T terms/legal drafts (founder reads full text on screen; pairs with S5) →
> ③ AUD-TRUTH site-wide era-drift sweep → ④ receipt slice → ⑤ menu → ⑥ home →
> ⑦ AUD-ROUTE routing/SEO → ⑧ /admin-in-prod (before M-INT-1 — the ledger's home) →
> ⑨ M-INT-1 → A1(binder) → B1 → A2 → M-INT-2 → ⑩ S8 · Archive→NFT decision ·
> P2/P3 waves. Next meeting point: the founder reads the audit + GOes the plan.**

> **▶ 🔗 MICRO-SLICE BUILDER-LINK ✅ SEALED IN PROD (2026-07-16, Replit-verified 4/4
> on thesyndicate.money, prod bundle `index-DSnsVSxD.js` — byte-identical SHA-256 to
> the local build — anchor `a8a43c6`, 9/9 blob-verified, no migration): founder
> Ruling ① LIVE — every share surface (link card · share card · quick-action copy)
> advertises the source that PAYS the wallet via ONE resolver (payingSourceId:
> server-resolved own-row sourceIdHex first, canonical derivation fallback; the two
> doctrine pins amended DATED, the public snapshot stays raw-sourceId-free). PROD
> PROOF: ① signed-out source-standing 200 S1-honest with sourceIdHex:null; ② the
> provenance line "This is your founder-signed source's link" in the served bundle;
> ③ feed byte-identical 75=75, zero wallet addresses (87 raw matches = 64-hex tx-hash
> prefixes, boundary semantics hold); ④ engine 2/2 cycles, 6/6 units, head advancing.
> THE FOUNDER'S END-TO-END PRODUCTION REFERRAL TEST IS UNBLOCKED. NEXT (the approved
> ①→④ sequence): the WIREFRAME ROUND on the founder's screen (enriched receipt ticket
> incl. THE LIVING TICKET doctrine — identity head · living zone · next door · V1
> print-clean-PDF stance · phased roadmap + hard filters engraved at its build ·
> member-menu door→icon map + active state · post-login home named zones ·
> Piece 4 law text · /admin-in-prod security gate) + THE TOTAL SITE AUDIT fleet
> launches at the handover.**

> **▶ 🧭 SLICE D-TRUTH ✅ SEALED IN PROD (2026-07-16, Replit-verified 6/6 on
> thesyndicate.money, prod bundle `index-BWApQcKx.js`, anchor `235205c`, 32/32
> blob-verified, no migration): PROD PROOF — ① capital-standing 200 with real
> standing for ALL 8 genesis seats (seat 1 → Patron, 70000000 raw = $70 cumulative ·
> seat 6 → Patron $50 · seats 2–5/7/8 → Citizen $5 · correct nextRung each · ?seat=abc
> still 400) — the V1×frozen-roster join LIVE; ② the feed BYTE-IDENTICAL 75=75 lines
> vs the pre-deploy reference (capital-rise 14=14, zero new lines, zero 40-hex) — the
> founder's no-retroactive-lines decision held exactly as the guard proved; ③
> member-purchases honest S1 shape signed-out; ④ D2 ownership index WARM
> (introductionRefresh refreshed:true · 3 attributed rows · 2 distinct sources ·
> asOfBlock tracking head) both clean cycles; ⑤ both new strings in the served bundle,
> member chunks zero-address, dropdown ≥12px; ⑥ /member + /wallet clean, engine 2/2 ok
> cycles, head advancing, only the known self-repairing boot cycle in the historical
> lastError register (verified by design, never cleared by success). Build+founder-GO
> record follows (2026-07-16, founder "GO D-TRUTH" + sequence ①→④ approved as argued):
> THE OLD DATA ENTERS THE DASHBOARD.** D1 GENESIS FOOTPRINTS: the capital walk joins
> every early-era row (V1 + V2B pairing sentinels) to its frozen genesis seat via
> HISTORICAL_FREEZE_WALLETS as an OPTIONAL builder input (runner supplies it; the pure
> builder stays DB-free) — **STANDING ONLY: the rise record is byte-identical with and
> without the join, guard-proven (backbone.guard builds the walk both ways and demands
> identical rises); `GENESIS_JOIN_EMITS_RISES = false` source-pinned — the founder's
> no-retroactive-lines decision, reversible only at a founder gate.** The three false
> copy sites died (KPI tooltip "early-era not derivable" · CapitalAxisCard "joins soon"
> · capital-standing route note). D2 FOUNDER-SIGNED SOURCE FALLBACK: sourceOwnershipIndex
> (lib/protocol, server-only in-memory) holds payoutWallet→sourceId edges captured from
> the introduction refresh's EXISTING SourceRecord decode (zero new RPC, zero DB, zero
> backfill — REUSE-BEFORE-CREATE; the audit's lifecycle-rows fold was IMPOSSIBLE:
> decodeLifecycleLog persists decodedJson={} — corrected at build); readOwnSourceStanding
> falls back canonical→owned (first live-EXISTS wins), serves `sourceOrigin:
> "canonical"|"founder-signed"`; warming state honest ("index warming", never a false
> "no source exists"); client provenance line on the referral dashboard. D3 OWN PURCHASE
> ROWS: ownPurchaseReadmodel (pure, same lane, wallet-keyed SERVER-ONLY) + runner retain
> + NEW auth route GET /api/auth/member-purchases (cookie-only, member-standing
> discipline verbatim, 64-hex anchors pass the boundary-aware gate) + CapitalAxisCard
> gains "Your purchase record — every entry verifiable" (progressive disclosure, date ·
> floored $ · verify ↗ — the sum's addends; rig-verified 5.00+50.00+5.50 = $60.50).
> D6 ZERO IS 0: Introductions KPI renders "0 durable · 0 total" on the registry's
> definitive no-source answer (dash = unreadable only; tooltip says so). D5 OWN ARCHIVE
> HOLDINGS (re-verified CONFIRMED by fresh adversarial scout — shown nowhere, derivable
> client-only): /wallet gains "Your Archive artifacts" (live ERC-1155 balanceOf ids 1+3,
> address from verify-links nftArchive, fail-closed WHOLE). Stale sourceDecoders header
> corrected dated (M0 reads sourceConfig). SEO rode the slice (/member + /wallet notes).
> GATE RECORD: tsc ×2 · build 24 shells · ALL 14 studio guards (access-state 915) ·
> ALL 17 api guards (auth-zone 802 · backbone w/ 4 new D1 pins) · seo 395 · rewrites ·
> surface 254 · +0 raw color · rig DOM-verified (S7 screenshot-down precedent): member
> state via debug intercept (Member #1 wearing Patron · $60.50 · 2 durable · zero-mode 0
> · intercept cleared, real state confirmed back) · 2/2 images · 0 sub-12px · both themes
> · 375 zero overflow · zero console errors. **DEPLOY: 🚀 (server read-models + auth
> route + member surfaces; NO migration, NO backfill) — Replit: pull main, deploy,
> report. D2 warm-up nuance: after each restart, standing says "warming" until the first
> introduction-refresh cycle (honest, minutes).**
> **THE FOUNDER PACKAGE + RULINGS (2026-07-16, verbatim decisions — the acted plan):**
> sequence ①→④ APPROVED: ① this seal → ② WIREFRAME ROUND on the founder's screen (no
> code before approval): (a) THE PROTOCOL RECEIPT "ticket" — kind-extensible commerce
> receipt spine harvested from TheSyndicate quarry (protocol-commerce-receipt.ts +
> source-attributed-receipts.ts + SuccessReceipt.tsx — CONFIRMED present; react-qr-code
> already a dep); founder wireframe contract zones A–G (header/meta/seat/money/total/
> QR-verify/action-bar incl. Save-image); OUR skin (command-room ink + gold), both
> themes; born ONLY from indexed/confirmed events (Mirror Rule: PARTIAL/PREVIEW die);
> figures from the event's own fields, floored, never recomputed; placements: checkout
> success ① · A1 receipt binder ② · Receipts door ③; (b) MEMBER LEFT MENU: door→icon
> mapping for approval + unmistakable active state (tint + left indicator, never color
> alone) + focus ring + 5–7 primaries or grouping proposal; (c) POST-LOGIN HOME
> research-grounded (Linear/Stripe/Vercel-class study) — named zones: identity band ·
> 4–6 decision KPIs · attention · recent activity (feeds on D3) · doors; EXTENDS S7-b,
> sealed stays sealed; (d) PIECE 4 LAW engraving text inline (ADR-001: THE
> RESEARCH-GROUNDED DESIGN METHOD: research → named-zone wireframe → founder approves →
> build on tokens+laws → preview gate). → ③ TOTAL SITE AUDIT (ultracode, 15 lenses,
> ONE sweep, audit-only, docs/audits/ dated canon doc; brief recorded in the 2026-07-16
> founder message) launches right after the wireframes are handed — its lenses then
> check the approved wireframes before build. → ④ build order: Receipt slice (checkout
> success — kills the post-purchase dead end) → menu → home recomposition → re-confirmed
> M-INT-1 → A1-as-receipt-binder → B1 → A2 → M-INT-2; S8 + S5 queued.
> **RULING ① BUILDER LINK: YES** — micro-slice: the link card serves the source that
> PAYS the wallet (founder-signed BUILDER first when canonical differs; generalized
> paying-source-first; own-row sourceIdHex served; the two doctrine pins
> (sourceStandingRead header "sourceId never leaves" + introductionReadmodel ADR-003
> no-raw-sourceId posture) amended DATED; 64-hex passes the gates) — SLOT: first build
> slice right after this deploy's Replit verification (no wireframe needed — Visual
> Change Law ③ copy/truth class; unblocks the founder's end-to-end production referral
> test). **RULING ② /ADMIN IN PRODUCTION: GATE IT** — the control room ships in prod
> reachable ONLY by direct URL + real server-side operator/founder session (fail-closed,
> never client-only hiding), ZERO public trace (no link/nav/sitemap/SEO/feed/bundle
> strings on public+member surfaces — public-sees-admin-never joins admin-sees-public-
> never); read ADMIN_SHELL_SPEC + RBAC canon before proposing auth (step-up for founder
> root if canon defines); full blast radius: build flags, guards, deploy. Historical
> scar (5 prior iterations): admin LEAKED into public frontend — the failure was leaks,
> not admin-in-prod. SLOT: gate presented WITH the wireframe round; build lands after
> the audit (lens 4 public/private boundary informs it — zero rework). OPEN ITEMS
> CARRIED: sourceId-echo now RESOLVED by Ruling ① · Q5/Q6/Q9/Q13/Q20 still unanswered ·
> 219 sub-12px general-sweep sites + no-sub-12px guard queued. Founder meeting points:
> gates and wireframes only. Next session boots on "hi" → the wireframe round (② above)
> unless the Replit report is pasted first (then: verify seal, then ②).

> **▶ 🏁 SESSION SEAL (2026-07-16) — THE MEMBER DASHBOARD DAY + THE TOTAL AUDIT.**
> SEALED IN PROD TODAY (all Replit-verified on thesyndicate.money): **S7** (the
> approved wireframe: full-screen centered door · ONE connect CTA · the truth sweep —
> zero samples, modules badges dead on live surfaces, bundle `index-Cta5zhDH.js`) ·
> **S7-b/c/d** (the world-standard dashboard: identity band + 4 live KPI tiles + pulse
> leads + capital card w/ ladder+next+shield + protocol-today + Chronicle cards +
> Settings door · THE 3 DESIGN LAWS engraved in ADR-001: READABILITY FLOOR ·
> FLUID SURFACE · OWN-ACCOUNT DISPLAY (GAMIFICATION doctrine — Sephora account
> pattern, settled forever) · the WCAG zoom cure (maximum-scale removed) · bundle
> `index-lSsHS13k.js`). **S7-e ✅ SEALED IN PROD (Replit 6/6, bundle
> `index-CJU-JUzs.js`, 19/19 blob-verified — the MemberWalletPanel chunk hash
> byte-identical local↔prod; the 40-hex rise 13→40 in the main bundle fully
> classified as viem/wagmi library constants redistributed by chunking, member
> chunks at zero; honest residue: one 10px in JoinCheckout + one 11px in
> MemberWalletPanel = 2 of the 219 mapped general-sweep sites; engine 2/2 cycles,
> lastError null; capital-standing still serving the extended shape):**
> the 18 audit-confirmed defects dead — human number display (formatRawUnitsDisplay,
> FLOORED so money never overstates: 6,260.06 SYN · 2.99 USDC; KPI + /wallet +
> checkout) · 9 jargon sites rewritten human-first (memberNumberOf parenthesized,
> "fail-closed" never said to a buyer, server diagnostics humanized w/ exact reason
> in tooltip, ladder next-rung line in plain English, alias/slots/wait states) ·
> **header sign-in LANDS on /member** (both success points: rainbowAuthAdapter.verify
> + reSign, wouter navigate) · bell tooltip era-drift cured · header dropdown raised
> to the 12px floor. **THE TOTAL AUDIT (ultracode fleet: 35 agents · 9 lenses · 170
> findings · 24 adversarially confirmed) is CANON at
> `docs/audits/MEMBER_HOME_TOTAL_AUDIT_2026-07-16.md`** — the complete backlog:
> confirmed defects (all fixed in S7-e), data-slices, 21 design gaps, 20 polish, the
> 86-item ledger (incl.: avatar storage decision CLOSED = Replit App Storage; old
> founder questions Q5/Q6/Q9/Q13/Q20 still unanswered; 219 sub-12px sites mapped for
> the general sweep + future no-sub-12px-text guard). DOCTRINE RECORDED: admin-sees-
> public-never is SETTLED (§D operator design; no ADR-003 amendment needed — the
> over-call pattern memory-pinned). **THE PLATEAU FOR THE NEXT SESSION (founder-GO'd
> order): ① D-TRUTH — the old data enters the dashboard: D1 genesis footprints
> (V1 purchases × frozen roster join — buyer+amount already indexed, memberRoster
> maps wallet→seats #1-8; serve per-seat cumulative; VERIFIED derivable) · D2 the
> founder's referral standing (source-standing derives ONLY canonical keccak
> sourceId — add own-row fallback: any indexed source whose payoutWallet == bound
> account; VERIFIED BY HASH: BUILDER_SOURCE = snapshot row src_36101e67… with $0.50
> paid) · D3 own purchase history rows (all indexed) · D6 zero ≠ unavailable in KPI
> tiles · (D5 archive own holdings — re-verify, quota killed its verifier) →
> ② M-INT-1 member ledger (operator dossiers/RFM) → ③ A1 My Activity → ④ B1 the
> Firsts/Chronicle queue → ⑤ A2 My Chronicle → M-INT-2. Heavy design gaps to inject
> at their slices (audit §C): member has NO expand/Join action on own dashboard ·
> post-purchase dead end (no door to Member Home) · silent session-expiry demotion ·
> em-dash conflates loading/error/absence · CapitalAxisCard vanishes on 500 ·
> via= channel (R3) never built · door mini-stat badges. S8 perf + S5 (founder
> paste) queued. Next session boots on "hi".**

> **▶ 🎛 SLICE S7-b/c/d ✅ SEALED IN PROD (2026-07-16, Replit-verified 6/6 on
> thesyndicate.money, prod bundle `index-lSsHS13k.js`, 26/26 blob-verified incl. the 5
> new member components, no migration — 142/142): PROD PROOF — visitor door unchanged
> (desktop+mobile) · the member dashboard ships in the lazy member chunks (4 KPI tiles ·
> capital card w/ shield line · protocol today · Chronicle · Settings door) ·
> capital-standing serves the extended shape (seat 14: Citizen · 5000000 · next Resident
> $10 · the 12-rung ladder; 400 on abc) · THE WCAG CURE IS LIVE (no maximum-scale,
> viewport-fit=cover, pinch-zoom free) · /member chunks carry ZERO sub-12px classes
> (header dropdown + other pages = the noted general sweep) · feed 75 lines zero 40-hex ·
> zero console errors · engine 2/2 cycles healthy. FOUNDER FOLLOW-UP OPENED AT THE SEAL
> (prod screenshot, S7-e + data-truth): 18-decimal SYN balance must format human ·
> the memberNumberOf teaching line reads as jargon · header sign-in must LAND on
> /member · genesis footprints + the founder's own referral standing show "—" while THE
> REAL OLD ON-CHAIN DATA EXISTS (V1 purchases × frozen roster; BUILDER_SOURCE payout =
> the founder's wallet) — must be derived, never dashed · plus the full design-research
> inventory audit (all repo specs vs the built page). Original build record follows:**
> BUILT + FOUNDER GO AT THE PREVIEW GATE (2026-07-16, four live
> art-direction rounds): THE MEMBER DASHBOARD AT THE WORLD
> STANDARD + THREE GENERAL DESIGN LAWS ENGRAVED (ADR-001 amendments, researched).
> **S7-b THE DASHBOARD** (after-login standard — Binance/Coinbase/QuickNode: portfolio
> first, recent activity, system state; never a program as the landing): connected
> /member = identity band (compact; receipt chip + verify right) + **4 live KPI tiles**
> (Your SYN · Your USDC — NEW hook off the engine's own USDC() · **Your footprint
> "$cum · rung"** · Introductions) + work grid (THE PULSE LEADS — 5 §8 lines w/ verify
> anchors, gains My|Protocol with A1 — then the full referral module, anchor intact) +
> right column drawn from the doors (**CapitalAxisCard**: own cumulative + ladder 12
> rungs + "Next: X at $Y" + exact progress bar + THE SHIELD LINE guard-pinned ·
> **ProtocolSnapshot**: 5 live spine facts incl. seats WITH MembersProvenance
> (guard-freshness enforced) · **ChronicleLatest**: the register's newest entry ·
> reserved slots) + Settings DOOR added to the left menu (founder catch). THE
> OWN-ACCOUNT DISPLAY RULE engraved in GAMIFICATION_LEGAL_DOCTRINE (founder: "recognizes
> capital without reducing identity to capital"; Sephora account pattern — own amounts/
> ladder/next legal because a rung unlocks recognition ONLY; the public feed's no-amount
> voice UNTOUCHED; my third public-vs-own-row over-call retracted, memory pinned).
> capital-standing route EXTENDED {cumulativeUsdcRaw, ladder, nextRung} (backbone pin
> amended, dated). TWO founder-screenshot defects killed: "Sign in required" lied to a
> signed-in no-source member (3 distinct states now) · Notifications badge overlapped
> its text (Row flex-wrap; badge FUTURE — the record is live, the surface isn't).
> **S7-c THE READABILITY FLOOR** (ADR-001; WCAG/A11Y-researched): reading copy ≥14px ·
> labels/meta ≥12px · KPI values 20px · card titles 16px · NOTHING user-facing <12px —
> applied to the whole /member composition (measured: 0 sub-12px in BOTH states) AND at
> TOKEN level (syn-eyebrow/label/caption 11/10/9→12px · --text-caption→12px ·
> VerifyOnChain 9→12 · MembersProvenance 10→12 — sitewide atoms; home spot-checked
> 1440+375 clean). Remaining: the general sweep (~121 arbitrary micro-classes on other
> pages) + future guard no-sub-12px-text — noted in ADR-001. **S7-d THE FLUID SURFACE
> RULE** (ADR-001 bis): app surfaces FLUID full-width (no cap; gutters px-4/6/8; cards
> bound line length) · prose keeps 1200–1440 · viewport-fit=cover + body safe-areas
> (iOS/Android notches) · **maximum-scale=1 REMOVED — the site-wide zoom block was a
> WCAG 1.4.4 violation, caught & cured** · svh/dvh never bare vh · touch targets ≥44px
> (door chips measured 44) · test standard 320→2560. Dashboard measured edge-to-edge at
> 1920; 375 clean. Green: tsc ×2 · ALL studio guards (access-state grew: KpiRow +
> CapitalAxisCard pins + shield-line pin) · ALL 17 api guards (backbone 143 amended
> pins) · seo 395 · surface 254 · build 24 shells · +0 raw color. DEPLOY: 🚀 (server
> route extension + the whole dashboard + the a11y viewport cure). NEXT: **M-INT-1**
> (the member ledger — operator-side dossiers/RFM from indexed data) → A1 → B1 → A2 →
> M-INT-2; S8 perf; S5 on the paste.

> **▶ 🚪 SLICE S7 ✅ SEALED IN PROD (2026-07-16, Replit-verified 6/6 on thesyndicate.money,
> prod bundle `index-Cta5zhDH.js`, 25/26 files blob-verified + 1 deletion confirmed, no
> migration — 142/142 parity): PROD PROOF — the centered full-screen door serves (desktop
> AND mobile viewport), `capital-standing?seat=14` answers 200 with the REAL walk's rung
> (`"rung":"Citizen"` — seat #14's honest $5 footprint) and 400 on `?seat=abc`, the hero
> structure ships (seat/receipt/chapter/rung pill; connected state validated by the
> founder at the preview gate), ZERO sample figures in the bundle ("$120"/"SAMPLE-CODE"
> absent), /activity intact (75 lines incl. 5 capital rises, zero 40-hex), zero console
> errors; engine 2/2 cycles, zero partial, lastError null. FOLLOW-UP OPENED AT THE SEAL
> (founder, video + QuickNode reference): the CONNECTED member state must become a true
> full-width dashboard — S7-b wireframe first (Visual Change Law), research-grounded
> (Binance/Coinbase/Kraken/Revolut/QuickNode class); the acted order flexes: S7-b
> wireframe → M-INT-1 → A1 → B1 → A2 → M-INT-2. Original build record follows:**
> BUILT + FOUNDER-APPROVED AT THE PREVIEW GATE (2026-07-16, two live
> art-direction rounds on the rig; founder "go in the right order, grade AAA for all"):
> MEMBER HOME — THE APPROVED WIREFRAME REALIZED + THE LIVE-vs-NOT TRUTH SWEEP.
> THE PAGE (two states, ONE connect CTA): visitor = the FULL-SCREEN CENTERED door band
> ("Your seat lives here." · one RainbowKit connect+SIWE CTA, locale pinned en-US ·
> honesty verbatim "proves control of a wallet" + "session ≠ membership" — guard §16
> re-pinned, dist probe "ever your own row" replaced the machinery word) · member = the
> YOUR-SEAT HERO (sigil 72px · Member #N as h1 · Seat Held · **capital rung pill** —
> title only, served by NEW public route `/api/backbone/capital-standing?seat=N` from
> the canon walk's `standingBySeat` fold (backbone guard 141→143: base-Citizen state
> readback, unwalked-seat absence, {seatNumber,rung} EXACT shape) · chapter · SYN ·
> receipt · memberNumberOf verify teaching · honest unreadable+retry state). The dead
> band DIED; the jargon FELL (6 facet tabs + the 6-stage Holder-Index table — which
> LIED "Member Home… not live today" — retired; 3 human steps for visitors); the
> session panel RETIRED (WalletSessionPanel deleted; guards §15/§16 adapted, auth-zone
> dist probes updated). FOUNDER ART-DIRECTION AT THE GATE (both fixed same-day):
> ① FULL SCREEN — the band fills the first viewport (65svh mobile / 100svh−header
> desktop, `calc(100svh_-_3.75rem)` underscore form — the space-less calc DROPPED as
> invalid CSS on the founder's browser and silently fell back to mobile height, caught
> from his screenshot); ② CENTERED SCENE — the left-anchored block read "boxed" on wide
> screens; both axes centered now. **THE TRUTH SWEEP (founder order: live-vs-not from
> PROTOCOL REALITY, never page text):** referral dashboard REAL-ONLY (the "no figure
> here is live yet" banner lie DIED — R5 is live; the 3 SAMPLE blocks with fake dollars
> DELETED from config; ShareCard became REAL — own indexed figures + real derived link,
> renders only on a real standing read; signed-out standing badge PENDING_ADAPTER →
> AUTH_REQUIRED "Sign in required"); Archive door → "Open today" (Coming-soon group
> emptied and removed); away-slot → FUTURE ("the event record is live; this member
> surface arrives on it"); modules.ts badges DIED on live surfaces (/member
> AWAITING_FOUNDER_APPROVAL/draft → live+honest description · /proof · /referral ·
> /archive — the /join precedent: a live surface renders NO TruthLabel); /archive page
> badge → READ_ONLY_PROOF "Verified — view only"; dead `protocolSurfaces` config
> DELETED; `surfaceStatus` 4 keys marked RETIRED-FROM-RENDER with dated note;
> standing/actions hooks re-read on SESSION_CHANGED (the page resolves IN PLACE after
> connect — no reload). /member SEO title → "Member Home — Your Seat, Your Standing" +
> honest notes (rides the slice). RIG-VERIFIED (DOM-level; the pane's screenshot
> capture was down): both themes · 375+desktop · zero overflow · images loaded · both
> states exercised via debug fetch-intercept (cleared, real state confirmed back) ·
> zero samples served · band full-screen measured exact · the pre-existing dev-only
> ConnectModal/Hydrate console warning proven on bare main (not this slice, absent in
> prod builds). Green: workspace tsc ×2 · ALL 14 studio guards (access-state §15/§16
> adapted) · ALL 17 api guards (backbone 143 · member-continuity 92 · protocol-time 38
> — route-surface pins extended for capitalStanding.ts · auth-zone 782 with the new
> dist probes) · seo 395 · surface 254 · build 24 shells · +0 raw color. DEPLOY: 🚀
> (server route + visible member home — the founder art-directed it live; backlog
> empty, nothing batched). **DOCTRINE CLARIFICATION RECORDED (never re-raise): admin
> member-intelligence needs NO ADR-003 amendment** — the operator track already designs
> the users/member-registry tab, audit log, exports (WALLET_FIRST…USER_REGISTRY_DESIGN
> §D); ADR-003 forbids the PUBLIC directory + the wallet↔person link, not the gated
> business console; S1/S3 stay untracked by design; my red-line over-call retracted
> (second occurrence of the partial-read failure mode — memory pinned). **THE ACTED
> ORDER (founder work order 2026-07-16, "go in the right order, grade AAA for all"):
> ① M-INT-1 the member ledger — operator-side per-seat dossier + RFM/at-risk segments
> + internal rankings (durable ambassadors · footprints · active/dormant), from
> ALREADY-INDEXED data (capital walk + R5 + roster + heartbeat lanes), founder-gated
> S11+, zero new collection, zero public-surface change → ② A1 "My Activity" — the
> member's own-row lens on the indexed record (bridge design decided at ITS gate) →
> ③ B1 THE FIRSTS — derived firsts-per-class detection (first burn/community-LP/
> referred-purchase/rung-rise…) feeding a Chronicle-candidates queue in the console
> (CHR-1 intact: the machine PROPOSES, the founder PROMOTES) → ④ A2 "My Chronicle"
> (own milestones + register presence) → ⑤ M-INT-2 the §D users-registry/audit
> surfaces. S8 perf + S5 (founder paste) stay queued behind. On-chain prospect views
> (SYN-holders-without-seats) ride M-INT; session-logging of unsigned connects stays
> OUT (S3 invisible by design).** Next session boots on "hi".

> **▶ 🏁 SESSION SEAL (2026-07-15) — THE H2 DAY: the complete heartbeat's founding
> inventory, opened and CLOSED in one session, every slice SEALED IN PROD on
> thesyndicate.money (final bundle `index-CZSNZlO5.js`).** THE LEDGER (8 slices, 6
> deploys, zero regressions, all Replit-verified): **⑬ MILESTONES** (11 canon defs,
> 4 sealed + anchored — the protocol's own dates entered the record: first seat Jun 4 ·
> First Signal Jun 6 · Patron Seal Jun 7 · $100 routed Jun 17; approaching honest;
> + the /activity Re-read repair) · **⑦ TREASURY under THE FOLD LAW** (the founder's
> anti-duplicate requirement as structure — 17 movements ALL folded as routing detail,
> then the catch-up surfaced TWO genuine vault SYN inflows nobody typed; burn
> sovereignty pinned) · **⑫ ERAS** (witness pattern; all three engines era 1 — armed
> honestly empty; ANTI-SCARCITY engraved as structure: no countdown/approaching shape
> can exist) · **H2-P THE PRIDE OF THE PUBLIC RECORD** (founder doctrine amendment,
> ADR-003 2026-07-15: member masking repealed on the feed — the origin voice restored;
> THE SHORT-FORM LAW: only 0x123…abcd ever serializes, the 40-hex scanners stay armed —
> proven in prod: 28→48 short forms, ZERO leaks, the veiled degrade never fired; the
> 17 archive mints backfilled from the chain's own logs 17/17, one transaction) ·
> **H2-P-a THE NAMED REFERRER** (founder override B→A same day: "brought by
> 0x3f2…0a91" — the 3 referred purchases name their bringers; the same referrer twice
> on the record — the growth engine visible; alias layer M2/M3 will replace the address
> on this line) · **⑭ CHRONICLE** (register-derived, promotedUtc structural, no
> invented anchors, "read the record →"; chip decision A: "Referral registry") ·
> **⑰ CAPITAL AXIS** (12 founder-named rungs Citizen→Monolith; 5 genuine footprint
> rises found in history — Seat #6 →Advocate→Patron · #9 →Resident · #12
> →Resident→Advocate; rung + ordinal only, NEVER the amount; the RED LINE guard-pinned;
> rungs never descend) · **⑩ DEPLOYMENTS** (8 births chain-verified at the gate —
> June 4 = THE BIRTH DAY: token + first sale + public market in one day; Jun 21 = the
> referral architecture in one act; canon pins reconciled EXACTLY; the pool's own
> line). **PROD TODAY: 75 served lines + 8 deployments + 4 Chronicle promotions
> client-derived · 13 filter chips · the Milestones panel · named members, bringers,
> minters (short-form) · zero full addresses ever · engine at its cleanest.**
> **DEPLOY BACKLOG: EMPTY.** LAWS/DOCTRINE ENGRAVED TODAY: THE FOLD LAW (a transfer in
> a narrated tx is routing detail — folds every future class automatically) · THE
> SHORT-FORM LAW + the pride amendment (ADR-003, recorded, core intact: no KYC, no
> directory, no lookup, no enrichment beyond one event; the founder-voice rule stands) ·
> ANTI-SCARCITY extended to eras + capital (structural, guard-pinned) · THE WITNESS
> PATTERN as the house pattern (milestones/eras/capital) · BURN SOVEREIGNTY · the
> capital RED LINE (recognition only, never a financial edge) · CHR-1 honored (no
> invented anchors, ever). NOTED FOR LATER (not opened): the era-facts table on
> /tokenomics (marketing, doctrinally clean — founder interest logged) · treasury
> external counterparties stay unnamed (extensible by founder call) · the DEX-trader
> class stays OUT unless its own gate · S7 reads capitalAxisReadmodel's ladder for the
> seat's standing rung. **THE PLATEAU FOR THE NEXT SESSION: ① S7 MEMBER HOME first —
> wireframe ALREADY founder-approved (two states: door band / your-seat hero; ONE
> connect CTA; dead band dies; jargon falls), code NOT started, THE PREVIEW GATE + the
> visually-complete rule apply (rig with MSYS2_ENV_CONV_EXCL="BASE_PATH", image check,
> both themes, desktop AND mobile, founder's own browser before ANY commit); ② S8
> PERFORMANCE (throne webp fine; header logo PNG 284KB + avax mark 195KB = the cheap
> wins); ③ S5 THE SOUL DOCUMENT — awaits the founder's paste (SUPERSEDED-TERMS banner
> spec recorded).** Next session boots on "hi" per the standard boot sequence.

> **▶ 🏛️ SLICE H2-⑩ ✅ SEALED IN PROD — AND H2 IS CLOSED (2026-07-15, Replit-verified on
> thesyndicate.money, prod bundle `index-CZSNZlO5.js`, 7/7 blob-verified, no migration —
> client-only; founder GO — sentence 1 + the pool line): DEPLOYMENTS — the protocol's
> births, chain-verified, and THE HEARTBEAT'S FOUNDING INVENTORY IS COMPLETE.** PROD
> PROOF (Replit): the pool line ships VERBATIM ("The SYN/USDC pool was created — the
> public market opened."), the Deployments chip live (13 chips), the 8 chain-verified
> creation-tx anchors in the shipped bundle; ADDRESS DISCIPLINE PROVEN AT DEPTH — Replit
> REFUSED TO SEAL until it traced 3 non-library 40-hex constants: all three = the LP
> pool's public infra links (DexScreener/Trader Joe URLs, founder-verified canon from a
> prior sealed slice, identical in the previous bundle; THIS slice adds zero addresses);
> the served feed: zero 40-hex across 75 lines; vocabulary conform (the doctrine speaks
> by refusing); zero regression; THE CLEANEST STARTUP OBSERVED YET — 2/2 cycles, zero
> partial, zero failure, lastError null.** THE DISCOVERY (read-only, at the gate): all 8
> deployment blocks + creation transactions binary-searched from the chain
> (eth_getCode + receipts) — SYN Token 87,149,157 · Sale V1 87,157,852 · LP Pair
> 87,163,331 (ALL THREE 2026-06-04 — the protocol's BIRTH DAY, matching the first-seat
> milestone) · Archive1155 87,331,091 (Jun 6) · V2a 88,095,827 (Jun 15) · V2b
> 88,193,183 (Jun 17) · Source Registry 88,502,674 + V3 88,505,301 (BOTH Jun 21 — the
> referral architecture born as one act); the three canon sale pins reconciled EXACTLY
> against the chain (both records proven). DESIGN: `deploymentRegistry.ts` (studio
> canon, provenance-noted, the ⑭ pattern WITH real anchors — every line's verify link
> opens a real creation tx; client-derived, server untouched, zero persistence);
> sentence 1 founder-voiced ("Membership Sale V3 was deployed — a founder act,
> permanent on Avalanche.") + the pool's own line ("The SYN/USDC pool was created —
> the public market opened."); "Deployments" chip (13 chips); the ⑫ note closes (an
> engine's era-1 birth is ⑩'s line); a future deployment joins the registry in its
> own slice per the Completeness Invariant. RIG-VERIFIED with REAL canon data (no
> fixture): all 8 lines rendered block-ordered with real anchors, filter isolates,
> zero console errors. Green: workspace tsc · studio guards · seo 395 · surface 254 ·
> build 24 shells (api suite untouched — client-only). DEPLOY: 🚀 BATCHABLE
> (client-only, fail-closed). **THE H2 ARC IS COMPLETE: ⑬ milestones · ⑦ treasury +
> Fold Law · ⑫ eras · P pride + P-a named referrer · ⑭ Chronicle · ⑰ capital axis ·
> ⑩ deployments — the founder-ticked inventory of 2026-07-15, all built in ONE day,
> every prior slice already SEALED IN PROD.** NEXT PLATEAU: S7 member home (wireframe
> approved, preview gate) · S8 performance · S5 on the founder's paste.

> **▶ 🪨 SLICE H2-⑰ ✅ SEALED IN PROD together with ⑭ (2026-07-15, Replit-verified on
> thesyndicate.money, prod bundle `index-rz_RHitB.js`, 14/14 blob-verified, no migration
> — 142/142 columns dev==prod; founder GO — names as the gate table, sentence 1, chip
> yes): THE CAPITAL AXIS — per-seat footprint recognition under the witness pattern's
> third application.** PROD PROOF (Replit): **THE AXIS CAME ALIVE — the feed grew 70 →
> 75 lines with FIVE genuine footprint rises, each anchored to its exact crossing
> purchase: Seat #6 → Advocate then Patron (Jun 17, two separate purchases) · Seat #9 →
> Resident (Jun 23) · Seat #12 → Resident then Advocate (Jul 5).** Every engraved rule
> held on the record: rung title + seat ordinal only (NO amount field exists in the
> lines), one-purchase-one-line verified (the same-seat pairs come from distinct
> transactions), the Chronicle promotion voice ships in the bundle with the "Referral
> registry" chip, ZERO 40-hex in the feed (the bundle's 13 hex constants = wallet-SDK
> library sentinels, not protocol/member addresses; "passive income" = the disclaimer's
> negation only). Zero regression (the prior 70 lines byte-intact incl. the 3 named
> referrers); engine 2/2 cycles, first post-boot cycle partial then self-resolved
> (designed). Gate green at Replit (heartbeat 137 · backbone 141 · auth-zone 775 ·
> source-status 161). **DEPLOY BACKLOG: EMPTY.** THE FOUNDER-NAMED REGISTER (canon,
> `capitalAxisReadmodel.ts`, guard-pinned verbatim): Citizen $5 (BASE — the seat's birth
> state, never a line) · Resident $10 · Advocate $25 · Patron $50 (deliberate harmony
> with the Patron Seal, founder call) · Strategist $75 · Vanguard $100 · Architect $250 ·
> Benefactor $500 · Guardian $1,000 · Keystone $2,500 · Inner Circle $5,000 · Monolith
> $10,000 — six origin names renamed per SPEC_REFERRAL §⑨ (role/axis/class collisions).
> THE SETTLED DOCTRINE AS STRUCTURE: the RED LINE guard-pinned (no financial-benefit
> vocabulary can exist in the module — recognition only, the Sephora precedent); a rung
> never descends; one purchase crossing several rungs = ONE line (the highest); V1 rows
> excluded with an honest note (no ordinal, never guessed); NO approaching/progress
> shape (the anti-scarcity pin's third extension); the line carries rung TITLE + seat
> ordinal, NEVER the amount (seat lines never carry money). SENTENCE (founder pick 1):
> "Seat #14 rose to Vanguard — a footprint recognized on the capital axis, never
> revoked." DERIVATION: per-seat cumulative gross USDC over the SAME gapless lane
> (memberNumber + amounts, already whitelisted — zero new persistence, zero live reads
> needed); feed kind "capital-rise" + lanes.capital + derivedRank (the consequence law);
> "Footprint" chip (12 chips). RIG-VERIFIED: sentence 1 verbatim + tie-break above its
> witnessing purchase + chip row + zero console errors (debug intercept, cleared).
> S7 NOTE: the member home reads THIS canon file for the seat's standing rung. Green:
> workspace tsc · ALL api guards (backbone 130→141: register pins · red-line vocab ·
> witness-walk fixtures · V1-exclusion honesty · anti-scarcity shape) · studio guards ·
> seo 395 · surface 254 · build 24 shells. DEPLOY: 🚀 BATCHABLE — carries ⑭ (the two
> ride together; on deploy the historical rises derive on the first cycle). NEXT IN H2:
> ⑩ deployments (the LAST heartbeat class) — then H2 CLOSES; S7 (wireframe approved) ·
> S8 perf · S5 on the paste.

> **▶ 📜 SLICE H2-⑭ ✅ SEALED IN PROD together with ⑰ (2026-07-15, Replit-verified,
> same deploy `index-rz_RHitB.js`; prod proof: the promotion voice in the shipped
> bundle, the register-derived lines with "read the record →" and NO invented anchors,
> "Referral registry" chip live; founder GO + chip decision A on the gate): CHRONICLE
> PROMOTIONS JOIN THE HEARTBEAT — register-derived, client-only, honest about what a
> promotion IS.** CHR-1 respected structurally: a promotion is a founder COMMIT,
> not a chain event — so the line derives CLIENT-SIDE from the committed register (the
> one truth; the server/scans/DB untouched — no parallel copy); the register interface
> gained `promotedUtc` (structural field, the 4 entries stamped 2026-07-14 per their
> promotion comments; the console's ChroniclePrepare snippet now emits it); NO INVENTED
> ANCHORS — the line wears the PROMOTION date alone (never "block 0") and links INTO the
> record ("read the record →" /chronicle#id) where the entry's own verifyNote teaches
> chain verification. SENTENCE (§8 RESERVED graduated TITLED): "“The duplicate seat”
> entered the Chronicle — promoted by the founder, recorded forever." (untitled reserved
> form = the degrade). ORDERING: chain lines keep exact block order among themselves; a
> register line slots by its promotion DAY and reads as the day's headline. CHIP
> DECISION A (founder): the lifecycle chip renamed "Referral events" → **"Referral
> registry"** (it filters the registry's own admin acts; member referrals live inside
> seat lines "brought by 0x…") + new "Chronicle" chip (11 chips). RIG-VERIFIED WITH
> REAL DATA (no fixture — the register ships in the client): all 4 promotion lines
> rendered titled + dated + linked, the link lands on /chronicle#id, zero console
> errors. SEO/lead ride ("Chronicle promotions join from the committed register").
> Green: workspace tsc · studio guards · seo 395 · surface:audit 254 · build 24 shells.
> DEPLOY: 🚀 BATCHABLE (client-only, fail-closed; prod feed gains the 4 promotion lines
> + the two chip changes on deploy). NEXT IN H2: ⑰ capital axis (HOME_RANK_LADDER
> harvest + per-seat cumulative spend; seat numbers public) → ⑩ deployments; then S7
> (wireframe approved) · S8 perf · S5 on the paste.

> **▶ 🤝 SLICE H2-P-a ✅ SEALED IN PROD (2026-07-15, Replit-verified on thesyndicate.money,
> prod bundle `index-ByNwYhu1.js`, 82/82 blob-verified; FOUNDER OVERRIDE — item 5 revised
> B → A the same day, on the advisor's argument the founder confirmed): THE REFERRER IS
> NAMED.** PROD PROOF (Replit): **the 3 referred purchases in history now name their
> referrer short-form in the public feed — Member #14 (0xea8…5881) brought by
> 0x88e…dd73 (the founder's own source, Jul 13) · Member #13 (0x0dd…4d20) brought by
> 0x244…c721 (Jul 12) · Member #10 (0x620…c75f) brought by 0x244…c721 (Jun 25). THE SAME
> REFERRER APPEARS TWICE — the growth engine made visible, exactly as the founder
> argued.** The short-form law held again: 48 short forms served (15 distinct), ZERO
> full 40-hex anywhere (the 70 tx hashes are 64-hex, excluded by the bound), zero
> malformed — the veiled degrade never had to fire. Zero regression (70 lines: 26
> purchases · 17 mints ALL with minter · 8 burns · 4 milestones · 2 treasury · LP/source
> intact). Engine 2/2 cycles, first post-boot cycle partial then self-resolved (designed).
> **DEPLOY BACKLOG: EMPTY.** WHY (founder engraved): the referrer is the proud party — referrer
> pride is the growth engine (SPEC_REFERRAL §⑨ honour-roll; paid referral kits later —
> a veiled referrer defeats the product). STRUCTURALLY CLEAN BY THE GATE'S OWN LOGIC:
> sourceWallet lives in the SAME V3 purchase log — one event republished, no relationship
> join (the aggregation concern doesn't apply; ADR-003 amendment revised accordingly,
> recorded). MACHINERY: loader whitelist += sourceWallet (loader-confined, both suites
> re-pinned); referrerAddress SERVER-ONLY through the model → referredByShort (short
> form) on seat lines; sourceId still boolean-only (the id never leaves); MALFORMED-
> WALLET DEGRADE: the veiled wording ("brought by a verified referral") survives ONLY
> as the honest gap, never a guess; alias-layer note recorded (M2/M3: the alias replaces
> the address on this same line). FLAG NOTED FOR THE ⑭ GATE (advisor, founder decides
> there): the "Referral events" chip labels registry ADMIN lifecycle — propose a clearer
> label. RIG-VERIFIED: the A line + the degrade rendered verbatim, zero console errors.
> Green: workspace tsc · ALL api guards (activity 137 · backbone 130 with the named-
> referrer pins: full referrer address never serializes, referredByShort short-form
> pinned) · studio guards · build 24 shells. PUSH WAS DELIBERATELY HELD while the
> H2-P(B)+backfill deploy was in flight at Replit (mid-cycle race avoidance) —
> **RELEASED with this seal: H2-P-a is on origin. DEPLOY BACKLOG: H2-P-a (`c5e5033`,
> 🚀 BATCHABLE — client+server voice change, fail-closed; on deploy the ~3 referred
> purchases in history name their referrer short-form on the next rebuild).**

> **▶ 🦁 SLICE H2-P ✅ SEALED IN PROD (2026-07-15, Replit-verified on thesyndicate.money,
> prod bundle `index-DQjWV_6N.js`, 19/19 blob-verified incl. the backfill script; FOUNDER
> DOCTRINE AMENDMENT — gate first, then GO; item 5 shipped as B, overridden to A the same
> day in H2-P-a below): THE PRIDE OF THE PUBLIC RECORD — the member-address masking
> REPEALED on the feed; the origin voice restored.** PROD PROOF (Replit): **28 short
> forms serve on member acts and ZERO full 40-hex addresses leak anywhere — the
> short-form law held under real fire**; THE BACKFILL RESTORED ALL 17 ARCHIVE MINTS
> (dry-run first: each row re-proven from the chain's own logs — exact block, hash +
> logIndex, artifactId/quantity re-decoded and confronted; then `--write`: one
> all-or-nothing transaction, post-write verify 17/17 — 11 First Signal + 6 artifact #3,
> 7 distinct minters, short forms only at the console); the next backbone cycle rebuilt
> and the feed's 17 archive lines now speak their minter; ZERO regression (70 lines
> intact — 8 burns · 4 milestones · 2 treasury acts; the 4 shared hashes = the witness
> pattern, legitimate); one transient RPC-caprice cycle failed CLOSED and self-repaired
> from the cursor — the designed discipline, observed live. Gate green at Replit
> (heartbeat 137 · backbone 130 · auth-zone 768 · source-status 161). THE AMENDMENT RECORDED (never silent): ADR-003 gains its
> 2026-07-15 amendment block — §1.2 NARROWED not deleted (the feed republishes what ONE
> chain event itself carries; NO lookup API, NO roster endpoint, NO enrichment, NO
> cross-event join; the core stands: no KYC, no directory, own-row zone untouched).
> THE STRUCTURAL KEY: only the SHORT FORM (0x123…abcd — 3+4 hex, exact-shape-pinned)
> ever serializes; the full address stays server-only and the UNCHANGED output scanners
> (40-hex) stay armed — a full member address in any payload is still a red build/500.
> VOICE (§8 amended, origin verbatim): seats "Member #15 · 0x123…abcd entered the public
> registry." (repeat → "expanded their footprint"; V1/pre-amendment rows keep the H1a
> voice — honest gap, never a guess) · archive "0x123…abcd archived First Signal · token
> ID 1." · burns/LP: Community short form joins the FACTS row; THE FOUNDER VOICE RULE
> STANDS (founder acts say the founder, no short form) · the client WINDOW speaks the
> same registry voice (one lexicon). WHO-BROUGHT-WHOM = B VEILED (founder decision):
> "— brought by a verified referral" — a BOOLEAN reduced from the event's own sourceId
> in the loader (the id never leaves, guard-pinned); form A (the nominative edge) is
> RESERVED for the Referrer Kit arc, never a silent extension. MACHINERY: loader
> whitelist {+buyer, +recipient, +sourceId→boolean} (both guard suites re-pinned; the
> gated literals '"buyer"'/'"recipient"'/sourceId reclassified LOADER-CONFINED);
> memberNumber/memberAddress/referred ride ActivityItem server-only → projection emits
> {memberNumber, memberShort, referred} on seats, {actorShort} on burns/LP (Community
> only), {artifactId, minterShort} on archive mints; the ARCHIVE_MINT decoder now stores
> the minter + `archive:minter-backfill` (founder-gated, DRY-RUN default, --write to
> apply) restores the 17 historical mints FROM THE CHAIN'S OWN LOGS — one transaction,
> cross-checked fail-closed per row, decoded_json only: THE named write-discipline
> exception, recorded in ADR-003. CHRONICLE REGISTER HOLDS (my read, stated at the gate:
> its identity-blind line is the register's own literary discipline; promotion is a
> human act — the founder writes future chapters as he wishes). Aggregate status report
> stays blind (forbidden-fields extended: memberAddress/memberShort/referredBySource).
> SEO/copy ride: /activity lead (the "address-safe" claim → the pride truth), §8 render
> rules, sourceStatus notes, protocolOsMap reality (its stale "no route no UI" claim
> also cured), ACTIVITY_HEARTBEAT_READ_MODEL.md. RUNTIME-VERIFIED on the rig (debug
> fetch-intercept, cleared after): all five voices rendered — pride+veiled referral ·
> repeat · V1 fallback · archive origin-verbatim · burn facts short form; zero console
> errors. Green: workspace tsc · seo 395 · rewrites · surface:audit 254 · ALL studio
> guards · ALL 17 api guards (activity 137 · backbone 130 — the identity-blind family
> REWRITTEN into pride pins: full-address absence + short-form presence + founder-voice
> split + non-lowercase-actor throw · member-continuity emitter pins hold untouched —
> short forms can never be 40-hex) · build 24 shells. DEPLOY: 🚀 recommended (server +
> client + the founder-gated backfill step: after publish, Replit runs
> `archive:minter-backfill -- --write` ONCE and reports; forward mints carry the minter
> from the first cycle). NEXT: ⑭ Chronicle lines on the settled voice → ⑰ → ⑩ → S7 ·
> S8 · S5. (⑫'s Replit seal remains pending its deploy report — separate thread.)

> **▶ 📖 SLICE H2-⑫ ✅ SEALED IN PROD (2026-07-15, Replit-verified on thesyndicate.money,
> prod bundle `index-BnljnxgH.js`, 17/17 blob-verified, no migration — 13 tables / 142
> columns dev==prod; founder GO after the marketing-vs-guardrail exchange — the
> anti-scarcity doctrine explained and CONFIRMED, the era-facts-table idea noted as a
> possible future /tokenomics slice): ERA TRANSITIONS ARM THE HEARTBEAT UNDER THE
> WITNESS PATTERN.** PROD PROOF (Replit): the eras lane is ACTIVE with **zero era
> lines — exactly what truth requires** (all three engines read era 1 live; the class
> armed honestly empty); the anti-scarcity doctrine holds in the shipped bundle (no
> countdown/progress/pressure shape — the only "countdown" is the doctrine sentence's
> own negation; Replit's initial "only … left" hits self-diagnosed as greedy-regex
> artifacts on the minified bundle, strict scan clean); zero regression (fold law
> holds, zero duplicate txs, zero addresses, burns #1–#8, 4 milestones anchored);
> engine at its CLEANEST start yet (2/2 cycles, zero partial, all streams caughtUp).
> **⑦'s BONUS TRUTH LANDED IN THE SAME VERIFICATION: the treasury cold catch-up
> FINISHED and TWO GENUINE TREASURY ACTS emerged from the fold — two SYN inflows into
> the vault (≈4,998,500 and ≈6,989,000 SYN, 2026-07-10), each anchored to its exact
> transaction, organ labels only. The feed grew 68 → 70 lines — the lane's first
> genuine lines, discovered by the machinery, not typed by anyone.**
> **DEPLOY BACKLOG: H2-P (`89646ba`, the pride amendment) — NOT YET DEPLOYED; its
> deploy carries the founder-gated backfill step (`archive:minter-backfill -- --write`,
> once, report the row count).** THE CHAIN'S TRUTH READ AT THE GATE (public RPC, live):
> all three engines (V2A · V2B · V3) answer currentEra()/activeEra() = 1 — ZERO era
> transitions have ever occurred; every purchase in history was era-1. NO EraAdvanced
> event exists in any deployed ABI — a transition's only witnesses are the era field on
> each V2/V3 purchase + the live views. DESIGN: the witness pattern (milestone family) —
> within ONE engine's gapless history, the first purchase carrying era n anchors "The
> protocol entered era {n}" to its exact tx (the §8 RESERVED sentence GRADUATED verbatim);
> cross-engine restarts are ⑩'s story, never a transition; birth-era > 1 = honest note,
> never an invented anchor; era regression fails the build closed. THE ANTI-SCARCITY
> DOCTRINE ENGRAVED AS STRUCTURE (guard-pinned): the era model exposes NO approaching/
> progress/remaining/countdown shape — LINE-ON-CROSSING ONLY (era bounds are bytecode,
> never framed as scarcity pressure; the seat-not-security shield). MACHINERY: era joins
> the loader whitelist ({firstSeat, memberNumber, usdcAmount, usdcIn, grossUsdc, era} —
> a public protocol parameter, both guard suites re-pinned); pure eraReadmodel.ts;
> runner ③b3 with ONE fail-soft live currentEra() read on the ACTIVE engine (V3) as
> overclaim protection (contradiction → withheld + note; sealed engines are frozen chain
> truth, no read needed); SELECTOR_CURRENT_ERA pinned + derived (targets guard 209);
> feed kind "era-transition" {era, engine} + lanes.eras + the tie-break generalized to
> derivedRank (milestone + era rank newer than their witnessing event — the consequence
> law). Client: parse + sentence + engine-as-fact + "Eras" filter chip (10 chips; honest
> empty until history writes the first line). §8 canon: RESERVED row → LIVE-armed H2-⑫
> section. SEO-rides-the-slice: /activity lead/banner/next-card ("era turns"), meta
> description + notes, sourceStatus proof note. RUNTIME-VERIFIED on the rig: fail-closed
> path (10 chips, honest empty, zero console errors) AND the era line exercised via the
> debug fetch-intercept (sentence + (V3) fact + tie-break above its witnessing seat +
> filter isolation; patch cleared, real state confirmed back; the ⑬ Re-read repair
> proven again in passing). Green: workspace tsc · seo 395 · rewrites · surface:audit
> 254 · ALL studio guards · ALL 17 api guards (backbone 115→127 · activity 136 ·
> targets 209) · build 24 shells. DEPLOY: 🚀 BATCHABLE (additive + fail-closed; the
> class arms itself on the first post-deploy cycle and serves ZERO lines today — the
> honest outcome; the feed changes only the lane flag + enumerations until the chain
> turns its first page). NEXT IN H2: ⑭ Chronicle lines → ⑰ capital axis → ⑩
> deployments; then S7 (wireframe approved) · S8 perf · S5 on the paste.

> **▶ 🏦 SLICE H2-⑦ ✅ SEALED IN PROD (2026-07-15, Replit-verified on thesyndicate.money,
> prod bundle `index-tJ-y8ufg.js`, 15/15 blob-verified, no migration — 13 tables / 142
> columns dev==prod; founder GO A on the gate — the three routing organs, USDC + SYN):
> TREASURY MOVEMENTS JOIN THE HEARTBEAT UNDER THE FOLD LAW — the founder's
> anti-duplicate requirement, engraved as structure.** PROD PROOF (Replit): **THE FOLD
> LAW HELD ITS FIRST REAL-WORLD TEST** — 17 treasury movements indexed at verification
> time, ALL routing detail of already-narrated transactions (purchases · liquidity),
> ALL folded: the 68-line feed shows ZERO transaction duplicates and ZERO addresses
> (organ labels only); burns #1–#8 sovereign and intact; the 4 milestone crossings
> still anchored; feed categories unchanged (26 purchases · 17 mints · 8 burns · 4
> liquidity · 4 milestones · 9 source); reality spine + holder index (10 members) live;
> engine healthy 2/2 cycles, first post-boot cycle partial then self-repaired via
> cursors (the known cold-scan pattern); "passive income" in the bundle = existing
> disavowal copy only, doctrine-conform. Full gate green at Replit (heartbeat 136 ·
> backbone 115 · auth-zone 761 · source-status 161 · DB 42/42). HONEST TAIL (autonomous,
> no action needed): the 4 treasury streams finish their paced cold catch-up (~1–2 h);
> any GENUINE historical treasury act (a transfer in an otherwise-silent tx) surfaces
> as a Treasury line with its anchor when its block is reached — the lane is declared
> active, never a false absence. **DEPLOY BACKLOG: EMPTY.** THE FOLD LAW (the
> slice's first-class deliverable, guard-pinned): a treasury transfer whose transaction
> already carries a first-class heartbeat line (purchase · lp add/remove · burn · archive
> · lifecycle) is that line's ROUTING DETAIL — folded and counted, never a second line;
> the narrated-tx union is built structurally each cycle, so every FUTURE narrated class
> folds its own routing side-effects automatically (26 purchases can never become ~78
> phantom lines). MACHINERY: 4 new scan streams (TREASURY_USDC_IN/OUT · TREASURY_SYN_IN/
> OUT — eth_getLogs can't OR across topic positions; organ set as OR-list within one
> position), NO new tables (generic cursor/raw lane, additive keys, paced catch-up ~8
> cycles); direction NEVER trusted from the stream — derived from the organ set
> (in/out/internal; an internal organ→organ transfer dedupes at the raw unique key);
> BURN SOVEREIGNTY pinned: the SYN decoder YIELDS burn-address logs to the burn lane
> (the raw table's (chain,tx,logIndex) unique key means a treasury row could displace a
> Proof of Burn row — it never can now, static + fixture pinned); organ addresses enter
> the model and leave ONLY as labels ("the vault" · "the liquidity wallet" · "the
> operations wallet"); external counterparties never named; native AVAX honestly out of
> scope (no event, no receipt). Feed: kind "treasury-move" + lanes.treasury + label
> discipline gate (an address-shaped organ label fails closed). Client: parse + the 3
> founder-approved §8 sentences (out: "a founder-signed treasury act; there are no
> silent moves" · in: "recorded on-chain" · internal: "an internal treasury rebalance,
> publicly recorded") + Treasury filter chip. §8 canon: H2-⑦ table. SEO-rides-the-slice:
> /activity lead+banner+next-card, meta description+notes, sourceStatus proof+indexer
> notes. RUNTIME-VERIFIED on the rig: all 3 sentence classes rendered + filter isolates
> them + 8 chips + zero console errors (debug fetch-intercept, source untouched, cleared).
> Green: tsc both · seo 395 · rewrites · surface:audit 254 · ALL studio guards · ALL 17
> api guards (backbone 110→115: Fold Law · classification · label discipline ·
> burn-sovereignty pins) · build 24 shells. DEPLOY: 🚀 BATCHABLE (additive + fail-closed;
> on deploy the 4 streams start their paced cold catch-up ≈8 cycles ≈40 min, then
> genuine treasury acts appear — routing detail stays folded). NEXT IN H2: ⑫ eras →
> ⑭ Chronicle lines → ⑰ capital axis → ⑩ deployments; then S7 (wireframe approved) ·
> S8 perf · S5 on the paste.
>
> **▶ 🏆 SLICE H2-⑬ ✅ SEALED IN PROD (2026-07-15, Replit-verified on thesyndicate.money,
> bundle `index-D3ZO3sKj.js`, 76/76 blob-verified, founder GO on the full 11-row inventory
> + the 4 sentences on screen; order locked H2 → S7 → S8): THE MILESTONE LAYER — the
> protocol's canonical account of itself, derived GAPLESSLY from the indexed history, no
> new persistence.** PROD PROOF (Replit): the milestone model built on the FIRST cycle as
> designed (no re-index — 13 tables / 142 columns dev==prod, nothing to migrate); the 4
> sealed crossings serve WITH their exact tx anchors and the protocol's own dates are now
> public record — **first seat Jun 4 · First Signal Jun 6 · Patron Seal Jun 7 · $100
> routed Jun 17 (2026)**; approaching honest and alive (14→100 seats · $210→$1,000);
> the crossings ride the feed as lines; /activity serves the panel; ZERO regression
> (LP orientation still true 1,913.6 SYN + 39.85 USDC · burns #1–#8 gapless · 26 seats ·
> 17 mints · source events intact · 68/68 items = 64 heartbeat lines + 4 crossings,
> all lanes live · backbone 2/2 cycles OK, 6 streams caughtUp). Full gate green at
> Replit (heartbeat 136 · backbone 110 · auth-zone 761 · source-status 161 · DB 42/42).
> **DEPLOY BACKLOG: EMPTY.** The origin's 11 canon defs harvested whole (`milestoneReadmodel.ts`),
> adapted per the Mirror Rule: always "routed" never "raised" (guard-pinned), always
> SEATS; the seat milestones ARE the chapter boundaries (333/1,000/3,333/10,000 —
> chapters.ts canon, one story with the Chronicle). LIVE TRUTH READ THIS SESSION
> (public RPC): inflows V1 25 + V2a 15 + V2b 110 + V3 60 = 210 USDC · memberCount 14 →
> FOUR milestones already SEALED (first seat · First Signal · Patron Seal · $100 routed),
> each will anchor to its exact crossing tx on the first post-deploy cycle (decodedJson
> already persists the amounts — NO re-index). MACHINERY: RawSaleEventInput +
> usdcGrossRaw (the purchase's own PUBLIC gross figure — per-generation key, whitelist
> extended {firstSeat, memberNumber, usdcAmount, usdcIn, grossUsdc}, loader-confined,
> never per-line, never in the aggregate report, guard-pinned both suites); pure
> `buildMilestoneReadModel` (USDC cumsum walk → crossing anchor · seat ordinal anchor ·
> first-mint anchor; fail-closed on a missing amount/timestamp); runner ③b2 with 5
> fail-soft live eth_calls as OVERCLAIM PROTECTION (a live-read contradiction WITHHOLDS
> the milestone with an honest note; unavailability never suppresses event truth — noted);
> feed: kind "milestone" + `milestones` panel block + lanes.milestones + the tie-break law
> (a milestone ranks NEWER than its underlying event on a shared anchor — the crossing
> reads as the consequence); client: parse + §8 sentences (approved verbatim; future
> crossings auto-sentence by class) + facts (cohort label) + Milestones filter chip +
> `MilestonesPanel` (sealed w/ verify anchors · approaching w/ honest progress · binary
> milestones say "awaiting its first on-chain act", never a fake bar · server notes
> rendered). §8 canon: H2-⑬ table added. SEO-rides-the-slice: /activity description +
> notes, sourceStatus proof+indexer notes speak the complete heartbeat, asOf → 2026-07-15.
> + IN-SLICE REPAIR (found at the rig): /activity's Re-read button NEVER refetched (the
> [addrs]-keyed effect never re-armed — pre-existing) → readNonce dep, verified working.
> RUNTIME-VERIFIED on the rig: fail-closed path (backbone dark → panel hidden, honest
> banner, 7 chips, zero console errors) AND the full panel + feed lines + filter + tie-break
> exercised via a debug fetch-intercept fixture (source untouched, patch cleared, real
> state confirmed back). Green: workspace tsc · seo 395 · rewrites · surface:audit 254 ·
> ALL studio guards · ALL 17 api guards (activity 134→136 · backbone 95→110 ·
> source-status-truth 161) · build 24 shells. DEPLOY: 🚀 BATCHABLE (additive + fail-closed;
> prod keeps the current heartbeat until deployed; on deploy the milestone model builds on
> the FIRST cycle — no catch-up, no re-index). NEXT IN H2 (founder-ticked order): ⑦
> treasury (routing-dedup design first) → ⑫ eras → ⑭ Chronicle lines → ⑰ capital axis →
> ⑩ deployments; then S7 member home (wireframe approved) · S8 perf · S5 on the paste.
>
> **▶ 🏁 SESSION SEAL (end of day 2026-07-14, sealed 2026-07-15) — THE 6TH-ITERATION DAY:
> everything settled once, on a base that cannot rot again.** SEALED IN PROD during the
> day (all Replit-verified on thesyndicate.money): **M1 arc** (M1-a hero first act ·
> M1-b living map with derived node truth + doors + paid-to-referrers live · M1-c header
> root-cause + guard-nav-link-display) · **W1** Conversion Doctrine TIER-0 · **W2** SEO
> truth texts + THE HUMAN-FIRST LAW (amended verbatim) + the identity paragraph rewritten
> human · **S1** Visual Change Law + the W-HOME rejection verdict (the four-scene
> restaging = founder-rejected at the preview gate; the CURRENT home composition is his
> choice and STANDS; any future home layout starts from a fresh approved wireframe) ·
> **S2+S3** the truth batch + surgical fixes (era DNA at zero across served heads;
> /contracts = the one founder-validated exception; hero chips LIVE-only; throne majesty)
> · **S4** structural cure (source-status fossil reconciled · guard-era-drift ·
> source-status-truth 161 · SEO-rides-the-slice law) · **S6** internal-plan leakage
> extinct + guard-pinned · **H1a + fix** (six new heartbeat classes; the LP orientation
> pinned as canon after Replit's prod catch — THREE historical liquidity adds now
> narrated true; no re-index needed, neutral rows as designed). LAWS ENGRAVED (8):
> Human-First (amended) · Visual Change (wireframe→preview gate→visually-complete) ·
> System-First + Mirror (quarry, never law) · PENDING=publicly-promised-only ·
> SEO-same-commit · Heartbeat Completeness Invariant · Founder Voice · Visibility.
> The advisor's lessons file committed deliberately (`f99220f`, TIER-3 index).
> **DEPLOY BACKLOG: EMPTY** (everything sealed through `d9b4275`). **THE PLATEAU FOR THE
> NEXT SESSION (H2 opens on founder GO, fresh session):** ① **H2 in the proposed order:
> ⑬ the 11 origin milestones FIRST (the biggest narrative win — derivable gaplessly from
> the indexed history, no new persistence) → ⑦ treasury (anti-duplicate routing design
> first: per-purchase routing transfers must never duplicate purchase lines) → ⑫ eras →
> ⑭ Chronicle lines → ⑰ capital axis (settled-yes, SPEC_REFERRAL §⑨) → ⑩ deployments**;
> ② **S7 member home** — wireframe ALREADY founder-approved (two states: the door band /
> your-seat hero; ONE connect CTA; dead band dies; jargon falls), code NOT started,
> preview gate applies; ③ **S8 performance** (throne webp fine; header PNGs 284KB+195KB
> = the cheap wins); ④ **S5 the soul document** — awaits the founder's paste
> (SUPERSEDED-TERMS banner spec recorded in the order). Next session boots on "hi" per
> the standard boot sequence.
>
> **▶ Prior: 💗 THE H1a ARC ✅ SEALED IN PROD (2026-07-15, Replit-verified 3/3 post-fix on
> thesyndicate.money): THE COMPLETE HEARTBEAT'S FIRST SIX CLASSES ARE LIVE.** The
> founder's LP add renders TRUE: "1,913.6 SYN + 39.85 USDC · Founder" with its anchor
> (block 90,319,681) — and the fix revealed THREE MORE historical LP adds now correctly
> told (356.8 SYN + 5 USDC · 463.4 SYN + 5 USDC · 200 SYN + 2 USDC): the pool's whole
> story, narrated. Reserves coherence sane (feed sum ~2,933.8 SYN / ~51.85 USDC vs live
> spine ~2,678.8 / ~55.78 — drift = the swaps since, the right direction). Zero
> regression: burns #1–#8 gapless · 26 seats (V1:5 V2A:3 V2B:6 V3:12) · 17 mints ·
> 9 source events · 6 streams caughtUp. NO re-index was needed (neutral persisted rows —
> as designed). Replit's ops note recorded: an instance ROLL (autoscale restart) is not
> a PUBLISH — detection method = a fix-keyed observable flipping on the first cycle.
>
> **▶ Prior: 🩹 H1a-FIX ✅ BUILT (2026-07-15, on Replit's prod diagnosis — H1a otherwise SEALED
> 5/5 IN PROD: all 6 streams caughtUp in ~1h, TODAY'S founder LP add indexed at block
> 90,319,681 with its verify anchor, 17 archive mints (11 First Signal + 6 Patron Seal),
> burns #1→#8 gapless, /activity chips live, zero member addresses): THE LP AMOUNT
> INVERSION dead at the root.** Cause: the read-model mapped amount0→SYN STATICALLY while
> the real pair's IMMUTABLE token0 is USDC (prod proof: spine-oriented reserves ~2,678
> SYN / ~55 USDC + the founder's add ≈ 39.85 USDC / 1,913.6 SYN — the spine itself always
> displayed correctly because it orients DYNAMICALLY via token0() each read). FIX:
> persisted rows were already NEUTRAL (amount0Raw/amount1Raw) — **NO RE-INDEX NEEDED**,
> Replit's ask #2 falls away; the orientation is now a PINNED CANON FACT
> (`FINANCIAL_TARGETS.lpPairToken0 = "USDC"`, provenance-commented) passed into the
> read-model (`lpToken0IsSyn`) — never assumed. GUARD-PINNED (backbone 94→95): with
> token0=USDC the model must map amount1→SYN — the inversion class can never return.
> Green: tsc both · backbone 95 · targets 208 · api 17.
>
> **▶ Prior: 💗 SLICE H1a ✅ BUILT (2026-07-15, founder GO on the COMPLETE table + 3 corrections):
> THE COMPLETE HEARTBEAT ARC OPENED — six new event classes end-to-end on the M4-c
> machinery.** THE SYSTEM-FIRST LAW + THE HEARTBEAT COMPLETENESS INVARIANT engraved in
> CLAUDE.md; the full 17-class inventory was presented ON SCREEN (both quarries swept:
> origin = 14 kinds + 11 canonical milestones; disk = every ABI event) and the founder
> ticked ⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑯⑰ YES · ⑮+third-party NO, with 3 DOCTRINE corrections:
> ⑰ IS yes (SPEC_REFERRAL §⑨ settled — Sephora/Marriott precedent, never re-litigate) ·
> THE FOUNDER VOICE RULE (founder acts SAY the founder — skin in the game is the trust
> engine; identity-blindness protects MEMBERS only) · THE VISIBILITY RULE (lines carry
> what the chain publishes, amounts included; the one discipline: never a MEMBER wallet).
> H1a DELIVERS: ② repeat-purchase sentence upgraded ("A member expanded their footprint")
> · ⑤⑥ LP add/remove lane (pair Mint/Burn + same-tx LP-token-mint depositor join →
> Founder/Community label, fail-closed) · ⑧ ladder-promotion reading (SourceTermsUpdated
> decodes commissionBps → exact rate-raising rung → "A source rose to {rung}") · ⑨
> archive pause/unpause lane · ⑪ artifact-mint lane (canon labels First Signal/Patron
> Seal; minter never stored) · ⑯ wallet rotations join the lifecycle lane. Founder label
> set extended to the routing wallets (vault/liquidity/operations — pipes per the
> Visibility Law; existing burns unaffected, all already Founder). Feed: 3 new line
> shapes + lanes {liquidity, archive}; client: parse + §8 sentences (ONE shared mapping)
> + facts row (amounts) + /activity filters (Liquidity · Archive) + mini-feed facts.
> §8 canon updated (7 new LIVE sentences recorded); "payout wallet" → "payment wallet"
> (copy guard caught the register breach — working as designed). Green: tsc both ·
> backbone guard 89→94 (new pins: promotion reading, LP labels, artifact labels,
> ceremonial actions, 11-item ordering, new lane flags; planted addresses still trip) ·
> api 17 · studio 14 · build. Runtime: /activity fail-closed path verified (6 filter
> chips, honest fallback, live window). DEPLOY: 🚀 recommended NOW — the new lanes start
> their paced cold catch-up (~8 cycles) and TODAY'S founder LP add renders once caught
> up (within pinned range by construction); carries the backlog (S6 + /recognition fix).
> REMAINING IN THE ARC (H2/H3, founder-ticked, next slices): ⑦ treasury moves (needs the
> routing-dedup design — per-purchase routing transfers must not duplicate purchase
> lines) · ⑩ deployments (registry-derived) · ⑫ era transitions · ⑬ MILESTONES (origin
> activity-milestones.ts harvested whole — 11 canon defs; crossings derivable GAPLESSLY
> from indexed events, no new persistence) · ⑭ chronicle-entry lines (register-derived) ·
> ⑰ capital-axis rungs (needs HOME_RANK_LADDER harvest from origin + per-seat cumulative
> spend from purchase events; seat numbers public, wallets never).
>
> **▶ Prior: 🕳 SLICE S6 ✅ BUILT (2026-07-15, founder GO on the on-screen report): THE INTERNAL-PLAN
> LEAKAGE SWEEP — the class is extinct and guard-pinned.** Three findings, three kills:
> ① /status's financial-group description carried a LIE + a LEAK in one phrase ("no
> commission is paid — CommissionRouterV1 is not deployed" — referrers ARE paid, and the
> internal contract name showed to every visitor) → rewritten to the paid-inside-the-
> buyer's-transaction truth; ② the home "Awaiting Wiring" card's Commission Router row
> DIED (founder decision per his engraved rule: an internal plan never announced is never
> a public promise; the direct-payment fact lives in the LIVE column beside it) — Identity
> Alias + Notifications legitimately stay (both publicly promised on the site: the SOON
> slot in member settings, the reserved header bell); ③ the dead `statusChips.pending`
> config deleted. GUARD-PINNED: `/commission ?router/i` joined guard-era-drift's patterns —
> the internal-plan name in any user-facing string is now a red build. Sweep of Router V4 /
> SeatRecord721 / pro-firm / white-label / SaaS: zero public hits. Verified rendered on the
> rig (home clean, card keeps its two rows, LIVE column intact). Green: tsc · era guard ·
> all 14 studio guards · build. DEPLOY: 🚀 BATCHABLE (client-only; joins the /recognition
> micro-fix in the backlog). NEXT: S7 member-home wireframe (founder review) · S8 perf ·
> S5 on the founder's paste.
>
> **▶ Prior: 🧬 S4 ✅ SEALED IN PROD (2026-07-15, Replit-verified 5/5 on thesyndicate.money, bundle
> `index-cWnrNV-i.js`): THE STRUCTURAL CURE IS LIVE — /api/source-status serves today's
> truth (asOf 2026-07-14, backbone/chronicle/archive/routing notes state the live facts,
> "not wired" at ZERO case-insensitive), /status header + /archive lead + /member facets
> honest in prod, zero console errors. The era-drift class is now structurally blocked on
> BOTH sides before any deploy. + MICRO-FIX on Replit's sharp observation: /recognition's
> "The registry is paused today" was yesterday's truth (registryLive=true, founder source
> ACTIVE, referrers paid) → rewritten to the live truth, verified rendered on the rig;
> rides the next deploy (BATCHABLE — client-only, /recognition noindex). DEPLOY BACKLOG:
> the /recognition micro-fix only.
>
> **▶ Prior: 🧬 SLICE S4 ✅ BUILT (2026-07-15, founder GO): THE STRUCTURAL CURE — the era-drift
> class can never return silently.** ① The server's source-status registry (the 2026-07-03
> fossil) reconciled to today: NINE entries promoted/rewritten (proof · membership ·
> treasury · routing · chronicle · learning · indexer · archive · source — the backbone,
> the committed chronicle register, live archive mints, served routing figures, own-row
> source standing + the public paid aggregate all STATED) + asOf bumped + /status's two
> inline era proses fixed. ② NEW `guard-era-drift` (studio 14th): case-insensitive (the
> /contracts capital-R lesson), comment-stripping, CLAIM-shaped patterns (mechanism
> "read-only" stays free), 8-entry allowlist each with its written reason. ③ NEW
> `source-status-truth:guard` (api 17th, 161 checks): era vocabulary dead in the served
> payload + posture promotions PINNED (no silent regression) + positive truth pins (notes
> must state the live facts). ④ THE GUARD PROVED THE CURE PRE-COMMIT: it caught 14 MORE
> lies the six manual sweeps missed — /archive's own page lead ("nothing is minted here"
> vs 17 minted!) · modules /proof description ("why none is wired yet") · /member's three
> facets (referral "paused today" · "event adapter is not wired" · "archive reads not
> wired") · identity stages · notices · studioPreview · /map & /proof classification
> summaries · the /studio console note — ALL rewritten to today's truth. ⑤ THE LAW
> engraved in CLAUDE.md: the SEO layer rides the slice (reality change ⇒ meta/OG/posture
> updated in the SAME commit). Green: tsc both · api 17 guards (incl. new 161) · studio
> 14 guards · seo 395 · build 24 shells. DEPLOY: 🚀 recommended now (/status + /member
> lie in prod today — the S2 class). WHAT REMAINS DECLARED (not silent): full posture
> DERIVATION from live reads = a future slice; today the registry is truth-pinned by
> guard, which makes standing-still-while-reality-moves a red build.
>
> **▶ Prior: 🌐 THE TRUTH BATCH + S3 ✅ SEALED IN PROD (2026-07-14, Replit-verified 7/7 on
> thesyndicate.money, bundle `index-DmjsTAJQ.js`, HEAD `d355c5c`): GOOGLE NOW HEARS THE
> LIVING PROTOCOL.** Prod proof: ① / meta+og serve the human-first identity ("A members
> club that lives on-chain…") — the read-only era line at ZERO; ② /proof no longer
> denies the proof; ③ /map titled "The Live Protocol, Reconciled"; ④ "read-only" at
> zero across all 24 served heads EXCEPT /contracts (3× — the founder-validated
> DELIBERATE KEEP: static canon-memory page; future scans whitelist that route; NOTE
> for S4: the era guard must be CASE-INSENSITIVE — my local sweep missed capital
> "Read-only", Replit's caught it); ⑤ hero chips LIVE-only in prod + throne visibly
> larger, halo up, image rendering perfectly — AND the living map already showed
> TODAY'S burn on its own (total 24,606 SYN; "3,333 SYN was retired…" at block
> 90,310,363 — the derived-status law paying off in real time); ⑥ the four rewritten
> descriptions serve; ⑦ zero console errors. Full gate green at Replit (17/17 blob-
> verified, 254+395 studio, 16 api + 2 DB guards). DEPLOY BACKLOG: EMPTY. NEXT (S-map):
> S4 structural cure (/status derived · case-insensitive era-vocabulary guard with the
> explicit /contracts whitelist · meta-rides-the-slice law) · S5 soul import (awaits
> founder paste) · S6 leakage sweep · S7 member home (wireframe first) · S8 performance.
>
> **▶ Prior: 👑 SLICE S3 ✅ BUILT + FOUNDER-APPROVED AT THE PREVIEW GATE (2026-07-14): THE TWO
> SURGICAL HOME FIXES — nothing else moved.** ① The hero's PENDING chips DIED (LIVE-only
> row: SYN Token · Seat Sale · 70/20/10 Routing · LP Pool · Referral Registry · Proof of
> Burn; mobile pill "6 live — verify below") — the engraved rule: an internal plan (the
> Commission Router class) never becomes a public chip; ② THRONE MAJESTY restored on the
> CURRENT map (160→208px desktop / 168 mobile, halo up, breathing room; 0 collisions
> measured vs all 10 nodes + routing badges at 375/800/1440). PREVIEW DEFECT CAUGHT BY
> THE FOUNDER + fixed at the root: the local rig's vite had been launched with
> `BASE_PATH=/` silently MSYS-converted to `C:/Program Files/Git/` — a phantom base that
> 404'd every absolute-src image (throne, brand marks) on the rig only (prod never
> affected). Rig relaunched with `MSYS2_ENV_CONV_EXCL="BASE_PATH"`; **RULE ④ ENGRAVED in
> CLAUDE.md's Visual Change Law: a preview handed to the founder must be VISUALLY
> COMPLETE — DOM-level image check (every visible img naturalWidth>0), both themes,
> desktop AND mobile, verified BEFORE handing the URL.** Founder approved the flawless
> re-show on his own browser. Green: tsc · all guards · build 24 shells. DEPLOY: 🚀 —
> ONE deploy carries the truth batch W2+S2 + S3.
>
> **▶ Prior: 🔍 SLICE S2 ✅ BUILT (2026-07-14, founder GO on the full table read on screen): THE
> FULL-SITE TRUTH AUDIT — the read-only-era DNA is DEAD across the entire served public
> layer.** The audit verified every founder finding against chain+repo and found MORE:
> ① SEO layer (10 rewrites, all founder-approved per line): /proof (the proof page denied
> the proof — "none is wired yet" DIED) · /archive ("nothing is minted" vs 17 minted
> live) · /status ("most surfaces awaiting" → the live-vs-pending truth) · /map (title
> "Read-Only Protocol Reality" → "The Live Protocol, Reconciled" + desc modernized) ·
> /fire-ledger ("complete ledger ARRIVES" — it's been SERVED since M4-c; beyond the
> founder's list) · /activity ("recent window" — complete history served since M5; beyond
> the list) · /chronicle (frozen "Entry one" → the growing-register truth, no frozen
> count) · /source (the true nuance: checking writes nothing, the link PAYS inside the
> referral's own transaction) · /support (the Guide answers NOW; the ticket intake
> honestly not built). ② CONTENT layer (12 lines, same DNA): home how-it-works "always
> read-only" DIED · /proof archive card · /learning "read-only foundation" + "mostly not
> wired" DIED · contractMemory/moduleRegistry/modules×2/routeMemory/surfaceClassification/
> memberDoors archive-era notes all flipped to minted-on-chain-counts-live truth.
> VERIFIED-KEEP (honest today): /contracts (page has zero live reads — canon reference
> truth) · /recognition (genuinely future, noindex) · /join (the healthy register) ·
> W2's four texts · /studio+admin robots Disallow confirmed in the built robots.txt.
> PROOF: "read-only" at 0 occurrences across ALL 24 served shells (was the site-wide
> DNA); every era phrase 0-swept. Green: seo 395 · all studio guards · surface:audit
> 254 · build 24 shells (21 INDEX). DEPLOY: 🚀 — THE TRUTH BATCH (carries W2 + S2; the
> served meta finally tells Google the protocol is alive). NEXT: S3 surgical home fixes
> (preview gate) · S4 structural cure (the era-vocabulary guard is fed by this audit's
> exact pattern list).
>
> **▶ Prior: ⚖️ SLICE S1 ✅ BUILT (2026-07-14, the FINAL "SETTLE EVERYTHING" work order opened —
> supersedes all prior orders): THE VISUAL CHANGE LAW ENGRAVED + THE W-HOME VERDICT
> RECORDED.** ① VERDICT (permanent record): the W-HOME four-scene home restaging was
> **founder-REJECTED at the preview gate 2026-07-14** — never committed, reverted clean
> (main stayed at W2 `ed03ebc`, prod never moved; the gate worked exactly as designed).
> The CURRENT home composition is the founder's choice and STAYS. Any future home layout
> change starts from a FRESH founder-approved wireframe — never from the rejected layout.
> ② THE VISUAL CHANGE LAW engraved in CLAUDE.md (permanent): layout/composition changes
> start from a founder-approved WIREFRAME before any code · every looks-changing slice
> ends at the PREVIEW GATE (real rendered page, founder's own browser, desktop AND mobile)
> before any commit · copy/truth-only changes need the full final text on screen.
> ③ RECONCILIATION of the superseded orders: W1 canon = DONE (`fc0c76d`) · W2 SEO texts =
> SEALED (`ed03ebc`) · W-HOME = REJECTED (surgical survivors — LIVE-only hero chips +
> throne majesty — become their own slice S3, preview-gated) · W-SOUL/W-LEAK/W5/W6 fold
> into the new S-map. **THE S-MAP (founder GO per slice): S2 full-site truth audit
> (HIGHEST — the served meta still tells the read-only era on /proof /archive /status
> /map /contracts /source /support; full table on screen, founder decides per line) ·
> S3 surgical home fixes (chips LIVE-only + throne, NOTHING else moves, preview gate) ·
> S4 structural cure (/status derived · era-drift vocabulary guard · meta-updates-ride-
> the-slice law) · S5 soul import (awaits the founder's paste) · S6 internal-plan leakage
> sweep · S7 member home finish (wireframe FIRST) · S8 performance audit.**
>
> **▶ Prior: 🗣 SLICE W2 ✅ BUILT (2026-07-14, founder GO + the MASTER work order's Part-0 closure):
> THE SEO TRUTH SWEEP + THE HUMAN-FIRST LAW (amended verbatim) + THE IDENTITY PARAGRAPH
> REWRITTEN HUMAN.** ① CANON_PROTOCOL_LANGUAGE §1 AMENDED (founder on screen): the
> identity paragraph is now the human-first, live-production text ("The Syndicate is a
> members club that lives on-chain — on Avalanche — and it is open today…"); the dead
> "read-only, fail-closed, never invented" era claim survives only in git history — no
> surface may quote it; ② NEW §3-bis THE HUMAN-FIRST LAW engraved in the founder's
> AMENDED verbatim (both audiences at once: newcomer understands first read · native
> never talked down to · crypto-standard vocab stays natural · INTERNAL machinery jargon
> never user-facing except after the human words) + the standing note: /learning is THE
> one education page, never a /learn route, Learn & Earn lands ON it (SEASONS §7.5);
> ③ SEO registry: home + /member + /learning descriptions rewritten (founder-approved on
> screen, four texts re-passed under the amended law — already compliant); meta +
> og:description VERIFIED in the built shells; the era phrase at 0 occurrences across
> all 24 shells; the one residual "read-only" (map.html) is the DELIBERATE KEEP class
> (the proof organism's mechanism truth, page-level honest). Green: seo 395 · studio
> guards · build 24 shells (21 INDEX). DEPLOY: 🚀 BATCHABLE (rides the W-HOME deploy).
> NEXT (master work order): W-SOUL (founder pastes the doctrine paper; import TIER-1
> with the SUPERSEDED-TERMS banner) · W-HOME (home as a story, the 4-scene wireframe
> CONTRACT — mandatory PREVIEW GATE: founder approves the rendered localhost page in his
> own browser before ANY commit) · W-LEAK (internal-plan leakage sweep — the Commission
> Router class: an internal plan never announced must never be a public chip/promise).
>
> **▶ Prior: 📐 SLICE W1 ✅ BUILT (2026-07-14, founder GO — the CONVERSION-DOCTRINE work order opened,
> six slices W1–W6 cut and accepted): `docs/direction/CANON_CONVERSION_SURFACE.md` IS
> TIER-0 CANON** (registered in 00_CANON_INDEX beside its sibling the Language
> Constitution — words vs stage: language wins on wording, this doc wins on placement/
> hierarchy/weight/speed). INVARIANTS ONLY: §1 the 5-second test (What is this? Who for?
> Do what next? — every public page MUST pass) · §2 desire before proof (emotion → figure
> → verify) · §3 ONE primary CTA per surface · §4 hero geometry (60–100% desktop, 50–70%
> mobile, first viewport never wasted) · §5 THE HYBRID WIDTH LAW (scenes full-bleed, text
> ~1200–1440px — the boxed frame dies) · §6 performance budgets (LCP < 2.5s mobile ·
> images WebP/AVIF < 500KB) · §7 mobile AAA (≥44px, thumb CTA, block order) · §8 trust =
> verify links inside the claim's visual group · §9 THE REVIEW GRID (9 questions at every
> public-page slice gate; a "no" is fixed in-slice or a founder-visible deviation).
> Enforcement = the grid at the gate (minimal guards until MVP per CANON_LOI_ANTIBLOCAGE;
> measurable rules graduate to guards when their slices land). QUEUE (work order W2–W6,
> founder GO per slice): W2 SEO truth sweep (⚠ requires a founder-approved amendment of
> CANON_PROTOCOL_LANGUAGE §1 — the identity paragraph carries the dead "read-only" era
> claim; old/new pasted ON SCREEN at the W2 gate) · W3 map semantic truth (in-left/
> out-right · Future Streams to sources · Chronicle to a memory orbit · referral drawn as
> paid-inside-the-buyer's-tx · burn as SYN outflow · icon-above/label-below evaluated ·
> collisions at EVERY breakpoint) · W4 wide-screen home + throne majesty · W5 member home
> finish (founder's 4 flags + 2 WORSE findings: /member still says referral "paused
> today" and "the event adapter is not wired" — both false in prod) · W6 performance
> (throne webp fine at 68KB; the header logo PNG is 284KB and avax mark 195KB — cheap
> wins queued).
>
> **▶ Prior: 🏛 THE M1 ARC ✅ SEALED IN PROD (2026-07-14, Replit-verified 5/5 on thesyndicate.money,
> bundle `index-B1jpFXKo.js`, HEAD `7a02718`): THE FOUNDER'S MOMENTUM FACE OPENED — hero ·
> living map · header/footer, one deploy carrying all three batched slices + the gate fix.**
> Replit's 5-point prod proof: ① the hero's new left column live (LIVE/PENDING chips ·
> editorial headline · "14 SEATS ON-CHAIN — THE NEXT SEAT IS #15 — OPEN NOW" coherent with
> the live memberCount · ONE gold CTA · Inspect rail); ② the living map serves every DERIVED
> sub-label in prod ("Live · seats selling now" · "4 chapters public" · "Live · 17 minted" ·
> "Live · reserves on-chain" · "Live · 0.75 USDC paid" · "Live · 21,273 SYN") and all six
> node doors are real anchors answering 200 (/join /chronicle /archive /liquidity /referral
> /fire-ledger); ③ `financial.referral.paidToReferrersTotal` serves "750000" (0.75 USDC)
> HIGH — **from the BACKBONE'S LIVE MODEL (asOfBlock 90,308,039, climbing): the M0
> live-preference working in prod exactly as designed**, cross-coherent with the map's
> rendered figure; ④ AVALANCHE·LIVE pills render; the new footer line serves and
> "Read-only foundation shell." is GONE from the build; the vertical-bar root fix is locked
> by guard-nav-link-display passing on the exact deployed code; ⑤ zero console errors.
> Full gate green at Replit including the repaired protocol-reality guard (145/145) and the
> class fix (full api suite now in release:gate — the local-green ≠ Replit-green hole is
> closed). DEPLOY BACKLOG: EMPTY. Two record-only founder-eye checks remain (not blockers,
> unphotographable by the capture tooling): nav hover shows no vertical bar · the overall
> look of the new hero. THE PLATEAU NOW: M2 sharebility/Referrer Kit · M3 seat majesty
> (CONVERSION register + REFERRAL-SHOWCASE stage there) · M7 Economy · PIPELINE-CHRONICLE ·
> the seven-signatures Chronicle story (partial anchors to resolve first). The founder picks.
>
> **▶ Prior: 🩹 M1 GATE FIX ✅ BUILT (2026-07-14, on Replit's prod-gate diagnosis — deploy STOPPED
> correctly at a red gate): `protocol-reality-check.guard.ts` had not followed M1-b.**
> Replit's discipline held (gate rouge = no publication) and its diagnosis was exact: the
> SERVICE was correct and fail-closed; only the guard was stale. FIXED all four lags:
> financial count 24→25 · exact id set += `financial.referral.paidToReferrersTotal` · the
> attribution-note pin now requires the NEW text (ACTIVITY COUNT + pointer to the paid item)
> and REJECTS the dead "No commission has ever been paid" claim · unreachable/wrong-chain
> exemptions extended to the snapshot-backed paid item (same posture as attributionActivity:
> chain identity pinned inside the model, not a live read). PLUS 7 new checks pinning the
> item itself (snapshot equality, INDEXED_CHAIN_SCAN, sale role, HIGH/READ_ONLY_PROOF,
> direct-payment doctrine note, asOfBlock freshness, provenance in sourceRef, snapshot
> internal consistency): guard now 145/145. **THE MISS FIXED AS A CLASS (why it happened):
> the root `release:gate` ran only 2 of the api-server's guards (auth-zone + backbone) while
> Replit runs all 18 — local green ≠ Replit green.** NEW `@workspace/api-server "guards"`
> chain (all 16 env-independent guards) wired INTO `release:gate`; the 2 DB-coupled partB
> guards live in `guards:db` (DATABASE_URL required — Replit-side per the Windows
> best-effort rule). All 16 verified green locally before push. The deploy cycle resumes:
> Replit re-pulls, replays the full suite, publishes, then the 5-point prod verification.
>
> **▶ Prior: 🔧 SLICE M1-c ✅ BUILT (2026-07-14, founder work order + GO after the gate): HEADER +
> FOOTER FINISH — THE RECURRING BAR IS DEAD AT THE ROOT, AS A CLASS.** ① ROOT CAUSE FOUND
> AND PROVEN (the founder's screenshot bug, "fixed" repeatedly, always returned): wouter's
> `<Link>` renders a bare `<a>` = `display:inline`; an INLINE box with padding + a block
> child has FRAGMENTED paint geometry — its hover background (`hover:bg-gold/8`) and focus
> ring painted as broken slivers, the "vertical gold line" under each nav link (CYAN before
> commit `8221b06`, which recolored `--ring` cyan→gold and called it "kills recurring cyan
> bars at root" — it recolored the bars, never killed them; every later fix changed colors
> while the geometry stayed). Measured proof on the rig: nav anchors 60px tall bleeding 16px
> above the header vs the More BUTTON's sane 24px; `inline-flex` heals to 23px. FIX =
> explicit display at the source (header nav links; the same latent class found + fixed in
> the M1-a Inspect rail and /liquidity's action rail) + `focus:` → `focus-visible:` (no ring
> smear on mouse clicks — the founder's "active state" sighting). PINNED FOREVER: NEW
> `guard-nav-link-display.ts` in the guards chain — any padded `<Link>`/`<a>` without an
> explicit display class FAILS the build, repo-wide (9 box-styled links conform today); the
> bug class cannot return under any color. ② HEADER HARMONIZED to live-production: the
> read-only-era tooltips DIED ("live read-only public surface" · "currently read-only");
> the AVALANCHE/LIVE pills now DERIVE from the reality-spine read (live/checking/unavailable,
> fail-closed, `chipStateTone` + `headerChips.states` config — frozen "Live" text dead);
> the mobile sheet's chain note derives the same state; the CH #001 badge reads from the ONE
> chapter config (shared with the hero overview; the hardcoded literal died); mobile sheet
> trigger 40px → 44px (touch-target floor); focus-visible gold rings harmonized on mobile
> sheet links, footer links, social anchors. ③ FOOTER: the site-wide bottom-line claim
> "Read-only foundation shell." DIED → "Every public figure is a live chain read — don't
> trust, verify."; links stay registry-driven (real routes only, verified). PHASE-2 ITEM 13
> RECONCILED HONESTLY in the frozen list (guards half done + footer harmonized; remains:
> final IA per CONTENT_SUITE_SPEC — needs Knowledge/Glossary/Roadmap pages — + sitemap
> lastmod). ④ RESPONSIVE VERIFIED in-browser: 1440 (nav row uniform, chips derived) · 768
> (nav hidden, hamburger, header 58px, no overflow) · 375 (trigger 44×44, all 12 sheet
> links ≥44px, derived chain note, no overflow) · both themes · footer groups stack.
> Green: studio tsc 0 · ALL guards incl. the new one · seo 395 · surface:audit 254 · build
> 24 shells (21 INDEX, unchanged). +0 raw color. DEPLOY: 🚀 BATCHABLE — one deploy carries
> M1-a + M1-b + M1-c.
>
> **▶ Prior: 🗺 SLICE M1-b ✅ BUILT (2026-07-14, founder work order + GO after the truth-sweep gate):
> THE LIVING MAP TELLS TODAY'S TRUTH — the throne/flame/orbital design the founder loves
> stays; every claim on it is now derived, doored, and live.** TRUTH SWEEP EXECUTED (chain +
> repo win): ① "LIVE · READ-ONLY" KILLED everywhere — the `LiveReadTag` literal is now "Live
> chain read" (state-driven live/checking/unavailable machinery untouched); ② REFERRAL MONEY
> SURFACED AS STRENGTH: new reality-spine item `financial.referral.paidToReferrersTotal`
> (realityService 7b) — the introduction read-model's aggregate totals.commissionPaidRaw,
> M0-preferred (live model when ≥ snapshot's asOfBlock, committed snapshot = boot fallback),
> AGGREGATE ONLY, fail-closed on gate/chain mismatch; the REFERRALS node + sources card now
> render "Paid to referrers — inside the buyer's own transaction" (local rig: 0.75 USDC, the
> real snapshot truth) with verify anchor — the "attribution only / not a commission figure"
> apology DIED (+ the stale server note "No commission has ever been paid on-chain" rewritten);
> ③ STRUCTURAL LAW BUILT: `deriveNodeSub()` in SeatFlowDiagram — every node sub-label derived
> at render from live reads or the committed chronicle register, frozen `sub` strings deleted
> from config (HeroFlowSource carries `door` instead); membership deliberately derives from
> the sale's inflow read, NOT the member count (a bare member figure would violate the
> guard-freshness provenance law — the count renders twice elsewhere WITH MembersProvenance);
> ④ DOORS: membership→/join · chronicle→/chronicle ("4 chapters public", register-derived) ·
> nft→/archive ("Live · 17 minted") · LP Pool→/liquidity ("Live · reserves on-chain") ·
> referrals→/referral · NEW Proof of Burn node→/fire-ledger ("Live · 21,273 SYN"); Future
> Streams honest "Declared", inert; ⑤ ORBITS REBALANCED: future → the empty top-right slot,
> burn bottom-right — 10 nodes, 0 collisions measured at the narrowest md container;
> ⑥ ONE ICON LANGUAGE (`hero/heroIconLanguage.ts`, shared map+cards): water-drop for
> liquidity DIED → Coins; operations → Briefcase; chronicle → ScrollText; nft → Gem;
> ⑦ THE OVERVIEW PANEL'S LIES FIXED: "Recent activity — Coming with the event backbone" DIED
> → `HeroLiveActivity` renders the newest served receipt lines through the §8 lexicon
> (`sentenceForServedLine` MOVED to backboneFeedClient — one mapping shared with /activity,
> no copy duplicated), per-line tx verify anchor (explorer base from verify-links,
> fail-closed), honest unavailable note + "complete history →" door when the feed is dark;
> "Members" label → "Seats" (the 12/11 law: seats, not people); ⑧ "Radical Honesty" section
> rewritten to TODAY: LIVE = Seat Checkout · Event Backbone · Referral Direct Payment;
> "Awaiting Wiring" = ONLY the genuinely-absent (Commission Router NOT_LIVE · Identity Alias ·
> Notifications FUTURE_MODULE — items carry their own TruthStatus, the stale surfaceStatus
> indirection dropped for this card); ⑨ MOBILE IN-SLICE: `SeatFlowSurface` wrapper — on
> mobile the map keeps throne/center/orbits and the nodes render as a 2-col clickable chip
> grid beneath (all 7 verified visible at 375px, doors intact, 0 overflow; desktop nodes
> hidden). RUNTIME-VERIFIED on the local rig (api-server rebuilt + restarted): the new spine
> item serves 750000 raw (= 0.75 USDC); every node sub renders derived; "Live chain read"
> everywhere; mini-feed fails closed honestly (backbone dark locally); 0 real console errors
> (buffered vite/HMR artifacts from mid-edit proven stale via a hooked full remount: 0 key
> warnings). Green: FULL gate — workspace tsc 0 · seo 395 · rewrites 23/46 · surface:audit
> 254 · all 12 studio guards (copy guard caught "pooled" in two comments → reworded;
> freshness guard caught the bare member figure on the map → derived from inflow instead —
> both guards working) · auth-zone 754 · backbone 89 · introductions 45 · build 24 shells
> (21 INDEX, unchanged). +0 raw color. DEPLOY: 🚀 BATCHABLE — one deploy carries M1-a + M1-b
> (server payload change is additive + fail-closed; prod keeps the old hero until then).
>
> **▶ Prior: 🎭 SLICE M1-a ✅ BUILT (2026-07-14, founder GO — the M1 hero arc OPENED, the founder's
> plateau pick): THE HERO'S FIRST ACT — the origin's design LANGUAGE harvested, never its
> constraints (the origin was read-only; this is LIVE PRODUCTION — seats bought with real
> money, in-page, today).** The left column rebuilt to the founder's six-block order, all
> reads LIVE and fail-closed: ① honest LIVE/PENDING posture chips (`hero/HeroStatusChips.tsx`
> — static posture declarations, no figures; PENDING = only the genuinely-not-deployed:
> Commission Router · Identity Alias · Notifications; origin's mobile variant harvested:
> compact "6 live · 3 pending" pill under md); ② editorial headline in the CONVERSION
> register ("A permanent, numbered seat, written on-chain.") with its verify path
> (`membershipSaleV3`) directly beneath; ③ the OS in 3 plain human sentences (public memory ·
> the numbered seat · net-contribution 70/20/10 — the mute A/70/✓/◇ ProofRail chips DIED);
> ④ THE LIVING SEAT LINE (`hero/HeroSeatLine.tsx`) — "N seats on-chain · the next seat is
> #N+1 — open now" + "You could hold seat #N+1 — permanently recorded on Avalanche", read
> from the live memberCount() (SPEAKS IN SEATS, never "Members"), verify-linked, fail-closed
> to checking/generic; guard-freshness ENFORCED the compact `MembersProvenance` beneath it
> (the 12/11 readback: "14 seats / 13 distinct wallets (1 holds two)" rendered live);
> ⑤ the ONE dominant session-aware seat CTA (HeroSeatCta UNTOUCHED; the secondary "View
> public proof" outline button removed — single visual priority, the Inspect rail covers
> verify); ⑥ the quiet Inspect rail (Verify /proof · Registry /contracts · Token /tokenomics ·
> Liquidity /liquidity) filling the dead space (mt-auto). Throne/map/panels/ledger UNTOUCHED
> (M1-b re-houses them). RUNTIME-VERIFIED on the local rig BOTH paths: API dark → every block
> fails closed honestly (no verify links, fallback seat sentence, 0 console errors); API live
> (local api-server against the real chain) → "14 SEATS ON-CHAIN · THE NEXT SEAT IS #15 —
> OPEN NOW" + verify links + provenance line, matching prod truth (newest prod seat = #14);
> mobile 375px verified structurally (compact pill visible, desktop rows hidden, full block
> order, 0 horizontal overflow). Green: FULL release:gate — workspace tsc 0 · seo:check ·
> rewrites:check · surface:audit · all 12 studio guards (freshness caught the missing
> provenance → fixed, the guard working) · auth-zone 875 · backbone 89 · build 24 shells
> (21 INDEX, unchanged). +0 raw color. FOUND & FLAGGED for M1-b (NOT touched, panels frozen
> by the gate): `awaitingWiring` in syndicateFacts (the "pending" card in Operational
> Reality, lower on home) is STALE — it still claims the membership indexer / event adapter /
> source indexer are "not wired" while all three are LIVE in prod; must be rewritten honestly
> in M1-b. Windows note (best-effort law respected): release:gate's final `PORT=… pnpm build`
> step is POSIX-only → ran the identical step via bash, green; pnpm reached via corepack shim.
>
> **▶ Prior: 🏁 SESSION SEAL (2026-07-14 evening) — THE MACHINERY HALF OF THE M-MAP IS DONE, ALL
> SEALED IN PROD (Replit-verified on thesyndicate.money):** ① **M4 arc complete** — M4-a
> unattended backbone (`7cd492b`, + convergence fix `15e933f`) · M4-b gated receipt-line feed
> (`32d00d6`) · M4-c complete history: burns as the numbered Proof of Burn record + referral
> lifecycle (`117396d`); ② **M5** /activity complete seat history (`01c760f`); ③ **THE
> PROTOCOL LANGUAGE CONSTITUTION** TIER-0 (`4929026`); ④ **M6** four Chronicle chapters live
> (promotions `94a40a9`/`f3135a7`/`eafe78a`); ⑤ **Q-A/Q-B closed** (A1 session-aware seat CTA
> — hero `e3e32b9` + header `f274e85`; Q-B by-design pattern-2, silent-resume repo-verified);
> ⑥ **M0** living introduction refresh (`c53d9f7` + cursor-literal fix `6d143f0`, sealed
> `9d224d1`). **STANDING RULES ADDED (CLAUDE.md):** content decisions pasted FULL inline ·
> DEPLOY-BATCHABLE verdict (deploy backlog: EMPTY tonight). **QUEUE TODAY:** four founder
> decisions CLOSED (avatar=App Storage · no DEX deep-link · weekly cadence · optional RPC) ·
> PIPELINE-CHRONICLE + REFERRAL-SHOWCASE + i18n horizon recorded. **ZERO PENDING THREADS:**
> main == prod-verified HEAD, deploy backlog empty, no unanswered confirms from today;
> record-only notes stand (chronicle dead empty-state string · rowsInserted counter ·
> partial tx anchors in the seven-signatures raw material). **THE PLATEAU (founder picks,
> nothing opens before):** M1 hero · M2 sharebility/Referrer Kit · M3 seat majesty (the
> momentum face — CONVERSION register + REFERRAL-SHOWCASE take their stage there) · M7
> Economy · PIPELINE-CHRONICLE · **the seven-signatures Chronicle story awaiting the
> founder's act** (raw material committed 2026-07-14: all seven historical seats claimed,
> 01:58–02:27 GMT; resolve the partial anchors before writing the candidate). Next session
> boots on "hi" per the standard boot sequence.
>
> **▶ Prior: ♻️ SLICE M0 ✅ SEALED IN PROD (2026-07-14, Replit-verified on thesyndicate.money):
> THE LIVING MODEL TOOK OVER FROM THE FOUNDER FREEZE.** Post-fix deploy: cycle 1 succeeded
> first try (no boot stumble); cycles ok:2 · failed:0; `introductionRefresh` reads EXACTLY
> the expected values from cycle 1 — refreshed:true · asOfBlock = the cycle head (90,256,042
> → 90,256,346, climbing ~300 blocks per 5-min cycle) · attributedRows 3 · distinctSources 2.
> The served standing now prefers the live model (its asOfBlock passed the frozen 90,187,222
> from cycle 1); the committed snapshot stays the boot fallback forever. Zero regression:
> burns 7 · lifecycle 9 · both protocol lanes caughtUp at head. The header CTA batch was
> verified in the same deploy window (bundle bit-exact). Bug→fix→proof loop closed in under
> a day: Replit's prod diagnosis (the "ok"-vs-"complete" literal) → the one-line fix + the
> guard pin (backbone 89) → two consecutive proven cycles. **THE MACHINERY HALF OF THE M-MAP
> IS DONE: M0 ✅ M4 ✅ M5 ✅ M6 ✅.** Remaining: the FACE (M1 hero · M2 sharebility · M3
> collectible — where CONVERSION + REFERRAL-SHOWCASE get their stage) · M7 Economy · M8+
> tail · the seven-signatures Chronicle chapter awaiting the founder's act (raw material
> committed, partial anchors to resolve first).
>
> **▶ Prior: 🩹 M0 CURSOR-LITERAL FIX ✅ BUILT (2026-07-14, on Replit's prod diagnosis — the refresh
> skipped every cycle: `saleLaneCompleteTo` required cursor status `"ok"`, a literal that
> exists ONLY in the engine's in-memory run summary; the CURSOR TABLE's persisted vocabulary
> is `complete | idle | running | error` (saleEventIndexer:485 — verified in repo AND in the
> prod DB: V3 cursor at head with status "complete"). The fail-closed skip worked exactly as
> designed — honest reason, nothing invented, snapshot kept serving.** FIX: the check now
> anchors on the decisive fact (cursor `lastScannedBlock >= head`) and accepts the persisted
> non-fault literals (`complete`/`idle`); NEW GUARD PIN (backbone:guard 89): the refresh must
> speak the persisted cursor vocabulary, never the summary's "ok" — the literal-drift class
> is now caught at the gate. Deploy NOW (the slice's purpose is unfulfilled in prod — never
> batched). Everything else in the c53d9f7 deploy verified sane by Replit: header CTA in the
> bundle bit-exact · protocol lanes caughtUp at head · burns 7 / lifecycle 9 · zero regression.
>
> **▶ Prior: ♻️ SLICE M0 ✅ BUILT (2026-07-14, founder GO): THE INTRODUCTION READ-MODEL REFRESHES
> ITSELF — and the member link card was found ALREADY BUILT (REUSED, not rebuilt).**
> **Part 2 first (the honest finding):** `MyReferralLinkCard` (§11 slot 2b) already ships in
> MemberReferralDashboard — derive (`SYN.SOURCE.V1`) + live registry read + copy + QR + share
> menu + the two honest states. Zero work; reported REUSED per the standing rule.
> **Part 1 (the substance):** `src/backbone/introductionRefresh.ts` — the R5 model rebuilt
> IN-PROCESS on every backbone cycle: attributed rows from the backbone's OWN gapless sale
> lane (NOT a ~850-call rescan — ~a dozen live eth_calls per cycle: balanceOf per introduced
> member = the durable test · escrow + live commissionBps per source via the sale's own
> SOURCE_REGISTRY() view · memberCount cross-check); block dates from the Protocol Time cache
> (zero RPC, never a clock); COMPLETENESS FAIL-CLOSED (the V3 cursor must sit at the cycle
> head or the refresh SKIPS — a hole never becomes a model); the built model is leak-scanned
> BEFORE it is held. Serving: `introductionLiveModel.ts` holder (pure state, no cycles) —
> `sourceStandingRead` PREFERS the live model when ≥ the committed snapshot's asOfBlock
> (the snapshot stays the boot fallback; asOfBlock always honest; payload shape unchanged).
> Runner: ISOLATED like the protocol lane (fault/skip = partial note, heartbeat untouched);
> status.lastSuccess gains the address-free introductionRefresh block. The zone's SECOND
> (and last) lazy-DB file — guard-pinned: decodedJson whitelist exactly {sourceId, recipient,
> acquisitionCost} (gated fields legitimate ONLY here server-side), leak-scan-before-hold,
> setter callable only by the refresh; allowlists updated (holder-index 66 ·
> member-continuity-schema 29). The founder-gated `introductions:build` script + weekly
> cadence + before-promotion re-run stay LAW for the COMMITTED snapshot; the in-process
> refresh is the automation M0 promised on top (Q18's refresh half now automated in serving).
> Green: full tsc 0 · backbone:guard 88 · activity 134 · introductions guard · auth-zone 754 ·
> all suites · build 24 shells (unchanged). DEPLOY: 🚀 (server runtime; carries the batched
> header CTA — the deploy backlog empties with this deploy).
>
> **▶ Prior: 🎯 A1 HEADER EXTENSION ✅ BUILT (2026-07-14, founder order on prod screenshot — the
> header's "Take your seat" survived next to the seated pill while the hero already said
> "Expand your footprint"):** the HEADER seat CTA (desktop + mobile sheet) now rides the SAME
> session-aware module — `HeroSeatCta` gained size/onNavigate props; PublicLayout's
> `SeatCtaSlot` mirrors the MemberHeaderSlot discipline (lazy, auth-gated, Suspense fallback
> = the generic; fail-closed everywhere). One module, three mounts (hero · header · mobile),
> zero duplicated truth. **DEPLOY BACKLOG (batchable rule, founder 2026-07-14): this slice
> is COMMITTED, NOT YET DEPLOYED — it rides the next deploy (client-only, fail-closed;
> prod header still shows the generic until then).** ALSO RECORDED (founder question
> answered): the MIRRORED Q-B
> direction — a site-session end (deploy wipes in-memory sessions) does NOT and must not
> revoke the MetaMask link (the link is the user's grant, managed in the wallet; it powers
> the one-click re-sign) — appended to the Q-B closure in OPEN_QUEUE. A1 PROD-VERIFIED by
> the founder's own screenshots meanwhile: hero "Expand your footprint" with the seated
> Genesis session · generic in the signed-out window; Replit verified the bundle bit-exact.
>
> **▶ Prior: 🎯 Q-A/Q-B TRIAGE ✅ BUILT — BOTH CLOSED (2026-07-14, founder decisions A1 + B2-plus;
> the briefly-built B1 sentence REVERTED same slice on founder override):**
> **Q-A (A1):** the home-hero primary CTA is session-aware via the lazy wallet module
> `wallet/HeroSeatCta.tsx` (the JoinSeatLine/MemberHeaderSlot pattern): SEATED → "Expand your
> footprint" → /join (title: "You hold your seat — a further purchase adds SYN to it, never a
> second seat."); everyone else + checking + dark auth + any failure → "Take your seat"
> (fail-closed generic). Scope: home hero only. **Q-B (B2-plus):** BY-DESIGN, documented, NO
> copy — founder research: grade-AAA dapps don't explain the divergence, they choose a
> pattern; we are PATTERN 2 (session survives wallet disconnect — the official wagmi SIWE
> posture); the pill is the SEAT (institutional standing), rendered while the server session
> lives; no signOutOnDisconnect (MetaMask locks on its own schedule; the seat must not
> flicker). SILENT-RESUME VERIFIED in the repo (finding: CLEAN, no patch): the pill resolves
> from the server only; SESSION_CHANGED_EVENT never fires from wallet-extension events; the
> panel's accountsChanged clears a local display only; same-address re-link never prompts
> (the re-sign path renders only in the signedOut branch); RainbowKit's auth status derives
> from the server session. Nuance recorded: an explicit MetaMask per-site revoke may
> (version-dependent, inside RainbowKit) end the session — a deliberate act, clean
> signed-out, not a flicker; the founder's own screenshot proves extension LOCK does not.
> Full mechanics in OPEN_QUEUE's Q-B closure. Green: studio tsc 0 · guards · build 24
> shells (unchanged); local rig renders the fail-closed generic hero, 0 console errors.
>
> **▶ Prior: 🔥 SLICE M4-c ✅ SEALED IN PROD (2026-07-14, Replit-verified, 4-point check on
> thesyndicate.money): THE COMPLETE HEARTBEAT SERVES — seats + numbered Proof of Burn +
> referral lifecycle.** Convergence fix (`15e933f`) worked FASTER than estimated: cycle 1
> post-deploy caught up all ~3M blocks in one pass (the paced budget + throttle kept the RPC
> from cutting); cycles ok=2 · partial=0 · failed=0; both streams caughtUp:true, cursor
> tracking the head incrementally (90,246,894 → 90,247,186). ① STATUS: both streams ok ·
> burnLedgerTotal 7 · lifecycleTotal 9 · seats 26. ② FEED: lanes all true; burnLedger #1→#7
> GAPLESS; senders ONLY "Founder"; ZERO 0x40-hex in the raw payload (only 64-hex tx anchors).
> ③ /fire-ledger live capture: total 21,273 SYN + the record banner verbatim ("…oldest is #1 —
> complete up to block 90,247,186…"); numbered cards with FOUNDER badge + VERIFY; Proof of
> Burn #1 confirmed served (block 87,703,847 · 1,000 SYN · Founder). ④ /activity banner
> VERBATIM ("Complete history, served by the event indexer. Seats, burns (Proof of Burn) and
> referral lifecycle…"); counter "26 seat(s) · 7 burn(s) · 9 referral event(s)". The M5
> regression fully healed (seats returned cycle 1 via lane isolation). RECORD-ONLY
> observation (Replit, non-blocking — do NOT patch without evidence per the runtime-evidence
> rule): lastSuccess rowsInserted/protocolEventsInserted read 0 while the DB gained rows —
> LIKELY honest: the pre-fix prod cycles (running every 5 min while the fix was built) kept
> partially inserting rows before each 403, so the fix's cycle 1 found most rows already
> present (idempotent inserts return 0) and later cycles genuinely insert 0 in quiet windows;
> the counter reflects the LAST cycle only. Verify against logs at the next backbone touch if
> it still looks off. THE M4 ARC (a+b+c) IS COMPLETE IN PROD.
>
> **▶ Prior: 🛠 M4-c CONVERGENCE FIX ✅ BUILT (2026-07-14, on Replit's measured prod diagnosis —
> 403 rate-limit; 3 cycles failed; cursor never moved; /activity + /fire-ledger DARK in prod
> including the M5 seat lines).** Root cause exactly as Replit measured: the protocol lane
> wrote its cursor ONLY after a full ~2.5M-block pass → the RPC 403-cut every cycle →
> no-convergence loop; and one lane's throw failed the WHOLE cycle, so the in-memory last-good
> (lost at redeploy) never populated — the public regression. FIVE fixes, all guard-pinned
> (backbone:guard 75→81): ① PER-CHUNK CURSOR PERSISTENCE (the sale lane's law) — every
> persisted chunk advances the cursor, a cut resumes exactly there, prefix stays gapless;
> ② PER-CYCLE BLOCK BUDGET 400k/stream + 150ms inter-chunk throttle (~8 paced cycles to
> converge, never a 403 hammer); ③ ONE lifecycle pass (topic0 OR-array via eth_getLogs
> semantics — a third of the calls); ④ LANE ISOLATION — runProtocolEventScan NEVER throws
> across streams; a stream fault = a PARTIAL cycle (new cycles.partial counter): the seat
> lane, enrichment, and BOTH read-models still refresh and serve — the site can never go dark
> on a lane fault again; ⑤ HONEST CATCH-UP COVERAGE — feed coverage gains
> burnsAsOfBlock/lifecycleAsOfBlock (the cursors); numbering stays valid mid-catch-up (strictly
> sequential from the pinned block → #1 guaranteed first); the fire-ledger banner says
> "complete up to block X — the indexer is catching up…" and /activity appends the catch-up
> note while cursors lag the head. Local smoke: extended payloads carry the new fields;
> cycles {ok, partial, failed}. Green: full tsc 0 · backbone 81 · studio suite · build 24
> shells. EXPECTED IN PROD: first cycles report PARTIAL-or-OK with cursorBlock climbing
> ~400k/cycle; seats serve again from the FIRST cycle; burns/lifecycle lanes complete in
> ~8 cycles (~40 min), then all cycles OK.
>
> **▶ Prior: 🔥 SLICE M4-c ✅ BUILT (2026-07-14, founder GO): ACTIVITY COMPLETE HISTORY — burns +
> referral lifecycle join the seats; /fire-ledger becomes the NUMBERED Proof of Burn record;
> the home burn total gains its history door.** MODE B built as gated: the backbone's SECOND
> scan lane (`protocolEventScan.ts` — origin doctrine ported server-side: incremental cursor
> from block 87,157,852, REORG_OVERLAP 50, topic-filtered getLogs so the sale engine's
> adaptive splitter isn't needed and the engine stayed BYTE-STABLE 64/81) + additive tables
> `protocol_event_cursor`/`protocol_event_raw` (drizzle push, purely additive) + the pure
> `protocolEventReadmodel` (Proof-of-Burn numbering 1-based oldest-first — GAPLESS BY
> CONSTRUCTION: a failed chunk fails the cycle, the cursor never advances past persisted rows,
> the origin's PARTIAL state is structurally impossible server-side; Founder/Community label
> derived from the FOUNDER allocation wallet BEFORE any projection — the sender address never
> leaves the zone) + the feed extended (kinds burn + 3 lifecycle; per-line logIndex added —
> one tx can carry two burns; `burnLedger` served COMPLETE oldest-first; honest `lanes` flags;
> the same mask-then-strict-scan gate, guard-proven: planted sender addresses trip it).
> CLIENT: LiveActivityFeed renders ALL kinds via the §8 lexicon sentences (single mapping
> function — no copy invented), lane-aware banner ("Complete history, served by the event
> indexer… The live window: a recent chain read, refreshing between indexer cycles"),
> per-history summary; /fire-ledger = live total (REUSED untouched) + the numbered record
> ("Proof of Burn #N" pills + amount rendered — the amount IS the record — + Founder/Community
> pill + verify anchor; honest fallback to the window when the served record is unavailable);
> the RENDERED "Proof of Fire" lead reconciled to "Proof of Burn" (founder's origin doctrine;
> the PAGE stays Fire Ledger); home hero burn tile gains the door "every burn, numbered →"
> → /fire-ledger (CREATED — the tile had only the explorer verify link); /activity lead +
> vision + member-door notes updated honestly. RUNTIME-VERIFIED (local rig, backbone dark):
> extended feed serves the honest dark shape with lanes flags; /fire-ledger fallback banner +
> live total 21,273 SYN; /activity fallback banner; the hero door navigates; 0 console errors.
> The static fire-ledger vision block made STATE-NEUTRAL (it claimed completeness while
> unavailable — caught in browser, fixed). Green: full tsc 0 · backbone:guard 75 (burn
> fixtures: numbering, labels, planted-address trips) · activity 133 · protocol-targets
> 208 · all suites · build 24 shells (21 INDEX, unchanged). WHAT STAYS WINDOWED: nothing for
> the three kinds' history — the ~24h window is ONLY the freshness layer between cycles
> (stated in the banner); pagination/notifications/per-member feeds wait at their M-map
> slices. DEPLOY: needs `drizzle push` for the two ADDITIVE tables (the known unique-
> constraint false-positive caution stands) — prod backbone picks the lane up on its next
> cycle after deploy; the first cycle scans ~3.1M blocks per stream topic-filtered (sparse;
> may take one long cycle or fail-close once and resume — both honest).
>
> **▶ Prior: 🏛 SLICE M6 ✅ SEALED IN PROD (2026-07-14, Replit-verified on
> thesyndicate.money/chronicle): FOUR CHAPTERS LIVE.** Replit report: pull 9/9 hash-verified
> (HEAD 11dcbf4) · full gate green (15 studio + 18 API guards) · published. PROD PROOF: the
> four entries render oldest-first (The duplicate seat 07-12 · The first real-money seat
> 07-12 · The first referral source 07-13 · The ladder decision 07-13); every entry ends with
> its VERIFY card (rendering is UNCONDITIONAL in code); the "first entry awaits" teaser is
> gone from the rendered page and served HTML (the string survives as DEAD CODE — renders
> only on an empty register; Replit's cosmetic note recorded: purging it is optional, not
> urgent); the end-of-page honesty note serves ("An entry enters this register by a
> founder-approved commit — no database, no automation, no silent edits."). M6 THIN-V1 IS
> ALIVE ON THE DOMAIN. NEXT: the founder picks — M7 Economy thin / M1-M3 momentum face / M0 /
> REFERRAL-SHOWCASE / Q-A/Q-B.
>
> **▶ Prior: 🏛 SLICE M6 ✅ COMPLETE — ALL THREE PROMOTIONS DONE (2026-07-14, founder GO "promote all
> three"; full texts were read ON SCREEN per the new standing rule): /chronicle carries FOUR
> true chapters.** One commit per promotion, exactly the doctrine: Entry 2 "The first
> real-money seat" (`94a40a9`) · Entry 3 "The first referral source" (`f3135a7`) · Entry 4
> "The ladder decision" (`eafe78a`); each candidate file marked ✅ PROMOTED
> (candidate-of-record kept). NEW STANDING RULE landed in CLAUDE.md (`5629e2f`, founder,
> permanent): content awaiting a founder decision is pasted FULL inline — he decides on
> screen, never opens repo files; file paths alone are not a report. RUNTIME-VERIFIED on the
> local rig: /chronicle renders all four entries oldest-first, each with its VERIFY card,
> zero console errors. Green: studio tsc 0 · studio guards · build 24 shells (21 INDEX,
> unchanged — /chronicle was already INDEX since Entry 1). M6 THIN-V1 COMPLETE (the register
> holds the duplicate seat · the first real-money seat · the first referral source · the
> ladder decision; the future "the first duplicate was a gift" chapter waits for its
> adoption/opt-in moment per MVP brief §7). NEXT: the founder picks — M7 Economy thin /
> M0-M3 / Q-A/Q-B.
>
> **▶ Prior: 🕯 SLICE M6 ✅ CANDIDATES WRITTEN (2026-07-14, founder GO "promotion stays my act"):
> THREE CHRONICLE CHAPTER CANDIDATES in `docs/chronicle/candidates/`, in the register
> discipline + CANON_PROTOCOL_LANGUAGE §8 solemn-alive voice — NOT promoted (CHR-1: promotion
> = a founder-approved commit into chronicleRegister.ts, one GO per entry):**
> ① `2026-07-12-the-first-real-money-seat.md` — five dollars through the referral link, one
> tx, two recipients, 70/20/10 to the cent, seat #13; the founder's own money ("the protocol
> does not ask a stranger to trust a rail its own founder has not walked"); amounts INCLUDED
> as-lived (the split IS the record); the seat honestly noted metric-excluded + set aside as
> a gift. ② `2026-07-13-the-first-referral-source.md` — the convention's first on-chain
> instance: derived sourceId, fingerprinted terms (served bytes ↔ metadataHash), born-PAUSED →
> ACTIVATED as two founder-signed public acts; "the words and the chain now hold each other."
> ③ `2026-07-13-the-ladder-decision.md` — a DECISION entry: two decoupled ladders, upward-only
> rates, threshold-decides-signature-executes, Summit = the bytecode ceiling; verify = the
> policy doc's commit history + the on-chain cap + future SourceTermsUpdated events. All three
> identity-blind (roles + seat numbers only, zero hex), verify-first, banned-vocabulary clean.
> NEXT: the founder reads each candidate and says GO per entry — each promotion is its own
> commit (entry into chronicleRegister.ts, /chronicle renders it, sitemap unchanged); after
> promotions, /chronicle carries 4 true chapters (M6 THIN-V1 complete).
>
> **▶ Prior: 📜 THE PROTOCOL LANGUAGE CONSTITUTION ✅ BUILT (2026-07-14, founder-briefed slice,
> docs-only): `docs/direction/CANON_PROTOCOL_LANGUAGE.md` IS TIER-0 CANON** (registered in
> 00_CANON_INDEX). INVARIANTS ONLY — eight blocks: §1 identity paragraph (from the live
> site's own words) · §2 the six-beat page sequence (the review grid for every future page) ·
> §3 the voice (calm operator; origin approved concepts carried) · §4 word roles
> (referral/source · "Paid to referrer" · the money-flow formula · the doctrinal verbatim
> sentence · acquisitionCost=bytecode-only · surface naming) · §5 the consolidated banned
> vocabulary (guards = enforcement arm; 5 divergences FLAGGED not fixed: payout context ·
> moon icon · raised class · downline unguarded · contribution/package deliberate) · §6 the
> canonical verbatim lines harvested EXACT (incl. the FLAG: repo says "SYN is the seat, NFTs
> are the memory" vs the brief's "Artifacts") · §7 the three registers (PROOF · CONVERSION
> under "bold claim + verify link" + the four flagship referral showcase lines, escrow claim
> sourced to the origin .sol pushSourcePayout/claimSourceEscrow with the vendored-ABI-absence
> flag · MEMBER) · §8 the event lexicon (six LIVE sentences captured from M5 baseline + five
> RESERVED authored: source activated/paused · ladder promotion "A source rose to {rung} —
> recorded on-chain." · era advance · Chronicle promotion). Application of CONVERSION rides
> M1/M2/M3 (stated in the doc). FOUR DECISIONS CLOSED in OPEN_QUEUE (founder order): avatar
> = Replit App Storage · /wallet DEX deep-link = NO (flow-separation law) · snapshot cadence
> = weekly + before any promotion signing (automation rides M0) · prod RPC = YES
> founder-optional (`AVALANCHE_RPC_URL`, ops act). Horizon note added: white-label
> referral-rail SaaS at the pro-firm ~6-month horizon. The former "pending founder
> decisions" list is now EMPTY. NEXT: the founder picks — M6 / M0-M3 / Q-A/Q-B.
>
> **▶ Prior: 💓 SLICE M5 ✅ SEALED IN PROD (2026-07-13, Replit-verified 20:38 UTC on
> thesyndicate.money/activity): THE HEARTBEAT SHOWS ITS WHOLE HISTORY.** Replit report: pull
> 29/29 hash-verified · full gate green · published. PROD PROOF — the quiet day DEMONSTRATED
> the slice: the ~24h window (blocks 90,190,028→90,233,228) contained ZERO events, and even the
> newest seat (block 90,187,059) sits just below it — so ALL 26 seat lines on the page came
> from the SERVED history, back to 2026-06-04 (block 87,158,947, V1 genesis era). The old
> window-only page would have shown NOTHING. Banner rendered both coverage statements verbatim
> ("all 26 lines, as of block 90,233,113" + the window honesty clause); summary row exact
> ("26 seat(s) across the indexed history · in the ~24h window: 0 burn(s) · 0 referral
> event(s)"); 26/26 verify links present with distinct valid anchors, 3 sampled DEEP (V3
> recent · V3 mid · V1 oldest) → real Avascan "Transaction details" pages server-side (Replit
> guarded against Avascan's 200-to-anything). Method note: a first stale screenshot was the
> capture service's ~3.7h cache, NOT a deploy defect — cache-busted capture confirmed M5 on
> screen. THE M4→M5 CHAIN IS CLOSED IN PROD: unattended indexer → two projections → the
> public page. NEXT: the founder picks — M6 (Chronicle chapters) / M0-M3 / Q-A/Q-B triage /
> pending decisions (avatar storage · DEX deep-link · refresh cadence · optional
> AVALANCHE_RPC_URL).
>
> **▶ Prior: 💓 SLICE M5 ✅ BUILT (2026-07-13, founder GO): /activity REPOINTED ONTO THE SERVED FEED —
> the heartbeat gains its complete seat history.** TWO honest sources now compose on the page,
> each labeled with its OWN coverage in the HealthBanner: ① SEATS from `/api/backbone/feed`
> (complete indexed record V1→V3, newest-first, server-capped; identity-blind aggregate voice
> "A seat was written on-chain — a first seat"), ② the RECENT ~24h CLIENT WINDOW unchanged
> (seat lines WITH their public seat numbers, burns, referral lifecycle). MERGE = dedupe by
> transaction anchor, the window's richer sentence WINS (zero regression: recent seats keep
> their numbers; the feed adds depth beneath the window). Fail-soft: feed unavailable/dark →
> the banner SAYS "the served seat history is unavailable right now — the recent window below
> stands alone" (never a silent gap). `lib/backboneFeedClient.ts` = fail-closed client parse
> (anchor shape re-validated, malformed lines skipped + COUNTED in the banner); summary row
> speaks per-source ("N seat(s) across the indexed history · in the ~24h window: …"); the
> vision block honestly re-scoped ("what the indexer adds NEXT": burns/referral history,
> pagination, per-seat feeds, Chronicle candidates). Fire Ledger untouched (burn-only scope
> never claims served coverage). RUNTIME-VERIFIED both paths: ① local rig (backbone dark) —
> the fallback banner rendered live, window blocks 90,189,114→90,232,314, honest zero, 0
> console errors; ② the studio parser run against the REAL PROD payload — 26/26 served lines
> parsed, 0 skipped, newest = the real V3 first seat (anchor shape OK). Green: studio tsc 0 ·
> studio guards · build 24 shells (21 INDEX, unchanged — no new route). NEXT per the order:
> M6 Chronicle thin (more true chapters) / M0/M1… — the founder picks; Q-A/Q-B triage still
> queued; pending founder decisions unchanged (avatar storage · DEX deep-link · refresh
> cadence · optional AVALANCHE_RPC_URL for cold catch-ups).
>
> **▶ Prior: 🧾 SLICE M4-b ✅ SEALED IN PROD (2026-07-13, Replit-verified 20:10 UTC on
> thesyndicate.money): THE FEED SPEAKS — 26 receipts, V1→V3, zero addresses.** Replit report:
> pull 26/26 hash-verified · full gate green (backbone:guard 44→63 confirmed) · dev honestly
> dark (state "disabled", items [], the honesty line served — no invention when there is
> nothing) · published. PROD PROOF: backbone cycle 1 clean (ok:1, failed:0 — no cold-start
> stumble this time), `/api/backbone/feed` serves 26 lines newest-first covering the WHOLE
> history V1→V3 to head 90,231,688; newest line = the real V3 seat purchase (block 90,187,059,
> firstSeatBucket true, its 64-hex anchor). VERIFIED: 26/26 distinct well-formed transaction
> anchors; bounded sweep of the RAW payload found ZERO 0x40-hex and ZERO bare-40-hex patterns —
> the structural promise held ("don't trust — verify", served). M4 ARC (a+b) = COMPLETE IN
> PROD: the unattended loop + its two sanctioned projections. NEXT per the order: M5 — repoint
> /activity (and the fire-ledger spine stays client-RPC for burns — burns are NOT indexed by
> the backbone yet) onto the served feed: full history replaces the 24h client window.
>
> **▶ Prior: 📡 SLICE M4-b ✅ BUILT (2026-07-13, founder GO): THE PUBLIC RECEIPT-LINE FEED —
> `/api/backbone/feed`.** The read-model's SECOND (and last) sanctioned projection:
> newest-first receipt lines, hard cap 100 (pagination/filters deliberately wait, M5+), each
> line = kind · generation · block N · chain-verified time (blockTimestampSec + isoDayUtc) ·
> THE TRANSACTION VERIFY ANCHOR · firstSeat bucket · routed-fold flag — public chain data only,
> identity-blind (wallets structurally absent; member numbers stay opaque tokens; log indexes
> not served). THE FEED GATE (the slice's one hard design problem, solved fail-closed): every
> anchor must match the EXACT 0x+64-hex transaction shape (a 20-byte address can never pass),
> validated anchors are MASKED, and the remaining JSON must survive the strict address scanner
> — a smuggled address, bare hash, or over-long hex still trips. `src/backbone/feedProjection.ts`
> (pure projection + gate) + `src/routes/backboneFeed.ts` (memory-only, scans before send);
> the runner now retains the last-good model server-side; ActivityItem gained transactionHash
> (aggregate report untouched — items stay structurally excluded, forbidden-field scan intact);
> meta posture honestly updated: publicProjection = AGGREGATE_PLUS_RECEIPT_LINES. Null model →
> honest empty feed. Guards: backbone.guard grew section G (63 checks now: ordering,
> identity-blindness, anchor shape, mask-then-scan trips, cap, route gate) · activity 133 ·
> route allowlists += backboneFeed (protocol-time 38 · member-continuity 92). Green: tsc 0
> (full workspace) · all suites · build 24 shells (21 INDEX, unchanged — API route, zero SEO
> impact). NEXT: M5 (/activity page repoint onto the feed) when the founder opens it.
>
> **▶ Prior: 🏭 SLICE M4-a ✅ SEALED IN PROD (2026-07-13, Replit-verified on thesyndicate.money):
> THE UNATTENDED LOOP LIVES.** Replit report: pull 24/24 hash-verified · NO real migration
> (backbone reuses existing tables; the drizzle-push unique-constraint suggestion was the KNOWN
> false positive and was correctly REFUSED — would have truncated a table) · full gate green
> (16 studio + 18 API guards incl. backbone 44) · flag set IN PRODUCTION ONLY (dev deliberately
> stays dark — default-deny intact) · published. RUNTIME PROOF, three status reads: ① 19:34 UTC
> cycle 1 FAILED CLOSED ("6/6 scan unit(s) errored", redacted, rescheduled — expected cold-start
> catch-up over the huge pinned ranges on the public RPC; the doctrine working, not an anomaly);
> ② 19:42 UTC cycle 2 SELF-HEALED via the cursor: 6/6 units ok to head 90,229,777, 2 events
> indexed, 26 block timestamps verified-enriched; ③ 19:48 UTC cycle 3 exactly 300s later,
> incremental in ~6s, head 90,230,350, 0 new events (a quiet five minutes — honest, not
> invented). Reality spine 57 signals green in prod. OPS NOTE (founder-optional, nothing
> requires it today): provisioning AVALANCHE_RPC_URL (QuickNode) in prod would speed up cold
> catch-ups; cruise cadence is fine on the public RPC.
>
> **▶ Prior: ⚙️ M-MAP ARC OPENED — SLICE M4-a ✅ BUILT (2026-07-13, founder pick: M4 first): THE EVENT
> BACKBONE RUNS UNATTENDED.** The founder chose M4 (critical path) over M0 on screen. The
> existing indexer machinery now runs by itself inside the served process — REUSED end to end,
> nothing parallel: `src/backbone/` = backboneRunner (boot + interval cycles: ① incremental
> sale-event scan via the SAME `runSaleEventScan` engine + ONE shared Drizzle adapter, cursor-
> resumed; ② incremental Protocol Time enrichment — never-verified blocks ONLY, witness-checked,
> the full re-verification replay stays the founder-gated script; ③ in-memory activity read-model
> rebuild) + backboneDb (THE one lazy-DB file of the zone — scan persistence + block-timestamp
> inserts + the SHARED activity loader now used by `activity:derive` too — one loader, one
> decodedJson whitelist, one divergence cross-check) + backboneConfig (DARK BY DEFAULT in EVERY
> env — exact `SYNDICATE_BACKBONE_ENABLED === "true"` literal; cadence
> `SYNDICATE_BACKBONE_INTERVAL_SEC`, default 300s, clamped 60–3600). FAILURE POSTURE: any cycle
> error fails closed (redacted, counted, last-good kept, next cycle scheduled from finally,
> timer unref'd) — the server can never crash or hang on the backbone; no DATABASE_URL → parks
> in "no-database". PUBLIC SURFACE: `/api/backbone/status` = address-safe AGGREGATE snapshot
> only (state, cycle counters, per-unit scannedTo coverage, the read-model's aggregate report),
> output-gated by the new served `assertAddressSafeJson` (addresses + bare 32-byte hashes;
> patterns guard-reconciled byte-identical to the script-side scanner). MOVES (one source of
> truth, scripts now import src): builder → `src/backbone/activityHeartbeatReadmodel.ts` (meta
> posture honestly updated: publicProjection = ADDRESS_SAFE_AGGREGATE_ONLY); protocol-time core
> → `src/lib/protocol/protocolTimeCore.ts`; the CLI's Drizzle adapter → backboneDb (CLI keeps
> pool lifecycle; the SERVER NEVER calls pool.end — shared pool). GUARDS EVOLVED to bind the new
> posture (scoped exemptions, not removals): activity guard (builder path, loader whitelist,
> backbone-zone-only imports, /activity still banned), protocol-time guard (route allowlist +
> backboneStatus, block_timestamp touch = backbone zone only), member-continuity +
> member-continuity-schema + holder-index (route pin + lazy-DB allowlists + backboneDb), NEW
> `backbone.guard.ts` (44 checks: exposure literal, one-DB-file, insert-targets-exact, no
> pool.end, failure posture, output gate) — added to release:gate. DELIBERATELY WAITS (M4-b+):
> the per-item feed endpoint, new event kinds (registry lifecycle/burns), notifications, the
> /activity page repoint (M5). Green: api-server tsc 0 · backbone 44 · activity 131 ·
> protocol-time 38 · member-continuity 92 · schema 28 · holder-index 65 · sale-index 64 ·
> sale-scan 81 · auth-zone 712 · studio suite green · build 24 shells (21 INDEX). **DEPLOY: the
> slice is server-runtime; the backbone stays DARK on prod until the founder sets
> SYNDICATE_BACKBONE_ENABLED=true on Replit (his switch, his moment).** NEXT, IN ORDER: ① M4-b
> (the served per-item feed endpoint — needs its own gate); ② Q-A/Q-B triage; ③ pending founder
> decisions (avatar object-storage · DEX deep-link · refresh cadence — note M0's refresh work
> now partly rides the backbone pattern).
>
> **▶ Prior: 🏁 SESSION SEAL (2026-07-14) — THREE ARCS SEALED IN PROD, Replit-verified 10/10 on
> thesyndicate.money (HEAD `92cf877`):** ① MEMBER HOME ARC — shell `cd1a14c` · A actions/link
> card `d068e54` · B pill/settings `2e8bc73` · C teasers `d509eb5` · D wallet/toolkit `06bdee8`;
> ② ORIGIN-HARVEST ARC — L-1 /liquidity `2086403` · ACT-1 activity/fire-ledger `65390f8` ·
> CHR-1 chronicle `5e8ef14`; ③ THE FIRST CHRONICLE PROMOTION `92cf877` ("The duplicate seat" =
> Entry 1, publicly readable + verifiable). Live-verified highlights: the activity feed
> rendered the REAL "Seat #14 was written on-chain — a first seat" ON PROD with its verify
> link; burn total 21,273 SYN live; sitemap exactly 21 INDEX; the three killed/console strings
> at 0 occurrences in 19 served chunks; introductions:check OK.
> **LOCKED DECISIONS (this session, do not re-litigate):** the "My Syndicate" door/name is
> DEAD (banned, guard-enforced) · avatar = THREE sources (founder §11: sigil default LIVE ·
> uploaded = future object-storage decision · NFT = chain-verified ownerOf + badge + verify
> tooltip) · the FLOW-SEPARATION LAW (LP links never leave /liquidity's context/Risk Notice) ·
> client-RPC feeds = HONEST RECENT WINDOW (never proof of absence; the indexer upgrades to
> complete history later) · Chronicle promotion = a FOUNDER ACT via commit, no DB, no
> automation · REUSE-BEFORE-CREATE is standing (every report ends REUSED vs CREATED).
> **NEXT, IN ORDER:** ① the founder picks M-map slice 1 ON SCREEN — M0 (refresh automation)
> vs M4 (event backbone) — nothing opens before the pick; ② Q-A/Q-B triage (OPEN_QUEUE — the
> two screenshot-sourced header observations); ③ pending founder decisions: avatar
> object-storage · the DEX deep-link URL if wanted · the snapshot-refresh cadence.
>
> **▶ Prior: 🏛️ THE FIRST CHRONICLE PROMOTION (founder GO, 2026-07-14): "The duplicate seat" is
> ENTRY 1 of the public register.** The candidate's text carried faithfully into
> `chronicleRegister.ts` (the counts stated as N/M with the as-lived 12/11 narrative — the
> entry records the day, the live pages record the present); the candidate file marked
> ✅ PROMOTED (kept as candidate-of-record); /chronicle FLIPPED PENDING→INDEX (sitemap 21
> INDEX, 3 noindex remain); the Chronicle door moved to "Open today". RUNTIME-VERIFIED:
> entry renders with its verify card, the empty-state honestly gone. Promotion = this commit —
> exactly the doctrine.
>
> **▶ Prior: ORIGIN-HARVEST ARC — SLICE CHR-1 ✅ BUILT (2026-07-14): CHRONICLE V1 — zero infra, the
> register is a COMMITTED FILE, promotion is a FOUNDER ACT.** `config/chronicleRegister.ts`
> (typed entries: id · dateUtc · title · sections · verifyNote; register discipline pinned in
> the header: protocol-institutional · identity-blind · amount-blind · verify-first; EMPTY at
> ship). /chronicle = TWO honest states: register empty → the designed teaser + "the first
> entry awaits the founder's promotion" (no invented history); register speaks → the solemn
> oldest-first record with per-entry verify cards + the no-silent-edits footer ("the
> register's own history is public in the repository"). The origin labs promotion screens
> ADAPTED into `components/admin/ChroniclePrepare.tsx` (Content section of the console,
> VERIFIED absent from the public bundle): formats a candidate into the exact entry shape for
> the founder's commit — writes NOTHING, no DB, no auto-promotion ever. /chronicle SEO stays
> PENDING/noindex per the rule (flips to INDEX only when the first entry is promoted). The
> 2026-07-12 duplicate-seat candidate is PRESENTED to the founder at the END of this order —
> the founder decides. Green: tsc 0 · 12 guards · seo 40 · rewrites 23/46 · surface 24 ·
> build 24 shells.
>
> **▶ Prior: ORIGIN-HARVEST ARC — SLICE ACT-1 ✅ BUILT (2026-07-14): ACTIVITY V1 + FIRE LEDGER
> DETAIL — one recent-window RPC feed spine, the teasers GREW into live pages.**
> `lib/activityFeed.ts`: client chunked getLogs over ~24h (43,200 blocks, 2000/chunk, address
> array), events RETARGETED VERBATIM from today's repo — MembershipPurchasedV3 (24 params from
> saleEventDecoders, SELF-CHECKED at module load: toEventSelector(signature) must equal the
> pinned topic0 or the module throws) · ERC20 Transfer filtered to==burnAddress · the 3
> SourceRegistryV1 lifecycle events (from the .sol). Addresses from verify-links, never
> hardcoded. Chain-time stamps from block headers (never a wall clock); fail-soft chunks
> (coverage shrinks HONESTLY, reported in the banner), fail-closed decode. THE HONESTY LAW
> rendered: the HealthBanner states the exact covered block range + "never evidence of
> absence" + "the complete indexed history arrives with the event indexer".
> `components/activity/LiveActivityFeed.tsx` (origin chrome adapted): type pills · memory
> anchor flag (receipt-thread doctrine) · per-row tx verify link · filter chips · summary row.
> /activity = the live feed + "what the indexer adds" vision block; /fire-ledger = live total
> + burn-only feed + vision block; both FLIPPED PENDING→INDEX (real live content; sitemap 20
> INDEX; lifecycle-guard exemptions removed — the pages render their badge directly); member
> doors: Activity + Fire Ledger moved to "Open today". **RUNTIME-VERIFIED against the real
> chain:** banner shows blocks 90,181,087→90,224,287; the feed rendered the REAL seat event
> (1 seat · 0 burns · 0 referral in-window) — and the "missing" referral events were PROVEN to
> sit at blocks 90,177,061/90,177,131, ~4k blocks BEFORE the window: the honest window doing
> exactly what it claims. CSP connect-src verified ('self' https: wss:). Green: tsc 0 · 12
> guards · seo 40 routes/20 INDEX · rewrites 23/46 · surface 24 · build 24 shells.
>
> **▶ Prior: ORIGIN-HARVEST ARC — SLICE L-1 ✅ BUILT (2026-07-14, autonomous work order): /liquidity.**
> Origin harvest ADAPTED (liquidity.tsx + rail/why/status): ① WhyLpMatters 3 cards, "small on
> purpose · early LPs shape the pool" framing KEPT; ② the Action Rail — Trade · Add Liquidity ·
> Become an LP (anchor) · View Pool · Verify Pair (verify-links lpPair, fail-closed).
> **LINK VERIFICATION (in-slice, dated):** DexScreener pair page FOUNDER-VERIFIED in browser;
> honest note: DexScreener's public API returns pairs:null for this micro-pair (both pair +
> token-pairs endpoints probed — API doesn't index it; the web page is the verified artifact).
> Trade + Add (origin traderjoexyz.com URLs) both HTTP 200 (403 on HEAD = bot filter; GET+UA
> clean; lfj.gg also 200). ③ LpStatus on the EXISTING spine reads — useTokenomics extended
> +lpReserveSyn/+lpReserveUsdc (financial.lp.* already served; no new read path). ④ LP Risk
> Notice (4 real risks) + the no-entitlement verbatim line ×2 (guard-forbidden-copy caught
> "pooled" in the impermanent-loss row → reworded, the guard working). ⑤ FLOW-SEPARATION LAW:
> zero Join CTA on the page; memberActions += exactly ONE "Liquidity & trading" → /liquidity;
> memberDoors += GROWTH group (Liquidity door); /wallet's pool card REPOINTED internal →
> /liquidity (the DEX links never travel without their page context + Risk Notice). SEO INDEX
> (real live content): registry 40 routes · sitemap 18 INDEX · rewrites 23/46 · build 24 shells.
> STEP 0 rides this commit: SEASONS_ENGINE re-staged fresh (the avatar bullet is now a FOUNDER
> DECISION — sigil default LIVE · uploaded = future object-storage decision · NFT = chain-
> verified ownerOf with badge + verify tooltip).
>
> **▶ Prior: MEMBER HOME ARC — SLICE D ✅ BUILT (2026-07-14) — THE ARC IS COMPLETE (shell + A + B +
> C + D, one commit each, all pushed):** the WALLET DOOR + the TOOLKIT (§11 point 7).
> **⚠️ ROUTE DEVIATION (infra truth wins, honest note):** the ordered /member/wallet would
> emit a `member/` DIRECTORY in dist and resurrect the 2.0 trailing-slash redirect on /member
> — routes are FLAT: **/wallet** + **/toolkit** (doors labeled Wallet · Toolkit; member shell
> on both; full lockstep: registry 39 routes · rewrites 22/44 · surface 23 public · prerender
> 23 shells = 17 INDEX + 6 noindex). **/wallet** = `wallet/MemberWalletPanel.tsx`: own SYN +
> USDC balances live (fail-closed) · THE APPROVALS PANEL (own allowances toward KNOWN
> spenders — USDC→Sale V3 today; "an approval is not a payment" in plain words; the checkout
> approves EXACT amounts, stated) · REVOKE = approve(spender, 0), the member's OWN signed
> wallet act, SIMULATE-FIRST + honest revert translation, NEVER a server write · the SYN/USDC
> pool as an EXTERNAL-posture link to the ON-CHAIN PAIR (verify-links lpPair; a DEX deep-link
> was deliberately NOT invented — the founder supplies the exact canonical URL if wanted;
> "pool is a courtesy" doctrine lines carried). **/toolkit** = the Slice-A action registry as
> the public conversion surface (visitor-verified live: 3 locked-visible actions with
> reasons + the open /join action + the 10-door shell). RUNTIME-VERIFIED on the local rig:
> /wallet honest connect state · /fire-ledger renders the REAL live burn (21,273 SYN — the
> chain figure) · /toolkit conversion state · a real duplicate-key bug in TeaserSurface
> caught in console and fixed (index keys for repeating preview shapes). Green: tsc 0 ·
> 12 guards · seo 39 routes · rewrites · surface · build 23 shells.
>
> **▶ Prior: MEMBER HOME ARC — SLICE C ✅ BUILT (2026-07-14): the §11 slot-2c DESIGNED TEASERS.**
> New chassis `components/TeaserSurface.tsx` (living-chassis pattern): one-paragraph
> what-this-will-be · existing posture badge · a "Design preview — the shape, not data" block
> (abstract rows, ZERO figures) · what-unlocks-it · return hook (historical FOMO only) + an
> optional LIVE slot for already-readable figures. THREE new PENDING/noindex routes in full
> 2.0 lockstep (registry + App + surfaceClassification + artifact.toml regen 20 routes/40
> rules + prerender 21 shells = 15 INDEX + 6 noindex): **/activity** (heartbeat teaser) ·
> **/chronicle** (the solemn record; the four lived chapters named as preview shapes) ·
> **/fire-ledger** — which CARRIES THE LIVE TOTAL BURN (useHeroReality burnedSyn + burnAddress
> verify link; readable ⇒ displayed; fail-closed). /archive (already honest with real
> contract-memory content) gained its missing teaser elements (unlocks + return hook) without
> being gutted. Sidebar coming-soon doors now OPEN their teasers (Activity/Chronicle/Archive/
> Fire Ledger), badges unchanged. guard-lifecycle-labels extended honestly: teaser pages exempt
> BECAUSE the chassis renders the badge — paid for by a new chassis check that goes red if
> TeaserSurface ever drops the LifecycleBadge. Green: tsc 0 · 12 guards · seo 37 routes ·
> rewrites 20/40 · surface 21 public · build 21 shells.
>
> **▶ Prior: MEMBER HOME ARC — SLICE B ✅ BUILT (2026-07-14, UI-ONLY — zero new server writes, zero
> new DB tables, as ordered):** ① the HEADER MEMBER PILL — the Q25 menu REHOUSED (never
> rebuilt): the trigger + menu header now carry the member's deterministic MemberSigil
> (18px pill / 36px header) instead of the generic hexagon; era badge unchanged; bell +
> trophy render as RESERVED header icons (visible, inert, honest "Coming soon" tooltips —
> notifications = event backbone; trophy = seasons, recognition-only); a "Settings" item
> joined the menu → /member#settings. ② `wallet/MemberSettings.tsx` (rule-15 lazy, anchored
> #settings on /member): Avatar = sigil default with uploaded(SOON)/nft(FUTURE) named
> abstraction · Alias SOON (IDENTITY-ALIAS) · Language SOON (no i18n — a dead switch would
> lie) · Theme REAL (existing ThemeToggle reused) · Notifications SOON · Session REAL
> (wallet + VerifyOnChain + Disconnect via the EXISTING logoutSession) · Reset profile SOON
> with "THE SEAT IS PERMANENT" stated · NO email field ever (ADR-003). Chrome learned from
> Supa AvatarUploader/Settings, copied nothing. AVATAR-STORAGE INFRA QUESTION → flagged for
> the founder report. Green: tsc 0 · 12 guards · build 18 shells.
>
> **▶ Prior: MEMBER HOME ARC — SLICE A ✅ BUILT (2026-07-14, autonomous work order, founder GO):**
> ① `config/memberActions.ts` — THE action registry (origin actions.ts harvested for shape,
> adapted): copy-my-referral-link (lock: session) · share-my-proof (lock: seat) ·
> expand-footprint→/join (open) · verify-my-seat-on-chain (lock: seat, real VerifyOnChain
> engine link); locked = visible + plain reason; NO operator action exists in the registry.
> Rendered by `components/member/MemberQuickActions.tsx` (own-row via the sanctioned dynamic
> walletSession import; fail-closed handlers) — replaced the old static row on /member.
> ② THE REFERRAL LINK CARD (§11 slot 2b) — the SAMPLE link/`SAMPLE-CODE` block in
> MemberReferralDashboard is GONE, replaced by `MyReferralLinkCard`: the member's PERMANENT
> link derived from their wallet (SPEC §③), TWO honest states read LIVE from the registry
> (ACTIVE → "commission paid inside the buyer's own transaction — live" + "Source active"
> pill · not-signed → "your link is permanent — commission activates when your source is
> founder-signed"), copy/QR/ShareMenu wired to the REAL link; no wallet → honest derive-note,
> no sample. Reused existing reads only (deriveSourceId · verify-links · readSourceConfig) —
> zero new endpoints. ③ GUIDE ON THE MEMBER SHELL — ALREADY TRUE by construction:
> `SyndicateGuide` mounts unconditionally in PublicLayout and /member is a PublicLayout page;
> verified, no fork, no change (reported, not rebuilt). guard-no-fake-live caught the bare
> "Active" pill → "Source active" (the guard working). Green: tsc 0 · 12 guards · seo 323 ·
> build 18 shells.
>
> **▶ Prior: MEMBER SHELL — Member Home slice 2, BUILT (founder GO; awaiting diff approval → deploy):**
> the two-shells rule realized — `components/member/MemberShell.tsx` (left sidebar of member
> doors, chosen BY THE PAGE inside the public chrome; public pages + prerender untouched) +
> `config/memberDoors.ts` — RECONCILED at staging time to SEASONS_ENGINE **§11 wireframe v2**
> (advisor harvest "agreed with the founder", discovered on disk during this slice; repo wins):
> the SHORT door list (every Coming-soon is a public promise) — Open today: Member Home ·
> Referral dashboard (anchor; LIVE day one) · Recognition · Protocol graph (/map) · Coming soon
> (existing LifecycleBadge, locked-visible): Activity PENDING_ADAPTER · Chronicle FUTURE ·
> Archive PENDING_ADAPTER; NO operator door exists in the config at all. **FOUNDER DECISION
> (2026-07-14): the "My Syndicate" door is DEAD** (downline connotation; content = the Referral
> dashboard) — removed from the naming canon, "my syndicate" added to bannedSurfaceNames, the
> guard adapted in lockstep. `MEMBER_HOME_PLAN` imported to docs/handoff/ as TIER-3 HISTORICAL
> with a SUPERSEDED banner naming its stale STATE lines (router NOT deployed · both walls down ·
> thresholds decided in CONNECTOR_LADDER_POLICY).
> PLUS §11 slots 3–5 RESERVED VISIBLY on the page (dashed coming-soon cards: Season · Quests ·
> "While you were away" — recognition-only copy, nothing simulated).
> §4 fold-ins landed: the RECEIPT + "Share my proof" MOVED from WalletSessionPanel into the
> Your Seat strip (moved, not rebuilt; one receipt surface) · live **SYN balanceOf** rendered in
> the strip (token address from verify-links, fail-closed) · the **Chapter** line rendered from
> `lib/chapters.ts` (the deferred item — the clean import path now exists). RETIRED (repo-wins
> honesty): the old identity-ribbon card + raw AccessStateChip on /member · the STALE "View your
> receipt — PENDING_ADAPTER" non-link (the receipt is real). The referral dashboard MOVED out of
> the Source tab to the anchored `#referral-dashboard` section (the sidebar door's target;
> ladder law "visible progress everywhere"). Verified on the local rig (api+studio): sidebar in
> DOM with all 10 doors · zero console errors · ribbon + stale link gone · anchor live.
> Green: tsc 0 · 12 guards · seo/rewrites/surface · build 18 shells. NEXT Member Home slices:
> quick-actions role registry · member doors deepening (per §4.3/4.5).
>
> **▶ Prior: LADDER-PROMOTION-SCREEN → ✅ SEALED IN PROD (`28ccbaa`, Replit-verified 4/4, 2026-07-13:
> source-standing fail-closed unchanged · intro guard 45/45 on their side · data-drift check OK
> with the head 1,466 blocks ahead · member banner IN the served bundle, founder panel ABSENT
> from it). R5 was sealed the same day (`93a69dd` + `56a7f4b` drift-fix, verified 4/4). The
> WHOLE REFERRAL ARC IS LIVE END-TO-END: terms (hash-committed) → first member source (founder-
> signed) → introduction indexer → ladder → promotion loop.** Original build state:
> the ladder's promotion loop end-to-end, on the R5 spine. **FOUNDER RULE ENGRAVED (2026-07-13,
> "simple + transparency"): NO compensation for the waiting gap between threshold crossing and
> signature — the rate applies at on-chain recording (never retroactive); the waiting is VISIBLE
> and DATED** (member screen: "Promotion due — awaiting founder signature" + the crossing date;
> the public `SourceTermsUpdated` event dates the raise — that IS the answer to "scam" criers).
> ① Read-model: per-source ladder facts — `currentBps` (live registry read at build),
> `entitledBps/Title` (from `connectorLadderCanon.ts`, guard-reconciled literal-for-literal
> against the studio config — one ladder, two artifacts), `promotionDue`, and the CROSSING
> chain-dated (`crossedAtBlock` = the k-th durable first-purchase block, `crossedAtDateUtc` from
> the block header — never a wall clock). ② The builder now emits TWIN snapshots — api
> `introductionSnapshot.ts` + studio `config/introductionIndexSnapshot.ts` (same run, same hash,
> guard-asserted equal; address-free by construction so the twin can sit in the client repo; it
> is imported ONLY by the operator-gated panel, verified absent from the public bundle).
> ③ `/api/auth/source-standing` serves the due fields own-row; `walletSession` parses them.
> ④ Member banner in the standing section renders the founder rule verbatim. ⑤ Founder console:
> `wallet/ProposeSourcePromotion.tsx` in /admin/sources — the PERSISTENT REMINDER (renders the
> due count until every promotion is signed), identity-free due rows, wallet-bind (founder
> enters the member wallet → derive sourceId → browser sha256 sourceKey must MATCH a due row →
> live record read → live-vs-indexed rate consistency assert, fail closed) → `updateSourceTerms`
> with ONLY `commissionBps` changed, all terms VERBATIM from the live record (contract reverts
> on wallet drift) → Form 2 signing with owner() gate + revert translation. `chainReads`
> SourceRecordRead extended with startTime/endTime/grossCap/perBuyerCap (exact decimal strings)
> for verbatim resubmission. Green: studio tsc 0 + 12 guards + seo/rewrites/surface + build 18
> shells + promotion code ABSENT from public bundle · api tsc 0 + auth-zone 656 + intro guard
> 45 (ladder fixtures: 10-durable → Trusted-due, crossing = 10th durable block) + canon +
> reality 138/138. Snapshot regenerated with ladder facts (asOfBlock 90184731, still 2/1/2,
> nothing due today — the BUILDER_SOURCE sits below Trusted).
>
> **▶ Prior: R5 — THE INTRODUCTION INDEXER, BUILT (2026-07-13, founder GO; awaiting diff approval →
> deploy):** the "one brick, five surfaces" read-model exists on the proven pattern (pure builder
> · founder-gated build script · guard suite), REUSING the existing scan engine (adaptive chunked
> zero-gap eth_getLogs over the V3 MembershipPurchasedV3 unit, in memory, no DB) — a snapshot is
> NEVER emitted from a scan with holes (the 2026-07-12 standing rule, enforced in code).
> **R5a:** `introductionReadmodel.ts` (pure, deterministic, fail-closed) + `introduction-index-build.ts`
> (+ `--check` drift mode) + `introduction-index.guard.ts` (27 checks) + the GENERATED served
> snapshot (committed): asOfBlock 90180944 · 2 attributed purchases · 1 source (BUILDER_SOURCE;
> the founder's member source has no referred buys yet) · 2 durable. **THE DURABLE TEST (founder
> GO, recommendation adopted — seats are bytecode-permanent so seat-held has no anti-fraud
> teeth): durable = the introduced member's wallet still holds SYN at index time**
> (`DURABLE_TEST = "SYN_BALANCE_HELD"`, one constant to change if re-ruled). The count may dip;
> a signed promotion never reverts. PRIVACY: the snapshot carries NO wallet/memberNumber/txHash
> and NO raw sourceId — per-source rows are keyed by the opaque `sourceKeyOf` hash.
> **R5b:** GET `/api/auth/source-standing` (own-row: session wallet → derived sourceId → own
> counters; registry existence/active read LIVE; auth zone stays registry-less via the spine
> helper `sourceStandingRead.ts` — guard-auth-zone 649 green). **R5c:** the member referral
> dashboard renders the REAL indexed standing (4 figures + as-of block) + the Connector LADDER
> progress (`config/connectorLadder.ts` — the 7 canon rungs; bar never empty, next rung named,
> summit stays rare); memberCards honestly flipped (introductions/pending/paid → READ_ONLY_PROOF;
> per-receipt rows stay PENDING_ADAPTER). **RIDER:** `commissionTiers` = the canon ladder preview
> (Emerging→Summit + Partner-as-class; Trusted 6%). REFRESH RULE: the snapshot is an honest
> SERVED SNAPSHOT (as-of labeled); re-run `introductions:build` (founder-gated) to advance it;
> `introductions:check` fails on drift. All green: studio tsc 0 + 12 guards + seo 323 + rewrites
> + surface 218 + build 18 shells · api tsc 0 + canon + reality 138/138 + auth-zone 649 + intro
> guard 27. LADDER-PROMOTION-SCREEN is now UNBLOCKED (consumes durableIntroductions directly).
> **POST-DEPLOY CORRECTION (2026-07-13, honesty register material):** Replit's point-3 "DRIFT =
> new attributed purchase" (and my own framing) was an OVER-READ — the totals never moved
> (2/1/2); the v1 `--check` hashed the FULL model including the moving `asOfBlock`, so it could
> NEVER pass. Fixed same-day: `readmodelContentJson` (head normalized out) + the check now
> compares DATA content and says "the head advancing alone is not drift" — proven live
> (committed 90183425 vs head 90183507 → OK). No new attributed purchase has occurred; the
> protocol's first indexed truth stands at 2 attributed / 1 source / 2 durable.
>
> **▶ Prior: 🏆 R2 IS DONE — THE FIRST CONVENTION-DERIVED MEMBER SOURCE IS LIVE ON-CHAIN (2026-07-13,
> both founder signatures):** sourceId `0x804e80f1…ae974` = keccak256("SYN.SOURCE.V1",
> `0x88EC79AF…Dd73`) — the FIRST source following the SPEC §③ convention. Chain-verified:
> class MEMBER_INTRODUCTION · 500 bps · LIFETIME · no caps · repeat=true · sourceWallet ==
> payoutWallet == the founder wallet · metadataHash EXACTLY `0xc8480867…1e6e48` (== the served
> terms document, verified on three planes) · created PAUSED 04:19:22Z → ACTIVATED 04:20:36Z
> (block ~90177188). The founder signed both acts in his own wallet through the PROPOSE screen
> (Form 2's first real use). LIVE PROOF: the prod quote
> `/api/join/quote?grossUsdc=5000000&sourceId=0x804e…` returns `sourceValid:true`,
> `acquisitionCostRaw:250000` (5% = $0.25 on $5), net 4.75 → the member referral link
> `https://thesyndicate.money/join?source=0x804e80f1…ae974` pays live. NOTE (process, honest):
> the founder signed create+activate back-to-back, so the planned PAUSED fail-closed spot-check
> between signatures was skipped — the born-PAUSED sequence itself is contract-enforced and both
> states were read back on-chain after the fact. UNLOCKED NEXT: the auto-derived member link
> card (the convention now has a real on-chain instance) · R5 the introduction indexer.
> LOCAL SIGNING RIG (now proven, reusable): api-server runs on Windows via
> `NODE_ENV=development; PORT=5000; npm run build; node dist/index.mjs` (the npm dev script is
> bash-only) · studio needs `.env.local` `VITE_WALLETCONNECT_PROJECT_ID` (public by design —
> recovered from the prod bundle) · vite dev /api proxy + the fail-closed verify-links read
> shipped in `8c4843c`.
>
> **▶ Prior: R1+R2 — THE FIRST MEMBER SOURCE, BUILT (2026-07-13, founder GO; signing = a founder act,
> pending):** ① **R1 the program terms document** exists and is PUBLIC:
> `artifacts/studio/public/referral-program-terms-v1.txt` served at
> `/referral-program-terms-v1.txt` (flat filename ON PURPOSE — a `referral/` directory would
> re-trigger the 2.0 trailing-slash auto-redirect on /referral) + linked from /referral. Its
> keccak256 IS the on-chain `metadataHash` (LIFETIME member sources revert `MissingMetadata`
> without it); the hash is NEVER hardcoded — `lib/termsDocument.ts` fetches the served file and
> hashes the raw bytes at need (edit the wording → the hash follows by construction). ② **R2 the
> PROPOSE screen** (Constitution §④ FORM 2, the first instance of the pattern that unblocks all
> admin): `wallet/ProposeSourceCreate.tsx`, mounted lazy in `/admin/sources` (operator console —
> dead-code-eliminated from public builds, VERIFIED absent from the default bundle). It reads the
> registry `owner()` LIVE and states which wallet must sign; derives
> `sourceId = keccak256("SYN.SOURCE.V1", wallet)` (`lib/sourceIdentity.ts` — the convention's
> first implementation); shows EVERY SourceTerms param in clear + the irreversibles (permanent
> sourceId · payoutWallet unchangeable by term updates); builds `createSource` (born PAUSED,
> contract-enforced) then `setSourceStatus(ACTIVE)` as TWO separate signed acts with the
> fail-closed /join?source= check stated between them; blocks activation on a metadataHash
> mismatch vs the served document. ABIs transcribed from `SourceRegistryV1.sol` read line-by-line;
> writes via wagmi in the founder's wallet ONLY. New reads: `readRegistryOwner` +
> `readSourceRecord` (chainReads). guard-access-state respected (raw I/O in lib, not wallet).
> All green: typecheck 0 · 12 guards + no-raw-color 0 · seo:check 323 · rewrites OK ·
> surface:audit 218 · build 18 shells; terms file byte-identical in dist
> (keccak256 `0xc8480867…1e6e48` as written — recomputed live at signing; the /referral display
> and the PROPOSE screen both hash the SERVED file, so they follow the bytes automatically).
> **HUMAN-READABLE PASS APPLIED (founder, 2026-07-13 — the §8 pattern everywhere: human words
> first, contract term in parentheses for verifiers):** scope line "member referral sources (the
> contract's MEMBER_INTRODUCTION class)"; header + §9 "the source's terms fingerprint (the
> contract's metadataHash field)"; header keccak256 introduced as "its digital fingerprint"
> (exact algorithm name kept for verifiers); the /referral sentence aligned. FOUNDER CORRECTION
> APPLIED (2026-07-13, settled canon — a referrer does NOT have to be a member; classes differ):
> the v1 document is SCOPED to the member program — title "MEMBER REFERRAL PROGRAM TERMS", id
> `SYN.REFERRAL.MEMBER.TERMS.V1`, scope line "MEMBER_INTRODUCTION sources only; other classes
> (partner, builder, affiliate) get their own versioned terms documents, one class · one doc ·
> one hash". **FINAL PRE-HASH REVIEW APPLIED (advisor-consolidated, founder-approved,
> 2026-07-13):** ⓐ escrow truth-fix VERIFIED against MembershipSaleV3.sol:296 —
> `claimSourceEscrow` reverts `SourceEscrowLocked` unless the source is ACTIVE; §8 now says
> escrow is claimable "whenever the source is ACTIVE", locked while paused/revoked (the old
> "at any time" was an overclaim). ⓑ **FOUNDER OVERRIDE — NO buyer clear/remove of a referral,
> anywhere** (the referral never changes the buyer's price; visibility — always shown before
> signing — is what makes it honest; a removal control only strips earned work): terms §8
> rewritten; `referralProgram.ts` antiAbuse line replaced, the "Cleared" program state REMOVED,
> the config comment fixed; checkout UI verified to contain no such control (none existed).
> ⓒ three standard clauses added as §6 THE REFERRER'S STANDING (independent participant ·
> link/source personal, not transferable · legal age + jurisdiction responsibility).
> ⓓ §1 "may be granted" (founder-signed creation, not an automatic right). ⓔ hash practicality:
> header declares UTF-8/LF; `.gitattributes` pins the file `text eol=lf` (the hash is an
> on-chain commitment — bytes must never be rewritten by autocrlf); /referral now renders the
> LIVE-computed keccak256 next to the terms link (fetched+hashed in-browser, fail-closed,
> never hardcoded) with a VerifyOnChain link to the registry; deploy verification must ALSO
> assert served-bytes == repo-bytes. LOCAL-ENV NOTE
> (Windows): the api-server dev script is bash-only → the local dev app renders blank on clean
> main too (A/B verified with git stash); NOT a slice regression — Replit is runtime truth.
> NEXT: founder approves the terms WORDING + the diff → push → deploy (the terms URL must be
> public before signing) → the founder signs create (PAUSED) → fail-closed check → signs ACTIVE
> → the first convention-following member source exists (unlocks the auto-derived member link
> card, a follow-up slice).
Direction specs now live IN this repo: `docs/direction/MASTER_BUILD_SPEC.md` ·
`docs/direction/CONTENT_SUITE_SPEC.md` · `docs/direction/WHITEPAPER_PLAN.md` ·
`docs/direction/WHITEPAPER_LIVING_DOCTRINE.md` (living-protocol soul + chassis) ·
`docs/direction/CONTENT_SURFACE_HARVEST_MAP.md` (content-page harvest map) ·
`docs/direction/GAMIFICATION_LEGAL_DOCTRINE.md` (recognition-only, legal shield).
Design tracker: `docs/DESIGN_ROADMAP.md`. Doctrine/roles: `docs/00_START_HERE.md`.

> **▶ 🏆 THE FIRST REAL PURCHASE HAPPENED (2026-07-12 23:32 UTC, sealed 2026-07-13).** C5 published by
> the founder; the $5 test THROUGH the referral link succeeded on the first attempt:
> tx `0x353bf2c0…c42178` — 5 USDC in → **0.25 USDC paid to the referrer's payoutWallet IN the same tx**
> (the referral rail works with real money) → net 4.75 split EXACTLY 3.325/0.95/0.475 (70/20/10) →
> 500 SYN delivered → **SEAT #13** (chain-verified: `memberCount=13`, `memberNumberOf(buyer)=13`,
> `memberByNumber(13)=buyer`). The living protocol did the rest BY ITSELF: the public headline reads 13
> everywhere and the honest readback recomputed to **"13 seats / 12 distinct wallets (1 holds two)"** —
> zero human edits, zero console errors, CSP clean. **The Syndicate OS sells seats in production.**
> **Post-C5 polish → ✅ SEALED in prod (founder-screenshot-verified):** member-aware seat line
> (`f950354` — a seated wallet reads "You hold seat #N … never a second seat", own-row live
> `memberNumberOf`; generic always-true line for everyone else) + the multichain-USDC trap named in
> the balance-short message (`a852da1` — founder-discovered on the first cross-device test: wallets
> aggregate balances across networks; the message now says on-Avalanche-native-USDC-only + what to do).
> **REFERRAL PUBLIC ACTIVATION → ✅ BUILT (this commit, founder GO):** `programLifecycle` +
> `sourceAttributionLifecycle` → **LIVE_ACTION** (the badge text is exactly true: the commission is
> paid inside the buyer's own signed tx — proven, seat #13); `activeCopy` (prepared since 2026-07-07)
> now renders via the lifecycle-selected `currentProgramCopy` on /source-attribution, the member
> referral dashboard and the admin panel; intro/model/boundaries rewritten to the active truth (new
> sources = founder-signed on-chain acts, R2; never "earn now"); memberCards honestly relabelled
> (link = usable via the /source builder · introductions/receipts/commissions = PENDING_ADAPTER, the
> R5 indexer is the gap · standing = FUTURE); `guard-safe-source` ADAPTED IN the slice per
> CANON_LOI_ANTIBLOCAGE and RE-LOCKED (pins now assert LIVE_ACTION; the protective disclaimers stay
> pinned forever — the copy guard even caught "payout"/"your share" during the build and the wording
> was corrected, working as designed). NOTE: the auto-derived member link card is NOT in this slice —
> the existing BUILDER_SOURCE id predates the `SYN.SOURCE.V1` derivation (verified: no variant
> matches); it lands with the first convention-following member source (R2).
> **REFERRAL-FIRST NAMING (founder order, 2026-07-13, same arc):** "Referral" is the USER word on
> every public surface — human-readable, no mental load; "Source" stays the PROTOCOL word in
> proof/registry/operator contexts ("powered by Source Attribution"). Renamed: footer/nav labels
> ("Source Attribution"→"Referral Program", "Verified Introduction"→"Referral Link"), page titles
> (/source-attribution → "Referral Program", /source → "Build your referral link"), SEO entries, the
> /join card ("Referral link detected"), quote lines, CTAs, learning/docs/facts copy ("introduction
> id"→"referral code"). This pass ALSO killed two claims the activation had made false ("never a
> payment/commission" on the builder card + the /source-attribution SEO description). The old
> language lock ("verified introduction — NOT referral", LIVING_ORGANISM §8) is SUPERSEDED by the
> founder's 2026-07-07-corrected word roles + this order. NEXT = R2 (the founder creates the first
> member source) or the R5 indexer, at the founder's signal.
>
> **▶ Prior: 🔴🚀 C5 GO-LIVE (founder GO, 2026-07-13) — THE FLIP IS IN THIS COMMIT.** `CHECKOUT_ENABLED = true`:
> the two-signature approve→buy is PUBLISHED on `/join` (checkout chunk verified PRESENT in the bundle;
> the boundary card verified GONE). The COMPLETE MUST-CHANGE sweep executed in the same commit: /join
> lead + badge (new lifecycle **LIVE_ACTION** — "Live — signed from your wallet", gold identity axis;
> `guard-posture-map` adapted to allow EXACTLY that one key; `PostureBadge` widened to full
> SourcePosture) · SEO title/description · surfaceClassification · modules + moduleRegistry STATE ·
> syndicateFacts ×3 · guide/docs content · FAQ 98/106/114 re-written to the live-buy truth ·
> whitepaper §05 · routeMemory · SERVER: sourceStatus sale note + buyReadiness **NOT_WIRED →
> LIVE_ACTION** (openapi enum + orval regen; the ONE live action, asserted by `verify-canon-integrity`
> in lockstep: LIVE_ACTION count === 1 === buyReadiness) · protocolTargets unitNotes ×3. All green:
> studio typecheck 0 + 12 guards + seo:check + rewrites:check · api-server typecheck 0 + verify:canon
> 35/35 + reality 138/138 + auth-zone 622. NEXT: Replit publish → **the founder's $5 test THROUGH the
> referral link** (protocol + the 3 wallet conditions in the C5 handoff) → expected seat #13, readback
> recomputes 13/12 → then the REFERRAL PUBLIC ACTIVATION slice (OPEN_QUEUE). Rollback = flip the
> literal back, one commit, one deploy.
>
> **▶ Prior: 🔴 AUDIT SESSION (2026-07-13) — full pre-flip audit DONE; verdict was "NOT BEFORE …"; the
> founder triaged it:** **GROUP A → ✅ SEALED in prod (`ed9af22`, Replit all-gates + live-verified:
> zero CSP violations on home//join//faq, quote intact under CSP, permanent disclaimer renders, new
> FAQ in the served JSON-LD, all 5 API headers measured on the live domain):** real wallet-chain check (`useAccount().chainId`)
> + ChainMismatch copy · sourceId passed to `buy()` ONLY when the fresh quote says `sourceValid===true`
> (quote/purchase divergence closed) · 4 source reverts translated (SourceAlreadyLinked/SourceNotEligible/
> SelfReferral/ReferrerNotSeated) · permanent "not an investment · total loss possible" line on the /join
> economy card (survives fail-closed) · FAQ 98/106/114 reconciled to today's read-only reality (re-rewritten
> at the C5 flip) · HTTP security headers: API (CSP none + XFO DENY + nosniff + Referrer-Policy +
> x-powered-by off) and PAGES (CSP meta baked by the prerender — script-src 'self', connect-src
> deliberately scheme-wide so wallet connect can't silently break; frame-ancestors for pages = Replit
> serving layer, see the C5 handoff infra notes) · C5 handoff checklist REPLACED by the complete
> ~20-item MUST-CHANGE table. **GROUP B (founder decision): ALL new guard machinery (audit 7.1–7.5, 3.1)
> → Phase 6 HARDEN & SEAL — per the anti-blocking law (founder file
> `GitHub/_research/AUDIT_TRIAGE_ET_LOI_ANTIBLOCAGE.md` — ⚠️ OUT-OF-REPO on the founder's disk; the HARD
> RULE wants it committed into docs/direction/ at the founder's GO).** **GROUP C → ✅ DECIDED + EXECUTED
> (founder, 2026-07-13, this commit): C1 DISCIPLINE_ENFORCED = LATER (founder decision — DO NOT RE-RAISE;
> returns at its own time, Phase 6 at the latest) · C2 Studio-OS teaser REMOVED from the public home (its
> intent → the future public Roadmap page, slice 2.8; config kept + annotated for that harvest — origin:
> protocol-evolution episodes/modules + the founder's raod_map.jpg 9-node design) · C3 "Raised class" note
> → "Higher commission rate for consistent, high-retention sources." (tier name "Trusted" kept) · C4
> whitepaper §05 rewritten with the founder-approved verbatim (same single seat · standing on the Capital
> axis · never a price/financial advantage).** **THE ANTI-BLOCKING LAW IS NOW IN-REPO CANON:
> `docs/direction/CANON_LOI_ANTIBLOCAGE.md` (TIER-0, indexed) — audits are proposals, never law; guards
> minimal until MVP; only legal/funds/truth-first are non-negotiable.** **Instance pinning → ✅ DONE (founder, 2026-07-13, Replit dashboard): autoscale
> max machines = 1** (4 vCPU / 8 GiB) — in-memory SIWE sessions/nonces are now single-instance-safe.
> Q21's Reserved-VM remains the durable option later; this closes the immediate risk.
>
> **▶ Prior: `docs/handoff/new-session-handoff-2026-07-13-c5-go-live-flip.md`** —
> **C5 = the GO-LIVE flip; the founder's GO is GIVEN (2026-07-13).** C2 approve→buy is BUILT + pushed
> OFF (`c7ad5c7`, proven folded out of the bundle). The flip was deliberately NOT rushed at
> end-of-context (the C1.3 lesson). The handoff carries the COMPLETE checklist: flip the literal +
> a new transactional DisplayLifecycle + the sitewide read-only-claims sweep (8 spots) + SEO title +
> registry STATE rewrites — ONE atomic commit, then Replit publish, then the founder's $5 real test
> (expected seat #13; the 12/11 readback recomputes to 13/12 by itself).
>
> **▶ Prior: `docs/handoff/new-session-handoff-2026-07-12-duplicate-seat-and-historical-gate.md`** —
> a PRODUCTION DUPLICATE SEAT exists on-chain (historical #7 `0x3FF01A0c` = also V3 seat #11, verified
> live), 7 historical wallets still ARMED (incl. the founder), 11 distinct wallets vs `memberCount()`=12.
> The V3 historical artifact is `TheSyndicate/src/lib/v3-historical-members.ts` (root MATCHES live V3);
> `v1-proof.ts` is POISON (V2b, wrong root + address-only leaf). **C1.3 the historical gate → ✅ SEALED
> in prod (`a019152`, Replit-verified 33/33 gates + live-domain checked: quote flow intact, zero console
> errors, gate invisible to normal visitors):** `lib/historicalMembers.ts` (frozen 8-member set + proofs, leaf recomputed + proof
> re-folded to the LIVE `V1_MEMBER_ROOT()` — the local artifact is never trusted), `chainReads.ts`
> `readKnownMember`/`readV1MemberRoot`, `wallet/JoinHistoricalGate.tsx` (own-row, fail-closed BLOCK,
> lazy-mounted on `/join`; verified against the live chain: all 8 proofs fold to the live root, exactly
> #7 knownMember=true → silent, 7 armed → BLOCK; recipient-not-buyer note in code for C4 gifting).
> C2 MUST call `resolveHistoricalGate` again before any buy button enables. v1-proof.ts NEUTRALIZED
> (origin repo `e4697ec`, header-only: V2b-ONLY, forbidden on any V3 path). **The honest 12/11
> readback → ✅ SEALED in prod (`8b486da`, Replit 33/33 gates + envelope emits
> memberCount=12/distinctWallets=11/seatOverlap=1 live; live-domain verified on /whitepaper, home
> hero and /join?source= USDC labels):** spine §5b derives `financial.members.distinctWallets` +
> `seatOverlap` LIVE (8 fixed `memberNumberOf` reads over the server-only freeze set
> `lib/protocol/historicalFreezeWallets.ts`; counts only, no wallet emitted; fail-closed;
> live-chain verified 12/11/1); `MembersProvenance` states "N seats issued · M distinct wallets —
> one wallet holds two seats" + verify link on home hero, `/whitepaper`, `/faq` (renders only when
> overlap > 0 and both figures live). Reality guard 138/138, targets 208/208. **Chronicle candidate
> → ✅ WRITTEN: `docs/chronicle/candidates/2026-07-12-the-duplicate-seat.md`** (protocol-institutional
> register, identity/amount-blind; PROMOTION IS A HUMAN ACT — it waits for the founder and for the
> Phase-5 `/chronicle` surface; it confers nothing by existing). **The 4-item duplicate-seat build
> order is COMPLETE.** **C1.4 economic proof → ✅ SEALED in prod (`f8bdec2`, live-domain verified:
> both prices live, the market-above-entry relation variant renders, all 5 doctrine lines verbatim):** `/join` "Two prices, read
> live" card — entry rate vs DEX market price DERIVED live on every render (the truthful relation in
> BOTH directions — the assumed "market below entry" has already flipped once; nothing hardcoded;
> fail-closed → no comparison, doctrine lines stand) + the never-cross lines ("The market is free.
> It may decide otherwise." · pool is a courtesy · SYN sent, not sold back · "Capital opens one
> axis." · "Not equity. Not yield. Not passive income."). C1 is now COMPLETE (C1.0→C1.4).
> **C2 approve→buy → ✅ BUILT, SHIPS OFF (this commit; BUILD ≠ GO-LIVE):** `wallet/JoinCheckout.tsx`
> behind `config/checkoutGate.ts` `CHECKOUT_ENABLED: boolean = false` (literal; the ternary folds —
> VERIFIED absent from the default bundle). The four C2 laws implemented: two SEPARATE signatures
> (buy only enables on live-confirmed allowance) · resumable (live `allowance` read, never approve
> twice) · fresh re-quote at the buy click → `computeMinSynOutRaw` · seat from the
> `MembershipPurchasedV3` event ONLY. Plus: chain-43114 assert + switch · USDC token read from the
> sale's own `USDC()` immutable (never hardcoded) · C1.3 gate RE-CONSULTED (blocks the flow) ·
> balance pre-check · honest revert translation (Q11 names). **GO-LIVE = a founder act:** flip the
> literal + the C5 lead/badge/boundary-card rewrite in the same commit (the page must never say
> read-only above a live buy button) + Q21 auth. Next = C5 + Q21 at the founder's signal.
> Founder decision: SHOW BOTH (12 seats / 11 wallets / one overlap), never fix silently.
>
> **▶ Prior (still valid): `docs/handoff/new-session-handoff-2026-07-12-checkout-proven-and-chain-truth.md`** —
> the biggest-decision session's resume point. The read-only `/join` checkout is COMPLETE + PROVEN in
> prod (C1.0→C1.2b, the referrer line validated on a REAL active source). Carries: the CHAIN TRUTH
> (9 contracts ever, CommissionRouter never deployed, ONE active BUILDER_SOURCE 5% LIFETIME), the two
> STANDING RULES (a public-RPC log scan is NOT proof of absence; a creation event is a STATE — read
> `sourceConfig()` live), the founder decisions (~~referral not-active-in-MVP~~ **← OVERRIDDEN
> 2026-07-13: active referral IS MVP — see the DECIDED block**, money is the company's,
> buyer pays two recipients in one tx, tiers-by-spend legal, rank never demotes, V4=router model), and
> the CONSOLIDATED SLICE LIST (A MVP / B after / C V4-contracts / D done). Prior C1-groundwork handoff
> stays valid for the C1.1–C1.4 spec detail.
>
> **▶ PRIOR HANDOFF: `docs/handoff/new-session-handoff-2026-07-11-recognition-live-and-member-home.md`** —
> the full recap: the member-recognition arc is **LIVE in prod** (auth on · SIWE signs canonical domain ·
> member identity menu · EVERY member recognized: genesis #1–#8 frozen roster + V3 #9–#12 live · own-receipt
> "Share my proof" · prod DB roster populated+verified 12=8+4, prod-write barrier restored). **ADR-003
> (anti-doxx) is canon.** That doc carries ALL settled founder decisions (naming canon · two shells · no twin
> pages · the authorized S7/S11 wire widening · Member Home spec · harvest source · APPROVE≠PAYMENT).
> **EXACT NEXT STEP (strict order):** (1) green main = 7 stale-guard fixes [this commit] → (2)
> `config/surfaceNaming.ts` + `guard-surface-naming` (BLOCKING) → (3) widen the wire S7/S11 → (4) Member Home →
> action registry → member doors → `/join` real purchase. The prior 2026-07-11-door-and-liveness handoff and
> the 2026-07-03 DB checkpoint remain valid history. Single source for "what's next" = this handoff + `OPEN_QUEUE.md`.

---

## ✅ DECIDED — DO NOT RE-OPEN (settled; do not re-litigate)

- **STANDING RULE (2026-07-12) — a PUBLIC-RPC `eth_getLogs` scan is NOT a proof of absence.** It chunks
  and drops. For any on-chain EXISTENCE question (does a source/contract/event exist?), use a COMPLETE
  scan (Routescan / an indexer), never a chunked public-RPC `getLogs`. This cost the project twice today.
- **STANDING RULE (2026-07-12) — a creation EVENT is a STATE; READ the current view live.** Terms get
  updated after creation (a source's scope read WINDOWED from its `SourceCreated` event; the live
  `sourceConfig()` said LIFETIME). Never decode an old event and call it today's truth. And: a comment
  is NEVER the authority for a status on a money surface — read `isActive()`/`sourceConfig()` live.
- **🔴 FOUNDER OVERRIDE, PERMANENT (2026-07-13) — "Referral not active in the MVP" is DEAD.**
  **Active referral IS part of the MVP** and lights up as soon as possible: C5 flip → the $5 test
  THROUGH the referral link (two proofs in one tx: checkout + the on-chain introduction payment) →
  then the PUBLIC referral-layer activation as its own founder-gated slice (programLifecycle switch +
  copy + member cards + the guard-safe-source adaptation proposed IN that slice, per the anti-blocking
  law). **No agent re-raises the old rule.** Everything else in the 2026-07-12 referral decisions
  STANDS: the buyer pays two recipients in ONE tx; the Syndicate pays nobody (no KYC/1099/float; copy
  says "the buyer pays you", never "we pay you"); tiers-by-spend legal; `HOME_RANK_LADDER` = the
  CAPITAL AXIS; the red line = never a better SYN price; rank never demotes; V4 target =
  CommissionRouterV1's model. *(Superseded that day: the "final economics = V4, ship dark" clause —
  the 2026-07-12 handoff lines saying "does NOT ship active in the MVP" are HISTORY, not law.)*
- **CANON (founder, 2026-07-12) — two authoritative specs are now IN-REPO (were on the founder's
  desktop): `docs/direction/CONSTITUTION_AUTORITE.md`** (the 4-level authority hierarchy — N0 immutable
  bytecode / N1 founder-on-chain / N2 server / N3 presentation; a lower level never contradicts a higher;
  the 3 admin control forms READ / PROPOSE(build-tx-founder-signs) / WRITE must look different) **and
  `docs/direction/SPEC_REFERRAL_SYSTEM.md`** (the full referral/source system, all decided). Both TIER-0
  in the canon index.
- **REFERRAL STATE (verified on-chain 2026-07-12, matches SPEC §①) + BUILD ORDER.** Sale V3 `0x2A6c…`
  live (era 1, 12 members); SourceRegistry `0x780013…` deployed (immutable in the Sale). **ONE source is
  ACTIVE** (`0x8338e9ff…1cf620` · BUILDER_SOURCE · 5% · LIFETIME · no caps · payoutWallet `0x2445…9C721`,
  re-activated block 89642946). ⚠️ **My earlier "ZERO sources" here was WRONG** — a lossy public-RPC
  `eth_getLogs` scan (NOT a proof of absence); the complete Routescan log scan found it. C1.2b is testable
  NOW: `/join?source=0x8338e9ff…1cf620` → live quote returns `acquisitionCost=$50`/$1000, the referrer line
  shows. CommissionRouterV1 is NOT deployed (confirmed on-chain — a V4 design, not an asset). V3 pays
  `payoutWallet` **directly** (`_payAcquisition`); it does NOT use a CommissionRouter. Order (SPEC §⑪):
  **R1** referral-program conditions doc (hashed → `metadataHash`; BLOCKING — `createSource(LIFETIME)`
  reverts `MissingMetadata` without it) → **R2** first source (founder signs `createSource(…PAUSED)`, test
  fail-closed, then `setSourceStatus(ACTIVE)`) → **R3** `&via=` channel (off-chain, no deps) → **R4**
  `/source` surface (`NOT_ACTIVE`, never "earn now") → **R5** event indexer → **R6** Connector staircase →
  **R7** the emitter contract (self-service). C1.2b already implements the SPEC §⑧ two-bug-corrected source
  line (rate=quote, address=`payoutWallet`, consistency fail-closed).

- **TIER-0 LAW (founder, 2026-07-12) — `docs/direction/CANON_VISIBILITY_LAW.md`.** On a chain, "hiding"
  does not exist — only making legible vs tedious; everything is already public. We hide nothing; we refuse
  to FABRICATE what the chain lacks. FORBIDDEN: a directory / search / reverse index (seat→wallet) / forced
  wallet↔person link / exposing a non-consenting member. ALLOWED (the chain already publishes it): INFRA
  addresses (Vault/Liquidity/Operations/Registry/Sale/Token — PIPES, nobody's wallet), any event-emitted
  address, YOUR own tx, an address the buyer must see BEFORE signing, opt-in self-publish. TWO disciplines:
  the SERVER emits no MEMBER address (no directory exists — member-standing own-row, source = 2 booleans,
  UNCHANGED); the CLIENT reads the chain like an explorer. Corollary: what PROVES is public, what GRANTS
  ACCESS is a secret (a contract address proves; an RPC token grants access). Loaded at every boot (TIER-0).
  FOLLOW-UP — ✅ DONE (2026-07-17): `assertNoAddressLeak` → `assertAddressSafeAggregate` (the rpcTransport.ts
  export + the self-contained twin in avalanche-live-read-check.ts). The misnomer read as blanket address
  secrecy; the new name states the real contract (the aggregate serialized here is asserted address-safe;
  infra addresses still ride verifyLinks, client still out of scope — doctrine unchanged, only the name).
  Renamed across all 28 occurrences / 14 api-server code files, incl. backbone.guard's code-as-string check
  (`assertAddressSafeAggregate(JSON.stringify(model))`); api typecheck + guards green.
- **TIER-0 LAW (founder, 2026-07-12) — `docs/direction/CANON_INVARIANT_VS_STATE.md`.** The
  anti-drift law that ends the 6-rebuild loop: every repo statement is an **INVARIANT** (a rule
  about *how* — only the founder authors it; agents cite/obey, never invent) or a **STATE** (a
  photograph of today — any slice may make it obsolete; the slice that changes reality updates
  the STATE line in the SAME commit; a STATE is NEVER a permission gate or a reason not to build).
  Also fixes the `enabled` (founder decision, literal OK) vs `posture` (chain-derived, literal
  NEVER) collapse. Loaded at every boot (TIER-0 in `00_CANON_INDEX.md`).
- **CORRECTED (founder SPEC_REFERRAL_SYSTEM §⑨, 2026-07-12) — `HOME_RANK_LADDER` is the CAPITAL AXIS,
  NOT poison.** My earlier "poisoned canon" flag OVER-CALLED it. Per the spec: paliers-by-spend are
  universal + legal (Sephora/Ulta/Marriott/Uber/AA/Starbucks); `HOME_RANK_LADDER` unlocks NOTHING today
  (`{Citizen, $5, 500 SYN}` = just 100 SYN/$ = the era-1 rate everyone gets — a label, no bonus). It is
  the **CAPITAL recognition axis** (one of eleven axes; capital is one, never the throne). What ACTUALLY
  needs fixing (§⑨): (1) rename the colliding names — `Operator`/`Builder`/`Steward`/`Custodian`/
  `Cornerstone`/`Scout` (they are roles / axes / on-chain classes); (2) state clearly the capital is an
  AXIS, **never a MEMBER rank** — the SEAT IS BINARY ($5 and $10,000 buy the SAME seat); (3) the RED LINE
  a tier must NEVER cross — a better PRICE on SYN (more tokens/$) = a financial multiplier on a resellable
  asset = FORBIDDEN. The `/join` checkout cards stay AMOUNTS-ONLY (C1.1 ✅). NOTE: the stale
  `JOURNEY_STEPS {rank, status:"LIVE"}` the spec flags lives ONLY in the dormant vendored
  `syndicate-config.ts:687` (tsconfig-excluded, NOT served) — no live-app fix needed; label it honestly
  if that canon is ever reused. `RANKS_V2` named tiers are still not used on the checkout (numbers only).

- **DECIDED (founder, 2026-07-12) — narrative "Chapter" label pulled FORWARD from Phase 5
  (recognition only).** A small pure-function display: `artifacts/studio/src/lib/chapters.ts`
  (`chapterForSeat`, deterministic by seat number — I Genesis Signal #1–333 · II First Thousand
  #334–1000 · III The Expansion #1001–3333 · IV First Ten Thousand #3334–10000 · V Open Era
  #10001+) renders "Chapter I · Genesis Signal" in the header member menu. Own-row (member's own
  seat only, no directory, no address, no network call); **recognition only** — never a rank,
  tier, or financial advantage (SEASONS_ENGINE guardrail: earlier ≠ "better"). This is ONLY the
  label; the full chapters/eras/seasons auto-advance engine remains Phase 5 (harvest from origin).
  NOTE: header's existing "Genesis" pill badge = the ERA-provenance label (#1–8 freeze-root), a
  DIFFERENT thing from chapter "I Genesis Signal" (#1–333) — do not conflate.

- **DECIDED (founder, 2026-07-11) — the runtime served-payload discipline NET is LIFTED
  (reversible).** `assertProtocolRealityDiscipline` no longer throws on an address-leak /
  financial-framing payload; gated behind `DISCIPLINE_ENFORCED` (flip to re-arm). Recorded as
  an explicit founder amendment in `docs/adr/ADR-003-…-anti-doxx.md`. ADR-003's CORE stays in
  force (no KYC, no directory, own-row/aggregate, `memberNumber→wallet` server-only — never
  built into a served payload), and the build-time envelope leak scans still run — so nothing
  is doxxed today; only the automated runtime catch was lifted. Financial-framing net expected
  back at the Phase-5 crypto-lawyer pass. This ALSO resolved the member-standing **500** (the
  net was false-positiving a member's own 64-hex receipt tx as a 40-hex address).

- **DECIDED — the whole PROTOCOL is LIVING (`docs/direction/WHITEPAPER_LIVING_DOCTRINE.md`).** Not a
  whitepaper feature: EVERY surface reads live from the chain and updates itself ("read live · as of {ts} ·
  nothing hardcoded · don't trust, verify · we ask nothing · observe → join"). The whitepaper is the flagship
  written expression. **Live projections CAN'T diverge:** the same figure on many pages is FINE — they read
  ONE canonical source (`GET /api/protocol/reality` + the live hooks), so `/whitepaper` and `/tokenomics`
  show identical live numbers by construction, never a duplicated hardcode. (Proven in prod: the signature
  advances between reloads; both pages read the same distribution figures.)
- **DECIDED — the shared LIVING CHASSIS (`src/components/living/`) is REUSABLE; next pages COMPOSE from it,
  never rebuild:** `LivingSignature` (as-of live signature, from the reality envelope meta) · `TransparencyPosture`
  (ask-nothing / everything-here / don't-trust-verify / observe→join) · `SectionIndex` (sticky anchor TOC) ·
  `AllocationDonut` (live SVG donut) · `ReconciliationTable` (design-vs-live table) · `RoutingBar` (live
  70/20/10 split, sized by live amounts). Built on the atoms (`Prose · Amount · StatusPill · VerifyOnChain ·
  StatCard · DataTable`) — reuse, never parallel.
- **DECIDED — content-page harvest map = `docs/direction/CONTENT_SURFACE_HARVEST_MAP.md`.** All harvest
  sources are ON DISK under `C:\Users\kemal\OneDrive\Documents\GitHub\<repo>` (origin `TheSyndicate`,
  `Supa-Exchange`). Harvest = **adapt** structure/chrome, **never copy content raw**; repo + doctrine + legal win.
- **DECIDED — FAQ (2.3) build:** CHROME/structure harvested from **Supa** (`Supa-Exchange` FloatingAISupport /
  FAQ: search + category cards + accordion + FAQ JSON-LD + CTA) + an entity-chain hero-answer card; the
  CONTENT comes from the **origin** `TheSyndicate/src/routes/faq.tsx` + `components/syndicate/FaqRebuilt.tsx`
  (39 doctrine-perfect Q&A) — NEVER Supa/entity content (yield/APY/DAO/referral-bonus are BANNED). Composes
  from the living chassis.
- **DECIDED — Support + floating robot:** harvest Supa's floating bottom-right robot
  (`Supa-Exchange/client/src/components/FloatingAISupport.tsx`). **Tone exception granted** (cute/warm OK — it
  is a HELP assistant, NOT a truth surface). It is **NOT** the protocol's PENDING AI Layer; it **NEVER
  fabricates a figure** (always points to on-chain proof); recognition-only if ever gamified (see
  `docs/direction/GAMIFICATION_LEGAL_DOCTRINE.md`).
- **DECIDED — build order:** whitepaper ✅ → tokenomics ✅ → **FAQ (2.3) → Support (floating robot) → docs
  (2.4) → knowledge (2.5)** → then Risk · Glossary · Roadmap · Protocol-facts · Brand-facts · Join UI · footer.

- **Phase 1 — CLOSED.** 8 atoms (Amount · StatusPill · Button+Tag · StatCard · Table · Field · Icon).
  Color sprawl **137 → 0**, `no-raw-color` guard **BLOCKING** in the `guards` gate. Fluid `.type-*`
  scale adopted site-wide. Component states + a11y done. (1 documented raw-color exception: QrCodeBlock canvas.)
- **Phase 2.0 — Rendering fix → ✅ CODE-COMPLETE · verified green on Replit/Linux · awaiting live-domain
  verification after Publish.** Build-time prerender/SSG of the shell:
  `artifacts/studio/scripts/prerender-routes.ts` writes per-route `dist/public/<route>/index.html`
  (real title/description/OG/canonical + Organization JSON-LD in the server HTML) + a real noindex
  `404.html`; the soft-404 SPA rewrite was removed from `.replit-artifact/artifact.toml`. One shared
  JSON-LD source (`src/lib/seo-jsonld.ts`) feeds BOTH `SeoHeadManager` and the prerender. PENDING
  routes (`/recognition`, `/archive`) emitted as **noindex** shells (avoids reload-404, stays out of
  the index). NOT SSR (`wagmi ssr:false` untouched); live chain figures stay client-hydrated.
  **Live-domain checks (2026-07-10, post-Publish):** home ✅ (200 + Organization JSON-LD + apex
  canonical in raw HTML), unknown path ✅ (real **HTTP 404** + noindex `404.html` shell — soft-404 gone).
  `/status` returned **301 → `/status/`** — ROOT CAUSE (confirmed via Replit + Replit docs): emitting
  `<route>/index.html` **directories** makes the static host auto-redirect to the trailing slash, and
  that directory redirect fires BEFORE any rewrite, so "served URL == canonical" can't win.
  **FIX (in `main`, commit after `5502a57`):** the prerender now emits **flat `<route>.html`** files
  (no directory → no auto-redirect → the no-slash URL is served directly at 200 = canonical), so Replit
  needs **no** deploy-layer flatten step. Awaiting one more Publish to confirm `/status` = HTTP 200
  (no `location:` header).
- ~~**NEXT SLICE = Phase 2.1 — Prose atom + Whitepaper**~~ — superseded: Prose atom, Whitepaper, and
  Tokenomics are all DONE and relaunched on the living chassis (see the top living bullets). **2.3 FAQ +
  the deterministic Support Guide, and 2.4 Docs are SEALED in prod (Docs = `140d33e`, Replit-verified live).
  NEXT = 2.5 Knowledge base.**
- **DEPLOY DEBT — ✅ CLEARED.** No outstanding undeployed *product* commits — **`main` == production**
  (latest deploy: ⓪ member-liveness, `bc6102a`; docs-only commits after it don't require a deploy).
- **DECIDED — carte-blanche is CANON; our per-slice cadence is a FOUNDER CHOICE (2026-07-06).**
  `docs/strategy/GRAND_RECONCILIATION_AND_CARTE_BLANCHE_UNBLOCK_2026-07-06.md` (Compass §2/§7) grants
  **standing implementation authorization for Phases 1–10** — it LIFTS report-first, per-slice approval,
  "no implementation authorized", and the read-only-foundation gate; a phase defers only if its **input**
  is missing. It KEEPS every truth/safety invariant (no fake-live, no PII, no yield framing, single canon,
  read-only spine never gains write endpoints, **BUILD ≠ GO-LIVE**: real-money/auth-flip stays a founder
  act needing founder inputs). **Implication:** the tight show-diff→approve→push cadence we run is the
  founder's *choice*, tighter than canon requires — not a canon requirement; canon permits building
  Phases 1–10 without per-slice approval. (Repoints applied: Compass §5/§8; `/join` note = stale
  authorization gate, OPEN_QUEUE Q20.)
- **DECIDED — keep the newer OG image (`opengraph.jpg`), do NOT revert.** Replit regenerated the
  social-preview screenshot from the current live app (fresher UI + chain figures: inflow 235.50,
  **burned 21,273 SYN**, verify-on-chain links). Founder confirmed: additional burns happened since, so
  **21,273 is the true current figure** — the Compass's "16,500" is a **stale doc number, not canon**
  (chain > docs). **Implication for slice 2.2 (Tokenomics):** the burn MUST render as a **live chain
  read**, never a hardcoded 16,500; when 2.2 lands, reconcile/soften the Compass's "16,500" mention.
- **DEFERRED — www→apex 301 (NOT a 2.0 blocker; apex is canonical and serves today).** Do at
  **domain transfer (~Sept 2026)**: the domain was bought via **Lovable** and is registrar-locked
  ~60 days, and Lovable can only do a 302 (not a clean 301). After the lock, transfer to a proper
  registrar and add a **single-hop 301 `www.thesyndicate.money` → `https://thesyndicate.money`**, TLS
  covering both. `www` has no DNS entry until then. **HSTS/preload stays Phase 6.**
- **2.0 approach was DECIDED (ADR-002): build-time prerender / SSG of the SHELL** (kept for the record).
  Per-route static HTML with real `title`/`description`/OG **+ JSON-LD baked into the server HTML** +
  a real **404 status**. **NOT runtime SSR** — it breaks with `wagmi ssr:false`. Inject head/JSON-LD,
  do **not** prerender the React DOM.
- **2.0 scope — DECIDED: Head + JSON-LD + real 404 ONLY.** SEO guards (banned-word, sitemap-leak,
  index-only-real-content) and PENDING-page `noindex` are **end-of-Phase-2**, NOT part of 2.0.
- **Live chain figures stay client-hydrated, never hardcoded.** Static copy is prerendered; every number
  reads live from chain/config, labeled VERIFIED / PENDING / FUTURE / PAUSED / FOUNDER-GATED.
- **Replit coordination point:** serving per-route prerendered HTML (one file per path, not a single SPA
  fallback) needs a **Replit serving change** — founder/Replit handoff at end of the 2.0 slice.
- **Repo wins over spec.** Read the repo, adapt, flag any disagreement.
- **"package" is BANNED publicly** → use **"entry amount" / "entry tier"**; extend the forbidden-copy guard
  (`scripts/guard-forbidden-copy.ts`) to also ban: invest, raised, donation, contribution, package,
  governance weight, equity, APY, dividend, 100x, moon, pump.
- **Color meaning (canon):** **Gold = identity / seat / membership · Cyan = live / verification / activity.**
- **Link, don't duplicate** existing routes: `/status` `/learn` `/source` `/join` `/member` `/recognition`
  `/archive` `/proof` (contract-memory, os-map).

## Where we are (factual)

- **PHASE 1 → ✅ CLOSED.**
- **PHASE 2 — Content + rendering → 🔨 IN PROGRESS.**
  - **2.0 Rendering fix → ✅ SEALED in prod** — per-route flat `<route>.html` prerender (real
    title/description/OG/canonical + Organization JSON-LD in the server HTML) + a real **HTTP 404**; `/status`
    (and all routes) serve 200 with **no redirect** = canonical. www→apex 301 deferred to the domain transfer.
  - **Whitepaper → ✅ SEALED in prod as the flagship LIVING document** on the shared `living/` chassis —
    a short scannable manifesto (hero + `LivingSignature` + `TransparencyPosture` + sticky `SectionIndex`);
    **self-contained**: supply · burn · distribution (donut + design-vs-live `ReconciliationTable`) · 70/20/10
    routing are ALL live in-page, zero typed numbers. Built on the Prose atom + `useHeroReality`/`useTokenomics`.
  - **Tokenomics → ✅ SEALED in prod** on the same chassis (donut + `ReconciliationTable` + LP card +
    Founder vesting card + live `RoutingBar`). `/whitepaper` and `/tokenomics` read ONE
    `GET /api/protocol/reality` source — figures **identical & live** (verified in prod; the signature
    advances between reloads).
  - **Backend spine serves live** (fail-closed, no address emitted; guards pin invariants — targets 203/203,
    reality 131/131): chain identity · contract code presence · token metadata · sale figures · financial
    (inflow aggregate, vault/ops/LP/burn balances, memberCount) · **SYN `totalSupply`** · **7 allocation
    `balanceOf`**. Client hooks: `useHeroReality`, `useTokenomics` (+ market price from live LP reserves,
    entry rate from the live join-quote). Standing rule: **no PENDING for a readable figure.**
  - **FAQ (2.3) → ✅ SEALED in prod (`1c6a07d`, Replit-verified live).** `/faq` composed from the living chassis
    (`PublicPage` + `LivingSignature` + `TransparencyPosture` + `SectionIndex`) + one new interactive
    primitive `FaqAccordion` (search + category filter + accordion, tokens-only). Content = the origin's
    39 Q&A across 8 categories, **reframed doctrine-perfect: zero numerals, zero addresses, no banned
    words** ("package" → "featured entry amount / entry tier") — every live figure is a hero-card chain
    read (`useHeroReality`/`useTokenomics`, fail-closed) or a one-click link to `/tokenomics` `/status`
    `/join`. **FAQPage JSON-LD** baked into the server HTML from one shared builder (`seo-faq-jsonld.ts`,
    41 Q) feeding both prerender + a runtime injector — no drift, on-screen text == structured data.
    Wired end-to-end (registry INDEX+sitemap · surfaceClassification · modules "faq" Learn-footer · nav ·
    App route). Green locally: typecheck 0 · all 9 guards + no-raw-color · seo:check 303.
  - **Support · the DETERMINISTIC floating Guide → ✅ SEALED in prod (`56bc165`, Replit-verified live).**
    `SyndicateGuide` mounted globally in `PublicLayout` (public surfaces only) — a router + FAQ-corpus
    finder that "consults, never invents": surfaces the vetted number-free FAQ answers + routes to the
    proof surfaces, states no figure itself. Line-art mascot on tokens (gold frame / cyan face). Prerender-
    safe (localStorage/window in typeof-guarded effects); no fake "1" badge; no decorative live dot; header
    says "Guide", not "AI". NO LLM / NO wallet-awareness / NO backend (those = Phase 3). `guard-access-state`
    storage allowlist extended (greeting-seen boolean only). Green: typecheck 0 · 9 guards + no-raw-color.
  - **2.4 Docs → ✅ SEALED in prod (`140d33e`, Replit-verified live).** `/docs` composed from the living
    chassis — journey spine + grouped cards, each card's status **derived from the SEO route registry**
    (Ready/Pending, never hardcoded; `/recognition` `/archive` read honest Pending), real routes only,
    number-free. Header "Docs" repointed to `/docs`; `/learning` stays "Learn" (footer + linked from `/docs`).
  - **⓪ Liveness fix (member figure) → ✅ SEALED in prod (`bc6102a`, Replit-verified live).** The public
    member figure is now the **LIVE continuous `memberCount()`** (12), NOT the stale served snapshot (which
    said 10). Spine reads `GENESIS_OFFSET`+`nextSeatNumber`, reconciles server-side fail-closed (anchor
    `GENESIS_OFFSET==8` AND `nextSeatNumber==memberCount+1`), emits `financial.members.memberCount` +
    `financial.members.genesisOffset` (nextSeatNumber invariant-only, never emitted). `MembersProvenance`
    renders the dual authority (**8 freeze/root + 4 live V3-emitted, never collapsed**) + the STALE
    divergence one-liner ("snapshot 10 as of 2026-07-03 · live runs ahead"). New BLOCKING `guard-freshness`;
    `LivingSignature` dropped from `/docs`. **Standing rules added:** "no snapshot for a live-readable
    figure"; "semantics are reconciled, never inferred from ABI names" (worked example: V3-only would have
    shipped 8+12=20 — see `ORIGIN_RECLAMATION_LEDGER.md` §11). **12 is 12** — real on-chain purchases, no
    test-seat category. The holder-index snapshot is now verification-only (and 2 stale — OPEN_QUEUE Q18).
  - **NEXT = 2.5 Knowledge base → 2.6 Risk** — each COMPOSES from the `living/` chassis + harvests per
    `CONTENT_SURFACE_HARVEST_MAP.md`. Canonical order = the **frozen "Remaining Phase-2 slices, IN ORDER"**
    list below; new session work is captured separately under **"Phase 3–6 / later work"**.
- **PHASES 3–6 → ⬜ pending** (auth single-instance/Reserved-VM blocker open; admin/RBAC unseeded; event
  backbone / activity / gamification unbuilt; perf/a11y/responsive/security audits not run; fonts still Google-CDN).

## The 2.0 slice — concrete plan (derived; files not dictated by any spec)

1. Post-build script (e.g. `artifacts/studio/scripts/prerender-routes.ts`): for each public route in the SEO
   registry, write `dist/public/<route>/index.html` = base `index.html` + injected head (title/description/OG/canonical)
   + static JSON-LD. Reuse the registry — no new source of truth.
2. Real `404.html` with a true not-found status (replace the soft-404 SPA fallback).
3. Wire into the build pipeline (`build` → `postbuild`, or a `seo:prerender` script) without breaking
   `seo:generate` / `seo:check`.
4. Client unchanged: `wagmi ssr:false`, `SeoHeadManager`, live-figure hydration untouched.
5. End of slice: Replit handoff to serve prerendered HTML per path.

## Remaining Phase-2 slices, IN ORDER (from `docs/direction/MASTER_BUILD_SPEC.md` — do not re-plan)

*FROZEN LIST — items and order are canonical; do not drop, reword, or reorder a single item. Only status
markers update. New session work lives BELOW in "Phase 3–6 / later", never woven into this list.*

1. ~~**2.0 Rendering fix** — prerender/SSG shell, server HTML meta + JSON-LD, real 404.~~ ✅ **DONE.**
2. ~~**2.1 Prose atom + Whitepaper**~~ ✅ **DONE** — Prose atom (`components/prose/Prose.tsx`) + `/whitepaper`
   (15 sections, every figure a live chain read via `useHeroReality`/`Amount`/`VerifyOnChain` or a PENDING
   label — zero hardcoded numbers). Guard extended (safe set; `contribution`/`package`/`moon`/`raised`
   flagged as repo-wins exclusions). Supply, the 7 distribution shares, and both prices render PENDING —
   they need a live supply/price read (wire in 2.2). *(NEXT = 2.2.)*
3. ~~**2.2 Tokenomics (+ SYN token)**~~ ✅ **DONE** — `/tokenomics` on the Prose atom + the backend live
   reads it needed. Spine extended (SYN `totalSupply` + 7 allocation-wallet `balanceOf`, fail-closed, no
   address emitted; both protocol guards extended). `useTokenomics` reads them + market price (live LP
   reserves) + entry rate (live join-quote). **Whitepaper's 10 PENDINGs flipped to LIVE** (supply, 7
   allocation shares, both prices). Stale "16,500" burn retired — burn is a live read everywhere. Standing
   rule added: no PENDING for a readable figure. *(NEXT = 2.3 FAQ.)*
4. ~~**2.3 FAQ**~~ ✅ **DONE** (harvest: Supa chrome + origin 39 Q&A — see harvest map) · 5. ~~**Support + floating
   robot**~~ ✅ **DONE** (harvest: Supa `FloatingAISupport`; tone exception; NOT the AI Layer; never fabricates a figure)
6. ~~**2.4 Docs**~~ ✅ **DONE** (`140d33e`, live) · 7. 🔵 **2.5 Knowledge base** *(NEXT)* · 8. **2.6 Risk** · 9. **2.7 Glossary**
10. **2.8 Roadmap** (registry-driven) · 11. **2.9 Protocol-facts** · 12. **2.10 Brand-facts**
12. **2.11 Join / entry-tiers UI** — featured tiers + custom-amount compose + live quote preview
    (gross → source payment → net → 70/20/10) + 5-step flow; read-only; figures from chain.
13. **Footer IA + sitemap + per-page SEO guards** — footer per `CONTENT_SUITE_SPEC`; add banned-word,
    no-fake-live, sitemap-leak, index-only-real-content guards. **⚙ RECONCILED HONESTLY (M1-c,
    2026-07-14): the GUARDS half is ✅ DONE long since** (guard-forbidden-copy · guard-no-fake-live ·
    seo:check 395 incl. sitemap-leak + index-only-real-content) **and the footer was HARMONIZED to
    live-production truth in M1-c** (registry-driven, real routes, the "Read-only foundation shell."
    claim dead). **REMAINS OPEN:** the final footer IA per `CONTENT_SUITE_SPEC` §IA (its target
    grouping needs 2.5 Knowledge base · 2.7 Glossary · 2.8 Roadmap — pages that don't exist yet)
    + sitemap `lastmod`. The item closes when those land.

## Phase 3–6 / later work — captured this session (NOT scheduled into the frozen Phase-2 list above)

*A holding area for work decided/researched this session. It does NOT reorder the frozen Phase-2 list; each
item slots into Phases 3–6 at build time, after its prerequisites. Format: name · status · source doc.
Status: ⬜ PENDING · 🔒 DEFERRED (lawyer-gated). All money-touching items governed by
`SETTLED_RULES_DO_NOT_RELITIGATE.md` + a crypto-lawyer pass at Phase 5.*

**Phase 3 — the Guide's brain (deterministic Guide already SEALED; these extend it)**
- Guide **security spine** — isolated endpoint · token rate-limit · budget cap + circuit-breaker →
  deterministic · output forbidden-copy filter · monitoring · ⬜ PENDING · built BEFORE any LLM ·
  src `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md`.
- Guide **LLM escalation** — Groq + DeepSeek fallback · RAG-grounded on the content suite · degrades to
  deterministic · ⬜ PENDING · needs the security spine + a fuller corpus · src `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md`.
- Guide **user-level awareness** — visitor/holder/member from verified on-chain state (own wallet only) ·
  ⬜ PENDING · needs auth · src `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md` + `LIVING_ORGANISM_MASTER_PLAN.md` §6.

**Phase 5 — living-organism public surfaces (backend read-models FIRST, then the surface)**
- Event backbone — indexer → canonical `EVENT→SIGNAL→MEMORY→CHRONICLE candidate` pipeline (the read-models)
  · ⬜ PENDING · src `ACTIVITY_HEARTBEAT_READ_MODEL.md` + `LIVING_ORGANISM_MASTER_PLAN.md` §7.
- Economy macro `/economy` — Protocol Economy Observatory (evidence-labeled, not-a-yield-dashboard) ·
  ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §3.
- Activity `/activity` — public aggregate, recency-truthful, address-safe pulse over the heartbeat
  read-model · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §7.
- My Economy + cockpit narrative arc (Identity→Place→Ownership→Momentum→Action→Memory→Proof) · ⬜ PENDING ·
  src `LIVING_ORGANISM_MASTER_PLAN.md` §3.
- Chronicle `/chronicle` — memory pipeline + public solemn record (promotion = human act; two registers;
  oldest-first) · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §7.
- Register — the census / seat roster · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §3.

**Phase 5 — recognition engine = SEASONS · ERA · continuity (recognition-only; capture-now, build-at-phase)**
- Recognition engine — XP + quests + badges + season leaderboard + rank snapshot (harvest Supa's mechanism,
  reskin to our tokens/vocab; recognition only, off-chain/non-transferable) · ⬜ PENDING ·
  src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` (governed by `SETTLED_RULES` + `GAMIFICATION_LEGAL_DOCTRINE`).
- **Season = Era** binding — season boundaries are deterministic on-chain member milestones (era `endSeat`),
  built WITH the new sale/era contract · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §3.
- **Three clocks / continuity** — Eras (economic, finite) · Chapters (mythology, finite) · Seasons
  (engagement, **infinite** recognition heartbeat) · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §3.5.
- **Learn & Earn = earn XP** — quiz + recognition loop on top of `/learning` (our content, never Supa's;
  reward = recognition, never cash) · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §7.5 (SETTLED).
- Recognition catalog — badge · feature/access · cosmetic · collectible · physical (drop token/boost/
  cash-discount) · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §7.
- Season/recognition **admin lifecycle** in the RBAC admin shell (state machine · next-step engine · audit ·
  archive) · ⬜ PENDING · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §6.
- **Funding = company money, discretionary, effort-based, USDC-not-SYN, never touches 70/20/10** (the cash
  rail; reuse the Merkle infra) · 🔒 DEFERRED (lawyer-gated) · src `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §8 + `SETTLED_RULES`.

**Phase 5–6 — identity & income economy**
- **`/staff` — PUBLIC OPERATOR REGISTRY (anti-impersonation)** · ⬜ PENDING (record, do not build; own slice, CAN
  ship EARLY) · founder 2026-07-12. The #1 crypto fraud is "I'm Syndicate support" draining a wallet; the answer
  is MECHANICAL — every operator signs in with their EVM address, and that address is PUBLIC on the site with its
  STATUS (`Seat #3 · Member support · 0x9F4A…22B1 · ● ACTIVE` / `Content operator · 0x5D18…88A0 · ○ SUSPENDED`).
  An impostor can COPY an address but CANNOT SIGN with it ("ask them to sign this message with that address —
  if they can't, it isn't us"). HALF-BUILT already: `referralProgram.ts` has the 8 roles; `operator-context`
  returns `{isOperator, role}` from the ACTIVE registry row — the registry EXISTS, publishing it is a READ.
  A SUSPENDED operator MUST show SUSPENDED. Under the Visibility Law this is INFRASTRUCTURE identity — publishing
  it is REQUIRED, not merely permitted.
- **Public leaderboard — HONOUR ROLL, not a directory** · ⬜ PENDING (record; lands WITH the Standing slice, not
  before) · founder 2026-07-12. Public by default (it IS the engagement engine — Zealy/GitHub/Strava). The exact
  application of the Visibility Law: ❌ a directory (wallet→who, fabricated) — never; ✅ a RANKING (top-N
  Connectors, the chain already publishes it). Shows a SEAT + a STANDING ("Seat #12 · Foundational Connector · 47
  introductions"), an honour roll, NEVER a money ranking (retention/duration/quality). Alias stays opt-in: by
  default you are a SEAT NUMBER — a member who wants no name stays a number, BUT HIS RANK EXISTS (like GitHub).
- Internal explorer (harvest `MiniExplorer`) + extend `known-addresses` labeling (read-only) · ⬜ PENDING ·
  src `LIVING_ORGANISM_MASTER_PLAN.md` §9.
- Shareable cards / OG (consent-gated identity; viral) · ⬜ PENDING (non-financial) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- Verifiable reputation (multi-axis; never wealth-ranking) · ⬜ PENDING (non-financial) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- Address labeling **service** (verified, pay-to-label, never impersonate) · 🔒 DEFERRED (lawyer-gated) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- Aliases (ENS-style, sold; tied to seat; non-tradeable) · 🔒 DEFERRED (lawyer-gated) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- Guide premium tier (bundle into a recognition tier; free Guide stays fully truthful) · 🔒 DEFERRED (lawyer-gated) · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.
- White-label truth-first Guide / verification kit (post-MVP, separate business) · 🔒 DEFERRED · src `LIVING_ORGANISM_MASTER_PLAN.md` §5.

**Transparency signature moves (cheap, high-differentiation; interleave)**
- E1 "Prove it" — a verify link on every Guide answer + every figure (standing rule, folded into each slice) · ⬜ ongoing · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.
- E2 Living FAQ — grows from real anonymized Guide questions · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.
- E3 "Verify it yourself" kit — published read scripts · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.
- E4 Honesty register — public log of corrections · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.
- E5 "Never will" charter · ⬜ PENDING · src `LIVING_ORGANISM_MASTER_PLAN.md` §11-E.

**Cross-cutting (design principles, not slices):** engagement psychology (`LIVING_ORGANISM_MASTER_PLAN.md`
§4 — honest levers only, **recency-truth**) applies to every surface. **Governance is banned** — reframe any
DAO/member-memory track as **permanently non-promoting recognition**. The remaining Phase 3–6 infra from
`MASTER_BUILD_SPEC.md` (single-instance/Reserved-VM, operator DB + founder seed, auth + admin ON/OFF toggle,
live checkout, referral read, RBAC + admin shell, perf/a11y/responsive/security audits) stays as specified
there — this block ADDS to it, never replaces it.

**Conflicts with existing canon — NONE found this session.** `SEASONS_ENGINE` reconciles the old `/learning`
"no reward" comment as "no **cash** reward" (consistent with earning **XP** = recognition), and the "new
sale/era contract" is a future lawyer+audit-gated design, not an override of a locked decision. No
genuine RED-LINE mechanism to flag: the seasons doc itself drops the banned mechanisms (XP→USDC,
SYN-as-reward, boost/multiplier, cash-convertible discount) and lawyer-gates the cash rail. Per
`SETTLED_RULES`, earn/referral/season/pot/Learn&Earn=XP are settled and NOT re-flagged.

## Slice protocol (every step)

Read the real repo → 4-line gate → **wait for founder GO** → build + guards (Replit is the build gate) →
show diff → founder approves → commit + push `main` → tick `DESIGN_ROADMAP` → deploy verdict (🚀 / ✅).


> **▶ REFERRAL-FIRST, FOR REAL — ✅ BOTH PARTS BUILT (2026-07-13, founder GO ×2, awaiting push GO):**
> ① THE DEEP SWEEP shipped (`6ac9977`): every rendered sentence referral-first; the builder success
> message's stale "not active yet" killed. ② HUMAN URL: **/referral is the canonical program URL**
> (App route + INDEX/sitemap entry + module/nav/CTA/docs repointed); /source-attribution stays a
> serving ALIAS (200, `REDIRECT` status → noindex,follow; canonical consolidation — no 301 exists at
> the static layer until the domain transfer); artifact.toml regenerated 17 routes/34 rules; sitemap
> regenerated (15 INDEX). ③ MONEY-FLOW VOCABULARY (founder decision, re-engraved by the advisor
> 2026-07-13 — FLOW-BASED, not a blanket word): `acquisitionCost` = bytecode/ABI word ONLY, banned
> from every public surface ("acquisition cost" is RESERVED for real future marketing costs — ads,
> CPA — never the referrer payment). BUYER-side money lines say "Paid to referrer" / referrer
> payment (never "commission" as the buyer money-line label, never "we pay you X%"). "Commission"
> stays the business word on the REFERRER's own surfaces (program terms, their dashboard:
> pending/paid commissions). The canonical formula everywhere: Gross purchase → referrer/source
> payment, if eligible → net protocol contribution → 70/20/10. The doctrinal sentence VERBATIM where
> the flow is explained (now in the /referral boundaries): "The referrer is not paid from Syndicate
> revenue after the fact. The referrer is paid from the purchase transaction before the net protocol
> contribution is routed." Data source rule unchanged: values from quote(), never registry
> commissionBps. Applied: /join fail-closed line → "A referrer payment of X% applies";
> "acquisitionCost" survives only as the cited contract word in the protocol map. `check-public-surface-audit` leak-check adapted IN the
> slice (own-path test — a REDIRECT alias's canonical pointing at the sitemap IS the consolidation
> working). Verified in built shells: referral.html canonical=/referral · source-attribution.html
> noindex,follow. All green: 12 guards · seo:check 34 routes · rewrites:check · surface:audit 218+ ·
> build 18 shells.
