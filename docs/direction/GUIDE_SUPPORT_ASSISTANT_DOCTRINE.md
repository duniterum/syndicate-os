# THE GUIDE — SUPPORT ASSISTANT DOCTRINE
*DIRECTION doc. The founder is the authority; only legal + security + truth-first bind.
This is the Support slice (build order: whitepaper → tokenomics → FAQ → **Support** → docs → knowledge).
Researched 2026-07-11.*

---

## What it is / what it is NOT

- **The Guide** is a *help / consultation assistant* — it helps a visitor navigate the
  protocol and find answers. Tone exception granted: it MAY be warm/lively (it is a helper,
  not a truth surface).
- It is **NOT the protocol's AI Layer** (Analyst / Governance / Risk — that stays PENDING).
  Never present it as "the protocol's AI." Name it **"Guide."**
- It has **zero tools, zero actions, zero private data, zero wallet.** It cannot transact,
  write, or read anything private. This is deliberate and is the single most important
  security property (see Blast radius).

## Architecture — HYBRID, DETERMINISTIC-FIRST (locked)

Default path = **deterministic**, LLM = **capped optional escalation.**

1. **Deterministic layer (default, ~80–90% of support):** intent-match / fuzzy-search over
   the FAQ answers + docs; surface **live figures from `/api/protocol/reality`**; suggested
   questions. Zero cost, zero LLM, zero fabrication risk.
2. **LLM escalation (only for free-form questions the deterministic layer can't match):**
   RAG-grounded — the model answers ONLY from injected FAQ context + injected live figures.
   Capped and kill-switched (see Defense stack). Falls back to the deterministic layer when
   the budget/rate-limit is hit.

## Model choice

- Provider pattern is **OpenAI-compatible** (`baseURL` + `apiKey` + `model`) → any provider
  swaps in with a one-line change.
- **Primary: Groq free tier** (Llama 3.3 70B) — genuinely free, no card, very fast.
- **Fallback: DeepSeek V4 Flash** (~cents/month at our scale) when Groq rate-limits.
- **WebLLM (in-browser, zero-API) deferred:** philosophically on-doctrine (sovereign, "we
  ask nothing"), but today it means a 0.5–2 GB first-load and a ~1–3B model that hallucinates
  more — wrong fit for an accuracy-critical, light-first-paint widget. Revisit when Chrome's
  built-in Prompt API / larger browser models mature.

## Truth-first guardrails (the doctrine firewall)

- **NEVER fabricate a figure.** The Guide states only figures present in the injected live
  context; for anything else it points to the on-chain proof / FAQ.
- **Output filter:** the Guide's *response* passes through the existing forbidden-copy guard
  (invest / raised / yield / APY / dividend / moon / 100x / package / governance-weight …).
  If the model emits a banned term, block/replace before display.
- Reuse Supa's guardrail-prompt pattern (never give financial advice, never promise returns,
  DYOR) reframed to our vocabulary. A strong system prompt is the **floor, not the strategy.**

## Security — threat model + defense stack

Three real threats for a public bot:
1. **Prompt injection / jailbreak** (OWASP LLM01) — reputational + legal (securities-framing).
2. **Denial of Wallet** (OWASP LLM10) — burn credits / exhaust rate-limit. Request-count
   limits don't see cost (one request = 50 or 128K tokens).
3. **"Free ChatGPT" / spam** — off-topic use (~10× token cost/session) or automated floods.

**Blast radius (why this is manageable):** with no tools/actions/wallet, even a *total*
jailbreak yields only embarrassing text — never a transaction, never a data leak. The output
filter catches the embarrassing text before display.

**Defense in depth:**
- **Architecture:** API key **server-side only**, never in the client. Guide endpoint
  **ISOLATED** from the `/api/protocol/reality` spine (never entangle the sensitive read path).
  RAG grounding shrinks the injection surface to near-nothing.
- **Input:** length cap (block context-flooding); topic pre-filter — off-topic → refuse
  BEFORE calling the LLM (kills "free ChatGPT," saves tokens).
- **Rate / cost:** per-IP + per-session limits, **token-based not request-based**, short
  `max_tokens`, and a **global daily budget cap with a circuit-breaker** that degrades the
  Guide to the deterministic FAQ search when hit. Ultimate DoW ceiling.
- **Output:** forbidden-copy guard on the response; never a figure outside injected context.
- **Monitoring:** log input/output/tokens/cost per session; alert on token-spend / per-IP
  anomalies.
- **Anti-spam:** session token required (no raw curl); escalate to a lightweight challenge
  only on abuse signals (avoid full CAPTCHA for UX); honeypot field.

## Harvest sources (adapt, never copy raw — repo always wins)

- **Frontend robot:** `Supa-Exchange/client/src/components/FloatingAISupport.tsx` — floating
  SVG robot (blinking cyan eyes, contextual greeting after delay, chat panel w/ suggested
  questions, minimizable). The pattern to adapt to our tokens/atoms/vocab.
- **Server pattern:** `Supa-Exchange/server/ai/handlers/assistantQnaHandler.ts` +
  `server/ai/providers/openai.ts` — provider abstraction + guardrail system prompt + fallback
  on API error. Swap Supa's Replit-billed gpt-4o-mini for Groq/DeepSeek; add our RAG grounding
  + output filter + cost-aware rate limiting.
- **entity-chain = a simulator** (no real LLM). Ignore as a model.

## Where it sits

Support is the slice AFTER FAQ (2.3). FAQ ships first; the Guide reuses the FAQ content as its
grounding corpus, so FAQ is a natural prerequisite.
