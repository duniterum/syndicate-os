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

// KNOWN DEV-ONLY CONSOLE WARNING (investigated 2026-07-17 — don't re-open):
// fresh /wallet loads on the rig print (twice) "Cannot update a component
// (ConnectModal) while rendering a different component (Hydrate)". Hydrate is
// wagmi's own hydration wrapper (rendered by the WagmiProvider below); with
// ssr:false wagmi calls onMount() → reconnect() DURING render, and reconnect's
// synchronous setState prelude makes the wagmi store emit mid-render —
// RainbowKit's modal state updates in response and React's dev build flags
// the render-phase update. Upstream wagmi design, reported since 2024
// (wevm/wagmi#3611, #3794), still present in the installed wagmi 2.19.5; the
// provider chain here is RainbowKit's documented composition and guard-pinned
// (guard-access-state rule 15) — not the cause. PROD-SAFE by construction:
// the warning text exists only in react-dom's development bundle (0 hits in
// react-dom-client.production.js), so it cannot appear on thesyndicate.money.
// The only known suppression, ssr:true in wagmiConfig, defers store
// rehydration past first paint and would flash a disconnected wallet at
// returning members on every load — a visual regression traded for a
// dev-only warning. Leave it.
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
    return <RainbowKitProvider locale="en-US">{children}</RainbowKitProvider>;
  }

  return (
    <RainbowKitAuthenticationProvider adapter={rainbowAuthAdapter} status={status}>
      {/* locale pinned: the site speaks English — RainbowKit otherwise follows
          the browser locale and the S7 door band CTA would render translated,
          incoherent with the page (caught on the rig, 2026-07-16). */}
      <RainbowKitProvider locale="en-US">{children}</RainbowKitProvider>
    </RainbowKitAuthenticationProvider>
  );
}
