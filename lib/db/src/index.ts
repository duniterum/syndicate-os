import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// AUD-TRUTH P1 #41 (2026-07-16): without an "error" listener, an idle-client
// error is an uncaught exception that kills the whole api-server process.
// The pool discards the broken connection and opens a fresh one on the next
// query — log and serve on; fail-closed lives at the query sites.
pool.on("error", (err) => {
  console.error(
    "[db] idle pool connection error (connection discarded, pool recovers):",
    err instanceof Error ? err.message : String(err),
  );
});

export const db = drizzle(pool, { schema });

export * from "./schema";
