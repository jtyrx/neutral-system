# Preview Theme Bridge Vars Fix

**Date:** 2026-05-22
**Status:** Approved

---

## Problem

Buttons inside `ButtonVariantsBlock` (and any `btn-sys`-based component) don't respond to the preview theme. The block wrapper background (`bg-(--color-surface-default)`) correctly switches between light and dark preview frames, but buttons stay locked to the app's global theme in both frames.

### Root cause

`btn-sys` uses a two-level CSS variable chain via `@theme inline` bridge vars:

```
btn-sys: color: var(--text-color-default)
  → :root { --text-color-default: var(--color-text-default) }   ← stops here
    → var(--color-text-default) should cascade from ThemeComparisonFrame ancestor
```

`themeVars` (the inline style injected by `ThemeComparisonFrame`) currently injects only `--color-*` vars (e.g. `--color-text-default`). When a button evaluates `var(--text-color-default)`, it finds the value at `:root` — and the inner `var(--color-text-default)` does not consistently cascade through the preview ancestor as expected.

By contrast, the wrapper `bg-(--color-surface-default)` reads `--color-surface-default` **directly** and works correctly.

### Affected code paths

- `btn-sys[data-variant="default"]`: `color`, `background-color`, `border-color`
- `btn-sys[data-variant="secondary"]`: `color`, `background-color`
- `btn-sys[data-variant="outline"]`: `color`, `border-color`
- `btn-sys[data-variant="ghost"]`: `color`
- `btn-sys[data-variant="destructive"]`: handled via `--color-destructive` (direct, unaffected)
- `ns-overlay-card` box-shadow: also uses `var(--text-color-default)` — outside scope of this fix (it's on `PreviewBlockSection` which is outside `ThemeComparisonFrame`)

---

## Solution

Extend `themeVars` inline style to also set the `@theme inline` bridge var aliases alongside the existing `--color-*` vars. When a button looks up `--text-color-default` in the cascade, it finds it on the ThemeComparisonFrame ancestor directly — no `:root` indirection needed.

### Bridge var mapping table

| Token name | Existing `--color-*` var | Bridge alias to add |
|---|---|---|
| `text.default` | `--color-text-default` | `--text-color-default` |
| `text.subtle` | `--color-text-subtle` | `--text-color-subtle` |
| `text.muted` | `--color-text-muted` | `--text-color-muted` |
| `text.disabled` | `--color-text-disabled` | `--text-color-disabled` |
| `text.on` | `--color-text-on` | `--text-color-on` |
| `surface.sunken` | `--color-surface-sunken` | `--background-color-sunken` |
| `surface.default` | `--color-surface-default` | `--background-color-default` |
| `surface.subtle` | `--color-surface-subtle` | `--background-color-subtle` |
| `surface.raised` | `--color-surface-raised` | `--background-color-raised` |
| `surface.overlay` | `--color-surface-overlay` | `--background-color-overlay` |
| `border.default` | `--color-border-default` | `--border-color-default` |
| `border.muted` | `--color-border-muted` | `--border-color-muted` |
| `border.emphasis` | `--color-border-emphasis` | `--border-color-emphasis` |
| `border.focus` | `--color-border-focus` | `--border-color-focus` |

Note: `border.emphasis` maps to `--border-color-emphasis` via `@theme inline { --border-color-emphasis: var(--color-border-emphasis) }`. `--border-color-brand` remains the custom brand stroke (`border.brand`).

---

## Implementation

### Single change: `lib/neutral-engine/exportFormats.ts`

Extend `semanticTokensToStyleVars` to also emit bridge var aliases in one pass. Add a lookup const that maps token name → bridge var name:

```ts
const PREVIEW_BRIDGE_VAR_MAP: Partial<Record<string, string>> = {
  'text.default': '--text-color-default',
  'text.subtle': '--text-color-subtle',
  'text.muted': '--text-color-muted',
  'text.disabled': '--text-color-disabled',
  'text.on': '--text-color-on',
  'surface.sunken': '--background-color-sunken',
  'surface.default': '--background-color-default',
  'surface.subtle': '--background-color-subtle',
  'surface.raised': '--background-color-raised',
  'surface.overlay': '--background-color-overlay',
  'border.default': '--border-color-default',
  'border.muted': '--border-color-muted',
  'border.emphasis': '--border-color-emphasis',
  'border.focus': '--border-color-focus',
}
```

Update `semanticTokensToStyleVars`:

```ts
export function semanticTokensToStyleVars(tokens: SystemToken[]): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const t of tokens) {
    const colorVar = `--${semanticColorVarName(t.name)}`
    vars[colorVar] = t.serialized.oklchCss
    const bridgeVar = PREVIEW_BRIDGE_VAR_MAP[t.name]
    if (bridgeVar != null) {
      vars[bridgeVar] = t.serialized.oklchCss
    }
  }
  return vars
}
```

### No other changes required

- `ThemeComparisonFrame` — no change; already applies `style={themeVars}`
- `SemanticPreviewWorkbench` — no change; already passes `themeVars` down
- `btn-sys` in `globals.css` — no change
- `exportCssVariables` — no change

---

## Verification

After the change, open the preview in split comparison mode. The `ButtonVariantsBlock` dark frame should show light text on dark background (or vice versa) visually distinct from the light frame. Both wrapper background AND button colors should respond to the preview theme.

Run `pnpm type-check` to confirm no regressions.
