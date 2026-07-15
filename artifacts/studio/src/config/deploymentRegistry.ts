// config/deploymentRegistry.ts — THE DEPLOYMENT REGISTRY (committed canon; H2-⑩).
// ---------------------------------------------------------------------------
// The protocol's births: every contract deployment, with its EXACT block,
// chain time, and creation transaction. PROVENANCE (never invented): each row
// was chain-derived at the H2-⑩ gate (2026-07-15) by a read-only binary
// search on eth_getCode + creation-receipt verification against the public
// Avalanche RPC — every anchor below is a real transaction anyone can open.
// The three sale-engine blocks reconciled EXACTLY with the canon scan pins
// (protocolTargets SALE_SCAN_TARGETS), proving both records against the chain.
//
// Like the Chronicle register (CHR-1 pattern): committed canon, no DB, no
// scan, no server involvement — the activity feed derives its deployment
// lines from THIS file. A new deployment joins here (with its chain-read
// block + creation tx) in the same slice that introduces it — the Heartbeat
// Completeness Invariant.
//
// Doctrine: deployments are FOUNDER ACTS (the founder-voice rule — the
// sentence says so). Lines carry the label + real anchor; never an address.

export interface DeploymentEntry {
  /** Safe internal key (matches the canon contract registry vocabulary). */
  key: string;
  /** Public label (the /contracts vocabulary — never an address). */
  label: string;
  /** Exact deployment block (chain-derived, provenance above). */
  blockNumber: number;
  /** Chain time of the deployment block (epoch seconds — never a clock). */
  blockTimestampSec: number;
  /** UTC day of the deployment (derived from blockTimestampSec). */
  dateUtc: string;
  /** The creation transaction — the line's verify anchor (public chain data). */
  transactionHash: `0x${string}`;
  /**
   * The pool is factory-created (its "creation tx" is the factory call) and
   * carries its own §8 sentence — the market's opening.
   */
  isPoolCreation: boolean;
}

export const DEPLOYMENT_REGISTRY: readonly DeploymentEntry[] = [
  {
    key: "SYN_TOKEN",
    label: "SYN Token",
    blockNumber: 87_149_157,
    blockTimestampSec: 1_780_563_540,
    dateUtc: "2026-06-04",
    transactionHash: "0x3083f0fc7c6da9cbd4fcd86461cfff0b9ffcd01fc02c4b99f56c5d1bee05774e",
    isPoolCreation: false,
  },
  {
    key: "MEMBERSHIP_SALE",
    label: "Membership Sale V1",
    blockNumber: 87_157_852,
    blockTimestampSec: 1_780_572_968,
    dateUtc: "2026-06-04",
    transactionHash: "0x30e1378a66dc1037d49cb7557a162635f37a90ffde80e973bd9750d39927bdb6",
    isPoolCreation: false,
  },
  {
    key: "LP_PAIR",
    label: "SYN/USDC Pool",
    blockNumber: 87_163_331,
    blockTimestampSec: 1_780_578_927,
    dateUtc: "2026-06-04",
    transactionHash: "0x60f04521171a3f878f8b801c66a9e8c49f4931b9cb949b6c563b7ba47e9cbe05",
    isPoolCreation: true,
  },
  {
    key: "ARCHIVE_1155",
    label: "Archive1155",
    blockNumber: 87_331_091,
    blockTimestampSec: 1_780_760_171,
    dateUtc: "2026-06-06",
    transactionHash: "0x01e97dfc008b5001a15ca3811a051161d22ade3b7e5516ee3a781d8ba9171ddf",
    isPoolCreation: false,
  },
  {
    key: "MEMBERSHIP_SALE_V2A",
    label: "Membership Sale V2a",
    blockNumber: 88_095_827,
    blockTimestampSec: 1_781_544_362,
    dateUtc: "2026-06-15",
    transactionHash: "0x5f8929b03da6558a6cdcad83d536d804594125090db56380c94ee5e477e743f7",
    isPoolCreation: false,
  },
  {
    key: "MEMBERSHIP_SALE_V2",
    label: "Membership Sale V2b",
    blockNumber: 88_193_183,
    blockTimestampSec: 1_781_657_909,
    dateUtc: "2026-06-17",
    transactionHash: "0x6953c8ead4c18b8026b63eb2e3ac65cf6f7345286f33282d8f8f5133eee7d38e",
    isPoolCreation: false,
  },
  {
    key: "SOURCE_REGISTRY_V1",
    label: "Source Registry V1",
    blockNumber: 88_502_674,
    blockTimestampSec: 1_782_043_006,
    dateUtc: "2026-06-21",
    transactionHash: "0x29ae91db4b5868a5b572c315c250cce8b2ab8c438df97f6617a4a8b2bc435a67",
    isPoolCreation: false,
  },
  {
    key: "MEMBERSHIP_SALE_V3",
    label: "Membership Sale V3",
    blockNumber: 88_505_301,
    blockTimestampSec: 1_782_046_308,
    dateUtc: "2026-06-21",
    transactionHash: "0x635770ef23a36e4db3d5855b94dc6d6c3b2d72192c59b663e36f312f78bbb42c",
    isPoolCreation: false,
  },
];
