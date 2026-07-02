import { lazy, Suspense } from "react";
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
import SourceAttribution from "@/pages/SourceAttribution";
import Support from "@/pages/Support";
import Archive from "@/pages/Archive";
import OperatorPreviewUnavailable from "@/pages/OperatorPreviewUnavailable";
import { OPERATOR_PREVIEW_ENABLED } from "@/config/operatorPreviewGate";
import type { OperatorConsolePage } from "@/operator/OperatorConsole";
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

function Router() {
  return (
    <Switch>
      {/* Public marketing surfaces — PublicLayout chrome */}
      <Route path="/">
        <PublicLayout>
          <PublicHome />
        </PublicLayout>
      </Route>
      <Route path="/proof">
        <PublicLayout>
          <ProofDashboard />
        </PublicLayout>
      </Route>
      <Route path="/status">
        <PublicLayout>
          <SystemStatus />
        </PublicLayout>
      </Route>
      <Route path="/learning">
        <PublicLayout>
          <Learning />
        </PublicLayout>
      </Route>
      <Route path="/contracts">
        <PublicLayout>
          <ContractMemory />
        </PublicLayout>
      </Route>
      <Route path="/source-attribution">
        <PublicLayout>
          <SourceAttribution />
        </PublicLayout>
      </Route>
      <Route path="/support">
        <PublicLayout>
          <Support />
        </PublicLayout>
      </Route>
      <Route path="/archive">
        <PublicLayout>
          <Archive />
        </PublicLayout>
      </Route>
      <Route path="/recognition">
        <PublicLayout>
          <Recognition />
        </PublicLayout>
      </Route>
      <Route path="/member">
        <PublicLayout>
          <MemberAccess />
        </PublicLayout>
      </Route>

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
      <Route path="/source">
        <OperatorRoute page="source" />
      </Route>
      <Route path="/os-map">
        <OperatorRoute page="os-map" />
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
            <RouteScrollManager />
            <SeoHeadManager />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
