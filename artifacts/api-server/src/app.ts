import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import authRouter from "./auth/router";
import { logger } from "./lib/logger";

const app: Express = express();

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
app.use("/api/auth", authRouter);

app.use("/api", router);

// JSON 404 for unknown /api/* routes (Slice 2.16A). This is scoped to /api, so it
// does not affect the studio SPA history fallback (served by a separate artifact),
// and the existing /api/healthz and /api/source-status routes are untouched.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "not_found" });
});

export default app;
