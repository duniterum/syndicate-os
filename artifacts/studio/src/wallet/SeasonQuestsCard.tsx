// SeasonQuestsCard — the member's OWN quest progress (S2d, founder
// GO-and-GO-LIVE 2026-07-24; the corrected member mockup's Quests card,
// truth-amended).
// ---------------------------------------------------------------------------
// FED QUESTS ONLY (the §0.3 feeder law): what renders is exactly what the
// engine credits today — the three first-act quests and the Connector-ladder
// rung you are ON (the canon rungs VERBATIM: Active 3 → Summit 300, the
// founder's own ladder words — never invented thresholds). No weekly-renewal
// claim renders: that engine is not built, and this card never promises it.
// AUTO-CREDIT VOICE (§0.15): XP falls on its own when the act is proven —
// nothing to claim from an operator, no buttons.
// Data: GET /api/auth/season-standing (own-row; the session cookie is the
// only input server-side; ids and numbers only — no address ever). The quest
// ids map to canon titles HERE (the registry ships no labels by design).
// Fail-closed: no session / dark model → the honest reason, never a guess.

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface OwnQuest {
  id: string;
  questClass: string;
  target: number;
  bonusXp: number;
  current: number;
  completed: boolean;
}

interface OwnSeasonPayload {
  state: "S1" | "S4";
  quests: OwnQuest[] | null;
  failureReason: string | null;
}

/** The canon words for each quest id (Connector rungs verbatim). */
const QUEST_TITLE: Record<string, { title: string; sub: string }> = {
  "first-introduction": { title: "First introduction", sub: "one converted introduction" },
  "first-burn": { title: "First burn", sub: "one proof-of-burn act" },
  "first-archive-mint": { title: "First archive mint", sub: "one archived artifact" },
  "connector-active": { title: "Connector · Active", sub: "3 converted introductions" },
  "connector-trusted": { title: "Connector · Trusted", sub: "10 converted introductions" },
  "connector-established": { title: "Connector · Established", sub: "25 converted introductions" },
  "connector-durable": { title: "Connector · Durable", sub: "60 converted introductions" },
  "connector-foundational": { title: "Connector · Foundational", sub: "150 converted introductions" },
  "connector-summit": { title: "Connector · Summit", sub: "300 converted introductions" },
};

type State =
  | { status: "loading" }
  | { status: "failed"; reason: string | null }
  | { status: "ready"; quests: OwnQuest[] };

export default function SeasonQuestsCard() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/auth/season-standing", { method: "GET" });
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as OwnSeasonPayload;
        if (cancelled) return;
        if (body.state !== "S4" || body.quests === null) {
          setState({ status: "failed", reason: body.failureReason });
          return;
        }
        setState({ status: "ready", quests: body.quests });
      } catch {
        if (!cancelled) setState({ status: "failed", reason: null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // WORK-FIRST tile pick: the three firsts + the ladder rung you are ON
  // (completed rungs collapse behind the next one — the ladder is a climb,
  // not a checklist).
  const tiles =
    state.status === "ready"
      ? [
          ...state.quests.filter((q) => q.questClass === "starter"),
          ...state.quests.filter((q) => q.questClass === "ladder" && !q.completed).slice(0, 1),
        ]
      : [];

  return (
    <Card className="bg-card/40 border-border/50 p-5" data-testid="member-quests-card">
      <h3 className="mb-3 text-base font-medium text-foreground">Your quests</h3>

      {state.status === "failed" && (
        <p className="text-xs leading-snug text-muted-foreground">
          {state.reason ??
            "Your quest view is unavailable right now — nothing is assumed; it returns with the next read."}
        </p>
      )}

      {state.status === "ready" && tiles.length > 0 && (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {tiles.map((q) => {
            const words = QUEST_TITLE[q.id] ?? { title: q.id, sub: `${q.target}` };
            const pct = Math.min(100, Math.round((q.current / q.target) * 100));
            return (
              <div
                key={q.id}
                className="rounded-[11px] border border-border/60 bg-muted/20 p-3"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold text-foreground">
                    {words.title}
                  </span>
                  <span className="font-mono text-[11px] text-primary">+{q.bonusXp} XP</span>
                </div>
                <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
                  {words.sub}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded border border-border/60 bg-background/60">
                  <div
                    className="h-full rounded bg-gradient-to-r from-gold/70 to-gold"
                    style={{ width: `${pct}%` }}
                    aria-hidden="true"
                  />
                </div>
                <div
                  className={`mt-1.5 font-mono text-[11px] ${
                    q.completed ? "text-success" : "text-muted-foreground"
                  }`}
                >
                  {q.completed ? "done" : `${q.current}/${q.target}`}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 border-t border-border/40 pt-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
        XP falls on its own when the act is proven on-chain — nothing to claim from an
        operator.
      </p>
    </Card>
  );
}
