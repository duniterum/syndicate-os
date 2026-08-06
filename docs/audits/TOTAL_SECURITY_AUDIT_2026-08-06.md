# TOTAL SECURITY & PRODUCTION-READINESS AUDIT — 2026-08-06

**Archived 2026-08-06, after the fact.** This audit ran as a 15-agent read-only sweep and
was delivered *in chat*. It was never written to the repo — the exact failure mode the
registers warn about: the conclusion reaches canon, the reasoning stays in a chat log.
Written now so every finding, citation and measurement survives the session.

> **Authority note.** This is an AUDIT REPORT, therefore a LIST OF PROPOSITIONS, never a
> law (`CANON_LOI_ANTIBLOCAGE` §①). Nothing here blocks a build. Where a finding was later
> settled by measurement or by the founder, the STATUS column says so.

---

## A) BASELINE

| | |
|---|---|
| **Commit** | `49d9392ffc26db686f4e7916986b3faa1b4bc67f` (2026-08-06 00:32:03 +0300) |
| **Tree** | CLEAN — `git status --short` empty at dispatch |
| **Method** | 15 read-only specialist agents, max 5 concurrent, no live traffic, no writes |
| **Raw findings** | **135** · deleted for missing citation: **0** (every agent cited `file:line`) · merged as duplicates: 4 · demoted on orchestrator re-verification: 2 |

**Packages audited.** SHIPPED: `artifacts/studio` (360 ts/tsx, 40 public routes + 11 admin),
`artifacts/api-server` (175 ts; 15 public / 18 auth / 13 operator / 2 channel endpoints),
`lib/*` (api-spec, api-zod, api-client-react, db, os-contracts), `contracts/src`
(MeritDistributor — **not deployed**).
NOT-SHIPPED (caps P2 unless it leaks): `artifacts/mockup-sandbox` — confirmed by
`artifacts/mockup-sandbox/.replit-artifact/artifact.toml` having **no `[services.production]`
block at all** · `contracts/{test,out,lib,cache}` · `docs/` · `scripts/` · `artifacts/*/scripts`.

---

## B) THE FIFTEEN AGENTS — COVERAGE MATRIX (section H, verbatim, including what each could NOT reach)

| Agent | Actually read | Did NOT reach, and why |
|---|---|---|
| **A1** attribution | `referralMemory.ts` full, capture sites, `sourceValidate`/`joinQuote`, `MembershipSaleV3._resolveSource`, channel store/router, link builders | Real-browser focus timing; current on-chain source count (blast radius unquantified); whether the continuity spine holds a seat↔wallet pair not chain-published |
| **A2** economics | `connectorLadder` both homes, `joinQuote`, `introducerRead`, `referralTermsService`, `sourcePerformanceService`, all `introduction*` models, referral panels | **`SourceRegistryV1.sol` is not in the repo** — 5 struct transcriptions unverifiable against source; `MAX_MEMBER_INTRO_BPS = 1200` asserted as chain truth, unverifiable; whether escrow has ever occurred |
| **A3** admin authz | All 13 operator endpoints line by line, `authExposure`, `operatorContext`, `sessionStore`, both wall guards, the seed script | Real X-Forwarded-For chain (needs live traffic); actual prod env values; DB-level constraints beyond the Drizzle schema |
| **A4** admin abuse | CORS/cookie config, all 7 mutating services, `guard-admin-dist`, the built dist, `vite.config` | Whether prod shares a registrable domain with a third-party-controllable host; dependency posture (deferred to A13); platform log retention |
| **A5** wallet auth | `challenge`/`verify` line by line, nonce + session stores, all 12 own-row endpoints, the RainbowKit adapter | Runtime instance count (decides whether the per-process finding is latent or live); operator router 200-658 by targeted grep only |
| **A6** data exposure | `payloadDiscipline`, `addressSafety`, every public + auth response builder, all `lib/db` schemas, logger, `vite.config`, `serve.mjs` headers | Deployment env values; the Replit-built bundle (inspected the local build); pino `err` serializer on undici cause chains; the painters' string composition line by line |
| **A7** input/output | Full sink census: DOM, URL, SQL, file-path, SSRF, regex, both painters, `prerender-routes`, `serve.mjs` substitution | Whether the prod edge appends or replaces XFF — the one fact that would move its P1 to CONFIRMED; satori's internal escaping; response-schema coverage |
| **A8** receipts | Generation branch, all 4 engines' field sets, every formatter, `receiptLookup`, `cardFacts`, both receipt guards, `MembershipSaleV3` split logic | **V1/V2 contracts absent from the repo** — their sum-to-total unverified (later CLOSED by Q3); whether any historical V2 tx carried two pairs |
| **A9** exports | All 8 export paths, both painters, print CSS, `qrGrid`, share targets, both card guards | **No rendering performed** — every geometry/overflow/stress judgement is source-only; whether a live row reaches the null-net + splits + commission state |
| **A10** seams | `backboneRunner`, `backboneDb`, all read-models, `continuitySpineRefresh`, every unique constraint, the full duplicate-figure table | Whether a reorged row self-heals; whether `backbone.guard` already pins some of it; runtime divergence magnitude |
| **A11** robustness | Every write endpoint's idempotency, pool config, `rpcTransport`, all caches, `serve.mjs` end to end, the `cors` library source | Prod `NODE_ENV` (**settled by the orchestrator — it IS `production`**); autoscale max-instance count; measured pool saturation; ~880 lines of `realityService` |
| **A12** chain reads | `rpcTransport`, `evmRead`, every decoder against the verified `.sol`, all 6 lanes, the full PENDING inventory | **No RPC call made.** V1/V2 sources absent; whether protocol-event topics are recoverable for a re-decode; actual P0-1 magnitude (later measured) |
| **A13** supply chain | **Live `pnpm audit`** — 26 advisories / 969 deps / 13 high / 0 critical; lockfile integrity; install scripts; full `git log -S` history sweep; env table | Could not execute `drizzle-kit push` to test destructive-DDL behaviour; Replit secret *values*; no provenance/signature verification; measured the local dist, not the served one |
| **A14** guards/types | **Ran `tsc --noEmit` — 0 errors both packages**; classified all 60 guards by import census and target discovery; chain membership derived mechanically | **Ran no guard and no mutation** — "this guard would not go red" is an argument from its discovery mechanism, not a measurement; did not read `serve.mjs` contents; did not read the Foundry tests |
| **A15** copy | `featureStatus.ts` as oracle, all shipped copy configs, painted card text, and the *misses* of 6 copy guards | Server-authored text (notification bodies, Chronicle entries, Founder-typed labels) lives in the DB — no static sweep can cover it; runtime `chipLabel` strings |

**Systemic gaps the audit could not close, ranked.** ① V1/V2A/V2B contract sources absent
(later CLOSED by Q3 measurement). ② `SourceRegistryV1.sol` and `CommissionRouterV1.sol`
absent while five files transcribe the registry struct positionally (later CLOSED by Q4).
③ No rendering, no RPC, no live traffic — per the audit's own rules. ④ No mutation testing,
so guard *strength* inside the EXECUTING class is unmeasured.

**Prioritised over complete, as permitted.** Deliberately thinner: `lib/api-client-react`
and `lib/api-spec` internals, the `contracts/` Foundry suite quality, `realityService`'s
middle ~880 lines, and the design-system guards (type scale, spacing, contrast).

---

## C) P0 FINDINGS — all three personally re-verified by the orchestrator at the cited lines

### [P0-1] Public 70/20/10 routed figures computed on GROSS; the contract routes NET
**STATUS: OPEN — enforcement half landed `ded1596`, surfaces untouched.**
CONFIRMED · A10 + A12 + orchestrator · `artifacts/studio/src/components/hero/useHeroReality.ts:245-247`

```
routedVault:      routedShare(aggregateRaw, 7_000n),
routedLiquidity:  routedShare(aggregateRaw, 2_000n),
routedOperations: routedShare(aggregateRaw, 1_000n),
```
`aggregateRaw` = `financial.inflow.aggregate` (`:134`), which the server labels *"All-engine
cumulative **gross** USDC inflow"* (`realityService.ts:1213`). The engine:
`MembershipSaleV3.verified.sol:498-503` — `protocolContribution = grossUsdc - acquisitionCost;
vaultAmount = (protocolContribution * 70) / 100`. Rendered at `HeroLedger.tsx:50-52,211-216`,
`Tokenomics.tsx:170-172`, `Whitepaper.tsx:179-181`. Second, independent error (A12): the
three legs are floored separately at 7000/2000/1000 bps while the contract makes operations
the exact remainder, so the displayed legs cannot sum to the displayed total.
**Measured magnitude:** shown 1,410.00 / 987.00 / 282.00 / 141.00 against a true
1,408.75 / 986.12 / 281.75 / 140.88 — overstated by exactly **1.25**, the source payments
ever made. Grows linearly with referrals. `totalProtocolContribution` is a public view
(`verified.sol:134`, declared `sale-abi.ts:190`) and was read by nothing.

### [P0-2] The referrer's own commission rate derived from a counter, not read from the chain
**STATUS: OPEN, but MEASURED LATENT — see [Q1]. Demoted to step 5 of the remediation order.**
CONFIRMED · A2 + orchestrator · `artifacts/studio/src/components/referral/ReferralOverviewPanel.tsx:17,29`

```
const p = s ? ladderProgress(s.durableIntroductions) : null;
…  {p.current.title} · {p.current.bps / 100}%
```
`currentBps` — the live registry rate — is already parsed onto the member's standing at
`walletSession.ts:367,416`, and is consumed **only** by admin screens
(`SourcePerformancePanel.tsx:80,265`, `ProposeSourcePromotion.tsx:293,324`) and by **no
member-facing panel**. `ReferralCommissionsPanel` computes dollar figures from the derived
rate. The panel renders *"Promotion due — awaiting founder signature"* directly beneath,
proving the code knows the two differ.

### [P0-3] Any format-valid `?source=` permanently destroys a real remembered introduction
**STATUS: CLOSED-BY-FIX — `abee8f9`, live in production (18th seal, 2026-08-06).**
CONFIRMED · A1 + orchestrator · `artifacts/studio/src/lib/referralMemory.ts:73-75,276-282`

Shape was the only test: `isSourceIdFormat(value) && value.toLowerCase() !== ZERO_SOURCE_ID`.
No existence/active check, though the app owns `/api/source/validate` and calls it on the
same page. Permanence proven at `MembershipSaleV3.verified.sol:479` —
`buyerSourceId[p.recipient] = requestedSourceId;` is the **only** write, and the `onlyOwner`
set is `pause / unpause / recoverUnsoldSyn / rescueToken`: **no setter exists**.
`guard-referral-memory.ts:239-240` **pinned the defect as law**.
**Fix:** a confirmation marker; a confirmed arrival always replaces, an unconfirmed one only
replaces empty-or-unconfirmed memory (equal rank → ruling ⑭), a confirmed memory is never
displaced or downgraded, a refusal erases nothing. Legacy memories read UNCONFIRMED so a
planted link is repairable. Guard inverted in the same commit: 94 checks, 55 executed rows
(was 43), six mutations proven RED.

---

## D) P1 FINDINGS

| ID | Finding | Citation | STATUS |
|---|---|---|---|
| **[P1-01]** | Sale lane alone has no reorg overlap <s>and no head margin</s> — a lagging node advances the cursor over unread blocks and a purchase is lost permanently | `saleEventIndexer.ts:397` (resume at `lastScanned + 1`), `:463-469` (cursor advanced unconditionally); siblings `protocolEventScan.ts:116`, `tokenDiscoveryScan.ts:569`, `nativeAvaxScan.ts:478` all carry 50 | **CLOSED-BY-FIX 2026-08-06** — `SALE_REORG_OVERLAP = 50`. ⛔ **TWO CORRECTIONS TO THIS ROW, both measured:** ① **the "no head margin" half was NOT a defect — adding one would BE a defect.** `nativeAvaxScan` trails the head by 200 because it reads an explorer index; the sale lane must not, because the routed fold is reconciled against the sale contracts' own counters read at `latest`, so a deliberate trail would blank four public money figures by design. Overlap yes, margin no — and the refusal is now pinned mechanically. ② **the evidence cited in §K did not belong to this finding** — see below. |
| **[P1-02]** | Every commission row stamped "Paid · Final — settled on-chain" though the event fires identically when the payout reverted into escrow; `SourcePayoutEscrowed` indexed nowhere | `ReferralCommissionsPanel.tsx:246-248,330-334`; `introductionReadmodel.ts:82`; `verified.sol:528-535` | **OPEN** |
| **[P1-03]** | Public "Paid to referrers" total is the EARNED sum — escrow subtracted per row, not from the total | `introductionReadmodel.ts:236,291,306` vs `:274-276` | **OPEN** — coincidentally correct today (escrow reads 0) |
| **[P1-04]** | Admin referral-terms panel never reads the server (no GET exists); seeds from hardcoded literals and Save clobbers all four terms; `referralTerm` is read by nothing | `AdminReferralCrud.tsx:23-25,38-42`; `referralProgram.ts:281-286`; `operator/router.ts` has POST only | **OPEN** |
| **[P1-05]** | Four eligibility/anti-abuse switches are decorative — `toggles` never referenced in `handleSave`; server `ALLOWED_KEYS` has no toggle key; still reports "Terms saved and audit-logged." | `AdminReferralCrud.tsx:26-27,39-45,153-166`; `referralTermsService.ts:24-30` | **OPEN** |
| **[P1-06]** | A receipt is identified by txHash ALONE — two purchases in one tx collapse onto one receipt; `logIndex` exists in the read-model and every consumer takes `[0]` | `receiptLookup.ts:54`; `receiptCard.ts:61,71`; `ReceiptTicket.tsx:227`; `JoinCheckout.tsx:670` | **OPEN** |
| **[P1-07]** | Season own-row matched by a 28-bit truncated address — vanity-grindable; the exact key is on the same object | `auth/router.ts:980-985`; `seasonReadmodel.ts:159` | **OPEN** |
| **[P1-08]** | No executable test or guard covers the live money spine — zero `*.test.ts`, no runner in any manifest; `buildOwnPurchaseReadModel`/`seasonReadmodel` referenced by no guard; receipt guards import zero `../src/` modules | workspace-wide; `guard-receipt-ticket.ts:304-308` | **PARTIALLY CLOSED** — `guard-money-flow` ① now executes the real fold with fixtures (`ded1596`); the rest OPEN |
| **[P1-09]** | Nothing runs `release:gate` automatically — no `.github/workflows/`, no git hook, `.replit` postBuild is `pnpm store prune` | `package.json:11`; `.github/`; `.git/hooks/` | **CLOSED-BY-FIX** — `b59f8ca` (workflow + hook), `80210b4` (versions + annotations), `32b38e9` (gate step order) |
| **[P1-10]** | `postMerge` auto-applies an unreviewed schema diff to the live database — `drizzle-kit push`, no migration files, no down path | `.replit [postMerge]` → `scripts/post-merge.sh:1-4`; `lib/db/package.json:11` | **OPEN** |
| **[P1-11]** | Auth throttle: one 30/min bucket shared by the whole auth zone AND all 13 operator endpoints; full-map branch denies NEW keys instead of evicting; key derived from a client-influenceable XFF | `auth/throttle.ts:19,41-46`; `authConfig.ts:47-49`; `clientIdentity.ts:98-118`; the fix already exists at `publicReadThrottle.ts:55-78` | **OPEN** — four agents independently (A3/A4/A5/A7) |
| **[P1-12]** | The N2 audit journal is write-only — no `from(auditLog)` read in any endpoint; `/admin/audit` renders fabricated sample rows | `AdminOperatorSurfaces.tsx:320-349` | **OPEN** |
| **[P1-13]** | A compromised sole `founder_root` cannot be revoked from inside the product; the documented recovery is a race | `operatorRegistryService.ts:119-141`; `sessionStore.ts:95-97` | **OPEN** |
| **[P1-14]** | Native-AVAX lane publishes the explorer's amount verbatim — chain-reading clause ③ broken, and the code comments claim the opposite | `nativeAvaxScan.ts:206,251` → `protocolEventReadmodel.ts:555`; contradicted by `explorerIndex.ts:19-20` | **OPEN** |
| **[P1-15]** | chainId verified once, then every row stamped `43114` regardless of which endpoint answered; the fallback URL is validated only for `https:` | `rpcTransport.ts:90-116`; `saleEventIndexer.ts:205-217` | **OPEN** |
| **[P1-16]** | Session/nonce/backbone state is per-process while the deploy target is `autoscale`; the repo's own doc says auth needs single-instance | `.replit:5-6`; `sessionStore.ts:31`; `nonceStore.ts:18`; `docs/00_START_HERE.md:104` | **OPEN** |

---

## E) P2 / P3 — grouped, with citations

**Guard estate.** Guards + SEO generators + `serve.mjs` (436 lines, the production static
server) outside both typechecker and linter (`studio/tsconfig.json:3-4`,
`eslint.config.js:40-42`; api-server has no eslint config) · every receipt/share/money
studio guard is SELF-NAMING, two do zero directory discovery · `guard-duplicate-facts`
cannot match any number below 1,000,000 (`:93`) nor anything in `lib/*` (`:55`) ·
`verify:canon` in no chain while the typecheck hole it names is live (2 of 9 canon files) ·
`partB-canon` + `partB-import` sit in the uncalled `guards:db` · no meta-guard pins that
every guard is wired · the anti-mock pin matches only `$`-prefixed digits in string
literals (`guard-receipt-ticket.ts:326-340`) · `receipt-card.guard.ts` has no real-row pin.
**STATUS: OPEN** (except `guard-money-flow`'s directory sweep, which is the pattern's answer
for the vocabulary class — `ded1596`).

**Money-path hygiene.** Exact-money formatter in three hand-copied implementations, one
fails OPEN (`referralStanding.ts:169-173`) · `ReferralCommissionsPanel.tsx:52-59,420` is a
second receipt document outside every receipt guard with `value="$5.00"` and float math ·
V2 `Purchased`↔`Routed` pairing drops `memberNumber` (`ownPurchaseReadmodel.ts:238-239`) ·
season eligibility gate decided in float on a real-USDC path (`seasonReadmodel.ts:367-370`) ·
`sum(parts) === total` asserted by no code (**CLOSED-BY-MEASUREMENT for V1/V2 — see [Q3]**;
now asserted for the fold by `guard-money-flow` ①) · two projections of the same purchase's
splits with different admission rules (`introductionRefresh.ts:234-256` vs
`ownPurchaseReadmodel.ts:194-211`) · token decimals hand-typed in 5 places · reorg overlap
declared 3× · "gross inflow" computed twice (`realityService.ts:1161-1191` vs
`backboneRunner.ts:570-585`) — **the latter to be CLOSED when P0-1's surfaces land, by
reusing the backbone read rather than adding a third home.**

**Backbone truth.** An era-lane fault silently rebuilds the season board with zero season
boundaries (`backboneRunner.ts:705`) · stale derived models served under a FRESH `headBlock`
with lane flags asserting completeness; no derived model carries an `asOfBlock` ·
`partial` invisible on every public surface (`backboneRunner.ts:938-941`) · reorg detection
compares two of our own writes (`backboneDb.ts:788-799`) · `backbone.guard`'s mode check
covers 3 lanes and omits the deepest walk · the lifecycle decoder discards the indexed
`sourceId` (`protocolEventScan.ts:349-374`) · `EraAdvanced` emitted and indexed nowhere ·
the browser re-walks ~22 `eth_getLogs` chunks per `/activity` load (`activityFeed.ts:170-237`) ·
the attribution snapshot frozen at block 89832255 stating a TOOL limit as a fact about the
chain · the holder-index snapshot serves `memberTotal: 14` as VERIFIED. **STATUS: OPEN.**

**Admin surface.** Operator router lacks `rejectCrossOrigin` (**orchestrator-ruled P2, not
P1** — `methods: ["GET","HEAD","OPTIONS"]` at `app.ts:114`, no `credentials`, SameSite=Strict,
and `express.json()` rejects the simple-request types) · the admin console chunk ships in the
public dist while the gate claims otherwise · `stepUpSigned` written literally `false` by all
13 audit sites · broadcast has no confirmation/preview/scoping/recall · notification delete
is hard and the audit row keeps the audience word but not the content · `GET /notifications`
is the one unaudited privileged read of member bodies + wallets · the API half of the neutral
wall answers 401/403 not 404 · `VITE_OPERATOR_PREVIEW=true` would open the wall and pass every
guard · three operator READ endpoints write an unbounded audit row per call. **STATUS: OPEN.**

**Exports/artifacts.** Print stylesheet targets **every** `.receipt-print-root` so `/receipts`
superimposes N tickets (`index.css:632-638`) and hides with `visibility` so the page still
paginates · the rasterized PNG and printed PDF bake an interactive control
(`ReceiptTicket.tsx:564-573`) · the receipt card's masthead draws a placeholder `"SS"` monogram
while `SYN_MARK_DATA_URI` exists and is never imported (`faces.ts:78-107`) · `<em>` renders
italic inside the ticket paper and the anti-italic guard tests the Tailwind *class* ·
`/api/receipt-card` has no single-flight while its twin has one with a comment naming the
hazard · a screenshot of the painted card loses the referrer. **STATUS: OPEN.**

**API robustness.** DB pool has no `max`, no acquire timeout, no statement timeout, and the
backbone shares it with the request path (`lib/db/src/index.ts:14`) · no
`process.on('unhandledRejection'|'uncaughtException')` anywhere · operator notification writes
have no idempotency key · `recordClick`'s per-day cap is check-then-act without a lock ·
`serve.mjs` does all body I/O synchronously and re-regexes the shell per param request ·
channel throttles never got the crowd allowance or eviction fix · channel zone has no scoped
error handler (**orchestrator-demoted P1→P3**: `NODE_ENV=production` IS set, so no stack can
reach a client) · channel conversions are attacker-writable and first-writer-wins.
**STATUS: OPEN.**

**Supply chain.** `socket.io-parser@4.2.6` (HIGH) ships in the browser bundle via MetaMask
SDK, measured in the emitted chunk · `esbuild` hard-pinned at `0.27.3` with an open Windows
dev-server advisory, the exact pin blocking the fix (`pnpm-workspace.yaml:160`) · `@replit/*`
exempt from the 1-day quarantine while `runtimeErrorOverlay()` sits OUTSIDE the dev-only guard
(`vite.config.ts:45`) · three dead install-script grants and one dead release-age exemption ·
`VITE_AVALANCHE_RPC_URL` accepts any https URL into the public bundle while the repo names a
keyed URL a secret twice. **STATUS: OPEN.**

### [S-1] The published database credential — **CLOSED-BY-ROTATION (founder, 2026-08-06)**
`postgresql://postgres:syndicate_local@localhost:5433/syndicate` — the `postgres` superuser —
committed at `.claude/launch.json:49` and duplicated at `SESSION_STATE.md:1789`. **Confirmed
published:** `raw.githubusercontent.com/duniterum/syndicate-os/main/.claude/launch.json` →
**http=200**, unauthenticated, password present. In 2 tracked files across 3 commits, oldest
`52b70ad` (2026-07-29).

**What it actually exposes — measured, not assumed.** PostgreSQL 17 listens on `0.0.0.0:5433`
**and** `[::]:5433` (`listen_addresses = '*'`), so the socket is open on every interface — but
`pg_hba.conf` permits **only** `local`, `host … 127.0.0.1/32` and `host … ::1/128`. **A remote
client completes a TCP connection and is refused at authentication regardless of what it
sends.** The bound is `pg_hba`, not the `localhost` in the connection string.

**The founder's resolution:** he **regenerated the Replit database password as a precaution**
rather than audit whether `syndicate_local` had been reused. That voids the only path that
could have made this severe — reuse against production. The committed local credential remains
committed and remains bounded by the loopback restriction above.

**History was DELIBERATELY NOT REWRITTEN**, and this is a decision, not an omission: a purge
would rewrite **178 commits** (`52b70ad`..HEAD), changing every SHA — including **every seal
citation that both `SESSION_STATE.md` and `OPEN_QUEUE.md` carry** (`936f929`, `c0555cc9`,
`abee8f9`…) — and forcing Replit to re-clone. And it would un-publish nothing: eight days
public, on a repo GitHub labels a template; caches, forks and clones already hold it. **A
published credential is compromised at publication; rewriting history is theatre unless paired
with rotation, and the rotation is what was done.**

⛔ **DO NOT REOPEN THIS.** The residual hardening — `listen_addresses = 'localhost'`, and
replacing the tracked value with a placeholder — is optional defence in depth, not an open
finding.

**Copy/doctrine.** Dead buyer-facing lexicon on `/` and `/source` — *"routed contribution"*,
*"net protocol contribution is routed"* — and `guard-forbidden-copy`'s own header documents
the debt instead of holding it · address-as-secret fossils: `RAW_ADDRESS = /0x[0-9a-fA-F]{40}/`
rejections plus three rendered strings *"served messages never carry addresses"*, against the
retired rule · `/join`'s "Introduced by" is short-form with **no** explorer link on the one page
where money is about to move · `/admin` "Fixed structure" labels `$5.00` as *"Commission per
eligible join"* when the commission is `$0.25` · untranslated French on `/admin`
(`SeasonsRails.tsx:368,375,449`) · lowercase "founder" on `/source`, `/referral`, `/admin` ·
internal slice code "S3" rendered · feature-flags sample rows without the `SampleTag` both
siblings carry · `payloadDiscipline.ts:37,74` advertises a leak gate that is a compile-time
no-op · three short-address spellings, two incompatible · no `Strict-Transport-Security` ·
three public endpoints log the raw error object while the house redactor exists ·
`/api/healthz` returns 200 unconditionally · a member is handed a live shareable link + QR for
a source that does not exist on-chain · the popunder defence defers the write instead of
denying it. **STATUS: OPEN.**

**Orchestrator's own finding, not from any agent.** `app.ts:61` justifies the CORS policy with
*"This API is read-only and GET-only."* That is **false** — three write zones are mounted below
it (`:128`, `:130`, `:141`). The only thing between the operator zone and real CSRF is a
`methods` array whose stated rationale is obsolete; a future session "correcting" that comment
by adding `POST` opens the hole. **P3 today; it is how a P0 gets born. STATUS: OPEN.**

---

## F) PHASE 0 CHAIN MEASUREMENTS — verbatim, re-runnable

**RPC** `https://api.avax.network/ext/bc/C/rpc` · chainId `0xa86a` (43114) · head **92,120,208**.
Addresses and ABIs taken from the repo, never from memory.
Registry `0x780013bB358be6be95b401901264FC7c22a595a6` · `sourceConfig` selector `0x04559b2f`.
Sale engines: V1 `0x0020Df30C127306f0F5B44E6a6E4368D2855842d` · V2A
`0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` · V2B `0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b`
· V3 `0x2A6cFc76906e758B934209AFf5A163c9bC20132E`.

### [Q1] Is any referrer promotion-due right now? — **NO. ZERO MISMATCHES.**
**EIGHT sources live, ALL ACTIVE, ALL 500 bps.** Created at blocks 88705814 · 90177061 ·
90919905 · 91799262 · 91799420 · 91952722 · 92096418 · 92096448. Seven of eight derive per
SPEC §③ `keccak256("SYN.SOURCE.V1", wallet)`; the exception is `0x8338e9ff…` (the founder's
private wallet), as the spec says.

| sourceId | durable | ladder derives | chain holds | mismatch |
|---|---|---|---|---|
| `0x8338e9ff…` | **3** | Active (500) | 500 | NO |
| `0x804e80f1…` | 1 | Emerging (500) | 500 | NO |
| `0x3d368075…` | 1 | Emerging (500) | 500 | NO |
| `0x4fa3bd06…` `0x19284ba8…` `0x7bd7780f…` `0x89fdc2f5…` `0x99ecb4ba…` | 0 | Emerging (500) | 500 | NO |

**0 mismatches · dollar delta $0.00.** The busiest source has **3** durable introductions;
the first rate-raising rung (Trusted, 600 bps) needs **10** → **seven introductions of
headroom** before [P0-2] can show a wrong figure. **This is why P0-2 was demoted to step 5.**

### [Q2] Has the attribution destruction already cost anything? — **YES, 30.00 USDC chain-proven.**
22 V3 purchases, 16 distinct members, **5 attributed / 17 zero-source**. `buyerSourceId`
read live for all 16: **5 ATTACHED, 11 UNATTACHED and permanently unattachable.**
**The named case:** block **92,095,301**, tx `0xf333b663…`, recipient `0x8337ff0c…1348`,
gross **600.00 USDC**, commission **0.00**, sourceId **ZERO**. At 500 bps the referrer would
have been paid **30.00 USDC**. Unattributed gross **1,235.00** → **61.75 USDC upper bound**,
which is an UPPER BOUND and **not** a loss: chain data cannot prove anyone arrived via a link,
and `referral_channel_click` / `_conversion` hold **0 rows** locally.
Commission ever paid, whole protocol: **1.25 USDC**.
✅ **The fix works in production:** block **92,110,246** was ATTRIBUTED and paid 0.25.

### [Q3] Do the historical V1/V2 receipts sum to their total? — **ALL 14 EXACT.**
BigInt comparison on raw 6-decimal base units. **The audit said "six" — that is six SEATS;
there are fourteen purchase EVENTS (5 V1 + 3 V2a + 6 V2b) and all fourteen were checked.**
V1 ×5: 5.00 → 3.50/1.00/0.50 = **EXACT**. V2a ×3: 5.00 → 3.50/1.00/0.50, referral 0.00 =
**EXACT**. V2b: 25.00 ×4 → 17.50/5.00/2.50 and 5.00 ×2 → 3.50/1.00/0.50, referral 0.00 =
**EXACT**. tx hashes: `0x959bf5f6…` `0xeafd294d…` `0x74469baa…` `0xaf45e459…` `0xab4cc6b6…`
`0x46b38df9…` `0xa0acd4ff…` `0xb1e90d68…` `0xcfba3dcc…` `0xc0c7caf0…` `0x2eb7ade5…`
`0x4ff97e4b…` `0x5e25bf55…` `0x071529b3…`.
**V1/V2 are sealed and can accept no new purchase, so the set is closed and this is complete
verification.** Closes the audit's largest self-declared coverage gap, favourably.

### [Q4] Is the SourceRegistry struct transcription correct? — **YES, BOTH DIRECTIONS.**
Verified source fetched for the deployed registry. **Two structs, and the repo uses the right
one on each side.** READ — `sourceConfig()` returns `SourceRecord` = **14 fields**, matching
`chainReads.ts:87-102`, `introductionRefresh.ts:85-105` and `sale-abi.ts` field-for-field:
`sourceWallet · sourceClass · commissionBps · status · scope · startTime · endTime · grossCap ·
perBuyerCap · appliesToRepeatPurchases · payoutWallet · metadataHash · createdBy · updatedAt`
= **14/14 MATCH**. WRITE — `createSource` / `updateSourceTerms` take `SourceTerms` = **11
fields** (no `status`, no `createdBy`, no `updatedAt`), matching
`ProposeSourceCreate.tsx:99-113` = **11/11 MATCH**. `sourcePerformanceService.ts:44-45`
(`BPS_WORD_INDEX = 2`, `STATUS_WORD_INDEX = 3`) matches positions 2 and 3.
**The founder is signing against a correct ABI.**
**Registry state:** 8 sources, all ACTIVE, all 500 bps, scope 3, no caps, repeat enabled.
`owner()` = `0x88EC79AF…Dd73`. **`paused()` and `sourceCount()` BOTH REVERT — the functions
do not exist.**

### [Q-anchor] The external anchor for P0-1 — measured, exact on all three axes
V1 `totalUsdcRaised` 25.00 · V2A 15.00 · V2B 110.00 · V3 `totalGrossUsdc` 1260.00 ·
V3 `totalAcquisitionCost` 1.25 · V3 `totalProtocolContribution` 1258.75.
Indexed fold, 36 purchases, raw base units: vault `986125000` · liquidity `281750000` ·
operations `140875000` · payments `1250000` · gross `1410000000`.
**anchor net 1408.75 === folded legs · anchor gross 1410.00 === legs + payment · anchor
payment 1.25 === folded payment — all `true`.**

---

## G) CORRECTED PREMISES — each with what refutes it

| The premise | What refutes it |
|---|---|
| **"The server must NEVER emit a MEMBER address"** | **RETIRED 2026-08-02** under the 2026-07-25 ADDRESS LAW, stated in the code: `auth/router.ts:771-774` and `operator/router.ts:309-312` — *"the 40-hex fail-close scan was RETIRED… rows deliberately carry the full wallet + its explorer link"*. Member addresses are published full + Snowtrace on `/registry`, `/backbone/feed`, `/season` BY DESIGN. **The discipline that actually holds is OWN-ROW, and it is structural: `req.query` and `req.params` appear ZERO times in both the auth and operator routers** — a cross-member read is impossible, not merely unimplemented. `CANON_VISIBILITY_LAW.md:28,75-76` and `ADR-003:190` already recorded the rescope; `00_CANON_INDEX.md:35` and `SETTLED_RULES:94` still did not. |
| **"SourceRegistryV1 is PAUSED"** | **UNSTATEABLE, not merely stale.** `paused()` **REVERTS — the function does not exist on that contract.** There is no global pause to be in; per-source `status` is the only pause concept and all eight read ACTIVE. |
| **"The repo is private"** (orchestrator's own error) | **It is PUBLIC.** `raw.githubusercontent.com/duniterum/syndicate-os/main/.claude/launch.json` → **http=200**, unauthenticated. Inferred from a doc filename (`SLICE_2_19A_PRIVATE_REPO_FOUNDATION_VERIFICATION_REPORT.md`) — the exact "no inference from filenames" rule imposed on all fifteen agents. Consequence: Actions are free and unmetered; the cost question raised in the CI slice did not exist. |
| **"`release:gate` is the release gate"** | **It had never once run to completion on the founder's machine**, and could not have — two independent faults: `PORT=5173 BASE_PATH=/ pnpm run build` is POSIX inline env and pnpm runs scripts through cmd.exe on Windows; and Git Bash rewrites `BASE_PATH=/` into `C:/Program Files/Git/`, proven by the built `index.html` carrying `src="/Program Files/Git/assets/index-Ba1vzvI_.js"`. Fixed in `80210b4`. |
| **"guard-auth-zone passes"** | It passes **only where a `dist/` already exists**. `release:gate` ran the api guards BEFORE the build, so on a fresh checkout it failed: `FAIL studio dist/ not found`. Invisible locally because `dist/` persists. Fixed in `32b38e9`. |

---

## H) PRIOR-AUDIT REGRESSION — all 18 rows (section G of the original report)

| # | Prior item | Status | Evidence |
|---|---|---|---|
| 1 | Index `SourcePayoutEscrowed` | **STILL OPEN** | Repo-wide grep returns one hit — a comment saying it is indexed nowhere |
| 2 | The 3 older checkout refusals | **STILL OPEN** — founder decision | — |
| 3 | «Nothing to claim, ever» vs `claimSourceEscrow` | **STILL OPEN** — founder decision | — |
| 4 | The FIRSTS engine | **CANNOT DETERMINE** | Out of every agent's lane |
| 5 | `/join` opens on prose not prices | **CANNOT DETERMINE** | Needs rendered geometry; no rendering performed |
| 6 | member-ledger windowing | **STILL OPEN** | `GET /member-ledger` takes no pagination param |
| 7 | spine-poller dedupe | **CANNOT DETERMINE** | Not reached |
| 8 | The `&via=` twin | **FIXED — but the pattern re-emerged.** One home in `joinLink.ts`, verified matching server↔client; yet the server hand-assembles `/join?source=${sourceId}` at `joinCard.ts:101`, outside the studio's sweep |
| 9 | `/source` copied any pasted link | **FIXED** | Renders `/referral`; no builder from a pasted id |
| 10 | Escrowed commission reported as paid | **NOT FIXED — fixed at the aggregate, not the row.** Per-source subtraction landed; the per-row pill still says "Paid · Final" unconditionally, and the public total still sums pre-escrow |
| 11 | SPEC §⑤ ladder never struck | **FIXED in code** — no 5-rung fossil anywhere; survives only in the doc, already struck in the canon index |
| 12 | Public throttle cliff | **FIXED in `publicReadThrottle.ts` — and never propagated.** Its three siblings still carry the identical cliff |
| 13 | Two hand-typed rates | **PARTIALLY FIXED.** Buyer path clean and exemplary; a typed `?? 500` survives at `sourceStandingRead.ts:204` and the referrer's rate is still ladder-derived — **[P0-2]** |
| 14 | eslint blocking | **FIXED for studio; api-server has no eslint config at all** and its chain never invokes it |
| 15 | "Speed Up" skipping a member's request closure | **CANNOT DETERMINE** — not reached |
| 16 | Stale success line on two admin panels | **STILL OPEN** — *"Terms saved and audit-logged."* fires for toggles never sent (**[P1-05]**) |
| 17 | Hash format dispersion (5 places) | **STILL OPEN** — three short-address spellings, two incompatible |
| 18 | Guard debt: duplicate-facts regex narrow | **STILL OPEN and now measured** — structurally cannot match any number below 1,000,000 |

> ### ⛔ THE PATTERN, NAMED
> **Items 8, 10, 12 and 13 were each fixed at the INSTANCE and re-emerged at the PATTERN.**
> That is exactly what CLAUDE.md ① exists to prevent: the twin search was run on the symptom,
> not on the decision. It is the single most repeated failure in this repo's history, and it
> is why `guard-money-flow` ③ sweeps by DIRECTORY rather than by named file.

---

## I) THE ORCHESTRATOR'S OWN ERROR LEDGER — unsoftened

Recorded because an audit that lists only other people's mistakes is not an audit.

1. **Asserted the repository is private, and priced the founder's money against it.** Inferred
   from a doc *filename* — the exact discipline imposed on all fifteen agents. The repo is
   public; the cost question did not exist.
2. **Claimed run #2 of the CI gate would be green.** It was not, and neither was #3.
3. **Wrote a `useMemo` whose dependency array carried a counter the callback never read** —
   and, worse, whose body called `resolveJoinIntroduction`, which **writes to localStorage**:
   a side effect during render that React 18 double-invokes. CI caught the lint; the render
   write nobody had noticed.
4. **Built a CI annotation wrapper that lost the failure.** `tail -n 40` emitted 40 lines;
   GitHub caps annotations at 10 and keeps the FIRST — so the actual failing line was dropped
   and an entire run was wasted.
5. **An over-broad `sed` revert left `catch { confirmed = await validate(urlSource); }`** —
   the catch re-calling the validator, so a throw escaped into a fire-and-forget `void`.
   **The guard did not catch it**, because its confirm rows swallowed exceptions. Both closed.
6. **A `perl` revert then inverted the try/catch bodies entirely.** Found by reading the file,
   not by any check. No `sed`/`perl` on source after that.
7. **Hardcoded `125870000n` transcribed from a ROUNDED display (`125.88`) back into a
   calculation.** The totals looked clean and were wrong in the last cent. Caught on
   re-measurement; the archived figures come from the second pass, carrying raw base units
   end to end. **This is the same error class the audit exists to find, made while measuring it.**
8. **Claimed `_research/HANDOFF_ADVISOR.md` could be read.** It does not exist — not in the
   tree, not tracked, not in history. Refused to claim otherwise, but only after checking.

---

## J) WHAT WAS FOUND SOUND — the clean list, compressed

Authorization is the strongest area: all 13 operator endpoints run an identical
throttle→session→role chain; **zero `req.query`/`req.params` in the auth and operator
routers**; fail-closed on missing config; no HTTP bootstrap path to `founder_root`.
Wallet auth: signature recovered over the exact submitted string, case-insensitive compare,
domain/URI/chainId/statement all server-computed; 128-bit CSPRNG nonce consumed **atomically
before** signature recovery; session rotated at verify; `httpOnly + secure + SameSite=Strict`;
logout destroys the server record. Input/output: one `dangerouslySetInnerHTML` (tree-shaken,
zero importers); all SQL parameterized; both `:file` routes anchored-regex gated; no SSRF;
100% of input-taking endpoints validate before use. Secrets: **no secret has ever been
committed, at HEAD or in history** (`git log -S` across private-key headers, `sk_live_`,
`ghp_`, `AKIA`, JWT prefixes). Lockfile: zero drift, no git/tarball/`file:` resolutions, no
patched dependencies. Money: V3 splits sum exactly to the base unit, proven from bytecode;
flooring correctly confined to dashboards; honest absence genuinely implemented per
generation. Chain reads: no third party in the live path; cursors never regress; every
`onConflict` target has a matching unique constraint — **a re-run cannot double-count a
purchase (disproved)**; no caught error becomes a displayed zero (all 22 `catch` blocks in
`realityService` searched). Typecheck: **zero errors both packages, zero `any`, zero
`@ts-ignore`**. Continuity spine: one transaction, `FOR UPDATE`, explicit replay semantics,
in-transaction post-insert verification with rollback.

---

## K) REMEDIATION ORDER — founder-approved, reordered by the chain read

`0` chain read ✅ · **`1` [P0-3] attribution + inverted guard ✅ SEALED (`abee8f9`, 18th seal)** ·
**`2` [P1-09] CI gate ✅ (`b59f8ca`, `80210b4`, `32b38e9`)** · **`3` [P0-1] gross/net — IN
PROGRESS (`ded1596` enforcement; surfaces untouched)** · `4` [P1-01] reorg overlap — **moved UP**
· `5` [P0-2] derived rate — **moved DOWN, measured LATENT ([Q1])**.

**Why 5 moved down:** 0 of 8 sources mismatch; seven introductions of headroom.
**Why 4 moved up:** <s>the local index reported `status = complete` at block 91,942,617 while
head was 92,120,208 — **177,591 blocks behind, silently missing 8 purchases and 3 sources**,
invisible without comparing cursor to head by hand.</s>
⛔ **THIS EVIDENCE DOES NOT BELONG TO [P1-01] — corrected 2026-08-06, measured.** A 50-block
look-back governs a 50-block window; it cannot produce a 177,591-block gap. That number was a
runner that **had not run** — the LOCAL dev index (the note of the day said so: *"Local dev
index; prod's cursor was NOT read"*). **Proof it was staleness, not a missing overlap: during
P0-1 step 1 a single cycle inserted the 8 missing events and caught the index up to head with
NO code change.** A missing overlap is not curable by running the same code.
**The finding was real; its evidence was another cause's.** Both survive here, separated:
· **[P1-01]** — the tip window read once, ever. Real, cited at `saleEventIndexer.ts:397`,
  CLOSED by `SALE_REORG_OVERLAP = 50` with a lagging-node fixture proving the recovery.
· **[P1-17] (NEW, OPEN)** — `status = "complete"` means *"I reached the head I was handed
  this run"*, never *"I am at chain head"* (`saleEventIndexer.ts:485`:
  `status: lastScanned >= head ? "complete" : "idle"`). A lane that stopped reports `complete`
  forever. **Measured while writing this: the local index reads 92,147,964 / `complete`
  against a chain at 92,148,836.** It is nobody's finding now that P1-01 no longer owns its
  evidence — so it gets its own id. **Why it matters more than it did in August:** since the
  routed anchor went live, a short fold blanks four public money figures, and the first place
  anyone will look is the backbone status. It will say `complete` while a stopped cursor sits
  in plain sight. The honest fix compares cursor to CHAIN head, not to the head of the run.
