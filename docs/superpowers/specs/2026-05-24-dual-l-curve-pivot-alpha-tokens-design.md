# Design: Dual L Curve Pivot + Alpha Token Replacement

**Date:** 2026-05-24  
**Scope:** `lib/neutral-engine/` — `globalScale.ts`, `types.ts`, `alphaNeutralTokens.ts`, plus test file  
**Breaking-change risk:** Low — both changes are additive/replace-in-place with backward compat preserved

---

## Context

Two independent improvements to the neutral-engine palette pipeline:

1. **dualLCurvePivot** — The current `lCurveStrength` scalar applies the same curve blend to every stop in a ramp. The reference screenshot (14-stop light + dark rows) shows stops 0–7 tracking the surrounding hue/chroma while stops 8–13 sit flatter and more neutral. This split is currently baked into the defaults with no configuration knob. The feature formalizes it by allowing two independent strength values separated by an absolute pivot index.

2. **Alpha token rename** — The existing alpha system emits `--color-neutral-alpha-100` through `–400` at 8/16/32/48%. The target scheme is stop-indexed (`--color-neutral-alpha-0` through `–5`) at finer opacity steps (4/6/8/12/16/24%), replacing the old names entirely.

---

## Feature A: dualLCurvePivot

### What changes

**`lib/neutral-engine/types.ts` — `GlobalScaleConfig`**

Add three optional fields below the existing `lCurveStrength`:

```ts
lCurveStrengthA?: number | undefined   // strength for stops index < pivotIndex
lCurveStrengthB?: number | undefined   // strength for stops index >= pivotIndex
pivotIndex?: number | undefined        // absolute step index; default 8
```

Backward compat: if neither `lCurveStrengthA` nor `lCurveStrengthB` is set, the existing `lCurveStrength` uniform path is used unchanged.

**`lib/neutral-engine/globalScale.ts` — `buildGlobalScale()`**

In the per-stop loop (currently line ~177), replace the static `config.lCurveStrength` argument to `easeL()` with a resolved value:

```ts
const pivot = config.pivotIndex ?? 8
const useDual = config.lCurveStrengthA !== undefined || config.lCurveStrengthB !== undefined
const strength = useDual
  ? (i < pivot ? (config.lCurveStrengthA ?? config.lCurveStrength) : (config.lCurveStrengthB ?? config.lCurveStrength))
  : config.lCurveStrength

const L = easeL(lHigh, lLow, t, config.lCurve, strength)
```

`i` is the loop index (pre-direction-flip). The `direction === 'dark-to-light'` flip affects the `t` value passed to `easeL` but the pivot comparison uses the raw output index `i`, which is consistent with stop numbering shown in the UI.

**`lib/neutral-engine/globalScale.ts` — `cacheKeyForGlobalScale()`**

Add the three new fields to the cache key (after the existing `lCurveStrength` entry):

```ts
config.lCurveStrengthA ?? '',
config.lCurveStrengthB ?? '',
config.pivotIndex ?? '',
```

### Verification table

Config: `{ lCurveStrengthA: 0.4, lCurveStrengthB: 1.0, pivotIndex: 8 }`

| Index | < pivot? | Resolved strength |
|-------|----------|-------------------|
| 0–7   | yes      | 0.4               |
| 8–13  | no       | 1.0               |

Legacy config `{ lCurveStrength: 0.7 }` → all stops resolve `0.7` (unchanged path).

---

## Feature B: Alpha Token Replacement

### What changes

**`lib/neutral-engine/types.ts` — `AlphaNeutralConfig`**

Widen `alphaStops` from a fixed 4-tuple to a variable-length readonly array:

```ts
export interface AlphaNeutralConfig {
  lightIndexOffset: number
  darkIndexOffset: number
  alphaStops: readonly number[]   // was: readonly [number, number, number, number]
}
```

**`lib/neutral-engine/alphaNeutralTokens.ts`**

Update the default config and the naming expression inside `alphaLines()`:

```ts
export const DEFAULT_ALPHA_NEUTRAL_CONFIG: AlphaNeutralConfig = {
  lightIndexOffset: 0,
  darkIndexOffset: 0,
  alphaStops: [0.04, 0.06, 0.08, 0.12, 0.16, 0.24],  // was [0.08, 0.16, 0.32, 0.48]
}
```

In `alphaLines()`, change the output name from `alpha-${(i + 1) * 100}` to `alpha-${i}`:

```ts
// before
return `  --color-${prefix}-alpha-${(i + 1) * 100}: color-mix(in oklch, ${varRef} ${pct}%, transparent);`

// after
return `  --color-${prefix}-alpha-${i}: color-mix(in oklch, ${varRef} ${pct}%, transparent);`
```

Output produced (light, simple architecture):
```css
--color-neutral-alpha-0: color-mix(in oklch, var(--color-neutral-950)  4%, transparent);
--color-neutral-alpha-1: color-mix(in oklch, var(--color-neutral-950)  6%, transparent);
--color-neutral-alpha-2: color-mix(in oklch, var(--color-neutral-950)  8%, transparent);
--color-neutral-alpha-3: color-mix(in oklch, var(--color-neutral-950) 12%, transparent);
--color-neutral-alpha-4: color-mix(in oklch, var(--color-neutral-950) 16%, transparent);
--color-neutral-alpha-5: color-mix(in oklch, var(--color-neutral-950) 24%, transparent);
```

Dark equivalent uses `--color-dark-neutral-alpha-{0–5}`.

### Injection

No `globals.css` edits are needed. These tokens are dynamically injected into the document via `LiveThemeStyles.tsx` which calls `deriveAlphaNeutralCssLines()`. The rename takes effect automatically on the next ramp build. The static `--color-neutral-alpha-alt-100` and `--color-dark-neutral-alpha-alt-100` in `globals.css` are separate chrome-control aliases and are unaffected.

**Consumer impact:** Any component currently reading `var(--color-neutral-alpha-100)` through `–400` will break. Audit with `grep -r 'neutral-alpha-[1-4]00' components/` before shipping.

### Test updates (`alphaNeutralTokens.test.ts`)

- `'emits 8 CSS lines total (4 light + 4 dark)'` → expect 12 lines (6+6)
- `lightLines` / `darkLines` length assertions: 4 → 6
- Name pattern checks: `neutral-alpha-100` → `neutral-alpha-0`, etc.

---

---

## Feature C: Curve Panel UI

A new "Curve" tab added to the ControlCenterPanel lets users tune `dualLCurvePivot` fields live without touching the main sidebar.

### Tab registration (`ControlCenterPanel.tsx`)

Add `{id: 'curve', label: 'Curve'}` to the `TABS` array. Add `DockPickerTabPersisted` union member `'curve'` to `lib/workbench/dockPickerStorage.ts`. Add a `Tabs.Panel` block (matching existing pattern) rendering `<CurvePanel />`.

### New file: `components/control-center/panel/CurvePanel.tsx`

Layout mirrors `RoleMappingPanel` — two stacked `<section>` blocks (Light, Dark elevated), each containing a card with controls. State reads from `lightScale`/`darkScale` via `useNeutralWorkbenchContext()`; writes use `patchLight` / `patchDark`.

**Per-ramp card contents:**

```
┌─────────────────────────────────────────────────┐
│  L Curve        [ease-in-dark ▾]                │
│                                                  │
│  Pivot index    [ 8 ]   (0 – steps-1)           │
│                                                  │
│  Near stops  0–{pivot-1}  ████████░░░  64%      │
│  Far  stops  {pivot}–end  ████████████ 100%     │
└─────────────────────────────────────────────────┘
```

- **L Curve** — `<ResponsiveSelect>` matching the GlobalScaleSection dropdown; options from `curveOptions` (linear / ease-in-dark / ease-out-light / s-curve). Calls `patchLight('lCurve', v)`.
- **Pivot index** — `<Input type="number">` styled like `roleCellInputClassName`; min 0, max `ladderLightSteps - 1` (or dark equivalent). Calls `patchLight('pivotIndex', clamped)`.
- **Near-stops strength A** — `<Slider>` 0–100. Reads `lightScale.lCurveStrengthA ?? lightScale.lCurveStrength ?? 1`, multiplied × 100. Calls `patchLight('lCurveStrengthA', pct / 100)`. Disabled when `lCurve` is `'linear'`.
- **Far-stops strength B** — same pattern for `lCurveStrengthB`. Calls `patchLight('lCurveStrengthB', pct / 100)`.
- Dark card uses `darkScale` + `patchDark` + `ladderDarkSteps`.

**Slider labels** update dynamically:
- Near: `Stops 0–{pivot - 1}  {valueA}%`
- Far:  `Stops {pivot}–{steps - 1}  {valueB}%`

When `lCurve` is `'linear'`, all three strength/pivot controls are `disabled` (matching the existing GlobalScaleSection popover behavior).

**Component structure:**

```
CurvePanel (memo)
  └─ CurvePanelInner
       ├─ <section aria-labelledby="...">Light ramp</section>
       │    └─ <RampCurveCard theme="light" />
       └─ <section aria-labelledby="...">Dark elevated</section>
            └─ <RampCurveCard theme="dark" />

RampCurveCard({ theme }) — reads/writes one ramp's curve fields
  ├─ L Curve select
  ├─ Pivot index input
  ├─ Strength A slider row
  └─ Strength B slider row
```

`RampCurveCard` is file-private (not exported).

### Reused primitives

- `Slider` from `@/components/ui/slider.tsx`
- `Input` from `@/components/ui/input.tsx`
- `ResponsiveSelect` from `@/components/ui/responsive-select.tsx` (same import as GlobalScaleSection)
- `useNeutralWorkbenchContext` from `@/components/providers/NeutralWorkbenchProvider`
- CSS class constants cloned from `RoleMappingPanel` naming pattern (`panelStackClassName`, `cardClassName`, `sectionHeadingClassName`)

### `dockPickerStorage.ts`

`DockPickerTabPersisted` union currently holds `'roleLadder' | 'oklch' | 'tune' | 'map'`. Add `'curve'`. Default active tab is unchanged (`'roleLadder'`).

---

## Files Modified

| File | Change |
|------|--------|
| `lib/neutral-engine/types.ts` | Add 3 fields to `GlobalScaleConfig`; widen `AlphaNeutralConfig.alphaStops` |
| `lib/neutral-engine/globalScale.ts` | Per-index strength resolution in loop + cache key |
| `lib/neutral-engine/alphaNeutralTokens.ts` | New default stops + index-based name |
| `lib/neutral-engine/alphaNeutralTokens.test.ts` | Update line count + name assertions |
| `lib/workbench/dockPickerStorage.ts` | Add `'curve'` to `DockPickerTabPersisted` union |
| `components/control-center/panel/CurvePanel.tsx` | New file — dual L curve pivot controls |
| `components/control-center/panel/ControlCenterPanel.tsx` | Add Curve tab + panel mount |

---

## Verification Gate

1. `pnpm type-check` exits 0
2. `pnpm test lib/neutral-engine/alphaNeutralTokens` all pass
3. `pnpm test lib/neutral-engine/globalScale` all pass (legacy path unchanged)
4. In the workbench Curve tab: set Strength A = 40%, Strength B = 100%, Pivot = 8 on light ramp → stops 0–7 visually track theme hue; stops 8–13 are flatter/more neutral
5. Legacy config (no A/B fields set) produces identical output to before
6. `grep -r 'neutral-alpha-[1-4]00' components/` — confirm no broken consumers of old names
7. Curve tab persists across panel close/reopen (dockPickerStorage round-trip)
