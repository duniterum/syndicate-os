import { TruthLabel, TruthLabelVariant } from "@/components/TruthLabel";
import { getModuleById } from "@/config/modules";
import { memberAccess, expectations } from "@/config/syndicateFacts";

export default function MemberAccess() {
  const module = getModuleById("member");
  const label: TruthLabelVariant = module?.truthStatus ?? "AWAITING_FOUNDER_APPROVAL";

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col">
      <div className="mb-8 flex flex-col gap-4">
        <TruthLabel variant={label} className="self-start" />
        <h1 className="text-3xl font-light text-foreground tracking-tight">
          {memberAccess.heading}
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          {memberAccess.intro}
        </p>
      </div>

      <div className="border border-border/50 rounded-lg bg-card/20 p-6 mb-8">
        <ul className="space-y-3">
          {memberAccess.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed"
            >
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mt-auto pt-4 border-t border-border/50">
        {expectations.body}
      </p>
    </div>
  );
}
