// OperatorConsole — the ONLY entry point to internal/operator preview code.
// ---------------------------------------------------------------------------
// This module statically imports the console chrome (Shell), the sectioned
// admin shell (AdminShell) and every registry-INTERNAL page. App.tsx loads it
// EXCLUSIVELY through a conditional dynamic import behind
// OPERATOR_PREVIEW_ENABLED (config/operatorPreviewGate.ts), so a default
// production build excludes all of this code from the bundle.
// Do not import this module — or Shell / AdminShell / the pages below —
// statically from anywhere else; guard-operator-gate.ts enforces that.

import { useLocation } from "wouter";
import { Shell } from "@/components/layout/Shell";
import Home from "@/pages/Home";
import ProofStudio from "@/pages/ProofStudio";
import OperatorPreview from "@/pages/OperatorPreview";
import OsMap from "@/pages/OsMap";
import AdminShell, { ADMIN_SECTIONS } from "@/components/admin/AdminShell";
import { AccessGate } from "@/components/access/AccessGate";

export type OperatorConsolePage =
  | "studio"
  | "proof-studio"
  | "founder"
  | "source"
  | "os-map"
  | "admin";

const pageRoutePath: Record<OperatorConsolePage, string> = {
  studio: "/studio",
  "proof-studio": "/proof-studio",
  founder: "/founder",
  source: "/source",
  "os-map": "/os-map",
  admin: "/admin",
};

// The AccessGate here is the IA-1 access-state shell for console surfaces
// (all PREVIEW_LABELLED — renders unchanged). It is visibility/UX only; the
// real console gate remains the build-time OPERATOR_PREVIEW_ENABLED exclusion.
// For the sectioned admin surface the gate classifies the EXACT mounted
// /admin/* section route (every section is individually classified); an
// unknown /admin/* location fails closed to the root "/admin" classification.
export default function OperatorConsole({ page }: { page: OperatorConsolePage }) {
  const [location] = useLocation();
  const routePath =
    page === "admin"
      ? (ADMIN_SECTIONS.find((s) => s.path === location)?.path ?? "/admin")
      : pageRoutePath[page];
  return <AccessGate routePath={routePath}>{renderPage(page)}</AccessGate>;
}

function renderPage(page: OperatorConsolePage) {
  switch (page) {
    case "studio":
      return (
        <Shell>
          <Home />
        </Shell>
      );
    case "proof-studio":
      return (
        <Shell>
          <ProofStudio />
        </Shell>
      );
    case "founder":
      return (
        <Shell>
          <OperatorPreview moduleId="founder" />
        </Shell>
      );
    case "source":
      return (
        <Shell>
          <OperatorPreview moduleId="source" />
        </Shell>
      );
    case "os-map":
      return (
        <Shell>
          <OsMap />
        </Shell>
      );
    case "admin":
      // The admin shell brings its own chrome (sidebar + top bar); it does
      // not nest inside the Studio Shell.
      return <AdminShell />;
  }
}
