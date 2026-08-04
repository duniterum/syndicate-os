# DESIGN_ROADMAP — chemin vers "full grade-AAA" (source unique du workstream design)

> ## ▶ 2026-08-04 (SESSION 2) — LE CHEMIN D'ACHAT, RÉPARÉ ET AU QUAI
>
> **PROD = `c170e9b`.** ⛔ **LE BACKLOG DE DÉPLOIEMENT N'EST PLUS VIDE :** la
> tranche du chemin d'achat (`c01eba5` + les correctifs de revue) attend, et
> **elle ne se groupe pas** — c'est le chemin de l'argent. Rien n'est en ligne
> tant que le fondateur n'a pas donné l'ordre.
>
> **CE QUE LA REVUE 12 AGENTS A CHANGÉ (ses réponses, 2026-08-04) :** ① un parrain
> touche sur les rachats des membres qu'il a introduits (la chaîne le fait déjà) ·
> ② la phrase publique de /join réécrite · ③ la raison affichée à l'acheteur vient
> désormais du MOTEUR, jamais de nous · ④ le correctif serveur `joinQuote.ts`
> CONSTRUIT (un lien en pause ne casse plus toute la page) · ⑤ **porte de preview
> avant toute mise en ligne** · ⑥ **le checkout n'a PLUS le droit de refuser
> d'envoyer un achat — seule la chaîne dit non.**
>
> ## ▶ 2026-08-04 — 11ᵉ SCEAU (historique)
>
> **PROD = `c170e9b`** (Replit 6/6 : entrée servie ×2 · ancienne 404 · 39 shells ·
> terms v1 5873 o / v2 6172 o exacts · les 4 faces peintes + repli face-inconnue ·
> backbone ok:1 partial:0 failed:0). <s>**Backlog de déploiement VIDE.**</s>
> *(vrai à cet instant ; faux depuis `c01eba5` — voir le bloc ci-dessus.)*
>
> **LIVRÉ (K1.6 + K1.7) :** chaque artefact déroule SA carte peinte (`&card=` →
> 4 faces 1200×630 : invite · standing · seat · record, repli invite) · le SIÈGE
> n'est plus requis pour parrainer, sur 17 surfaces, serveur compris (le contrat
> gate sur le solde SYN — SPEC §262/§436) · terms **v2** publiés, v1 servi et gelé
> (son keccak256 est l'ancre on-chain des sources existantes) ·
> `guard-no-directory-fossil` BLOQUANT, 575 fichiers : ⛔ la formule absolue « aucun annuaire
> n'existe » est morte, THE REGISTER existe.
> **RETIRÉ le même jour, après test du fondateur :** `&via=` sur les intents (il
> fragmentait 1 url en 24, toutes froides → plus aucun aperçu) et le
> téléchargement automatique au partage (le lien porte l'image maintenant).
>
> **⛔ LA SUITE DE L'ORDRE — un défaut MESURÉ, pas une piste :**
> **un membre qui tient déjà un siège ne peut pas racheter via un lien de
> parrainage.** Reproduit en prod par le fondateur (Alice, siège #5).
> Parrain `0x3b1396…Ec6a` : **1 000 SYN** → ce n'est PAS `ReferrerNotSeated`.
> <s>CAUSE : achat **RÉPÉTÉ** contre une source dont `appliesToRepeatPurchases`
> est faux</s> — **FAUX, corrigé le 2026-08-04 :** ce terme vaut **TRUE** sur
> cette source (lu sur la chaîne). Le moteur refuse par `SourceNotEligible()`
> (`0x2abb57d6`), et le **même achat sans le lien PASSE**. L'éligibilité ne se
> déduit jamais des termes de la source : seul le moteur sait, et seulement par
> acheteur.
> ① `api-server/src/routes/joinQuote.ts` — ✅ **CONSTRUIT le 2026-08-04** (son
>    « a ») : un lien qui ne peut pas s'appliquer est LÂCHÉ et le devis se
>    calcule quand même. Avant, un lien en pause tuait la page /join entière —
>    pas de prix, pas de bouton.
> ② <s>`studio/src/wallet/JoinCheckout.tsx:449` — lire `txReceipt.status`</s>
>    ✅ **FAIT** — et la recherche du jumeau a trouvé la maladie sur **SIX**
>    lectures de reçu, dans quatre fichiers. Une seule règle désormais
>    (`chainReads.confirmTransaction`), importée partout.
> ③ **DÉCISION FONDATEUR — RÉPONDUE le 2026-08-04 : (a) OUI.** Un parrain touche
>    sur les rachats des membres qu'il a vraiment introduits. La chaîne le fait
>    déjà (sièges #13/#14/#17, mesuré). Ce qui reste refusé par le moteur, c'est
>    d'attacher un NOUVEAU parrain à un membre DÉJÀ inscrit.
> ④ **eslint absent du studio** — c'est ce qui a laissé un hook conditionnel
>    atteindre la prod et noircir /admin/sources. 34 sites candidats repérés.
>    **TOUJOURS OUVERT** — la tranche suivante.
>
> **LE MOTEUR FIRSTS recule d'un cran** — il ne vaut rien tant que le chemin
> d'achat ne se termine pas.

**Statut : vivant.** Claude Code coche les cases à la fin de chaque slice, dans le
même commit. **Tout le monde travaille depuis CE doc** — fondateur, Claude Code,
Claude-conseil, Replit. Personne ne part de son côté.

> **▶ Rattrapage 2026-08-03 (le marathon 02→03 — PROD = voir le bloc de reprise de
> SESSION_STATE.md, l'autorité du sha) :** livrés et EN PROD : la pagination dormante
> des deux tableaux publics (wireframe approuvé « ok les 2 ») · la bande RÉSERVES 3×2
> six actifs (mark XAUt0 officiel, fenêtre heures-de-marché) · **A1 — la lentille
> [Protocol | Mine] de /activity** (wireframe approuvé + « go continue ») · **M3 — le
> trio Collectible** (wireframe + clause mobile approuvés) · **M2-v2 — l'aperçu vivant
> par siège** (« by Seat #3 · Chapter I », prouvé aux pixels) — puis la journée a
> continué : K1.5, /join, /press, /referral-terms, le lockup, Add-SYN (entrées cochées
> plus bas). Dossiers/wireframes dans docs/design/ + docs/reference/.
> ✅ **Le balayage « montent avec A1 » est FAIT (2026-08-03)** : les deux riders ont été
> re-datés sur place — la porte view-receipt/binder (ligne ~429) a en fait atterri dans
> R-BIND (2026-07-19), et la lentille My|Protocol (ligne ~280) est arrivée avec A1 à
> `d811ec1`. *(Les « lignes ~357/418 » que cette note citait étaient fausses ; les vraies
> sont ~280 et ~429.)* **Prochaine tranche : LE MOTEUR FIRSTS** (gravé #2 — le registre
> ouvert des premières-par-classe qui alimente la file de candidates de la salle de
> presse) ; les intents desktop du Share… sont LIVRÉS, voir l'entrée **K1.5** cochée.

---

## Définition de "FINI" (grade-AAA, pas juste "construit")

Le design n'est "fini" que quand TOUT ceci est vrai :

- [ ] **Adoption** — chaque surface rend via le système (aucun composant orphelin).
- [x] **Couleur** — 0 couleur brute → guard `no-raw-color` **BLOQUANT** dans la gate.
- [x] **Typo** — l'échelle fluide `.type-*` adoptée partout (titres display/h1/h2/h3 sur toutes les surfaces, en Instrument Serif ; corps via `.type-body`).
- [x] **Discipline des polices (2026-07-25, benchmarkée Butterick/NN-g/EightShapes)** — serif = titres display SEULEMENT · Work Sans = tout le corps/descriptions/labels/stats · IBM Plex Mono = valeurs on-chain/adresses/code/eyebrows MAJUSCULES courts UNIQUEMENT, **jamais une phrase**. Audit 11-agents (610 usages / 115 fichiers → 54 violations mono-sur-prose corrigées, ~51 éléments) + garde **BLOQUANT** `guard-font-discipline`. (Fin du patchwork /season.)
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
- [x] **Arc BORD-À-BORD / full-screen (2026-07-25, ruling QuickNode) — COMMITTÉ** — shell (header/main/footer
  `w-full` + `px-4 sm:px-6 lg:px-8` ; footer accordéon mobile ≥44px) + primitives `.auto-grid`
  (auto-fit) & `.measure` (68ch) + **20 surfaces** passées bord-à-bord (grilles → `auto-grid`,
  texte → `.measure`, **0 plafond fixe px**) + guard **BLOQUANT** `guard-fluid-surface`.
  **Compteur "page-cap sprawl" : 0.** **PLUS (follow-ons poussés `224dd9a`→`a6b5294`) :** discipline
  des **polices** (mono = données/labels courts, jamais une phrase ; garde `guard-font-discipline`) ·
  **"read only" retiré** (51 textes) + 4 **fossiles vérité** · la **HOME recomposée** en cartes
  encadrées uniformes sur UN fond (hero simplifié · strip vérif retiré · CSS/composant morts nettoyés) ·
  **header typo** relevé (nav 11→13px, micro-labels 10-11px) · **Prose** remplit (texte 68ch, cartes/tables
  pleine largeur) · **More-menu** Whitepaper-over-Join. **+0 couleur brute** (compteur reste 0).
  **SCELLÉ LIVE `e21a036`** (Replit vert ×2, 2026-07-25). **PUIS (25-07 PM, batchable, PAS déployé) :
  /ADMIN harmonisé + Dashboard recomposé (BusinessBand KPI live MÈNE · ReferralKpiBand supprimée ·
  « System & registry » replié · identité humanisée) · jargon « PII » purgé (guard bannit « pii ») + LA
  LOI D'ADRESSE gravée** (adresses publiques, forme courte + Snowtrace ; gardes protègent nom/e-mail PAS
  les adresses ; masquer = BUG ; base légale EDPB/CJEU/CCPA — ADR-003 + CANON_VISIBILITY_LAW amendés).
  **PUIS (25-07 PM-2) : LES AVOIRS DU VAULT — carte trésorerie recomposée + posée sur l'accueil /admin.**
  `ProtocolAssetsCard` : **9 lignes** (Vault USDC · USDC opérations · AVAX · BTC.b · WETH.e · SYN du vault ·
  le pool SYN/USDC · la réserve de sièges), sous-valeur USD par ligne pour les avoirs valorisables, et un
  bloc d'en-tête **« Value of the priced holdings »** qui tombe en « indisponible » si un composant manque.
  Le placeholder « Coming » de l'AVAX est MORT (capacité enregistrée : `vaultHoldings` LIVE). Posée dans la
  **ZONE DE TRAVAIL** de l'accueil /admin sous `BusinessBand`, **jamais repliée** (WORK-FIRST §① : la page
  ouvre sur le travail). Tokens uniquement — **+0 couleur brute** (`viz-1/2/3/4/5/6`, `gold`) ; teintes
  d'icônes redistribuées pour lever une collision ambre/or en thème sombre. Pas de plafond px (S7-d :
  la grille reste `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`).
  **PUIS (25-07 PM-3) : « PROTOCOL RESERVES » — LA SECTION D'ACCUEIL PUBLIQUE** (maquette approuvée par le
  fondateur : nom, look et barre de composition validés ; `docs/design/protocol-owned-assets-mockup.html`).
  Bande pleine largeur posée sous le bandeau saison (`6953972`), **pilotée par un REGISTRE**
  (`config/trackedAssets.ts`) : une entrée décide l'ordre, le logo, les décimales, la source du solde et
  celle du prix — le total, la barre et les jauges en découlent. **44 logos de coins vendus en local**
  (`public/coins/`, licence MIT + note) : aucun hôte externe appelé, repli sur pastille lettrée, jamais
  d'image cassée. **Puis affiné (`35c5083` + `add5bb8`, sur retours du fondateur sur le site LIVE) :** UNE
  seule carte USDC agrégeant les quatre poches (vault · opérations · ventes NFT · notre part du pool) au
  lieu de trois cartes jumelles ; la barre de composition **remplit exactement 100 %** parce qu'elle et le
  total sortent désormais de LA MÊME liste (elles en avaient deux, d'où 80 % et une zone noire à droite) ;
  grille à **4 colonnes dès `lg`** pour que les 4 cartes tiennent sur UNE ligne (une grille à 3 laissait la
  4ᵉ orpheline en 1280 px). **+0 couleur brute** — les teintes passent par une table de classes LITTÉRALES
  (`TONE_BG`, `ProtocolReservesBand.tsx`) : une classe construite `bg-${tone}` n'est jamais générée par
  Tailwind et les barres auraient été invisibles. Tokens `viz-1..viz-6` + `gold` uniquement, aucun plafond
  px (S7-d respecté). **Aussi (`352a904`) :** les lignes du board /season rendent l'identité **cliquable**
  vers Snowtrace — condition portée sur l'existence du lien, jamais sur « a un siège », donc toute ligne
  future l'est d'office.
  **DEPLOY : 🚀 GROUPÉ MAINTENANT** — le commit des avoirs change des lectures SERVEUR, donc il n'est pas
  batchable : il emporte `f2642aa` · `3b32f2c` · `29f8559` · `469882d` au-dessus de prod `e21a036` *(PÉRIMÉ 26-07 : ce lot est SCELLÉ, prod = `35d60fa` depuis le 25-07 ; l autorité pour prod + le backlog est le bloc de reprise de SESSION_STATE, jamais un bloc daté plus bas)* en un
  seul déploiement. **+0 couleur brute** (tokens). Dossier :
  `docs/audits/FULL_SCREEN_HARMONIZATION_AUDIT_2026-07-25.md` + la LISTE COMPLÈTE = bloc en tête de `SESSION_STATE.md`.

### Phase 5 — Surfaces (adoption)
- [ ] Public · [ ] Dashboards (connecté / membre) · [x] Console admin (arc K3 + composition console, 2026-07-22)
- [ ] Contenu (Docs / Whitepaper / FAQ)
- [ ] **ARC SEASONS (ouvert 2026-07-23 — la loi du dossier : `docs/reference/`
  `SEASONS_ORIGIN_HARVEST_AAA_BENCHMARK.md` §0 ; maquettes sources : `docs/design/seasons/`,
  à RE-ÉMETTRE corrigées avant tout wireframe gate — §0.14-E).** Surfaces à livrer, chacune
  derrière son preview gate fondateur :
  - [x] **`/season` — LIVRÉE (S2b `1b77b66`, 2026-07-23, preview-gate fondateur OK ; 🚀 en
    cycle de déploiement)** : vraie coquille publique · podium trophée + barres XP · onglets
    double-horloge · axes alimentés seulement · pastilles AWAITING SEAT (rangs numérotés =
    éligibles, §0.18) · carte pot badgée FUTURE sur seasonBounty (jamais un chiffre sans
    preuve) · états fail-closed honnêtes · SEO/sitemap/nav même commit · seasonRanking LIVE ·
    mobile 375 zéro débordement. **+0 couleur brute.** (Le pot vedette/odomètre + zones $
    arrivent avec S3 quand le coffre existera.) **S2c-① LIVRÉ [this commit, soir du
    23-07]** : identité complète des rangs assis « #N + adresse courte » (maquette-exacte,
    table + podium) · ordinal = la réponse du moteur vivant (#11, vérifié chaîne en direct,
    SETTLED_RULES §8-⑦) · LE MOT = « builders » (benchmark mondial 3 lentilles,
    SETTLED_RULES §8-⑥) · puce AWAITING SEAT éteinte sur les lignes hors-concours.
    **+0 couleur brute.** **S2c-①b (hotfix fondateur, même soir — attrapé sur le
    tableau LIVE)** : en-tête de colonne « Builder » (loi Member=Seat : la colonne
    couvre aussi les sans-siège) · lignes identité UNE LIGNE garantie (nowrap +
    224px maquette-exacte ; Progress absorbe le mou) · nouvel outil de rig
    « studio-prod-data » (la page locale sur les données prod LIVE — mesure
    obligatoire avant toute remise d'une tranche visuelle season). **+0 couleur
    brute.** Ancienne spec pour mémoire : pot engagé + preuve ·
    zones de récompense dessinées sur le tableau (identiques par bande) · double horloge
    (season + all-time) · rang YOU épinglé · filtres d'axes ALIMENTÉS seulement · archive
    inline v1 · SEO/OG/nav dans le même commit · matrice d'états vides · mobile scroll
    container + a11y (§0.14-E).
  - [x] **Section Season de la home visiteur — LIVRÉE (S2c-②, 2026-07-24, GO-and-GO-LIVE
    fondateur ; mesurée sur données prod LIVE au rig studio-prod-data avant remise)** :
    bande plein écran (S7-d, wrap clamp) · 2 colonnes 1.4fr/.9fr · jauge sièges sur LA
    source unique du héros + MembersProvenance (loi guard-freshness) · « 319 before
    Genesis Signal seals — forever », jamais de date · CTA SECONDAIRE contour or ·
    carte pot = CADRE badgé FUTURE sur seasonBounty (zéro chiffre sans preuve) · teaser
    podium top-3 médailles métal + couronne (atome SeasonMedal partagé, jetons
    --silver*/--bronze*/--gold-hi/-deep — zéro couleur brute) · bande REGISTRE PUBLIC
    (« Nothing to hide — the register is the flex » + registre vivant réel du feed + 3
    cartes : Holder Index/provenance · Season ranking→/season · Your standing badgée
    FUTURE sur seasonOwnRow, nouvelle clé) · le mot « builders » partout · SEO même
    commit (description « / » + index.html synchronisé, 532 checks). Le polissage
    podium /season (report S2c) livré même commit. **+8 jetons métal, 0 site couleur
    brute.**
  - [x] **Member Home — slots Season + Quests REMPLIS (S2d, 2026-07-24, GO-and-GO-LIVE
    fondateur)** : `SeasonStandingCard` (anneau d'ère sur LA source unique + provenance ·
    rang/XP/axes servis par le NOUVEAU rail own-row `GET /api/auth/season-standing` — la
    MÊME ligne de modèle que le tableau public, choisie par le siège de la session côté
    serveur (une seule autorité + frontière wallet=auth-only, guard-access-state) · colonne
    pot = cadre badgé FUTURE) · `SeasonQuestsCard` (les quêtes ALIMENTÉES seulement :
    l'échelle Connector VERBATIM + les 3 premiers actes, voix auto-crédit, AUCUNE promesse
    hebdomadaire non câblée) · carte « récompense d'effort » SÉPARÉE (`EffortRewardCard`,
    identité émeraude, voix push « rien à réclamer », badgée FUTURE sur `seasonBounty`,
    zéro chiffre) · `MEMBER_HOME_RESERVED_SLOTS` vidé même commit (les cartes pointillées
    mortes, dashboard + visiteur) · `seasonQuests` flippé LIVE même commit · 4 nouveaux
    checks au test squelette d'auth (S4+quêtes · scan de fuite · paramètre inerte ·
    anonyme S1 — tous verts sur le rig). La note #14 réconciliée par la loi : les chiffres
    de maquette sont de la géométrie, jamais des données. **+0 couleur brute.**
  - [x] **Console admin — section Seasons 2 rails — LIVRÉE (S2-final, 2026-07-24,
    GO-and-GO-LIVE fondateur ; mesurée sur données prod LIVE au rig)** : /admin/seasons
    (chaîne stricte sections.tsx → chunk OperatorConsole intact, admin-dist 102) —
    RAIL 01 Reconnaissance AUTONOME en pure OBSERVATION (zéro bouton par CONCEPTION,
    §0.15/§8-④ : état season+ère sur la source unique · trigger memberCount≥endSeat ·
    prochaine étape moteur · heartbeat backbone · cycle de vie 5 nœuds AUTO + 1 clic
    éditorial · table des 5 sources XP ALIMENTÉES « 0 intervention opérateur » · top-3 +
    porte /season · notes du modèle en expandeur fermé) — RAIL 02 Le pot (cadre §0.17
    founder-gated : deux poches Engager/Réserve · rounds seal-auto/intérim-48h/final ·
    fenêtre publiée-vérifiée-payée + veto droit + 1an carryover + rulesHash · liste
    d'activation S3 fund/acceptOwnership/droits optionnels · executor borné) — UN badge
    FUTURE (seasonBounty), ZÉRO chiffre, ZÉRO faux contrôle. Pins bumpés délibérément :
    operator-gate 15→16 + chemin + adminGraph · route-nav-drift 10→11 · feature-truth
    590 · robots/SEO/classification même commit (539 checks). **+0 couleur brute.**
  - [x] featureStatus (re-trué à l'audit pré-S3 2026-07-24) : `seasonRanking` LIVE
    (S2b 23-07) · `seasonQuests` LIVE (S2d 24-07) · `seasonOwnRow` future (clé créée à
    S2c-② — le surlignage YOU de /season) · `seasonBounty` future. **DEUX clés restent
    à flipper** : `seasonBounty` (dans le commit S3 qui active le rail d'argent) et
    `seasonOwnRow` (avec la tranche auth-zone du surlignage YOU).
- [ ] **S3 — RAIL D'ARGENT (progrès ingénierie 24-07 ; aucune surface design livrée, +0
  couleur brute).** Le contrat est GELÉ et CONSTRUIT : **MeritDistributor** (nom CODE ;
  le LABEL produit reste « Season Bounty Pool ») — spec v4
  `docs/reference/MERITDISTRIBUTOR_CONTRACT_SPEC.md` · `.sol` vert 56/56 + filet
  adversarial (invariants 8×50k zéro-échec · fork mainnet vert · slither 0 haute/moy) ·
  outillage + anti-farm + fenêtres d'argent construits. **LA CARTE des surfaces season
  restantes = le MASTER PLAN 14 tranches** (`docs/reference/S3_SEASON_CASH_RAIL_MASTER_PLAN.md`)
  — NEXT = S3-5b, puis les 2 GATES WIREFRAME fondateur (A : admin Rail 02 · B : front
  pot-live en 4 états temporels, PRÉ-REQUIS : les maquettes docs/design/seasons/ RE-ÉMISES
  corrigées §0.14-E). La clé `seasonBounty` reste FUTURE jusqu'au commit d'activation
  S3-11 (ne JAMAIS flipper tôt) ; mainnet-direct, aucun testnet (§8-①) — le badge FUTURE
  tient jusqu'à la mise en ligne mainnet.
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
  zone 4 le pouls du protocole (5 lignes §8 + porte /activity ; ~~My|Protocol y
  atterrira avec A1~~ → **ATTERRI : la lentille [Protocol | Mine] est partie avec A1 le
  2026-08-03, `c2b1168` puis durcie `d811ec1` — re-daté le 2026-08-03**) · zone 5 verify
  + settings + expectations. La carte-héros flottant dans le
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
  générale, notée ADR-001) : 277 occurrences sous 12px dans 57 fichiers, 223 publiques dans 48 (recompté le 26-07 par guard-type-scale) arbitraires sur la home + autres
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
  ~~View-receipt/binder ABSENTS — ils montent avec A1~~ → **FAUX depuis le 2026-07-19 :
  la porte a ATTERRI dans R-BIND (placement ② du A1 GO'd) — chaque ligne porte son
  « receipt » vers le classeur vivant /receipts, où elle se rouvre en ticket complet
  (autorité : `artifacts/studio/src/wallet/MemberRecentActivity.tsx`:7-9). Re-daté le
  2026-08-03 ; ce rider est resté faux ~2 semaines**) · Z5 le pouls SOUS le
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
- [x] **K1.5 LE PARTAGE DU KIT HARMONISÉ (2026-08-03, commits
  84855ae·1bf803e·02e3f40 + la passe de revue six-casquettes le même jour ;
  la prise du fondateur — « Sheet unavailable » sur desktop ; corrigé DEUX
  fois la même heure sur SES relances « nous avions plus » puis « harmonisé
  comme ticket »)** : UN Share… par rangée d'artefact, toujours rendu
  (mobile garde tout PAR CONSTRUCTION — la détection du moteur vit dans la
  boîte), qui ouvre LA boîte du ticket — désormais UN composant partagé
  (`ShareSurface` : Copy d'abord → les SIX réseaux pré-remplis, l'ordre
  crypto-natif gravé R-BIND-2 → « Share with other apps » détecté, le SEUL
  canal du PNG) — le desktop PARTAGE au lieu d'expliquer, le ticket monte le
  MÊME composant (même DOM vérifié au rig : testids · ordre · classes
  d'icônes · chrome du Copy — un moteur, hors-session ; les pixels et la
  rangée connectée restent la porte preview du fondateur). La
  recherche-jumeaux a réduit la famille à UNE autorité par fait : carte
  icônes (3 copies privées → shareTargetIcons) · résolution
  (pickShareTargets) · l'ordre (2 copies → orderedShareTargets) · le partage
  url/texte (shareIntentArgs) · la boîte elle-même (ShareSurface, anneaux
  focus maison, id unique par montage via useId — la carte og monte ses
  actions deux fois) · bouton-rangée commissions (ShareIntentIconButton,
  zone tactile au plancher via after:-inset-1) ; épinglé par
  guard-share-intents, RED-first ×3 (18 · 7 · 16 vus en session — le guard
  commité rejoue 15, l'écart étant le pin sur-large rétréci, dit dans
  02e3f40 → 1576/1576, durci ensuite par la revue adversariale).
  **+0 couleur brute**.
- [x] **C LA VITRINE REFERRAL CÔTÉ ACHETEUR sur /join (2026-08-03, l'item C
  de la séquence gravée ; sa prise a fixé la VOIX — les lignes gravées §7
  sont la voix PARRAIN, « You don't wait to get paid » est absurde pour un
  acheteur qui paie — puis son « deep think … améliore … go avec human
  readable text » a approuvé le texte)** : la carte voix ACHETEUR-FUTUR,
  mêmes vérités de chaîne — le one-liner gravé (« The referral program where
  the payout is part of the purchase », le SEUL « payout » autorisé du site,
  déjà exempté dans guard-forbidden-copy) · le mécanisme en une phrase
  (commission payée DANS la transaction de l'acheteur, avant que le
  protocole voie l'argent) · « Nothing to claim, ever » · « never break a
  sale / never be lost » · la vérité-prix (« never changes your price »,
  l'anti-markup). Format §7 tenu : claim en gras + porte verify (/activity =
  le registre vivant · /terms = le mécanisme public), les deux mesurées
  44px au rig. Placement WORK-FIRST : après l'économie honnête, avant la
  queue — jamais au-dessus de l'achat. Titre en SANS (type-h3 — le seul
  serif de la page reste le h1). Épinglé par guard-join-showcase (RED-first
  10 échecs regardés → vert ; durci par la revue-2 adversariale à 12 pins :
  montage inconditionnel + claims bornés à leur élément), 375px zéro
  débordement, deux thèmes mesurés. **+0 couleur brute**.
  **↳ CORRIGÉ LE MÊME JOUR (2026-08-03, `b2f8d09` — mesures ci-dessus laissées
  intactes, elles sont datées).** L'audit des conditions qu'il a demandé
  (« lire pour voir si tout est à jour ») a prouvé son instinct **au mot** :
  le §2 dit qu'un lien **« may be granted »** (la demande → l'activation
  signée par le Founder), donc « Every seat **comes with** its own introduction
  link » **sur-affirmait**. La copie gelée lit désormais « Every seat **CAN
  OPEN** its own introduction link » (épinglée verbatim, RED-first : 2 échecs
  regardés → **13/13 pins**). Et la porte du bas ne mène plus aux Conditions
  d'utilisation GÉNÉRALES mais à **/referral-terms**, « **How, in the program
  terms** » — le document que la chaîne hache réellement. *Énoncé pour son œil,
  non caché : la condition « détenir du SYN à l'achat » du §2 n'est résumée
  nulle part sur la carte — la porte des conditions la couvre ; une ligne sur
  la carte est SA décision.*
- [x] **E LE PRESS & BRAND KIT PUBLIC — /press (2026-08-03, l'item E de la
  séquence gravée ; son « go décide pour moi » a délégué les trois décisions,
  toutes ancrées dans le réel : périmètre V1 = descriptions · marque servie ·
  canaux · faits · langage · usage média ; canaux = socialLinks IMPORTÉ
  (l'autorité existante, jamais retapé) ; contact presse = « via les canaux
  officiels » car AUCUNE adresse n'existe en canon — rien d'inventé)** : la
  carrière press.tsx d'origine passée au tamis du miroir — seules les vérités
  SERVIES publient (le mark or PNG+SVG réel, l'OG servie, jamais les 48
  fichiers non portés). Registre PROOF : 3 descriptions gelées mot à mot,
  7 faits chacun avec sa porte verify interne, les lignes rouges en DÉNIS
  directs citables (« not an investment », « not an MLM — no downline, no
  upline » — la forme négation que guard-forbidden-copy sanctionne
  lui-même), le verbatim légal IMPORTÉ (safetyCopy.notInvestment). Badge
  READ_ONLY_PROOF, footer Learn, batterie SEO complète (sitemap 30 routes).
  Épinglé par guard-press-kit (RED-first 7 échecs regardés → vert ; le piège
  du stripper version CHAÎNE — un glob `/*` dans une string — attrapé par
  son propre premier run ; la revue-2 l'a porté à 34 pins : la PAGE liée à
  son autorité de contenu — le CRITIQUE adversarial —, pins d'existence
  ancrés-ligne, pressAssets moteur des pins d'assets, aspect du mark gardé).
  Corrections revue-2 le même jour : le mark rendu au ratio NATUREL
  (1.274 = 1.274 mesuré — il était écrasé 21% sous sa propre règle) · les
  portes verify des faits en blocs sous leur phrase (le jumeau /join).
  Rig : one-liner verbatim au DOM · 3 canaux exacts · 7 portes · mark
  naturalWidth>0 · footer · 375px zéro débordement · console vide. NON
  mesuré : le téléphone réel — l'œil du fondateur en prod.
  **+0 couleur brute**.
- [x] **A1 — LA LENTILLE [Protocol | Mine] DE /activity (2026-08-03, wireframe
  approuvé + son « go continue » ; scellée `c2b1168`, DURCIE en prod par
  `d811ec1` sur sa prise en direct)** : le pouls se lit dans les deux sens —
  le protocole entier, ou seulement SES lignes. La passe de durcissement du
  même jour est ce que son œil a attrapé sur la page servie : **les deux
  portes de la lentille Mine** (elles ne menaient nulle part), **les coins du
  sélecteur** alignés sur le rayon maison, **la teinte de focus** ramenée au
  token, et **les deux portes au plancher tactile 44px**. Le reste d'A1 était
  déjà scellé depuis longtemps (le classeur own-row S0, les placements, les
  liens view-receipt et la porte Receipts via R-BIND 1-3, 2026-07-19 ; le cœur
  S2 par l'arc referral slice ④) — **A1 est FAIT, et C3 est débloqué**.
  *(Cette entrée manquait : `d811ec1` n'a pas touché ce document — la STANDING
  RULE a été enfreinte, réparée le 2026-08-03.)* **+0 couleur brute**.
- [x] **/referral-terms — LA MAISON DESIGNÉE DU DOCUMENT ANCRÉ PAR HASH
  (2026-08-03, `b2f8d09`, sa prise en direct « links not correctly forwarded »)** :
  la carte /join dooriait vers les Conditions d'utilisation GÉNÉRALES alors que
  le programme a SON PROPRE document ancré — le keccak256 de
  `referral-program-terms-v1.txt` EST le `metadataHash` on-chain de chaque
  source membre. La page servie respecte la loi du hash **par construction** :
  le corps est **FETCHÉ** depuis `TERMS_PATH` (importé de l'autorité
  `termsDocument`) et rendu verbatim — **retaper une phrase du corps est
  ROUGE**, parce qu'une seconde copie dérive des octets ancrés. Le
  `TermsCommitmentHash` calcule le keccak **sur les octets réellement servis**
  + la porte verify on-chain (le même mécanisme que /referral, importé) ;
  mesuré au rig : le hash calculé égale l'empreinte de la prod `0xc8480867…`.
  États de chargement/erreur honnêtes · porte vers le fichier brut · badge
  READ_ONLY_PROOF · route + modules + **étagère LEGAL du footer** (« comme il
  faut ») + classification + registre SEO (**sitemap 31 · rewrites 37 · 35
  shells**). Nouveau `guard-referral-terms` dans la chaîne BLOQUANTE (**12
  pins, RED-first — 8 échecs regardés → vert** ; chiffres du commit).
  **+0 couleur brute**.
- [x] **LE LOCKUP PRESSE (2026-08-03, `b2f8d09`, sa prise « un seul logo pas
  suffisant »)** : la section marque de /press menait avec l'icône nue. Le
  lockup **mark + wordmark** est construit en **vecteur pur** — satori rend le
  wordmark en **GLYPHES-EN-CHEMINS** avec les TTF Work Sans du peintre de
  reçus, donc **aucun consommateur n'a besoin de la police** — composé sur les
  chemins verbatim du mark servi. **SONDÉ AU PIXEL avant écriture** (encre du
  mark · encre du texte · marge droite propre) : la première forme de la sonde,
  en colonne unique, tombait dans l'espace entre le T et le H et a été
  **élargie en BANDES** — la sonde a attrapé son propre angle mort. Livré en
  **PNG 1× et @2×** (le nom @2x survit à l'épingle), générateur committé, et
  épinglé aux **6 assets déjà existants** — la marque servie, jamais une
  approximation. **+0 couleur brute**.
- [x] **ADD SYN TO YOUR WALLET — LE BOUTON EIP-747 DU FOOTER (2026-08-03,
  `8cb2414`, son « si tu peux faire mieux autrement fais ainsi »)** : son
  ordre nommait un logo MetaMask + d'autres portefeuilles, avec licence de
  faire mieux — pris comme **MÉCANISME plutôt que MARQUE**. UN bouton qui parle
  le standard **EIP-747** (`walletClient.watchAsset`, type ERC20) au client
  CONNECTÉ : MetaMask, Rabby, Coinbase Wallet, Trust et tout portefeuille
  injecté répondent au même appel — pas de bouton par marque, pas de
  verrouillage. **CHAÎNE DE GARDE (la loi d'adresse)** : l'adresse SYN est
  **EXTRAITE du lien verify servi** — le SEUL point sanctionné pour émettre une
  adresse de protocole — jamais un littéral client (un littéral 0x de 40 hex
  dans le composant = ROUGE) ; les décimales viennent de la réalité servie.
  **FAIL-CLOSED** : sans les faits servis le bouton ne rend RIEN — jamais un
  contrôle mort. **LES MAINS HONNÊTES** : aucun portefeuille connecté → l'adresse
  part au presse-papier, dit clairement ; le portefeuille refuse → dit ; et la
  branche presse-papier ABSENT parle aussi (le volet caché du rig a exposé le
  court-circuit de la chaîne optionnelle — `?.writeText` saute le `.then` ET le
  `.catch` — la classe du clic-mort-silencieux tuée avant tout envoi).
  `guard-watch-asset` écrit AVANT le composant (**6 échecs regardés → 8/8** ;
  chiffres du commit), dans la chaîne bloquante. **+0 couleur brute**.
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

---

## 26 juillet 2026 — LA LOI DE DESIGN DEVIENT STRUCTURELLE (Phase 4 + Phase 6)

**Le constat du fondateur, mot pour mot :** *« et c'est quoi nos règles de design maintenant ??!! »* —
devant `/activity` sur un 27 pouces : *« à peine lisible … les espacements trop condensés … pas vraiment sexy »*.

**Le diagnostic, en une phrase :** la page respectait **toutes** les lois de design qui ont un garde
derrière elles, et échouait sur **la plupart de celles qui n'en ont pas**. ADR-001 (amendement 16-07)
interdisait déjà tout texte utilisateur sous 12px **et promettait un guard `no-sub-12px-text` « qui rendra
le plancher structurel »** — jamais écrit. Compté le 26-07 : **277 occurrences sous 12px dans 57 fichiers,
dont 223 PUBLIQUES dans 48, cinq à 8px.** Sur les six règles de type d'ADR-001, **zéro** avait un garde.

- [x] **Six gardes BLOQUANTS écrits et câblés** (`2cd7d65`, chaîne 24 → **30 maillons**) : `guard-type-scale`
      (plancher 12px résolu sur **toute** la chaîne de variantes — un palier `sm:` qui plafonne sous le
      seuil est le défaut de StatusPill) · `guard-spacing-scale` · `guard-contrast-aa` (**ratios WCAG
      CALCULÉS depuis les jetons, dans les DEUX thèmes**, arithmétique auto-vérifiée contre trois valeurs
      publiées de WebAIM) · `guard-theme-parity` · `guard-focus-visible` · `guard-touch-target`.
- [x] **Le cliquet** — chaque ligne de dette porte un plafond chiffré : une occurrence de plus ⇒ **build
      rouge**. *Portée réelle, dite honnêtement : 3 gardes sur 6 portent un plafond numérique ; les trois
      autres pardonnent par appartenance binaire. À généraliser.*
- [x] **Chaque garde prouvé ROUGE** sur une infraction injectée, temporaire supprimé, garde re-diffé
      identique. *Un garde jamais passé au rouge est une décoration.*
- [x] **Chaque garde déclare ce qu'il NE voit PAS.** `guard-type-scale` ne juge qu'**1 des 6 règles** de
      type d'ADR-001 — les cinq autres exigent de savoir *ce qu'un élément EST*.
- [x] **Contraste : le thème par DÉFAUT (clair) échouait à AA sur toute la palette d'accent** (`57c5fdf`).
      Lien « verify » 2,4:1, or 3,1:1 contre 4,5 requis ; le sombre était bon — le site ne se lisait que
      dans **un** thème, et c'était le mauvais. Un commentaire affirmait « AAA dans les deux thèmes »
      (AAA = 7:1 ; mesuré 3,10). **43 corrections alpha dans 28 fichiers**, rampes corrigées **par thème**
      (`destructive` était à **1,95:1 en SOMBRE**, pire que le clair).
- [x] **L'idiome « verify » rationalisé sur ordre du fondateur** (*« ce n'est pas une loi figée »*) : il
      bâtissait son écart de survol en **affaiblissant l'état de repos**, faute d'un second palier cyan.
      Nouveau jeton **`--proof-hover` par thème** — repos 5,27 clair / 9,31 sombre, survol **7,86 / 11,38,
      donc AAA**. **35 sites** basculés d'un coup. **Règle gravée : un changement d'état AJOUTE du
      contraste, il n'en retire jamais.**
- [x] **`guard-contrast-aa` a refusé son propre auteur** dans l'heure : `--proof-hover` ajouté ⇒ rouge,
      *« une couleur sémantique ne doit jamais partir non mesurée »*.
- [x] **Maquette `/activity` approuvée** (`2132663`) — `docs/design/activity-redesign-mockup.html`, vraies
      données de prod, vrais jetons. Diagnostic arithmétique : `--text-body` **plafonnait à 1244px** (le
      chiffre « 1315px » de la première maquette ne se recalculait pas — corrigé 2026-07-26), donc un
      27 pouces reçoit la même taille qu'un 13 pouces sur deux fois la toile — et le feed n'utilisait même
      pas ce jeton (14px fixe pendant que 54 fichiers utilisent le sien).
- [x] **+0 couleur brute** (vérifié : `no-raw-color: 0 raw-color sites`).
- [ ] **Phase 6 — Accessibilité : INSTRUMENTÉE, pas faite.** La dette est comptée (focus-visible **198**
      activateurs nus + 1 « outline-kill » nommé · touch-target **92** contrôles sous 44px dont **36
      publics** · type-scale **277**). Le déblayage est un chantier à part.
- [ ] **La refonte elle-même** — échelle de type (elle bouge **tout le site** : 37 `type-h2`, 15
      `type-body`, 8 `type-h1`, 8 `type-h3`), ligne en grille, montant en colonne, cartes de jalons, 44px,
      anneaux de focus. **L'aperçu devra couvrir 3-4 pages, pas `/activity` seule.**

## ▶ 2026-07-26 (fin de session) — /activity CONSTRUITE, et la loi ② déplacée

**La maquette approuvée était restée un DOCUMENT.** `git log <maquette>..HEAD` sur la page et ses
composants ne renvoyait rien : deux commits de documentation avaient suivi l'approbation au lieu du code.
Cette session l'a construite, mesurée dans un navigateur à 1920 et 375, dans les deux thèmes.

**Ce qui a atterri, avec les mesures et non des adjectifs :**
- **La ligne du feed est une grille** — l'ancre de preuve à UN seul x sur les 12 lignes (1755 px), exactement
  112×44 px ; le montant dans sa colonne mono tabulaire, un seul bord droit (1037 px) ; la phrase bornée en
  `ch`, jamais en px, donc elle survit au zoom et à la traduction.
- **Le plafond de type** : `clamp(1rem, 0.92rem + 0.28vw, 1.25rem)` — 16 px à 375 · 18,3 px à 1280 · **20 px
  atteints à 1886 px**. La PENTE est descendue avec le plafond : baisser le plafond seul aurait replafonné à
  1257 px, le bug même que ce jeton existe pour corriger. (La maquette annonçait 22 px ; amendée au jeton livré.)
- **Jalons : 2 colonnes × 3 rangées**, familles appariées par poids (fire·archive ensemble) — chaque rangée
  mesurée à hauteur égale (102/102, 152/152, 102/102), zéro trou. Deux dispositions précédentes rejetées à l'écran.
- **Le plancher de 1 % des barres est mort** : une valeur à zéro peignait ~22 px de doré. Une barre à zéro est
  vide et la carte le dit en mots.
- **Trois atomes extraits** — `AddressText` (adresse bleue + cliquable), `Disclosure` (le repliable enfin
  dessiné : contrôle 44 px, chevron pivotant, anneau doré, prose bornée), `ProofAnchor` (112×44 / 95×44).
  L'ancre de preuve mesurait **59×16 px** avant, sur la page dont le métier est la preuve.
- **Plancher de lisibilité** : l'explication de l'accueil passe de **12,8 px à 16 px** ; `/status` ne publie plus
  le mot `null` sur 24 lignes ; le chrome partagé n'a plus aucun texte sous 12 px (5 instances à 11 px → 0).

**LOI ② AMENDÉE (Founder, à l'écran) :** la PREVIEW GATE passe du **commit** au **DÉPLOIEMENT**. Un commit est
un point de sauvegarde, pas une publication. Le wireframe et l'aperçu restent obligatoires ; **prod ne bouge
jamais sans ses yeux**.

**DETTE RECOMPTÉE depuis les six gardes = 624** *(recomptée le 27-07 en faisant tourner les six, jamais
recopiée : 250 type-scale / 54 fichiers, 196 publics · 46 espacement / 11 · 26 contraste · 36 parité · 193
focus + 1 outline-kill · 74 cibles ; 250+46+26+36+191+1+74 = 624)* — recomptée le 29-07 après la tranche best-practices (4 payés sur /faq). L'écart de 27 avec le 658 du 26-07 se
décompose **exactement** : 12 payés par la tranche EYEBROW (type-scale 267 → 255) et 15 par la tranche
TOUCH (cibles 89 → 74). Les quatre autres gardes n'ont pas bougé.
*(états antérieurs : 646 plus tôt le 27-07 · 658 le 26-07 — 267 type-scale, 213 publics.)*

- [x] **L'EYEBROW DEVIENT UNE SEULE DÉCISION** (27-07). Le libellé de section — mono + majuscules + le
  crénage 0.14em — était **tapé à la main sur 25 endroits dans 18 fichiers** et répondait SIX fois
  différemment à la même question (9px×2 · 10px×8 · 11px×3 · 12px×10 · 14px · 16px) : **13 sous le
  plancher de lisibilité**, sur des surfaces publiques. Le constat §(b)② du fondateur (« les libellés
  10px de ProtocolAssetsCard ») en était **deux**. Désormais `.type-eyebrow` dans `index.css`, qui lit
  `--text-caption` : c'est le PLANCHER qui le déplace, plus un typiste. La couleur reste au point
  d'appel (20 muted · 4 foreground · 3 gold — ça, c'est une vraie décision par endroit).
  **Garde : `guard-type-scale` §⑥** — un eyebrow tapé à la main = BUILD ROUGE, prouvé ROUGE avant le
  correctif (23 échecs + l'absence de la classe). Deux exemptions écrites et mesurées : l'en-tête de
  groupe de dates de `/activity` (14px, vérifié à l'écran) et la carte peinte par satori.
  **Une conversion a été ANNULÉE après mesure au pixel** : dans le ledger de la home, MEMBERSHIP à 12px
  réclame 89px dans une boîte de 80px et débordait de sa carte en desktop — élargir les cartes est une
  recomposition que le fondateur n'a pas vue, donc la dette reste datée.

- [x] **LES PAGES DONT LE MÉTIER EST DE SE LIRE ÉTAIENT LES PLUS PETITES** (27-07). Terms · Risk ·
  Privacy · /chronicle rendaient leur corps de texte en `text-sm` (14px) quand toutes les autres
  surfaces de lecture sont en `type-body` (16→20px fluide) — les deux constats §(b)② du fondateur, et
  un seul défaut. Mesuré au navigateur : **17,41px en desktop · 16px en mobile**, 15 + 14 + 11 + 46
  colonnes de lecture, zéro débordement, zéro scroll latéral. La paire qu'il citait (/chronicle) passe
  de 34px/14px à 29,6px/17,4px. **Garde : `guard-type-scale` §⑦**, prouvé ROUGE sur exactement les 7
  endroits nommés. Le repère est `.measure` (la colonne de lecture 68ch) : il en existe **45** sur le
  site, les 34 restantes hors pages de lecture sont **COMPTÉES dans la ligne PASS du garde**, pas
  bloquantes — les élargir est une tranche à part, désormais visible à chaque build.

- [x] **LE FIL D'ARIANE PUBLIC** (28-07, Option A · M1 · 3e niveau — croquis approuvé :
  `docs/design/breadcrumb-public-wireframe.html`). Avant : les moteurs de recherche recevaient un
  `BreadcrumbList` que **personne ne voyait sur la page** — le seul composant qui en rendait un
  était monté dans la coque de la CONSOLE. Désormais `RouteBreadcrumbTrail` sert les deux, et le
  JSON-LD lit **le même tableau** que l'écran. Le 3e niveau règle le vrai défaut : les cinq pages
  `/referral/*` répondaient toutes « Home › Referral Program ». Les noms sont ceux des ONGLETS,
  pris verbatim, et `check-seo-registry` épingle les deux listes (prouvé ROUGE sur une dérive).
  **Corrigé après la revue du 28-07 :** l'URL de reçu invalide affichait un fil de reçu au-dessus
  d'un corps 404 · deux repères `nav` imbriqués · un `<li>` dans un `<li>` · le lien du fil sans
  boîte (~17px, dans l'angle mort du garde).

- [x] **LE PLANCHER TACTILE DE 44px, ET LE PREMIER CORRECTIF ÉTAIT UN FANTÔME** (27-07). Le constat
  §(b)② (« tous les boutons du parcours /join sous 44px sur un téléphone ») n'était pas un défaut de
  /join : c'était **l'atome Button**, hérité par 106 endroits, dont aucune des quatre tailles
  n'atteignait le plancher (36 · 32 · 40 · 36). Premier correctif écrit avec la variante Tailwind
  le variant Tailwind → le garde a annoncé 15 contrôles réparés ; ⛔ **CORRIGÉ le 29-07 : ce paragraphe affirmait que le variant Tailwind n'émettait aucun CSS. C'ÉTAIT UNE ERREUR DE MESURE**, réfutée par trois arbitres indépendants sur le *vrai build de production*. Deux pièges cumulés : Tailwind échappe le deux-points dans le sélecteur émis (chercher la classe telle qu'ÉCRITE ne peut jamais trouver le CSS tel qu'ÉMIS), et le serveur de dev imbrique la règle dans sa règle de classe au lieu d'une media query de premier niveau (un parcours du CSSOM n'en compte donc aucune). **Le bloc écrit à la main est GARDÉ**, pour la bonne raison : le garde y LIT le 44px du CSS réellement livré, au lieu de faire confiance à un nom de classe.*
**la feuille de style servie contenait
  ZÉRO règle `pointer:`** — la classe ne produisait aucun CSS et le garde certifiait une règle
  qu'aucun navigateur ne recevait. Remplacé par un vrai bloc `@media (pointer: coarse)` écrit à la
  main dans `index.css`, dont le garde **lit** le 44 au lieu de faire confiance à un nom de classe ;
  supprimer le bloc rend le build ROUGE (prouvé). Tactile uniquement : Apple HIG 44 / Material 48 sont
  des règles pour le DOIGT, et WCAG 2.5.5 (44×44) est de niveau **AAA** — le niveau AA, 2.5.8, est
  24×24. Le desktop ne bouge pas : hauteurs de boutons {36:1, 38:4, 44:10, 64:1} identiques avant et
  après. Cibles **89 → 74**, et le point aveugle du garde vérifié inchangé (40) pour qu'aucune dette
  ne soit *cachée* au lieu d'être *payée*.

**⚠ RESTE OUVERT, écrit pour ne pas être pris pour fait :** l'aperçu n'a couvert que `/activity` — la
recommandation de couvrir 3-4 pages tient toujours. 15 constats ergonomiques confirmés sur les autres surfaces
attendent (3 traités). Et 11 entrées de Chronique sont vérifiées mais **candidates**, pas promues.

---
**DEPLOY — ⛔ CE VERDICT EST DÉPASSÉ (26 juil. 2026).** Le lot ci-dessous A ÉTÉ DÉPLOYÉ : prod = l'arc du 26 juillet, DÉPLOYÉ (sha exact : rapport Replit).
Le verdict courant est dans le bloc de reprise de `SESSION_STATE.md`, et il diffère sur un point qui compte :
**le prochain cycle INCLUT des fichiers api-server** (`feedProjection` · `protocolEventReadmodel` ·
`backboneRunner`), donc la phrase « zéro fichier api-server » ci-dessous ne vaut que pour le lot du 25 juillet.
*(texte d'origine conservé comme archive datée)*

**DEPLOY :** ce lot (`11384f5` · `05f16bc` · `2cd7d65` · `57c5fdf`) est **client uniquement, zéro fichier
api-server** — 🚀 **UN SEUL CYCLE GROUPÉ**, non batchable parce que `05f16bc` retire une **promesse
réfutable par la chaîne** de l'en-tête servi et ferme une page publique qui pouvait figer sans issue.
