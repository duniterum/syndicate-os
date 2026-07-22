# SPEC — LE SYSTÈME REFERRAL / SOURCE
## Pour Claude Code. Tout est décidé. Rien ne se re-discute.

**AUTORITÉ : le FOUNDER, puis les SMART CONTRACTS. Rien d'autre.**
Si un fichier, un guard, un commentaire ou un doc te bloque : **ce n'est pas une loi.**
Nomme-le, dis pourquoi, **et avance.** Carte blanche.

> **🔴 FOUNDER OVERRIDE, PERMANENT (2026-07-13) — « referral pas actif dans le MVP » est MORT.**
> **Le referral ACTIF fait partie du MVP** et s'allume dès que possible : flip C5 → le test $5 PAR
> le lien referral → puis l'activation de la couche publique referral comme sa propre slice
> founder-gatée (bascule `programLifecycle` + copie + cartes membre + adaptation de
> `guard-safe-source` proposée DANS la slice, loi anti-blocage). La ligne R4
> `programLifecycle = "NOT_ACTIVE"` ci-dessous est un **STATE d'aujourd'hui**, pas une loi —
> la slice d'activation la bascule. **Aucun agent ne re-soulève la vieille règle.**

---

# ⓪ LES ERREURS DÉJÀ FAITES — NE PAS LES REFAIRE
## L'advisor s'est trompé sur chacune. Elles sont TRANCHÉES. Ne les rouvre pas.

| L'erreur | La vérité |
|---|---|
| *« Payer à vie = MLM »* | ❌ **FAUX.** Le test FTC (Koscot) ne parle JAMAIS de durée. Il parle de **recruter des VENDEURS** avec des récompenses **déconnectées d'une vente réelle**. Le récurrent à vie est **le standard du SaaS**. |
| *« Exiger de détenir du SYN = staking déguisé »* | ❌ **FAUX.** C'est du **« member in good standing »**. Précédent : **Together Credit Union** — *« maintenir 5 $ d'épargne · être en règle pour toucher la prime de parrainage »*. **Le solde ne rapporte RIEN. C'est l'ACTE qui paie.** |
| *« Des paliers par montant dépensé = wealth ranking interdit »* | ❌ **FAUX.** Sephora, Ulta, Marriott, Uber, American Airlines, Starbucks. **C'est universel et légal.** |
| *« Le taux doit décroître si le membre est inactif »* | ❌ **REJETÉ PAR LE FOUNDER.** *« On ne rétrograde pas un ami parce qu'il s'est reposé. »* **Le rang est acquis. Il ne redescend jamais.** |
| *« Un affilié doit être membre »* | ❌ **FAUX.** Aucun affilié Amazon n'a de compte Prime. **Le contrat a déjà séparé les classes.** |

## 🔴 LA SEULE VRAIE LIGNE ROUGE
**Ce n'est PAS le palier qui est légal ou non. C'est CE QU'IL DÉBLOQUE.**

| Ce qu'un rang donne | Verdict |
|---|---|
| Reconnaissance · statut · accès · visibilité · support prioritaire | ✅ **LÉGAL** (c'est Sephora) |
| Une **commission** pour un **ACTE** (une introduction) | ✅ **LÉGAL** (c'est un barème de vendeur) |
| 🔴 **Un meilleur PRIX sur le SYN** (plus de tokens par dollar) | ❌ **INTERDIT.** Multiplicateur financier sur un actif revendable. |
| Un rendement · une part des profits · un droit sur le Vault | ❌ **TITRE FINANCIER** |

> ## **GAGNER POUR UN ACTE = rémunération.**
> ## **GAGNER POUR UNE DÉTENTION = rendement. INTERDIT.**

---

# ① L'ÉTAT DE LA CHAÎNE — lu en direct

| | |
|---|---|
| **Sale V3** `0x2A6c…` | ✅ vivante · pas pausée · **ère 1** · **12 membres** |
| **SourceRegistry** `0x780013…` | ✅ déployé · **`immutable` dans la Sale — NE PEUT PAS être remplacé** |
| **Sources créées** | ✅ **UNE, ACTIVE** — `sourceId 0x8338e9ff…1cf620` · `BUILDER_SOURCE` · **5%** · **LIFETIME** (pas de fenêtre) · aucun plafond · `appliesToRepeatPurchases` · `payoutWallet` = `0x244531C5…9C721` (un membre historique) · ré-activée au bloc 89642946. **⚠️ CORRECTION : ce doc disait « ZÉRO » — c'était FAUX**, hérité d'un scan `eth_getLogs` sur RPC public qui avait des **trous**. Vérité rétablie par un scan de logs COMPLET (Routescan). **LEÇON : un scan `eth_getLogs` sur RPC public n'est PAS une preuve d'absence.** |
| **CommissionRouter** | ⚠️ **PAS déployé** (confirmé : aucune adresse nulle part · `Deploy.s.sol` force `address(0)` · `V2.commissionRouter()==0x0` · `commissionRouter()` REVERT sur V3). Et le V3 ne l'utiliserait pas — il paie `payoutWallet` **directement**. C'est un DESIGN (V4), pas un asset. |

**Une source EST active — C1.2b est testable MAINTENANT** (`/join?source=0x8338e9ff…1cf620` → le devis renvoie `acquisitionCost=$50` pour $1000, la ligne « Paid to your referrer · 5% · payoutWallet » s'affiche). ⚠️ Le taux À AFFICHER vient du DEVIS (calcul effectif), jamais de `commissionBps` — voir §⑧.

---

# ② LES PARAMÈTRES DE LA PREMIÈRE SOURCE
## Décidés par le founder. **À signer par LUI. Jamais par un agent.**

```solidity
createSource(sourceId, SourceTerms{
    sourceWallet:             <le wallet du founder>,
    sourceClass:              MEMBER_INTRODUCTION,        // 0
    commissionBps:            500,                        // 5 % — Emerging Connector
    scope:                    LIFETIME,                   // 3
    startTime:                0,                          // immédiat
    endTime:                  0,                          // jamais
    grossCap:                 0,                          // AUCUN plafond
    perBuyerCap:              0,                          // AUCUN plafond
    appliesToRepeatPurchases: true,                       // payé sur TOUS les achats
    payoutWallet:             <le wallet du founder>,     // ⚠️ QUASI DÉFINITIF
    metadataHash:             keccak256(<les conditions du programme>)   // ⚠️ OBLIGATOIRE pour LIFETIME
})
```

## ⚠️ CE QUE LE CONTRAT EXIGE — sinon il REVERT
| Contrainte | L'erreur |
|---|---|
| `LIFETIME` **exige** un `metadataHash` ≠ 0 | `MissingMetadata` |
| `MEMBER_INTRODUCTION` **plafonne à 1200 bps (12 %)** | `InvalidCommission` |
| `sourceWallet` et `payoutWallet` ≠ 0 | `ZeroAddress` |
| Le `sourceId` ne doit pas exister | `SourceExists` |

## ⚠️ TOUTE SOURCE NAÎT `PAUSED`
**Créer ≠ activer.** `setSourceStatus(sourceId, ACTIVE)` est un **acte séparé**.
**C'est voulu.** Ça permet de tester le fail-closed avant d'ouvrir le robinet.

## 🔴 LE `metadataHash` — IL FAUT LE DOCUMENT
`LIFETIME` **oblige** à hasher un document. **C'est une protection, pas une contrainte.**
→ **Les conditions du programme de referral** : écrites, publiées, hashées.
→ **C'est aussi ce qui rend le « good standing » opposable** (droit des associations).
**Sans le document, `createSource` REVERT.**

---

# ③ LE `sourceId` — DÉTERMINISTE, DEPUIS LE WALLET

```
sourceId = keccak256(abi.encodePacked("SYN.SOURCE.V1", wallet))
```

**Pourquoi le WALLET et jamais un alias :**
- **Déterministe.** Chaque wallet a exactement UN `sourceId` possible. **Zéro collision. Zéro squat.**
- **Il existe dès le jour 1**, sans registre de noms, sans arbitrage.
- **L'émetteur (§⑦) pourra le calculer tout seul.**

## L'ALIAS SE POSE PAR-DESSUS — sans jamais toucher au `sourceId`

**Le système d'alias est DÉJÀ conçu** — `TheSyndicate/src/lib/recognition-candidates.ts` :
```
DEFAULT_DISPLAY_TIER = "anonymous"
  anonymous  → « Member #217 ». LE DÉFAUT.
  alias      → nom choisi par le membre. Auto-déclaré, non vérifié. RÉSERVÉ.
  public     → visibilité publique auto-déclarée.
```

**Le lien accepte les DEUX formes :**
```
/join?source=0x7f3a…    ← marche AUJOURD'HUI (le sourceId, direct)
/join?source=kemal      ← marchera DEMAIN (le serveur résout : kemal → wallet → sourceId)
```

> ## L'alias est une COMMODITÉ. **Jamais une IDENTITÉ.**
> ## **Le `sourceId` ne change JAMAIS.** Change d'alias dix fois : tes commissions ne bougent pas.

**C'est exactement l'ENS.** `vitalik.eth` peut expirer, être vendu. **L'adresse reste l'adresse.**
**Zéro migration. Zéro transaction. Zéro rupture le jour où les alias arrivent.**

---

# ④ `source` ≠ `via` — DEUX CHOSES DIFFÉRENTES

```
/join?source=SYN-KEMAL&via=twitter
              ↑              ↑
      QUI est payé      D'OÙ vient le clic
      → ON-CHAIN        → OFF-CHAIN
      → 1 par membre    → autant qu'il veut
      → de l'argent     → de l'analytics
      → gaté            → LIBRE, INSTANTANÉ, ZÉRO TRANSACTION
```

## `via` — LE CANAL. **100 % SELF-SERVICE, DÈS AUJOURD'HUI.**
- Le membre ajoute `&via=twitter`, `&via=blog`, `&via=telegram` — **tout seul, en une seconde.**
- **Aucune transaction. Aucune approbation. Aucun founder.**
- **Le contrat s'en fiche** — il paie `sourceId`, toujours le même.
- **Le SERVEUR l'enregistre** : *« 12 clics Twitter, 3 du blog, 1 a converti. »*

## ⚠️ NE JAMAIS CRÉER UN `sourceId` PAR CANAL
Kemal+Twitter, Kemal+Facebook, Kemal+blog = **3 transactions founder, même wallet, même taux.**
**On multiplierait par cinq le problème qu'on veut supprimer.**

## Et le truc que personne ne peut copier
Chez tous les autres, l'attribution du canal est une **donnée qu'il faut croire** (cookie, pixel).
**Chez nous, le `via` est capté au clic — et l'achat qui suit est ON-CHAIN.**
> *« Ce reçu `0xab12…` vient d'un clic Twitter du 12 mars. »*
> **Le canal est off-chain, mais il pointe vers une PREUVE on-chain.**

---

# ⑤ L'ESCALIER CONNECTOR — 5 barreaux. ZÉRO nom inventé.

| Rang | Taux | bps | D'où vient le nom |
|---|---|---|---|
| **Emerging Connector** | **5 %** | 500 | `protocol-graph.ts` |
| **Active Connector** | **7 %** | 700 | `protocol-graph.ts` |
| **Trusted Connector** | **9 %** | 900 | `referralProgram.ts` |
| **Established Connector** | **10,5 %** | 1050 | `protocol-graph.ts` |
| **Foundational Connector** | **12 %** | 1200 | `protocol-graph.ts` — **LE PLAFOND ON-CHAIN** |
| — **PARTNER** *(la porte)* | jusqu'à **30 %** | ≤3000 | `referralProgram.ts` — **classe différente, accord signé** |

> ## **`Foundational` = 12 % = `MAX_MEMBER_INTRO_BPS`.**
> ## Le sommet de la reconnaissance **EST** le plafond du contrat. **Cohérence, pas coïncidence.**

## 🔴 NOMS BANNIS — ILS COLLIDENT
`Cornerstone` *(= un palier à 10 000 $ dans `HOME_RANK_LADDER`)* ·
`Operator` *(= un RÔLE privilégié S11 + un axe)* · `Builder` *(= un axe + `BUILDER_SOURCE` on-chain)* ·
`Steward` *(= un axe)* · `Scout` *(= doublon de Connector)* ·
`Custodian` *(⚠️ **confusion avec « custodial wallet » — un concept de sécurité crypto**)*

## LE RANG NE REDESCEND JAMAIS
**Décision du founder :** *« Imagine un ami qui a beaucoup fait pour toi, et tu lui dis :
si tu ne continues pas, je te rétrograde. »* **Non.**

> ## **LE RANG EST ACQUIS. LE TAUX MONTE. IL NE DESCEND PAS.**
> ## Ce qui vit, c'est le **CLASSEMENT DE LA SAISON** — qui montre le PRÉSENT.
> ## **C'est GitHub :** le graphe montre l'année en cours ; **tes 800 commits d'il y a trois ans sont toujours là.**

**Et ça ne t'expose pas :** la commission est un **% d'une vente réelle**. Pas de vente, pas de coût.
**Un membre inactif à 12 % coûte exactement ZÉRO.**

## 🔴 LA RECONNAISSANCE NE CONFÈRE RIEN — elle DÉCRIT
`recognition-candidates.ts` : *« Recognition confers **NO rights, rewards, or governance**. »*

**Le taux ne vient PAS du badge. Il vient des ACTES.**
```
Tes introductions qui sont restées
        ├──→ ton TAUX      (rémunération d'un TRAVAIL)
        └──→ ton RANG      (le NOM de ce travail)
```
> ## **La reconnaissance NOMME ce que tu as fait. La commission PAIE ce que tu as fait.**
> ## **Aucun ne cause l'autre. Les deux dérivent des mêmes faits on-chain.**
> **Le badge ne débloque rien. Il décrit.** ← **À écrire dans le code, sinon un agent croira qu'on achète un badge.**

---

# ⑥ DEUX PORTES. DEUX PUBLICS. **Le contrat les a déjà séparés.**

```solidity
if (sourceClass == MEMBER_INTRODUCTION && SYN.balanceOf(sourceWallet) == 0)
    revert ReferrerNotSeated();     // ← NE s'applique QU'À MEMBER_INTRODUCTION
```

| | **REFERRAL MEMBRE** | **AFFILIATION** |
|---|---|---|
| Classe | `MEMBER_INTRODUCTION` | `AFFILIATE` · `BD_NETWORK` · `BUILDER_SOURCE` · … |
| **Doit détenir du SYN ?** | **OUI** | **NON** |
| Plafond | **12 %** | **30 %** |
| `metadataHash` | requis pour `LIFETIME` | **TOUJOURS obligatoire** |
| Qui c'est | un membre qui **présente** | quelqu'un qui fait ton **marketing** |
| Comment | **SELF-SERVICE** *(§⑦)* | **le founder ouvre. Il y a un contrat signé.** |

**Un affilié fait de la PUB. Un membre PRÉSENTE. Ce ne sont pas les mêmes gens.**
**Et un affilié qui ne détient rien n'a AUCUN conflit d'intérêt. Il vend un SERVICE, pas un ACTIF.**

---

# ⑦ LE SELF-SERVICE — UN CONTRAT, JAMAIS UNE CLÉ SUR UN SERVEUR

## Le mur
`createSource` est **`onlyOwner`**. Le registre est **`immutable`** dans la Sale.
**→ Chaque source exige une transaction du founder. Pour toujours.**

## 🔴 CE N'EST PAS UNE LIMITE. **C'EST LE FOSSÉ.**
**42 % des SaaS ABANDONNENT leur programme d'affiliation — 15 à 20 % de perte par FRAUDE.**
**Ce problème n'existe pas ici, PRÉCISÉMENT PARCE QUE l'inscription n'est pas libre.**

## L'ÉMETTEUR — la solution propre
**Transférer l'`owner` du registre à un contrat qui n'a QU'UNE fonction :**
```
requestMySource()      ← le MEMBRE l'appelle. Lui-même. Il paie son propre gas.

  vérifie ON-CHAIN :
    · sale.knownMember(msg.sender)              ← ⚠️ LE SIÈGE. Pas le solde.
    · sale.memberNumberOf(msg.sender) > 0
    · sourceId = keccak256("SYN.SOURCE.V1", msg.sender)  ← déterministe
    · sourceClass = MEMBER_INTRODUCTION          ← FORCÉ
    · commissionBps = 500                        ← EN DUR. Il ne le choisit pas.
    · payoutWallet = msg.sender                  ← FORCÉ
    · scope = LIFETIME · caps = 0 · repeat = true
    · metadataHash = <hash des conditions>       ← FORCÉ
  → createSource() sur le registre
```

## ⚠️ POURQUOI PAS LA CLÉ OWNER SUR LE SERVEUR
**Une clé owner peut créer N'IMPORTE QUELLE source, jusqu'à 30 %, vers N'IMPORTE QUEL wallet.**
**Serveur compromis → l'attaquant se crée une source à 30 % et détourne CHAQUE achat.**
**Un contrat émetteur NE PEUT PAS. Ce n'est pas dans son code.** Même compromis, il ne fait que ça.

## ⚠️ ET IL BOUCHE UN TROU DU CONTRAT DE VENTE
**Le contrat de vente vérifie `balanceOf` — LE TOKEN, PAS LE SIÈGE.**
*(L'erreur s'appelle `ReferrerNotSeated` — « pas assis » — **alors qu'elle ne vérifie PAS le siège.
Le nom ment sur ce que fait le code.**)*
**L'ÉMETTEUR, lui, vérifie `knownMember`. La porte se ferme EN AMONT, sans redéployer la vente.**

## Le prix, honnêtement
**C'est un smart contract.** À écrire, tester, auditer, déployer. **Puis transférer l'ownership.**
⚠️ **Si l'émetteur a un bug, on ne peut plus créer de sources du tout.**
**Sa propre slice. Après le reste.**

---

# ⑧ CE QUE LE CONTRAT FAIT — ET QU'IL FAUT DIRE HONNÊTEMENT

| Comportement on-chain | Ce que l'écran DOIT dire |
|---|---|
| **La source COLLE à l'acheteur** (`buyerSourceId` + `buyerSourceExpiresAt`). Passer `sourceId = 0` **N'ANNULE PAS** — le contrat **auto-applique** la source liée. Une AUTRE → `SourceAlreadyLinked`. | 🔴 **« L'acheteur peut effacer la source » n'est vrai qu'AVANT le premier achat attribué.** **NE PAS promettre un bouton que la chaîne ignorera.** |
| **Un parrain doit détenir du SYN** | *« Holding SYN pays you nothing. Introductions pay you. »* *« You must hold a seat and hold SYN to introduce others. You cannot recommend what you have left. »* |
| **Vendre TOUT son SYN → commissions à ZÉRO.** *(La source reste ACTIVE. Elle ne paie simplement plus.)* | **À DIRE.** Sinon quelqu'un vendra et croira qu'on l'a volé. |
| **Auto-parrainage bloqué ON-CHAIN** (`SelfReferral` : `sourceWallet` ou `payoutWallet` == buyer OU recipient) | **Pas une politique. UN REVERT.** |
| **Paiement INSTANTANÉ** — `try pushSourcePayout catch { escrow }` | **Honnête : instantané, avec un filet.** Pas « garanti instantané ». Si le push échoue → escrow, **n'importe qui** peut `claimSourceEscrow()`, les fonds vont **toujours** au `payoutWallet` **courant du registre**. |
| **`payoutWallet` ne peut PAS être changé** par `updateSourceTerms` | ⚠️ **`PayoutWalletChangeRequiresRecovery`.** *(Il existe `updatePayoutWallet` — `onlyOwner`.)* |
| **Chaque changement de terme émet un EVENT** | `SourceTermsUpdated` · `SourceStatusChanged` · `SourcePayoutWalletUpdated` → **« aucune édition silencieuse » n'est pas une promesse : c'est une CONSÉQUENCE.** |

## 🔴 LES DEUX BUGS DÉJÀ TROUVÉS — NE PAS LES REFAIRE

**① LE TAUX DU REGISTRE N'EST PAS LE TAUX APPLIQUÉ.**
`_previewCommissionBps` renvoie **ZÉRO dans 6 cas** où `sourceConfig.commissionBps` vaut 800 :
parrain plus seaté · rachat sans `appliesToRepeatPurchases` · `grossCap` dépassé · `perBuyerCap`
dépassé · fenêtre fermée / status ≠ ACTIVE · `payoutWallet` == recipient.
> ## **LE TAUX VIENT DU DEVIS** (`acquisitionCost / grossUsdc`). **JAMAIS de `commissionBps`.**
> **Afficher « 8 % » quand le contrat appliquera 0 % — c'est un MENSONGE, avant signature,
> sur le chemin de l'argent.**

**② CE N'EST PAS LA BONNE ADRESSE.**
`_payAcquisition` paie **`payoutWallet`**, pas `sourceWallet` (l'IDENTITÉ). **Ils peuvent différer.**
> ## **L'ADRESSE VIENT DE `sourceConfig(sourceId).payoutWallet`.**
> **L'acheteur doit voir QUI EST PAYÉ. Pas qui a présenté.**

**LE PARTAGE :**
```
TAUX + MONTANT  →  du DEVIS   (serveur ; le calcul EFFECTIF du contrat)
ADRESSE         →  de sourceConfig().payoutWallet   (client ; lecture on-chain)
```
**ASSERTION DE COHÉRENCE, fail-closed :**
- devis > 0 **MAIS** source inactive/inconnue → **CONTRADICTION → aucune ligne**
- devis == 0 → **aucune ligne source.** 100 % va au split. **LE DIRE.**
- la lecture échoue → **AUCUN MONTANT SANS PREUVE.** Fail closed.
> **Si les deux divergent, LE DEVIS GAGNE sur l'argent. On ne montre RIEN plutôt que du faux.**

---

# ⑨ L'AXE CAPITAL — `HOME_RANK_LADDER` N'EST PAS DU POISON

**`syndicate-config.ts` → `HOME_RANK_LADDER`, 12 rangs par montant ($5 → $10 000).**

## ⚠️ L'ADVISOR AVAIT TORT DE CRIER AU LOUP
**Sephora · Ulta · Marriott · Uber · American Airlines · Starbucks : TOUS ont des paliers par dépense.**
**C'est universel et légal.** Ce n'est pas le palier qui pose problème — **c'est ce qu'il DÉBLOQUE.**

**Et `HOME_RANK_LADDER` ne débloque RIEN aujourd'hui.** `{ Citizen, $5, 500 SYN }` — **500 SYN, c'est
juste 100 SYN/$, le taux de l'ère 1. Tout le monde a le même taux.** **Aucun bonus. Une étiquette.**

## LA RÉSOLUTION : **C'EST L'AXE CAPITAL**
La doctrine dit : **onze axes. Le capital en est UN. Jamais le trône.**
- **Axe CAPITAL** → combien tu as engagé *(c'est `HOME_RANK_LADDER`)*
- **Axe CONNECTOR** → à quel point tu présentes bien *(§⑤)*
- **Axes Builder · Historian · Steward · Verifier · Operator…** → le reste

**Tout ça est le MÊME système multi-axes. Il est DÉJÀ dans la doctrine.**

## CE QU'IL FAUT CORRIGER
1. **Renommer les noms qui collident** : `Operator`, `Builder`, `Steward`, `Custodian`, `Cornerstone`,
   `Scout` → ils sont des **rôles**, des **axes**, ou des **classes on-chain**.
2. **Dire clairement que le Capital est UN AXE — jamais un rang de MEMBRE.**
   ⚠️ **LE SIÈGE EST BINAIRE.** $5 et $10 000 achètent **LE MÊME SIÈGE**. Un palier nomme ton
   **empreinte économique**, **jamais une catégorie d'adhésion.**
3. ⚠️ **`JOURNEY_STEPS`** déclare `{ key: "rank", status: "LIVE", detail: "Your purchases map to a
   public rank" }`. **C'est marqué LIVE et ça n'existe pas.** → **STATE périmé. À corriger.**
4. 🔴 **UN PALIER NE DONNE JAMAIS UN MEILLEUR PRIX SUR LE SYN.** Jamais plus de tokens par dollar.
   **C'est LA ligne rouge.** *(Sephora donne 20 % sur du maquillage — un produit qu'on consomme.
   Un meilleur taux SYN serait un avantage financier sur un actif REVENDABLE.)*

---

# ⑩ CE QUE LE CONTRAT NE FAIT **PAS** — LE TRAVAIL DU SERVEUR

**Le contrat ne connaît QUE `sourceId` (bytes32).** Il ignore TOUT le reste :

| Ce qu'il ignore | Ce que le SERVEUR doit porter |
|---|---|
| le code humain derrière le hash | **table : `alias` ↔ `wallet` ↔ `sourceId`** |
| le canal (`&via=`) | **log de canal** — clic, horodatage, conversion |
| qui a demandé sa source, quand, si c'est approuvé | **file de demandes** *(jusqu'à l'ÉMETTEUR)* — ✅ CONSTRUITE (K3.a, 2026-07-22 : activation_request + la file de revue live) |
| clics · conversions · taux de transformation | **analytics** |
| le standing Connector d'un membre | **dérivé de l'indexeur d'events** |

> ## **~~RIEN DE TOUT ÇA N'EXISTE.~~ RE-TRUED 2026-07-22 : le log de canal, les analytics, le standing Connector ET la file de demandes SONT construits et scellés (R3 · R5 · K3.a). Restent : la table alias (IDENTITY-ALIAS, parquée) et l'ÉMETTEUR R7.**
> **Le contrat, lui, est déjà là.**

---

# ⑪ L'ORDRE — CE QU'ON FAIT, DANS QUEL ORDRE

## SLICE R1 — LES CONDITIONS DU PROGRAMME *(docs — BLOQUANT)*
**Écrire les conditions du referral.** Publiques. **Hashées en `metadataHash`.**
**Sans ce document, `createSource(LIFETIME)` REVERT (`MissingMetadata`).**
**+ c'est ce qui rend le « good standing » OPPOSABLE** (droit des associations).
**Contenu minimal :** qui est éligible · le taux · la portée `LIFETIME` · aucun plafond ·
**« la commission est un revenu imposable pour le parrain »** · anti-abus · révocation.

## SLICE R2 — LA PREMIÈRE SOURCE *(le founder signe)*
⚠️ **DÉJÀ FAIT (partiellement) — une source EXISTE et est ACTIVE** (`0x8338e9ff…1cf620`,
`BUILDER_SOURCE` 5% LIFETIME, ré-activée bloc 89642946, `metadataHash` présent). Donc le founder
**n'a rien à créer** pour tester C1.2b maintenant. Ce qui reste, si on veut la source
**MEMBER_INTRODUCTION** du programme public (§②), c'est un `createSource` distinct (classe 0, le
document R1 hashé). Séquence historique (pour tester le fail-closed) : `createSource` en `PAUSED` →
source connue mais inactive → **aucune ligne** → `setSourceStatus(ACTIVE)` → le cas complet.
⚠️ **Pour tester un VRAI achat attribué, il faut DEUX wallets** — l'auto-parrainage REVERT
(`payoutWallet == recipient`).

## SLICE R3 — LE CANAL (`&via=`) *(off-chain — AUCUNE dépendance)*
**Peut être construit DÈS MAINTENANT, en parallèle. Zéro transaction. Zéro attente.**
Capture au clic · stockage serveur · rattachement au reçu on-chain par le hash de transaction.

## SLICE R4 — LA SURFACE REFERRAL (`/source`)
Le lien du membre · ses introductions · ses commissions · **la share card**
*(« Proof, not claims — every figure is on-chain and verifiable »)*.
**État : `programLifecycle = "NOT_ACTIVE"` → copie « préparé / en pause ». JAMAIS « earn now ».**

## SLICE R5 — L'INDEXEUR D'EVENTS
**Une brique. Cinq surfaces.** Sans lui : pas de compteur d'introductions, pas de standing,
pas de commissions affichées, pas d'Activity, pas de Recognition.

## SLICE R6 — L'ESCALIER CONNECTOR
Les seuils · la promotion *(`updateSourceTerms` pour monter le `commissionBps`)*.
⚠️ **Un changement de taux n'est PAS rétroactif** — `_previewCommissionBps` lit le taux **au moment
de l'achat**. **C'est correct et c'est juste.**

## SLICE R7 — L'ÉMETTEUR *(smart contract — le self-service)*
§⑦. **Après tout le reste.**

---

# ⑫ CE QUI EST FERMÉ — NE PLUS JAMAIS REDISCUTER

❌ Le plafond membre → **12 %. On-chain. `MAX_MEMBER_INTRO_BPS = 1200`.**
❌ Le taux à afficher → **du DEVIS. Jamais du registre.**
❌ L'adresse à afficher → **`payoutWallet`. Jamais `sourceWallet`.**
❌ La portée → **`LIFETIME` + `appliesToRepeatPurchases = true`. Décidé par le founder.**
❌ Les plafonds → **AUCUN. `grossCap = 0`, `perBuyerCap = 0`. Décidé par le founder.**
❌ Le taux de départ → **500 bps (5 %).**
❌ Le `sourceId` → **`keccak256("SYN.SOURCE.V1", wallet)`. Jamais un alias.**
❌ Le rang redescend-il → **NON. JAMAIS. Décision du founder.**
❌ Est-ce du staking → **NON. « Member in good standing ». Together Credit Union.**
❌ Est-ce un MLM → **NON. Test Koscot : un seul niveau, récompenses liées à des ventes réelles.**
❌ Les paliers par dépense → **LÉGAUX. Sephora, Ulta, Marriott, Uber, AA, Starbucks.**
❌ Un affilié doit-il être membre → **NON. Classe différente. C'est voulu.**
❌ Le split → **`vault = protocolContribution × 70/100`. Dans le contrat.**
❌ Le registre peut-il être remplacé → **NON. `immutable`.**
❌ `createSource` peut-il devenir public → **NON. `onlyOwner`. Il faut l'ÉMETTEUR.**

---

# ⑬ AUTORITÉ

> ## **LE FOUNDER, PUIS LES SMART CONTRACTS. RIEN D'AUTRE.**
>
> Un fichier, un guard, un commentaire ou un doc qui te bloque **n'est PAS une loi.**
> **Nomme-le. Dis pourquoi. Et avance.**
>
> **La chaîne est l'autorité. Jamais un fichier.**
> *(Ce piège a déjà coûté deux fois : `sale-abi.ts:33`, `GENESIS_OFFSET`.)*
>
> **Les noms mentent. Lis le `.sol`.**
> *(`ReferrerNotSeated` ne vérifie pas le siège. Il vérifie le solde.)*
