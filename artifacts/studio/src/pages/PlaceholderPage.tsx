import React from "react";
import { DataStatusNote } from "@/components/layout/Shell";
import { TruthLabel, TruthLabelVariant } from "@/components/TruthLabel";

interface PlaceholderPageProps {
  title: string;
  description: string;
  label: TruthLabelVariant;
}

export default function PlaceholderPage({ title, description, label }: PlaceholderPageProps) {
  return (
    <div className="p-8 max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-foreground tracking-tight">{title}</h1>
      </div>

      <DataStatusNote description="This section of the operating console has not been connected to a live source." />

      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/50 rounded-lg bg-card/10 p-8 text-center">
        <TruthLabel variant={label} className="mb-4 scale-110" />
        <h2 className="text-xl font-medium text-foreground mb-3">{title} Module Placeholder</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{description}</p>
      </div>
    </div>
  );
}
