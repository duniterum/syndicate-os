// walletSession.ts — dev-only SIWE session flow (S2 wallet session shell).
// ---------------------------------------------------------------------------
// This module lives behind the build-time wallet session gate
// (config/walletSessionGate.ts): it is dead-code-eliminated from production
// builds, where the /api/auth zone is dark anyway.
//
// Boundaries (founder-locked):
//   - Talks ONLY to /api/auth/* — never to member/protocol/source surfaces.
//   - The server never echoes a wallet address and stores no identity; the
//     address shown in the UI is a client-side fact from the wallet itself,
//     held in memory only (never persisted, never sent anywhere except
//     inside the signed SIWE message the server verifies and drops).
//   - A session proves wallet control right now — session ≠ membership.
//   - Every failure fails closed to S1.

import { createSiweMessage } from "viem/siwe";
import { getAddress } from "viem";
import { resolveWiredState, type WiredAccessStateId } from "@/config/accessState";

// ── EIP-1193 injected provider (browser wallet) ─────────────────────────────

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

export function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as { ethereum?: unknown }).ethereum;
  if (
    typeof eth === "object" &&
    eth !== null &&
    typeof (eth as { request?: unknown }).request === "function"
  ) {
    return eth as Eip1193Provider;
  }
  return null;
}

/** Prompt the wallet for account access; returns the first account or null. */
export async function requestAccount(
  provider: Eip1193Provider,
): Promise<string | null> {
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (Array.isArray(accounts) && typeof accounts[0] === "string") {
    return accounts[0];
  }
  return null;
}

// ── /api/auth transport (root-relative; studio is served at domain root) ────

const challengeShape = (v: unknown): v is {
  domain: string;
  uri: string;
  statement: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
} => {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.domain === "string" &&
    typeof o.uri === "string" &&
    typeof o.statement === "string" &&
    o.version === "1" &&
    typeof o.chainId === "number" &&
    typeof o.nonce === "string" &&
    typeof o.issuedAt === "string" &&
    typeof o.expirationTime === "string"
  );
};

export class WalletSessionError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "WalletSessionError";
  }
}

/**
 * Full SIWE sign-in: challenge → wallet signature → verify.
 * Returns the wired state on success ("S4"). The exact signed string is what
 * gets POSTed — the message is never rebuilt after signing.
 */
export async function signInWithWallet(
  provider: Eip1193Provider,
  rawAddress: string,
): Promise<WiredAccessStateId> {
  const address = getAddress(rawAddress); // EIP-55 checksum for SIWE
  const challengeRes = await fetch("/api/auth/challenge", { method: "POST" });
  if (!challengeRes.ok) throw new WalletSessionError("challenge_failed");
  const challenge: unknown = await challengeRes.json();
  if (!challengeShape(challenge)) throw new WalletSessionError("challenge_shape");

  const message = createSiweMessage({
    address,
    chainId: challenge.chainId,
    domain: challenge.domain,
    nonce: challenge.nonce,
    uri: challenge.uri,
    version: "1",
    statement: challenge.statement,
    issuedAt: new Date(challenge.issuedAt),
    expirationTime: new Date(challenge.expirationTime),
  });

  const signature = await provider.request({
    method: "personal_sign",
    params: [message, address],
  });
  if (typeof signature !== "string") throw new WalletSessionError("sign_rejected");

  const verifyRes = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  if (!verifyRes.ok) throw new WalletSessionError("verify_rejected");
  const verified: unknown = await verifyRes.json();
  return resolveWiredState(
    typeof verified === "object" && verified !== null
      ? (verified as Record<string, unknown>).state
      : undefined,
  );
}

/** Resolve the current server session; ANY failure fails closed to S1. */
export async function fetchSessionState(): Promise<WiredAccessStateId> {
  try {
    const res = await fetch("/api/auth/session", { method: "GET" });
    if (!res.ok) return "S1";
    const body: unknown = await res.json();
    return resolveWiredState(
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).state
        : undefined,
    );
  } catch {
    return "S1";
  }
}

/** Destroy the server session; always resolves to S1 (fail closed). */
export async function logoutSession(): Promise<WiredAccessStateId> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Cookie may outlive a failed request; the caller still wires S1 locally
    // and the next fetchSessionState() re-resolves the truth.
  }
  return "S1";
}

/** Truncated display form of a client-known address, e.g. 0x1234…abcd. */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
