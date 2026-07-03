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

// Wallet session hard gate (S2): app-root session resolution is reachable
// ONLY through this conditional dynamic import. Default production builds
// fold the gate to `false` — the wallet module (and every "/api/auth"
// string) is dead-code-eliminated; the provider stays fail-closed at S1.
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
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
