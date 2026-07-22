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
- [ ] Public · [ ] Dashboards (connecté / membre) · [x] Console admin (arc K3 + composition console, 2026-07-22)
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

- [x] **Member Home — S7-b LE TABLEAU DE BORD MEMBRE (2026-07-16, direction artistique
  fondateur au sceau S7 : captures prod + référence QuickNode ; recherche best-practices
  F-pattern/KPI/grille 12 col)** (`MemberAccess.tsx` bifurqué porte/dashboard +
  `wallet/MemberYourSeat.tsx` → bandeau d'identité compact + `wallet/MemberKpiRow.tsx`
  NOUVEAU + `wallet/ownReads.ts` hooks partagés + `components/member/MemberPulse.tsx`
  NOUVEAU (lexique §8 réutilisé) + `MemberShell` puces mobiles) : l'état CONNECTÉ devient
  un vrai tableau de bord pleine largeur (max-w-7xl) — zone 1 bandeau d'identité (sigil ·
  Member #N · échelon · reçu-puce + verify) · zone 2 les 4 tuiles KPI vivantes (SYN ·
  introductions durables · commission payée · escrow — chaque chiffre avec provenance,
  tiret honnête sinon) · zone 3 grille de travail (referral 2/3 + slots réservés 1/3) ·
  zone 4 le pouls du protocole (5 lignes §8 + porte /activity ; My|Protocol y atterrira
  avec A1) · zone 5 verify + settings + expectations. La carte-héros flottant dans le
  vide MORTE ; les quick-actions dupliquées = visiteur-seul (conversion). DEUX DÉFAUTS
  des captures fondateur tués : le badge « Sign in required » menti à un membre connecté
  sans source (3 états distincts maintenant) · le badge Notifications chevauchant son
  texte (Row flex-wrap + FUTURE honnête). Portes mobiles = rangée de puces défilante
  (le contenu n'est plus poussé d'un écran). Le guard nav-link-display a attrapé la
  puce sans display (la classe du bug barre-verticale) — corrigé inline-flex.
  **Tokens only, +0 couleur brute** ; rig vérifié : porte visiteur INTACTE (plein écran
  centré) · dashboard exercé (cas réel fondateur : genesis sans échelon ni source —
  tout honnête) · 2 thèmes · 375 (puces + KPI 2×2 + bandeau à 123px du haut) · 0
  débordement · intercept nettoyé.
  + **LA RÈGLE D'AFFICHAGE OWN-ACCOUNT RÉGLÉE UNE FOIS POUR TOUTES** (fondateur,
  2026-07-16, gravée dans GAMIFICATION_LEGAL_DOCTRINE — « The Syndicate recognizes
  capital without reducing identity to capital ») : surfaces publiques = anti-rareté
  intact (le flux ne porte jamais le montant) · LE COMPTE DU MEMBRE = le pattern
  Sephora/Marriott (recherche + SPEC §⑨) : son cumul, son échelon, l'échelle entière,
  le PROCHAIN échelon + progression honnête — la ligne-bouclier toujours à côté
  (« never a better SYN price », guard-pinnée). Réalisé : `CapitalAxisCard` (colonne
  droite zone 3 — $cumulés + Next: X at $Y + barre + les 12 échelons en dévoilement
  progressif) · route capital-standing étendue (cumulativeUsdcRaw + ladder + nextRung ;
  pin backbone amendé daté) · porte **Settings** ajoutée au menu (manquait — vu
  fondateur). Rig : Seat #14 → $5.00 · Next Resident at $10 · barre 50 % exacte ·
  12 rangs · bouclier rendu.
  + **L'ATTERRISSAGE APRÈS-LOGIN RE-ORDONNÉ AU STANDARD MONDIAL** (fondateur au gate,
  recherche Binance/Coinbase/Crypto.com : portefeuille D'ABORD, activité récente,
  état système/annonces — jamais un programme en tête) : KPI v2 = **Your SYN · Your
  USDC (nouveau hook, USDC() du moteur) · Your footprint ($cum · échelon) ·
  Introductions** ; colonne gauche : **le pouls MÈNE**, le referral suit (ancre
  intacte) ; colonne droite tirée des portes : carte capital · **« The protocol
  today »** (5 faits vivants du spine : sièges + provenance double-autorité
  guard-exigée MembersProvenance compact · brûlé · réserves pool · mints · payé aux
  référents, « verify → ») · **« The Chronicle »** dernière entrée du registre
  (l'analogue annonces) · slots. Conteneur élargi max-w-screen-2xl (les marges mortes
  des flèches fondateur). guard-freshness a exigé la provenance sur le chiffre-membres
  — servi. Rig : spine RÉEL rendu (14 sièges · 24 606 SYN · pool 2 678,77/55,78 ·
  17 mints) · « The ladder decision » en tête de Chronicle · pouls avant referral ·
  375 propre (l'alerte débordement = pane effondré à 0px, prouvé artefact).

- [x] **LE PLANCHER DE LISIBILITÉ — S7-c (fondateur, 2026-07-16 ; gravé ADR-001
  amendement ; recherché WCAG/A11Y Collective/WebAIM/Section508)** : copie de lecture
  ≥ 14px `leading-relaxed` · étiquettes/méta ≥ 12px · corps prose 16px+ · valeurs
  KPI ≥ 18px (20px livré) · titres de cartes 16px · **RIEN sous 12px** — les classes
  `text-[9-11px]` interdites aux nouvelles surfaces. APPLIQUÉ : toute la composition
  /member (10 fichiers, mesuré au rig : **0 élément sous 12px** dans les DEUX états)
  + LE NIVEAU TOKEN (la vraie correction système) : `.syn-eyebrow/.syn-label/
  .syn-caption` 11/10/9px → 12px · `--text-caption` 11px → 12px · VerifyOnChain
  9px → 12px · MembersProvenance 10px → 12px — les atomes partagés montent partout
  (home 1440 + 375 vérifiées : zéro débordement, images OK). RESTE (tranche sweep
  générale, notée ADR-001) : ~121 micro-classes arbitraires sur la home + autres
  pages + le futur guard `no-sub-12px-text`.
- [x] **LA RÈGLE DE LA SURFACE FLUIDE — S7-d (fondateur, 2026-07-16 ; gravée ADR-001
  bis ; recherchée UXPin/Polypane/MDN/HIG-Material)** : surfaces applicatives =
  **FLUIDES pleine largeur** (jamais de cap ; gouttières `px-4/6/8` ; la lisibilité
  est bornée par les cartes) · prose = cap 1200–1440 (loi hybride inchangée) ·
  **`viewport-fit=cover` + safe-areas `env()`** sur le body (encoches iOS/Android) ·
  **`maximum-scale=1` SUPPRIMÉ** (bloquait le zoom — violation WCAG 1.4.4 attrapée
  et corrigée) · `svh`/`dvh` jamais `vh` nu · **cibles tactiles ≥ 44px** (puces
  portes mobiles : 44px mesurés). Dashboard membre mesuré bord à bord à 1920 ·
  375 propre · test standard 320→2560 engravé.

- [x] **S7-e — LE PASSAGE HUMAIN-LISIBLE (2026-07-16, les 18 défauts confirmés par
  l'audit total ultracode — `docs/audits/MEMBER_HOME_TOTAL_AUDIT_2026-07-16.md`)** :
  `formatRawUnitsDisplay` (TRONQUÉ — l'argent ne surestime jamais : 6,260.06 SYN ·
  2.99 USDC ; KPI + /wallet + checkout ; approbations restent exactes) · 9 sites de
  jargon réécrits Human-First (memberNumberOf en parenthèses, « fail-closed » jamais
  à l'acheteur, diagnostics serveur humanisés + raison exacte en tooltip, ligne
  d'échelle en anglais courant) · **login header → atterrit sur /member** (2 points
  de succès) · cloche era-drift guérie · menu header au plancher 12px · bloc
  formaté. **+0 couleur brute** ; rig : toutes les chaînes rendues, ancien jargon à
  zéro, 2 guards suites vertes.
- [x] **RECEIPT — LE TICKET DU PROTOCOLE (2026-07-16/17, wireframe approuvé +
  4 rounds de corrections fondateur ①–⑫)** : spine `protocolCommerceReceipt`
  extensible par kind, né UNIQUEMENT d'événements confirmés (filtre Mirror),
  chiffres = les champs de l'événement (no-recompute), montants EXACTS qui
  somment ; couverture historique QUATRE MOTEURS (V1 `TokensPurchased` ·
  V2a/V2b `Purchased`+`Routed` apparié · V3) avec l'ABSENCE HONNÊTE typée ;
  surface `ReceiptTicket` zones A–G (marque or au fronton · bloc commerce
  TOTAL PAID · bloc preuve WHERE YOUR MONEY WENT · doctrine droite pleine
  encre filet or · QR verify · UNE porte d'état réel) ; dégradation gracieuse
  (repli pleine largeur, jamais tronqué/rétréci) ; export pur (Save-image =
  le papier seul · print-clean Save-as-PDF) ; le partage porte le lien du
  membre via LE résolveur (Ruling ①) ; placement checkout-success (l'impasse
  post-achat est morte) ; `guard-receipt-ticket` **63 pins** (ligne rouge ·
  anti-rareté · une-porte-max · ordinal · no-recompute · REAL-ROW classe ·
  pureté d'export · quatre-moteurs précis · lisibilité). **+0 couleur brute** ;
  rig : 5 tickets DOM-vérifiés (réel #13 · GENESIS V1 · V2a #3 · 2 stress),
  2 thèmes, 375+desktop, zéro overflow. Placements binder/porte Receipts →
  A1 ; share-card 1200×630 → rider ; `/receipt/{txHash}` → roadmap gravée.
- [x] **RECEIPT-SHARE — LA CARTE DE PARTAGE (2026-07-17, GO fondateur sur le
  rendu)** : `ReceiptShareCard` 1200×630 (1.91:1, zone sûre 90px, ~130KB —
  plafond 300KB à paliers pinné), **TOTAL PAID + la ligne de preuve complète
  VISIBLES** (Loi de Visibilité TIER-0 — l'engravure §6 RECEIPT &
  OUTWARD-ARTIFACT dans SETTLED_RULES, appliquée par les pins amounts-visible
  + canon-presence), le QR = le lien d'introduction du membre (prop depuis
  l'unique site résolveur), rastérisation maison (override static-position —
  le clone hors-viewport rendait blanc, attrapé au pixel) ; Share = carte +
  texte (fichiers natifs quand supportés, repli téléchargement + copie) ;
  print/PDF toujours le papier seul. **+0 couleur brute** ; guard receipt
  **83 pins** ; rig : les deux thèmes inspectés au pixel.
- [x] **② MENU — LE MENU MEMBRE APPROUVÉ (2026-07-17, wireframe GO fondateur
  2026-07-16 §2)** : les 13 rangées en QUATRE groupes (Member : 5 primaires +
  Receipts visible-verrouillé « Coming later » badge existant · The record ·
  Growth — le nom reste, navigation jamais promesse · Off-chain comfort :
  Settings épinglé DERNIER, séparé) ; icône lucide par porte (la table
  approuvée) ; état actif = teinte gold/10 + **barre gauche 2px persistante**
  + graisse 600 + icône or — forme ET couleur, jamais couleur seule (WCAG
  1.4.1) + `aria-current="page"` ; hover = teinte border/45 ; focus clavier =
  anneau or visible ; titre de groupe au plancher 12px (ADR-001 > le 11px de
  la maquette). LES CORRECTIFS AUDIT QUI HABITENT CES FICHIERS : ① la classe
  clic-mort des portes hash MORTE (`RouteScrollManager` lit pathname+hash via
  `useLocationProperty` — le pushState de wouter n'émet aucun hashchange —
  + boucle de retry ~5s pour les cibles à montage tardif type #settings,
  annulée à l'input utilisateur : molette · toucher · touche · pointeur
  (scrollbar native Firefox = résiduel accepté, documenté) ; minuterie,
  jamais rAF — rig-prouvé : rAF ne tire jamais dans un onglet caché) ;
  ② `aria-current` sur portes ET puces ; ③ les alphas /70 muted-foreground
  du shell purgés (contraste thème clair). Étiquette « Referral dashboard »
  → « Referral » (la maquette). LA PASSE ADVERSARIALE PRÉ-COMMIT (ultracode
  3 lentilles + réfutation, 11 confirmés corrigés · 5 réfutés) : re-clic
  sur la porte déjà active = re-scroll vers sa section sans entrée
  d'historique dupliquée (rig-prouvé fenêtre morte : 1548px pile) · la
  boucle RE-CORRIGE la dérive pendant sa fenêtre (le contenu lazy au-dessus
  de la cible pousse l'ancre ; Safari n'a pas de scroll anchoring) · la puce
  mobile inerte Receipts porte SON badge « Coming later » (un tap mort doit
  dire pourquoi — la rangée de puces est le SEUL menu mobile) · le guard
  durci contre son propre faux-vert (une porte sans icône comptait 0 rangée ;
  pins ancrés aux formes de CODE, plus jamais satisfaits par un commentaire ;
  bans élargis px/rem + tout alpha). `guard-member-menu` **34 pins**.
  **+0 couleur brute** ; rig : 13 rangées DOM-vérifiées, actif/inactif
  mesurés (barre 2px or, 600, aria-current), les deux thèmes au niveau calculé
  (l'or clair #C3861D flippe), 375 = 13 puces à 44px zéro débordement, scroll
  hash bout-en-bout (cible à 80px pile), images OK, zéro erreur console de la
  slice (l'avertissement ConnectModal/Hydrate de /wallet = pré-existant,
  prouvé à HEAD par stash, tâche séparée notée). Rider rig Windows :
  `dev:rig` api-server (le `export` POSIX ne tourne pas sous cmd) +
  launch.json pointé dessus.

- [x] **③ HOME — LA RECOMPOSITION APPROUVÉE (2026-07-17, wireframe GO
  fondateur 2026-07-16 §3 zones Z1–Z8 ; le scellé reste scellé)** : Z2 la
  rangée KPI 4→6 (Receipts = ses propres lignes D3, [] servi = VRAI zéro ·
  Artifacts = ses soldes Archive ERC-1155 sommés) · Z3 `MemberAttention`
  (0–2 cartes d'ÉTAT RÉEL seul : promotion due own-row + approbation USDC
  ouverte lue en direct, ≥1 G$ dit « effectivement illimitée » jamais 72
  chiffres ; le verdict fondateur honoré — session-expiring mort,
  milestone-témoin PAS lisible aujourd'hui donc honnêtement absent ; la
  ligne calme approuvée VERBATIM, rendue SEULEMENT quand chaque classe a
  répondu — l'overclaim tué) · Z4 `MemberRecentActivity` (5 derniers achats
  propres, montant exact usdFromRaw · moteur · verify ↗ par ligne ;
  View-receipt/binder ABSENTS — ils montent avec A1) · Z5 le pouls SOUS le
  travail propre · Z8 `MemberDoorsGrid` (les portes en cartes groupées
  depuis LA config + LA table d'icônes exportée — ne peut jamais diverger
  du menu ; garde same-URL). Porte visiteur INTOUCHÉE. LA PASSE
  ADVERSARIALE PRÉ-COMMIT (15 confirmés corrigés · 3 réfutés) : le passé
  « printed its ticket » fabriquait l'histoire des achats pré-reçu → temps
  présent pinné · la ligne calme pouvait sur-affirmer une classe illisible
  → machine d'états de lisibilité · les fetchs échoués tournaient
  « Reading… » à jamais → wrappers settled · le guard scannait les DEUX
  compositions (faux vert) → région-scopé + strip-commentaires bilatéral.
  `guard-member-home` **30 pins**. **+0 couleur brute** ; rig : ordre Z
  exact, 6 tuiles, 13 cartes-portes, états fail-closed honnêtes partout,
  375 zéro débordement (le seul sous-12px = l'atome partagé LifecycleBadge,
  vague P2). GO fondateur au gate preview (2026-07-17).

- [x] **R-BIND — LE CLASSEUR DE REÇUS (2026-07-19, ordre fondateur « tous les
  reçus, le ticket partout » ; GO au gate preview)** : la porte Receipts du
  menu VIVANTE (verrouillée→vive, les 2 pins §3 du guard basculés même
  commit) ; `/receipts` = le registre (lignes groupées par mois · date ·
  Seat #N · moteur · TOTAL exact or · chevron) où chaque ligne s'ouvre SUR
  PLACE en VRAI `ReceiptTicket` (une colonne vertébrale, un seul chemin de
  rendu — le classeur MONTE le ticket, ne le réimplémente jamais) ; le
  PLIAGE V2 gravé « rides the binder slice » LIVRÉ (Purchased+Routed même
  transaction) ; V1 genesis via le roster gelé ; l'absence honnête partout
  (V2B sentinelle → repli + preuve) ; rachat d'un membre assis = étiquette
  « · footprint » depuis le drapeau de l'événement (jamais un second siège) ;
  lien profond `?tx=` (la ligne de l'accueil ouvre SON ticket) ; placements
  A1 ②③ montés : Z4 lignes → « receipt » + la tuile Receipts devenue porte
  + « Open ticket » sur le panneau de siège. Serveur : faits de reçu own-row
  (2 listes blanches amendées délibérément, datées), décimales servies
  canon. `guard-receipt-ticket` **94 pins** (le panneau couvert) ·
  member-menu 35 · member-home 27. **+0 couleur brute** ; rig : ticket
  complet DOM-vérifié (7 zones · sceau chargé · QR puce blanche · 2 thèmes ·
  375 sans débordement · zéro erreur console). Les notes « Coming later » /
  « View-receipt ABSENTS » des entrées ② MENU et ③ HOME ci-dessus sont
  SUPERSÉDÉES par cette entrée.

- [x] **R-BIND-2 — LE RAIL DE TICKETS + LE DOUBLE PARTAGE (2026-07-19, idée
  fondateur « 4-5 tickets ouverts côte à côte, pense pour le futur » ;
  maquette approuvée « J'APPROUVE — GO AND GO-LIVE »)** : l'étagère PLAFONNÉE
  à 5 — les reçus les plus récents OUVERTS, du plus neuf au plus ancien
  (jamais un 6e monté ; l'archive absorbe les centaines) ; desktop rangée
  statique → rail seulement au débordement (flèches paires toujours
  visibles) ; mobile UN ticket par écran, snap, ~20px de VRAI papier du
  suivant qui dépasse, compteur « n of 5 » + boutons SOUS le rail ; N=1 =
  document centré ZÉRO chrome ; passerelle « All receipts (N) ↓ » vers
  l'archive ; content-visibility sur les tickets hors-écran ; sémantique
  carrousel complète (region + groupes nommés + reduced-motion). LE DOUBLE
  PARTAGE sur chaque ticket : Copy link EN PREMIER (état Copied) → les 6
  réseaux (X · WhatsApp · Telegram · LinkedIn · Facebook · Email — les
  intentions de `shareTargets` réutilisées, réordonnées au rendu) →
  **« Share with other apps »** (la feuille native gardée, renommée du
  libellé sanctionné par Google ; détectée — cachée où elle n'existe pas,
  jamais un bouton mort ; le SEUL canal qui porte l'image) + le correctif
  canShare (texte-seul tenté avant le repli). Le plancher 12px a attrapé un
  sous-titre 11px — corrigé. `guard-receipt-ticket` 94/94 · **+0 couleur
  brute** ; rig : étagère cap-5 prouvée à 6 lignes · N=1 zéro-chrome ·
  peek 20px mesuré · ordre des réseaux exact · zéro erreur console.

- [x] **R-BIND-3 — FINITIONS DU CLASSEUR (2026-07-19)** : clip du rail
  corrigé sur écran large · remise à zéro du scroll site-wide à la
  navigation · clic-porte exact-match corrigé. A aussi scopé `/receipt/{tx}`
  ENTIER comme la prochaine slice reçus (le correctif racine du Copy-link).
  **+0 couleur brute**.

- [x] **R-PAGE — /receipt/{txHash}, L'ADRESSE PUBLIQUE PERMANENTE DE CHAQUE
  REÇU (2026-07-20, wireframe approuvé fondateur « ok for mee » ; Q44 scellé
  entier)** : la PREMIÈRE route paramétrée de l'app — classe registre
  (`paramTailPattern` + `matchRoute` param-aware) → générateur
  (`paramRoutes.generated.json`) → `serve.mjs` étape 3b (seul un hash 64-hex
  bien formé sert le shell `receipt.html` ; tout autre `/receipt/*` = VRAI
  404 — l'invariant no-SPA-fallback tient) → prerender un-seul-shell (le
  crash Windows « : » évité) ; lecture serveur publique
  `GET /api/receipt/{txHash}` (projection tx-keyed du même read-model,
  discipline capitalStanding, gates de fuite boundary-aware) ; la page :
  barre de verdict « Sealed on-chain » + LE ticket 7 zones (né dans le
  module wallet — pin 10 amendé daté, UN site de montage sanctionné) +
  ligne de provenance + états honnêtes (résolution · indisponible ·
  transaction inconnue/trop récente · reçu incomplet) ; porte visiteur
  « Seats are open — see how membership works. » (le connecté garde SA
  porte + le raccourci classeur) ; **LE RETARGET** : Copy link + les 6
  réseaux portent désormais `/receipt/{txHash}` (Verify + QR restent
  l'explorer) — même déploiement, jamais avant. `noindex,follow` (Q44-①) ;
  `featureStatus.receiptPublicPage` → live même commit ;
  `guard-receipt-ticket` **127 pins** (les 3 nouveaux fichiers scannés).
  **+0 couleur brute**. Rig : tête runtime exacte (titre registre ·
  noindex · zéro canonical · og:url auto-référent) · matrice 200/404
  prouvée · ticket complet + retarget + états DOM-vérifiés · 2 thèmes ·
  375+desktop · zéro erreur console. **SCELLÉ EN PROD `e002aa5` (Replit vert
  2026-07-20 — sceau vivant : le ticket complet du Seat #14 rendu à son
  adresse permanente ; matrice 200/404 exacte en prod ; head conforme
  Q44-①).** Les cartes peintes par reçu = la slice suivante de l'ordre
  scellé.

- [x] **R-CARDS — LES CARTES PEINTES PAR REÇU + LA ROTATION (2026-07-20,
  faces approuvées fondateur « approved » sur la maquette 4-faces)** : le
  peintre serveur (satori + resvg + les polices DU SITE embarquées — Work
  Sans + IBM Plex Mono, OFL) peint chaque reçu en 1200×630 < 300 Ko, 4
  faces (LE SIÈGE · OÙ EST ALLÉ L'ARGENT · L'HISTOIRE · LA PREUVE — encre
  fixe salle-de-commandement, chiffres RÉELS visibles par Loi de
  Visibilité, QR « SCAN TO VERIFY » vers l'explorer) ;
  `GET /api/receipt-card/{tx}.png?f=1..4` (throttle · cache long ·
  in-paintable → 302 image générique, jamais inventé) ; `serve.mjs`
  substitue à la volée le head PAR URL du shell reçu (og:url
  auto-référent par variante + l'image peinte en og/twitter — substitution
  pure, zéro dépendance, jumeaux précompressés jamais servis substitués) ;
  LA ROTATION DANS LE LIEN (l'idée du fondateur, gravée) : chaque acte de
  partage donne le lien de la face suivante (?f=2..4 puis retour) ;
  `guard receipt-card` **31 pins** (montants visibles · vocabulaire banni ·
  standard 1200×630/300 Ko · fail-closed · polices+licence) ; correctif
  build gravé : cible node20 (le loader binaire émettait
  `Uint8Array.fromBase64`, inconnu du runtime — attrapé au rig AVANT tout
  déploiement). `paintedPreviewCards` → live même commit. **+0 couleur
  brute** (cartes hors thème par conception — encre fixe). Rig : 4 faces
  peintes avec les chiffres scellés du Seat #14 et vérifiées à l'œil ·
  substitution head prouvée (nue / ?f=3 / hors-plage / 404) · route carte
  302-générique sur modèle éteint · boot serveur vert.

- [x] **R-ADMIN — « OPEN RECEIPTS » SUR LE MEMBER LEDGER (2026-07-20,
  wireframe approuvé fondateur + « GO and GO-Live » ; l'amendement A21 que
  le service avait gravé « founder-gated »)** : la colonne Purchases devient
  LA PORTE — « 6 · $30.00 » se clique et les reçus du siège s'ouvrent EN
  PLACE (grammaire du classeur portée au registre) ; chaque ligne : date ·
  Seat #N (· footprint / first seat, le drapeau du moteur) · moteur ·
  montant exact · **« Open receipt ↗ »** vers l'ADRESSE PUBLIQUE PERMANENTE
  (un seul chemin de rendu du ticket : sa page) + « Explorer ↗ » ; côté
  serveur les lignes rejoignent la charge existante (zéro nouveau paramètre
  — jamais une API de recherche) et la sonde anti-fuite de la route passe à
  la forme boundary-aware (leçon f436c42) ; les DEUX pins auth-zone qui
  réservaient A21 amendés datés selon leur propre instruction ;
  founder_root-only + audit inchangés. **+0 couleur brute**. Vérif : gates
  vertes (auth-zone re-épinglé · admin-dist 99 — la copie reste dans le
  chunk console) · rig : l'écran rend l'état honnête founder-only, zéro
  erreur console · revue adversariale 3 coutures = 0 défaut réel (le sceau
  vivant des lignes se fait en prod, la base locale n'existant pas).
  **SCELLÉ EN PROD `0619818` (Replit vert 2026-07-20 — le scan borné prouvé
  par la lecture du fondateur lui-même, audit 01:38:47Z ; « les tickets
  sont là, parfait »).** **+ v2 SCELLÉE `43e84bf` (la correction chapitre
  du fondateur) : colonne CHAPTER (le canon gelé des tickets — tout membre
  actuel = I · Genesis Signal), tag d'autorité « genesis »→« roster » (la
  collision de vocabulaire morte), filtres Chapter + Segment. + rider
  `39f7667` (la dernière occurrence « genesis » du dialogue de message —
  l'observation Replit honorée ; en backlog batchable).**

- [x] **NOTIF — LE CENTRE DE NOTIFICATIONS (2026-07-18, scellé jusqu'à
  51e68de)** : la cloche du header (badge = non-vus propres, onglets
  All/Protocol/Mine, View all → `/notifications`) · la page `/notifications`
  dédiée · la recomposition WORK-FIRST (a45d8b8) · les composeurs admin
  (broadcast + message par membre) avec sélecteurs d'icône et de
  destination (NOTIF-2) · suppression auditée des envois (NOTIF-2b) · le
  système d'icônes or par type · le correctif hauteur du Select. Jamais
  d'email, par canon. **+0 couleur brute**. (Entrée ajoutée 2026-07-19 —
  rattrapage de la règle « les cases se cochent dans le commit de la
  slice ».)

- [x] **ARC REFERRAL — LA PAGE EN 5 SLICES (2026-07-19)** : slice ① élévation
  (`ReferralSurface`) · slice ② les 5 onglets (5d9cb58) · l'UI analytics des
  canaux + le composeur de canal (a65df77, 2893611) · 3.2 structure de page +
  `ReferralLinkHero` (1aff636) · 3.3 vocabulaire + rail · slice ④ les tables
  de lignes par introduction (f5250f8/f436c42, sceau vivant fondateur) ·
  slice ⑤ l'anatomie de commission adossée au reçu (854bca7). **+0 couleur
  brute**. (Entrée ajoutée 2026-07-19 — même rattrapage.)
- [x] **5.1 LE REGISTRE DE REÇUS DE COMMISSION (2026-07-20, maquette approuvée +
  « GO and GO-Live » sur le rig)** : l'onglet Commissions devient le registre —
  lignes-tickets groupées par mois s'ouvrant SUR PLACE en document 7 zones
  (grammaire du ticket répliquée, jamais importée) · usdExact = LE formatteur
  d'argent referral (le `usd()` tronquant supprimé partout : tuiles + table
  Introductions) · la porte de partage vers la page permanente du reçu
  (rotation dans le lien, contrat shareTargets par famille, prouvé au rig).
  **+0 couleur brute**.
- [x] **K1 L'ARSENAL DU RÉFÉRENT (2026-07-20, maquette approuvée « GO AND
  GO-LIVE »)** : le 6ᵉ onglet Tools — la carte de standing (og/carré/story,
  chiffres prouvés par la chaîne), les banners aux tailles réelles
  (728×90 · 468×60 · 300×250), l'affiche A4 + carte de visite (&via=print),
  les moments vivants (les propres lignes du membre), les kits créateurs
  pré-tagués &via, les 4 phrases maison, le guide replié. Artefacts en ENCRE
  FIXE (canon R-CARDS — export identique dans les deux thèmes), exceptions
  raw-color documentées par ligne (`no-raw-color-allow`). **+0 couleur brute
  non documentée** (exceptions : QrCodeBlock + l'encre des artefacts
  referrerKit, chacune taguée avec sa raison).
- [x] **K1.2→K1.4 LE DURCISSEMENT DE L'ARSENAL (2026-07-20, trois lectures
  vivantes du fondateur + la passe adversariale 3-sceptiques, tout scellé en
  prod `d170131`)** : le vrai emblème interlock partout (SynMark) · le pack QR
  (QR nu print PNG+SVG avec zone de silence · QR vidéo) · la carte de
  résultats · les PLANCHERS TYPO par contexte de vue (ARTIFACT_TYPOGRAPHY_
  FLOORS.md, portés en code + sonde) · LE CANON DES BANNIÈRES (300×250 ·
  336×280 · 300×600 · 728×90 · 320×100 ; 468×60 retiré ; hooks du registre
  approuvé + CtaChip, jamais d'urgence inventée) · le harnais à CINQ sondes
  (géométrie · boîtes carrées · planchers · chevauchements · centrage QR).
  **+0 couleur brute non documentée** (+1 exception taguée : le blanc de la
  zone de silence du SVG).
- [x] **K2 LE CÔTÉ INVITÉ (2026-07-20, maquette approuvée « GO AND GO-LIVE »,
  commit 0134cc6)** : le lien /join?source= s'ouvre avec SA carte peinte
  (serveur, vrai emblème, adresse courte de l'introducteur, registre
  approuvé verbatim) + la bande honnête « Introduced by 0x… — never changes
  your price » sur /join quand le registre confirme la source active.
  **+0 couleur brute** (peintre côté api).
- [x] **K3 + LA COMPOSITION CONSOLE (2026-07-22, deux maquettes approuvées
  « GO and GO-Live », commits 89057bb·f9f3495·c08bbc8)** : l'arc admin entier
  — la porte « Ask for activation » (carte d'éligibilité vivante, états
  A/A′/A″/B/C′/D) · la file de revue LIVE (puces fail-closed, verdicts,
  cloches) · la session de signature enchaînée + portes pause/revoke · le
  Dashboard câblé (compteur + bande 4 tuiles referral) · les 5 sous-onglets
  Sources (grammaire /referral réutilisée) · la table Performance + CSV
  écran-exact. Maquettes au repo : k3-admin-axis-mockup.html +
  admin-ia-sources-tabs-mockup.html. Prouvé le jour même par la première
  activation réelle (Seat #3). **+0 couleur brute** (tokens only).

- [x] **A-ARC — LA NEWSROOM /ACTIVITY + LE REGISTRE FONDATEUR (2026-07-22,
  wireframe approuvé « GO and GO-Live », c1a57a1)** : A1 serveur — le Founder
  Private Wallet (`0x2445…C721`, AW-1) rejoint le set fondateur (les 7 mints
  d'archive basculent Founder au prochain cycle) + l'attribution de financement
  fondateur sur les mouvements treasury (« advanced by the Founder » /
  « returned to the Founder », backbone guard 156 avec les pins A1) · A2 — la
  pagination du feed (curseur bloc:index, pages fermées-par-grappe, 400
  fail-closed, kindCounts serveur) · A3 — la page recomposée WORK-FIRST :
  Z1 bande (chiffre UNE-AUTORITÉ memberCount + la bande d'ÈRE, AW-2 fondateur
  OUI, fail-closed cachée sur historique sombre) · Z2 facettes (8 primaires +
  More, comptes SERVEUR jamais un zéro non prouvé, ?facet= profond,
  ✦ Founder or) · Z3 le feed D'ABORD (12 lignes, groupes de dates
  Today/Yesterday/mois, pastille **Founder** or par ligne prouvée, Load more,
  pouls vivant 60s avec glissement animé) · Z4 milestones condensés APRÈS le
  travail + la ligne FOMO historique Genesis (loi business-first) · Z5 la
  méthodo repliée (l'honnêteté entière, plus jamais le hall d'entrée ; un
  souci de couverture s'annonce toujours en haut) · SEO /activity re-décrit
  même commit. Rig : 2 thèmes (le chip solid-gold refusé au contraste clair →
  grammaire teintée maison) · 375px 0 débordement · chips 46px ≥ 44 · zéro
  erreur console. **+0 couleur brute**.

- [x] **M-EVO-1+2 — LES MILESTONES ÉVOLUTIFS (2026-07-22, « GO and GO-Live » sur
  l'échelle §2 du dossier MILESTONE_SYSTEM_EVOLUTION.md)** : le registre 11 → **66
  jalons** en 6 familles (Membership jusqu'au SIÈGE FINAL 1M avec les fins d'ères
  en barreaux · Economy → $100M · Fire actes + % de l'offre · Referral créations ·
  Liquidity actes · Archive), nouveaux kinds dérivés des lanes EXISTANTES (zéro
  nouveau scan), **retro-seal aux vrais ancrages historiques**, approaching =
  LE prochain barreau par (famille, kind) — 8 voies au goal-gradient · le panel v2
  par familles (compte scellé + barre du prochain ; le registre scellé complet en
  expander replié) · LA PASSE ADVERSARIALE (workflow 3 sceptiques + réfutation) :
  3 défauts réels CONFIRMÉS et TUÉS avant commit — ① les comptes/curseur de
  pagination parlaient de la fenêtre cappée à 100 au lieu de l'histoire entière
  (buildPublicFeedWithLines + sliceFeedPage pure) ; ② la logique de page n'avait
  que des pins textuels → pins COMPORTEMENTAUX au fixture (cluster jamais scindé ·
  curseur strictement-plus-vieux · fin honnête) ; ③ le parse client acceptait
  target<1 (barre NaN pleine) → rejet + clampPct. backbone guard 156 → **160**.
  **+0 couleur brute**.

- [x] **AMENDEMENT A-ARC/M-EVO — L'ÉTAT FINAL SERVI (2026-07-22, soir : les
  lectures live du fondateur + la batterie Replit 1bce58e)** : ① HARMONIE
  TYPO — UNE seule display serif par page (le héros) ; « 14 seats on-chain »
  repasse en voix stat maison (Work Sans semibold) ; la bande d'ère UNE taille
  UNE face (l'or = l'emphase). ② Le hotfix max-w-6xl VIOLAIT la loi
  plein-écran S7-d → REVERTI (pleine largeur fluide) ; puis le rail 400px
  expérimental TUÉ sur ordre du fondateur (« oui en bas, pleine largeur, sous
  le feed ») : l'état FINAL = le panel milestones PLEINE LARGEUR SOUS le feed
  + la passe densité/respiration (d3fe4b4), ordre WORK-FIRST intact.
  ③ « prix ok » — L'ÉCHELLE DE PATRONAGE : barreaux archive-usdc $100→$10k,
  registre 66 → **71 jalons** (approaching 8→9 voies ; v1 approaching-only —
  un barreau franchi live se NOTE, jamais scellé sans ancrage transactionnel ;
  le chiffre courant = la lecture LIVE prix×minted, l'autorité de la carte
  /economy). **+0 couleur brute**.

### Phase 6 — Audits (le sceau grade-AAA)
- [ ] Accessibilité (WCAG AA / APCA, focus, clavier, cibles ≥44px)
- [ ] Responsive (fluide, container queries, 320 → 2560, pliables)
- [ ] Performance (polices auto-hébergées, Core Web Vitals, images AVIF/WebP)

---

## Ligne d'arrivée

Design **100 % fini, verrouillé** = toutes les cases de "Définition de FINI" cochées
→ **on n'y revient plus jamais.**

## Suivi couleur — ✅ FERMÉ
Sprawl : **0** couleur brute (slice 2.3 FAQ : **+0** · slice 2.4 Docs : **+0** · slice ⓪ liveness : **+0** — MembersProvenance 100 % tokens · arc Member Home 2026-07-14 : MEMBER SHELL **+0** · slice A actions/lien/Guide **+0** · slice B pill/settings **+0** · slice C teasers (TeaserSurface + 3 pages) **+0** · slice D wallet/toolkit **+0** · arc harvest L-1 /liquidity **+0** · ACT-1 feed (LiveActivityFeed + 2 pages live) **+0** · CHR-1 chronicle (register + panneau console) **+0** · M1-a hero premier acte (HeroStatusChips + HeroSeatLine + rail Inspect) **+0** · M1-b carte vivante (heroIconLanguage + nœud burn + mini-feed) **+0** · M1-c header/footer (barre récurrente morte à la racine + garde `guard-nav-link-display` + pilules dérivées) **+0** · S7 member home (bande d'accès + héros Your Seat + pilule échelon) **+0** · S7-b tableau de bord membre (bandeau + KPI + pouls + puces mobiles) **+0** · RECEIPT ticket (spine + ReceiptTicket + guard 63 pins) **+0** · ② MENU membre (memberDoors + MemberShell + RouteScrollManager + guard 34 pins) **+0** · ③ HOME (MemberAttention + MemberRecentActivity + MemberDoorsGrid + KPI 6 + guard 30 pins) **+0** · ARC MODÈLE D'ACCÈS 2026-07-18 (SignInWall + MemberAppPage + continuité shell, slices 1+2) **+0** · Phase A finish (copy Season + lecture capital 3-états partagée) **+0** · doors-dedup (grille dupliquée `MemberDoorsGrid` retirée, guard 26 pins) **+0** · Referral élévation (`ReferralSurface` fork, `/referral` surface membre) **+0** · R-BIND classeur de reçus (`ReceiptsBinderPanel` + `MemberReceipts`) **+0** · R-BIND-2 rail de tickets + double partage **+0** · R-BIND-3 finitions **+0** · R-PAGE `/receipt/{txHash}` (page + panneau + monture wallet + retarget) **+0** · arc referral slices ②-⑤ (onglets + canaux + héros lien + lignes d'introduction + anatomie commission) **+0** · 5.1 registre de reçus de commission (rangées-tickets + document 7 zones + porte de partage) **+0** · arc NOTIF centre de notifications (cloche + `/notifications` + composeurs) **+0** · arc K3 admin (ActivationDoor + file de revue live + session/portes wallet) **+0** · composition console (ReferralKpiBand + 5 sous-onglets + SourcePerformancePanel) **+0** · A-arc newsroom /activity (bande d'ère + facettes + pastille Founder + groupes de dates + Load more, eraCanon config) **+0** — tout en tokens). Guard
`no-raw-color` **BLOQUANT** dans la gate (`pnpm guards`), toute nouvelle couleur brute casse le
build. Du pic de **137 sites** → **0** au fil des slices d'harmonisation.
Une seule exception documentée : `QrCodeBlock` (fond blanc du canvas QR, requis pour la lisibilité),
taguée `no-raw-color-allow`. Le token layer (`index.css`) reste la seule source de couleur brute légitime.

## Gouvernance (comment on reste aligné)
- Ce doc est la **source unique** du workstream design.
- **Claude Code met à jour ce fichier (coche les cases) à la fin de chaque slice**, dans le même commit — pas d'état "dans la tête".
- Référencé dans `CANON_INDEX` (Tier 1) + `CLAUDE.md` → **chaque session boote dessus.**
