// artifacts/studio/scripts/precompress-dist.mjs
// -----------------------------------------------------------------------------
// Post-build pre-compression: for every compressible file in dist/public over
// the threshold, emit a Brotli (quality 11) AND a gzip (level 9) sibling next to
// it. The ORIGINALS ARE NEVER TOUCHED — the siblings are additional files that
// serve.mjs selects by Accept-Encoding. This is why the shipped bundles stay
// byte-identical (precompress-verify.mjs proves each sibling decompresses back
// to its original, and the deploy's byte-identity check reads Accept-Encoding:
// identity to get the untouched original).
//
// Runs AFTER prerender-routes.ts so the 27 flat HTML shells get siblings too.
// Build-time (not per-request) → maximum Brotli quality, zero CPU per request,
// deterministic output. Node builtins only.

import { readdirSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { brotliCompressSync, gzipSync, constants } from "node:zlib";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "dist", "public");
const COMPRESSIBLE = new Set([
  ".js", ".mjs", ".css", ".html", ".svg", ".json", ".xml", ".txt", ".webmanifest",
]);
const THRESHOLD = 1024; // bytes — below this, compression overhead isn't worth it

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

let br = 0;
let gz = 0;
let skipped = 0;
for (const file of walk(ROOT)) {
  if (file.endsWith(".br") || file.endsWith(".gz")) continue; // never re-compress
  if (!COMPRESSIBLE.has(path.extname(file).toLowerCase())) continue;
  const buf = readFileSync(file);
  if (buf.length < THRESHOLD) {
    skipped++;
    continue;
  }
  writeFileSync(
    file + ".br",
    brotliCompressSync(buf, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: 11,
        [constants.BROTLI_PARAM_SIZE_HINT]: buf.length,
      },
    }),
  );
  writeFileSync(file + ".gz", gzipSync(buf, { level: 9 }));
  br++;
  gz++;
}

console.log(
  `[precompress] wrote ${br} .br + ${gz} .gz sibling(s) (skipped ${skipped} file(s) < ${THRESHOLD}B). Originals untouched.`,
);
