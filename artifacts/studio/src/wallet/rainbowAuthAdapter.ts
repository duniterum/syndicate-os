// wallet/rainbowAuthAdapter.ts
//
// Bridges RainbowKit's sign-in flow to the UNCHANGED /api/auth SIWE backend.
//
// The backend is server-authoritative over domain / uri / statement / nonce /
// expiry (the challenge is domain- and URI-bound server-side for security), so
// we fetch the FULL challenge, stash it, and rebuild the EXACT message that
// viem's createSiweMessage produces — byte-for-byte what /api/auth/verify
// recovers the signer against. This module talks ONLY to "/api/auth/...".
//
// NOTE (Replit): createAuthenticationAdapter's shape is version-sensitive.
// Newer RainbowKit expects `createMessage` to RETURN A STRING; older versions
// returned an object plus a `getMessageBody`. Keep the SIWE fields below exactly
// as-is (they match the backend) and adapt only the adapter's method shape to
// the installed @rainbow-me/rainbowkit version if typecheck flags it.

import { createAuthenticationAdapter } from "@rainbow-me/rainbowkit";
import { createSiweMessage } from "viem/siwe";
import { announceSessionChanged } from "./sessionEvents";

interface Challenge {
  chainId: number;
  domain: string;
  uri: string;
  statement: string;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
}

// Single-flight: RainbowKit calls getNonce → createMessage → (wallet signs) →
// verify in sequence, so one stashed challenge is sufficient and correct.
let pendingChallenge: Challenge | null = null;

export const rainbowAuthAdapter = createAuthenticationAdapter({
  getNonce: async () => {
    const res = await fetch("/api/auth/challenge", { method: "POST" });
    if (!res.ok) throw new Error("challenge_failed");
    const challenge = (await res.json()) as Challenge;
    pendingChallenge = challenge;
    return challenge.nonce;
  },

  createMessage: ({ address, chainId }: { address: string; chainId: number }) => {
    const challenge = pendingChallenge;
    if (challenge === null) throw new Error("no_pending_challenge");
    return createSiweMessage({
      address: address as `0x${string}`,
      chainId,
      domain: challenge.domain,
      nonce: challenge.nonce,
      uri: challenge.uri,
      version: "1",
      statement: challenge.statement,
      issuedAt: new Date(challenge.issuedAt),
      expirationTime: new Date(challenge.expirationTime),
    });
  },

  verify: async ({ message, signature }: { message: string; signature: string }) => {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message, signature }),
    });
    if (res.ok) announceSessionChanged();
    return res.ok;
  },

  signOut: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      pendingChallenge = null;
      announceSessionChanged();
    }
  },
});
