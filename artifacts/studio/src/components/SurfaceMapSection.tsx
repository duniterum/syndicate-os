// components/SurfaceMapSection.tsx — the surface map, ONE component, two homes.
// AUD-TRUTH-2 (founder Ruling ②, 2026-07-16): PUBLIC-SEES-ADMIN-NEVER means the
// operator/admin surface list MOVED to the operator side — never deleted, never
// duplicated. The public /status passes PUBLIC + MEMBER audiences; the internal
// /os-map (operator build-gated) passes all three. One projection of the
// surface-classification registry — it can never fork into two truths.

import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { TruthLabel } from "@/components/TruthLabel";
import {
  surfaceClassification,
  surfaceAudienceText,
  type SurfaceAudience,
} from "@/config/surfaceClassification";
import { getModuleById } from "@/config/modules";

export function SurfaceMapSection({
  audiences,
}: {
  audiences: readonly SurfaceAudience[];
}) {
  return (
    <div className="space-y-8">
      {audiences.map((aud) => {
        const rows = surfaceClassification.filter((s) => s.audience === aud);
        if (rows.length === 0) return null;
        return (
          <div key={aud}>
            <h3 className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">
              {surfaceAudienceText[aud]}
            </h3>
            <Card className="bg-card/30 border-border/50 divide-y divide-border/40">
              {rows.map((s) => {
                const module = s.moduleId ? getModuleById(s.moduleId) : undefined;
                return (
                  <div
                    key={s.routePath}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {module?.label ?? s.routePath}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{s.summary}</div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {module?.truthStatus && <TruthLabel variant={module.truthStatus} />}
                      <Link
                        href={s.routePath}
                        className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {s.routePath}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
