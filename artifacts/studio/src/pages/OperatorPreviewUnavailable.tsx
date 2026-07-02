// OperatorPreviewUnavailable — safe fallback rendered at INTERNAL/operator
// routes when the build-time operator preview gate is OFF (default production
// posture). Honest copy: nothing is broken, nothing public lives here; the
// internal preview simply is not included in this build.
import { Link } from "wouter";
import { ShieldOff } from "lucide-react";

export default function OperatorPreviewUnavailable() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-24">
      <div className="max-w-xl text-center">
        <div className="mx-auto mb-6 h-12 w-12 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-center text-muted-foreground">
          <ShieldOff className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="syn-eyebrow text-muted-foreground">Operator preview</p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground">
          Internal preview is not enabled on this deployment
        </h1>
        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          This route belongs to the internal operator preview (Studio OS
          console, Proof Studio, founder and source postures, and the protocol
          OS map). This deployment was built without the operator preview
          flag, so that preview code is not part of this build. Nothing public
          is missing and nothing is broken.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
          >
            Return to the public site
          </Link>
        </div>
      </div>
    </div>
  );
}
