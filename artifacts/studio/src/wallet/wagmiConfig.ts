// wallet/wagmiConfig.ts
//
// wagmi + RainbowKit configuration. Avalanche C-Chain (43114). The WalletConnect
// projectId is PUBLIC client-side config (never a secret) supplied via a VITE_
// env var so it stays out of committed source and can be domain-locked in the
// WalletConnect Cloud dashboard per environment.

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { avalanche } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string;

export const wagmiConfig = getDefaultConfig({
  appName: "The Syndicate",
  projectId,
  chains: [avalanche],
  // ssr:false makes wagmi's Hydrate run reconnect() during render — the source
  // of the known dev-only ConnectModal/Hydrate console warning. Read the note
  // in RainbowKitRoot.tsx before flipping this: ssr:true trades a dev warning
  // for a disconnected-wallet flash at first paint.
  ssr: false,
});
