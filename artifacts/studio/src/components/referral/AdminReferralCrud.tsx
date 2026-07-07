// components/referral/AdminReferralCrud.tsx
//
// Operator settings for the referral/source program: activate or pause the
// program, edit commission / split / caps / attribution window, and flip the
// eligibility rules. This is the "manage the program" surface.
//
// PREVIEW ONLY. Fields are editable so management feels real, but Save persists
// nothing — activating/pausing and editing terms are WRITES owned by the
// founder-gated operator write zone. When that zone is enabled, Save wires to
// it and the program goes live under the saved terms.

import { useState } from "react";
import { SlidersHorizontal, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { TruthLabel } from "@/components/TruthLabel";
import { referralSettingsSample, referralEligibilityToggles } from "@/config/referralProgram";

export function AdminReferralCrud() {
  const [active, setActive] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(referralSettingsSample.map((s) => [s.key, s.value])),
  );
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(referralEligibilityToggles.map((t) => [t.key, t.on])),
  );

  return (
    <Card id="referral-settings" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Referral program settings</h2>
        <TruthLabel variant="DESIGN_PREVIEW" />
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-5 leading-relaxed">
        Edit the terms and rules here. Preview: changes are not saved and the program stays paused until the
        operator write zone is enabled — then Save activates the program under these terms.
      </p>

      {/* Activation */}
      <div className="flex items-center justify-between rounded-md border border-border/50 p-4 mb-6">
        <div>
          <div className="text-sm font-medium text-foreground">Program status</div>
          <div className="text-xs text-muted-foreground">{active ? "Active (preview)" : "Paused"}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{active ? "Active" : "Paused"}</span>
          <Switch checked={active} onCheckedChange={setActive} aria-label="Activate or pause the program" />
        </div>
      </div>

      {/* Terms / rates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {referralSettingsSample.map((s) => (
          <div key={s.key}>
            <label className="text-xs text-muted-foreground mb-1 block">{s.label}</label>
            <Input
              value={values[s.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [s.key]: e.target.value }))}
              className="text-sm"
            />
          </div>
        ))}
      </div>

      {/* Eligibility rules */}
      <div className="mb-6">
        <div className="text-sm font-medium text-foreground mb-3">Eligibility &amp; anti-abuse</div>
        <div className="space-y-2">
          {referralEligibilityToggles.map((t) => (
            <div key={t.key} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">{t.label}</span>
              <Switch
                checked={toggles[t.key] ?? false}
                onCheckedChange={(on) => setToggles((prev) => ({ ...prev, [t.key]: on }))}
                aria-label={t.label}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button disabled title="Enabled with the operator write zone">
          <Save className="h-4 w-4 mr-1.5" />
          Save changes
        </Button>
        <span className="text-xs text-muted-foreground">Saving is enabled with the operator write zone.</span>
      </div>
    </Card>
  );
}
