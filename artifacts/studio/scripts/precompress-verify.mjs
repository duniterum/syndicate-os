// artifacts/studio/scripts/precompress-verify.mjs
// -----------------------------------------------------------------------------
// The byte-identity guard for the pre-compressed twins. For EVERY .br/.gz in
// dist/public it asserts: (1) the original file exists, and (2) decompressing the
// twin reproduces the original BYTE-FOR-BYTE. A single mismatch or orphan twin
// fails the build. This is the machine proof of "transport only, bundle never
// altered" — the founder's byte-identity requirement, guard-enforced.
//
// Runs in the build right after precompress-dist.mjs. Node builtins only.

import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { brotliDecompressSync, gunzipSync } from "node:zlib";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "dist", "public");

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

const errors = [];
let checked = 0;
for (const twin of walk(ROOT)) {
  const isBr = twin.endsWith(".br");
  const isGz = twin.endsWith(".gz");
  if (!isBr && !isGz) continue;
  const original = twin.slice(0, -3);
  if (!existsSync(original)) {
    errors.push(`orphan twin (no original): ${path.relative(ROOT, twin)}`);
    continue;
  }
  const originalBuf = readFileSync(original);
  let decoded;
  try {
    decoded = isBr
      ? brotliDecompressSync(readFileSync(twin))
      : gunzipSync(readFileSync(twin));
  } catch (err) {
    errors.push(`${path.relative(ROOT, twin)}: decompress threw — ${err && err.message}`);
    continue;
  }
  if (!decoded.equals(originalBuf)) {
    errors.push(
      `${path.relative(ROOT, twin)}: decompressed ${decoded.length}B != original ${originalBuf.length}B`,
    );
    continue;
  }
  checked++;
}

if (errors.length) {
  console.error(`[precompress:verify] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(
  `[precompress:verify] PASS — ${checked} twin(s) each decompress byte-identical to their original.`,
);
