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

## Files Modified

| File | Change |
|------|--------|
| `lib/neutral-engine/types.ts` | Add 3 fields to `GlobalScaleConfig`; widen `AlphaNeutralConfig.alphaStops` |
| `lib/neutral-engine/globalScale.ts` | Per-index strength resolution in loop + cache key |
| `lib/neutral-engine/alphaNeutralTokens.ts` | New default stops + index-based name |
| `lib/neutral-engine/alphaNeutralTokens.test.ts` | Update line count + name assertions |

---

## Verification Gate

1. `pnpm type-check` exits 0
2. `pnpm test lib/neutral-engine/alphaNeutralTokens` all pass
3. `pnpm test lib/neutral-engine/globalScale` all pass (legacy path unchanged)
4. In the workbench, set `{ lCurveStrengthA: 0.4, lCurveStrengthB: 1.0, pivotIndex: 8 }`: stops 0–7 should visually track the theme hue; stops 8–13 should be flatter/more neutral
5. Legacy config (no A/B fields) should produce identical output to before
6. `grep -r 'neutral-alpha-[1-4]00' components/` — confirm no component consumers of old names remain
