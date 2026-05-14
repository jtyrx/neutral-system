# Picker Refactor Design

**Date:** 2026-05-07
**Scope:** `components/picker/` — architecture, naming, state delivery, styling extraction
**Approach:** Full coordinated refactor (Approach A) — all changes in one sweep

---

## Context

`components/picker/` is a 13-component system for the OKLCH color picker workbench. It was built incrementally and accumulated several maintenance liabilities: an adapter prop threaded 3–4 levels deep through orchestration components, two settings files that share a hook and render overlapping sections, a 27-line routing file that adds a file hop with no reuse value, naming inconsistencies between `Oklch*` and `Picker*` prefixes, and Tailwind utility strings that repeat across files without semantic class extraction.

The system is actively in development, which makes now the lowest-cost moment for a coordinated cleanup. The goal is a production-ready folder that has clear naming conventions, a context boundary at the panel level, a merged settings component, and a `picker-*` semantic class layer in `globals.css` for all shared structural/surface patterns.

---

## Architecture Findings

### Too Granular

- **[OklchPickerWorkbench.tsx](../../../components/picker/OklchPickerWorkbench.tsx)** — 27 lines. A routing switch between `OklchPickerLive` and `OklchPickerSandboxStandalone`, both defined in the same file. No external consumer depends on this component by name. Routing moves into `app/picker/page.tsx` and the file is deleted.

### Naming Inconsistencies

| File | Problem | Fix |
|---|---|---|
| `OklchPickerMainBlocks` | "blocks" is meaningless | → `PickerControls` |
| `OklchPickerPanel` | inconsistent `Oklch` prefix for a generic shell | → `PickerPanel` |
| `OklchPickerEmbeddedTuneBlocks` | "tune blocks" is vague | → merged into `PickerSettingsPanel` |
| `OklchPickerStandaloneSettings` | redundant with above | → merged into `PickerSettingsPanel` |

**Convention going forward:**
- `Oklch*` — components whose logic is specifically OKLCH in nature (axis graph, gamut slice, L/C/H controls, preview swatch, geometry controls)
- `Picker*` — structural shells and orchestration that are picker-system-generic (panel, controls layout, action bar, settings panel)

### Prop Drilling

`adapter: WorkbenchAdapter` is threaded from `OklchPickerPanel` → `OklchPickerMainBlocks` → `OklchControls`, `PickerSecondaryControls`, `PickerActions`, and separately into both settings files — 3–4 levels.

**Fix:** `PickerAdapterContext.tsx` provides a `PickerAdapterProvider` that wraps `PickerPanel`. Orchestration components call `usePickerAdapter()` instead of receiving the adapter prop. Visualization-only leaves (`OklchAxisGraph`, `OklchGamutSlice`, `OklchPreviewSwatch`, `PickerRampStrip`) stay prop-driven — they are independently testable and portable.

### Duplicate Settings Surface

`OklchPickerEmbeddedTuneBlocks` and `OklchPickerStandaloneSettings` both call `useOklchPickerSectionProps(adapter)` and render `GlobalScaleSection` + `OkhslSection`. The standalone version adds architecture selector, edit target, variants, system mapping, alpha config, and export — but the boilerplate shell is identical.

**Fix:** Merge into `PickerSettingsPanel` with `variant: 'embedded' | 'standalone'`. Shared sections render in both variants; extended sections are gated on `variant === 'standalone'`.

### Well-Scoped (No Changes)

These leaf components are correctly isolated and stay as-is:
- `GamutBadge.tsx` — pure display, tooltip-wrapped badge
- `OklchAxisGraph.tsx` — SVG axis gradient visualization
- `OklchGamutSlice.tsx` — interactive 2D L/C picker
- `OklchControls.tsx` — L/C/H sliders + inputs
- `OklchPreviewSwatch.tsx` — color preview + gamut metadata
- `PickerRampStrip.tsx` — horizontal ramp preview
- `PickerActions.tsx` — send/copy/open buttons

### P3 — Optional Size Reduction

`PickerSecondaryControls.tsx` is 288 lines with three distinct concerns: lightness range slider, ramp geometry dropdowns (steps/naming/chroma), and a curve/strength popover. Not blocking, but can be split into `OklchGeometryControls` + `OklchCurveControls` in a follow-up once P0–P1 land.

---

## Styling Findings

### Patterns Repeated Across Files

| Pattern | Files | Classes |
|---|---|---|
| Section divider | Panel, EmbeddedTuneBlocks, StandaloneSettings | `border-t border-hairline pt-6` |
| Section heading | Controls, EmbeddedTuneBlocks, StandaloneSettings | `text-xs font-medium text-default` |
| Meta / secondary label | GamutSlice, Controls, PreviewSwatch, SecondaryControls | `text-[0.65rem] text-muted` |
| Numeric readout | PreviewSwatch, SecondaryControls | `font-mono text-[0.65rem] tabular-nums text-muted` |
| Action button row | Actions, Panel, EmbeddedTuneBlocks | `flex flex-wrap items-center gap-2` |
| Raised card surface | PreviewSwatch, RampStrip, GamutSlice | `rounded-xl border border-hairline bg-raised` |
| Gamut warning badge | PreviewSwatch | `rounded bg-amber-500/20 px-1.5 py-px text-[0.6rem] font-medium text-amber-900 dark:text-amber-200` |
| Metadata grid | StandaloneSettings | `grid grid-cols-2 gap-3` |
| Legacy field bg | StandaloneSettings | `bg-(--ns-field)` — violates AGENTS.md guardrail |

### `PickerSecondaryControls` Utility Sprawl

Contains ~60 utility classes including Select dropdown internals (item highlight, chevron, overflow, CSS variable max-height). These appear to be generated/pasted shadcn output rather than authored. Audit whether this component is using the `@/components/ui/select` wrapper or raw Base UI primitives — if the latter, migrate to the wrapper.

---

## What Moves to `globals.css`

New `picker-*` semantic classes added as `@utility` entries in `app/globals.css`, using `@apply` for consistency with how existing `cc-*` and `ns-*` utilities are authored in this file:

```css
@utility picker-section {
  @apply border-t border-hairline pt-6;
}
@utility picker-section-heading {
  @apply text-xs font-medium text-default;
}
@utility picker-meta {
  @apply text-[0.65rem] text-muted;
}
@utility picker-readout {
  @apply font-mono text-[0.65rem] tabular-nums text-muted;
}
@utility picker-actions {
  @apply flex flex-wrap items-center gap-2;
}
@utility picker-control-stack {
  @apply flex flex-col gap-4;
}
@utility picker-metadata-grid {
  @apply grid grid-cols-2 gap-3;
}
@utility picker-swatch-card {
  @apply overflow-hidden rounded-xl border border-hairline bg-raised;
}
@utility picker-gamut-warning {
  /* dark: variant works inside @apply in Tailwind v4 */
  @apply rounded bg-amber-500/20 px-1.5 py-px text-[0.6rem] font-medium text-amber-900 dark:text-amber-200;
}
```

**Token correction** (not a new class): `bg-(--ns-field)` → `bg-(--chrome-field)` in `OklchPickerStandaloneSettings` (now `PickerSettingsPanel`).

---

## What Stays in Component Files

- SVG dimension props (`width`, `height`) driven by `layout` prop — dynamic, not extractable
- Responsive grid: `lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]` in `PickerControls` — one-off structural exception
- State-driven classes: `data-[highlighted]:bg-accent`, `focus-visible:ring-*`, `disabled:opacity-45`
- Layout variant classes gated on `layout` prop (`gap-6` vs `gap-8`)
- `cursor-crosshair` on the gamut slice SVG
- `touch-none` on the interactive slice surface
- `sm:` responsive breakpoint overrides that are layout-contextual

---

## Target File Structure

```
components/picker/
  AGENTS.md                        NEW — governance, conventions, styling contract

  # Context
  PickerAdapterContext.tsx         NEW — PickerAdapterProvider + usePickerAdapter()

  # Shell / Panel
  PickerPanel.tsx                  RENAME from OklchPickerPanel.tsx
  PickerControls.tsx               RENAME from OklchPickerMainBlocks.tsx
  PickerSettingsPanel.tsx          MERGE of OklchPickerEmbeddedTuneBlocks + OklchPickerStandaloneSettings
  PickerActions.tsx                KEEP (rename to PickerActionBar is optional, P3)

  # OKLCH-specific controls
  OklchControls.tsx                KEEP
  PickerSecondaryControls.tsx      KEEP for now (P3: split into OklchGeometryControls + OklchCurveControls)

  # OKLCH-specific visualizations (prop-driven, no context)
  OklchAxisGraph.tsx               KEEP
  OklchGamutSlice.tsx              KEEP
  OklchPreviewSwatch.tsx           KEEP
  PickerRampStrip.tsx              KEEP
  GamutBadge.tsx                   KEEP

  # Deleted
  OklchPickerWorkbench.tsx         DELETE — routing moves to app/picker/page.tsx
  OklchPickerEmbeddedTuneBlocks.tsx  DELETE — merged into PickerSettingsPanel
  OklchPickerStandaloneSettings.tsx  DELETE — merged into PickerSettingsPanel
```

**`app/picker/page.tsx`** — expanded from 6 lines to include the live/sandbox routing that was in `OklchPickerWorkbench.tsx`.

---

## Refactor Priorities

### P0 — Foundational (do first, unlocks P1)

1. **Create `PickerAdapterContext.tsx`**
   - Export `PickerAdapterProvider` (wraps children, accepts `adapter: WorkbenchAdapter`)
   - Export `usePickerAdapter()` — throws if used outside provider
   - `PickerPanel` wraps its subtree with the provider
   - Remove `adapter` prop from: `PickerControls`, `OklchControls`, `PickerSecondaryControls`, `PickerActions`, `PickerSettingsPanel`
   - Visualization leaves keep their props: `OklchAxisGraph`, `OklchGamutSlice`, `OklchPreviewSwatch`, `PickerRampStrip`

2. **Extract `picker-*` semantic classes into `app/globals.css`**
   - Add all 9 classes defined above under `@utility` or `@layer base`
   - Find-replace in all 13 component files (use `cn()` where classes are still combined with dynamic ones)
   - Fix `bg-(--ns-field)` → `bg-(--chrome-field)` in `OklchPickerStandaloneSettings`

### P1 — Architecture Cleanup

3. **Merge `OklchPickerEmbeddedTuneBlocks` + `OklchPickerStandaloneSettings` → `PickerSettingsPanel`**
   - Props: `variant: 'embedded' | 'standalone'`
   - Shared: `useOklchPickerSectionProps()` call, `GlobalScaleSection`, `OkhslSection`, section divider/heading pattern
   - Standalone-only: architecture selector, edit target, variants, system mapping, alpha config, export
   - Reads adapter from `usePickerAdapter()` — no prop

4. **Rename files**
   - `OklchPickerPanel.tsx` → `PickerPanel.tsx` (update internal component name + all imports)
   - `OklchPickerMainBlocks.tsx` → `PickerControls.tsx` (update internal component name + all imports)

5. **Inline `OklchPickerWorkbench` routing → `app/picker/page.tsx`**
   - Move `OklchPickerLive` and `OklchPickerSandboxStandalone` inner components (or their logic) directly into the page file
   - Delete `components/picker/OklchPickerWorkbench.tsx`
   - Update `app/picker/page.tsx` imports

### P2 — Governance

6. **Write `components/picker/AGENTS.md`**
   - Naming conventions (`Oklch*` vs `Picker*`)
   - Context boundary: `usePickerAdapter()` for orchestration components; props for visualization leaves
   - Styling contract: what classes live in component files vs. `globals.css`
   - No new `--ns-*` tokens; use `--chrome-*` and `--color-*` aliases

### P3 — Optional (follow-up PR)

7. Split `PickerSecondaryControls.tsx` into `OklchGeometryControls.tsx` (steps, naming, chroma mode dropdowns) + `OklchCurveControls.tsx` (lightness curve select + strength popover)
8. Audit whether `PickerSecondaryControls` composes `@/components/ui/select` or raw Base UI `Select.*` primitives — if raw, migrate to the wrapper so internal dropdown classes (`data-[highlighted]`, chevron, overflow, max-height vars) are encapsulated in the shared component rather than repeated inline

---

## Verification

- `pnpm type-check` — no new TypeScript errors after context migration and file renames
- `pnpm lint` — no ESLint violations from renamed imports
- `pnpm dev` — open `/picker` in both `mode="live"` and `mode="sandbox"`, confirm L/C/H sliders, gamut slice click, ramp strip, secondary controls, and "Send to workbench" / "Copy OKLCH" all work
- Toggle embedded picker from the workbench inspector pane — confirm `variant="embedded"` path through `PickerSettingsPanel` renders and functions correctly
- Check dark mode and light mode — `picker-gamut-warning` class should respect `dark:` variant
- Check that no `--ns-field` references remain in `components/picker/` after the token correction
