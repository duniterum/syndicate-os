import { Router, type IRouter } from "express";
import { GetProtocolVerifyLinksResponse } from "@workspace/api-zod";
import {
  CONTRACT_TARGETS,
  FINANCIAL_TARGETS,
  SALE_SCAN_TARGETS,
} from "../data/protocolTargets";

/**
 * "Don't trust — verify" explorer links (READ-ONLY, PROTOCOL INFRASTRUCTURE ONLY).
 * ---------------------------------------------------------------------------
 * Founder-approved amendment (July 2026) to the address-emission doctrine:
 * this endpoint — and ONLY this endpoint — deliberately emits block-explorer
 * URLs for the protocol's own on-chain infrastructure, so every public figure
 * can be independently verified. The boundary that matters is PII:
 *
 *   - ALLOWED: sale engine contracts (V1/V2a/V2b/V3), the Archive1155 NFT
 *     contract, SourceRegistryV1, the SYN token, the canonical burn (dead)
 *     address, the Trader Joe LP pair, and the protocol's own treasury
 *     wallets (vault + operations) — all public protocol infrastructure.
 *   - FORBIDDEN, FOREVER: member wallets or any per-person address. No such
 *     address exists in this module's inputs (protocolTargets carries only
 *     protocol infrastructure), and none may ever be added here.
 *
 * Every address is sourced from the served protocolTargets constants, which a
 * reconcile guard proves against vendored canon. Entries are built fail-closed:
 * a non-live (non 0x40-hex) address is OMITTED, never invented or normalized.
 * The protocol-reality envelope's own no-address-leak discipline is untouched —
 * this is a separate, deliberate, verify-only surface.
 */

const MODE = "READ_ONLY_VERIFY_LINKS" as const;

const NOTE =
  "Explorer links for protocol infrastructure only (contracts, treasury wallets, LP pair, burn address). Never member wallets. Don't trust — verify.";

/** Avascan C-Chain explorer base (mirrors canon EXPLORER_BASE_URL). */
const EXPLORER_BASE = "https://avascan.info/blockchain/c";

const isLiveAddress = (v: string) => /^0x[a-fA-F0-9]{40}$/.test(v);

const addressUrl = (address: string) => `${EXPLORER_BASE}/address/${address}`;
const tokenUrl = (address: string) => `${EXPLORER_BASE}/token/${address}`;

type LinkSpec = {
  id:
    | "membershipSaleV1"
    | "membershipSaleV2A"
    | "membershipSaleV2"
    | "membershipSaleV3"
    | "nftArchive"
    | "vaultWallet"
    | "liquidityWallet"
    | "operationsWallet"
    | "lpPair"
    | "synToken"
    | "burnAddress"
    | "sourceRegistry";
  label: string;
  address: string | undefined;
  kind: "address" | "token";
};

const contractAddress = (key: string): string | undefined =>
  CONTRACT_TARGETS.find((t) => t.key === key)?.address;

const scanAddress = (key: string): string | undefined =>
  SALE_SCAN_TARGETS.find((t) => t.key === key)?.address;

const SPECS: readonly LinkSpec[] = [
  { id: "membershipSaleV1", label: "Membership Sale V1 (sealed)", address: scanAddress("MEMBERSHIP_SALE"), kind: "address" },
  { id: "membershipSaleV2A", label: "Membership Sale V2a (sealed)", address: scanAddress("MEMBERSHIP_SALE_V2A"), kind: "address" },
  { id: "membershipSaleV2", label: "Membership Sale V2b (sealed)", address: scanAddress("MEMBERSHIP_SALE_V2"), kind: "address" },
  { id: "membershipSaleV3", label: "Membership Sale V3 (active)", address: scanAddress("MEMBERSHIP_SALE_V3"), kind: "address" },
  { id: "nftArchive", label: "Archive 1155 (NFT artifacts)", address: contractAddress("ARCHIVE_1155"), kind: "address" },
  { id: "vaultWallet", label: "Vault reserve wallet", address: FINANCIAL_TARGETS.vaultWallet, kind: "address" },
  { id: "liquidityWallet", label: "Liquidity wallet", address: FINANCIAL_TARGETS.liquidityWallet, kind: "address" },
  { id: "operationsWallet", label: "Operations wallet", address: FINANCIAL_TARGETS.operationsWallet, kind: "address" },
  { id: "lpPair", label: "SYN/USDC LP pair (Trader Joe)", address: FINANCIAL_TARGETS.lpPair, kind: "address" },
  { id: "synToken", label: "SYN token", address: FINANCIAL_TARGETS.synTokenAddress, kind: "token" },
  { id: "burnAddress", label: "Canonical burn address", address: FINANCIAL_TARGETS.synBurnAddress, kind: "address" },
  { id: "sourceRegistry", label: "Source Registry V1", address: contractAddress("SOURCE_REGISTRY_V1"), kind: "address" },
];

// Built once at module load, fail-closed: any spec whose address is absent or
// not a live 0x40-hex address is OMITTED (never guessed, never normalized).
const links = SPECS.flatMap((spec) => {
  if (!spec.address || !isLiveAddress(spec.address)) return [];
  const url = spec.kind === "token" ? tokenUrl(spec.address) : addressUrl(spec.address);
  return [{ id: spec.id, label: spec.label, url }];
});

const verifyLinksResponse = GetProtocolVerifyLinksResponse.parse({
  mode: MODE,
  note: NOTE,
  links,
});

const router: IRouter = Router();

router.get("/protocol/verify-links", (_req, res) => {
  res.json(verifyLinksResponse);
});

export default router;
