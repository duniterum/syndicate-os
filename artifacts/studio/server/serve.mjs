// artifacts/studio/server/serve.mjs
// -----------------------------------------------------------------------------
// The studio's production static server — a small, dependency-free Node process
// that serves dist/public with Brotli/gzip (pre-compressed twins, transport
// only) and correct cache headers. It replaces the platform's raw static-serving
// layer (which compresses nothing and sets cache-control: private), WITHOUT
// changing a single byte of any bundle: the twins are extra files chosen by
// Accept-Encoding; the original is served intact otherwise.
//
// WHY THIS EXISTS: on this Replit deployment the studio was handed to a static
// layer that has no compression and no cache-control mechanism (measured in
// prod, 2026-07-17). This is the SAME model the api-server already runs in the
// same deployment — a Node process behind the platform router (which routes
// /api to the api-server first; this process only ever sees non-/api paths).
//
// INVARIANTS (guarded elsewhere, do not weaken here):
//   - Transport only. dist/public bundles are never rewritten; twins are extra
//     files, and each decompressed twin == its original byte-for-byte
//     (precompress-verify.mjs, wired into the build).
//   - Routing is reproduced from the SAME source as the retired artifact.toml
//     rewrites: server/routeTable.generated.json is emitted by seo:rewrites from
//     seo-route-registry, and seo:rewrites:check blocks drift at the gate.
//   - Clean-URL → flat <route>.html; home → index.html; PARAM rules (the
//     /receipt/{txHash} class) → the route's ONE shell for shape-valid tails
//     only; unmatched → real 404.html (HTTP 404). NO SPA fallback (an unknown
//     path must 404, never soft-200).
//   - The client JS / wallet / chain reads are untouched — HTTP compression is
//     invisible to app code (same URLs, same bytes after the browser decodes).

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "dist", "public");
const PORT = Number.parseInt(process.env.PORT ?? "18425", 10);

// The clean-URL → flat-file table (generated from seo-route-registry). Read once
// at startup; a missing/broken table is fatal (fail closed — never serve wrong).
const ROUTE_TABLE = JSON.parse(
  readFileSync(path.join(HERE, "routeTable.generated.json"), "utf8"),
);

// Registry-derived PARAM rules (the /receipt/{txHash} class, 2026-07-20):
// each rule serves ONE shell exclusively for shape-valid tails under its
// prefix — any other tail stays a real 404, so the no-SPA-fallback invariant
// holds at its tightest (the one soft state left is a well-formed hash with
// no purchase, which the page renders as an honest "no receipt" under
// noindex). Read once at startup; missing/broken file is fatal like the table.
const PARAM_ROUTES = JSON.parse(
  readFileSync(path.join(HERE, "paramRoutes.generated.json"), "utf8"),
).map((rule) => ({ ...rule, re: new RegExp(rule.tailPattern) }));

// Mirrors the SEO registry's CANONICAL_ORIGIN (serve.mjs stays dependency-
// free; the registry is the source of truth — a change there changes here).
const CANONICAL_ORIGIN = "https://thesyndicate.money";
// The painted-card face variants the share rotation hands out (the
// painted-cards slice, 2026-07-20). Kept in sync with the api painter's
// FACE_COUNT; an out-of-range or absent ?f simply means the default face.
const FACE_RE = /^[1-4]$/;
// K2 (the invitee's side, 2026-07-20): a shared /join?source= link unfurls
// with ITS introducer's painted card. Shape gate mirrors the api route; an
// invalid or absent source simply serves the untouched shell.
const SOURCE_RE = /^0x[0-9a-fA-F]{64}$/;

// Per-URL head for the PARAM class (the painted-cards slice): the ONE baked
// shell gains THIS url's own head at serve time — a self-referential og:url
// (each shared variant is its own graph object, per the engraved rotation
// footnotes) and the receipt's own painted picture as og/twitter image.
// Pure string substitution, no DB, no deps; served identity-encoded (the
// precompressed twins hold the UNSUBSTITUTED bytes and are never used here).
// The api paints the picture — an unknown hash's card 302s to the generic
// site image there, so this substitution never needs to know the record.
function sendParamShell(req, res, absPath, rule, tail, face) {
  let html = readFileSync(absPath, "utf8");
  const suffix = face !== null ? `?f=${face}` : "";
  const pageUrl = `${CANONICAL_ORIGIN}${rule.prefix}${tail}${suffix}`;
  const cardUrl = `${CANONICAL_ORIGIN}/api/receipt-card/${tail}.png${suffix}`;
  const ogUrlTag = `<meta property="og:url" content="${pageUrl}" />`;
  html = /<meta property="og:url"[^>]*>/.test(html)
    ? html.replace(/<meta property="og:url"[^>]*>/, ogUrlTag)
    : html.replace("</head>", `    ${ogUrlTag}\n  </head>`);
  html = html.replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    `$1${cardUrl}$2`,
  );
  html = html.replace(
    /(<meta name="twitter:image" content=")[^"]*(")/,
    `$1${cardUrl}$2`,
  );
  const body = Buffer.from(html);
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
    "Vary": "Accept-Encoding",
    "X-Content-Type-Options": "nosniff",
    "Content-Length": String(body.length),
  };
  res.writeHead(200, headers);
  res.end(req.method === "HEAD" ? undefined : body);
}

// Fail LOUD, never silent: a dropped/empty build must not deploy as a "healthy"
// all-404 site. The route table already crashes at import if missing; assert the
// content root + its home shell the same way.
if (!existsSync(ROOT) || !existsSync(path.join(ROOT, "index.html"))) {
  throw new Error(
    `[serve] fatal: content root or index.html missing under ${ROOT} — refusing to start.`,
  );
}

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json",
};

function mimeFor(absPath) {
  return MIME[path.extname(absPath).toLowerCase()] ?? "application/octet-stream";
}

// Cache posture by class: hashed assets are immutable for a year; HTML must
// revalidate every visit (so a new publish propagates instantly); other static
// files (favicons, robots, sitemap, brand/hero images) get a modest hour.
function cacheControlFor(servedRel) {
  if (servedRel.startsWith("/assets/")) return "public, max-age=31536000, immutable";
  if (servedRel.endsWith(".html")) return "no-cache";
  return "public, max-age=3600";
}

// Resolve a URL path to an absolute FILE inside ROOT, or null if it does not
// exist or escapes ROOT (path-traversal safety — the one non-negotiable).
function resolveFile(urlPath) {
  if (urlPath.includes("\0")) return null;
  const abs = path.join(ROOT, path.normalize(urlPath));
  const rel = path.relative(ROOT, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null; // escaped ROOT
  try {
    if (statSync(abs).isFile()) return abs;
  } catch {
    /* ENOENT */
  }
  return null;
}

// Accept-Encoding token present with q > 0 — honors an explicit "enc;q=0" refusal
// and the "*" wildcard (RFC 9110: all codings acceptable).
function acceptsEncoding(header, enc) {
  return String(header)
    .toLowerCase()
    .split(",")
    .map((s) => s.trim())
    .some((tok) => {
      const name = tok.split(";")[0].trim();
      if (name !== enc && name !== "*") return false;
      const m = tok.match(/;\s*q=([0-9.]+)/);
      return !m || Number.parseFloat(m[1]) > 0;
    });
}

// If-None-Match membership: comma list, "*" wildcard, weak comparison (RFC 9110).
function etagMatches(inm, etag) {
  if (!inm) return false;
  const norm = (t) => t.trim().replace(/^W\//, "");
  const target = norm(etag);
  return inm.split(",").some((t) => {
    const v = t.trim();
    return v === "*" || norm(v) === target;
  });
}

function sendFile(req, res, absPath, servedRel, status) {
  const st = statSync(absPath);
  // Weak validator from size+mtime (nginx-style) — represents the RESOURCE (same
  // across encodings; Vary keys the encoding). Emitted for EVERY file so the
  // hourly-cache class (favicons/robots/sitemap/images) can revalidate too.
  const etag = `W/"${st.size.toString(16)}-${Math.round(st.mtimeMs).toString(16)}"`;

  const headers = {
    "Content-Type": mimeFor(absPath),
    "Cache-Control": cacheControlFor(servedRel),
    "Vary": "Accept-Encoding",
    "X-Content-Type-Options": "nosniff",
    "ETag": etag,
  };

  // Conditional GET → 304 (only ever replaces a 200, never a 404 body).
  if (status === 200 && etagMatches(req.headers["if-none-match"], etag)) {
    res.writeHead(304, headers);
    res.end();
    return;
  }

  // Pick a pre-compressed twin by Accept-Encoding; else the original, intact.
  let bodyPath = absPath;
  const accept = req.headers["accept-encoding"];
  if (acceptsEncoding(accept, "br") && existsSync(absPath + ".br")) {
    bodyPath = absPath + ".br";
    headers["Content-Encoding"] = "br";
  } else if (acceptsEncoding(accept, "gzip") && existsSync(absPath + ".gz")) {
    bodyPath = absPath + ".gz";
    headers["Content-Encoding"] = "gzip";
  }

  if (req.method === "HEAD") {
    headers["Content-Length"] = String(statSync(bodyPath).size);
    res.writeHead(status, headers);
    res.end();
    return;
  }

  // Read the body BEFORE writing headers: during an atomic redeploy that swaps
  // dist/public, a vanished file surfaces as a clean error (outer catch → 500,
  // no headers sent) instead of a truncated 200 under an already-promised length.
  const body = readFileSync(bodyPath);
  headers["Content-Length"] = String(body.length);
  res.writeHead(status, headers);
  res.end(body);
}

function send404(req, res) {
  const p = path.join(ROOT, "404.html");
  if (existsSync(p)) {
    sendFile(req, res, p, "/404.html", 404);
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(req.method === "HEAD" ? undefined : "Not Found");
}

function handle(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end();
    return;
  }

  let pathname;
  let faceParam = null;
  let sourceParam = null;
  try {
    const u = new URL(req.url, "http://localhost");
    pathname = decodeURIComponent(u.pathname);
    const f = u.searchParams.get("f");
    if (f !== null && FACE_RE.test(f)) faceParam = f;
    const src = u.searchParams.get("source");
    if (src !== null && SOURCE_RE.test(src)) sourceParam = src;
  } catch {
    send404(req, res);
    return;
  }

  // The .br/.gz twins are negotiated internally by Accept-Encoding, never
  // addressable directly — a direct hit would serve raw compressed bytes as
  // octet-stream and pin that garbage in caches for a year.
  if (pathname.endsWith(".br") || pathname.endsWith(".gz")) {
    send404(req, res);
    return;
  }

  // 1) An existing file (assets, the .html shells directly, favicons, robots,
  //    sitemap, brand/hero images, …). Home ("/") is a directory → falls through.
  let filePath = resolveFile(pathname);
  let servedRel = pathname;

  // 2) Home → index.html.
  if (!filePath && pathname === "/") {
    const home = path.join(ROOT, "index.html");
    if (existsSync(home)) {
      filePath = home;
      servedRel = "/index.html";
    }
  }

  // 3) Clean-URL rewrite → flat <route>.html (both "/x" and "/x/" are in the table).
  if (!filePath) {
    const target = ROUTE_TABLE[pathname];
    if (target) {
      const t = resolveFile(target);
      if (t) {
        filePath = t;
        servedRel = target;
      }
    }
  }

  // 3b) PARAM-rule class (registry-derived; the /receipt/{txHash} slice):
  //     a shape-valid tail under a declared prefix serves that route's ONE
  //     shell at 200 (a single trailing slash tolerated, matching the
  //     literal class) — WITH this url's own head substituted in (the
  //     painted-cards slice); anything else under the prefix falls to the
  //     real 404.
  if (!filePath) {
    for (const rule of PARAM_ROUTES) {
      if (!pathname.startsWith(rule.prefix)) continue;
      const tail = pathname.slice(rule.prefix.length).replace(/\/$/, "");
      if (rule.re.test(tail)) {
        const t = resolveFile(rule.shell);
        if (t) {
          sendParamShell(req, res, t, rule, tail, faceParam);
          return;
        }
      }
      break; // one rule owns its prefix; a non-matching tail 404s
    }
  }

  // 3c) K2 — the invitee's unfurl: /join carrying a shape-valid ?source=
  //     serves its shell with THIS link's own head (self-referential og:url
  //     + the introducer's painted card). Same pure-string discipline as the
  //     param class; the api 302s unknown sources to the generic image, so
  //     this substitution never needs to know the registry. rel=canonical
  //     stays /join untouched (the SEO identity; og:url is the share-graph
  //     identity — the receipt-card footnote applied).
  if (filePath && sourceParam !== null && (pathname === "/join" || pathname === "/join/")) {
    sendJoinShell(req, res, filePath, sourceParam);
    return;
  }

  // 4) Nothing matched → the real 404.
  if (!filePath) {
    send404(req, res);
    return;
  }

  sendFile(req, res, filePath, servedRel, 200);
}

// K2 — the /join?source= head substitution (the sendParamShell grammar).
function sendJoinShell(req, res, absPath, sourceId) {
  let html = readFileSync(absPath, "utf8");
  const pageUrl = `${CANONICAL_ORIGIN}/join?source=${sourceId}`;
  const cardUrl = `${CANONICAL_ORIGIN}/api/join-card/${sourceId}.png`;
  const ogUrlTag = `<meta property="og:url" content="${pageUrl}" />`;
  html = /<meta property="og:url"[^>]*>/.test(html)
    ? html.replace(/<meta property="og:url"[^>]*>/, ogUrlTag)
    : html.replace("</head>", `    ${ogUrlTag}\n  </head>`);
  html = html.replace(
    /(<meta property="og:image" content=")[^"]*(")/,
    `$1${cardUrl}$2`,
  );
  html = html.replace(
    /(<meta name="twitter:image" content=")[^"]*(")/,
    `$1${cardUrl}$2`,
  );
  const body = Buffer.from(html);
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache",
    "Vary": "Accept-Encoding",
    "X-Content-Type-Options": "nosniff",
    "Content-Length": String(body.length),
  });
  res.end(req.method === "HEAD" ? undefined : body);
}

createServer((req, res) => {
  try {
    handle(req, res);
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    }
    res.end(req.method === "HEAD" ? undefined : "Internal Server Error");
    console.error("[serve] 500", req.method, req.url, err && err.message);
  }
}).listen(PORT, () => {
  console.log(`[serve] studio static server on :${PORT} (root ${ROOT}, ${Object.keys(ROUTE_TABLE).length} routes)`);
});
