// The two licence guardrails from the plan (docs/features/ui-components/0001 §2.1 in
// pcbjam-private): G1, this MIT package imports no app or GPL code; G2, everything it
// installs is under a licence compatible with both MIT and the GPLv3 editor.
import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
};
const declared = new Set([...Object.keys(pkg.dependencies), ...Object.keys(pkg.peerDependencies)]);

const ALLOWED_IMPORTS = [
  /^react$/,
  /^react-dom$/,
  /^react\/jsx-runtime$/,
  /^@radix-ui\/react-[a-z-]+$/,
  /^class-variance-authority$/,
  /^clsx$/,
  /^tailwind-merge$/,
  /^lucide-react$/,
  /^cmdk$/,
];
const ALLOWED_LICENSES = new Set(["MIT", "ISC", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "0BSD"]);

function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(join(dir, e.name)) : /\.(ts|tsx)$/.test(e.name) ? [join(dir, e.name)] : [],
  );
}

function importsOf(source: string): string[] {
  // Comments can name modules too (a JSDoc `import('tailwindcss')` type); only code counts.
  const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const re =
    /(?:import|export)\s[^'"]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|import\s+["']([^"']+)["']|require\s*\(\s*["']([^"']+)["']\s*\)/g;
  return [...code.matchAll(re)].map((m) => (m[1] ?? m[2] ?? m[3] ?? m[4]) as string);
}

const packageName = (spec: string) =>
  spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : (spec.split("/")[0] as string);

describe("G1: imports stay inside the allowlist", () => {
  const sources = files(src);

  it("finds the sources", () => {
    expect(sources.length).toBeGreaterThan(5);
  });

  it.each(sources.map((f) => [relative(root, f), f]))("%s", (_name, file) => {
    const bad: string[] = [];
    for (const spec of importsOf(readFileSync(file, "utf8"))) {
      if (spec.startsWith(".")) {
        const target = resolve(dirname(file), spec);
        if (!(target + sep).startsWith(src + sep)) bad.push(`${spec} (leaves src/)`);
      } else if (!ALLOWED_IMPORTS.some((re) => re.test(spec))) {
        bad.push(`${spec} (not on the allowlist)`);
      } else if (!declared.has(packageName(spec))) {
        bad.push(`${spec} (not in dependencies or peerDependencies)`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("tailwind-preset.js imports only tailwindcss-animate", () => {
    const specs = importsOf(readFileSync(join(root, "tailwind-preset.js"), "utf8"));
    expect(specs).toEqual(["tailwindcss-animate"]);
  });
});

// pnpm keeps each package's own dependencies next to it, so walking up from a package's
// real path finds what it would load.
function findPackageDir(fromDir: string, name: string): string | null {
  let dir = fromDir;
  for (;;) {
    const candidate = join(dir, "node_modules", name, "package.json");
    if (existsSync(candidate)) return realpathSync(dirname(candidate));
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

function licenseOf(pj: { license?: unknown; licenses?: unknown }): string {
  if (typeof pj.license === "string") return pj.license;
  if (pj.license && typeof pj.license === "object" && "type" in pj.license) return String(pj.license.type);
  if (Array.isArray(pj.licenses)) return pj.licenses.map((l: { type?: string }) => l.type).join(" OR ");
  return "UNKNOWN";
}

function licenseAllowed(expr: string): boolean {
  // "(MIT OR Apache-2.0)" passes if any branch passes; "A AND B" needs every part.
  return expr
    .replace(/[()]/g, "")
    .split(/\s+OR\s+/)
    .some((branch) => branch.split(/\s+AND\s+/).every((id) => ALLOWED_LICENSES.has(id.trim())));
}

describe("G2: every installed dependency has a compatible licence", () => {
  it("walks dependencies and peers, direct and transitive", () => {
    const seen = new Set<string>();
    const bad: string[] = [];
    const missing: string[] = [];
    const queue: Array<[string, string, boolean]> = [...declared].map((n) => [root, n, true]);
    while (queue.length) {
      const [from, name, direct] = queue.shift() as [string, string, boolean];
      const dir = findPackageDir(from, name);
      if (!dir) {
        if (direct) missing.push(name);
        continue;
      }
      if (seen.has(dir)) continue;
      seen.add(dir);
      const pj = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      const license = licenseOf(pj);
      if (!licenseAllowed(license)) bad.push(`${pj.name}@${pj.version}: ${license}`);
      for (const dep of Object.keys(pj.dependencies ?? {})) queue.push([dir, dep, false]);
    }
    expect(missing, "direct dependencies not installed; run pnpm install").toEqual([]);
    expect(seen.size).toBeGreaterThan(10);
    expect(bad).toEqual([]);
  });
});
