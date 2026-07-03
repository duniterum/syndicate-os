// Build-time constants injected via `define` in vite.config.ts.

/** Operator preview flag: `process.env.VITE_OPERATOR_PREVIEW === "true"` at build time. */
declare const __OPERATOR_PREVIEW__: boolean;

/** Wallet session preview flag: `process.env.VITE_WALLET_SESSION_PREVIEW === "true"` at build time. */
declare const __WALLET_SESSION_PREVIEW__: boolean;
