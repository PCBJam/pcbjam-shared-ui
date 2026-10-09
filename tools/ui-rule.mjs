#!/usr/bin/env node
// The UI rule (ui-components 0001, D7 and §3.3): only @pcbjam/ui styles a raw <button>,
// <select>, <input> or <textarea>. An app uses the package's Button, Toggle, Select, Input,
// Textarea, Checkbox… instead; a raw control with a className (or a spread, which can carry
// one) is an offender.
//
// The apps still hold offenders from before the rule, so each keeps a baseline of how many
// every file has, and the count may only go down: CI fails when a file gains one, and when a
// file loses one without the baseline being lowered (`--update`), so the gain stays visible.
//
//   node ui-rule.mjs <src dir> <baseline.json> [--update]

import { createRequire } from "node:module";
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

export const RAW_TAGS = new Set(["button", "select", "input", "textarea"]);
// Inputs with no shared component: a file picker (always hidden behind a Button), a native
// colour well, a hidden form field.
export const EXEMPT_INPUT_TYPES = new Set(["file", "color", "hidden"]);

/** The raw styled controls in one source file, with their 1-based lines. */
export function findOffenders(source, fileName) {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const out = [];
  const attr = (props, name) => props.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === name);
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName.getText(sf);
      const props = node.attributes.properties;
      const styled = attr(props, "className") || props.some((a) => ts.isJsxSpreadAttribute(a));
      const type = attr(props, "type")?.initializer;
      const exempt = tag === "input" && type && ts.isStringLiteral(type) && EXEMPT_INPUT_TYPES.has(type.text);
      if (RAW_TAGS.has(tag) && styled && !exempt) {
        out.push({ line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1, tag });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return out;
}

/** Per-file counts against the baseline: the files that gained offenders, and those that lost some. */
export function compare(counts, baseline) {
  const files = [...new Set([...Object.keys(counts), ...Object.keys(baseline)])].sort();
  const added = [];
  const removed = [];
  for (const file of files) {
    const count = counts[file] ?? 0;
    const base = baseline[file] ?? 0;
    if (count > base) added.push({ file, count, baseline: base });
    else if (count < base) removed.push({ file, count, baseline: base });
  }
  return { added, removed };
}

function sources(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === "node_modules" ? [] : sources(p);
    return /\.tsx$/.test(e.name) && !/\.test\.tsx$/.test(e.name) ? [p] : [];
  });
}

function main([srcArg, baselineArg, ...flags]) {
  if (!srcArg || !baselineArg) {
    console.error("usage: ui-rule.mjs <src dir> <baseline.json> [--update]");
    return 2;
  }
  const cwd = process.cwd();
  const found = {};
  const counts = {};
  for (const file of sources(resolve(cwd, srcArg))) {
    const hits = findOffenders(readFileSync(file, "utf8"), file);
    if (!hits.length) continue;
    const key = relative(cwd, file).split(sep).join("/");
    found[key] = hits;
    counts[key] = hits.length;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const baselinePath = resolve(cwd, baselineArg);
  if (flags.includes("--update")) {
    const sorted = Object.fromEntries(Object.keys(counts).sort().map((k) => [k, counts[k]]));
    writeFileSync(baselinePath, JSON.stringify(sorted, null, 2) + "\n");
    console.log(`ui rule: baseline written, ${total} raw styled controls in ${Object.keys(counts).length} files`);
    return 0;
  }
  const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, "utf8")) : {};
  const { added, removed } = compare(counts, baseline);
  if (!added.length && !removed.length) {
    console.log(`ui rule: OK, no new raw styled controls (${total} left from before the rule, in ${baselineArg})`);
    return 0;
  }
  if (added.length) {
    console.error("ui rule (ui-components 0001 D7): only @pcbjam/ui may style a raw <button>, <select>, <input> or <textarea>.");
    for (const d of added) {
      console.error(`  ${d.file}: ${d.count} now, ${d.baseline} in the baseline`);
      for (const o of found[d.file] ?? []) console.error(`    ${d.file}:${o.line} <${o.tag}>`);
    }
    console.error("Use Button, Toggle, Select, Input, Textarea, Checkbox… from @pcbjam/ui. If a raw control is");
    console.error("unavoidable, raise the baseline with `--update` in the same commit and say why.");
  }
  if (removed.length) {
    console.error("ui rule: fewer raw styled controls than the baseline says, nice. Lower it so they stay gone:");
    for (const d of removed) console.error(`  ${d.file}: ${d.count} now, ${d.baseline} in the baseline`);
    console.error("Run the same command with `--update` and commit the baseline.");
  }
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exit(main(process.argv.slice(2)));
}
