/**
 * THE EXPLORER INDEX — one endpoint, one page size, one place.
 * ---------------------------------------------------------------------------
 * Two lanes ask an index where to look: the native-AVAX lane (native movements
 * emit no log at all) and the token discovery lane's backfill (the contract is
 * unknown by definition, so walking means every contract on the chain). Both
 * need the same base URL and the same explicit page size, and this file exists
 * so that is ONE fact rather than two copies.
 *
 * The reason is not tidiness. On 2026-07-27 the same session was burned three
 * times by a single decision written in two places — the seat-key spaces, the
 * LP-pair exclusion list assembled privately in a runner, and a cursor-hold
 * whose admission test disagreed with its builder's. Two copies of one fact
 * always drift; the only question is when.
 *
 * WHAT THIS INDEX IS ALLOWED TO DO (the chain-reading law, §2): it says WHERE to
 * look — which transactions involve our wallets. It never supplies a published
 * figure; those come from our own node's receipts. So an explorer that is wrong,
 * stale or hostile can cost us coverage, never truth.
 */

/** Etherscan-compatible account API, chain-pinned to the C-Chain. */
export const EXPLORER_ACCOUNT_API =
  "https://api.routescan.io/v2/network/mainnet/evm/43114/etherscan/api";

/**
 * ALWAYS SENT EXPLICITLY. The endpoint's DEFAULT page is 25 rows and it
 * truncates in SILENCE — status "1", no flag, no count. Measured 2026-07-27: a
 * wallet with 37 rows answered with exactly 25. A lane that takes that as the
 * whole window, advances its cursor and declares the range covered has put a
 * permanent invisible hole in a money record. Every caller sends this size AND
 * fails loud when the answer fills it.
 */
export const EXPLORER_PAGE_SIZE = 10_000;
