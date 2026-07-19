import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
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
// AUD-T (2026-07-16): the legal layer — the audit's fourth P0 dead.
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import Risk from "@/pages/Risk";
import Docs from "@/pages/Docs";
import Recognition from "@/pages/Recognition";
import ContractMemory from "@/pages/ContractMemory";
import ProtocolMap from "@/pages/ProtocolMap";
import SourceAttribution from "@/pages/SourceAttribution";
import ReferralSurface from "@/pages/ReferralSurface";
import JoinProtocol from "@/pages/JoinProtocol";
import SourceLinkBuilder from "@/pages/SourceLinkBuilder";
import Support from "@/pages/Support";
import Archive from "@/pages/Archive";
import Activity from "@/pages/Activity";
import MemberWallet from "@/pages/MemberWallet";
import MemberNotifications from "@/pages/MemberNotifications";
import Liquidity from "@/pages/Liquidity";
import MemberToolkit from "@/pages/MemberToolkit";
import ChronicleTeaser from "@/pages/ChronicleTeaser";
import FireLedger from "@/pages/FireLedger";
// /admin-in-prod (Ruling ②): the old OperatorPreviewUnavailable fallback is
// DEAD — it admitted an internal surface existed ("Internal preview is not
// enabled…"), violating the neutral wall. Non-operators now get the exact
// catch-all 404 composition (NotFound below), zero admin vocabulary.
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
// /admin-in-prod (Ruling ②, neutral wall): the OperatorRoute reveal reads the
// SERVER's operator-context (fail-closed) and re-checks on session change —
// rule 15 already names App.tsx as the only static @/wallet/ reach.
import { fetchOperatorContext } from "@/wallet/walletSession";
import { SESSION_CHANGED_EVENT } from "@/wallet/sessionEvents";
import { ThemeProvider } from "@/components/ThemeProvider";
import { RouteScrollManager } from "@/components/RouteScrollManager";
import { SeoHeadManager } from "@/components/SeoHeadManager";

const queryClient = new QueryClient();

// /admin-in-prod (Ruling ②, founder GO ⑤): the console module (Shell + every
// INTERNAL page) SHIPS in production — as a SEPARATE lazy chunk that is never
// part of the public entry bundle and is not even REQUESTED until the server
// confirms an ACTIVE operator role (the neutral wall in OperatorRoute below).
// OPERATOR_PREVIEW_ENABLED is now a DEV-ONLY reveal bypass (it folds to false
// in default production builds); it is visibility for development, never the
// production gate — authority lives server-side (operator-context, fail-closed).
const OperatorConsole = lazy(() => import("@/operator/OperatorConsole"));

// Wallet session boot seam (S2): app-root session resolution stays reachable
// ONLY through this conditional dynamic import. Since Phase 1 the gate is a
// `true` literal (the wallet layer ships in ALL builds); the seam keeps its
// gate shape so guard rule 15 can pin it, and S1 stays the fail-closed
// default until the server session read resolves.
const WalletSessionBoot = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/WalletSessionBoot"))
  : null;

// THE NEUTRAL WALL (Ruling ②): at a bare INTERNAL URL a non-operator sees the
// EXACT catch-all 404 composition — zero admin vocabulary, zero new strings —
// and the console chunk is never fetched. The reveal happens IN PLACE when the
// server confirms the role (fail-closed default false; re-reads on
// SESSION_CHANGED_EVENT, so signing in via the header resolves it live).
function OperatorRoute({ page }: { page: OperatorConsolePage }) {
  const [revealed, setRevealed] = useState(OPERATOR_PREVIEW_ENABLED);
  useEffect(() => {
    if (OPERATOR_PREVIEW_ENABLED) return; // dev bypass — prod folds this away
    let active = true;
    const read = () => {
      void fetchOperatorContext().then((ctx) => {
        if (active) setRevealed(ctx.isOperator && ctx.role !== null);
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);
  if (!revealed) {
    return (
      <PublicLayout>
        <NotFound />
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
      <PublicRoute path="/terms">
        <Terms />
      </PublicRoute>
      <PublicRoute path="/privacy">
        <Privacy />
      </PublicRoute>
      <PublicRoute path="/risk">
        <Risk />
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
      {/* /referral is the CANONICAL human URL (founder, 2026-07-13 — people
          search "referral program"); /source-attribution stays as a serving
          alias (200 + canonical → /referral; no 301 exists at the static
          layer until the domain transfer). ELEVATED 2026-07-19 (founder GO):
          /referral is now the member referral SURFACE — connected members get
          their dashboard IN the shell; anon + the prerender still get the
          public SourceAttribution program page (SEO untouched). The /source-
          attribution alias stays the plain public page. */}
      <PublicRoute path="/referral">
        <ReferralSurface />
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
      {/* §11 slot 2c, GROWN UP: Activity + Fire Ledger went LIVE (ACT-1 / the
          heartbeat) and are now named for their surface. Chronicle keeps the
          Teaser name honestly — its register is empty, so it still renders the
          FUTURE teaser until the founder promotes the first entry. All three
          serve the real indexed record (INDEX + sitemap). */}
      <PublicRoute path="/activity">
        <Activity />
      </PublicRoute>
      <PublicRoute path="/chronicle">
        <ChronicleTeaser />
      </PublicRoute>
      <PublicRoute path="/fire-ledger">
        <FireLedger />
      </PublicRoute>
      <PublicRoute path="/recognition">
        <Recognition />
      </PublicRoute>
      <PublicRoute path="/member">
        <MemberAccess />
      </PublicRoute>
      {/* ARC SLICE D member doors — flat routes (see the registry note). */}
      <PublicRoute path="/notifications">
        <MemberNotifications />
      </PublicRoute>
      <PublicRoute path="/wallet">
        <MemberWallet />
      </PublicRoute>
      <PublicRoute path="/liquidity">
        <Liquidity />
      </PublicRoute>
      <PublicRoute path="/toolkit">
        <MemberToolkit />
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
