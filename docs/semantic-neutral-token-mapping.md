# Semantic Neutral Token Mapping

> Atlassian Design System (2026 Refresh) semantic philosophy applied to this system's neutral primitives.
> Semantic tokens are the stable public API. Primitives are an implementation detail.

---

## 1. Overview

This document defines how neutral primitives are assigned to semantic roles. Components must consume semantic tokens — never raw `--neutral-{label}` primitives. Themes remap semantic tokens to different primitives; components require no changes.

### Implemented tokens (ready for use)

| Category | Tokens |
|---|---|
| Text | `--color-text-default`, `--color-text-subtle`, `--color-text-muted`, `--color-text-disabled`, `--color-text-on` |
| Icon | `--color-icon-default`, `--color-icon-subtle`, `--color-icon-subtlest`, `--color-icon-disabled`, `--color-icon-inverse` |
| Surface | `--color-surface-sunken`, `--color-surface-default`, `--color-surface-subtle`, `--color-surface-raised`, `--color-surface-overlay`, `--color-surface-brand`, `--color-surface-inverse` |
| Border | `--color-border-subtle`, `--color-border-default`, `--color-border-strong`, `--color-border-focus` |
| Alpha neutral (light) | `--color-neutral-alpha-100`, `--color-neutral-alpha-200`, `--color-neutral-alpha-300`, `--color-neutral-alpha-400` |
| Alpha neutral (dark) | `--color-dark-neutral-alpha-100`, `--color-dark-neutral-alpha-200`, `--color-dark-neutral-alpha-300`, `--color-dark-neutral-alpha-400` |

### Onboarding candidates (not yet implemented)

| Category | Notes |
|---|---|
| Background tokens (`--color-background-*`) | Requires new engine role category; see §7 |
| Shadow tokens (`--shadow-*`) | Can be added as globals.css statics; see §10 |

---

## 2. Mapping Philosophy

**Primitives describe values. Semantics describe usage.** A component styled with `--color-text-subtle` communicates intent — "this is de-emphasized copy" — regardless of whether the underlying ramp step is `neutral-400` or `neutral-600`.

Key principles drawn from the Atlassian model and encoded here:

- **One ramp, many themes.** The 41-step OKLCH ramp is the sole primitive source. Light and dark modes differ in which indices are assigned to each role, not in separate ramp definitions.
- **Light mode insight (Atlassian):** In light mode, `surface.raised` and `surface.overlay` often resolve to the same primitive because luminance elevation is communicated by shadow, not by background lightness. The engine preserves this: both roles map adjacent ramp indices from the light end.
- **Text is the contrast anchor.** Every theme's text tokens resolve to the dark-end indices in light mode and light-end indices in dark mode, guaranteeing perceptual contrast without manual calibration. Alpha neutral tokens inherit this anchor (§11).
- **Focus rings stay max-contrast.** `border.focus` is derived as a ramp flip of `surface.default` — always the highest-contrast neutral available in the current mode — never a standard ladder count.

---

## 3. Primitive-to-Semantic Relationship

```
Global Ramp (41 steps, index 0 = lightest)
  │
  ├── Tier 1: --neutral-{label}          (e.g. --neutral-50, --neutral-950)
  │          --color-neutral-{label}     (legacy alias, resolves to tier 1)
  │
  └── Tier 2: --color-{role}             (e.g. --color-text-default, --color-surface-raised)
               resolved per [data-theme] via var(--neutral-*) references

Components
  └── consume ONLY tier 2 (--color-*) tokens
      never --neutral-* directly
```

The engine produces tier 1 via `buildGlobalScale(GlobalScaleConfig)` and tier 2 via `deriveSystemTokens(global, SystemMappingConfig)`. The CSS export writes both tiers into `:root` (dark fallback), `[data-theme="light"]`, and `[data-theme="dark"]` blocks.

### Ladder positions (default config)

With `steps: 41`, `lHigh: 98.5%`, `lLow: 16.15%`:

| Theme | Surface start idx | Border start idx | Text start idx |
|---|---|---|---|
| Light | 0 | 4 | 34 |
| Dark elevated | 0 (from dark end) | 2 | 15 |

> **Audit note:** To get the exact primitive labels at each index, run `buildGlobalScale(DEFAULT_GLOBAL_SCALE_CONFIG)` and inspect `global[index].label`.

---

## 4. Light and Dark Mode Mapping Table

| Semantic Token | Light Ramp Direction | Dark Ramp Direction | Atlassian Analog | Notes |
|---|---|---|---|---|
| `surface.sunken` | Lightest end → idx 0 | Darkest end → idx 0 | `color.background.neutral.subtle` | Deepest well, under cards |
| `surface.default` | → idx 1 | → idx 1 | `color.background.neutral` | Page canvas |
| `surface.subtle` | → idx 2 | → idx 2 | `color.background.neutral.hovered` | Hover/fill tint |
| `surface.raised` | → idx 3 | → idx 3 | `color.elevation.surface.raised` | Card surfaces |
| `surface.overlay` | → idx 4 | → idx 4 | `color.elevation.surface.overlay` | Modals, popovers |
| `surface.brand` | Step past overlay | Step past overlay | `color.background.brand.bold` | Accent plane |
| `surface.inverse` | Dark-end flip | Light-end flip | `color.background.inverse` | High-contrast inverse |
| `border.subtle` | Stroke start idx | Dark stroke start | `color.border.subtle` | Dividers, hairlines |
| `border.default` | → +1 interval | → +1 interval | `color.border` | Standard border |
| `border.strong` | → +2 intervals | → +2 intervals | `color.border.bold` | Emphasis border |
| `border.focus` | Ramp flip of surface.default | Ramp flip of surface.default | `color.border.focused` | Focus ring — always max contrast |
| `text.default` | Text start idx | Dark text start | `color.text` | Primary body copy |
| `text.subtle` | → +1 × textStep | → +1 × textStep | `color.text.subtle` | Secondary copy |
| `text.muted` | → +2 × textStep | → +2 × textStep | `color.text.subtlest` | Placeholders, captions |
| `text.disabled` | → +3 × textStep | → +3 × textStep | `color.text.disabled` | Disabled state |
| `text.on` | Flip for inverse surfaces | Flip for inverse surfaces | `color.text.inverse` | Copy on dark/brand surfaces |

---

## 5. Text Token Usage

All five text tokens follow a single semantic axis: "how much does this text recede?"

| Token | CSS Variable | Use When |
|---|---|---|
| Default | `--color-text-default` | Primary labels, body, headings |
| Subtle | `--color-text-subtle` | Supporting copy, metadata |
| Muted | `--color-text-muted` | Placeholders, tertiary labels |
| Disabled | `--color-text-disabled` | Inactive controls, ghost text |
| On | `--color-text-on` | Text on `surface.inverse` or `surface.brand` |

**Naming notes:**
- `text.muted` corresponds to Atlassian's `subtlest`; the internal name reflects the product's vocabulary.
- `text.on` corresponds to Atlassian's `inverse`; it is not part of the standard contrast ladder — it is resolved as a ramp flip.

---

## 6. Icon Token Usage

Icon tokens mirror the text hierarchy exactly. Implemented as CSS aliases in `app/globals.css`.

| Token | CSS Variable | Text Counterpart | Use When |
|---|---|---|---|
| Default | `--color-icon-default` | `--color-text-default` | Standard icons adjacent to body text |
| Subtle | `--color-icon-subtle` | `--color-text-subtle` | Supporting/secondary icon decoration |
| Subtlest | `--color-icon-subtlest` | `--color-text-muted` | Tertiary, decorative, metadata icons |
| Disabled | `--color-icon-disabled` | `--color-text-disabled` | Icons in disabled controls |
| Inverse | `--color-icon-inverse` | `--color-text-on` | Icons on inverse/brand surfaces |

**Pairing rule:** An icon that appears alongside text should use the same semantic tier as that text. If the label uses `--color-text-subtle`, the icon uses `--color-icon-subtle`.

**Implementation:** These are CSS-only aliases — they resolve via the underlying text tokens and therefore inherit all theme switching automatically:

```css
--color-icon-default:   var(--color-text-default);
--color-icon-subtle:    var(--color-text-subtle);
--color-icon-subtlest:  var(--color-text-muted);
--color-icon-disabled:  var(--color-text-disabled);
--color-icon-inverse:   var(--color-text-on);
```

---

## 7. Background Token Usage

> **Not yet implemented.** Background tokens (`--color-background-*`) require a new engine role category distinct from surface elevation. They are tracked here as onboarding candidates.

**Current substitute:** The `--chrome-*` mixer variables (emitted after tier-2 in each `[data-theme]` block by `linesLiveThemeChromeBlock()`) provide adaptive fills for neutral backgrounds. Use them as a temporary stand-in.

**Atlassian analogs for future mapping:**

| Future Token | Atlassian Analog | Description |
|---|---|---|
| `--color-background-neutral` | `color.background.neutral` | Default neutral fill for form fields, chips |
| `--color-background-neutral-hovered` | `color.background.neutral.hovered` | Hover fill |
| `--color-background-neutral-pressed` | `color.background.neutral.pressed` | Pressed/active fill |
| `--color-background-input` | `color.background.input` | Input field background |
| `--color-background-disabled` | `color.background.disabled` | Disabled fill |

**Implementation path:** Add a new `backgroundStart`/`backgroundCount` slot to `SystemMappingConfig`, derive in `systemMap.ts`, and expose roles via `semanticNaming.ts`. Separate plan required.

---

## 8. Surface and Elevation Token Usage

The surface ladder models **luminance elevation**: containers appear lighter (in light mode) as they stack higher.

| Token | CSS Variable | Elevation | Use When |
|---|---|---|---|
| Sunken | `--color-surface-sunken` | −1 | Input wells, code blocks, inset panels |
| Default | `--color-surface-default` | 0 | Page canvas, app background |
| Subtle | `--color-surface-subtle` | +1 | Hover/selected rows, tinted fills |
| Raised | `--color-surface-raised` | +2 | Cards, dropdowns, surface containers |
| Overlay | `--color-surface-overlay` | +3 | Modals, popovers, floating panels |
| Brand | `--color-surface-brand` | Accent | Primary CTA surfaces, selected states |
| Inverse | `--color-surface-inverse` | Flip | High-contrast callouts, tooltips |

**Atlassian insight (reproduced):** In light mode, `surface.raised` and `surface.overlay` can resolve to the same primitive — elevation is communicated by shadow depth, not by background luminance alone. The engine places them on adjacent ladder indices with a single step interval, preserving this behavior.

**Dark mode reversal:** In dark mode, higher elevation reads *lighter* along the ramp — the mapping is from the dark end forward, so `surface.sunken` is darkest and `surface.overlay` is lightest within the dark segment.

---

## 9. Border Token Usage

| Token | CSS Variable | Use When |
|---|---|---|
| Subtle | `--color-border-subtle` | Hairlines, separators between same-surface items |
| Default | `--color-border-default` | Standard control outlines, table cell boundaries |
| Strong | `--color-border-strong` | Emphasis borders, selected control outlines |
| Focus | `--color-border-focus` | **Focus rings only** — never for decorative borders |

**Focus ring special case:** `border.focus` is resolved as a ramp flip of `surface.default` (see `resolveBorderFocusIndex` in `systemMap.ts`). This guarantees it is always the highest-contrast neutral available in the current mode, independent of the border ladder position. Never swap a decorative `border.strong` for `border.focus` — the semantics carry accessibility guarantees.

---

## 10. Shadow Token Usage

> **Not yet implemented.** Shadow tokens can be added as static CSS custom properties in `app/globals.css` without engine changes.

**Atlassian reference values (for calibration):**

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--shadow-raised` | `0 1px 1px rgba(9,30,66,0.25), 0 0 1px rgba(9,30,66,0.31)` | `0 1px 1px rgba(0,0,0,0.4), 0 0 1px rgba(0,0,0,0.5)` |
| `--shadow-overlay` | `0 8px 12px rgba(9,30,66,0.15), 0 0 1px rgba(9,30,66,0.31)` | `0 8px 12px rgba(0,0,0,0.36), 0 0 1px rgba(0,0,0,0.5)` |

**Implementation path:** Add `--shadow-raised` and `--shadow-overlay` directly to the `:root` block in `app/globals.css`. Add `[data-theme="dark"]` overrides. No engine changes required.

---

## 11. Alpha Neutral Tokens

Alpha neutral tokens provide **transparent neutrals** that blend with their underlying surface — essential for disabled states, overlays, and hover fills that need to adapt to any background.

### How they work

**Base index derivation:**

```
text.default.sourceGlobalIndex
      │
      + lightIndexOffset (default: 0, range: ±10)
      │
      └─→ lightBase index
            → --color-neutral-alpha-{100|200|300|400}
```

The same derivation runs independently for dark mode using `darkTokens` and `darkIndexOffset`.

The `text.default` index is the natural anchor — it represents the highest-contrast neutral available in the current theme, which is also the base that alpha overlays should be derived from.

### Token reference

| Token (Light) | Alpha | Token (Dark) | Use When |
|---|---|---|---|
| `--color-neutral-alpha-100` | 8% | `--color-dark-neutral-alpha-100` | Hover fills, ultra-subtle tints |
| `--color-neutral-alpha-200` | 16% | `--color-dark-neutral-alpha-200` | Selected fills, focus overlays |
| `--color-neutral-alpha-300` | 32% | `--color-dark-neutral-alpha-300` | Disabled overlays, muted fills |
| `--color-neutral-alpha-400` | 48% | `--color-dark-neutral-alpha-400` | Scrim-style overlays, modal backdrops |

### CSS output format

```css
[data-theme="light"] {
  --color-neutral-alpha-100: color-mix(in oklch, var(--neutral-950) 8%, transparent);
  --color-neutral-alpha-200: color-mix(in oklch, var(--neutral-950) 16%, transparent);
  --color-neutral-alpha-300: color-mix(in oklch, var(--neutral-950) 32%, transparent);
  --color-neutral-alpha-400: color-mix(in oklch, var(--neutral-950) 48%, transparent);
  /* dark variants use the dark-mode base primitive */
  --color-dark-neutral-alpha-100: color-mix(in oklch, var(--neutral-50) 8%, transparent);
  /* ... */
}
```

The base primitive (`--neutral-950`, `--neutral-50`, etc.) updates automatically when the user adjusts the offset controls in the workbench.

### Workbench controls

Under **Contrast & role mapping → Alpha neutral base offset**:

- **Light offset** — nudges `lightBase` index ±N steps from `text.default` 
- **Dark offset** — nudges `darkBase` index ±N steps from `text.default`
- Live-updating resolved indices are shown inline
- The **Global Ramp** shows a violet "Aα" badge on the base swatch
- The **Offset Map** shows a violet "Alpha" row alongside Surface/Border/Text rows

### Atlassian cross-reference

| This System | Atlassian Analog | Alpha |
|---|---|---|
| `neutral-alpha-100` | `color.background.neutral` | 8% |
| `neutral-alpha-200` | `color.background.neutral.hovered` | 16% |
| `neutral-alpha-300` | `color.background.neutral.pressed` | 32% |
| `neutral-alpha-400` | `color.text.disabled` (alpha form) | 48% |

**Warning:** Alpha tokens blend with the surface beneath. Always test `--color-neutral-alpha-300` and above across `surface.sunken`, `surface.default`, and `surface.raised` in both modes to verify readability.

---

## 12. Practical UI Examples

### Card component

```css
.card {
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-subtle);
  /* shadow token (onboarding candidate): box-shadow: var(--shadow-raised); */
}

.card__title {
  color: var(--color-text-default);
}

.card__meta {
  color: var(--color-text-muted);
}

.card__icon {
  color: var(--color-icon-subtle);
}
```

### Modal overlay

```css
.modal-backdrop {
  background: var(--color-neutral-alpha-400);
  /* or: var(--color-overlay-scrim) for the engine-derived scrim token */
}

.modal-panel {
  background: var(--color-surface-overlay);
  border: 1px solid var(--color-border-default);
}
```

### Disabled button

```css
.button[disabled] {
  background: var(--color-neutral-alpha-200);
  color: var(--color-text-disabled);
}

.button[disabled] .button__icon {
  color: var(--color-icon-disabled);
}
```

### Input field

```css
.input {
  background: var(--color-surface-sunken);  /* until background tokens land */
  border: 1px solid var(--color-border-default);
  color: var(--color-text-default);
}

.input::placeholder {
  color: var(--color-text-muted);
}

.input:focus {
  outline: 2px solid var(--color-border-focus);
  outline-offset: 2px;
}
```

### Inverse section (callout, tooltip)

```css
.callout {
  background: var(--color-surface-inverse);
  color: var(--color-text-on);
}

.callout__icon {
  color: var(--color-icon-inverse);
}
```

### Icon + label pairing

```html
<!-- The icon and label use the same semantic tier -->
<span class="row">
  <Icon style="color: var(--color-icon-subtle)" />
  <span style="color: var(--color-text-subtle)">Last edited 2 days ago</span>
</span>
```

### Hover row fill

```css
.table-row:hover {
  background: var(--color-neutral-alpha-100);
}

.table-row[aria-selected="true"] {
  background: var(--color-neutral-alpha-200);
}
```

---

## 13. Do / Don't Guidance

| Do | Don't |
|---|---|
| `color: var(--color-text-subtle)` | `color: var(--neutral-400)` |
| `background: var(--color-surface-raised)` | `background: oklch(96% 0.005 260)` |
| Match icon tier to adjacent text tier | Use `--color-icon-default` for a muted supporting icon |
| Use `--color-border-focus` for focus rings only | Swap `border.strong` into focus context for visual effect |
| Use `--color-neutral-alpha-200` for hover fills | Use a solid surface token for hover (surface tokens should be static) |
| Test alpha tokens on all three surface layers | Verify alpha tokens only on `surface.default` |
| Consume via `[data-theme]` data attribute | Read primitive values from CSS at runtime |
| Add new roles via the engine (`systemMap.ts`) | Add ad-hoc CSS variables that bypass the ramp |

---

## 14. Open Questions and TODOs

- [ ] **Fill in primitive labels** — run `buildGlobalScale(DEFAULT_GLOBAL_SCALE_CONFIG)` and replace `<audit>` markers in §4 mapping table with exact `neutral-{label}` values for each role at default config
- [ ] **Calibrate shadow RGBA values** — the Atlassian reference values in §10 are starting points; calibrate against the actual ramp's darkest primitive
- [ ] **Background tokens** — decide: new engine role category or CSS-only statics? If CSS-only, the `fillStart` index + 1 step can be used as a stable reference
- [ ] **Verify WCAG contrast** — `contrastContracts.ts` covers text/surface pairs; add contracts for `text.on` over `surface.brand` and `text.on` over `surface.inverse`
- [ ] **Alpha stop calibration** — 8%/16%/32%/48% are Atlassian-derived; adjust `DEFAULT_ALPHA_NEUTRAL_CONFIG.alphaStops` if the design language requires different steps

---

## 15. Verification: Progressive Disclosure Model

A recommended approach for AI agents performing site-wide semantic token compliance analysis. Run levels in order — early levels catch the most common violations cheaply.

### Level 1 — Primitive leak check (automated)

Scan all component files for direct `--neutral-{label}` references. No component should ever reference a primitive variable directly.

```bash
grep -rn "var(--neutral-" components/ --include="*.tsx" --include="*.css"
```

Expected: 0 results. Any hit is a violation — replace with the appropriate semantic token.

### Level 2 — Icon token audit (automated)

Scan for hardcoded Tailwind color classes on icon elements. Icons that use `text-zinc-*`, `text-gray-*`, or `text-slate-*` classes instead of `--color-icon-*` tokens bypass the semantic layer.

```bash
grep -rn "text-zinc\|text-gray\|text-slate\|text-neutral" components/ --include="*.tsx" | grep -i "icon\|svg\|<Icon"
```

Flag any result for replacement with the appropriate `--color-icon-*` token (or a Tailwind utility that resolves through the theme).

### Level 3 — Surface vs background consistency (manual)

Check that page-layout shell elements use `--color-surface-*` and that component internal fills use either `--color-surface-*` or alpha tokens (until background tokens are onboarded). Hardcoded `bg-white`, `bg-zinc-950`, and similar bypasses should be replaced.

```bash
grep -rn "bg-white\b\|bg-black\b\|bg-zinc-[0-9]" components/ --include="*.tsx"
```

### Level 4 — Contrast validation (automated + manual)

**Automated:** `pnpm test` exercises `contrastContracts.ts`, which verifies WCAG-level pairs for all text/surface combinations.

**Manual — alpha tokens:** Verify `--color-neutral-alpha-300` (32%) and `--color-neutral-alpha-400` (48%) against `--color-surface-raised` in both light and dark mode. Alpha tokens blending over lighter surfaces can push foreground elements below contrast thresholds.

**Manual — focus rings:** Confirm `--color-border-focus` maintains ≥3:1 contrast against both `surface.default` and `surface.raised` in both modes (WCAG 2.4.11 — Focus Appearance).

### Level 5 — Export parity check (automated)

Verify that exported CSS contains all expected variables:

```bash
# Start the dev server, then:
curl -s http://localhost:3000 | grep -o 'color-neutral-alpha-[0-9]*' | sort -u
# Expected: color-neutral-alpha-100, 200, 300, 400
```

Or export from the workbench UI and verify:

```bash
grep "color-neutral-alpha\|color-icon-" exported.css | wc -l
# Expected: 8 alpha lines (4 light + 4 dark) + 5 icon alias lines
```
