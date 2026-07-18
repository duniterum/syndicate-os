// guard-notification-vocab.ts — NOTIF-2 vocabulary integrity, pinned.
// ---------------------------------------------------------------------------
// The notification icon palette + internal link whitelist live in ONE place
// (@workspace/os-contracts src/notifications.ts), imported by the API
// validator, the studio renderer/pickers, and read as TEXT by this guard
// (repo guard style — no runtime workspace import). This guard pins the
// doctrine no literal can satisfy:
//   ① the palette contains NO gain-promise / speculation glyph (mechanism
//      decides, not the symbol — function icons like vault/gift/trophy stay);
//   ② the studio NOTIF_ICONS map covers EVERY palette key (no empty slot on a
//      served icon — the Chronicle-empty-slot lesson);
//   ③ every whitelisted destination's BASE route (minus #hash) is a real
//      classified surface — no phantom / off-registry deep-link;
//   ④ server + studio + pickers all import the ONE os-contracts source.

import { readFileSync } from "node:fs";
import { join } from "node:path";

const HERE = import.meta.dirname;
const SRC = join(HERE, "..", "src");
const OS_NOTIFS = join(HERE, "..", "..", "..", "lib", "os-contracts", "src", "notifications.ts");
const read = (p: string) => readFileSync(p, "utf8");

let pins = 0;
let failures = 0;
function pin(cond: boolean, msg: string) {
  pins += 1;
  if (!cond) {
    failures += 1;
    console.error(`  ✗ ${msg}`);
  }
}

// Slice a `const NAME = [ … ] as const;` array body out of the source text.
function arrayBody(text: string, name: string): string {
  const start = text.indexOf(`${name} = [`);
  if (start < 0) return "";
  const end = text.indexOf("] as const", start);
  return end > start ? text.slice(start, end) : "";
}

const osText = read(OS_NOTIFS);
const palette = [...arrayBody(osText, "NOTIFICATION_ICON_PALETTE").matchAll(/"([a-z-]+)"/g)].map(
  (m) => m[1],
);
const forbidden = new Set(
  [...arrayBody(osText, "NOTIFICATION_FORBIDDEN_ICONS").matchAll(/"([a-z0-9-]+)"/g)].map((m) => m[1]),
);
const whitelist = [
  ...arrayBody(osText, "NOTIFICATION_LINK_WHITELIST").matchAll(/path:\s*"([^"]+)"/g),
].map((m) => m[1]);

pin(palette.length >= 20, `parsed the icon palette (${palette.length} keys)`);
pin(forbidden.size >= 20, `parsed the forbidden-icon set (${forbidden.size} keys)`);
pin(whitelist.length >= 10, `parsed the link whitelist (${whitelist.length} paths)`);

// ── ① palette ∩ forbidden = ∅ ───────────────────────────────────────────────
const leaked = palette.filter((k) => forbidden.has(k));
pin(
  leaked.length === 0,
  `the palette carries a gain-promise glyph: ${leaked.join(", ") || "none"} — bans cover rocket/moon/chart-up/diamond-pump/raining-money/dice, never function symbols (vault/gift/trophy/receipt)`,
);

// ── ② the studio NOTIF_ICONS map covers every palette key ────────────────────
const iconsText = read(join(SRC, "lib", "notificationIcons.tsx"));
const mapStart = iconsText.indexOf("NOTIF_ICONS");
const mapBody = mapStart >= 0 ? iconsText.slice(mapStart, iconsText.indexOf("};", mapStart)) : "";
for (const key of palette) {
  const quoted = new RegExp(`["']${key}["']\\s*:`);
  const bare = /^[a-z]+$/.test(key) ? new RegExp(`\\b${key}\\s*:`) : null;
  pin(
    quoted.test(mapBody) || (bare !== null && bare.test(mapBody)),
    `NOTIF_ICONS is missing a mapping for palette key "${key}" — a served notification would render an EMPTY icon slot`,
  );
}

// ── ③ every whitelist destination's base route is a classified surface ───────
const surfaceText = read(join(SRC, "config", "surfaceClassification.ts"));
const routePaths = new Set(
  [...surfaceText.matchAll(/routePath:\s*"([^"]+)"/g)].map((m) => m[1]),
);
for (const path of whitelist) {
  const base = path.split("#")[0];
  pin(
    routePaths.has(base),
    `whitelist destination "${path}" has no classified base route "${base}" in surfaceClassification — a phantom/off-registry deep-link`,
  );
  pin(
    base.startsWith("/") && !base.startsWith("//") && !base.includes("\\"),
    `whitelist destination "${path}" is not a clean internal path (single leading "/", never "//" or a backslash)`,
  );
}

// ── ④ single-source: server + studio + pickers import os-contracts ───────────
const OS = /@workspace\/os-contracts/;
const sources: ReadonlyArray<readonly [string, string]> = [
  ["API validator", join(SRC, "..", "..", "api-server", "src", "operator", "notificationService.ts")],
  ["studio icon map", join(SRC, "lib", "notificationIcons.tsx")],
  ["admin composer fields", join(SRC, "components", "referral", "NotificationComposerFields.tsx")],
];
for (const [label, abs] of sources) {
  pin(
    OS.test(read(abs)),
    `${label} must import the notification vocabulary from @workspace/os-contracts (single source)`,
  );
}

if (failures > 0) {
  console.error(`[guard:notif-vocab] ${failures} FAILURE(S) of ${pins} pins.`);
  process.exit(1);
}
console.log(`[guard:notif-vocab] PASS — ${pins}/${pins} pins green.`);
