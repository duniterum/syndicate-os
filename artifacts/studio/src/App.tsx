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
import PlaceholderPage from "@/pages/PlaceholderPage";
import SystemStatus from "@/pages/SystemStatus";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RouteScrollManager } from "@/components/RouteScrollManager";
import { SeoHeadManager } from "@/components/SeoHeadManager";
import { getModuleById } from "@/config/modules";

const queryClient = new QueryClient();

function PlaceholderRoute({ id }: { id: string }) {
  const module = getModuleById(id);
  if (!module) return <NotFound />;
  return (
    <PlaceholderPage
      title={module.label}
      description={module.description}
      label={module.truthStatus ?? "NOT_LIVE"}
    />
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicLayout>
          <PublicHome />
        </PublicLayout>
      </Route>
      <Route path="/studio">
        <Shell>
          <Home />
        </Shell>
      </Route>
      <Route path="/proof">
        <Shell>
          <ProofDashboard />
        </Shell>
      </Route>
      <Route path="/proof-studio">
        <Shell>
          <ProofStudio />
        </Shell>
      </Route>
      <Route path="/member">
        <Shell>
          <MemberAccess />
        </Shell>
      </Route>
      <Route path="/founder">
        <Shell>
          <PlaceholderRoute id="founder" />
        </Shell>
      </Route>
      <Route path="/source">
        <Shell>
          <PlaceholderRoute id="source" />
        </Shell>
      </Route>
      <Route path="/recognition">
        <Shell>
          <PlaceholderRoute id="recognition" />
        </Shell>
      </Route>
      <Route path="/learning">
        <Shell>
          <PlaceholderRoute id="learning" />
        </Shell>
      </Route>
      <Route path="/status">
        <Shell>
          <SystemStatus />
        </Shell>
      </Route>
      <Route>
        <Shell>
          <NotFound />
        </Shell>
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
