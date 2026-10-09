# @pcbjam/ui

PCBJam's shared UI components: [shadcn/ui](https://ui.shadcn.com) on Radix, styled only
through design tokens. Both the PCBJam web app and the editor use it.

**The rule:** this package is the only place that styles raw `<button>`, `<select>`,
`<input>` or `<textarea>` elements, or builds a badge, tab strip or popup from plain
elements. Apps compose these components and never restyle the primitives.

## What is in it

- `src/components/*`: the components. Import them from `@pcbjam/ui`.
- `src/theme.css`: neutral defaults for every token (shadcn's slate theme), for `:root`
  and `.dark`. Import it first; a brand stylesheet loaded after it overrides tokens.
- `tailwind-preset.js`: maps the tokens to Tailwind colours and radii.
- `Select` takes `value=""` on an item (Radix alone refuses it), so a native `<select>`'s
  "All" or "None" option ports over as is. `Combobox` is the Select with a search box, for
  long lists (branches, repositories, symbols).
- `Badge` takes a `tone` (neutral, primary, success, warning, danger, info, preview) and a
  `variant` (soft, outline, solid). The tones are tokens in `theme.css` with their own dark
  values; each clears 4.5:1 on its 15% tint in both themes.
- `Tabs` switch panels (`TabsList` variant `segmented` or `underline`). `ToggleGroup` picks
  one (type="single", items are radios) or several values; `variant="segmented"` is the
  segmented control. A single group ignores a click that would clear its value unless
  `deselectable` is set. `Toggle` is one pressed/unpressed button.
- `Checkbox`, `RadioGroup` and `Switch` are buttons with `role="checkbox"`, `"radio"` and
  `"switch"`, so Playwright's `check()` and `toBeChecked()` work as on native inputs.
  `onCheckedChange` gets `true`, `false` or `"indeterminate"`. Use a Switch for a setting that
  applies at once, a Checkbox for a choice that is submitted or a list selection.
- `Tip` replaces a `title` attribute: `<Tip content="Close"><button>…</button></Tip>`. Like
  `title`, it names an icon-only trigger (its text becomes the aria-label when the trigger has
  no name of its own), and it still shows on a disabled trigger. It needs one
  `TooltipProvider` above it, at the app root.
- Tests: a Select or Combobox trigger carries the chosen value in `data-value`, and each
  option its value in `data-option-value`. Pick one with a click on the trigger, then on
  `[role=option][data-option-value="…"]`.
- `components.json`: the target for `npx shadcn add`. Generated files import
  `@/lib/utils`; change that to a relative import (`../lib/utils`), or the import
  guardrail test fails.

No brand: no PCBJam colours, fonts or logos live here. See `TRADEMARKS.md`.

## Using it in an app

```js
// tailwind.config.js
import uiPreset from "@pcbjam/ui/tailwind-preset";
export default {
  presets: [uiPreset],
  content: ["./index.html", "./src/**/*.{ts,tsx}", "<path to this package>/src/**/*.{ts,tsx}"],
};
```

```css
/* index.css, before the @tailwind directives */
@import "@pcbjam/ui/theme.css";
```

The package ships TypeScript source; the app's bundler compiles it. Two pnpm workspaces
install it (the root app and `pcbjam/web`), so its own `node_modules` can point at the
other workspace's React. That is safe only while the app dedupes React, which
`@vitejs/plugin-react` does by default. An app built without that plugin must set
`resolve.dedupe: ["react", "react-dom"]` itself.

The editor pauses its guide overlay while a dialog is open. It does that through
`<DialogEventsProvider onContentMount={...}>`; this package never imports app code.

## Guardrails (`pnpm test`)

- Source files import only React, Radix, `class-variance-authority`, `clsx`,
  `tailwind-merge`, `lucide-react`, `cmdk` and each other. Nothing from an app, nothing GPL.
- Every installed dependency, direct or transitive, is under MIT, ISC, BSD, 0BSD or
  Apache-2.0.

## Licence

MIT, see `LICENSE`. The components are derived from shadcn/ui (MIT); its notice is in
`THIRD_PARTY_NOTICES.md`.
