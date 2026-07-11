import { lazy, Suspense, type ReactNode } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { PublicLayout } from "@/components/layout/PublicLayout";
import PublicHome from "@/pages/PublicHome";
import ProofDashboard from "@/pages/ProofDashboard";
import MemberAccess from "@/pages/MemberAccess";
import SystemStatus from "@/pages/SystemStatus";
import Learning from "@/pages/Learning";
import Whitepaper from "@/pages/Whitepaper";
import Tokenomics from "@/pages/Tokenomics";
import Faq from "@/pages/Faq";
import Docs from "@/pages/Docs";
import Recognition from "@/pages/Recognition";
import ContractMemory from "@/pages/ContractMemory";
import ProtocolMap from "@/pages/ProtocolMap";
import SourceAttribution from "@/pages/SourceAttribution";
import JoinProtocol from "@/pages/JoinProtocol";
import SourceLinkBuilder from "@/pages/SourceLinkBuilder";
import Support from "@/pages/Support";
import Archive from "@/pages/Archive";
import OperatorPreviewUnavailable from "@/pages/OperatorPreviewUnavailable";
import { OPERATOR_PREVIEW_ENABLED } from "@/config/operatorPreviewGate";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";
import type { OperatorConsolePage } from "@/operator/OperatorConsole";
import { AccessStateProvider } from "@/components/access/AccessStateProvider";
import { AccessGate } from "@/components/access/AccessGate";
// Phase 1 (founder-approved): the wallet layer ships in EVERY build via root
// providers — wagmi + RainbowKit wired to the unchanged /api/auth backend.
// guard-access-state rule 15 pins this exact wiring (App.tsx is the ONLY file
// allowed to statically reach @/wallet/).
import { WalletWagmiProvider, WalletAuthProvider } from "@/wallet/RainbowKitRoot";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RouteScrollManager } from "@/components/RouteScrollManager";
import { SeoHeadManager } from "@/components/SeoHeadManager";

const queryClient = new QueryClient();

// Operator preview hard gate: the console module (Shell + every INTERNAL page)
// is reachable ONLY through this conditional dynamic import. When the gate
// folds to `false` at build time (default production posture), Rollup
// eliminates the import entirely — the console code is not in the bundle and
// INTERNAL routes render the safe unavailable page instead.
const OperatorConsole = OPERATOR_PREVIEW_ENABLED
  ? lazy(() => import("@/operator/OperatorConsole"))
  : null;

// Wallet session boot seam (S2): app-root session resolution stays reachable
// ONLY through this conditional dynamic import. Since Phase 1 the gate is a
// `true` literal (the wallet layer ships in ALL builds); the seam keeps its
// gate shape so guard rule 15 can pin it, and S1 stays the fail-closed
// default until the server session read resolves.
const WalletSessionBoot = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/WalletSessionBoot"))
  : null;

function OperatorRoute({ page }: { page: OperatorConsolePage }) {
  if (!OperatorConsole) {
    return (
      <PublicLayout>
        <OperatorPreviewUnavailable />
      </PublicLayout>
    );
  }
  return (
    <Suspense fallback={null}>
      <OperatorConsole page={page} />
    </Suspense>
  );
}

// Public/member surfaces render through the fail-closed AccessGate shell.
// Every surface is PREVIEW_LABELLED in IA-1, so nothing visible changes; the
// gate is a visibility/UX seam only, never security (see AccessGate.tsx).
function PublicRoute({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  return (
    <Route path={path}>
      <PublicLayout>
        <AccessGate routePath={path}>{children}</AccessGate>
      </PublicLayout>
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public marketing surfaces — PublicLayout chrome */}
      <PublicRoute path="/">
        <PublicHome />
      </PublicRoute>
      <PublicRoute path="/proof">
        <ProofDashboard />
      </PublicRoute>
      <PublicRoute path="/status">
        <SystemStatus />
      </PublicRoute>
      <PublicRoute path="/learning">
        <Learning />
      </PublicRoute>
      <PublicRoute path="/whitepaper">
        <Whitepaper />
      </PublicRoute>
      <PublicRoute path="/tokenomics">
        <Tokenomics />
      </PublicRoute>
      <PublicRoute path="/faq">
        <Faq />
      </PublicRoute>
      <PublicRoute path="/docs">
        <Docs />
      </PublicRoute>
      <PublicRoute path="/contracts">
        <ContractMemory />
      </PublicRoute>
      <PublicRoute path="/map">
        <ProtocolMap />
      </PublicRoute>
      <PublicRoute path="/source-attribution">
        <SourceAttribution />
      </PublicRoute>
      <PublicRoute path="/support">
        <Support />
      </PublicRoute>
      <PublicRoute path="/archive">
        <Archive />
      </PublicRoute>
      <PublicRoute path="/recognition">
        <Recognition />
      </PublicRoute>
      <PublicRoute path="/member">
        <MemberAccess />
      </PublicRoute>
      <PublicRoute path="/join">
        <JoinProtocol />
      </PublicRoute>
      <PublicRoute path="/source">
        <SourceLinkBuilder />
      </PublicRoute>

      {/* Operator console surfaces — hard-gated (config/operatorPreviewGate.ts) */}
      <Route path="/studio">
        <OperatorRoute page="studio" />
      </Route>
      <Route path="/proof-studio">
        <OperatorRoute page="proof-studio" />
      </Route>
      <Route path="/founder">
        <OperatorRoute page="founder" />
      </Route>
      <Route path="/os-source">
        <OperatorRoute page="source" />
      </Route>
      <Route path="/os-map">
        <OperatorRoute page="os-map" />
      </Route>
      <Route path="/admin">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/members">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/sources">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/operators">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/content">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/modules">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/broadcast">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/audit">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/support">
        <OperatorRoute page="admin" />
      </Route>
      <Route path="/admin/settings">
        <OperatorRoute page="admin" />
      </Route>

      {/* Catch-all (bare Route → not-found) */}
      <Route>
        <PublicLayout>
          <NotFound />
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="syndicate-theme">
      <WalletWagmiProvider>
        <QueryClientProvider client={queryClient}>
          <WalletAuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AccessStateProvider>
                  {WalletSessionBoot ? (
                    <Suspense fallback={null}>
                      <WalletSessionBoot />
                    </Suspense>
                  ) : null}
                  <RouteScrollManager />
                  <SeoHeadManager />
                  <Router />
                </AccessStateProvider>
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </WalletAuthProvider>
        </QueryClientProvider>
      </WalletWagmiProvider>
    </ThemeProvider>
  );
}

export default App;
