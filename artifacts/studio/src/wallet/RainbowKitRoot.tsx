// wallet/RainbowKitRoot.tsx
//
// Root wallet providers (Phase 1, founder-approved): wagmi + RainbowKit wired
// to the UNCHANGED /api/auth SIWE backend. Two exports compose the approved
// chain in App.tsx:
//
//   <WalletWagmiProvider>            (outside the query client — wagmi v2 needs
//     <QueryClientProvider>           TanStack Query below it)
//       <WalletAuthProvider>          (RainbowKitAuthenticationProvider +
//         …app…                        RainbowKitProvider)
//
// Authentication status is DERIVED from GET /api/auth/session (S4 =
// authenticated) via a fail-closed query — the session truth stays with the
// server; RainbowKit never becomes a second source of truth. A successful
// verify / sign-out announces SESSION_CHANGED_EVENT, which invalidates the
// query here AND re-wires AccessStateProvider through WalletSessionBoot.

import "@rainbow-me/rainbowkit/styles.css";
import { useEffect, type ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "./wagmiConfig";
import { rainbowAuthAdapter } from "./rainbowAuthAdapter";
import { fetchSessionState } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";
import { useAuthAvailability } from "@/lib/authAvailability";

const SESSION_QUERY_KEY = ["auth", "session-state"] as const;

export function WalletWagmiProvider({ children }: { children: ReactNode }) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}

export function WalletAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  // fetchSessionState fails closed to "S1" on ANY error — so a fetch failure
  // renders as "unauthenticated", never as a fake signed-in state.
  const { data, isPending } = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSessionState,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const onSessionChanged = () => {
      void queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    };
    window.addEventListener(SESSION_CHANGED_EVENT, onSessionChanged);
    return () =>
      window.removeEventListener(SESSION_CHANGED_EVENT, onSessionChanged);
  }, [queryClient]);

  const status = isPending
    ? "loading"
    : data === "S4"
      ? "authenticated"
      : "unauthenticated";

  // While the auth zone is dark (challenge/session return 404), do NOT mount the
  // SIWE authentication flow — otherwise RainbowKit renders its own "Verify your
  // account → Error preparing message" modal against the 404 challenge. Wallet
  // CONNECT still works; only the sign-in verify step is withheld until the zone
  // is live, at which point the provider mounts automatically (no code change).
  const availability = useAuthAvailability();
  if (availability !== "live") {
    return <RainbowKitProvider>{children}</RainbowKitProvider>;
  }

  return (
    <RainbowKitAuthenticationProvider adapter={rainbowAuthAdapter} status={status}>
      <RainbowKitProvider>{children}</RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}
