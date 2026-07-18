/**
 * @workspace/os-contracts — public contract surface.
 *
 * Mostly TYPE-ONLY. The Source Boundary + access-state re-exports are pure
 * vocabulary/shape contracts (NOT evidence that any data/adapter/wiring
 * exists). `./notifications` additionally carries RUNTIME constants — the
 * notification icon palette + internal link whitelist — the single source both
 * the API validator and the studio renderer/pickers import so the two can
 * never drift (bundled from source by esbuild + vite).
 */
export type * from "./source-boundary";
export type * from "./access-state";
export * from "./notifications";
