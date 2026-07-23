# SWAPRAIL / ASSET ROUTER — DÉCISION MVP (vérifiée, corrigée, alignée canon)

> **Provenance :** advisor, 2026-07-23. Version **vérifiée** de l'analyse "Thirdweb Asset Router"
> — chaque fait produit re-contrôlé sur la doc thirdweb à jour. **Indicative, pas une loi ;**
> se plie au FOUNDER puis aux SMART CONTRACTS. Supersède, **pour le MVP V1**, le choix de moteur
> de `SWAP_BRIDGE_RAMP.md` (LI.FI) — voir §5. Respecte `CANON_LOI_ANTIBLOCAGE`,
> `VISIBILITY_LAW`, `SETTLED_RULES`, `SPEC_REFERRAL_SYSTEM`.

---

## 0. La décision en une ligne

**QuickNode pour la vérité · Thirdweb pour l'accès · nos contrats pour l'exécution.**
Thirdweb = **Asset Router V1 facultatif, derrière un adapter** — jamais la fondation, jamais la
source de vérité du protocole.

---

## 1. Faits vérifiés (doc thirdweb, 2026)

| Affirmation | Vérifié | Note |
|---|---|---|
| Frais protocole **0,30% (30 bps)** crypto→crypto (sur token source) | ✅ toujours d'actualité | le changelog "lower fees" était un changement passé ; 0,30% reste le tarif courant |
| **Developer fee** configurable par-dessus | ✅ | Project → Payments → Settings ; notre part |
| On-ramp agrégé = **Coinbase · Transak · Stripe** | ✅ exact | pas Kado/MoonPay ; une intégration, 3 providers |
| **Aucun frais thirdweb sur l'on-ramp** | ✅ | seuls les frais du provider s'appliquent |
| **Off-ramp (fiat payout) = indisponible** | ✅ | "Fiat payouts are not currently available" → provider externe plus tard |
| On-ramp **direct** = ETH · **Avalanche** · Polygon (+ Base US) | ✅ | Avalanche direct OK ; autres tokens = on-ramp base + bridge (160+ pays) |
| Fund-and-execute (payer en tout token/chaîne/fiat → appeler un contrat) | ✅ réel | cœur du Universal Bridge |
| Pricing Growth **$99** / Scale **$499** | ✅ | + frais/usage |
| Contrat **Split** pour répartition fixe multi-wallets | ✅ | option si besoin |

**Conclusion vérif :** l'analyse d'origine est exacte. Rien de matériel à corriger — seulement
préciser les chaînes d'on-ramp direct et acter le choix de routeur unique (§5).

## 2. Ce que thirdweb couvre pour nous (MVP)

- **Swap (Avalanche) · Bridge (cross-chain) · Swap cross-chain** → Universal Bridge, une API.
- **On-ramp carte** → Coinbase/Transak/Stripe présentés à l'utilisateur via une seule intégration.
- **Funding du Join** → l'utilisateur paie en ETH/AVAX/USDT/… ou carte → thirdweb convertit en
  **USDC Avalanche** → appelle **`MembershipSaleV3`** avec l'actif exact qu'il attend déjà.
- **Suivi tx + webhooks**, wallets, gas sponsorship, RPC — **disponibles mais NON adoptés** (§4).

**Hors couverture :** **off-ramp fiat** (nécessitera un provider dédié, post-MVP) ; contrôle fin
des routes DEX (0x/LI.FI en direct, si un jour nécessaire).

## 3. Les garde-fous — non négociables (le "on part propre")

1. **SwapRail ≠ Membership.** Jamais présentés comme la même action. Le SwapRail est **une porte**
   (amener l'actif requis), pas un onglet de spéculation. `market-buy ≠ member`.
2. **`MembershipSaleV3` inchangé.** Il reçoit l'USDC Avalanche exact ; aucune modif de contrat.
3. **Chemin direct = `ZERO_SOURCE_ID`** tant que Verified Introduction n'est pas activé. **Aucun
   `sourceId` inventé.** Le guard membre historique reste en vigueur.
4. **Frais SwapRail = un seul frais transparent** vers une **adresse infrastructure désignée**
   (Visibility Law : une adresse-pipe, vérifiable), **argent société**. **Ne touche JAMAIS le
   70/20/10** et **aucune commission de source en V1**.
5. **Approvals bornés** (jamais infinite — leçon exploit 2024). RPC via **QuickNode** (pas de
   fallback public en prod).
6. **Thirdweb n'est jamais la vérité du protocole.** Activity / Registry / Chronicle / Transparency
   lisent la chaîne via QuickNode + Viem, jamais via thirdweb.

## 4. Ce qu'on GARDE vs ce qu'on AJOUTE

**GARDER (indépendant, notre fondation) :**
- **QuickNode** → RPC Avalanche principal · events · readbacks · Activity/Registry/Transparency ·
  Foundry/scripts/audits.
- **Viem + nos adapters** → vérité protocolaire.
- **`MembershipSaleV3`** → vérité économique on-chain.

**AJOUTER (couche d'accès facultative) :**
- **Thirdweb** → swap · bridge · on-ramp fiat · cross-chain · funding du Join · status/webhooks.
  Facturé 0,30% (+ notre developer fee).

## 5. Le choix de routeur — trancher, ne pas mélanger

Le repo (`SWAP_BRIDGE_RAMP.md`) avait scellé **LI.FI**. Cette décision-ci retient **thirdweb pour
le V1**, parce que pour un MVP le critère est **le moins d'intégrations** : thirdweb couvre
**swap + bridge + on-ramp + funding-du-Join** en **une** brique, là où LI.FI demanderait Onramper
en plus pour le fiat. **On ne garde pas les deux.**

**L'indépendance est préservée par l'ADAPTER** (loi anti-blocage) :

```
AssetRouter                      ← notre interface stable
 ├── ThirdwebBridgeAdapter       ← V1 (adopté)
 ├── ZeroXAdapter                ← alternative (si quotes non compétitives)
 └── LiFiAdapter / FutureFallback← alternative / redondance
```

→ `SWAP_BRIDGE_RAMP.md` (LI.FI-first) est **superseded pour le V1** ; LI.FI/0x restent des
**adapters documentés**, activables sans refonte. Les 7 patterns Jumper harvestés (wallet-hook,
destination-lock, piège `no-raw-color`, capture `?source=`) **transfèrent** à tout widget embarqué.

## 6. Frais (V1)

```
Thirdweb protocol fee     0,30 %
Syndicate developer fee   0,20 %   ← notre revenu (income stream SwapRail)
──────────────────────────────────
Total                     0,50 %   (avant gas / slippage / frais provider on-ramp)
```

**Répartition V1 : un seul frais → un seul wallet infra désigné.** Pas de contrat Split, pas de
commission de source, pas de mélange avec Membership. (Split/backend comptable = seulement si un
jour on veut router ce frais en 70/20/10 — hors scope V1.)

## 7. Périmètre SwapRail V1 — IN / OUT

**IN :** swap Avalanche · bridge cross-chain → USDC-Avalanche · on-ramp carte (Coinbase/Transak/
Stripe) · **funding du Join** (route → USDC → `MembershipSaleV3` en `ZERO_SOURCE_ID`) · un frais
transparent · status/webhooks · derrière `AssetRouter`/`ThirdwebBridgeAdapter`.

**OUT (post-MVP) :** off-ramp fiat (provider dédié) · commission de source sur le SwapRail ·
routage 0x/LI.FI direct · remplacement de QuickNode/Viem · wallets/gas thirdweb.

## 8. La seule validation avant de figer thirdweb en permanent

**Comparer les cotations finales thirdweb vs 0x/LI.FI** sur des routes réelles (les 30 bps
s'ajoutent à notre frais → moins compétitif à gros volume). Pour un **parcours d'achat simplifié**,
0,50% est acceptable ; pour un **terminal de trading à gros volume**, re-mesurer. L'adapter rend
ce basculement gratuit.

---

**Verdict :** thirdweb = **Asset Router V1 facultatif, derrière un adapter** — accès, pas
fondation. QuickNode reste la vérité, `MembershipSaleV3` reste l'exécution, et le SwapRail reste
une porte séparée de l'adhésion.
