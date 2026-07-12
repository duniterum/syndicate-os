# LA CONSTITUTION D'AUTORITÉ — THE SYNDICATE OS
## Qui peut changer quoi. Ce que personne ne peut changer. Et comment ça grandit.

*Claude-advisor · 2026-07-11 · Lu ligne par ligne dans `MembershipSaleV3.sol`, `SourceRegistryV1.sol`,
`accessState.ts`, `surfaceClassification.ts`, `moduleRegistry.ts`, `referralProgram.ts`,
`rpcTransport.ts`, `recognition-candidates.ts` — et sur la chaîne en direct.*

---

# ⓪ LA LOI UNIQUE

```
        ┌──────────────────────────────────────────────┐
        │  NIVEAU 0 — IMMUABLE                         │
        │  Gravé dans le contrat déployé.              │
        │  PERSONNE ne peut changer. Pas même le       │
        │  founder. Pas un vote. Pas une migration.    │
        └──────────────────┬───────────────────────────┘
                           │
        ┌──────────────────▼───────────────────────────┐
        │  NIVEAU 1 — ON-CHAIN, OWNER                  │
        │  Le FOUNDER signe. Une transaction.          │
        │  Publique. Un EVENT. Auditable à jamais.     │
        └──────────────────┬───────────────────────────┘
                           │
        ┌──────────────────▼───────────────────────────┐
        │  NIVEAU 2 — SERVEUR                          │
        │  Les OPÉRATEURS. Gaté par rôle.              │
        │  Journalisé. Fail-closed.                    │
        └──────────────────┬───────────────────────────┘
                           │
        ┌──────────────────▼───────────────────────────┐
        │  NIVEAU 3 — PRÉSENTATION                     │
        │  Copie, ordre, mise en page, `enabled`.      │
        │  AUCUNE vérité. AUCUN chiffre.               │
        └──────────────────────────────────────────────┘
```

> # ① UN NIVEAU INFÉRIEUR NE PEUT **JAMAIS** CONTREDIRE UN NIVEAU SUPÉRIEUR.
> # ② AUCUN NIVEAU NE PEUT **INVENTER** CE QUE LE NIVEAU AU-DESSUS N'A PAS.
> # ③ S'IL NE PEUT PAS LIRE — **IL LE DIT. IL NE DEVINE JAMAIS.**

**La chaîne est l'autorité. Le serveur la SERT. L'interface la REND.**
**Aucune remontée. Jamais.**

---

# ① NIVEAU 0 — CE QUE **PERSONNE** NE PEUT CHANGER
## Gravé dans le bytecode. Le founder lui-même est impuissant.

## `MembershipSaleV3` — les `immutable`
```solidity
IERC20 public immutable USDC;
IERC20 public immutable SYN;
SourceRegistryV1 public immutable SOURCE_REGISTRY;   // ← LE REGISTRE NE PEUT PAS ÊTRE REMPLACÉ
address public immutable VAULT;
address public immutable LIQUIDITY;
address public immutable OPERATIONS;
uint256 public immutable GENESIS_OFFSET;             // = 8
bytes32 public immutable V1_MEMBER_ROOT;
uint256 public immutable MAX_USDC_PER_TX;
uint256 public immutable RESERVE_THROUGH_SEAT;
```

## Les CONSTANTES — dans le code, pas dans le storage
| Constante | Valeur | Ce que ça verrouille |
|---|---|---|
| `GENESIS_END` | **333** | La fin du Chapitre I |
| `FINAL_SEAT` | **1 000 000** | La fin de tout |
| `RECEIPT_VERSION` | **3** | La version du reçu |
| `RECOVERY_TIMELOCK` | **14 jours** | Le founder ne peut pas vider la vente d'un coup |
| `BPS_DENOMINATOR` | 10 000 | La base des pourcentages |

## 🔴 LE ROUTAGE 70/20/10 — **ÉCRIT EN DUR. À JAMAIS.**
```solidity
r.acquisitionCost      = (grossUsdc * commissionBps) / BPS_DENOMINATOR;
r.protocolContribution = grossUsdc - r.acquisitionCost;
r.vaultAmount          = (r.protocolContribution * 70) / 100;   // ← EN DUR
r.liquidityAmount      = (r.protocolContribution * 20) / 100;   // ← EN DUR
r.operationsAmount     = r.protocolContribution - vault - liquidity;
```
> ## **Le founder NE PEUT PAS changer le 70/20/10.**
> ## Ni un admin. Ni un opérateur. Ni un vote. **Le code le fait. Point.**

## 🔴 LE BARÈME DES 9 ÈRES — **fonction `pure`. Gravée.**
| Ère | Taux | Min USDC | Sièges | Chapitre |
|---|---|---|---|---|
| **1 · Genesis** | **100 SYN/$** | **$5** | 1 → 333 | 1 |
| 2 | 50 | $10 | → 1 000 | 2 |
| 3 | 40 | $10 | → 3 333 | 3 |
| 4 | 16 | $25 | → 10 000 | 4 |
| 5 | 12 | $25 | → 25 000 | 5 |
| 6 | 6 | $50 | → 50 000 | 5 |
| 7 | 4 | $50 | → 100 000 | 5 |
| 8 | 2 | $100 | → 250 000 | 5 |
| 9 | 1 | $100 | → 1 000 000 | 5 |

> **Le prix d'entrée n'est PAS un réglage. C'est une LOI PHYSIQUE du protocole.**
> **Personne ne peut le baisser pour un ami. Personne ne peut le monter en douce.**

## 🔴 LES INVARIANTS DE COMPORTEMENT — impossibles à contourner
| L'invariant | Le mécanisme |
|---|---|
| **Le siège est BINAIRE** | `_membershipState()` — `knownMember` → pas de second siège |
| **`v1Proof` doit être VIDE** | `if (v1Proof.length > 0) revert InvalidProof();` |
| **L'auto-parrainage est IMPOSSIBLE** | `SelfReferral` — `sourceWallet` ou `payoutWallet` == buyer OU recipient |
| **Un parrain MEMBRE doit détenir du SYN** | `ReferrerNotSeated` — ⚠️ vérifie le **TOKEN**, pas le siège. **Le nom ment.** |
| **La vente ne peut pas être VIDÉE** | `ReserveFloorViolation` — le SYN réservé aux sièges futurs est intouchable |
| **Le minimum d'entrée est on-chain** | `BelowEraMinimum` — une borne côté client serait **décorative** |
| **Le plafond par tx et par adresse/ère** | `ExceedsTxMax` · `AddressEraCapExceeded` |
| **USDC et SYN sont PROTÉGÉS du rescue** | `ProtectedToken` — le founder ne peut pas les siphonner |
| **La source COLLE à l'acheteur** | `buyerSourceId` — passer `0` n'annule pas. Une AUTRE → `SourceAlreadyLinked` |
| **Le n° de siège vient de l'EVENT** | `MembershipPurchasedV3.memberNumber` — **jamais prédit** |

## `SourceRegistryV1` — les plafonds gravés
```solidity
uint16 public constant MAX_COMMISSION_BPS       = 3_000;   // 30 % absolu
uint16 public constant MAX_MEMBER_INTRO_BPS     = 1_200;   // 12 % ← PLAFOND MEMBRE
uint16 public constant PUBLIC_AUTOMATIC_MAX_BPS = 1_200;
```
> ## **Un membre ne peut JAMAIS toucher plus de 12 %. Le registre REVERT.**
> **Même le founder ne peut pas le lui accorder. Il faudrait changer de CLASSE.**

**Les 7 classes · les 5 portées · les 4 statuts — des `enum`. Gravés.**
**Les règles de validation** (`_validateTerms`) — `LIFETIME` exige un `metadataHash` ·
`FIRST_PURCHASE` interdit les rachats · `WINDOWED` exige une fin · `CAPPED` exige un plafond.
**Aucune ne se contourne.**

**Et : `updateSourceTerms` NE PEUT PAS changer le `payoutWallet`** → `PayoutWalletChangeRequiresRecovery`.
**Anti-détournement, dans le code.**

---

# ② NIVEAU 1 — CE QUE **LE FOUNDER SEUL** PEUT FAIRE
## Avec son wallet. Une transaction. Un EVENT. **Publique à jamais.**

## Sur la Sale (`Ownable2Step`)
| Action | Effet | Garde-fou |
|---|---|---|
| `pause()` / `unpause()` | arrête les achats | — |
| `recoverUnsoldSyn()` | récupère le SYN invendu | ⚠️ **timelock de 14 jours** si la vente n'est pas conclue |
| `rescueToken(t)` | sort un token étranger | ⚠️ **USDC et SYN sont INTERDITS** |

**Et c'est TOUT.** Le founder **ne peut pas** changer le split, les ères, les plafonds, les wallets.

## Sur le Registre (`Ownable2Step`)
| Action | Event émis |
|---|---|
| `createSource()` — **naît toujours `PAUSED`** | `SourceCreated` |
| `updateSourceTerms()` — **sauf le `payoutWallet`** | `SourceTermsUpdated` |
| `setSourceStatus()` — ACTIVE / PAUSED / REVOKED | `SourceStatusChanged` |
| `updateSourceWallet()` | `SourceWalletUpdated` |
| `updatePayoutWallet()` — **fonction séparée, délibérément** | `SourcePayoutWalletUpdated` |

> ## **CHAQUE changement émet un EVENT.**
> ## *« Aucune édition silencieuse »* n'est pas une promesse. **C'est une CONSÉQUENCE.**

## 🔴 LA CLÉ NE QUITTE JAMAIS LE WALLET DU FOUNDER
**Mettre la clé `owner` sur un serveur = un serveur compromis peut créer une source à 30 %
vers n'importe quel wallet et détourner CHAQUE achat.**
**→ INTERDIT. Sans exception. Voir §④ pour la solution.**

---

# ③ NIVEAU 2 — LE SERVEUR
## Les 8 rôles. Journalisé. Fail-closed.

| id canonique | Rôle | Portée |
|---|---|---|
| `founder_root` | Founder / root | tout · registre admin · récupérations · suspension d'urgence |
| `protocol_admin` | Protocol admin | flags · exports · approbation de diffusion · overrides support |
| `operator` | Operator | console quotidienne · rapports · file support · ops de contenu |
| `source_reviewer` | Source reviewer | examine les attributions de source · approuve **dans la politique** |
| `member_support` | Member support | file membre · **contexte minimal** |
| `content_docs` | Content / docs | copie publique · **AUCUNE donnée membre** |
| `auditor` | Auditor | **lecture seule. ZÉRO mutation.** |
| `worker_agent` | Worker / agent | identité non-humaine · **propositions seulement** |

## ✅ CE QUE LE SERVEUR **PEUT** ÉCRIRE
| | |
|---|---|
| **La table des alias** | `alias` ↔ `wallet` ↔ `sourceId` |
| **Le log des canaux** | `&via=twitter` — clic, horodatage, conversion |
| **La file des demandes de source** | qui a demandé, quand, approuvé ou non |
| **Les analytics** | clics · conversions · taux |
| **Les feature flags** | `enabled` sur un module |
| **La copie, les docs, le contenu** | |
| **Les invitations / suspensions d'opérateurs** | *(déjà construit : `AdminOperatorsCrud`)* |
| **Les candidats à la reconnaissance** | **revue HUMAINE** |
| **La promotion au Chronicle** | ⚠️ **UN ACTE HUMAIN. Jamais automatique.** |

## 🔴 CE QUE LE SERVEUR NE PEUT **JAMAIS** FAIRE
| ❌ | Pourquoi |
|---|---|
| **Changer un chiffre qui vient de la chaîne** | Il ne fait que le **lire**. Il ne le possède pas. |
| **Créer une source** | `onlyOwner` **on-chain**. Impossible depuis le serveur. |
| **Changer un taux de commission** | On-chain. Un event. Le founder signe. |
| **Toucher au 70/20/10** | Gravé dans le bytecode. |
| **Fabriquer un membre** | Le siège vient de l'**event émis**. |
| **Émettre l'adresse d'un MEMBRE** | **Aucun annuaire n'existe. Il n'y a rien à émettre.** |
| **Combler un trou par un cache ou un littéral** | **Fail-closed. Il DIT qu'il ne peut pas lire.** |

## LA DISCIPLINE DE LECTURE — déjà en place
`rpcTransport.ts` : **lecture seule par construction.** Aucune clé privée. Aucune transaction.
`eth_chainId` / `eth_getCode` / `eth_call` **uniquement**. https-only. Timeout. Fallback ordonné.
**Et une garde qui REFUSE d'émettre une sortie contenant une adresse de membre.**

---

# ④ 🔴 LES TROIS FORMES DE CONTRÔLE ADMIN
## **La clé de toute l'architecture. Elles ne se ressemblent pas, et ne doivent JAMAIS se ressembler.**

## FORME 1 — **LIRE + VÉRIFIER**
**Tout ce qui vient de la chaîne.** En lecture seule. **Avec son lien de preuve.**
> **L'admin VOIT la vérité. Il ne peut pas l'éditer.**
> Le burn · les membres · le vault · les termes d'une source · les reçus · les plafonds.

## FORME 2 — **PROPOSER** ⭐ *(la forme qui résout tout)*
**Une action ON-CHAIN. L'admin remplit un formulaire. Le système CONSTRUIT LA TRANSACTION.
**LE FOUNDER LA SIGNE DANS SON WALLET.**

```
L'admin remplit :  créer une source pour 0x7f3a… · MEMBER_INTRODUCTION · 500 bps · LIFETIME
                          ↓
Le système CONSTRUIT :   createSource(keccak256(...), SourceTerms{...})
                          ↓
Il AFFICHE :             chaque paramètre, en clair, et ce qui est IRRÉVERSIBLE
                          ↓
LE FOUNDER SIGNE          ← dans SON wallet. La clé ne bouge pas.
                          ↓
La chaîne exécute.        Un EVENT. Public. À jamais.
```

> ## **L'admin peut TOUT préparer. Il ne peut RIEN signer.**
> ## **La clé ne quitte jamais le wallet du founder.**
> ## **C'est ça, le self-service admin SANS la clé sur le serveur.**

**Et l'ÉMETTEUR (un contrat) est la version automatisée de la même idée :**
un contrat qui ne peut faire **qu'une seule chose**, avec des paramètres **forcés en dur**.
**Même compromis, il ne peut pas créer une source à 30 %. Ce n'est pas dans son code.**

## FORME 3 — **ÉCRIRE**
**L'état du SERVEUR.** Gaté par rôle. **Journalisé.** Fail-closed.
Alias · canaux · copie · flags · opérateurs · revue de reconnaissance.
*(Le pattern existe déjà : `AdminOperatorsCrud`, `AdminReferralCrud` → POST, `founder_root`, audité.)*

## 🔴 LA RÈGLE VISUELLE — non négociable
**Ces trois formes doivent être VISUELLEMENT DIFFÉRENTES dans la Console.**
Un bouton qui **écrit en base** et un bouton qui **construit une transaction** ne doivent
**jamais** se ressembler. **Un opérateur doit voir, d'un coup d'œil, s'il touche à la chaîne.**

---

# ⑤ `enabled` ≠ `posture`
## **La distinction qui ne se collapse JAMAIS.**

| | **`enabled`** *(gouvernance)* | **`posture`** *(preuve)* |
|---|---|---|
| La question | **Ce module existe-t-il pour l'utilisateur ?** | **Ses chiffres sont-ils prouvés ?** |
| Qui décide | **LE FOUNDER.** Une DÉCISION. | **LA CHAÎNE / LE SERVEUR.** Dérivé **au rendu**. |
| Un littéral en dur ? | ✅ **OUI** — une décision s'écrit. | ❌ **JAMAIS.** Fail-closed vers « indisponible ». |

> **Un module `enabled` dont la source de preuve ÉCHOUE
> **DOIT APPARAÎTRE — ET LE DIRE HONNÊTEMENT.**
> **Un module non-`enabled` n'apparaît NULLE PART.**

**Confondre les deux réintroduit exactement la maladie du chiffre périmé que ce protocole refuse.**

## LE SOCLE DE LA MODULARITÉ
`moduleRegistry.ts` a **déjà** `homepageZone`, `route`, `cta`.
**Ajouter `enabled` = « j'allume un module et il apparaît au bon endroit ».**
**C'est la modularité WordPress que le founder veut. Une slice à elle seule.**

---

# ⑥ LA LOI FAIL-CLOSED
## Ce qui se passe quand un niveau ne peut pas lire celui du dessus.

```
La chaîne ne répond pas
        ↓
Le serveur NE DEVINE PAS. Il ne sert PAS un cache périmé comme du live.
        ↓
Il dit : « indisponible ».
        ↓
L'interface AFFICHE « indisponible ». Elle n'invente rien.
```

**Déjà en place :**
- `accessState.ts` → **tout échec → S1.** Fail-closed. *« Frontend state = visibilité/UX. JAMAIS un contrôle de permission. »*
- `member-standing` → own-row only. Échec → **null**, jamais une dégradation silencieuse.
- `rpcTransport` → fallback ordonné, puis **throw**. Jamais un chiffre inventé.
- `guard-freshness` → **BLOQUANTE.** Aucun snapshot pour un chiffre lisible en live.
- `sourceDecoders` → **deux booléens seulement.** Les termes ne sortent jamais du serveur.

> ## **UN CHIFFRE FAUX EST PIRE QU'AUCUN CHIFFRE.**
> ## **UN LIEN DE PREUVE FAUX EST UN MENSONGE VÉRIFIÉ.**

---

# ⑦ CE QUE CETTE ARCHITECTURE REND **IMPOSSIBLE**
## Les garanties. Pas des promesses — des impossibilités.

| Personne ne peut… | Parce que… |
|---|---|
| **Changer le 70/20/10** | c'est du bytecode |
| **Baisser le prix d'entrée pour un ami** | les ères sont une fonction `pure` |
| **Donner 30 % à un membre** | `MAX_MEMBER_INTRO_BPS = 1200`. Le registre revert. |
| **Créer une source depuis le serveur** | `onlyOwner` on-chain |
| **Se parrainer soi-même** | `SelfReferral`. Un revert. |
| **Vider la vente** | `ReserveFloorViolation` + timelock 14 j |
| **Siphonner l'USDC ou le SYN** | `ProtectedToken` |
| **Émettre un second siège au même wallet** | `knownMember` |
| **Changer un taux en douce** | **chaque changement émet un EVENT** |
| **Fabriquer un annuaire de membres** | **il n'en existe aucun à émettre** |
| **Afficher un chiffre inventé** | `guard-freshness`, BLOQUANTE |

> ## Ce n'est pas de la confiance. **C'est de la MÉCANIQUE.**
> ## Et c'est exactement ce que « **Don't trust, verify** » veut dire.

---

# ⑧ L'ÉVOLUTION — comment ça grandit **sans rien casser**

## CE QUI PEUT GRANDIR — **sans toucher à la chaîne**
| | |
|---|---|
| **Les modules** | `enabled` → il apparaît. `disabled` → il disparaît. |
| **Les alias, les canaux, les analytics** | 100 % serveur |
| **Les axes de reconnaissance** | dérivés de l'indexeur |
| **Les rangs, les seuils, les noms** | dérivés — **jamais gravés** |
| **La copie, les docs, la langue** | présentation |
| **Les rôles opérateur** | registre serveur |
| **Le Chronicle, l'Archive** | **promotion = un ACTE HUMAIN** |

## CE QUI EXIGE UNE **TRANSACTION** *(le founder signe)*
Créer / activer / suspendre / révoquer une source · monter le taux d'un Connector ·
mettre la vente en pause · récupérer le SYN invendu.

## 🔴 CE QUI EXIGE UN **NOUVEAU CONTRAT**
| Ce qu'on veut changer | Le prix |
|---|---|
| **Le 70/20/10** | **une nouvelle Sale.** Migration. |
| **Le barème des ères** | **une nouvelle Sale.** |
| **Rendre `createSource` public** | **un ÉMETTEUR** qui devient `owner` du registre |
| **Remplacer le registre** | **IMPOSSIBLE sans une nouvelle Sale** *(`SOURCE_REGISTRY` est `immutable`)* |
| **Changer les plafonds 12 % / 30 %** | **un nouveau registre → donc une nouvelle Sale** |

> **Et ce n'est PAS un échec. C'est de l'HONNÊTETÉ.**
> **Une migration se raconte dans la CHRONICLE. Elle ne se cache pas.**

## LE PATTERN D'ÉVOLUTION — déjà écrit
`protocol-lineage.ts` : **une identité « Founder » STABLE qui résout vers un wallet DANS LE TEMPS.**
Chaque changement est écrit au Chronicle. Les events s'attribuent au wallet **actif à l'époque**.

> ## **L'IDENTITÉ est stable. L'IMPLÉMENTATION migre.**
> **Applique ce pattern à TOUT : le Founder, la Sale, le Registre, l'Émetteur.**
> **Une identité « Sale », qui résout vers V3 aujourd'hui, V4 demain. L'histoire ne se rompt jamais.**

---

# ⑨ LA MALADIE — et le vaccin
## `INVARIANT` vs `STATE`

> **Un agent hésite → il écrit « ceci n'existe pas » dans le repo → la phrase devient canon →
> l'agent suivant lit le canon et hésite → REBUILD.**
> **La prudence de l'agent s'est blanchie en LOI DU FOUNDER.**

**CINQ preuves vivantes, trouvées dans CE repo :**
1. `MembershipSaleV3.sol` ligne 4 : *« V3 CANDIDATE — not deployed »* → **IL EST DÉPLOYÉ.**
2. `SourceRegistryV1.sol` : idem → **déployé.**
3. `accessState.ts` : *« member states have no wired source »* → **faux depuis des semaines.**
4. La promesse own-row sur `/member` → **écrite par un AGENT**, jamais par le founder.
5. `JOURNEY_STEPS` : `{ rank, status: "LIVE" }` → **ça n'existe pas.**

| | |
|---|---|
| **`INVARIANT`** | une **RÈGLE**. **SEUL LE FOUNDER l'écrit.** Un agent peut la citer, jamais l'AUTEUR. |
| **`STATE`** | une **DESCRIPTION**. **N'importe quelle slice peut la périmer — c'est ça, CONSTRUIRE.** |

> ## **« X n'existe pas » ≠ « X ne doit pas exister ».**
> ## **`FUTURE_MODULE` est une ÉTIQUETTE, pas un VERROU.**
> **La slice qui change la réalité met à jour sa description DANS LE MÊME COMMIT.**

---

# ⑩ L'AUTORITÉ — l'ordre de lecture, pour tout agent

```
1.  LE SITE EN PROD (thesyndicate.money)   ← ce qui est LIVRÉ
2.  LE CONTRAT (.sol — PAS l'ABI)          ← LES NOMS MENTENT. Lis le .sol.
3.  LE FOUNDER, en direct                  ← il écrase tout
4.  syndicate-os (le code construit)
5.  syndicate-os/docs (le canon)
6.  TheSyndicate (l'origine)               ← des IDÉES. JAMAIS une vérité. JAMAIS une question.
7.  La mémoire d'un agent                  ← PAS UNE SOURCE. Jamais.
```

**PREUVE QUE LES NOMS MENTENT :**
`ReferrerNotSeated` — « le parrain n'est pas assis » — **NE VÉRIFIE PAS LE SIÈGE.**
Il vérifie `balanceOf`. **Le TOKEN. Pas le siège.**

**PREUVE QUE LA CHAÎNE GAGNE :** ce piège a déjà coûté **deux fois** —
`sale-abi.ts:33` *(l'ABI V1 prise pour la V3)* · `GENESIS_OFFSET` *(un nom pris pour un sens)*.

---

# ⑪ L'ORDRE DE CONSTRUCTION — ce que ça implique

| # | Slice | Pourquoi ici |
|---|---|---|
| **1** | **Les CONDITIONS du programme** *(docs)* | 🔴 **BLOQUANT.** `LIFETIME` exige un `metadataHash`. **Sans le document, `createSource` REVERT.** Et c'est ce qui rend le « good standing » **opposable**. |
| **2** | **La première SOURCE** *(le founder signe)* | Rien ne peut être testé sans elle. **En `PAUSED` d'abord** → tester le fail-closed. Puis `ACTIVE`. |
| **3** | **Le CANAL (`&via=`)** | ⚡ **Off-chain. AUCUNE dépendance. Constructible MAINTENANT, en parallèle.** |
| **4** | **La FORME 2 — « PROPOSER »** dans la Console | ⭐ **Le pattern qui débloque TOUT l'admin.** L'admin prépare, le founder signe. |
| **5** | **`enabled` sur le moduleRegistry** | Le socle de la modularité. Une slice propre. |
| **6** | **L'INDEXEUR D'EVENTS** | **Une brique → cinq surfaces.** Sans lui : ni compteurs, ni standing, ni Activity, ni Recognition. |
| **7** | **L'ESCALIER CONNECTOR** | Dérivé de l'indexeur. Les seuils. La promotion. |
| **8** | **L'ÉMETTEUR** *(smart contract)* | Le vrai self-service. **Après tout le reste.** |

---

# ⑫ LA PHRASE QUI RÉSUME TOUT

> # Le FOUNDER décide.
> # Le CONTRAT interdit.
> # Le SERVEUR sert.
> # L'INTERFACE rend.
>
> ## **Et personne, jamais, ne peut remonter d'un cran.**
