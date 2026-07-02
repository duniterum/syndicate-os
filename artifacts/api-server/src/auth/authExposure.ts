// Auth exposure gate (pre-publish hardening, founder-approved).
//
// The SIWE skeleton under /api/auth is a dev surface: it is NOT part of the
// published read-only protocol posture. This gate keeps the entire auth zone
// dark by default in production:
//   • non-production (dev workspace): auth zone exposed, behavior unchanged;
//   • production: exposed ONLY when SYNDICATE_AUTH_ENABLED === "true" is set
//     explicitly by the founder — exact string match, so unset, "1", "TRUE",
//     or "yes" all keep it dark (default-deny opt-in).
//
// Disabled behavior is indistinguishable from a route that does not exist:
// the gate answers with the SAME JSON 404 shape the app uses for unknown
// /api/* routes and runs BEFORE the auth router's scoped middleware, so a
// dark zone performs no body parsing, no cookie reads, no throttle-map
// writes, no nonce issuance, and no auth-specific logging. The flag is read
// per-request (never captured at boot) so posture follows the process
// environment deterministically and stays testable.
// Guarded by scripts/guard-auth-zone.ts (section 8).

import type { NextFunction, Request, Response } from "express";

/** Explicit production opt-in flag name. Server-side only. */
export const AUTH_EXPOSURE_FLAG = "SYNDICATE_AUTH_ENABLED";

/** True when the auth zone may answer at all (dev always; prod only on exact opt-in). */
export function authZoneExposed(): boolean {
  if (process.env["NODE_ENV"] !== "production") {
    return true;
  }
  return process.env[AUTH_EXPOSURE_FLAG] === "true";
}

/** Mounted BEFORE the auth router: a dark zone answers as an unknown route. */
export function authExposureGate(
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (authZoneExposed()) {
    next();
    return;
  }
  res.status(404).json({ error: "not_found" });
}
