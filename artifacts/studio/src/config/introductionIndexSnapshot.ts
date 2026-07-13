// config/introductionIndexSnapshot.ts — GENERATED FILE. DO NOT EDIT.
// The TWIN of the api-server's introductionSnapshot (same builder run, same
// model, same hash — introduction-index.guard asserts equality). Address-free
// by construction: opaque source keys, counts, rates, block numbers — no
// wallet, no member number, no tx hash, no raw sourceId. Honest SERVED
// SNAPSHOT, labeled asOfBlock. Rebuild: api-server introductions:build.

export interface IntroductionIndexSourceStats {
  readonly attributedPurchases: number;
  readonly introducedMembers: number;
  readonly durableIntroductions: number;
  readonly commissionPaidRaw: string;
  readonly escrowOwedRaw: string;
  readonly firstBlock: number;
  readonly lastBlock: number;
  readonly currentBps: number;
  readonly entitledBps: number;
  readonly entitledTitle: string;
  readonly promotionDue: boolean;
  readonly crossedAtBlock: number | null;
  readonly crossedAtDateUtc: string | null;
}

export interface IntroductionIndexSnapshot {
  readonly snapshotHash: string;
  readonly asOfBlock: number;
  readonly durableTest: string;
  readonly totals: {
    readonly attributedPurchases: number;
    readonly distinctSources: number;
    readonly introducedMembers: number;
    readonly durableIntroductions: number;
    readonly commissionPaidRaw: string;
  };
  readonly bySource: Readonly<Record<string, IntroductionIndexSourceStats>>;
}

export const INTRODUCTION_INDEX_SNAPSHOT: IntroductionIndexSnapshot = {
  "snapshotHash": "sha256:5a3c9df95a6d69d8281ac4c40cc882ed1b9e8168a0e32736d02ca188c65c3e99",
  "asOfBlock": 90184731,
  "durableTest": "SYN_BALANCE_HELD",
  "totals": {
    "attributedPurchases": 2,
    "distinctSources": 1,
    "introducedMembers": 2,
    "durableIntroductions": 2,
    "commissionPaidRaw": "500000"
  },
  "bySource": {
    "src_36101e67d77b151bd9b04938": {
      "attributedPurchases": 2,
      "introducedMembers": 2,
      "durableIntroductions": 2,
      "commissionPaidRaw": "500000",
      "escrowOwedRaw": "0",
      "firstBlock": 88806161,
      "lastBlock": 90160483,
      "currentBps": 500,
      "entitledBps": 500,
      "entitledTitle": "Emerging",
      "promotionDue": false,
      "crossedAtBlock": null,
      "crossedAtDateUtc": null
    }
  }
};
