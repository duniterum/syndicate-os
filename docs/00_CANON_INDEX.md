# CANON INDEX — TheSyndicate OS (la carte des cartes)

**But :** le point d'entrée unique de toute la documentation. Toute session (et
Astronaute) commence ICI. Dit *quel doc est quoi*, *lequel charger au boot*, et *qui
gagne en cas de conflit*. Vit dans le repo : `docs/00_CANON_INDEX.md`.

---

## Ordre d'autorité (qui gagne un conflit)

1. **La chaîne** (Avalanche C-Chain) — autorité sur tous les chiffres.
2. **Le brand board** — autorité sur tout le design (typo/palette/aesthetique).
3. **`THE_SYNDICATE_OS_COMPASS.md`** — la constitution : si un doc-source énonce un
   *fait/état*, le doc-source gagne.
4. **`GRAND_RECONCILIATION_…2026-07-06.md`** — carte-blanche fondateur (lève les gates
   *de process*, garde le spine vérité/sécurité).
5. **ADR-001 / ADR-002** — design system & méthode de travail.
6. Le reste des docs canon, puis la traçabilité (audits).

---

## TIER 0 — Constitution & méthode (CHARGER À CHAQUE BOOT)

| Fichier | Ce que c'est |
|---|---|
| `docs/00_START_HERE.md` | **À LIRE EN PREMIER — le point d'entrée du protocole entier** (ce qu'est l'OS, doctrine verrouillée, les couches, l'ORDRE vers grade-AAA, les rôles). Oriente sur TOUT ; le reste est référence. |
| `CANON_INDEX.md` (ce doc) | La carte des cartes — point d'entrée. |
| `THE_SYNDICATE_OS_COMPASS.md` | Constitution + règle de conflit + doctrine (proof-first, no-fake-live, recognition≠yield, source≠commission). |
| `WORKFLOW.md` | Comment on travaille (Astronaute ↔ Claude ↔ Replit). |
| `ADR-001-design-system-et-methodologie.md` | Le design system system-wide (tokens→primitives→patterns→templates, brand board). |
| `ADR-002-protocole-anti-derive.md` | Le protocole anti-dérive (boot, gate 4 lignes, règles dures, cost discipline). |
| `docs/direction/CANON_VISIBILITY_LAW.md` | **La Loi de Visibilité (fondateur, binding).** Sur une chaîne, « cacher » n'existe pas — il n'y a que **rendre lisible** ou **rendre pénible** ; tout est déjà public. On ne cache RIEN ; on refuse de **FABRIQUER** ce que la chaîne n'a pas. INTERDIT (à ne pas fabriquer) : annuaire · recherche · index inverse siège→wallet · lien forcé wallet↔personne · exposer un membre non-consentant. PERMIS (la chaîne le publie déjà) : adresses d'**infra** (Vault/Liquidity/Operations/Registry/Sale/Token — ce sont des **tuyaux, le wallet de personne**) · toute adresse émise dans un event · TA propre transaction · une adresse que l'acheteur DOIT voir avant de signer · ce qu'un membre choisit de publier (opt-in). **Deux disciplines, deux couches :** le **serveur** n'émet aucune adresse **membre** (pas par pudeur — **aucun annuaire n'existe** ; member-standing = own-row, source = 2 booléens, INCHANGÉ) ; le **client** lit la chaîne comme un explorer (elle est publique). Corollaire : **ce qui PROUVE est public, ce qui DONNE ACCÈS est un secret** (une adresse de contrat prouve ; un token RPC donne accès). Les 5 questions dans l'ordre. |
| `docs/direction/CANON_INVARIANT_VS_STATE.md` | **La loi anti-dérive INVARIANT vs STATE (fondateur, binding).** Tue la boucle des 6 rebuilds : la prudence d'un agent écrite dans le repo (« n'existe pas » / `FUTURE_MODULE`) devient loi, le prochain agent hésite → rebuild. Deux genres : **INVARIANT** (une règle sur le *comment* — seul le fondateur l'écrit ; un agent la cite, l'obéit, ne l'invente JAMAIS) vs **STATE** (une photo du présent — n'importe quelle slice la périme ; qui change la réalité met à jour la ligne STATE dans le MÊME commit ; jamais une porte fermée ni une permission à demander). Règles d'auteur pour agents + la distinction `enabled` (décision fondateur, littéral OK) vs `posture` (dérivé chaîne, littéral JAMAIS). |
| `docs/direction/CONSTITUTION_AUTORITE.md` | **La Constitution d'Autorité (fondateur, binding).** Qui peut changer quoi, ce que PERSONNE ne peut changer, et comment ça grandit. 4 niveaux : **N0 IMMUABLE** (gravé dans le bytecode déployé — 70/20/10, barème 9 ères, plafonds 12%/30%, siège binaire, `SOURCE_REGISTRY` immutable — le founder lui-même est impuissant) · **N1 ON-CHAIN OWNER** (le founder signe une tx, un event public) · **N2 SERVEUR** (8 rôles, fail-closed, journalisé) · **N3 PRÉSENTATION** (copie/ordre/`enabled` — AUCUNE vérité). **Un niveau inférieur ne contredit JAMAIS un niveau supérieur ; aucun niveau n'invente ce que le dessus n'a pas ; s'il ne peut pas lire, il le DIT.** Les 3 formes de contrôle admin (LIRE+VÉRIFIER · PROPOSER=construire-la-tx-le-founder-signe · ÉCRIRE serveur) doivent être VISUELLEMENT différentes. Ordre de lecture d'autorité : site prod → `.sol` (les noms mentent) → founder live → code → docs → origine → jamais la mémoire d'agent. |
| `docs/direction/CANON_LOI_ANTIBLOCAGE.md` | **La Loi Anti-Blocage (fondateur, 2026-07-13, binding).** ① Un rapport d'audit est une LISTE DE PROPOSITIONS, jamais une loi — rien ne bloque sans GO founder. ② Deux sortes de « blocage », ne jamais confondre : un guard qui empêche le SITE DE MENTIR (vérité/légal/fonds) = protection ; un agent qui refuse de CONSTRUIRE parce qu'un doc/guard « dit non » = la maladie, INTERDIT — on lève, on construit, on re-verrouille après. ③ Jusqu'au MVP : machinerie de guards MINIMALE ; le durcissement systématique = Phase 6 DURCIR & SCELLER. Exceptions non négociables : légal · sécurité des fonds · truth-first. Corollaire : un guard existant qui gêne une slice ordonnée → l'agent propose la levée DANS la slice, le founder tranche. |
| `docs/direction/SPEC_REFERRAL_SYSTEM.md` | **La SPEC du système referral/source (fondateur, tranchée).** État chaîne lu en direct (Sale V3 live · **0 source créée** · V3 paie `payoutWallet` direct, pas de router). La seule ligne rouge : gagner pour un ACTE=rémunération OK ; gagner pour une DÉTENTION=rendement INTERDIT ; **jamais un meilleur PRIX SYN**. `sourceId = keccak256("SYN.SOURCE.V1", wallet)` (déterministe, alias par-dessus). `source`(on-chain, payé) ≠ `via`(off-chain, analytics). Escalier Connector 5 barreaux 5%→12% (=`MAX_MEMBER_INTRO_BPS`), le rang ne redescend JAMAIS. **Les 2 bugs (§⑧) : taux=DEVIS jamais `commissionBps` · adresse=`payoutWallet` jamais `sourceWallet` · assertion cohérence fail-closed** (= ce que C1.2b implémente ✅). `HOME_RANK_LADDER` = **l'AXE CAPITAL** (pas du poison ; paliers-par-dépense légaux ; mais le siège reste BINAIRE, capital=axe jamais rang-de-membre). Ordre R1(conditions=metadataHash BLOQUANT)→R2(1ère source, founder signe)→R3(canal)→R4(/source)→R5(indexeur)→R6(escalier)→R7(émetteur). Autorité : le founder, puis les smart contracts. |
| `docs/direction/MVP_FINAL_MASTER_BRIEF.md` | **LE BRIEF MVP-FINAL + LA CARTE 30 JOURS (fondateur, 2026-07-14, scope complet et final).** La séquence : finir le MVP → fenêtre de preuve 30 jours (tous canaux, sauf les wallets du fondateur). Métrique gravée (FLOOR 15 sièges étrangers · ≥5 via liens · ≥1 seconde génération · ≥80% tenus · ≥2 sources demandées / TARGET 40·15·3·90%·5 — la preuve reine = la 2e génération). Les SEPT pièces (hero truth-first · sharebility · couche collectible/vanité · Activity · Chronicle · Economy · Referrer Kit/OG card — 2+3+7 s'imbriquent : la vanité devient l'outil d'acquisition). La VOIX : « la chaîne parle — et elle parle de PERSONNES ». Corrections gravées (ADDENDUM final 2026-07-14 : le siège du fondateur = l'HISTORIQUE #1 Genesis, son wallet privé 0x2445…9C721 — « le premier, c'est moi » ; TOUS les sièges de test V3 (#13 ET #14) = des CADEAUX en attente d'adoption, ces achats ne comptent JAMAIS dans la métrique de preuve ; les historiques #2–#8 = cadeaux destinés aussi ; identités des destinataires HORS repo jusqu'à l'opt-in IDENTITY-ALIAS). LA CARTE M0–M10 (§8) : THIN-V1 par slice, chemin critique = M4 event backbone, gain précoce = M1+M2+M3. Le fondateur choisit la slice 1 ; rien ne s'ouvre avant. |
| `docs/direction/CONNECTOR_LADDER_POLICY.md` | **L'ESCALIER CONNECTOR — FINAL (fondateur, 2026-07-13, binding ; remplace TOUTE version antérieure, y compris SPEC_REFERRAL_SYSTEM §⑤).** Deux échelles découplées : TITRES (denses, gratuits — badge + event public + points de saison) vs TAUX (rares, irréversibles — ne descend jamais, jamais rétroactif). Barreaux tout-automatiques (le seuil décide, la signature exécute) : Emerging 0→5% · Active 3→5% (titre seul) · Trusted 10→6% · Established 25→7% · Durable 60→8% · Foundational 150→10% · Summit 300→12% (= `MAX_MEMBER_INTRO_BPS`). Partner = CLASSE négociée ≤30%, jamais un barreau. « Introduction durable » = le membre introduit tient encore son siège (compté par l'indexeur R5). Promotion = `updateSourceTerms` (seul `commissionBps` change ; wallets verbatim sinon revert) via l'écran PROPOSE, event public. DÉCISION : aucun nouveau smart contract ~6 mois (contrat de promotion · émetteur · Router V4 → cabinet pro sur traction, audit obligatoire ; registre Ownable2Step = transfert propre). |
| `docs/adr/ADR-003-identite-et-confidentialite-anti-doxx.md` | **Identité & confidentialité — anti-doxx par conception.** POURQUOI le modèle est ce qu'il est (pour ne jamais le re-litiger) : la chaîne est publique *mais pseudonyme* ; le danger = **liaison** (wallet↔personne) + **agrégation**, jamais la donnée brute. 3 règles dures : **pas de KYC / identité stockée**, **pas d'annuaire** (own-row ou agrégat), **révélation opt-in** (défaut pseudonyme). Contraint le design reçu/preuve (reçu own-row ✅, annuaire ❌, preuve visiteur = agrégat ✅). Toute identité-réelle/annuaire = go-live fondateur + refonte, jamais un ajout silencieux. |
| `docs/handoff/new-session-handoff-2026-07-09-design-system-primitives.md` | Topo le plus récent : où on en est (fondation + primitives) + la prochaine slice. Le live/DB/auth reste régi par le checkpoint 2026-07-03. |
| `replit.md` | Le contexte que Replit lit. |
| `docs/direction/ORIGIN_RECLAMATION_LEDGER.md` | **Ce que l'origine a mieux INGÉNIÉ + ce qu'on récupère** (lire à chaque boot — anti-entropie). Verdict raffiné : l'enforcement n'a pas *minci*, il a **changé d'altitude** (valeurs-doctrine mieux tenues ici ; couche ÉPISTÉMIQUE jamais portée). Loi opératoire : **l'enforcement est borné par le VOCABULAIRE** (un guard ne peut attraper un faux qu'il n'a pas de mot pour nommer) — axes manquants : FRAÎCHEUR + COUVERTURE. Les 9 mécanismes origine (KEEP/RECLAIM/REFUSE + preuves fichier), ce que syndicate-os fait MIEUX (ne pas régresser), la liste REFUSE, la loi de statut à 3 états (LIVE PROJECTION / SERVED SNAPSHOT / RESERVED-HELD), et le constat d'audit (un chiffre snapshot figé rendu sous la signature live → correction fraîcheur d'abord). |
| `docs/direction/OPEN_QUEUE.md` | **La FILE des décisions EN COURS** (lire à chaque boot — anti-entropie « un niveau au-dessus »). RÈGLE DURE : à chaque gate, Claude Code réénonce la file ENTIÈRE, pas seulement la nouvelle demande ; **rien ne se ferme tant que le fondateur ne l'a pas fermé explicitement.** **Reconstruite DEPUIS LES PREUVES** (historique de session + repo sur disque, chaque item cite un fichier), jamais de mémoire — une liste de mémoire EST la dérive qu'elle combat. Porte un rapport de fusion nommant ce qu'une passe-mémoire a MANQUÉ (ex. l'over-claim signature-live décorative sur `/docs` ; la dérive doc Phase-1 de `MASTER_BUILD_SPEC` ; deux confirmations demandées jamais répondues). |
| `docs/direction/SETTLED_RULES_DO_NOT_RELITIGATE.md` | **Règles TRANCHÉES — ne pas re-litiger** (lire à chaque boot). Tue les « est-ce permis ? » récurrents : LE TEST (recognition **ou** service-payment = SAFE ; yield-sur-capital · SYN-en-récompense · gambling · recognition-convertible-en-cash = RED LINE) + cas réglés (earn/referral/commission = OUI, fee de service en USDC jamais SYN, single-level ; XP/seasons/cagnotte = recognition ; Learn & Earn = earn **XP**). Le **mécanisme** décide, pas le mot. Companion de `GAMIFICATION_LEGAL_DOCTRINE.md`. |
| `docs/direction/CANON_CONVERSION_SURFACE.md` | **LA DOCTRINE DES SURFACES DE CONVERSION (fondateur, 2026-07-14, binding — INVARIANTS ONLY, la règle de mesure de TOUTE page publique).** Le jumeau visuel de la Constitution du Langage (elle gouverne les mots ; ce doc gouverne la scène : hiérarchie, géométrie, poids, vitesse). §1 le test des 5 secondes (What is this? Who is it for? What do I do next? — ~14% du web passe ; chaque page Syndicate DOIT) · §2 le désir avant la preuve (emotion → figure → verify ; la data live = notre différenciateur, jamais cachée, la hiérarchie guide) · §3 UN SEUL CTA primaire par surface (~3× la conversion ; le secondaire reste discret) · §4 géométrie du héros (60–100% viewport desktop, 50–70% mobile ; le premier écran jamais gaspillé) · §5 LA LOI DE LARGEUR HYBRIDE (scènes full-bleed bord à bord, texte contraint ~1200–1440px — le site ne doit plus jamais sembler « encadré dans une boîte ») · §6 budgets de performance (LCP < 2,5s mobile · images WebP/AVIF < 500KB) · §7 mobile AAA (cibles ≥44px, ordre des blocs, CTA au pouce) · §8 signaux de confiance = verify links + chiffres honnêtes, le verify DANS le groupe visuel de la claim · §9 LA GRILLE DE REVUE (9 questions, courue à chaque gate de page publique). Enforcement : la grille au gate (guards minimaux jusqu'au MVP per CANON_LOI_ANTIBLOCAGE). |
| `docs/direction/CANON_PROTOCOL_LANGUAGE.md` | **LA CONSTITUTION DU LANGAGE (fondateur, 2026-07-14, binding — INVARIANTS ONLY, ne périme jamais).** Comment le protocole PARLE : §1 le paragraphe d'identité · §2 la séquence six temps de toute page publique (what this is → live → pending → proof → do now → never promise) · §3 la voix (opérateur calme ; concepts approuvés Enter/Take your seat/Rise/Seal/Verify/Leave a trace/Be remembered…) · §4 les rôles de mots tranchés (referral=public, source=protocole, « Paid to referrer » côté acheteur, la formule money-flow, la phrase doctrinale verbatim, acquisitionCost=bytecode-only) · §5 LE vocabulaire banni consolidé (les guards = bras d'enforcement ; divergences flaggées) · §6 les lignes verbatim jamais reformulées (récoltées exactes du repo) · §7 les TROIS registres (PROOF institutionnel · CONVERSION marketing-intelligent sous la loi « bold claim + verify link » + les lignes vitrines referral · MEMBER chaleureux) · §8 le lexique d'événements (1 event = 1 phrase canonique ; LIVE capturées de M5 + RESERVED autorées). L'application CONVERSION ride M1/M2/M3. |

## RÉFÉRENCE — dossiers feuille-de-route (NE PAS charger au boot ; consulter au slice concerné)

Dossiers de destination Claude-advisor (2026-07-18, `docs/reference/`). **Indicatifs,
PAS des specs** — ils décrivent où une future surface doit arriver ; ils plient
devant la parole du fondateur, le repo live et le canon réglé. À lire au moment de
construire la slice correspondante, jamais au boot.

| Fichier | Ce que c'est | Slice concernée |
|---|---|---|
| `docs/reference/SWAP_BRIDGE_RAMP.md` | Le ramp swap/bridge (moteur LI.FI, porte-pas-marché, jamais d'approbation infinie, câblage admin↔backend↔frontend, le fee comme choix fondateur). | Le ramp swap/bridge (future) |
| `docs/reference/SWAP_GAMIFICATION_LEGAL_DOSSIER.md` | Le benchmark swap + l'inventaire gamification Supa + **la recherche légale US/Suisse/monde** et le CHANGEMENT DE DOCTRINE du pot de saison (paiement au mérite autorisé, jamais chance). | Le moteur saison/gamification (future) |
| `docs/reference/CHRONICLE_LIVING_NEWSROOM.md` | Le Chronicle comme newsroom AAA (on-chain + off-chain document-backed, preuve durable hash+doc+lien officiel, intelligence de détection). | Le newsroom Chronicle (B1/future) |
| `docs/reference/LIVING_NOTIFICATION_LAYER.md` | Ce que NOTIF-1 (déjà scellé en prod) devient : catégories A/B/C/D, moteur de préférences, inventaire complet des événements auto. `never-message-first = externe uniquement`. | La croissance NOTIF-1 (future) |

## TIER 1 — Vue holistique, plan & canonical (CHARGER AU BOOT)

| Fichier | Ce que c'est |
|---|---|
| `the-syndicate-master-operating-map.md` | Carte maîtresse : surfaces + phases. |
| `docs/architecture/FULL_PROTOCOL_VISIBILITY_OS_MAP.md` | La carte OS complète (toutes surfaces visibles). |
| `docs/strategy/FULL_VISIBLE_OS_ORGANISM_2_21A.md` | L'organisme OS complet (holistique, à jour). |
| `docs/architecture/AAA_BUILD_PLAN.md` | Le plan de build Grade AAA. |
| `docs/strategy/GRAND_RECONCILIATION_AND_CARTE_BLANCHE_UNBLOCK_2026-07-06.md` | **Le canonical « Dave » + carte-blanche** — la destination réconciliée. |
| `docs/SYNDICATE_OS_BUILD_INVENTORY_AND_VOCABULARY.md` | Inventaire de build + **vocabulaire** (les noms qu'on utilise). |
| `docs/FOUNDATION_SPEC.md` | Le **spec de la fondation design-system** (tokens 3 tiers, typo fluide, polices, échelles, a11y, perf) — world-class, ce que les slices implémentent. |
| `docs/DESIGN_ROADMAP.md` | **Source unique du workstream design** — phases, cases à cocher « FINI » grade-AAA, suivi du sprawl couleur. Claude Code coche les cases à la fin de chaque slice, dans le même commit. |
| `docs/direction/LIVING_ORGANISM_MASTER_PLAN.md` | **La vision top-level + l'ordre de build (Tracks A–E)** — le protocole comme un pays (économie macro/micro, cockpit, mémoire Activity/Chronicle, modèle de revenu identité/labeling, le Guide). Le travail nouveau est capturé dans le bloc **« Phase 3–6 / later »** de `SESSION_STATE.md` ; la liste **Phase-2 gelée** y reste la séquence canonique. |
| `docs/direction/GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md` | **Le Guide** (assistant support) — hybride déterministe-d'abord, jamais l'AI Layer PENDING ; garde-fous vérité (jamais un chiffre fabriqué), pile sécurité (endpoint isolé, rate-limit/budget/circuit-breaker, filtre output), choix modèle (Groq/DeepSeek). Slice Support (fait) + Guide-LLM (Phase 3). |
| `docs/direction/SEASONS_ENGINE_ON_SYNDICATE_OS.md` | **Le moteur Saisons & Recognition (Phase 5).** Harvest du moteur Supa (XP · quêtes · badges · leaderboard · admin lifecycle), **reward reframé → recognition** (jamais XP→USDC). **Season = Era** (bornes on-chain déterministes) ; **3 horloges** (eras finies · chapters finis · **saisons infinies** = le heartbeat éternel) ; **Learn & Earn = earn XP** ; **funding = argent de la société, discrétionnaire, effort-based, USDC-jamais-SYN, ne touche jamais le 70/20/10** (lawyer-gated). Gouverné par `SETTLED_RULES` + `GAMIFICATION_LEGAL_DOCTRINE`. |

## TIER 2 — Specs de domaine (charger SELON la slice)

| Fichier | Domaine |
|---|---|
| `docs/architecture/ADMIN_SHELL_SPEC.md` | Console admin (shell 10 sections, WordPress-style). |
| `docs/architecture/IDENTITY_ROLES_SPINE_CANON.md` | Identité + RBAC (Founder/Admin/Operator/Auditor/Worker). |
| `docs/architecture/WALLET_FIRST_IDENTITY_ACCESS_AND_USER_REGISTRY_DESIGN.md` · `WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` · `HOLDER_INDEX_READ_MODEL_DESIGN.md` | Identité wallet-first + Holder Index. |
| `docs/architecture/ACTIVITY_HEARTBEAT_READ_MODEL.md` | Backbone d'événements / Activity. |
| `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md` | Frontière des sources (spine vérité/sécurité). |
| `docs/architecture/CAPABILITY_HARVEST_AND_REUSE_MAP.md` · `docs/strategy/DUNITERUM_CAPABILITY_HARVEST_2_20E.md` | Matrices de récolte (PRESERVE/ADAPT/REWRITE/REJECT). |
| `docs/architecture/OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN.md` | Auth opérateur + rôles. |
| `docs/strategy/MEMBER_ECONOMY_…` · `SELF_READBACK_…` · `HOLDER_INDEX_SPRINT_…MEMO.md` | Mémos de décision fondateur (Economy/GDP, self-readback). |

## TIER 3 — Traçabilité (NE PAS charger au boot — référence historique)

- `docs/audits/SLICE_2_17…` → `SLICE_2_20D…` : rapports d'audit slice-par-slice.
- `docs/phase1-*` : ledgers de phase 1.
- `docs/strategy/CORRECTED_DOCTRINE_REHARVEST_2_20G.md`, `PRINCIPAL_PRIOR_ART_AUDIT…`, `PRIOR_ART_RECONCILIATION_2_19D.md` : audits d'art antérieur.
- `docs/handoff/*` anciens, `GO_LIVE.md`, `REPLIT_SETUP.md`, `deploy-readiness-checklist.md`.

---

## Règle d'hygiène (pour ne plus jamais se reperdre)

- Tout nouveau doc canon → **inscrit ici** dans le bon tier, sinon il n'existe pas.
- Fin de session → mettre à jour le topo/handoff + cet index si un doc a changé de tier.
- « Dave » = source stratégique externe, **déjà réconciliée** dans le GRAND_RECONCILIATION ; on ne repart pas des PDF bruts, on lit le doc réconcilié.
