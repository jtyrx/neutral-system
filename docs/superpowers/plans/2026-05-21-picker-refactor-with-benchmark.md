# Picker Refactor + Benchmark Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `components/picker/` to use a context-based adapter boundary, merge the two settings components, rename files for naming consistency, and complete the `picker-*` semantic utility layer in `picker.css`. Bookend the work with a benchmark baseline (before) and delta score (after) using `/benchmark`.

**Architecture:** `PickerAdapterContext` establishes a provider boundary at `PickerPanel` — orchestration components call `usePickerAdapter()` instead of receiving `adapter` as a prop; pure visualization leaves (`OklchAxisGraph`, `OklchGamutSlice`, `OklchPreviewSwatch`, `PickerRampStrip`) stay prop-driven. `OklchPickerEmbeddedTuneBlocks` and `OklchPickerStandaloneSettings` merge into one `PickerSettingsPanel` component with a `variant` prop, using the already-extracted `OkhslSectionBlock`. `OklchPickerWorkbench` (27-line routing) is inlined into `app/picker/page.tsx` and deleted.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript strict · Tailwind CSS v4

---

## What Changed Since the Original Plan (2026-05-07)

The following work was done after the plan was written — the revised tasks account for it:

| Change | Impact |
|---|---|
| `picker.css` created with 5 utilities | Task 1 adds the 4 missing utilities here, not in `globals.css` |
| `picker-*` names differ from original plan | All substitution tables updated (see mapping below) |
| `OkhslSectionBlock.tsx` extracted | Task 4 imports it instead of defining an inline `OkhslBlock` sub-component |
| Leaf components already use `picker-caption`, `picker-control-row`, `picker-section-divider` | Task 8 skips substitutions that are already done |

**Class name mapping — old plan → actual `picker.css`:**

| Old plan name | Actual name in `picker.css` | Status |
|---|---|---|
| `picker-section` | `picker-section-divider` | ✅ exists |
| `picker-meta` | `picker-caption` | ✅ exists |
| `picker-readout` | `picker-numeric` | ✅ exists |
| `picker-actions` | `picker-control-row` | ✅ exists |
| _(new)_ | `picker-section-header-row` | ✅ exists |
| `picker-section-heading` | `picker-section-heading` | ❌ missing — add in Task 1 |
| `picker-control-stack` | `picker-control-stack` | ❌ missing — add in Task 1 |
| `picker-metadata-grid` | `picker-metadata-grid` | ❌ missing — add in Task 1 |
| `picker-swatch-card` | `picker-swatch-card` | ❌ missing — add in Task 1 |
| `picker-gamut-warning` | `picker-gamut-warning` | ❌ missing — add in Task 1 |

---

## File Map

**Created:**
- `components/picker/PickerAdapterContext.tsx` — context provider + `usePickerAdapter()` hook
- `components/picker/PickerControls.tsx` — replaces `OklchPickerMainBlocks.tsx`
- `components/picker/PickerSettingsPanel.tsx` — merges `OklchPickerEmbeddedTuneBlocks.tsx` + `OklchPickerStandaloneSettings.tsx`
- `components/picker/PickerPanel.tsx` — replaces `OklchPickerPanel.tsx`
- `components/picker/AGENTS.md` — governance doc

**Modified:**
- `.claude/commands/BENCHMARK.md` — fix reference file paths
- `components/picker/picker.css` — add 5 missing utilities
- `app/picker/page.tsx` — absorb routing from `OklchPickerWorkbench`
- `components/workbench/BuilderControlsSections.tsx` — `OklchPickerPanel` → `PickerPanel`
- `components/control-center/panel/TunePanel.tsx` — wrap with `PickerAdapterProvider`, use `PickerSettingsPanel`
- `components/control-center/panel/OklchPanel.tsx` — wrap with `PickerAdapterProvider`, use `PickerControls`
- `components/picker/OklchPreviewSwatch.tsx` — apply remaining `picker-*` classes
- `components/picker/PickerRampStrip.tsx` — apply remaining `picker-*` classes
- `components/picker/OklchGamutSlice.tsx` — apply remaining `picker-*` classes

**Deleted:**
- `components/picker/OklchPickerWorkbench.tsx`
- `components/picker/OklchPickerPanel.tsx`
- `components/picker/OklchPickerMainBlocks.tsx`
- `components/picker/OklchPickerEmbeddedTuneBlocks.tsx`
- `components/picker/OklchPickerStandaloneSettings.tsx`

---

## Task 0: Fix BENCHMARK.md paths + run baseline

**Files:**
- Modify: `.claude/commands/BENCHMARK.md`

The command references `references/categories.md` and `references/output-template.md` using relative paths. Those paths resolve from the repo root at runtime, but the actual files live at `.claude/skills/benchmark-tool/references/`. Fix the paths first, then run the baseline score.

- [ ] **Step 1: Fix the reference paths in BENCHMARK.md**

  Open `.claude/commands/BENCHMARK.md`. Find lines 16–17:
  ```
  Read `references/categories.md` before scoring. Use `references/output-template.md`
  for all output structure.
  ```

  Replace with:
  ```
  Read `.claude/skills/benchmark-tool/references/categories.md` before scoring. Use `.claude/skills/benchmark-tool/references/output-template.md`
  for all output structure.
  ```

- [ ] **Step 2: Run the baseline benchmark**

  ```
  /benchmark components/picker/
  ```

  Save the full output (scores table + findings) to:
  ```
  docs/superpowers/benchmarks/2026-05-21-picker-baseline.md
  ```

  The baseline score is the before-state. Keep it — you'll diff against it in Task 11.

- [ ] **Step 3: Commit**

  ```bash
  git add .claude/commands/BENCHMARK.md docs/superpowers/benchmarks/2026-05-21-picker-baseline.md
  git commit -m "chore(benchmark): fix BENCHMARK.md reference paths; add picker baseline score"
  ```

---

## Task 1: Complete `picker-*` utilities in `picker.css`

**Files:**
- Modify: `components/picker/picker.css`

`picker.css` already exists and is imported in `app/globals.css` at line 10. Add the 5 missing utilities at the end of the file.

- [ ] **Step 1: Append the missing utilities**

  Open `components/picker/picker.css` and append after the last closing brace:

  ```css
  /** Section heading — replaces text-xs font-medium text-default. */
  @utility picker-section-heading {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-default);
  }

  /** Vertical control stack — replaces flex flex-col gap-4. */
  @utility picker-control-stack {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  /** Two-column metadata grid — replaces grid grid-cols-2 gap-3. */
  @utility picker-metadata-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  /** Raised card surface — replaces overflow-hidden rounded-xl border border-hairline bg-raised. */
  @utility picker-swatch-card {
    overflow: hidden;
    border-radius: 0.75rem;
    border: 1px solid var(--chrome-hairline);
    background-color: var(--color-surface-raised);
  }

  /** Out-of-gamut warning badge — amber indicator for P3/rec2020 overflow. */
  @utility picker-gamut-warning {
    border-radius: 0.25rem;
    background-color: color-mix(in oklch, oklch(79% 0.17 70) 20%, transparent);
    padding: 0.125rem 0.375rem;
    font-size: 0.6rem;
    font-weight: 500;
    color: oklch(35% 0.1 70);
  }
  ```

  > **Dark mode for `picker-gamut-warning`:** The `dark:text-amber-200` equivalent needs a `@media` or `[data-theme="dark"]` selector. In Tailwind v4, `@apply dark:text-amber-200` works inside `@utility`. Use:
  > ```css
  > @utility picker-gamut-warning {
  >   /* ... */
  >   @apply dark:text-amber-200;
  > }
  > ```
  > If `@apply` with `dark:` causes a build error, use the raw selector form instead:
  > ```css
  > [data-theme='dark'] .picker-gamut-warning,
  > [data-preview-theme='dark'] .picker-gamut-warning {
  >   color: oklch(88% 0.07 70);
  > }
  > ```

- [ ] **Step 2: Verify dev server compiles**

  ```bash
  pnpm dev
  ```

  Expected: No build errors. Stop the server.

- [ ] **Step 3: Commit**

  ```bash
  git add components/picker/picker.css
  git commit -m "feat(picker): add picker-section-heading, picker-swatch-card, picker-gamut-warning, picker-metadata-grid, picker-control-stack utilities"
  ```

---

## Task 2: Create `PickerAdapterContext.tsx`

**Files:**
- Create: `components/picker/PickerAdapterContext.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  'use client'

  import {createContext, useContext, type ReactNode} from 'react'

  import type {WorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

  const PickerAdapterContext = createContext<WorkbenchAdapter | null>(null)

  export function PickerAdapterProvider({
    adapter,
    children,
  }: {
    adapter: WorkbenchAdapter
    children: ReactNode
  }) {
    return (
      <PickerAdapterContext.Provider value={adapter}>{children}</PickerAdapterContext.Provider>
    )
  }

  export function usePickerAdapter(): WorkbenchAdapter {
    const adapter = useContext(PickerAdapterContext)
    if (!adapter) throw new Error('usePickerAdapter must be used inside PickerAdapterProvider')
    return adapter
  }

  export {PickerAdapterContext}
  ```

- [ ] **Step 2: Type-check**

  ```bash
  pnpm type-check
  ```

  Expected: No new errors.

---

## Task 3: Create `PickerControls.tsx`

Replaces `OklchPickerMainBlocks.tsx`. Reads adapter from context instead of receiving it as a prop. The `layout` prop is kept — it controls responsive dimensions and heading element choice.

**Files:**
- Create: `components/picker/PickerControls.tsx`

- [ ] **Step 1: Read `OklchPickerMainBlocks.tsx` in full**

  Before writing, read the current file to capture any changes made since the plan was written:

  ```bash
  cat components/picker/OklchPickerMainBlocks.tsx
  ```

- [ ] **Step 2: Create `PickerControls.tsx`**

  ```tsx
  'use client'

  import {memo, useCallback, useContext} from 'react'

  import {OklchControls} from '@/components/picker/OklchControls'
  import {OklchGamutSlice} from '@/components/picker/OklchGamutSlice'
  import {OklchPreviewSwatch} from '@/components/picker/OklchPreviewSwatch'
  import {PickerActions} from '@/components/picker/PickerActions'
  import {PickerAdapterContext} from '@/components/picker/PickerAdapterContext'
  import {PickerRampStrip} from '@/components/picker/PickerRampStrip'
  import {PickerSecondaryControls} from '@/components/picker/PickerSecondaryControls'
  import {useDisplayGamut} from '@/hooks/useDisplayGamut'
  import {cn} from '@/lib/utils'

  type Props = {
    /** `page`: full picker layout; `embedded`: inspector aside; `dock`: dock picker tab (compact stack). */
    layout: 'page' | 'embedded' | 'dock'
  }

  function PickerControlsInner({layout}: Props) {
    const adapter = useContext(PickerAdapterContext)!
    const {tier} = useDisplayGamut()

    const simpleArch = adapter.neutralArchitecture === 'simple'
    const activeRampVisual = simpleArch
      ? adapter.global
      : adapter.scaleEditTarget === 'dark'
        ? adapter.darkRamp
        : adapter.lightRamp

    const onSlicePick = useCallback(
      (next: {L: number; C: number}) => {
        adapter.patchPicker(next)
      },
      [adapter],
    )

    const isPage = layout === 'page'
    const isDock = layout === 'dock'
    const sliceW = isPage ? 320 : isDock ? 252 : 280
    const sliceH = isPage ? 240 : isDock ? 168 : 200

    const actionsPickerVariant = layout === 'page' ? 'standalone' : 'embedded'

    const controlsHeading = isPage ? (
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">OKLCH controls</h2>
    ) : (
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">OKLCH controls</p>
    )

    return (
      <>
        <PickerActions
          architecture={adapter.neutralArchitecture}
          globalScale={adapter.globalScale}
          lightScale={adapter.lightScale}
          darkScale={adapter.darkScale}
          pickerOklchCss={adapter.pickerColor.oklchCss}
          adapterMode={adapter.mode}
          variant={actionsPickerVariant}
        />

        <div
          className={cn(
            'grid gap-6',
            isPage ? 'gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : 'grid-cols-1',
          )}
        >
          <div className="space-y-5">
            <section className="space-y-2">
              {controlsHeading}
              <OklchControls
                picker={adapter.picker}
                patchPicker={adapter.patchPicker}
                displayTier={tier}
              />
            </section>
            <PickerSecondaryControls
              secondary={adapter.secondary}
              patchSecondary={adapter.patchSecondary}
            />
          </div>

          <div className="space-y-5">
            <OklchPreviewSwatch
              color={adapter.pickerColor}
              maxChromaInGamut={adapter.maxChromaForPickerLH}
            />
            <OklchGamutSlice
              H={adapter.picker.H}
              picker={adapter.picker}
              displayTier={tier}
              onPick={onSlicePick}
              width={sliceW}
              height={sliceH}
            />
            <PickerRampStrip
              ramp={activeRampVisual}
              caption="Engine ramp (buildGlobalScale · active edit target)"
            />
          </div>
        </div>
      </>
    )
  }

  export const PickerControls = memo(PickerControlsInner)
  PickerControls.displayName = 'PickerControls'
  ```

  > **Important:** If `OklchPickerMainBlocks.tsx` has diverged from the plan (new props, different import paths, etc.), mirror those changes here — don't use stale prop names.

- [ ] **Step 3: Type-check**

  ```bash
  pnpm type-check
  ```

  Expected: No new errors.

---

## Task 4: Create `PickerSettingsPanel.tsx`

Merges `OklchPickerEmbeddedTuneBlocks` and `OklchPickerStandaloneSettings` into one component. Uses the already-extracted `OkhslSectionBlock`. Reads adapter from context.

**Files:**
- Create: `components/picker/PickerSettingsPanel.tsx`

- [ ] **Step 1: Read both source files in full**

  ```bash
  cat components/picker/OklchPickerEmbeddedTuneBlocks.tsx
  cat components/picker/OklchPickerStandaloneSettings.tsx
  ```

  Note every section, prop, import, and class used — the merged component must be a complete superset.

- [ ] **Step 2: Create `PickerSettingsPanel.tsx`**

  ```tsx
  'use client'

  import {memo, useContext} from 'react'

  import {ExportSection} from '@/components/sections/ExportSection'
  import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
  import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
  import {VariantsSection} from '@/components/sections/VariantsSection'
  import {OkhslSectionBlock} from '@/components/picker/OkhslSectionBlock'
  import {PickerAdapterContext} from '@/components/picker/PickerAdapterContext'
  import {Button} from '@/components/ui/button.tsx'
  import {PillChip} from '@/components/ui/chip'
  import {useOklchPickerSectionProps} from '@/hooks/useOklchPickerSectionProps'

  export type PickerSettingsPanelVariant = 'embedded' | 'standalone'

  type Props = {variant: PickerSettingsPanelVariant}

  function PickerSettingsPanelInner({variant}: Props) {
    const adapter = useContext(PickerAdapterContext)!
    const {simpleArch, globalScaleSectionProps, systemMappingSectionProps, exportSectionProps} =
      useOklchPickerSectionProps(adapter)

    if (variant === 'embedded') {
      return (
        <div className="space-y-24 picker-section-divider">
          <GlobalScaleSection {...globalScaleSectionProps} />
          <OkhslSectionBlock
            adapter={adapter}
            id="nsb-picker-embedded-okhsl"
          />
        </div>
      )
    }

    return (
      <div className="space-y-24 picker-section-divider">
        <div>
          <p className="picker-section-heading">Architecture</p>
          <p className="mt-4 picker-caption">
            Simple mirrors one ramp into both themes. Advanced keeps independent light / dark ramps.
          </p>
          <div className="mt-8 flex flex-wrap gap-8">
            <PillChip
              selected={simpleArch}
              tone="amber"
              activeStyle="pill"
              onClick={() => adapter.setNeutralArchitecture('simple')}
            >
              Simple · single ladder
            </PillChip>
            <PillChip
              selected={!simpleArch}
              tone="sky"
              activeStyle="pill"
              onClick={() => adapter.setNeutralArchitecture('advanced')}
            >
              Advanced · sibling ramps
            </PillChip>
          </div>
        </div>

        {!simpleArch ? (
          <div>
            <p className="picker-section-heading">Edit target ramp</p>
            <p className="mt-4 picker-caption">
              Hue variants and OKHSL commits apply here. Picker L/C/H syncs to this ladder.
            </p>
            <div className="mt-8 flex flex-wrap gap-8">
              <PillChip
                selected={adapter.scaleEditTarget === 'light'}
                tone="amber"
                activeStyle="surface-soft"
                onClick={() => adapter.setScaleEditTarget('light')}
              >
                Light ramp
              </PillChip>
              <PillChip
                selected={adapter.scaleEditTarget === 'dark'}
                tone="sky"
                activeStyle="surface-soft"
                onClick={() => adapter.setScaleEditTarget('dark')}
              >
                Dark elevated ramp
              </PillChip>
            </div>
          </div>
        ) : null}

        <GlobalScaleSection {...globalScaleSectionProps} />

        <OkhslSectionBlock
          adapter={adapter}
          id="nsb-picker-controls-okhsl"
        />

        <VariantsSection
          config={adapter.okhslEditableConfig}
          onChange={adapter.setScaleConfigPreset}
        />

        <SystemMappingSection {...systemMappingSectionProps} />

        <div className="picker-section-divider space-y-12">
          <div>
            <p className="picker-section-heading">Alpha neutral base offset</p>
            <p className="mt-4 picker-caption">
              Nudge the alpha token anchor from{' '}
              <code className="font-mono">text.default</code> resolved index. Light base:{' '}
              {adapter.alphaBaseIndices.lightBase} · Dark base: {adapter.alphaBaseIndices.darkBase}
            </p>
          </div>
          <div className="picker-metadata-grid">
            <label className="flex flex-col gap-4">
              <span className="picker-caption">Light offset</span>
              <input
                type="number"
                min={-10}
                max={10}
                value={adapter.alphaConfig.lightIndexOffset}
                onChange={(e) =>
                  adapter.setAlphaConfig((prev) => ({
                    ...prev,
                    lightIndexOffset: Number(e.target.value),
                  }))
                }
                className="w-full rounded border border-hairline bg-(--chrome-field) px-8 py-4 text-right font-mono text-xs"
              />
            </label>
            <label className="flex flex-col gap-4">
              <span className="picker-caption">Dark offset</span>
              <input
                type="number"
                min={-10}
                max={10}
                value={adapter.alphaConfig.darkIndexOffset}
                onChange={(e) =>
                  adapter.setAlphaConfig((prev) => ({
                    ...prev,
                    darkIndexOffset: Number(e.target.value),
                  }))
                }
                className="w-full rounded border border-hairline bg-(--chrome-field) px-8 py-4 text-right font-mono text-xs"
              />
            </label>
          </div>
        </div>

        <ExportSection {...exportSectionProps} />
      </div>
    )
  }

  export const PickerSettingsPanel = memo(PickerSettingsPanelInner)
  PickerSettingsPanel.displayName = 'PickerSettingsPanel'
  ```

  > **Token fix:** `bg-(--chrome-field)` replaces any `bg-(--ns-field)` found in the source files — `--chrome-field` is the canonical alias per `components/ui/AGENTS.md`.
  >
  > **Spacing:** The source files use `space-y-24` (Tailwind spacing scale = 6rem). If the actual value differs, match the source — don't guess.

- [ ] **Step 3: Type-check**

  ```bash
  pnpm type-check
  ```

  Expected: No new errors.

---

## Task 5: Create `PickerPanel.tsx`

Replaces `OklchPickerPanel.tsx`. Provides the `PickerAdapterContext` boundary. Uses `PickerControls` and `PickerSettingsPanel`.

**Files:**
- Create: `components/picker/PickerPanel.tsx`

- [ ] **Step 1: Read `OklchPickerPanel.tsx` in full**

  ```bash
  cat components/picker/OklchPickerPanel.tsx
  ```

  Note any additions since the plan was written (e.g. `picker-control-row` usage already in place).

- [ ] **Step 2: Create `PickerPanel.tsx`**

  ```tsx
  'use client'

  import Link from 'next/link'
  import {Palette} from 'lucide-react'
  import {memo, useMemo} from 'react'

  import {GamutBadge} from '@/components/picker/GamutBadge'
  import {PickerAdapterProvider} from '@/components/picker/PickerAdapterContext'
  import {PickerControls} from '@/components/picker/PickerControls'
  import {PickerSettingsPanel} from '@/components/picker/PickerSettingsPanel'
  import {Button} from '@/components/ui/button.tsx'
  import type {WorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'
  import {useDisplayGamut} from '@/hooks/useDisplayGamut'
  import {cn} from '@/lib/utils'

  export type PickerPanelVariant = 'standalone' | 'embedded'

  type Props = {
    adapter: WorkbenchAdapter
    variant?: PickerPanelVariant
    className?: string
  }

  function PickerPanelInner({adapter, variant = 'standalone', className}: Props) {
    const embedded = variant === 'embedded'
    const {tier} = useDisplayGamut()

    const headerExtras = useMemo(
      () => (
        <>
          <GamutBadge tier={tier} />
          <Button type="button" variant="outline" size="sm" onClick={adapter.resetToDefaults}>
            Reset
          </Button>
        </>
      ),
      [adapter, tier],
    )

    return (
      <PickerAdapterProvider adapter={adapter}>
        <div
          className={cn(
            embedded
              ? 'space-y-5 text-default'
              : 'mx-auto max-w-6xl space-y-6 px-4 py-8 text-default',
            className,
          )}
        >
          {embedded ? (
            <div className="space-y-8">
              <p className="picker-caption">
                Parallel{' '}
                <code className="font-mono">buildGlobalScale</code> surface — does not change live
                theme CSS
                {adapter.mode === 'sandbox' ? ' until you apply below' : ''}.
              </p>
              <div className="picker-control-row">
                {headerExtras}
                <Button type="button" variant="ghost" size="sm" asChild nativeButton={false}>
                  <Link href="/picker">Full-screen picker</Link>
                </Button>
              </div>
            </div>
          ) : (
            <header className="flex flex-col gap-12 border-b border-hairline pb-24 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-12">
                <Palette className="mt-2 size-8 shrink-0 text-muted" aria-hidden />
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    OKLCH picker ·{' '}
                    {adapter.mode === 'live' ? 'live theme' : 'parallel engine surface'}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm text-muted">
                    {adapter.mode === 'live'
                      ? 'Inspect gamut boundaries and tune L / C / H. Changes update CSS variables on this page via the same engine as the main workbench.'
                      : 'Inspect gamut boundaries and tune L / C / H. This sandbox keeps its own config until you send it to the workbench.'}
                  </p>
                </div>
              </div>
              <div className="picker-control-row shrink-0">
                {headerExtras}
                <Button type="button" variant="ghost" size="sm" asChild nativeButton={false}>
                  <Link href="/">Main workbench</Link>
                </Button>
              </div>
            </header>
          )}

          <PickerControls layout={embedded ? 'embedded' : 'page'} />
          <PickerSettingsPanel variant={embedded ? 'embedded' : 'standalone'} />
        </div>
      </PickerAdapterProvider>
    )
  }

  export const PickerPanel = memo(PickerPanelInner)
  PickerPanel.displayName = 'PickerPanel'
  ```

- [ ] **Step 3: Type-check**

  ```bash
  pnpm type-check
  ```

  Expected: No new errors. (Old files still exist — no conflicts yet.)

---

## Task 6: Update external consumers

Four files outside `components/picker/` reference the old component names. Update each one.

**Files:**
- Modify: `app/picker/page.tsx`
- Modify: `components/workbench/BuilderControlsSections.tsx`
- Modify: `components/control-center/panel/TunePanel.tsx`
- Modify: `components/control-center/panel/OklchPanel.tsx`

### 6a — `app/picker/page.tsx`

- [ ] **Step 1: Replace the file content**

  ```tsx
  'use client'

  import {useMemo} from 'react'

  import {PickerPanel} from '@/components/picker/PickerPanel'
  import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
  import {liveWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

  export default function PickerPage() {
    const wb = useNeutralWorkbenchContext()
    const adapter = useMemo(() => liveWorkbenchAdapter(wb), [wb])
    return <PickerPanel adapter={adapter} variant="standalone" />
  }
  ```

### 6b — `components/workbench/BuilderControlsSections.tsx`

- [ ] **Step 1: Update the import**

  Find: `import {OklchPickerPanel} from '@/components/picker/OklchPickerPanel'`
  Replace: `import {PickerPanel} from '@/components/picker/PickerPanel'`

- [ ] **Step 2: Update the JSX**

  Find: `<OklchPickerPanel`
  Replace: `<PickerPanel`

### 6c — `components/control-center/panel/TunePanel.tsx`

- [ ] **Step 1: Replace the file content**

  ```tsx
  'use client'

  import {memo, useMemo} from 'react'

  import {PickerAdapterProvider} from '@/components/picker/PickerAdapterContext'
  import {PickerSettingsPanel} from '@/components/picker/PickerSettingsPanel'
  import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
  import {liveWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

  /** Architecture → scale ladders → OKHSL → variants → mapping → alpha → export (/picker parity). */
  function TunePanelInner() {
    const wb = useNeutralWorkbenchContext()
    const adapter = useMemo(() => liveWorkbenchAdapter(wb), [wb])

    return (
      <div className="cc-panel-stack" data-slot="control-center-panel-tune">
        <PickerAdapterProvider adapter={adapter}>
          <PickerSettingsPanel variant="standalone" />
        </PickerAdapterProvider>
      </div>
    )
  }

  export const TunePanel = memo(TunePanelInner)
  TunePanel.displayName = 'TunePanel'
  ```

### 6d — `components/control-center/panel/OklchPanel.tsx`

- [ ] **Step 1: Read `OklchPanel.tsx` in full before replacing**

  ```bash
  cat components/control-center/panel/OklchPanel.tsx
  ```

  Preserve any additions (e.g. `cc-panel-*` class names, link text, badge usage) that differ from the plan.

- [ ] **Step 2: Replace the file content**

  ```tsx
  'use client'

  import Link from 'next/link'
  import {memo, useMemo} from 'react'

  import {GamutBadge} from '@/components/picker/GamutBadge'
  import {PickerAdapterProvider} from '@/components/picker/PickerAdapterContext'
  import {PickerControls} from '@/components/picker/PickerControls'
  import {Button} from '@/components/ui/button.tsx'
  import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
  import {liveWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'
  import {useDisplayGamut} from '@/hooks/useDisplayGamut'

  /** OKLCH L/C/H sliders, secondary controls, preview swatch, gamut slice, engine ramp strip (live theme). */
  function OklchPanelInner() {
    const wb = useNeutralWorkbenchContext()
    const adapter = useMemo(() => liveWorkbenchAdapter(wb), [wb])
    const {tier} = useDisplayGamut()

    return (
      <div className="cc-panel-stack-spaced" data-slot="control-center-panel-oklch">
        <p className="cc-panel-copy">
          Same OKLCH surface as{' '}
          <Link href="/picker" className="cc-panel-link">
            /picker
          </Link>{' '}
          (live theme). Ramp strip follows the active edit target.
        </p>
        <div className="cc-panel-actions flex-wrap">
          <GamutBadge tier={tier} />
          <Button type="button" variant="outline" size="sm" onClick={adapter.resetToDefaults}>
            Reset
          </Button>
        </div>
        <PickerAdapterProvider adapter={adapter}>
          <PickerControls layout="dock" />
        </PickerAdapterProvider>
      </div>
    )
  }

  export const OklchPanel = memo(OklchPanelInner)
  OklchPanel.displayName = 'OklchPanel'
  ```

- [ ] **Step 3: Type-check all four updated consumers**

  ```bash
  pnpm type-check
  ```

  Expected: No new errors.

---

## Task 7: Delete the five old picker files

All external consumers have been migrated. The old files are now unused.

- [ ] **Step 1: Delete the files**

  ```bash
  git rm \
    components/picker/OklchPickerWorkbench.tsx \
    components/picker/OklchPickerPanel.tsx \
    components/picker/OklchPickerMainBlocks.tsx \
    components/picker/OklchPickerEmbeddedTuneBlocks.tsx \
    components/picker/OklchPickerStandaloneSettings.tsx
  ```

- [ ] **Step 2: Confirm no stale references remain**

  ```bash
  grep -rn "OklchPickerPanel\|OklchPickerMainBlocks\|OklchPickerWorkbench\|OklchPickerEmbeddedTune\|OklchPickerStandalone\|--ns-field" \
    --include="*.tsx" --include="*.ts" --include="*.css" . | grep -v node_modules
  ```

  Expected: No output.

- [ ] **Step 3: Full type-check + lint**

  ```bash
  pnpm type-check && pnpm lint
  ```

  Expected: Zero errors. If a missing-import error appears, grep for the old component name and update the consumer.

- [ ] **Step 4: Smoke test in dev server**

  ```bash
  pnpm dev
  ```

  Open `http://localhost:3000/picker`. Verify:
  - L/C/H sliders move and update the gamut slice and preview swatch
  - Gamut slice click updates L and C
  - "Copy OKLCH" copies to clipboard
  - Architecture selector (Simple / Advanced) toggles
  - OKHSL overlay shows/hides
  - Export section renders

  Open `http://localhost:3000`. Verify:
  - Embedded picker panel renders and L/C/H sliders work
  - "Full-screen picker" link navigates to `/picker`

- [ ] **Step 5: Commit the structural refactor**

  ```bash
  git add \
    app/picker/page.tsx \
    components/picker/PickerAdapterContext.tsx \
    components/picker/PickerControls.tsx \
    components/picker/PickerSettingsPanel.tsx \
    components/picker/PickerPanel.tsx \
    components/workbench/BuilderControlsSections.tsx \
    components/control-center/panel/TunePanel.tsx \
    components/control-center/panel/OklchPanel.tsx
  git commit -m "refactor(picker): context boundary, merged settings panel, rename to PickerPanel/PickerControls"
  ```

---

## Task 8: Apply remaining `picker-*` classes to leaf components

Replace repeated utility strings in leaf components that haven't already been migrated. Check what's already done before touching each file.

**Already done (skip these):**
- `OklchControls.tsx` — already uses `picker-control-row`
- `PickerActions.tsx` — already uses `picker-control-row`
- `PickerSecondaryControls.tsx` — already uses `picker-caption`
- `OklchPreviewSwatch.tsx` — already uses `picker-control-row`

**Files still needing substitutions:**
- Modify: `components/picker/OklchPreviewSwatch.tsx`
- Modify: `components/picker/PickerRampStrip.tsx`
- Modify: `components/picker/OklchGamutSlice.tsx`

### 8a — `OklchPreviewSwatch.tsx`

- [ ] **Step 1: Read the file, then apply substitutions**

  | Find | Replace |
  |------|---------|
  | `overflow-hidden rounded-xl border border-hairline bg-raised` (outer card) | `picker-swatch-card` — append any extra layout classes like `h-24 w-full` |
  | `rounded bg-amber-500/20 px-1.5 py-px text-[0.6rem] font-medium text-amber-900 dark:text-amber-200"` | `picker-gamut-warning` |
  | `font-mono text-[0.65rem] tabular-nums text-muted` (readout spans) | `picker-numeric` |

### 8b — `PickerRampStrip.tsx`

- [ ] **Step 1: Read the file, then apply substitutions**

  | Find | Replace |
  |------|---------|
  | `text-[0.65rem] ...text-muted` (caption text) | `picker-caption` — keep any extra classes like `font-medium tracking-wide` |
  | `overflow-x-auto rounded-xl border border-hairline bg-raised` (ramp container) | `picker-swatch-card overflow-x-auto` — `overflow-x-auto` on same element overrides the `overflow-hidden` from `picker-swatch-card` on the x-axis, which is the intended behavior |

### 8c — `OklchGamutSlice.tsx`

- [ ] **Step 1: Read the file, then apply substitutions**

  | Find | Replace |
  |------|---------|
  | `text-[0.65rem] text-muted` (axis labels) | `picker-caption` |

  > The `rounded-md border border-hairline bg-raised` on the SVG wrapper uses `rounded-md` — intentionally different from `picker-swatch-card`'s `rounded-xl`. Leave it.

- [ ] **Step 2: Type-check and lint**

  ```bash
  pnpm type-check && pnpm lint
  ```

- [ ] **Step 3: Commit**

  ```bash
  git add \
    components/picker/OklchPreviewSwatch.tsx \
    components/picker/PickerRampStrip.tsx \
    components/picker/OklchGamutSlice.tsx
  git commit -m "refactor(picker): apply remaining picker-* semantic classes to leaf components"
  ```

---

## Task 9: Write `components/picker/AGENTS.md`

**Files:**
- Create: `components/picker/AGENTS.md`

- [ ] **Step 1: Create the file**

  ```markdown
  # components/picker — Agent Guidelines

  ## Naming conventions

  - `Oklch*` — components whose logic is specifically OKLCH in nature: axis graph,
    gamut slice, L/C/H slider controls, preview swatch, geometry controls.
  - `Picker*` — structural shells and orchestration that are picker-system-generic:
    panel, controls layout, settings panel, action bar, ramp strip.

  ## Context boundary

  `PickerPanel` is the **only** component that accepts `adapter: WorkbenchAdapter` as
  a prop. It provides the adapter to all descendants via `PickerAdapterContext`.

  **Orchestration components** (`PickerControls`, `PickerSettingsPanel`) call
  `useContext(PickerAdapterContext)` — not `usePickerAdapter()` — to stay explicit.

  **Pure visualization leaves** (`OklchAxisGraph`, `OklchGamutSlice`, `OklchPreviewSwatch`,
  `PickerRampStrip`) stay **prop-driven** — independently testable and portable
  outside the picker context tree.

  When rendering `PickerControls` or `PickerSettingsPanel` outside `PickerPanel`
  (e.g. control-center panels), wrap them with `PickerAdapterProvider` directly:

  ```tsx
  <PickerAdapterProvider adapter={adapter}>
    <PickerControls layout="dock" />
  </PickerAdapterProvider>
  ```

  ## Styling contract

  **`picker-*` semantic classes** live in `components/picker/picker.css`
  (imported globally via `app/globals.css` line 10):

  | Pattern | Class |
  |---------|-------|
  | Section divider (`border-t border-hairline pt-6`) | `picker-section-divider` |
  | Distributed header row (`flex … justify-between`) | `picker-section-header-row` |
  | Section heading (`text-xs font-medium text-default`) | `picker-section-heading` |
  | Caption / meta label (`text-[0.65rem] text-muted`) | `picker-caption` |
  | Monospace readout (`font-mono text-[0.65rem] tabular-nums text-muted`) | `picker-numeric` |
  | Button/badge row (`flex flex-wrap items-center gap-2`) | `picker-control-row` |
  | Vertical control stack (`flex flex-col gap-4`) | `picker-control-stack` |
  | Two-column grid (`grid grid-cols-2 gap-3`) | `picker-metadata-grid` |
  | Raised card surface (`overflow-hidden rounded-xl border border-hairline bg-raised`) | `picker-swatch-card` |
  | Out-of-gamut warning badge | `picker-gamut-warning` |

  **Keep in component files:**
  - Dynamic dimensions on SVG elements (width/height driven by `layout` prop)
  - Responsive grid exceptions (`lg:grid-cols-[...]`)
  - State-driven classes (`data-[highlighted]:`, `focus-visible:ring-*`, `disabled:`)
  - `sm:` breakpoint overrides contextual to the component
  - Interaction cursors (`cursor-crosshair`, `touch-none`)

  **No new `--ns-*` tokens.** Use `--chrome-*` and `--color-*` aliases.
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add components/picker/AGENTS.md
  git commit -m "docs(picker): add AGENTS.md with naming, context, and styling conventions"
  ```

---

## Task 10: Final verification

- [ ] **Step 1: Full verification gate**

  ```bash
  pnpm type-check && pnpm test && pnpm build
  ```

  Expected: All three pass with zero errors.

- [ ] **Step 2: Confirm no old names or legacy tokens remain**

  ```bash
  grep -rn "OklchPickerPanel\|OklchPickerMainBlocks\|OklchPickerWorkbench\|OklchPickerEmbeddedTune\|OklchPickerStandalone\|--ns-field" \
    --include="*.tsx" --include="*.ts" --include="*.css" . | grep -v node_modules
  ```

  Expected: No output.

- [ ] **Step 3: Manual golden-path**

  Run `pnpm dev`. Check:

  **`/picker` page:**
  - [ ] L/C/H sliders update preview swatch and gamut slice
  - [ ] Gamut slice click updates L and C
  - [ ] "Copy OKLCH" copies the `oklch()` string to clipboard
  - [ ] Architecture selector (Simple → Advanced) shows edit-target chips
  - [ ] OKHSL "Show OKHSL" button reveals section; "Hide OKHSL" collapses it
  - [ ] "Reset" button resets to defaults
  - [ ] Export section renders with download buttons
  - [ ] No broken CSS variables (DevTools: number input backgrounds resolve to a color)

  **Main workbench (`/`) — embedded picker:**
  - [ ] Embedded picker panel renders
  - [ ] L/C/H sliders work in embedded mode
  - [ ] "Full-screen picker" link navigates to `/picker`

  **Control-center dock:**
  - [ ] OKLCH panel renders `PickerControls` in dock layout
  - [ ] Tune panel renders `PickerSettingsPanel` in standalone layout

---

## Task 11: Run post-refactor benchmark + record delta

- [ ] **Step 1: Run the benchmark**

  ```
  /benchmark components/picker/
  ```

- [ ] **Step 2: Save the post-refactor score**

  ```
  docs/superpowers/benchmarks/2026-05-21-picker-post-refactor.md
  ```

- [ ] **Step 3: Write the delta summary**

  Add a `## Delta` section to `docs/superpowers/benchmarks/2026-05-21-picker-post-refactor.md`:

  ```markdown
  ## Delta vs Baseline

  | Category | Before | After | Δ |
  |---|---|---|---|
  | 1. Layer Separation | X | X | +X |
  | 2. Server/Client Boundary | X | X | +X |
  | 3. TypeScript Rigor | X | X | +X |
  | 4. Composability & API Design | X | X | +X |
  | 5. Styling Architecture | X | X | +X |
  | 6. Accessibility & Semantics | X | X | +X |
  | 7. Anti-pattern Compliance | X | X | +X |
  | **Aggregate** | **X.X** | **X.X** | **+X.X** |
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add docs/superpowers/benchmarks/2026-05-21-picker-post-refactor.md
  git commit -m "docs(benchmark): add picker post-refactor score and delta"
  ```
