import { describe, expect, it } from "vitest";
import { compare, findOffenders } from "../tools/ui-rule.mjs";

const lines = (src: string) => findOffenders(src, "x.tsx").map((o) => `${o.line} ${o.tag}`);

describe("ui rule: only @pcbjam/ui styles a raw control", () => {
  it("flags a raw button, select, input or textarea with a className", () => {
    const src = [
      `export const A = () => (`,
      `  <div className="p-2">`,
      `    <button className="rounded px-2" onClick={go}>Go</button>`,
      `    <select className="h-8"><option>a</option></select>`,
      `    <input className="border" value={v} />`,
      `    <textarea className="h-12" />`,
      `  </div>`,
      `);`,
    ].join("\n");
    expect(lines(src)).toEqual(["3 button", "4 select", "5 input", "6 textarea"]);
  });

  it("flags a spread, which can carry a className", () => {
    expect(lines(`const A = (p) => <button {...p}>x</button>;`)).toEqual(["1 button"]);
  });

  it("leaves unstyled raw controls, the package's components and other elements alone", () => {
    const src = [
      `const A = () => (<>`,
      `  <button type="button" onClick={go}>plain</button>`,
      `  <Button className="w-full">ui</Button>`,
      `  <span className="rounded" />`,
      `  <Input className="h-8" />`,
      `</>);`,
    ].join("\n");
    expect(lines(src)).toEqual([]);
  });

  it("exempts the inputs with no shared component: file pickers, colour wells, hidden fields", () => {
    const src = [
      `const A = () => (<>`,
      `  <input type="file" className="hidden" />`,
      `  <input type="color" className="h-6 w-6" />`,
      `  <input type="hidden" className="x" />`,
      `  <input type="range" className="w-full" />`,
      `</>);`,
    ].join("\n");
    expect(lines(src)).toEqual(["5 input"]);
  });
});

describe("ui rule: the baseline only goes down", () => {
  it("reports files that gained an offender, and files that lost one without lowering the baseline", () => {
    const r = compare({ "src/a.tsx": 3, "src/b.tsx": 1, "src/new.tsx": 1 }, { "src/a.tsx": 2, "src/b.tsx": 2, "src/gone.tsx": 1 });
    expect(r.added).toEqual([
      { file: "src/a.tsx", count: 3, baseline: 2 },
      { file: "src/new.tsx", count: 1, baseline: 0 },
    ]);
    expect(r.removed).toEqual([
      { file: "src/b.tsx", count: 1, baseline: 2 },
      { file: "src/gone.tsx", count: 0, baseline: 1 },
    ]);
  });

  it("is clean when the counts match the baseline", () => {
    expect(compare({ "src/a.tsx": 2 }, { "src/a.tsx": 2 })).toEqual({ added: [], removed: [] });
  });
});
