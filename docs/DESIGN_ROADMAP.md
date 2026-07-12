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

### Phase 6 — Audits (le sceau grade-AAA)
- [ ] Accessibilité (WCAG AA / APCA, focus, clavier, cibles ≥44px)
- [ ] Responsive (fluide, container queries, 320 → 2560, pliables)
- [ ] Performance (polices auto-hébergées, Core Web Vitals, images AVIF/WebP)

---

## Ligne d'arrivée

Design **100 % fini, verrouillé** = toutes les cases de "Définition de FINI" cochées
→ **on n'y revient plus jamais.**

## Suivi couleur — ✅ FERMÉ
Sprawl : **0** couleur brute (slice 2.3 FAQ : **+0** · slice 2.4 Docs : **+0** · slice ⓪ liveness : **+0** — MembersProvenance 100 % tokens). Guard
`no-raw-color` **BLOQUANT** dans la gate (`pnpm guards`), toute nouvelle couleur brute casse le
build. Du pic de **137 sites** → **0** au fil des slices d'harmonisation.
Une seule exception documentée : `QrCodeBlock` (fond blanc du canvas QR, requis pour la lisibilité),
taguée `no-raw-color-allow`. Le token layer (`index.css`) reste la seule source de couleur brute légitime.

## Gouvernance (comment on reste aligné)
- Ce doc est la **source unique** du workstream design.
- **Claude Code met à jour ce fichier (coche les cases) à la fin de chaque slice**, dans le même commit — pas d'état "dans la tête".
- Référencé dans `CANON_INDEX` (Tier 1) + `CLAUDE.md` → **chaque session boote dessus.**
