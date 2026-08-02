/**
 * The ONE "referral sources created on-chain" count (2026-08-02).
 * ---------------------------------------------------------------------------
 * Counts indexed SourceCreated events from the SOURCE_LIFECYCLE lane — the
 * founder-signed registry acts, chain truth, including zero-purchase sources
 * (the class every narrower universe misses). Canon-chain scoped. Imported by
 * the member-ledger totals AND the per-source performance payload so the
 * dashboard tile and the panel behind its door can never quote two different
 * authorities for the same words (the 12-vs-14 lesson, then the 5-vs-1).
 * Semantic note, deliberately visible to callers: this is CREATED-EVER — a
 * revoked source still counts. Whether the surfaces should instead show
 * "active now" is the founder's open decision (2026-08-02 review, finding 4).
 */

import { CHAIN_REGISTRY } from "../../canon/the-syndicate/chain/chain-registry";

export async function countSourcesCreated(): Promise<number> {
  const { pool } = await import("@workspace/db");
  const res = await pool.query(
    `select count(*)::int as count from protocol_event_raw where chain_id = $1 and stream_key = 'SOURCE_LIFECYCLE' and event_name = 'SourceCreated'`,
    [CHAIN_REGISTRY.id],
  );
  return Number(res.rows[0]?.count ?? 0);
}
