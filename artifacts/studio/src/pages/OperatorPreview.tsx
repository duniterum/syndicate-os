import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { DataStatusNote } from "@/components/DataStatusNote";
import { TruthLabel } from "@/components/TruthLabel";
import { Card } from "@/components/ui/card";
import { getModuleById } from "@/config/modules";
import { getSurfaceByRoute, surfaceAudienceText } from "@/config/surfaceClassification";
import NotFound from "@/pages/not-found";

// What each operator surface will do once built. Copy only — nothing here acts.
const detailById: Record<string, string[]> = {
  founder: [
    "Review and approve membership and source-activation requests.",
    "Hold founder-gated controls behind verified authentication.",
    "Nothing here acts — every control is disabled in this preview.",
  ],
  source: [
    "Operate the verified-introduction source registry.",
    "Paused by precaution today — no attribution is read or written.",
    "Activation is gated behind founder approval and real wiring.",
  ],
};

export default function OperatorPreview({ moduleId }: { moduleId: string }) {
  const module = getModuleById(moduleId);
  if (!module) return <NotFound />;

  const surface = getSurfaceByRoute(module.path);
  const Icon = module.icon;
  const details =
    detailById[moduleId] ?? ["This operator surface is a preview. Nothing here is wired or acts."];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-light text-foreground tracking-tight flex items-center gap-3">
          <Icon className="h-8 w-8 text-primary" />
          {module.label}
        </h1>
        {surface && <p className="text-muted-foreground mt-2">{surface.summary}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {module.truthStatus && <TruthLabel variant={module.truthStatus} />}
        <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-sm border border-border/60 text-muted-foreground">
          {surfaceAudienceText[surface?.audience ?? "OPERATOR_PREVIEW"]}
        </span>
      </div>

      <DataStatusNote description={module.description} />

      <Card className="bg-card/40 border-border/50 p-6">
        <h2 className="text-sm font-medium text-foreground mb-4">When built, this surface will:</h2>
        <ul className="space-y-3">
          {details.map((d) => (
            <li key={d} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Link
        href="/studio"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Studio OS
      </Link>
    </div>
  );
}
