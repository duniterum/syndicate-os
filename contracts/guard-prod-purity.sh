#!/usr/bin/env bash
# guard-prod-purity — BLOCKING (the founder's ruling, 2026-07-24: test code must be
# IMPOSSIBLE to confuse with production code — other AIs have shipped test artifacts into
# live contracts; that class dies here, structurally).
#
# Law: contracts/src/ is the ONLY deployable surface and must be PURE —
#   ① it may import ONLY @openzeppelin/contracts (the audited bricks);
#   ② zero references to mocks, tests, forge-std, cheatcodes, or vm.*;
#   ③ every file under test/ must carry the TEST-ONLY banner so no reader — human,
#     verifier, or a future AI — can mistake bench code for the product.
# Run: bash guard-prod-purity.sh   (from contracts/; part of the §9 GREEN gate)
set -u
cd "$(dirname "$0")"
fail=0

# ① src/ imports: only @openzeppelin/contracts.
bad_imports=$(grep -rhn "^import" src/ | grep -v "@openzeppelin/contracts/" || true)
if [ -n "$bad_imports" ]; then
  echo "[guard:prod-purity] RED — src/ imports outside @openzeppelin/contracts:"
  echo "$bad_imports"
  fail=1
fi

# ② src/ purity: no test vocabulary of any kind.
impure=$(grep -rniE "mock|forge-std|cheatcode|\bvm\.|\.t\.sol|/test/" src/ || true)
if [ -n "$impure" ]; then
  echo "[guard:prod-purity] RED — test vocabulary found inside src/:"
  echo "$impure"
  fail=1
fi

# ③ every test file carries the TEST-ONLY banner.
missing_banner=""
while IFS= read -r f; do
  if ! head -5 "$f" | grep -q "TEST-ONLY"; then
    missing_banner="$missing_banner $f"
  fi
done < <(find test -name "*.sol" -type f)
if [ -n "$missing_banner" ]; then
  echo "[guard:prod-purity] RED — test file(s) missing the TEST-ONLY banner:$missing_banner"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  n_src=$(find src -name "*.sol" | wc -l | tr -d ' ')
  n_test=$(find test -name "*.sol" | wc -l | tr -d ' ')
  echo "[guard:prod-purity] PASS — $n_src production file(s) pure (OZ-only imports, zero test vocabulary); $n_test bench file(s) all bannered TEST-ONLY."
fi
exit $fail
