// ─────────────────────────────────────────────────────────────────────────────
// Vendored canon barrel — duniterum/TheSyndicate main @ cf4ca34c74599de1324e77052f1a81dd15cb1cc0
// Read-only canon assets. See PROVENANCE.md for source paths, conversions, and
// the safety review. This directory is excluded from the api-server TypeScript
// program and is not yet imported by active app code; it exists as pinned local
// canon. A future wiring slice owns any strict-mode / server-runtime adaptation.
//
// Namespaced re-exports avoid symbol collisions across canon modules.
// ─────────────────────────────────────────────────────────────────────────────

export * as chainRegistry from "./chain/chain-registry";
export * as syndicateConfig from "./contracts/syndicate-config";
export * as contractRegistry from "./contracts/contract-registry";
export * as saleAbi from "./contracts/abi/sale-abi";
export * as archiveNftAbi from "./contracts/abi/archive-nft-abi";
export * as archiveIdRegistry from "./archive/archive-id-registry";
export * as protocolEventRegistry from "./proof/protocol-event-registry";
