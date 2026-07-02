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

export type OperatorConsolePage =
  | "studio"
  | "proof-studio"
  | "founder"
  | "source"
  | "os-map";

export default function OperatorConsole({ page }: { page: OperatorConsolePage }) {
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
  }
}
