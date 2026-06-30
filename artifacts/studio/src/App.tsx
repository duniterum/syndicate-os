import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Shell } from "@/components/layout/Shell";
import { PublicLayout } from "@/components/layout/PublicLayout";
import Home from "@/pages/Home";
import PublicHome from "@/pages/PublicHome";
import ProofDashboard from "@/pages/ProofDashboard";
import ProofStudio from "@/pages/ProofStudio";
import MemberAccess from "@/pages/MemberAccess";
import SystemStatus from "@/pages/SystemStatus";
import Learning from "@/pages/Learning";
import Recognition from "@/pages/Recognition";
import ContractMemory from "@/pages/ContractMemory";
import SourceAttribution from "@/pages/SourceAttribution";
import Support from "@/pages/Support";
import Archive from "@/pages/Archive";
import OperatorPreview from "@/pages/OperatorPreview";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RouteScrollManager } from "@/components/RouteScrollManager";
import { SeoHeadManager } from "@/components/SeoHeadManager";

const queryClient = new QueryClient();

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

      {/* Operator console surfaces — Shell chrome */}
      <Route path="/studio">
        <Shell>
          <Home />
        </Shell>
      </Route>
      <Route path="/proof-studio">
        <Shell>
          <ProofStudio />
        </Shell>
      </Route>
      <Route path="/founder">
        <Shell>
          <OperatorPreview moduleId="founder" />
        </Shell>
      </Route>
      <Route path="/source">
        <Shell>
          <OperatorPreview moduleId="source" />
        </Shell>
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
