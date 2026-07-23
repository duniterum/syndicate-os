# SEASONS + SWAPRAIL — THE ADVISOR INTEGRATION STUDY (engraved 2026-07-23)

> **ENGRAVING NOTE (Claude Code, 2026-07-23 — read this before the study).**
> Advisor dossier handed by the founder 2026-07-23, engraved verbatim below (§A).
> It is **INDICATIVE — the founder, the deployed contracts, and this repo outrank it.**
> A 6-reader verification pass ran the same day; its corrections and the founder's
> FIVE RULINGS are LAW and supersede the study where they differ:
>
> **Repo-truth corrections (verified 2026-07-23 — do not re-research):**
> 1. **The "durable indexer" the study demands ALREADY EXISTS.** The api-server backbone
>    persists chain events to Postgres (`protocol_event_raw` / `sale_event_raw` +
>    cursors, 50-block reorg overlap, gapless-by-construction; 10 protocol streams +
>    the 4 sale contracts). The seasons arc ADDS season/XP tables on top — it does not
>    build an indexer, and no third-party indexer (Ponder/Envio/Insight) is adopted.
> 2. **Referral is NOT dormant.** `programLifecycle = "LIVE_ACTION"` — the commission is
>    paid to the introducer's payout wallet inside the buyer's own transaction (V3
>    direct payment), proven with real money. The study's "activate referral" step is
>    already done; what remains is the growth work already queued (K-arc, R-slices).
> 3. **QuickNode is ALREADY the prod RPC** (Replit environment — prod env truth is not
>    visible in code defaults). Nothing to wire.
> 4. `SeasonRewardsPool.sol` lives in the external Supa-Exchange repo; this repo holds
>    no Solidity yet — the seasons arc creates the Foundry workspace when the pool
>    contract slice opens.
>
> **THE FIVE RULINGS (founder, 2026-07-23 — engraved in
> `docs/direction/SETTLED_RULES_DO_NOT_RELITIGATE.md` §8, with amendments in
> `CONNECTOR_LADDER_POLICY.md` §5 and `CANON_PROTOCOL_LANGUAGE.md` §5):**
> ① the season bounty pool contract WILL be deployed — contract freeze exempted for it,
> under the care protocol (full Foundry suite · offline + on-chain `verifyClaim()`
> acceptance before any root · Fuji full-round rehearsal · static analysis · the
> founder's own signed deploy); ② the money is SHOWN — including the per-member merit
> share on the public ranking (BUSINESS-FIRST governs; older "never the amount" lines
> superseded); ③ vocabulary adapts to the system, never blocks it (guards amended in
> each surface's slice); ④ zero-operator autonomy — XP from provable/self-verifying
> facts only, no validation queues, 100-year design; ⑤ Season = Era binds on TODAY's
> deployed chain — the future sale/era contract is NOT a prerequisite.
>
> **Mockup pack:** `docs/design/seasons/` — season-visitor-home · season-ranking ·
> season-member · season-admin-2rails (`.mockup.html`, latest Downloads versions,
> 2026-07-23). Design INTENTIONS: rebuilt with repo components, full-screen law (no
> page cap), live one-authority figures, Visual Change Law preview gate per surface.
> Companions: `SWAPRAIL_ASSET_ROUTER_MVP_DECISION.md` · `season-merkle.reference.ts`
> (both in `docs/reference/`).

---

## §A — THE DOSSIER, VERBATIM (advisor, 2026-07-23)

# SYNDICATE OS — ÉTUDE COMPLÈTE & BLUEPRINT D'INTÉGRATION (handoff → Claude Code)

> **Provenance :** dossier advisor, 2026-07-23, synthèse d'une session de recherche profonde :
> lecture du repo réel (`syndicate-os` : canon, docs direction/reference, `artifacts/studio`,
> `api-server`), lecture du contrat `Supa-Exchange/contracts/SeasonRewardsPool.sol`, recherche
> web vérifiée (thirdweb/QuickNode/LI.FI/0x, faits datés 2026-07), et 4 maquettes rendues.
> **Statut : ÉTUDE INDICATIVE, PAS UNE SPEC.** Autorité : le FOUNDER, puis les SMART CONTRACTS,
> puis le repo réel. **Claude Code a la vue complète du code : c'est LUI qui décide du COMMENT**
> (fichiers, composants, découpage en slices, guards). Ce dossier lui donne le QUOI, le POURQUOI,
> les pièges déjà payés, et l'intention design. Toute divergence avec le canon → le canon gagne ;
> tout blocage → `CANON_LOI_ANTIBLOCAGE` (nommer, lever, construire, re-verrouiller).

---

## 0. LE VERDICT EN UNE LIGNE

**QuickNode pour la vérité · thirdweb pour l'accès · nos contrats (OZ custom) pour l'exécution ·
le moteur Seasons calqué sur Chapitres/Ères, autonome, à deux rails (reconnaissance + bounty).**
Rien ne remplace la fondation existante — on l'étend et on la durcit.

---

## 1. PLATEFORMES — LA DÉCISION FINALE (tout est tranché)

| Couche | Choix | Rôle | Statut |
|---|---|---|---|
| **RPC / vérité** | **QuickNode** | RPC Avalanche principal, events, readbacks, Activity/Registry/Transparency, scripts/audits | GARDER · retirer le fallback RPC public en prod |
| **Lecture protocolaire** | **Viem + nos adapters** | la vérité on-chain, fail-closed | GARDER |
| **Exécution économique** | **MembershipSaleV3** `0x2A6cFc…20132E` + SourceRegistry `0x780013…95a6` + Archive1155 `0xB2AE1e…D54d` | inchangés | GARDER |
| **Asset Router V1** | **thirdweb Universal Bridge** derrière un **adapter** | swap · bridge · on-ramp fiat · fund-and-execute du Join · status/webhooks | AJOUTER (couche d'accès facultative) |
| **Contrats** | **Custom Solidity sur OpenZeppelin + Foundry** ; préfabs thirdweb pour les patterns standards (Airdrop/Marketplace/Drops) | thirdweb TOURNE SUR OZ — ce n'est pas un « ou » | RÈGLE PERMANENTE |
| **Front** | monorepo existant (`artifacts/studio` React+Vite+wouter+Tailwind4+shadcn, `api-server` Express+viem, Postgres+Drizzle) | | GARDER · décision Voie A/B ouverte (§8) |

**Faits thirdweb VÉRIFIÉS (2026-07-23)** — ne pas re-rechercher :
frais protocole **0,30 %** crypto→crypto (token source) + **developer fee configurable** (notre
revenu ; modèle proposé +0,20 % → 0,50 % total) · on-ramp agrégé = **Coinbase + Transak + Stripe**,
**0 frais thirdweb sur l'on-ramp** · on-ramp **direct** : ETH / **Avalanche** / Polygon (+ Base US),
autres tokens via on-ramp+bridge (160+ pays) · **off-ramp fiat : INDISPONIBLE** (« Fiat payouts are
not currently available ») → provider externe, post-MVP · fund-and-execute réel (payer en tout
token/chaîne/fiat → conversion → appel du contrat cible) · plans Growth $99 / Scale $499.

**Architecture code demandée (anti-lock-in, loi anti-blocage) :**

```
AssetRouter (notre interface stable)
 ├── ThirdwebBridgeAdapter   ← V1 (adopté)
 ├── ZeroXAdapter            ← alternative si quotes non compétitives
 └── LiFiAdapter / Fallback  ← redondance
```

→ `docs/reference/SWAP_BRIDGE_RAMP.md` (LI.FI-first) est **superseded pour le V1** mais reste la
banque de patterns : les **7 harvests Jumper** (wallet-hook unique, destination-lock USDC-Avalanche,
skeleton client-only, theme injection, piège `no-raw-color` → un seul `widget-theme.ts` d'exception,
capture `?source=` on-chain, event « funds arrived » → handoff `/join`) **s'appliquent à tout widget
embarqué**, thirdweb inclus. La leçon sécurité reste gravée : **jamais d'approval infinie**.

---

## 2. CE QUI NOUS BLOQUAIT — RÉSOLU (les pièges payés, à ne jamais repayer)

1. **L'airdrop Supa qui ne marchait pas.** Le contrat `SeasonRewardsPool.sol` est **bon** (custom
   OZ propre : CEI, nonReentrant, custom errors). Le bug était le **format du leaf Merkle** :
   le contrat attend `keccak256(abi.encodePacked(address,amount))` en **hash simple**, paires
   **triées** (OZ `MerkleProof`) — alors que le SDK thirdweb et OZ `StandardMerkleTree`
   (double-hash + `abi.encode`) produisent d'autres formats → `InvalidMerkleProof` pour tous.
   **Réparé :** `season-merkle.ts` (livré, testé) — `merkletreejs`, `sortLeaves+sortPairs`,
   montants en 6 décimales USDC, `isAddress(strict:false)` puis re-checksum, **self-test offline
   + vérification indépendante de l'algo OZ + `verifyClaim()` on-chain AVANT tout mainnet**.
2. **`hasClaimed` global** dans le contrat actuel → bloque les paiements multiples. Résolu par
   l'évolution `SeasonBountyPool` (§4.3) — décision founder : **multi-rounds DANS le MVP**.
3. **`eth_getLogs` sur RPC public a des trous** → jamais une preuve d'absence (l'erreur « ZÉRO
   sources » du doc referral). → **indexeur durable** (Ponder/Envio/Goldsky ou thirdweb Insight)
   alimentant Postgres, re-org-safe, + QuickNode only. Le read-model reste dérivé, jamais autorité.
4. **Les 2 bugs d'affichage referral** (gravés dans `SPEC_REFERRAL_SYSTEM.md` §⑧) : le taux vient
   du **DEVIS** (`acquisitionCost/grossUsdc`), jamais de `commissionBps` (6 cas où le contrat
   applique 0) ; l'adresse vient de **`payoutWallet`**, jamais `sourceWallet` ; divergence →
   fail-closed, on n'affiche rien plutôt que du faux.
5. **Les noms mentent, lis le `.sol`** : `ReferrerNotSeated` vérifie le solde, pas le siège →
   l'Émetteur R7 vérifie `knownMember` en amont.
6. **Sur-prudence advisor corrigée deux fois — à ne pas reproduire :**
   - « Pas de classement public » = FAUX. `CANON_VISIBILITY_LAW` + ADR-003 amendement 2026-07-15
     (« la fierté du registre public ») : le **registre/ranking public pseudonyme** (n° de siège,
     adresse courte, « brought by 0x… ») est permis et **voulu** (business-first : « on est un
     business, pas une charité »). Lignes rouges (les seules) : lien wallet↔identité réelle,
     annuaire cherchable / reverse-lookup, identité réelle non consentie, KYC stocké, adresse
     complète membre sérialisée. L'alias opt-in remplacera l'adresse.
   - « X jours restants » = FAUX. **La season n'a pas de date** : elle finit quand le
     chapitre/l'ère se remplit (`memberCount ≥ endSeat`). Seul compteur permis : **les sièges**
     (« Runs until Genesis seals · 319 seats left »). Idem pour les rounds bounty : **par palier
     de sièges, jamais par semaine**.
7. **Vocabulaire** : mots connus, zéro charge mentale (« ranking » pas « standing », « Ajouter des
   fonds » pas « abondement ») ; vocabulaire banni respecté sur toute surface publique (jamais
   yield/ROI/passive income/airdrop/claim/jackpot) → l'argent se dit **« earn a share of $2,000
   USDC · by merit, never chance · for what you do, never for what you hold »**.

---

## 3. SWAPRAIL / BRIDGE / ON-RAMP — LE V1 (détails : `SWAPRAIL_ASSET_ROUTER_MVP_DECISION.md`)

**IN (V1) :** swap Avalanche · bridge cross-chain → USDC-Avalanche · on-ramp carte
(Coinbase/Transak/Stripe via une intégration) · **funding du Join** : tout token/chaîne/carte →
route thirdweb → USDC Avalanche → **appel `MembershipSaleV3` inchangé**, chemin direct
**`ZERO_SOURCE_ID`** (aucun sourceId inventé ; guard membres historiques intact) · **un seul frais
transparent** (0,30 % thirdweb + notre developer fee, ex. 0,20 %) vers **une adresse-pipe infra
désignée** (Visibility Law), **argent société, jamais le 70/20/10**, **aucune commission de source
en V1** · status API + webhooks · le tout derrière `AssetRouter`.

**OUT (post-MVP) :** off-ramp fiat (provider dédié) · routage 0x/LI.FI direct · wallets/gas/RPC
thirdweb (on ne remplace pas notre stack) · Split/répartition avancée du frais SwapRail.

**Doctrine engravée :** SwapRail ≠ Membership (une **porte**, pas un desk de trading —
`market-buy ≠ member`) · approvals bornés · avant de figer thirdweb en routeur permanent,
**comparer ses quotes finales vs 0x/LI.FI** sur routes réelles (l'adapter rend le switch gratuit).

---

## 4. LE MOTEUR SEASONS — calqué Chapitres/Ères/transactions, autonome, 2 rails

### 4.1 Les trois horloges (canon `SEASONS_ENGINE_ON_SYNDICATE_OS.md`)
- **ÈRES** = horloge économique, **finie** (9 ères de prix, `eras.ts`) — avance on-chain quand
  `memberCount ≥ endSeat`. **C'est LE trigger.**
- **CHAPITRES** = horloge narrative, **finie** (5 cohortes par n° de membre, `chapters.ts`,
  `chapterForSeat` déterministe). **C'est LE sens.**
- **SEASONS** = horloge d'engagement, **infinie** (1→∞). **C'est LE battement.**
- **TRANSACTIONS** = les actes on-chain (reçus, introductions, burns). **C'est LE carburant (XP).**

**Le calque :** pendant la fondation, **Season = Ère** ; l'ère avance → la season **scelle** → la
suivante ouvre, **atomiquement, jamais une date admin**. Si le chapitre ne se remplit pas, la
season ne finit pas. State machine : `PLANNED → LIVE (ère ouverte) → SEALED (ère avancée) →
PUBLISHED (reconnaissance publiée)`. Après la fondation : cadence propre, pour toujours.

**Pourquoi c'est autonome 100 ans :** le reward par défaut est **la RECONNAISSANCE** (rang, badge,
place au Chronicle) — coût zéro, aucun funding, aucun opérateur ; triggers déterministes on-chain.
Le seul mécanisme banni : **XP → USDC** (conversion reconnaissance→cash).

### 4.2 Rail 1 — Recognition (défaut, MVP, 0 intervention)
**Le XP se crédite SANS validation manuelle** — il dérive de **faits prouvables**, jamais d'une
file à valider ; l'anti-spam = **siège (SIWE) + plafonds + crédit unique**, pas un humain :

| Source | Preuve (labellisée à l'écran) | Crédit | Opérateur |
|---|---|---|---|
| Reçu d'achat (Sale V3) | **⛓ on-chain · lien vers preuve** | AUTO (indexeur) | aucun |
| Introduction convertie (SourceRegistry) | ⛓ on-chain | AUTO au reçu attribué | aucun |
| Burn (Proof of Fire) | ⛓ on-chain | AUTO | aucun |
| Quiz Learn & Earn (≥70 %) | **▢ app · attesté** | AUTO (la grille EST le validateur) · 1×/leçon · cap | aucun |
| Quête (métrique read-model) | ▢ app · attesté | AUTO à métrique atteinte | aucun |
| Feedback (bug/idée/question) | ▢ app · attesté | AUTO à faible enjeu, plafonné/jour | curation **optionnelle**, jamais bloquante |

Hybride assumé : **une seule identité** (wallet/SIWE) relie les deux niveaux ; XP
**non-transférable, sans valeur cash** quelle que soit la source (`GAMIFICATION_LEGAL_DOCTRINE`).
Learn & Earn : **le moteur de Supa, ZÉRO contenu de Supa** (leurs leçons = vocabulaire banni) ;
nos leçons truth-first (chaque leçon lie la surface de preuve live). Axes multi-reconnaissance
(Connector/Verifier/Builder/Historian/Capital/Steward…) — le capital est un axe, jamais le trône ;
**le rang ne redescend jamais** (modèle GitHub). Bonus post-MVP élégant : au seal, commiter
on-chain un merkle root de l'état XP final → l'off-chain devient tamper-evident (réutilise l'infra
merkle, une tx).

**Seal (auto) →** snapshot gelé → candidate **Chronicle** (CHR-1 : la machine détecte, **le
founder promeut** — l'unique clic humain) → **milestone** ancré à la tx d'avancement d'ère →
**marque permanente** au profil → archive append-only. Rien ne s'efface.

### 4.3 Rail 2 — Cash Bounty (MVP, founder-gated, multi-rounds)
**Décisions founder gravées :** les 2 rails sont **actifs dès le MVP** ; paiements **multiples
pendant une season** ; funding **en continu** (« Ajouter des fonds » — tout d'un coup ou petit à
petit, le pot s'accumule, chaque ajout audit-logué) ; **la seule décision humaine = combien
funder** ; tout le reste automatisé (policy déterministe **par palier de sièges, jamais une
date**) : snapshot → distribution mérite (top-N, ex. 30/30/40) → merkle → ouvrir round → claim
**ou push** (top-N borné : pousser l'USDC, pattern CommissionRouter push+escrow — le membre ne
paie pas le gas) → clôture au palier → reste au pot → audit (tx → `audit_log`).

**Ligne légale (dossier `SWAP_GAMIFICATION_LEGAL_DOSSIER.md`, ne pas re-litiger) : MÉRITE JAMAIS
CHANCE · pour un ACTE jamais une DÉTENTION · argent société (loyauté, discrétionnaire, modèle
Coinbase) · USDC jamais SYN · pas de stake requis · ne touche jamais le 70/20/10.**

**Contrat — évolution `SeasonBountyPool` (spec pour Claude Code) :**

```solidity
// base = SeasonRewardsPool.sol (garder : OZ, CEI, nonReentrant, custom errors, fund() permissionless)
mapping(uint256 => bytes32) public merkleRootOf;                 // round → root
mapping(uint256 => mapping(address => bool)) public claimed;     // pas de lockout inter-rounds
// leaf = keccak256(abi.encodePacked(roundId, account, amount)); // anti-rejeu inter-round
// openRound(roundId, root) onlyOwner · claim(roundId, amount, proof) · verifyClaim(...) view
// un pool PAR SEASON, financé en continu, N rounds
```

+ variante **round-aware de `season-merkle.ts`** (leaf `['uint256','address','uint256']`, même
self-test + `verifyClaim`). ⚠️ **Tension à arbitrer par le founder :** le repo porte une règle
« pas de nouveau smart contract ~6 mois » (`MVP_FINAL_MASTER_BRIEF`). Fallback propre si le gel
tient : démarrer le rail cash avec le `SeasonRewardsPool` **existant en 1 pool par round**
(déployé à chaque round — zéro nouveau code), et basculer sur `SeasonBountyPool` au dégel.
Lawyer-gate au moment d'activer le rail cash (déjà cadré par le dossier légal).
*(RÉSOLU 2026-07-23 : ruling founder ① — le gel est amendé, `SeasonBountyPool` se construit
et se déploie sur le protocole de soin. Voir l'en-tête d'engraving.)*

**Futur (Phase 5+, déjà acté au canon) :** le **nouveau contrat Sale/Ère** (corrige le défaut de
cap par wallet) se conçoit **avec** le binding season⇄ère — jamais un contrat season standalone.

---

## 5. LES SURFACES — comment ça se présente (intention design, à ADAPTER au réel)

**Règle absolue pour Claude Code :** les maquettes livrées sont des **intentions**, pas des
vérités. Elles utilisent les **vrais tokens** (Instrument Serif / Work Sans / IBM Plex Mono ·
gold `hsl(42 92% 60%)` · cyan `hsl(190 90% 50%)` · dark `hsl(224 71% 4%)`) mais doivent être
reconstruites avec les **composants du repo** (`StatusPill`, `LifecycleBadge`, `MemberShell`,
`AdminShell`, atoms `syn-*`) et passer la **Visual Change Law** (wireframe founder-approuvé +
preview gate avant commit). Règle posture : **une surface live ne porte AUCUN badge** ; seul le
non-câblé/futur porte un `LifecycleBadge`.

### 5.1 Home VISITEUR (`PublicHome.tsx` — on étend, on ne réinvente pas)
Anatomie réelle conservée (hero cockpit « A permanent, numbered seat, *written on-chain.* » + un
seul CTA or « Take your seat » · TrustStatusStrip · Real surfaces · Mechanics of Truth · Radical
Honesty). **Ajouts :**
- **Section SEASON plein écran** (2 colonnes) : pitch + jauge sièges (« 14/333 · 319 before
  Genesis seals — forever », **jamais de jours**) + CTA « Take your seat — enter Season 1 » ;
  à droite **LA CAGNOTTE VISIBLE** : « Season 1 · earn a share of **$2,000 USDC** · by merit,
  never chance · Runs until: Genesis seals · Seats left: 319 · Members earning: 12 ».
- **Teaser ranking top-3** (podium or/argent/bronze, pseudonyme) + lien **« See full ranking → »**
  vers la page dédiée (best practice : 1 CTA dominant sur la home, la profondeur sur sa route).
- **Registre public** (amendement « fierté ») : lignes d'events republiées telles quelles
  (« Member #14 · 0xea8…5881 entered the register — brought by 0x3f2…0a91 »).

### 5.2 Page RANKING dédiée (nouvelle route publique, ex. `/season`)
Cagnotte en tête + statut season (paliers) · filtres d'axes (Overall/Connector/Verifier/…) ·
podium · **tableau complet** : rang · Membre # · adresse courte (→ alias opt-in) · axes · XP ·
**part $ par mérite** · **ligne « YOU » surlignée** (session) · saisons passées (SEALED → Chronicle).
Pseudonyme, pas de recherche membre, pas de reverse-lookup.

### 5.3 MEMBER HOME (`MemberAccess.tsx` — les slots réservés existent déjà !)
La structure réelle (Z1 seat band · Z2 6 KPI · pulse · snapshot · doors) porte déjà
`MEMBER_HOME_RESERVED_SLOTS` = **Season** et **Quests** en `FUTURE`. Le travail = **remplir ces
slots** : carte Season (n° + nom, jauge sièges, ton XP/rang/axes — **reconnaissance uniquement,
aucun montant ici**) · strip Quêtes (2-3 chips avec XP + axe, crédit auto) · et une carte
**« Récompense d'effort »** visuellement **séparée** (rail cash : « Tu es éligible : $40 USDC ·
Round 2 · mérite · ouvert jusqu'au prochain palier de sièges » + bouton réclamer / push) — la
séparation des 2 rails est **visible** pour le membre aussi.
*(AMENDÉ 2026-07-23, ruling ② : les montants PEUVENT s'afficher — la séparation visuelle des
deux rails reste.)*

### 5.4 ADMIN (`AdminShell` — nouvelle section « Seasons » dans `ADMIN_SECTIONS`)
Console à **2 rails distincts** (la confusion de l'ancien AdminSeasons venait du mélange
reconnaissance/argent dans une seule state machine) :
- **Rail Recognition (défaut)** : compteur d'autonomie (« XP : 0 clic · Recognition : 1 clic
  optionnel »), cycle `PLANNED→LIVE→SEALED→PUBLISHED` (tout AUTO sauf la promotion Chronicle),
  table des sources XP avec labels ⛓/▢, ranking, archive. **Aucun pool, aucun claim.**
- **Rail Cash Bounty (founder-gated, step-up)** : chips légaux (mérite/USDC/argent société) ·
  **« Ajouter des fonds »** avec journal des ajouts + total du pot · rounds par **palier de
  sièges** · pipeline 8 étapes AUTO après le funding · audit.
- Garder le meilleur de l'AdminSeasons de Supa : state machine visible, **next-step engine**,
  actions guardées, audit, archive — reskinné, RBAC + step-up du shell.

---

## 6. INCOME STREAMS — l'inventaire vérifié et l'ordre d'allumage

Deux poches jamais mélangées : **70/20/10 verrouillé au siège** vs **argent société** (fees/services).
Filtre pour tout ajout : **un ACTE ou un SERVICE ✅, jamais un rendement ❌.**

| Stream | Statut vérifié dans le code | Action |
|---|---|---|
| Vente de siège (Sale V3 → 70/20/10) | ✅ LIVE, paie | — |
| Commission referral (SourceRegistry) | LIVE (paiement direct V3 dans la tx acheteur) | growth per `SPEC_REFERRAL_SYSTEM` (R-slices) |
| **Patronage Archive1155** (0,50/5 USDC → `treasury()`) | contrat DÉPLOYÉ, **mint UI OFF** (« do not enable mint UI ») | **QUICK WIN #1 : la surface de mint** (founder-gated) |
| Fee SwapRail (developer fee thirdweb) | designé (§3) | V1 avec l'Asset Router |
| Vente d'alias (ENS-like, non-tradeable) | designé, lawyer-gated | post-MVP |
| Labeling d'adresse (modèle Etherscan/Arkham — « le plus fort » per canon) | designé | post-MVP |
| Guide premium · marketplace fee (Ph.12, thirdweb Marketplace V3 le jour venu) · x402 API (Ph.11) | futur | — |
| Ajouts doctrine-safe possibles | royalties EIP-2981 (collectibles season), drops premium, merch, off-ramp fee, BD/PARTNER | backlog |

---

## 7. INFRA / DURCISSEMENT GRADE AAA

1. **Indexeur durable** — *(RÉSOLU : existe déjà — voir l'en-tête d'engraving, correction 1;
   reste : les tables season/XP par-dessus.)* Read-model dérivé, fail-closed, Protocol Time
   (jamais wall-clock).
2. **Foundry** (workspace à créer) : fuzz + invariants sur SeasonBountyPool, futur Sale/Ère ;
   `verifyClaim()` avant toute root ; testnet avant mainnet.
3. **CI stricte** : typecheck + guards-chain (500+) + `forge test` + preview, bloquants (déjà
   « one writer main » → parfait).
4. **Observabilité** : RUM Core Web Vitals, latence RPC, lag indexeur, alerting.
5. **Sécurité widget** : approvals bornés, QuickNode only, `widget-theme.ts` = l'unique exception
   `no-raw-color` documentée AVANT la slice.

---

## 8. DÉCISIONS OUVERTES — founder (rien d'autre n'est ouvert)

1. **Site public : Voie A** (Vite SPA + prerender durci) **vs Voie B** (surface publique/SEO →
   Next.js SSR/ISR, app member/admin inchangée). Critère unique : le SEO/contenu est-il un pilier
   de croissance ? Pas de big-bang dans les deux cas. Cibles Phase 6 : LCP≤2,5s · INP≤200ms · CLS<0,1.
2. **Developer fee SwapRail** (proposé 0,20 % → 0,50 % total) + l'adresse-pipe du frais.
3. **Taille/cadence du pot bounty** (quel % du budget marketing, quels paliers de sièges, top-N,
   courbe de mérite — toujours déterministe).
4. ~~Gel contrats 6 mois~~ — *(RÉSOLU 2026-07-23, ruling ① : `SeasonBountyPool` se construit.)*
5. **Nom de la route ranking** (`/season` proposé) + wording final de la cagnotte.
6. Lawyer-gate à l'activation du rail cash (dossier légal déjà constitué — Phase-5 pass, comme prévu).

---

## 9. ORDRE DE CONSTRUCTION (amendé par les rulings 2026-07-23 — season-first)

1. **S1 — Fondation données season** : tables `seasons` (eraIndex, start/endSeat dérivés),
   `seasonXp`, `quests`, `badges` sur l'indexeur EXISTANT + binding ère⇄season déterministe.
2. **S2 — Rail Recognition (surfaces)** : page `/season` + section home visiteur + slots Member
   Home (Season + Quêtes) + section admin Seasons (rail 1) — wireframe + preview gate chacune.
3. **S3 — Le contrat + rail Cash** : Foundry workspace + `SeasonBountyPool` (protocole de soin,
   ruling ①) + `season-merkle` round-aware + pipeline rounds par palier + « Ajouter des fonds » +
   carte membre « Récompense d'effort ». Activation lawyer-gated (Phase-5 pass).
4. **Quick win income** : surface de mint patronage Archive1155 (founder-gated; lié AW-5).
5. **Learn & Earn** : moteur quiz→XP (contenu à nous), axes Verifier/Historian.
6. **SwapRail V1** : AssetRouter + ThirdwebBridgeAdapter (décisions §8-2 requises) + funding du
   Join (`ZERO_SOURCE_ID`), frais unique, comparaison quotes 0x avant de figer.
7. **K4 → P → Hardening Phase 6** : perf, a11y, audit sécurité, éventuelle Voie B.
*(M-EVO-3 et A5 gardent leur spec engravée et se glissent là où ils servent l'arc.)*

**Gate qualité de CHAQUE slice (le 15-points du canon) :** aucune donnée simulée rendue live ·
truth labels partout · figures lues de la chaîne · vocabulaire per SETTLED_RULES §8-③ · pas de
PII · guards jamais affaiblis · tests+typecheck verts · rollback énoncé · API/UI séparées ·
verdict de deploy · wireframe founder-approuvé pour tout changement visuel.

---

**La ligne de fond pour Claude Code :** tout ce qui précède se plie au founder, aux contrats
déployés et au canon du repo. La base existante est bonne — on ne la remplace pas, on branche
dessus : **l'accès (thirdweb), le battement (seasons autonomes), et l'argent montré fièrement,
proprement séparé.** Don't trust, verify — y compris ce dossier.
