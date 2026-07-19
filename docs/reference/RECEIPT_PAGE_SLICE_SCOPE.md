# /receipt/{txHash} — THE COMPLETE SLICE SCOPE (build-ready; founder Q44 gate)

**Provenance.** Scoped file-by-file by the investigation workflow `wf_d1923bc4-f0a` (lens 3),
2026-07-19 — the root fix for the founder's Copy-link confusion (the button stays; its
destination becomes the member's own receipt page; the six network intents retarget in the
SAME deploy). **Durable — never re-scope.** Q44 records the founder gate: ① indexing =
NOINDEX,FOLLOW (founder answered "non" 2026-07-19 — closed) · ③ ORDER = this page FIRST,
then the 5.1 commission register (founder confirmed — closed) · ② the painted per-receipt
preview card timing — pending his answer. THE NEXT SESSION: read this doc + Q44 + CLAUDE.md
laws, produce the WIREFRAME for founder approval (Visual Change Law), then build the ordered
work list below. The wide-screen/scroll fixes and the binder are DONE (featureStatus.ts).

---

# SLICE SCOPING — the /receipt/{txHash} public page

Repo: C:/Users/kemal/OneDrive/Documents/GitHub/syndicate-os. This is the engraved next step (docs/direction/OPEN_QUEUE.md:19 — "/receipt/{txHash} public permalink (Copy link retargets to it; per-receipt OG cards)"), and the root fix for the founder's Copy-link confusion (docs/SESSION_STATE.md:225-229: "Copy link hands a raw Snowtrace URL — nonsense for new members; the ROOT fix is the engraved /receipt/{txHash} page"). A prior 5-lens research pass already pre-scoped it (docs/reference/RBIND2_HERO_SHARE_DIRECTION.md:62-69 and §4 item 1) — nothing below contradicts it; this adds file-level precision.

## 1. SERVING (artifacts/studio/server/serve.mjs)

- The invariant: "Clean-URL → flat <route>.html; home → index.html; unmatched → real 404.html (HTTP 404). NO SPA fallback" (serve.mjs:23-24). Resolution order: real file (serve.mjs:212) → home (216-222) → exact-match lookup in ROUTE_TABLE (226-234) → 404 (237-240). **No prefix/wildcard mechanism exists anywhere** — routeTable.generated.json is pure literal pairs (64 rules; nested paths like /referral/introductions are still literal keys, routeTable.generated.json:44).
- Rules are generated from the SEO registry only: scripts/generate-serving-rewrites.ts:27-36 takes every PUBLIC/PENDING route (except "/" and "*") and emits "/x" and "/x/" → "/x.html"; `--check` blocks drift at the gate (53-63).
- **The mechanism this slice adds — a registry-derived param-rule class:** a registry entry `/receipt/:txHash` must be (a) EXCLUDED from the literal table, and (b) emitted as a new generated structure (e.g. `{prefix:"/receipt/", tailPattern:"^0x[0-9a-fA-F]{64}$", shell:"/receipt.html"}`). serve.mjs gains one step 3b: if the path starts with a param prefix and the tail matches the pinned shape, serve the ONE shell at 200; any other /receipt/* path → the real 404. This keeps the no-SPA-fallback invariant as tight as possible: only shape-valid receipt URLs get the shell; the sole soft state left is a well-formed hash that is not a real purchase — the page renders an honest fail-closed "no receipt on this transaction" state, under noindex, so it can't pollute search.
- Precedent: none for prefixes, but the whole pattern (registry → generator → `--check` drift gate → dependency-free consumption at startup, fail-closed) is exactly reusable.

## 2. ROUTING (artifacts/studio/src/App.tsx)

- **No param route exists today** — every route is a literal (App.tsx:140-304); the registry itself documents "the app has no dynamic/param routes today" (seo-route-registry.ts:995-996, inside matchRoute's doc) and "the app has a flat route table" (seo-route-registry.ts:1136-1137). Wouter supports `:param` natively; the page reads it via useParams.
- PublicRoute passes the route PATTERN (not the location) to AccessGate (App.tsx:120-134), and AccessGate looks it up by exact string in surfaceClassification (AccessGate.tsx:60); so `<PublicRoute path="/receipt/:txHash">` + a surfaceClassification entry with `routePath: "/receipt/:txHash"` (PUBLIC · PUBLIC_VISITOR · layout public · S1 · PREVIEW_LABELLED, the shape at surfaceClassification.ts:52-62) makes guard-access-state rule 10 pass unchanged — its scans compare literal strings from App.tsx against the registry (guard-access-state.ts:303-353).
- guard-route-nav-drift has one trap: every PUBLIC non-REDIRECT registry route must have a modules.ts entry or it fails as "structurally invisible to header/footer" (guard-route-nav-drift.ts:95-104). A param page is structurally not a nav destination — the slice must either add a deliberate param-class exemption to that check (dated, mirroring the REDIRECT exemption at line 98) or add a hidden visible:false module entry. Recommend the guard exemption.
- check-seo-registry.ts:37-49 and check-public-surface-audit.ts:62-64 discover router paths by the literal `path="…"` regex — the pattern string `/receipt/:txHash` matches registry parity by plain string equality. No change needed there beyond the registry entry itself.

## 3. SEO REGISTRY (artifacts/studio/src/lib/seo-route-registry.ts)

What a PARAM entry needs, consumer by consumer:
- **Entry:** path "/receipt/:txHash", routeType PUBLIC, indexStatus **NOINDEX** (an existing class: getRobotsDirective → "noindex, follow", seo-route-registry.ts:950-955; getCanonicalUrl → null, 974-978), sitemap:false, canonicalPath:null, human title/description. All of seo:check's invariants already accommodate NOINDEX (non-INDEX ⇒ noindex directive, no canonical, absent from sitemap — check-seo-registry.ts:229-242, 354-360); surface:audit likewise (check-public-surface-audit.ts:251-264).
- **matchRoute must become param-aware** (seo-route-registry.ts:998-1019 is exact-match-only, falling back to the "*" catch-all) — otherwise SeoHeadManager stamps the 404 head ("Page Not Found", noindex,nofollow) onto every live receipt URL: a truth bug. Segment-wise matching for entries containing "/:" fixes head, breadcrumbs, and RouteContextBar in one place. The two stale "no dynamic routes" comments update in the same pass.
- **prerender (scripts/prerender-routes.ts) must special-case the param path:** its filter takes every PUBLIC route (193-195) and writes `dist/public/<path>.html` (208) — for "/receipt/:txHash" that filename contains ":" which is **illegal on Windows: the build would crash**. It should bake ONE shell → `receipt.html` with the entry's baked head (noindex, no canonical, static OG image, CSP meta rides automatically via renderRoute:148-171).
- **generate-serving-rewrites** — see §1. **generate-sitemap** — nothing (non-INDEX excluded). **robots.txt** — must NOT Disallow /receipt (preview crawlers have to fetch the page for unfurls; RBIND2_HERO_SHARE_DIRECTION.md:64).

## 4. THE PAGE'S DATA (public visitor, no session)

Two viable sources; recommendation = the server read.
- **Server read (recommended):** everything needed already exists keyed by wallet in the own-purchase read-model (artifacts/api-server/src/backbone/ownPurchaseReadmodel.ts): per-row receipt facts with the four-engine semantics, the V2A/V2B same-transaction Routed fold (140-198), the frozen-genesis seat join for V1 (153-157), chain-verified sealing timestamps, and **ADR-003-clean serialization by construction** — holder and referrer are server-derived short forms (182-185), no wallet key ever serializes (rowsByWallet is SERVER-ONLY, 121). The slice adds a tx-keyed projection in the same pure build, plus a NEW public route (e.g. GET /api/receipt/{txHash}) following the capitalStanding.ts discipline verbatim (routes/capitalStanding.ts:39-96: public param read → shape-validate → in-memory snapshot → honest null notes → output leak gate) — with the **boundary-aware** 40-hex scan (`/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/`, the f436c42 lesson: the payload legitimately carries 64-hex anchors — auth/router.ts:869), publicReadThrottle, decimals `{usdc:6, syn:18}` served like member-purchases (auth/router.ts:855-863), and explorer txUrl. It cannot live under /api/auth (it is public) and the client fetch cannot live in src/wallet/ (guard-access-state §17 pins every wallet-module fetch to literal /api/auth/ URLs, guard-access-state.ts:768-775).
- **Client chain read (rejected for V1):** lib/chainReads.ts has no receipt/log reads (it is view-calls only, chainReads.ts:28-450); JoinCheckout proves the pattern works for a JUST-mined V3 tx (publicClient.waitForTransactionReceipt + parseEventLogs against the 25-field event ABI + getBlock, JoinCheckout.tsx:448-504) and it would work for any hash — but it needs all four engines' event ABIs client-side, engine-address matching, decimals reads, and cannot do the V1 frozen-roster seat join. The server path preserves one spine, one fact shape: the page builds its model exactly as the binder does (ReceiptsBinderPanel.tsx:105-138 → buildMembershipReceipt).
- One honest edge: the server read serves only INDEXED purchases — a receipt link opened seconds after checkout may be one indexer cycle early; the page states it plainly ("not in the served record yet — verify on the explorer, retry shortly"). The checkout ticket itself is unaffected (it prints from the mined logs inline).
- Settled law (verified silently, not a gate topic): chain-emitted addresses render short-form on the public payload by construction; the guards enforce it.
- **Page composition:** src/pages page (lazy member-door pattern verbatim, MemberReceipts.tsx:11-33) + a panel OUTSIDE wallet/ (it fetches the public route) that dynamically imports ReceiptTicket (rule 15: only App.tsx may reach @/wallet/ statically). Anon visitors get the full ticket; the share card/referral-link layer self-disables without a session (ReceiptTicket.tsx:78-96 resolves the member's own link only when a wallet is present; the guard already pins "the card mounts only with a resolved link", guard-receipt-ticket.ts:509-513).

## 5. GUARD-RECEIPT-TICKET — pin 10 and pin 14

- **Pin 10's amendment instruction, verbatim** (guard-receipt-ticket.ts:327, the failure message): `pages: ticket/builder referenced outside the wallet module: ${offenders.join(", ")} — a ticket is born ONLY from a confirmed event in the wallet module (amend this pin, dated, at the /receipt/{txHash} slice)`. The pin's doc (lines 32-37): "NO page under src/pages ever mounts the ticket or the builder — a ticket is born ONLY inside the wallet module, from a confirmed event." The slice amends it exactly as instructed: dated allowlist for the sanctioned public-receipt file(s), and the new panel JOINS the scanned module set (the R-BIND coverage-growth precedent, guard-receipt-ticket.ts:115-123) so every content law scans it too.
- **Pin 14** (guard-receipt-ticket.ts:527-532) requires `/receipt/{txHash}` and "LIVING TICKET" to stay engraved in the spine header — the roadmap sentence (protocolCommerceReceipt.ts:28-32: V1 → the public page + the dedicated PDF engine → the LIVING TICKET → receipt-as-artifact) gets re-worded to mark this stage built, keeping both tokens present, never deleted.

## 6. OG

- Today: ONE static site-wide OG image baked per shell (prerender-routes.ts:157-168; DEFAULT_OG_IMAGE, seo-route-registry.ts:77). A single static receipt.html shell can only carry ONE og:image for ALL receipts — per-receipt cards structurally require per-URL head work at serve time, which is why they are their own rider (already engraved: RBIND2_HERO_SHARE_DIRECTION.md:64-69 — satori+resvg on the api server (no such dep exists anywhere yet), 1200×630, <300KB for WhatsApp, self-referential og:url per variant, the rotation lives IN THE LINK). Two recorded mechanisms for that rider: serve.mjs gains a pure-string parameterized substitution (validated hash → og:url/og:image/twitter:image; no DB needed in serve.mjs — the api-server card endpoint does the data work), or the platform routes /receipt/* to the api server. Nothing in slice A prejudices either.

## 7. THE ORDERED WORK LIST (one slice, in this order)

0. Wireframe → founder approval (Visual Change Law ① — a new page composition; anatomy per the Lens-4 verdict: verdict-first, exact amount, human product name, verify affordances, owner layer by session).
1. Registry: the PARAM entry + param-aware matchRoute + the two stale comments (seo-route-registry.ts).
2. Generators: generate-serving-rewrites param-rule emission + drift check; prerender single-shell special-case (the Windows ":" crash); serve.mjs step 3b shape-validated prefix serving.
3. Routing: App.tsx PublicRoute param route + surfaceClassification entry + the drift-guard param exemption (dated).
4. Server: tx-keyed projection in ownPurchaseReadmodel + GET /api/receipt/{txHash} (capitalStanding discipline, boundary-aware leak gate, throttle, honest states).
5. Client: the page + public panel (dynamic ReceiptTicket import), honest states (resolving · dark model · unknown tx · facts-incomplete fallback per binder).
6. Guard amendments: pin 10 (dated, per its own instruction) + pin 14 roadmap re-word + panel joins the scanned set.
7. THE RETARGET (the founder's fix): ReceiptTicket Copy-link + the six network intents carry `https://thesyndicate.money/receipt/{txHash}`; Verify + the QR ("SCAN TO VERIFY") stay the explorer one click deeper. Ships in the same deploy as the page — never before it.
8. SEO-rides-the-slice + DESIGN_ROADMAP tick + SESSION_STATE/OPEN_QUEUE, same commit. Full gate: tsc ×4 · 18 studio guards · api guards · seo:check · seo:rewrites:check · surface:audit · build (shells + the new receipt.html + byte-identical compression + admin-dist) · rig PREVIEW GATE (desktop+375px, both themes, images loaded) — with the recorded rig caveat: localhost has no Replit DB, so the rig shows the honest dark-model state; the living seal happens in prod (the slice-4/5 founder-confirmed pattern).

**Deploy verdict: 🚀 DEPLOY (server + client, NO migration) — never batchable** (page + retarget must land together).

## 8. DECISIONS FOR THE FOUNDER AT THE GATE

1. **Indexing posture: noindex (recommended) vs index.** Recommended noindex,follow — anyone with the link sees everything and shares unfurl, but search never accumulates a browsable corpus of purchase pages (the risk named in RBIND2_HERO_SHARE_DIRECTION.md:64, explicitly reserved as "a founder choice at that slice's gate").
2. **OG card: static site card now, the painted per-receipt card as its own later slice (recommended, already the engraved order) — or pull it into this slice** (cost: new api-server image deps + per-URL head serving now).
3. **The dedicated PDF engine: ride now or defer.** The engraved roadmap couples it to this slice (protocolCommerceReceipt.ts:30; ReceiptTicket.tsx:17-18), but the print-clean Save-as-PDF already works wherever the ticket mounts — recommend defer to its own rider unless he wants it now.
4. Sequencing note: slice 5.1 (commission receipts register) is AWAITING his visual approval of its mockup (SESSION_STATE.md:554-555) — this page is the parallel engraved next step per OPEN_QUEUE:19; he picks which goes first.

## 9. EFFORT SHAPE

**One slice** for the page + retarget (comparable weight to referral slice 4: one server read + one client surface + the serving/registry mechanics; ~10-12 files touched + 3 guard amendments). **A second, separate slice later** for per-receipt OG cards + the link-rotation arc (new api deps, per-URL head injection). The PDF engine is a third small rider unless pulled in. The R-BIND-3 wide-screen and scroll bugs are a separate prod-bug slice already in flight (SESSION_STATE.md:221-233) and are NOT part of this scope.