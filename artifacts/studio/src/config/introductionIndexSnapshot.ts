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
  "snapshotHash": "sha256:a5409ac3cb27d2e5fc75484a1cdfa4fc20934c4de98d52524b1d080ce57aa2ca",
  "asOfBlock": 90187222,
  "durableTest": "SYN_BALANCE_HELD",
  "totals": {
    "attributedPurchases": 3,
    "distinctSources": 2,
    "introducedMembers": 3,
    "durableIntroductions": 3,
    "commissionPaidRaw": "750000"
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
    },
    "src_ea47feba757c852a42c68dbb": {
      "attributedPurchases": 1,
      "introducedMembers": 1,
      "durableIntroductions": 1,
      "commissionPaidRaw": "250000",
      "escrowOwedRaw": "0",
      "firstBlock": 90187059,
      "lastBlock": 90187059,
      "currentBps": 500,
      "entitledBps": 500,
      "entitledTitle": "Emerging",
      "promotionDue": false,
      "crossedAtBlock": null,
      "crossedAtDateUtc": null
    }
  }
};
