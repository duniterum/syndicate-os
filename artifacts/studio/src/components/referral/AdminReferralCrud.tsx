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
import { referralSettingsSample, referralEditableTerms, referralEligibilityToggles, commissionTiers, commissionCapPct, rateChangeEvent } from "@/config/referralProgram";
import { saveReferralTerm } from "@/lib/operatorClient";

export function AdminReferralCrud() {
  const [active, setActive] = useState(false);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(referralEditableTerms.map((t) => [t.key, t.value])),
  );
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(referralEligibilityToggles.map((t) => [t.key, t.on])),
  );
  const [saveState, setSaveState] = useState<
    | { kind: "idle" }
    | { kind: "saving" }
    | { kind: "saved" }
    | { kind: "denied" }
    | { kind: "unavailable" }
    | { kind: "partial"; reason: string }
  >({ kind: "idle" });

  async function handleSave() {
    setSaveState({ kind: "saving" });
    const results = await Promise.all(
      Object.entries(values).map(([key, value]) => saveReferralTerm(key, value)),
    );
    if (results.every((r) => r.ok)) {
      setSaveState({ kind: "saved" });
      return;
    }
    const reasons = results.filter((r) => !r.ok).map((r) => r.reason ?? "");
    if (reasons.some((r) => r === "no_session" || r === "insufficient_role" || r === "401" || r === "403")) {
      setSaveState({ kind: "denied" });
    } else if (reasons.some((r) => r === "unreachable" || r === "unavailable" || r === "404" || r === "503")) {
      setSaveState({ kind: "unavailable" });
    } else {
      setSaveState({ kind: "partial", reason: reasons[0] ?? "rejected" });
    }
  }

  return (
    <Card id="referral-settings" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Referral program settings</h2>
        <TruthLabel variant="DESIGN_PREVIEW" />
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-5 leading-relaxed">
        Edit the terms and rules here. Save submits term values through the LIVE
        founder-gated operator write zone — a real write, recorded in the audit
        log (server-side 30% hard cap). Save never activates or pauses the
        program: program state is an on-chain fact.
      </p>

      {/* Program state — the on-chain truth + the future kill-switch (preview) */}
      <div className="flex items-center justify-between rounded-md border border-border/50 p-4 mb-6">
        <div>
          <div className="text-sm font-medium text-foreground">Program status</div>
          <div className="text-xs text-muted-foreground">
            LIVE on-chain — the registry pays referred joins inside the buyer&apos;s own
            transaction (see the live source reads above).
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Kill-switch (future write{active ? " · toggled in preview" : ""})
          </span>
          <Switch checked={active} onCheckedChange={setActive} aria-label="Preview of the future program kill-switch" />
        </div>
      </div>

      {/* Fixed acquisition structure — DISPLAY ONLY (never editable, never saved) */}
      <div className="mb-6">
        <div className="text-sm font-medium text-foreground mb-3">
          Fixed structure{" "}
          <span className="text-xs text-muted-foreground font-normal">(not editable)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {referralSettingsSample.map((s) => (
            <div
              key={s.key}
              className="flex items-baseline justify-between rounded-md border border-border/40 px-3 py-2"
            >
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-sm font-mono text-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Editable terms — writable via the operator write zone (server-canonical keys/units) */}
      <div className="mb-6">
        <div className="text-sm font-medium text-foreground mb-3">Editable terms</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {referralEditableTerms.map((t) => (
            <div key={t.key}>
              <label className="text-xs text-muted-foreground mb-1 block">{t.label}</label>
              <Input
                value={values[t.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [t.key]: e.target.value }))}
                className="text-sm"
              />
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">{t.hint}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Commission tiers + hard cap */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-sm font-medium text-foreground">Commission tiers</div>
          <span className="text-xs text-muted-foreground">hard cap {commissionCapPct}%</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          {commissionTiers.map((t) => (
            <div key={t.name} className="rounded-md border border-border/50 p-3">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-sm font-medium text-foreground">{t.name}</span>
                <span className="text-lg font-medium text-foreground">{t.pct}%</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t.note}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          No class may exceed {commissionCapPct}%. {rateChangeEvent.note}
        </p>
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={() => void handleSave()} disabled={saveState.kind === "saving"}>
            <Save className="h-4 w-4 mr-1.5" />
            {saveState.kind === "saving" ? "Saving…" : "Save changes"}
          </Button>
          <span className="text-xs text-muted-foreground">
            Saves terms through the founder-gated operator write zone (audit-logged). The program stays paused until you activate it.
          </span>
        </div>
        {saveState.kind === "saved" ? (
          <div className="text-xs text-foreground">Terms saved and audit-logged.</div>
        ) : saveState.kind === "denied" ? (
          <div className="text-xs text-muted-foreground">
            Not authorized — sign in as an operator (founder or protocol admin) to save.
          </div>
        ) : saveState.kind === "unavailable" ? (
          <div className="text-xs text-muted-foreground">
            The operator write zone isn't enabled yet — nothing was saved.
          </div>
        ) : saveState.kind === "partial" ? (
          <div className="text-xs text-muted-foreground">
            Some terms weren't accepted (reason: {saveState.reason}).
          </div>
        ) : null}
      </div>
    </Card>
  );
}
