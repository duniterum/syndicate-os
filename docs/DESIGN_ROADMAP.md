# DESIGN_ROADMAP — chemin vers "full grade-AAA" (source unique du workstream design)

**Statut : vivant.** Claude Code coche les cases à la fin de chaque slice, dans le
même commit. **Tout le monde travaille depuis CE doc** — fondateur, Claude Code,
Claude-conseil, Replit. Personne ne part de son côté.

---

## Définition de "FINI" (grade-AAA, pas juste "construit")

Le design n'est "fini" que quand TOUT ceci est vrai :

- [ ] **Adoption** — chaque surface rend via le système (aucun composant orphelin).
- [x] **Couleur** — 0 couleur brute → guard `no-raw-color` **BLOQUANT** dans la gate.
- [x] **Typo** — l'échelle fluide `.type-*` adoptée partout (titres display/h1/h2/h3 sur toutes les surfaces, en Instrument Serif ; corps via `.type-body`).
- [x] **États** — chaque composant a survol / focus / désactivé / vide / erreur + a11y (atomes : Field default/focus/error/disabled ; DataTable vide/loading/hover + tri clavier ; Button/Input focus/disabled ; l'audit a11y profond WCAG/APCA = Phase 6).
- [ ] **Mouvement** — tokens de motion appliqués (jamais "plus tard").
- [ ] **2 modes** — clair "editorial museum" + sombre "command-room" vérifiés sur chaque surface.
- [ ] **Audits verts** — accessibilité (WCAG/APCA) · responsive · performance.

---

## Phases & statut

### Phase 1 — Fondation ✅ FAIT
- [x] Tokens 3 tiers · [x] Polices marque (Instrument Serif / Work Sans / IBM Plex Mono)
- [x] Échelles (type fluide · espace · élévation · z-index · motion · densité · data-viz)
- [x] Guard `no-raw-color` (report-only)

### Phase 2 — Atomes
- [x] Amount · [x] StatusPill · [x] Button + Tag · [x] StatCard
- [x] Table · [x] Field / Formulaire · [x] Prose (Docs/Whitepaper — livré slice 2.1) · [x] Icônes

### Phase 3 — Patterns
- [ ] Grille KPI (migration du héros ProtocolOverviewPanel) · [ ] Table CRUD
- [ ] Grille dashboard · [ ] Formulaire · [x] Page contenu (Prose atom → Whitepaper + Tokenomics + FAQ + Docs, slices 2.1–2.4)
- [x] **Chassis « living protocol »** (`src/components/living/`) : LivingSignature · TransparencyPosture · SectionIndex (+ `onSelect`/`activeId`, slice 2.3) · AllocationDonut · ReconciliationTable — réutilisés par whitepaper/tokenomics/FAQ/docs, à venir knowledge
- [x] **FaqAccordion** (`src/components/faq/`, slice 2.3) : recherche + filtre catégorie + accordéon accessible, tokens only (harvest structure Supa, contenu doctrine-parfait sans chiffre)
- [x] **Docs hub** (`src/pages/Docs.tsx` + `src/content/docs-content.ts`, slice 2.4) : journey spine + cartes groupées, **statut dérivé du registre** (Ready/Pending, jamais codé en dur), tags audience éditoriaux, routes réelles only, sans chiffre — header « Docs » repointé vers `/docs`, `/learning` reste « Learn » (footer + lié depuis `/docs`)
- [x] **MembersProvenance + freshness guard** (`components/living/MembersProvenance.tsx` + `scripts/guard-freshness.ts`, slice ⓪) : le chiffre membre est le `memberCount()` **LIVE (continu)** sous la signature live (corrige un over-claim en prod) ; ligne dual-autorité (8 freeze/root + N V3-emitted) + **divergence snapshot obligatoire** ; guard BLOQUANT (pas de signature-live décorative ; tout chiffre-membre live porte sa provenance snapshot). Tokens only. `/docs` : `LivingSignature` retirée (rien de live sur la page).
- [x] **Header member sign-in** (`wallet/MemberHeaderAffordance.tsx` + `PublicLayout.tsx`, Q11-v2) : réutilise le **pattern admin une-modale** (`OperatorSignInAction`/`OperatorBadge`) — `openConnectModal()` connect+SIWE, standing résolu **en place** (`SESSION_CHANGED_EVENT`/`fetchMemberStanding`) : visiteur→« Member sign-in » · S4+siège→« Member · seat #N » · S4-sans-siège honnête. **Auth-gated** (lazy, caché tant que dark ; s'allume au flip du flag). `/member` : lien **verify-it-yourself** (`VerifyOnChain membershipSaleV3`, moteur réel, pas d'ornement). Tokens only, **+0 couleur** ; rule-15 respectée (import dynamique).
- [x] **Checkout `/join` — C1.1 (amounts + quote core)** (`pages/JoinProtocol.tsx` + `lib/checkoutVocabulary.ts` + `config/joinAmounts.ts`) : rangée de montants `PURCHASE_PRESETS_USDC` **AMONT SEUL** (aucun nom/badge/tier — le siège est binaire) + montant libre réutilisé + devis humain (ce que tu paies · ce que tu reçois = SYN + **taux d'era LIVE**, jamais un chiffre SYN figé sur une carte · « Seat #N si tu signes » = preview, le vrai numéro vient du reçu · plancher de glissement `minSynOut`) + états honnêtes (`failureReason` moteur) + raw base-units en `<details>`. Décodeur d'edge (`acquisitionCost→sourcePaymentRaw`, `protocolContribution→netProtocolRaw`, une seule fois). **Mouvement** : `transition-colors` sur les puces + `animate-in fade-in` au dévoilement du devis. **Adoption** : réutilise `Card`/`Button`/`Input` + le câblage `useGetJoinQuote`/`?source=` existant, 0 composant orphelin. **2 modes** : **tokens only, +0 couleur brute** (2-mode par construction) — vérification visuelle clair/sombre **déférée au preview Replit** (l'env dev local Windows n'a pas pu servir : pnpm hors PATH + mangle MSYS + jobs background non persistants ; règle : Replit=vérité runtime). Routing (source + 70/20/10 + preuves), garde historique, preuve économique = C1.2–C1.4.
- [x] **Checkout `/join` — C1.2a (le chemin de l'argent, cas par défaut)** (`pages/JoinProtocol.tsx` `MoneyPath`/`AddressProof` + `checkoutVocabulary.computeRoutingSplit` + serveur `verifyLinks`/`FINANCIAL_TARGETS` `liquidityWallet` + `sale-routing:reconcile`) : « Sent to the Syndicate » (net) + split **70/20/10 client-calculé du netProtocolRaw** (BigInt, remainder comme le contrat) vers Vault/Liquidity/Operations, **chaque ligne = montant + adresse tronquée + lien de preuve explorer** (adresses server-sourced via verify-links infra-only ; **jamais l'adresse de l'acheteur** ; exception recipient-gifting notée = C1.2b/C4). **All-or-nothing sur les preuves** : aucun montant sans destination vérifiable. 🔴 **CHAIN = AUTORITÉ** : `liquidityWallet` n'est PAS ajouté depuis un fichier — les 3 immutables `VAULT/LIQUIDITY/OPERATIONS` sont **lus du contrat déployé et réconciliés** (script `sale-routing:reconcile`, tous MATCH 2026-07-12) ; guard offline étendu (`liquidityWallet == CONTRACTS.LIQUIDITY_WALLET`). openapi enum + orval regen. **2 modes** : tokens only, +0 couleur (vérif visuelle = Replit). La ligne source (adresse + taux via lecture client `sourceConfig`) = C1.2b.

### Phase 4 — Harmonisation totale (le "rien à moitié")
- [x] Finir migration couleur (108 → 0) → guard **BLOQUANT** · [x] Adopter `.type-*` partout (titres, ~17 pages, serif)
- [ ] Mouvement · [x] États complets sur tous les composants · [ ] Vérifier les 2 modes

### Phase 5 — Surfaces (adoption)
- [ ] Public · [ ] Dashboards (connecté / membre) · [ ] Console admin
- [ ] Contenu (Docs / Whitepaper / FAQ)
- [x] **`/join` checkout (C1.1→C1.4)** — rend via le système (tokens only, 0 couleur brute),
  motion tokens (`animate-in fade-in`), 2 modes vérifiés sur la surface ; quote · money path ·
  gate historique · économie honnête. *(Les cases globales Mouvement/2 modes/Adoption restent
  ouvertes — elles exigent TOUTES les surfaces.)*
- [x] **Hero home — M1-a (le premier acte)** (`PublicHome.tsx` colonne gauche +
  `hero/HeroStatusChips.tsx` + `hero/HeroSeatLine.tsx` + `syndicateFacts.heroSystem`) :
  le langage design de l'origine récolté (jamais ses contraintes — LIVE PRODUCTION) :
  ① chips LIVE/PENDING honnêtes (2 rangées desktop / pilule compacte mobile) ·
  ② headline éditorial registre CONVERSION + verify path (`membershipSaleV3`) ·
  ③ l'OS en 3 phrases humaines (les chips muets morts) · ④ la ligne de siège VIVANTE
  (« N seats on-chain · the next seat is #N+1 — open now », fail-closed, parle en
  SIÈGES, + `MembersProvenance` compact exigé par guard-freshness) · ⑤ le CTA siège
  session-aware EXISTANT (une seule priorité visuelle — le bouton secondaire retiré) ·
  ⑥ le rail Inspect calme (Verify · Registry · Token · Liquidity). **Tokens only,
  +0 couleur brute** ; mobile IN-slice vérifié (375px, pilule compacte, 0 overflow).
  Trône/map/panneaux intouchés (M1-b).
- [x] **Hero home — M1-b (la carte vivante)** (`SeatFlowDiagram.tsx` + `heroIconLanguage.ts`
  + `ProtocolOverviewPanel.tsx` + `HeroLedger.tsx` + `LiveReadTag.tsx` + serveur
  `realityService.ts`) : le sweep vérité — « LIVE · READ-ONLY » MORT partout (→ « Live
  chain read ») ; LOI STRUCTURELLE : chaque sous-label de nœud DÉRIVÉ du statut réel
  (resolver sur les reads live + le registre chronicle) ; « Paid to referrers » LIVE
  (0.75 USDC, item spine `financial.referral.paidToReferrersTotal`, modèle-M0-préféré) —
  la note d'excuse morte ; nœud Proof of Burn AJOUTÉ (comble l'orbite vide, porte
  /fire-ledger) ; PORTES sur 6 nœuds (/join /chronicle /archive /liquidity /referral
  /fire-ledger) ; mini-feed live dans le panneau (le « Coming » mort — lexique §8 partagé,
  fail-closed) ; « Members » → « Seats » (loi sièges) ; carte « Awaiting Wiring » +
  « Radical Honesty » réécrites à la vérité du jour ; UN langage d'icônes (goutte d'eau
  morte → Coins ; Briefcase ops ; ScrollText chronicle ; Gem NFT). **Tokens only, +0
  couleur brute** ; mobile IN-slice : les nœuds = grille de chips cliquables sous la
  carte (375px, 0 overflow) ; 10 nœuds, 0 collision (rééquilibrage orbites : future →
  haut-droit).
- [x] **Header + Footer — M1-c (la finition)** (`PublicLayout.tsx` + `brand.ts` +
  `guard-nav-link-display.ts` NOUVEAU) : LA BARRE VERTICALE RÉCURRENTE MORTE À LA RACINE —
  cause : `<Link>` wouter = `<a>` inline ; inline + padding + enfant block = peinture
  fragmentée (hover/focus en lamelles verticales ; cyan avant `8221b06` qui n'a fait que
  recolorer). Fix : display explicite à la source (nav header + rail Inspect M1-a +
  /liquidity) + `focus-visible:` ; ÉPINGLÉ par la nouvelle garde (tout `<Link>`/`<a>` avec
  padding sans display = build rouge, repo entier). Header harmonisé : tooltips
  read-only-era morts ; pilules AVALANCHE/LIVE DÉRIVÉES du spine (fail-closed) ; badge
  CH #001 depuis LA config chapitre ; trigger mobile 44px ; anneaux focus-visible or
  (sheet, footer, social). Footer : « Read-only foundation shell. » mort → la ligne
  live-production « don't trust, verify ». Responsive vérifié 375/768/1440 × 2 thèmes.

- [x] **Member Home — S7 (la recomposition wireframe, 2026-07-16)** (`pages/MemberAccess.tsx`
  réécrit + `wallet/MemberYourSeat.tsx` héros + `lib/capitalStanding.ts` + serveur
  `routes/capitalStanding.ts` + `capitalAxisReadmodel.standingBySeat`) : le wireframe
  fondateur-approuvé réalisé — DEUX ÉTATS : visiteur = **bande d'accès** (une phrase
  humaine, **UN SEUL CTA connect** RainbowKit, locale épinglée en) · membre = **héros
  Your Seat** (sigil 72px · Member #N en h1 · Seat Held · **échelon capital** titre-seul
  depuis la marche canon serveur, fail-closed · chapitre · SYN · reçu · enseignement
  verify `memberNumberOf`). La bande morte MORTE (l'en-tête générique + badge machine +
  long intro) ; le JARGON TOMBÉ (les 6 onglets-facettes et la table 6 étapes
  Holder-Index/PENDING_ADAPTER — qui mentaient contre le protocole vivant — retirés ;
  3 étapes humaines pour le visiteur) ; le panneau session RETIRÉ (sa doctrine
  d'honnêteté verbatim re-épinglée dans la copie de la bande, guard §16 adapté).
  + **PLEIN ÉCRAN** (ordre fondateur au gate 2026-07-16) : le premier viewport EST la
  scène (`min-h-[calc(100svh-3.75rem)]` desktop · 65svh mobile, contenu centré — §4
  respecté). + **LE BALAYAGE VÉRITÉ LIVE-vs-PAS-LIVE** (ordre fondateur, même gate —
  la réalité du protocole, jamais le texte) : la bannière referral « no figure here is
  live yet » MORTE (l'indexeur R5 est VIVANT) · badge « Not live yet » sur la standing
  déconnectée → « Sign in required » (AUTH_REQUIRED — un état de session, pas un
  mensonge de vie) · les 3 blocs SAMPLE (résumé/tendance/historique à dollars inventés)
  MORTS — remplacés par la carte honnête « Per-introduction receipts » (la seule pièce
  vraiment non servie) · ShareCard DEVENUE RÉELLE (chiffres own-row R5 + vrai lien
  dérivé ; le swap promis « à l'activation » enfin fait) · porte Archive → « Open
  today » (17 mints vivants) · slot away → FUTURE (le record est vivant, la surface
  non) · modules /member /proof /referral /archive : les badges « Not live yet /
  Not switched on yet » MORTS (précédent /join : une surface vivante ne porte AUCUN
  TruthLabel) · /archive page badge → « Verified — view only » · `protocolSurfaces`
  (config mort porteur des mensonges) SUPPRIMÉ · `surfaceStatus` : 4 clés RETIRÉES DU
  RENDU avec note datée · hooks standing/actions : re-lecture sur session-changed (la
  page se résout EN PLACE après connexion, zéro reload).
  **Tokens only, +0 couleur brute** ; rig vérifié DOM-level : 2 thèmes · 375/desktop ·
  0 débordement · images chargées · les deux états exercés (intercept debug, nettoyé) ·
  zéro sample servi · bande = plein écran mesuré (660/661px).

### Phase 6 — Audits (le sceau grade-AAA)
- [ ] Accessibilité (WCAG AA / APCA, focus, clavier, cibles ≥44px)
- [ ] Responsive (fluide, container queries, 320 → 2560, pliables)
- [ ] Performance (polices auto-hébergées, Core Web Vitals, images AVIF/WebP)

---

## Ligne d'arrivée

Design **100 % fini, verrouillé** = toutes les cases de "Définition de FINI" cochées
→ **on n'y revient plus jamais.**

## Suivi couleur — ✅ FERMÉ
Sprawl : **0** couleur brute (slice 2.3 FAQ : **+0** · slice 2.4 Docs : **+0** · slice ⓪ liveness : **+0** — MembersProvenance 100 % tokens · arc Member Home 2026-07-14 : MEMBER SHELL **+0** · slice A actions/lien/Guide **+0** · slice B pill/settings **+0** · slice C teasers (TeaserSurface + 3 pages) **+0** · slice D wallet/toolkit **+0** · arc harvest L-1 /liquidity **+0** · ACT-1 feed (LiveActivityFeed + 2 pages live) **+0** · CHR-1 chronicle (register + panneau console) **+0** · M1-a hero premier acte (HeroStatusChips + HeroSeatLine + rail Inspect) **+0** · M1-b carte vivante (heroIconLanguage + nœud burn + mini-feed) **+0** · M1-c header/footer (barre récurrente morte à la racine + garde `guard-nav-link-display` + pilules dérivées) **+0** · S7 member home (bande d'accès + héros Your Seat + pilule échelon) **+0** — tout en tokens). Guard
`no-raw-color` **BLOQUANT** dans la gate (`pnpm guards`), toute nouvelle couleur brute casse le
build. Du pic de **137 sites** → **0** au fil des slices d'harmonisation.
Une seule exception documentée : `QrCodeBlock` (fond blanc du canvas QR, requis pour la lisibilité),
taguée `no-raw-color-allow`. Le token layer (`index.css`) reste la seule source de couleur brute légitime.

## Gouvernance (comment on reste aligné)
- Ce doc est la **source unique** du workstream design.
- **Claude Code met à jour ce fichier (coche les cases) à la fin de chaque slice**, dans le même commit — pas d'état "dans la tête".
- Référencé dans `CANON_INDEX` (Tier 1) + `CLAUDE.md` → **chaque session boote dessus.**
