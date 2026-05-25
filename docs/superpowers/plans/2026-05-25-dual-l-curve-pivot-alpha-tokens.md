# Dual L Curve Pivot + Alpha Token Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-segment lightness curve strength (dualLCurvePivot) to the neutral palette engine, replace alpha token naming/stops, and expose a live Curve panel in the ControlCenter dock.

**Architecture:** Three sequential layers — engine types/logic first, then storage, then UI. Engine changes are pure/tested; UI reads from the existing workbench context via `patchLight`/`patchDark`. The alpha rename is a hard cut with no alias bridge.

**Tech Stack:** TypeScript strict · colorjs.io · React 19 · vitest · Tailwind CSS v4 · Base UI · pnpm

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/neutral-engine/types.ts` | Modify | Add 3 `GlobalScaleConfig` fields; widen `AlphaNeutralConfig.alphaStops` |
| `lib/neutral-engine/globalScale.ts` | Modify | Per-index strength resolution in loop + cache key |
| `lib/neutral-engine/alphaNeutralTokens.ts` | Modify | New 6-stop defaults + index-based CSS var name |
| `lib/neutral-engine/alphaNeutralTokens.test.ts` | Modify | Update line counts, name assertions |
| `lib/workbench/dockPickerStorage.ts` | Modify | Add `'curve'` to `DockPickerTabPersisted` union + `coerceTab` guard |
| `components/control-center/panel/CurvePanel.tsx` | Create | Dual-strength sliders + pivot input per ramp |
| `components/control-center/panel/ControlCenterPanel.tsx` | Modify | Register Curve tab + mount `<CurvePanel />` |

---

## Task 1: Add fields to `GlobalScaleConfig` and widen `AlphaNeutralConfig.alphaStops`

**Files:**
- Modify: `lib/neutral-engine/types.ts`

- [ ] **Step 1: Open `types.ts` and add three optional fields to `GlobalScaleConfig` after the existing `lCurveStrength` field (around line 42)**

  Replace the existing `lCurveStrength` block:

  ```ts
  /**
   * Blend from linear lightness spacing into the curve from `lCurve`.
   * `0` = fully linear ramp; `1` = full selected curve. Defaults to `1` when omitted.
   */
  lCurveStrength?: number | undefined
  /**
   * Per-segment curve strength. When either A or B is set, the ramp is split at `pivotIndex`.
   * Stops with index `< pivotIndex` use `lCurveStrengthA`; stops `>= pivotIndex` use `lCurveStrengthB`.
   * Falls back to `lCurveStrength` when a segment value is undefined.
   */
  lCurveStrengthA?: number | undefined
  lCurveStrengthB?: number | undefined
  /** Absolute stop index splitting A and B segments. Defaults to `8`. */
  pivotIndex?: number | undefined
  ```

- [ ] **Step 2: Widen `AlphaNeutralConfig.alphaStops` from a fixed 4-tuple to `readonly number[]` (around line 211)**

  ```ts
  export interface AlphaNeutralConfig {
    lightIndexOffset: number
    darkIndexOffset: number
    alphaStops: readonly number[]
  }
  ```

- [ ] **Step 3: Verify types compile**

  ```bash
  pnpm type-check
  ```

  Expected: exits 0 (no new errors introduced).

- [ ] **Step 4: Commit**

  ```bash
  git add lib/neutral-engine/types.ts
  git commit -m "feat(engine): add lCurveStrengthA/B, pivotIndex to GlobalScaleConfig; widen alphaStops"
  ```

---

## Task 2: Per-index strength resolution in `buildGlobalScale`

**Files:**
- Modify: `lib/neutral-engine/globalScale.ts`

- [ ] **Step 1: Update `cacheKeyForGlobalScale` to include the three new fields**

  In `cacheKeyForGlobalScale` (line ~105), the array currently ends with:

  ```ts
    config.hueDark ?? '',
  ].join('|')
  ```

  Change it to:

  ```ts
    config.hueDark ?? '',
    config.lCurveStrengthA ?? '',
    config.lCurveStrengthB ?? '',
    config.pivotIndex ?? '',
  ].join('|')
  ```

- [ ] **Step 2: Replace the static `config.lCurveStrength` argument inside the `for` loop**

  The loop is at line ~174. Line 177 currently reads:

  ```ts
  const L = easeL(lHigh, lLow, t, config.lCurve, config.lCurveStrength)
  ```

  Replace it with:

  ```ts
  const pivot = config.pivotIndex ?? 8
  const useDual = config.lCurveStrengthA !== undefined || config.lCurveStrengthB !== undefined
  const strength = useDual
    ? (i < pivot ? (config.lCurveStrengthA ?? config.lCurveStrength) : (config.lCurveStrengthB ?? config.lCurveStrength))
    : config.lCurveStrength
  const L = easeL(lHigh, lLow, t, config.lCurve, strength)
  ```

  `i` is the raw output-position loop counter. It is not affected by the `dark-to-light` direction flip — `t` is flipped, but `i` always runs 0 → n-1, matching swatch index as shown in the UI.

- [ ] **Step 3: Run the existing globalScale tests to confirm the legacy path is unchanged**

  ```bash
  pnpm test lib/neutral-engine/globalScale
  ```

  Expected: all existing tests pass.

- [ ] **Step 4: Verify types compile**

  ```bash
  pnpm type-check
  ```

  Expected: exits 0.

- [ ] **Step 5: Commit**

  ```bash
  git add lib/neutral-engine/globalScale.ts
  git commit -m "feat(engine): per-index lCurveStrength resolution with dualLCurvePivot"
  ```

---

## Task 3: Update alpha token stops and naming

**Files:**
- Modify: `lib/neutral-engine/alphaNeutralTokens.ts`

- [ ] **Step 1: Update `DEFAULT_ALPHA_NEUTRAL_CONFIG` stops**

  ```ts
  export const DEFAULT_ALPHA_NEUTRAL_CONFIG: AlphaNeutralConfig = {
    lightIndexOffset: 0,
    darkIndexOffset: 0,
    alphaStops: [0.04, 0.06, 0.08, 0.12, 0.16, 0.24],
  }
  ```

- [ ] **Step 2: Change the CSS var name in `alphaLines` from `alpha-${(i + 1) * 100}` to `alpha-${i}`**

  The `return` statement inside `alphaLines` currently reads:

  ```ts
  return `  --color-${prefix}-alpha-${(i + 1) * 100}: color-mix(in oklch, ${varRef} ${pct}%, transparent);`
  ```

  Change to:

  ```ts
  return `  --color-${prefix}-alpha-${i}: color-mix(in oklch, ${varRef} ${pct}%, transparent);`
  ```

- [ ] **Step 3: Audit for broken consumers of old alpha-100/–400 names**

  ```bash
  grep -r 'neutral-alpha-[1-4]00' components/ app/ hooks/ lib/
  ```

  Expected: zero matches. If any appear, update them to use the new `alpha-0` through `alpha-5` names before continuing.

- [ ] **Step 4: Verify types compile**

  ```bash
  pnpm type-check
  ```

  Expected: exits 0.

- [ ] **Step 5: Commit**

  ```bash
  git add lib/neutral-engine/alphaNeutralTokens.ts
  git commit -m "feat(engine): replace alpha token naming alpha-N and stops [0.04,0.06,0.08,0.12,0.16,0.24]"
  ```

---

## Task 4: Update alpha token tests

**Files:**
- Modify: `lib/neutral-engine/alphaNeutralTokens.test.ts`

- [ ] **Step 1: Run the existing tests first to see them fail**

  ```bash
  pnpm test lib/neutral-engine/alphaNeutralTokens
  ```

  Expected: failures on line-count assertions (8 → expecting 12) and name-pattern checks.

- [ ] **Step 2: Update the test file**

  Replace the `deriveAlphaNeutralCssLines` describe block with:

  ```ts
  describe('deriveAlphaNeutralCssLines', () => {
    const global = Array.from({length: 41}, (_, i) => makeSwatch(i, String(i * 25)))
    const dark = Array.from({length: 41}, (_, i) => makeSwatch(i, String(i * 25)))
    const ramps: ArchitectureRamps = {architecture: 'simple', global, dark}
    const lightTokens = [makeToken('text.default', 38)]
    const darkTokens = [makeToken('text.default', 3)]
    const config = DEFAULT_ALPHA_NEUTRAL_CONFIG

    it('emits 12 CSS lines total (6 light + 6 dark)', () => {
      const lines = deriveAlphaNeutralCssLines(ramps, lightTokens, darkTokens, config)
      expect(lines).toHaveLength(12)
    })

    it('light alpha lines reference the light base primitive', () => {
      const lines = deriveAlphaNeutralCssLines(ramps, lightTokens, darkTokens, config)
      const lightLines = lines.filter(l => l.includes('--color-neutral-alpha'))
      expect(lightLines).toHaveLength(6)
      // index 38 * 25 = 950, so label is "950" → var(--color-neutral-950)
      lightLines.forEach(l => expect(l).toContain('var(--color-neutral-950)'))
    })

    it('light alpha lines use index-based names alpha-0 through alpha-5', () => {
      const lines = deriveAlphaNeutralCssLines(ramps, lightTokens, darkTokens, config)
      const lightLines = lines.filter(l => l.includes('--color-neutral-alpha'))
      expect(lightLines[0]).toContain('--color-neutral-alpha-0')
      expect(lightLines[5]).toContain('--color-neutral-alpha-5')
    })

    it('dark alpha lines reference the dark base primitive', () => {
      const lines = deriveAlphaNeutralCssLines(ramps, lightTokens, darkTokens, config)
      const darkLines = lines.filter(l => l.includes('--color-dark-neutral-alpha'))
      expect(darkLines).toHaveLength(6)
      // index 3 * 25 = 75, so label is "75" → var(--color-neutral-75)
      darkLines.forEach(l => expect(l).toContain('var(--color-neutral-75)'))
    })

    it('dark alpha lines use index-based names alpha-0 through alpha-5', () => {
      const lines = deriveAlphaNeutralCssLines(ramps, lightTokens, darkTokens, config)
      const darkLines = lines.filter(l => l.includes('--color-dark-neutral-alpha'))
      expect(darkLines[0]).toContain('--color-dark-neutral-alpha-0')
      expect(darkLines[5]).toContain('--color-dark-neutral-alpha-5')
    })

    it('uses color-mix for alpha blending', () => {
      const lines = deriveAlphaNeutralCssLines(ramps, lightTokens, darkTokens, config)
      lines.forEach(l => expect(l).toContain('color-mix(in oklch'))
    })

    it('advanced dark alpha lines reference the black-first dark source label directly', () => {
      const lightRamp = Array.from({length: 4}, (_, i) => makeSwatch(i, String(i)))
      const darkRamp = Array.from({length: 4}, (_, i) => makeSwatch(i, String(i)))
      const advanced: ArchitectureRamps = {architecture: 'advanced', light: lightRamp, dark: darkRamp}
      const lines = deriveAlphaNeutralCssLines(
        advanced,
        [makeToken('text.default', 2)],
        [makeToken('text.default', 2)],
        config,
      )

      const darkLines = lines.filter(l => l.includes('--color-dark-neutral-alpha'))
      expect(darkLines).toHaveLength(6)
      darkLines.forEach(l => expect(l).toContain('var(--color-neutral-dark-2)'))
    })
  })
  ```

- [ ] **Step 3: Run tests to confirm they pass**

  ```bash
  pnpm test lib/neutral-engine/alphaNeutralTokens
  ```

  Expected: all tests pass.

- [ ] **Step 4: Commit**

  ```bash
  git add lib/neutral-engine/alphaNeutralTokens.test.ts
  git commit -m "test(engine): update alpha token tests for 6-stop index-based naming"
  ```

---

## Task 5: Add `'curve'` to `DockPickerTabPersisted`

**Files:**
- Modify: `lib/workbench/dockPickerStorage.ts`

- [ ] **Step 1: Extend the `DockPickerTabPersisted` union**

  ```ts
  export type DockPickerTabPersisted =
    | 'roleLadder'
    | 'oklch'
    | 'tune'
    | 'map'
    | 'curve'
  ```

- [ ] **Step 2: Add `'curve'` to the `coerceTab` guard**

  ```ts
  function coerceTab(v: unknown): DockPickerTabPersisted | null {
    if (v === 'roleLadder' || v === 'oklch' || v === 'tune' || v === 'map' || v === 'curve') return v
    /* Merged picker tabs → single Role ladder panel */
    if (typeof v === 'string' && LEGACY_MERGED_TO_ROLE_LADDER.has(v)) {
      return 'roleLadder'
    }
    return null
  }
  ```

- [ ] **Step 3: Verify types**

  ```bash
  pnpm type-check
  ```

  Expected: exits 0.

- [ ] **Step 4: Commit**

  ```bash
  git add lib/workbench/dockPickerStorage.ts
  git commit -m "feat(storage): add 'curve' tab to DockPickerTabPersisted"
  ```

---

## Task 6: Create `CurvePanel.tsx`

**Files:**
- Create: `components/control-center/panel/CurvePanel.tsx`

- [ ] **Step 1: Create the file with the following complete implementation**

  ```tsx
  'use client'

  import {Moon, Sun} from 'lucide-react'
  import {memo, type ChangeEvent} from 'react'

  import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
  import {Input} from '@/components/ui/input.tsx'
  import {
    ResponsiveSelect,
  } from '@/components/ui/responsive-select.tsx'
  import {Slider} from '@/components/ui/slider.tsx'
  import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
  import type {GlobalScaleConfig, LCurve} from '@/lib/neutral-engine/types'

  const CURVE_OPTIONS: {value: LCurve; label: string}[] = [
    {value: 'linear', label: 'Linear'},
    {value: 'ease-in-dark', label: 'Ease into dark'},
    {value: 'ease-out-light', label: 'Ease out light'},
    {value: 's-curve', label: 'S-curve'},
  ]

  const panelStackClassName = 'flex flex-col gap-12 px-4 pb-12'
  const panelSectionClassName = 'flex flex-col gap-8'
  const sectionHeadingClassName =
    'text-xs leading-[1.3] tracking-normal text-muted [text-box:trim-both_cap_alphabetic]'
  const cardClassName =
    'rounded-xl border border-[color-mix(in_oklch,var(--chrome-hairline)_80%,transparent)] bg-[color-mix(in_oklch,var(--muted)_20%,transparent)] px-16 py-12 shadow-sm'
  const cardTitleClassName = 'mb-12 text-[0.8125rem] leading-[1.3] font-medium text-foreground'
  const fieldRowClassName = 'flex flex-col gap-6'
  const fieldLabelClassName = 'text-xs leading-4 text-muted'
  const fieldValueClassName = 'tabular-nums font-medium text-foreground'
  const pivotInputClassName =
    'h-32 min-h-32 w-56 min-w-56 shrink-0 [appearance:textfield] rounded-full border border-[color-mix(in_oklch,var(--chrome-hairline)_90%,transparent)] bg-[color-mix(in_oklch,var(--muted)_35%,transparent)] px-6 text-center font-mono text-xs leading-4 text-foreground tabular-nums shadow-none outline-none transition-[color,background-color,border-color,box-shadow] hover:bg-[color-mix(in_oklch,var(--muted)_50%,transparent)] focus-visible:border-ring focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--ring)_35%,transparent)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
  const pivotRowClassName = 'flex items-center gap-12'
  const pivotLabelClassName = 'flex-1 text-xs leading-4 text-muted'
  const themeHeadingClassName =
    'mb-10 flex items-center gap-6 text-xs leading-4 font-medium text-foreground'

  type RampTheme = 'light' | 'dark'

  function RampCurveCard({theme}: {theme: RampTheme}) {
    const {
      lightScale,
      darkScale,
      patchLight,
      patchDark,
      ladderLightSteps,
      ladderDarkSteps,
    } = useNeutralWorkbenchContext()

    const config = theme === 'light' ? lightScale : darkScale
    const patch = theme === 'light' ? patchLight : patchDark
    const steps = clampGlobalScaleSteps(
      theme === 'light' ? ladderLightSteps : ladderDarkSteps,
    )

    const isLinear = (config.lCurve ?? 'linear') === 'linear'
    const pivot = config.pivotIndex ?? 8
    const safeMax = Math.max(0, steps - 1)
    const safePivot = Math.min(pivot, safeMax)

    const strengthA = Math.round((config.lCurveStrengthA ?? config.lCurveStrength ?? 1) * 100)
    const strengthB = Math.round((config.lCurveStrengthB ?? config.lCurveStrength ?? 1) * 100)

    const Icon = theme === 'light' ? Sun : Moon
    const themeLabel = theme === 'light' ? 'Light ramp' : 'Dark elevated'

    const handlePivotChange = (e: ChangeEvent<HTMLInputElement>) => {
      const raw = Number(e.target.value)
      if (!Number.isFinite(raw)) return
      patch('pivotIndex', Math.min(safeMax, Math.max(0, Math.round(raw))))
    }

    return (
      <div className={cardClassName} data-slot={`curve-card-${theme}`}>
        <div className={themeHeadingClassName}>
          <Icon className="size-14 shrink-0 opacity-80" aria-hidden />
          {themeLabel}
        </div>

        <div className="flex flex-col gap-16">
          {/* L Curve selector */}
          <div className={fieldRowClassName}>
            <span className={fieldLabelClassName}>L curve</span>
            <ResponsiveSelect
              id={`curve-panel-${theme}-lcurve`}
              className="h-32 w-full py-4 text-xs"
              value={config.lCurve ?? 'linear'}
              options={CURVE_OPTIONS}
              onValueChange={(v) => patch('lCurve', v as LCurve)}
            />
          </div>

          {/* Pivot index */}
          <div className={fieldRowClassName}>
            <span className={fieldLabelClassName}>Pivot index</span>
            <div className={pivotRowClassName}>
              <Input
                id={`curve-panel-${theme}-pivot`}
                type="number"
                aria-label={`${themeLabel} pivot index`}
                inputMode="numeric"
                min={0}
                max={safeMax}
                step={1}
                disabled={isLinear}
                className={pivotInputClassName}
                value={safePivot}
                onChange={handlePivotChange}
                variant="workbench"
              />
              <span className={pivotLabelClassName}>
                splits at stop {safePivot} of {steps}
              </span>
            </div>
          </div>

          {/* Strength A — near stops */}
          <div className={fieldRowClassName}>
            <div className="flex items-baseline justify-between gap-4">
              <span className={fieldLabelClassName}>
                Near stops 0–{Math.max(0, safePivot - 1)}
              </span>
              <span className={fieldValueClassName}>{strengthA}%</span>
            </div>
            <Slider
              disabled={isLinear}
              min={0}
              max={100}
              step={1}
              value={[strengthA]}
              onValueChange={([pct]) => {
                if (typeof pct === 'number') patch('lCurveStrengthA', pct / 100)
              }}
              aria-label={`${themeLabel} near-stops curve strength`}
            />
          </div>

          {/* Strength B — far stops */}
          <div className={fieldRowClassName}>
            <div className="flex items-baseline justify-between gap-4">
              <span className={fieldLabelClassName}>
                Far stops {safePivot}–{safeMax}
              </span>
              <span className={fieldValueClassName}>{strengthB}%</span>
            </div>
            <Slider
              disabled={isLinear}
              min={0}
              max={100}
              step={1}
              value={[strengthB]}
              onValueChange={([pct]) => {
                if (typeof pct === 'number') patch('lCurveStrengthB', pct / 100)
              }}
              aria-label={`${themeLabel} far-stops curve strength`}
            />
          </div>
        </div>
      </div>
    )
  }

  function CurvePanelInner() {
    return (
      <div className={panelStackClassName} data-slot="control-center-panel-curve">
        <section
          aria-labelledby="curve-panel-light-heading"
          className={panelSectionClassName}
        >
          <h3 id="curve-panel-light-heading" className={sectionHeadingClassName}>
            Light ramp
          </h3>
          <RampCurveCard theme="light" />
        </section>

        <section
          aria-labelledby="curve-panel-dark-heading"
          className={panelSectionClassName}
        >
          <h3 id="curve-panel-dark-heading" className={sectionHeadingClassName}>
            Dark elevated
          </h3>
          <RampCurveCard theme="dark" />
        </section>
      </div>
    )
  }

  CurvePanelInner.displayName = 'CurvePanel'

  export const CurvePanel = memo(CurvePanelInner)
  CurvePanel.displayName = 'CurvePanel'
  ```

- [ ] **Step 2: Verify types**

  ```bash
  pnpm type-check
  ```

  Expected: exits 0.

- [ ] **Step 3: Commit**

  ```bash
  git add components/control-center/panel/CurvePanel.tsx
  git commit -m "feat(ui): CurvePanel — dual L curve pivot controls per ramp"
  ```

---

## Task 7: Wire the Curve tab into `ControlCenterPanel`

**Files:**
- Modify: `components/control-center/panel/ControlCenterPanel.tsx`

- [ ] **Step 1: Add the `CurvePanel` import**

  Add after the `TunePanel` import line:

  ```ts
  import {CurvePanel} from '@/components/control-center/panel/CurvePanel'
  ```

- [ ] **Step 2: Add `'curve'` to the `TABS` array**

  ```ts
  const TABS: TabDef[] = [
    {id: 'roleLadder', label: 'Role ladder'},
    {id: 'oklch', label: 'OKLCH'},
    {id: 'tune', label: 'Tune'},
    {id: 'map', label: 'Map'},
    {id: 'curve', label: 'Curve'},
  ]
  ```

- [ ] **Step 3: Add the `Tabs.Panel` block for `'curve'` inside `PanelBody`**

  Add after the closing `</Tabs.Panel>` for `'map'` (before `</Tabs.Root>`):

  ```tsx
  <Tabs.Panel
    value="curve"
    id="dock-picker-tabpanel-curve"
    data-slot="dock-picker-tabpanel"
    data-tab-id="curve"
    className={tabPanelClassName}
  >
    <div data-slot="tabpanel-inner">
      <CurvePanel />
    </div>
  </Tabs.Panel>
  ```

- [ ] **Step 4: Verify types**

  ```bash
  pnpm type-check
  ```

  Expected: exits 0.

- [ ] **Step 5: Commit**

  ```bash
  git add components/control-center/panel/ControlCenterPanel.tsx
  git commit -m "feat(ui): register Curve tab in ControlCenterPanel"
  ```

---

## Task 8: End-to-end verification

- [ ] **Step 1: Run full test suite**

  ```bash
  pnpm test
  ```

  Expected: all tests pass.

- [ ] **Step 2: Type-check**

  ```bash
  pnpm type-check
  ```

  Expected: exits 0.

- [ ] **Step 3: Build**

  ```bash
  pnpm build
  ```

  Expected: exits 0, no type errors.

- [ ] **Step 4: Start dev server and manually verify the Curve tab**

  ```bash
  pnpm dev
  ```

  Open the app → open the ControlCenter dock → click **Curve** tab.

  Verify:
  - Light ramp and Dark elevated cards are both visible.
  - L Curve dropdown shows the current curve (default: ease-in-dark for light, ease-out-light for dark).
  - When L Curve is `Linear`, pivot input and both strength sliders are disabled.
  - Set light ramp to `ease-in-dark`, Strength A = 40%, Strength B = 100%, Pivot = 8 → the ramp strip in the preview panel updates live; stops 0–7 show more curve influence (theme-proximate) and stops 8+ are full curve.
  - Close and reopen the panel — the Curve tab is still active (persistence via dockPickerStorage).

- [ ] **Step 5: Verify legacy single-strength path still works**

  In the Tune tab, confirm that ramps using only `lCurveStrength` (no A/B) render identically to before — the Curve tab controls should start neutral (A and B both reading the legacy `lCurveStrength` value).

- [ ] **Step 6: Verify alpha token rename**

  In browser DevTools → Elements → `:root` computed styles, confirm:
  - `--color-neutral-alpha-0` exists at ~4% opacity.
  - `--color-neutral-alpha-5` exists at ~24% opacity.
  - No `--color-neutral-alpha-100` through `-400` appear.
