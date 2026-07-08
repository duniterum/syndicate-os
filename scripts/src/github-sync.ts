import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], {
  encoding: "utf8",
}).trim();

const OWNER = "duniterum";
const REPO = "syndicate-os";
const BRANCH = "main";
const API = "https://api.github.com";

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error("GITHUB_TOKEN is not set. Aborting.");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const messageArgIndex = process.argv.indexOf("--message");
const commitMessage =
  messageArgIndex !== -1 && process.argv[messageArgIndex + 1]
    ? process.argv[messageArgIndex + 1]
    : `Sync workspace to GitHub (${new Date().toISOString()})`;

const EXCLUDED_PATH_PATTERNS: RegExp[] = [
  /(^|\/)\.env(\..*)?$/i,
  /(^|\/)\.local(\/|$)/,
  /(^|\/)\.agents\/memory(\/|$)/,
];

const SECRET_CONTENT_PATTERNS: { name: string; re: RegExp }[] = [
  { name: "GitHub token", re: /gh[pousr]_[A-Za-z0-9]{20,}/ },
  { name: "QuikNode endpoint", re: /quiknode\.pro\/[A-Za-z0-9]{16,}/i },
  { name: "AWS access key", re: /AKIA[0-9A-Z]{16}/ },
  { name: "Private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "OpenAI-style key", re: /sk-[A-Za-z0-9]{20,}/ },
  {
    name: "Hardcoded secret assignment",
    re: /(api[_-]?key|secret|password|token)\s*[:=]\s*['"][A-Za-z0-9_\-]{24,}['"]/i,
  },
];

interface GitFile {
  mode: string;
  path: string;
}

function listTrackedFiles(): GitFile[] {
  const out = execFileSync("git", ["ls-files", "-s"], { encoding: "utf8", cwd: ROOT });
  const tracked = out
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [meta, path] = line.split("\t");
      const [mode] = meta.split(" ");
      return { mode, path };
    })
    // Tracked-but-locally-deleted files must not abort the sync: the pushed
    // tree is built fresh from disk, so skipping them here is exactly what
    // propagates the deletion to the remote branch.
    .filter((f) => {
      try {
        statSync(join(ROOT, f.path));
        return true;
      } catch {
        console.log(`Excluding locally deleted tracked file (will be removed remotely): - ${f.path}`);
        return false;
      }
    });
  // Also include untracked-but-not-ignored files (respects .gitignore), so a
  // sync never silently drops brand-new source files that have not been
  // committed locally yet. Mode is derived from the on-disk executable bit.
  const untrackedOut = execFileSync(
    "git",
    ["ls-files", "--others", "--exclude-standard"],
    { encoding: "utf8", cwd: ROOT },
  );
  const untracked = untrackedOut
    .split("\n")
    .filter(Boolean)
    .map((path) => {
      let mode = "100644";
      try {
        const st = statSync(join(ROOT, path));
        if (st.mode & 0o111) mode = "100755";
      } catch {
        // unreadable → keep default non-executable mode
      }
      return { mode, path };
    });
  if (untracked.length > 0) {
    console.log(`Including ${untracked.length} untracked (not ignored) file(s):`);
    for (const f of untracked) console.log(`  + ${f.path}`);
  }
  return [...tracked, ...untracked];
}

async function gh(path: string, init: RequestInit = {}): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub API ${init.method ?? "GET"} ${path} failed: ${res.status} ${body.slice(0, 500)}`);
  }
  return res.json();
}

function isProbablyText(buf: Buffer): boolean {
  const sample = buf.subarray(0, 8000);
  return !sample.includes(0);
}

async function main() {
  const allFiles = listTrackedFiles();
  const files = allFiles.filter(
    (f) => !EXCLUDED_PATH_PATTERNS.some((re) => re.test(f.path)),
  );
  const excluded = allFiles.length - files.length;
  console.log(`Tracked files: ${allFiles.length} (excluding ${excluded} by path rules → syncing ${files.length})`);

  // Secret guard: abort the entire sync if any file content looks like a secret.
  const violations: string[] = [];
  const contents = new Map<string, Buffer>();
  for (const f of files) {
    const buf = readFileSync(join(ROOT, f.path));
    contents.set(f.path, buf);
    if (isProbablyText(buf)) {
      const text = buf.toString("utf8");
      for (const { name, re } of SECRET_CONTENT_PATTERNS) {
        if (re.test(text)) violations.push(`${f.path}: ${name}`);
      }
    }
  }
  if (violations.length > 0) {
    console.error("Secret guard triggered — sync ABORTED. Offending files:");
    for (const v of violations) console.error(`  - ${v}`);
    process.exit(1);
  }
  console.log("Secret guard passed.");

  // Auth-flag guard: the dev-only activation flag must NEVER reach committed
  // config on GitHub. Replit writes development-scoped env vars into the
  // git-tracked `.replit` [env] section, so a sync while the flag is live
  // would silently publish an auth-enabled config. Fail closed: abort the
  // whole sync if any CONFIG file (.replit, any *.toml) carries the flag
  // assignment. Docs/tests/comments may mention the flag name — only config
  // files can activate it, so only config files are scanned.
  const authFlagRe = /SYNDICATE_AUTH_ENABLED\s*[=:]\s*["']?true["']?/;
  const isConfigFile = (path: string): boolean =>
    path === ".replit" || /\.toml$/i.test(path);
  const flagViolations: string[] = [];
  for (const [path, buf] of contents) {
    if (!isConfigFile(path)) continue;
    if (isProbablyText(buf) && authFlagRe.test(buf.toString("utf8"))) {
      flagViolations.push(path);
    }
  }
  if (flagViolations.length > 0) {
    console.error(
      "Auth-flag guard triggered — sync ABORTED. SYNDICATE_AUTH_ENABLED=true found in:",
    );
    for (const v of flagViolations) console.error(`  - ${v}`);
    console.error(
      "Remove the dev activation (delete the development env var) before syncing.",
    );
    process.exit(1);
  }
  console.log("Auth-flag guard passed.");

  if (dryRun) {
    console.log(`Dry run: would sync ${files.length} files to ${OWNER}/${REPO}@${BRANCH} with message: "${commitMessage}"`);
    return;
  }

  const ref = await gh(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const parentSha: string = ref.object.sha;
  console.log(`Remote head ${BRANCH}: ${parentSha}`);

  const tree: { path: string; mode: string; type: "blob"; sha: string }[] = [];
  let done = 0;
  const CONCURRENCY = 20;
  let cursor = 0;
  async function worker() {
    while (cursor < files.length) {
      const f = files[cursor++];
      const buf = contents.get(f.path)!;
      const blob = await gh(`/repos/${OWNER}/${REPO}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content: buf.toString("base64"), encoding: "base64" }),
      });
      tree.push({
        path: f.path,
        mode: f.mode === "100755" ? "100755" : f.mode === "120000" ? "120000" : "100644",
        type: "blob",
        sha: blob.sha,
      });
      done++;
      if (done % 100 === 0) console.log(`Uploaded ${done}/${files.length} blobs...`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  console.log(`Uploaded ${done}/${files.length} blobs.`);

  const newTree = await gh(`/repos/${OWNER}/${REPO}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ tree }),
  });

  const commit = await gh(`/repos/${OWNER}/${REPO}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message: commitMessage, tree: newTree.sha, parents: [parentSha] }),
  });

  await gh(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  console.log(`Synced ${files.length} files → ${OWNER}/${REPO}@${BRANCH} (commit ${commit.sha})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
