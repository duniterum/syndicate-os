> ⚠️ **SUPERSEDED — TIER-3 HISTORICAL (imported 2026-07-14 from the founder's out-of-repo
> `_research/MEMBER_HOME_PLAN.md`, advisor-authored 2026-07-11).** Kept for the record only —
> its live pieces were extracted into `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §11 point 7.
> **NEVER re-import a superseded line. The stale STATE lines, named:**
> - "CommissionRouter deployed" — **the chain says NOT deployed** (confirmed on-chain 2026-07-12;
>   a V4 design, not an asset).
> - "The two walls" (the app is blind / no purchase path) — **BOTH ARE DOWN**: the S7/S11 wire
>   widening shipped (Q29) and the checkout is LIVE in prod (C5, seats #13–#15 bought with real
>   money).
> - Ladder thresholds sketched here — **decided since in `CONNECTOR_LADDER_POLICY.md`**
>   (founder-final; this file's numbers are history).
# MEMBER HOME — LA LISTE DE TRAVAIL
## Ce qui va être fait. Dans quel ordre. Par qui. Et ce que tu regardes à la fin.

*Claude-advisor · 2026-07-11 · Lu depuis le site en prod, le contrat V3, et `syndicate-os`.*

---

# 🔴 LIS D'ABORD ÇA — LE FAIT QUI COMMANDE TOUT

**Aujourd'hui, sur ton site :**

| | Réalité |
|---|---|
| Le login wallet | ✅ **marche** |
| Le readback de ton siège | ✅ **marche** (siège, ère, reçu, « Share my proof ») |
| L'app sait-elle que tu es membre ? | 🔴 **NON.** |
| Peut-on **acheter** un siège ? | 🔴 **NON.** `/join` = *« no transaction path »* |

**Deux murs. Un seul mot chacun.**

**MUR 1 — l'app est aveugle.** Le serveur sait qui tu es (`/api/auth/member-standing` répond ton siège,
ton reçu). **Mais une ligne l'empêche de le dire à l'application :**
```ts
WIRABLE_ACCESS_STATES = ["S1", "S4"]   // ← S7 (membre) n'a pas le droit de passer
```
Le commentaire à côté dit *« member states have no wired source »* — **c'était vrai il y a des semaines.
Ce n'est plus vrai.** Personne n'est revenu élargir le fil.

→ **S7 n'est pas à CONSTRUIRE. Il est à LAISSER PASSER.**

**MUR 2 — la porte est peinte.** `/join` calcule un devis exact, live. **Et il n'y a aucun bouton qui achète.**

> ## Tant que ces deux murs tiennent, TOUT le reste est de la peinture.
> Une maison sans habitant. Un magasin sans caisse.

---

# 📋 LA LISTE — 7 étapes, dans l'ordre, non négociable

---

## ÉTAPE 0 · LA GARDE DE NOMMAGE `[EN COURS — Claude Code]`

**Le problème :** **52 sites** dans le repo utilisent des mots bannis. « cockpit » ×30, « member os » ×7,
« control tower » ×8, « proof surface » ×7. Le mot « cockpit » est jusque **dans le fichier canon**, et
dans le menu du header.

**Ce qui se fait :** `config/surfaceNaming.ts` (le canon) + `guard-surface-naming` (**BLOQUANTE** — le
build échoue si un mot banni revient) + le nettoyage des 52 sites.

**Le canon, figé :**
| La chose | Le nom |
|---|---|
| `/member` | **Member Home** |
| Le bloc d'identité dedans | **Your Seat** |
| Le lien du header | **Membership** |
| `/studio` `/admin` `/founder` | **Console** |
| Le referral du membre | **Referral** *(mot utilisateur)* · route `/source` *(mot du contrat)* |

**Pourquoi une garde et pas juste un renommage :** le seul vocabulaire qui n'a **jamais** dérapé en six
mois, c'est celui de « source » — **parce qu'il a une garde**. Le nommage des surfaces n'en avait pas.
**C'est pour ça qu'il en est à onze noms.**

**👁️ TU REGARDES :** rien. C'est du ménage interne. Le site ne bouge pas.

---

## ÉTAPE 1 · 🔴 OUVRIR LE FIL — S7 + S11 `[Claude Code]`

**Le mur 1.** Une ligne à élargir, et le commentaire faux à réécrire.

**Ce qui se fait :**
- `WIRABLE_ACCESS_STATES` accepte **S7** (membre) et **S11** (opérateur).
- **S7** vient de `/api/auth/member-standing` : `recognized === true` **ET** `memberNumber` **ET** `chainVerified`.
- **S11** vient de `/api/auth/operator-context` : `isOperator === true`.
- **Règle d'or :** l'état vient **UNIQUEMENT** de la réponse du **serveur** sur le compte **qu'il a lié
  lui-même**. Jamais d'une prétention du navigateur. **Le moindre échec → S1.**

**Ce n'est pas un nouveau système. Les deux sources tournent déjà en production.**

**👁️ TU REGARDES :** tu te connectes. **Le header dit « Seat #1 · Genesis ».** C'est tout — mais ça veut
dire que l'app te reconnaît enfin.

---

## ÉTAPE 2 · 🏠 MEMBER HOME `[Claude Code]`

**La maison.** Aujourd'hui, après ton login, tu atterris sur une page de prose : six onglets, dont
**cinq disent « pas encore »**. Le seul truc vivant est un panneau posé au milieu.

**Ce qui se construit — dans cet ordre à l'écran :**

**1. YOUR SEAT** — le bandeau d'identité, en haut :
`Sigil · ton wallet · Member #N · ● SEAT HELD · Genesis Signal`
**Le statut du siège est le TITRE. Pas un onglet.**

**2. SI TU N'AS PAS DE SIÈGE** — une carte ambre :
> *« Your wallet is connected, but no seat is anchored to it. »* → **[ Take your seat ]**

**C'est le moment de conversion. Il ne s'enterre pas.**

**3. TON REÇU** — ✅ **déjà construit** (`8150d72`). Lien explorateur, bouton **« Share my proof »**,
et *« Verify it yourself »*. **On le DÉPLACE ici. On ne le refait pas.**

**4. TES CHIFFRES** — tout ce qui est lisible sur la chaîne **doit** être affiché :
| | |
|---|---|
| **Ton SYN** | ✅ **lisible MAINTENANT** (`balanceOf`) — **affiché nulle part aujourd'hui** |
| Ère · autorité · continuité | ✅ live |
| Ce que TU as routé | ⏳ attend l'indexeur (étape 6) |

**5. TES ACTIONS** — et **les verrous restent VISIBLES** :
> *« Requires a seat. »*

**Un visiteur VOIT ce qu'un siège débloque.** C'est *« Stop watching. Enter the protocol »* rendu
mécanique — la conversion est dans le verrou, pas dans un slogan.

**6. LES PORTES** — la barre latérale.

**Les deux coquilles :** pas connecté → **rien ne change**. Pages publiques (whitepaper, tokenomics…) →
**toujours publiques, même pour un membre**. Member Home et ses pages → **sa coquille à lui**.
**C'est la PAGE qui choisit, pas la personne.**

**👁️ TU REGARDES :** tu te connectes → **tu es chez toi.** Ton siège, ton reçu, ton SYN, tes portes.

---

## ÉTAPE 3 · 🔴 LA CAISSE — `/join` avec REFERRAL `[Claude Code]`

**Le mur 2. Et l'écran que tu attends.**

### 3a · Le chemin d'achat
```
   approve(MONTANT EXACT — jamais illimité)
        ↓
   buy(grossUsdc, recipient, sourceId, minSynOut, v1Proof)
        ↓
   le siège est lu DANS L'EVENT ÉMIS
```

> ## ⚠️ **APPROVE ≠ PAYMENT.**
> **Cette faute a coûté SIX versions.** Une allowance n'est **pas** un paiement.
> **Le siège n'existe que quand l'event est émis. Rien avant ne compte.**

**Et les plafonds du contrat s'affichent, ils ne se cachent pas :**
`MAX_USDC_PER_TX` · `maxUsdcPerAddressPerEra` · `eraSynCap` · `RESERVE_THROUGH_SEAT`

### 3b · Le referral, sur le même écran
- Tu arrives avec `?source=…` → **la source s'affiche AVANT que tu signes.**
- **Et tu peux l'EFFACER** (`Clear Source`).
- Le devis montre : **brut → commission → ce qui est routé au protocole.**

> **Un système où l'acheteur voit le parrain et peut l'effacer NE PEUT PAS devenir une pyramide.**
> Ce n'est pas une promesse. **C'est mécanique.**

### 3c · Ce qu'il faut mettre en GROS — personne d'autre ne l'a

> # LE PAIEMENT EST INSTANTANÉ. DANS LA TRANSACTION.
>
> Chez tous les autres : *30 jours d'attente · validation · seuil minimum · KYC · demande de retrait.*
> **Chez toi : il achète — et dans le même bloc, l'argent est sur ton wallet.**
>
> **Ce n'est pas du marketing. C'est le CONTRAT qui le fait.**
> Personne n'approuve. Personne ne peut te bloquer. **Pas même toi.**
>
> **On l'essaie une fois — et on n'abandonne plus.**

### 3d · La SHARE CARD
```
Verified on-chain · 7 members introduced · $120 in verified referral commissions
« Proof, not claims — every figure is on-chain and verifiable. »
```
> **Tout le monde peut écrire « j'ai gagné 10 000 $ ». Toi seul peux le prouver.**

**👁️ TU REGARDES :** **quelqu'un peut acheter un siège. Avec ton lien. Et tu es payé dans la seconde.**
**C'est le premier écran qui gagne de l'argent.**

---

## ÉTAPE 4 · 👁️ TU REGARDES. TU PARCOURS. TU TRANCHES.

**Rien ne se construit.** Tu ouvres le site, tu cliques, tu lis les vrais mots.

**Ce que tu tranches — devant l'écran, jamais de mémoire :**

| La question | Ce qui est prêt |
|---|---|
| **Les paliers de commission** | 7 marches écrites, noms tirés du repo (`ESCALIER_CONNECTOR.md`) |
| **Les seuils** | ⚠️ **tu as dit « 3 personnes c'est facile ». Tu as raison.** À refaire devant l'écran. |
| **La métrique qui fait monter** | volume ? retours ? **ceux qui deviennent Connectors à leur tour ?** |
| Les mots, les libellés, le ton | tout est là, à l'écran |

> ## **Tu ne te trompes pas quand tu VOIS.**
> ## **Tu te perds quand on te demande de te SOUVENIR.**
> **Le site est ton instrument de pensée. C'est pour ça que cette étape existe.**

---

## ÉTAPE 5 · L'ESCALIER CONNECTOR `[après ta décision]`

**Une seule échelle, pas deux.** Ta classe de commission **EST** ton standing sur l'axe **Connector**.
*(Le repo en avait deux qui allaient diverger : `Emerging→Foundational` d'un côté,
`Standard→Trusted→Partner` de l'autre. Une seule personne les monte.)*

**Le cœur du mécanisme :**
> ## Le TAUX décroît. La MÉMOIRE, jamais.
> Tu peux retomber d'une marche la saison suivante. **Mais « Foundational Connector · Saison 3 » reste
> dans la Chronicle. Pour toujours. Prouvé on-chain.**

**L'inverse exact d'un MLM :**
| | Eux | **Toi** |
|---|---|---|
| Argent sur le réseau | **le downline** | **JAMAIS. Un seul niveau.** |
| Revenu | perpétuel, promis | **une fois, pour un acte** |
| Honneur | aucun | **permanent, prouvé** |

**Ils promettent un revenu éternel et ne laissent aucun honneur.
Tu retires le revenu éternel, et tu donnes l'honneur permanent.**
**Et l'honneur, ça ne se régule pas.**

**Le contrat porte déjà tout :** `sourceClass` (uint8 → 255 marches possibles), `commissionBps` par
source, `payoutWallet` par source. **Rien à redéployer.**

---

## ÉTAPE 6 · L'INDEXEUR D'EVENTS — **une brique, quatre pages**

**C'est le seul vrai blocage qui reste.** Il lit les events de la chaîne et les range.

**Ce qu'il débloque, d'un coup :**
| Page | Ce qui s'allume |
|---|---|
| **Activity** | le fil du protocole · **et TES événements** |
| **Referral** | tes introduits · tes revenus · **tes commissions payées** |
| **Recognition** | ton standing sur les 11 axes |
| **Member Home** | ce que **tu** as routé |
| **Fire Ledger** | le détail de chaque burn *(le total est déjà affiché : **21 273 SYN**)* |

**Et c'est lui qui rend l'escalier Connector calculable.**

---

## ÉTAPE 7 · LES PORTES RESTANTES

**Wallet** (`balanceOf` + **le panneau d'approbations** ⚠️) · **Toolkit** (les 23 actions, verrous
visibles) · **Settings** (apparence, confidentialité, **avertissement avant approbation**, canaux
officiels anti-phishing) · **Recognition · Archive · Chronicle**.

> ⚠️ **Le panneau d'approbations, dans Wallet, est le plus important de tous.**
> C'est là que **APPROVE ≠ PAYMENT** cesse d'être une leçon apprise et devient **une protection pour le
> membre** : il voit ses allowances, il comprend qu'une allowance n'est pas un paiement, il peut révoquer.
> **La faute qui t'a coûté six versions devient une fonctionnalité.**

**Et le NFT se refait EN DERNIER.** Il a été fait à l'époque du **token sale V1**. Le projet a bougé
sous lui : V2, V3, l'ère, le chapitre, la source, le reçu. **Il rentrera dans un monde cohérent au lieu
de traîner un vocabulaire mort.**

---

# 🗺️ LA CARTE DE LA COQUILLE MEMBRE — 14 portes

```
MEMBER
  Home              /member         ← Member Home
  Take your seat    /join           ← LA CAISSE
  Referral          /source         ← l'argent
  Wallet            /member/wallet  ← ton SYN + tes approbations
  Toolkit           /toolkit        ← PUBLIC (le moteur de conversion)
  Activity          /activity       ← public + TA couche

MEMORY
  Recognition       /recognition    ← public + TA couche
  Archive           /archive        ← public + TA couche
  Chronicle         /chronicle      ← public + TA couche
  Fire Ledger       /fire           ← public

ACCOUNT
  Settings          /member/settings

OPERATOR   (invisible pour tous les autres)
  Console           /admin
```

## Les 6 portes coupées, et pourquoi
| Porte | Verdict |
|---|---|
| Protocol Graph | = `/map` |
| Architecture | = `/map` + `/contracts` |
| Economy | = `/tokenomics` |
| Registry | = `/contracts` |
| **My Syndicate** | **mort — le mot appelait l'arbre (downline)** |
| SeatRecord | contrat 721 non déployé |

## ZÉRO PAGE JUMELLE
Le prototype avait fabriqué **11 paires** (`activity` + `public-activity`, `chronicle` +
`public-chronicle`…). **Deux fichiers pour une vérité — ça diverge toujours. On n'en fait aucune.**

> **Une vérité = une page = une URL. Elle s'APPROFONDIT si tu es signé.**
> **Public = le protocole. Membre = le protocole + TOI.**

*(Bénéfice gratuit : Google est toujours un visiteur anonyme → il voit toujours la version publique.)*

---

# 📊 OÙ ON EN EST — la vérité, sans broder

| | État |
|---|---|
| Main verte, 16 gardes | ✅ |
| Login wallet + SIWE | ✅ **marche en prod** |
| Readback du siège (n°, ère, reçu, « Share my proof ») | ✅ **marche en prod** |
| Burn affiché (**21 273 SYN**, VERIFY ON-CHAIN) | ✅ |
| Membres · inflow · vault · LP · ops | ✅ **live** |
| **L'app sait que tu es membre** | 🔴 **NON — étape 1** |
| **Le membre a une maison** | 🔴 **NON — étape 2** |
| **On peut acheter un siège** | 🔴 **NON — étape 3** |
| **Ton SYN affiché** | 🔴 lisible, jamais rendu |
| L'indexeur d'events | ⏳ étape 6 |
| Recognition · Activity · Archive | ⏳ attendent l'indexeur |

---

# ⚖️ LES LOIS QUI GOUVERNENT CHAQUE PAGE
*Elles ne se rediscutent pas. Elles s'appliquent.*

1. **Tout chiffre lisible on-chain est AFFICHÉ.** Jamais un placeholder pour du déjà-lisible.
2. **Chaque chiffre porte son lien de preuve.** *Don't trust, verify.*
3. **Sur une chaîne, « cacher » n'existe pas** — il n'y a que *rendre lisible* ou *rendre pénible*.
4. **Own-row** : pas d'annuaire. **Mais ta propre transaction est à toi**, y compris le wallet qui t'a payé.
5. **Verrouillé ≠ caché** : les actions membre sont **montrées verrouillées** (elles convertissent).
   Les catégories operator sont **retirées entièrement**.
6. **Zéro page jumelle.**
7. **Deux coquilles — la PAGE choisit.**
8. **Un seul système de badges.**
9. **APPROVE ≠ PAYMENT.**
10. **Recognition-led, jamais wealth-ranked.** Le capital est **un** axe, jamais le trône.
11. **Visibilité = opt-in.**
12. **Referral** *(utilisateur)* · **Source** *(protocole + contrat)* · **Commission** *(business)* ·
    **Receipt** *(preuve)* · **Recognition** *(long terme)*.

---

# ✅ CE QUI EST FERMÉ — je ne te le redemanderai plus jamais

❌ Le split → **dans le contrat** : `grossUsdc = acquisitionCost + protocolContribution`
❌ Referral ou Introduction → **Referral** *(directive founder 2026-07-07, modèle Binance/Kraken)*
❌ Le leaderboard → **existe, pondéré rétention, jamais l'argent brut**
❌ La visibilité → **opt-in self-publish**
❌ Les wallets des filleuls → **on les affiche** *(c'est TA transaction, et c'est public on-chain)*
❌ Les licences → **on lit tout, on écrit depuis zéro**
❌ Une commission est-elle risquée → **NON. C'est du commerce.**
❌ `CommissionRouterV1` → **DÉPLOYÉ** (pas paramétré)
❌ Le burn est-il affiché → **OUI. 21 273 SYN.**
❌ Les paliers → **par source. `sourceClass` uint8 + `commissionBps` uint16.**
❌ Le seat est-il binaire → **OUI. Un wallet = un siège.**

# ⏳ CE QUI EST OUVERT — **une seule chose**

**Swap / Bridge (LI.FI)** — *« on y pensera le moment venu »*. **Ne bloque rien.**
