import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import authRouter from "./auth/router";
import { authExposureGate } from "./auth/authExposure";
import operatorRouter from "./operator/router";
import channelRouter from "./channel/router";
import { logger } from "./lib/logger";

const app: Express = express();

// ── HTTP security headers (audit fix, founder-approved 2026-07-13) ──────────
// This server serves JSON only (the studio pages are a separate static
// artifact — their headers live at the serving layer / prerendered meta). The
// strict-correct policy for an API: nothing may be loaded, nothing may frame.
app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  // AUD-ROUTE (2026-07-17): same-origin /api JSON was crawlable and could
  // surface as raw-JSON SERP entries competing with the real pages — the
  // header refuses indexing while leaving the endpoints fully crawlable
  // (deliberately NO robots.txt Disallow: a crawl block would stop this
  // header from ever being read for already-discovered URLs).
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
});

// Express "trust proxy" stays deliberately UNSET (IA-2.5, founder-approved):
// the platform's proxy hop count is undocumented and may change, so a fixed
// trust depth would make peer-derived addresses either collapsed or spoofable.
// The only per-client keying in this server (auth throttle) uses the explicit
// hop-count-agnostic extractor in src/auth/clientIdentity.ts instead. Cookie
// Secure flags do not depend on this setting (res.cookie only writes the
// attribute; nothing here reads req.secure/req.protocol).

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ── CORS (Slice 2.16A hardening) ────────────────────────────────────────────
// This API is read-only and GET-only. The smallest safe policy is:
//   • allow requests with no Origin (server-to-server, curl, health checks, and
//     same-origin browser fetches routed through the shared proxy);
//   • allow an explicit allowlist built from existing Replit env conventions
//     (REPLIT_DOMAINS, REPLIT_DEV_DOMAIN) plus an optional operator-configured
//     CORS_ALLOWED_ORIGINS (comma-separated full origins) for production domains;
//   • allow localhost dev origins (non-production only).
// No credentials/cookies are enabled. A disallowed cross-origin browser caller
// simply receives no CORS headers (the browser blocks it); same-origin and
// no-origin callers are unaffected.
function splitEnvList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function buildAllowedOrigins(): Set<string> {
  const origins = new Set<string>();
  for (const host of splitEnvList(process.env["REPLIT_DOMAINS"])) {
    origins.add(`https://${host}`);
  }
  const devDomain = process.env["REPLIT_DEV_DOMAIN"];
  if (devDomain) {
    origins.add(`https://${devDomain}`);
  }
  for (const origin of splitEnvList(process.env["CORS_ALLOWED_ORIGINS"])) {
    origins.add(origin);
  }
  return origins;
}

const allowedOrigins = buildAllowedOrigins();

function isLocalDevOrigin(origin: string): boolean {
  if (process.env["NODE_ENV"] === "production") {
    return false;
  }
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  methods: ["GET", "HEAD", "OPTIONS"],
};

app.use(cors(corsOptions));

// ── Auth zone (IA-2) ────────────────────────────────────────────────────────
// Dev-only SIWE challenge/session skeleton, architecturally separate from the
// read-only protocol spine. The auth router carries its own scoped JSON
// parser, cookie reader, origin check and throttle; nothing here changes the
// global middleware posture (no app-wide body parser, CORS stays
// credential-free). See src/auth/router.ts for the full contract.
// Pre-publish hardening: authExposureGate runs FIRST — in production the
// whole zone is dark by default (unknown-route 404) unless the founder sets
// SYNDICATE_AUTH_ENABLED="true"; see src/auth/authExposure.ts.
app.use("/api/auth", authExposureGate, authRouter);
// Operator WRITE zone — same exposure gate; unreachable in prod unless enabled.
app.use("/api/operator", authExposureGate, operatorRouter);
// ── Channel zone (SPEC R3, founder GO 2026-07-19) ───────────────────────────
// The THIRD sanctioned zone — the constitutionally-named channel log
// (CONSTITUTION_AUTORITE §③ N2). Two anonymous fail-closed 204 beacons
// (click + receipt-verified conversion), architecturally separate from the
// read-only spine AND from the auth/operator zones. Deliberately NOT behind
// authExposureGate: an anonymous click is not an auth act; without a
// DATABASE_URL every beacon drops silently (204, nothing recorded). The
// router carries its own scoped 1kb JSON parser, origin check and throttles;
// the global middleware posture is unchanged (no app-wide body parser, CORS
// stays credential-free GET-shaped — the beacons are same-origin).
app.use("/api/channel", channelRouter);

app.use("/api", router);

// JSON 404 for unknown /api/* routes (Slice 2.16A). This is scoped to /api, so it
// does not affect the studio SPA history fallback (served by a separate artifact),
// and the existing /api/healthz and /api/source-status routes are untouched.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not_found" });
});

export default app;
