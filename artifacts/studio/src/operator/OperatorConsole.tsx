// OperatorConsole — the ONLY entry point to internal/operator preview code.
// ---------------------------------------------------------------------------
// This module statically imports the console chrome (Shell) and every
// registry-INTERNAL page. App.tsx loads it EXCLUSIVELY through a conditional
// dynamic import behind OPERATOR_PREVIEW_ENABLED (config/operatorPreviewGate.ts),
// so a default production build excludes all of this code from the bundle.
// Do not import this module — or Shell / the pages below — statically from
// anywhere else; guard-operator-gate.ts enforces that.

import { Shell } from "@/components/layout/Shell";
import Home from "@/pages/Home";
import ProofStudio from "@/pages/ProofStudio";
import OperatorPreview from "@/pages/OperatorPreview";
import OsMap from "@/pages/OsMap";
import AdminControlTower from "@/pages/AdminControlTower";
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
export default function OperatorConsole({ page }: { page: OperatorConsolePage }) {
  return (
    <AccessGate routePath={pageRoutePath[page]}>{renderPage(page)}</AccessGate>
  );
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
      return (
        <Shell>
          <AdminControlTower />
        </Shell>
      );
  }
}
