# Picker Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor `components/picker/` to use a context-based adapter boundary, merge the two settings components, rename files for naming consistency, and extract repeated Tailwind patterns into `picker-*` semantic utilities in `globals.css`.

**Architecture:** `PickerAdapterContext` establishes a provider boundary at `PickerPanel` — orchestration components call `usePickerAdapter()` instead of receiving `adapter` as a prop; pure visualization leaves (`OklchAxisGraph`, `OklchGamutSlice`, `OklchPreviewSwatch`, `PickerRampStrip`) stay prop-driven. `OklchPickerEmbeddedTuneBlocks` and `OklchPickerStandaloneSettings` merge into one `PickerSettingsPanel` component with a `variant` prop. `OklchPickerWorkbench` (27-line routing) is inlined into `app/picker/page.tsx` and deleted.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4 (`@utility` + `@apply`)

---

## File Map

**Created:**
- `components/picker/PickerAdapterContext.tsx` — context provider + `usePickerAdapter()` hook
- `components/picker/PickerControls.tsx` — replaces `OklchPickerMainBlocks.tsx`
- `components/picker/PickerSettingsPanel.tsx` — merges `OklchPickerEmbeddedTuneBlocks.tsx` + `OklchPickerStandaloneSettings.tsx`
- `components/picker/PickerPanel.tsx` — replaces `OklchPickerPanel.tsx`
- `components/picker/AGENTS.md` — governance doc

**Modified:**
- `app/globals.css` — add 9 `picker-*` `@utility` classes
- `app/picker/page.tsx` — absorb routing from `OklchPickerWorkbench`
- `components/workbench/BuilderControlsSections.tsx` — rename `OklchPickerPanel` → `PickerPanel`
- `components/control-center/panel/TunePanel.tsx` — wrap with `PickerAdapterProvider`, use `PickerSettingsPanel`
- `components/control-center/panel/OklchPanel.tsx` — wrap with `PickerAdapterProvider`, use `PickerControls`
- `components/picker/OklchControls.tsx` — apply `picker-*` classes
- `components/picker/OklchPreviewSwatch.tsx` — apply `picker-*` classes
- `components/picker/PickerRampStrip.tsx` — apply `picker-*` classes
- `components/picker/OklchGamutSlice.tsx` — apply `picker-*` classes
- `components/picker/PickerActions.tsx` — apply `picker-*` classes
- `components/picker/PickerSecondaryControls.tsx` — apply `picker-*` classes
- `components/picker/GamutBadge.tsx` — apply `picker-*` classes if applicable

**Deleted:**
- `components/picker/OklchPickerWorkbench.tsx`
- `components/picker/OklchPickerPanel.tsx`
- `components/picker/OklchPickerMainBlocks.tsx`
- `components/picker/OklchPickerEmbeddedTuneBlocks.tsx`
- `components/picker/OklchPickerStandaloneSettings.tsx`

---

## Task 1: Add `picker-*` utilities to `globals.css`

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Find the insertion point in globals.css**

  Open `app/globals.css`. Find the last `@utility` block in the `ns-*` section (around line 840, after `@utility ns-pill`). The new `picker-*` utilities go after that block, before the `@utility text-trim-both` line.

- [ ] **Step 2: Insert the picker-* utility block**

  Add after the `@utility ns-pill { ... }` closing brace:

  ```css
  /* ─── Picker semantic utilities ─────────────────────────────── */

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
    /* dark: works inside @apply in Tailwind v4 */
    @apply rounded bg-amber-500/20 px-1.5 py-px text-[0.6rem] font-medium text-amber-900 dark:text-amber-200;
  }
  ```

- [ ] **Step 3: Verify dev server still compiles**

  Run: `pnpm dev`
  Expected: No build errors in the terminal. Stop the server.

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
  ```

- [ ] **Step 2: Type-check**

  Run: `pnpm type-check`
  Expected: No new errors.

---

## Task 3: Create `PickerControls.tsx`

Replaces `OklchPickerMainBlocks.tsx`. Reads adapter from context instead of receiving it as a prop. The `layout` prop is kept — it controls responsive dimensions and heading element choice.

**Files:**
- Create: `components/picker/PickerControls.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  'use client'

  import {memo, useCallback} from 'react'

  import {OklchControls} from '@/components/picker/OklchControls'
  import {OklchGamutSlice} from '@/components/picker/OklchGamutSlice'
  import {OklchPreviewSwatch} from '@/components/picker/OklchPreviewSwatch'
  import {PickerActions} from '@/components/picker/PickerActions'
  import {PickerAdapterContext} from '@/components/picker/PickerAdapterContext'
  import {PickerRampStrip} from '@/components/picker/PickerRampStrip'
  import {PickerSecondaryControls} from '@/components/picker/PickerSecondaryControls'
  import {useDisplayGamut} from '@/hooks/useDisplayGamut'
  import {cn} from '@/lib/utils'
  import {useContext} from 'react'

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
  ```

  > **Note:** `useContext(PickerAdapterContext)!` uses a non-null assertion because `PickerAdapterContext` is imported directly. Alternatively import `usePickerAdapter` from `PickerAdapterContext.tsx` — both are correct. The `!` is safe because `PickerPanel` always wraps the tree with `PickerAdapterProvider`.

- [ ] **Step 2: Type-check**

  Run: `pnpm type-check`
  Expected: No new errors.

---

## Task 4: Create `PickerSettingsPanel.tsx`

Merges `OklchPickerEmbeddedTuneBlocks` and `OklchPickerStandaloneSettings` into one component. Reads adapter from context. Applies `picker-*` classes to replace repeated utility strings.

**Files:**
- Create: `components/picker/PickerSettingsPanel.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  'use client'

  import {memo, useContext} from 'react'

  import {ExportSection} from '@/components/sections/ExportSection'
  import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
  import {OkhslSection} from '@/components/sections/OkhslSection'
  import {SystemMappingSection} from '@/components/sections/SystemMappingSection'
  import {VariantsSection} from '@/components/sections/VariantsSection'
  import {Button} from '@/components/ui/button'
  import {PillChip} from '@/components/ui/chip'
  import {PickerAdapterContext} from '@/components/picker/PickerAdapterContext'
  import {DEFAULT_GLOBAL} from '@/hooks/useNeutralWorkbench'
  import {useOklchPickerSectionProps} from '@/hooks/useOklchPickerSectionProps'

  export type PickerSettingsPanelVariant = 'embedded' | 'standalone'

  type Props = {variant: PickerSettingsPanelVariant}

  function OkhslBlock({id, className}: {id: string; className?: string}) {
    const adapter = useContext(PickerAdapterContext)!
    return (
      <div id={id} className={className}>
        <div className="picker-actions justify-between">
          <div>
            <p className="picker-section-heading">OKHSL authoring overlay</p>
            <p className="text-xs text-muted">
              Edit via gamut-relative coordinates. Commits back to OKLCH config.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {adapter.okhslEnabled ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  adapter.setScaleConfigPreset(
                    (cfg) => ({
                      ...cfg,
                      hue: DEFAULT_GLOBAL.hue,
                      lHigh: DEFAULT_GLOBAL.lHigh,
                      lLow: DEFAULT_GLOBAL.lLow,
                      baseChroma: DEFAULT_GLOBAL.baseChroma,
                    }),
                    'OKHSL · Reset',
                  )
                }
              >
                Reset
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => adapter.setOkhslEnabled((v) => !v)}
              aria-expanded={adapter.okhslEnabled}
            >
              {adapter.okhslEnabled ? 'Hide OKHSL' : 'Show OKHSL'}
            </Button>
          </div>
        </div>
        {adapter.okhslEnabled ? (
          <div className="mt-4">
            <OkhslSection
              view={adapter.okhslView}
              resolvedConfig={{
                hue: adapter.okhslEditableConfig.hue,
                baseChroma: adapter.okhslEditableConfig.baseChroma,
                lHigh: adapter.okhslEditableConfig.lHigh,
                lLow: adapter.okhslEditableConfig.lLow,
              }}
              onEdit={(edit, label) => adapter.setGlobalConfigFromOkhsl(edit, label)}
            />
          </div>
        ) : null}
      </div>
    )
  }

  function PickerSettingsPanelInner({variant}: Props) {
    const adapter = useContext(PickerAdapterContext)!
    const {simpleArch, globalScaleSectionProps, systemMappingSectionProps, exportSectionProps} =
      useOklchPickerSectionProps(adapter)

    if (variant === 'embedded') {
      return (
        <div className="space-y-6 picker-section">
          <GlobalScaleSection {...globalScaleSectionProps} />
          <OkhslBlock id="nsb-picker-embedded-okhsl" className="border-hairline pt-6" />
        </div>
      )
    }

    return (
      <div className="space-y-6 picker-section">
        <div>
          <p className="picker-section-heading">Architecture</p>
          <p className="mt-1 picker-meta">
            Simple mirrors one ramp into both themes. Advanced keeps independent light / dark ramps.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
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
            <p className="mt-1 picker-meta">
              Hue variants and OKHSL commits apply here. Picker L/C/H syncs to this ladder.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
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

        <OkhslBlock id="nsb-picker-controls-okhsl" className="mt-6 border-hairline pt-6" />

        <VariantsSection
          config={adapter.okhslEditableConfig}
          onChange={adapter.setScaleConfigPreset}
        />

        <SystemMappingSection {...systemMappingSectionProps} />

        <div className="space-y-3 border-hairline pt-6">
          <div>
            <p className="picker-section-heading">Alpha neutral base offset</p>
            <p className="text-xs text-muted">
              Nudge the alpha token anchor from{' '}
              <code className="font-mono">text.default</code> resolved index. Light base:{' '}
              {adapter.alphaBaseIndices.lightBase} · Dark base: {adapter.alphaBaseIndices.darkBase}
            </p>
          </div>
          <div className="picker-metadata-grid">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">Light offset</span>
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
                className="w-full rounded border border-hairline bg-(--chrome-field) px-2 py-1 text-right font-mono text-xs"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-muted">Dark offset</span>
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
                className="w-full rounded border border-hairline bg-(--chrome-field) px-2 py-1 text-right font-mono text-xs"
              />
            </label>
          </div>
        </div>

        <ExportSection {...exportSectionProps} />
      </div>
    )
  }

  export const PickerSettingsPanel = memo(PickerSettingsPanelInner)
  ```

  > **Note:** `bg-(--chrome-field)` replaces `bg-(--ns-field)` — both resolve to the same value but `--chrome-field` is the canonical token per the UI guardrails (no new `--ns-*` references).
  >
  > `OkhslBlock` is a named sub-component so it can call `useContext` per the Rules of Hooks (hooks cannot be called inside regular functions). It reads from the same context without accepting `adapter` as a prop.

- [ ] **Step 2: Type-check**

  Run: `pnpm type-check`
  Expected: No new errors.

---

## Task 5: Create `PickerPanel.tsx`

Replaces `OklchPickerPanel.tsx`. Provides the `PickerAdapterContext` boundary. Uses the new `PickerControls` and `PickerSettingsPanel` children.

**Files:**
- Create: `components/picker/PickerPanel.tsx`

- [ ] **Step 1: Create the file**

  ```tsx
  'use client'

  import Link from 'next/link'
  import {Palette} from 'lucide-react'
  import {memo, useMemo} from 'react'

  import {GamutBadge} from '@/components/picker/GamutBadge'
  import {PickerAdapterProvider} from '@/components/picker/PickerAdapterContext'
  import {PickerControls} from '@/components/picker/PickerControls'
  import {PickerSettingsPanel} from '@/components/picker/PickerSettingsPanel'
  import {Button} from '@/components/ui/button'
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

    const headerBadgeExtras = useMemo(
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
            <div className="space-y-2">
              <p className="text-xs text-muted">
                Parallel{' '}
                <code className="font-mono text-[0.65rem]">buildGlobalScale</code> surface — does
                not change live theme CSS
                {adapter.mode === 'sandbox' ? ' until you apply below' : ''}.
              </p>
              <div className="picker-actions">
                {headerBadgeExtras}
                <Button type="button" variant="ghost" size="sm" asChild nativeButton={false}>
                  <Link href="/picker">Full-screen picker</Link>
                </Button>
              </div>
            </div>
          ) : (
            <header className="flex flex-col gap-3 border-b border-hairline pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <Palette className="mt-0.5 size-8 shrink-0 text-muted" aria-hidden />
                <div>
                  <h1 className="text-lg font-semibold tracking-tight">
                    OKLCH picker ·{' '}
                    {adapter.mode === 'live' ? 'live theme' : 'parallel engine surface'}
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-muted">
                    {adapter.mode === 'live'
                      ? 'Inspect gamut boundaries and tune L / C / H. Changes update CSS variables on this page via the same engine as the main workbench.'
                      : 'Inspect gamut boundaries and tune L / C / H. This sandbox keeps its own config until you send it to the workbench.'}
                  </p>
                </div>
              </div>
              <div className="picker-actions shrink-0">
                {headerBadgeExtras}
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
  ```

- [ ] **Step 2: Type-check**

  Run: `pnpm type-check`
  Expected: No new errors (old files still exist; no conflicts yet).

---

## Task 6: Update external consumers

Four files outside `components/picker/` reference the old component names. Update each one.

**Files:**
- Modify: `app/picker/page.tsx`
- Modify: `components/workbench/BuilderControlsSections.tsx`
- Modify: `components/control-center/panel/TunePanel.tsx`
- Modify: `components/control-center/panel/OklchPanel.tsx`

### 6a — `app/picker/page.tsx`

The page always used `mode="live"`. Inline the live path directly; the sandbox routing was internal and is not needed on the page.

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

`OklchPickerPanel` → `PickerPanel`. The `adapter` prop interface is unchanged — `PickerPanel` is still the context provider that accepts `adapter`.

- [ ] **Step 1: Update the import**

  Find: `import {OklchPickerPanel} from '@/components/picker/OklchPickerPanel'`
  Replace with: `import {PickerPanel} from '@/components/picker/PickerPanel'`

- [ ] **Step 2: Update the JSX usage**

  Find: `<OklchPickerPanel variant="embedded" adapter={sandboxAdapter} />`
  Replace with: `<PickerPanel variant="embedded" adapter={sandboxAdapter} />`

### 6c — `components/control-center/panel/TunePanel.tsx`

`OklchPickerStandaloneSettings` is replaced by `PickerSettingsPanel`. Since `PickerSettingsPanel` reads from context, it must be wrapped in `PickerAdapterProvider`.

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
  ```

### 6d — `components/control-center/panel/OklchPanel.tsx`

`OklchPickerMainBlocks` is replaced by `PickerControls`. Wrap with `PickerAdapterProvider`.

- [ ] **Step 1: Replace the file content**

  ```tsx
  'use client'

  import Link from 'next/link'
  import {memo, useMemo} from 'react'

  import {GamutBadge} from '@/components/picker/GamutBadge'
  import {PickerAdapterProvider} from '@/components/picker/PickerAdapterContext'
  import {PickerControls} from '@/components/picker/PickerControls'
  import {Button} from '@/components/ui/button'
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
  ```

- [ ] **Step 2: Type-check all four updated files**

  Run: `pnpm type-check`
  Expected: No new errors. Old files still exist; the type-checker sees both the old and new components without conflicts.

---

## Task 7: Delete the five old picker files

All external consumers have been migrated. The old files are now unused.

**Files:**
- Delete: `components/picker/OklchPickerWorkbench.tsx`
- Delete: `components/picker/OklchPickerPanel.tsx`
- Delete: `components/picker/OklchPickerMainBlocks.tsx`
- Delete: `components/picker/OklchPickerEmbeddedTuneBlocks.tsx`
- Delete: `components/picker/OklchPickerStandaloneSettings.tsx`

- [ ] **Step 1: Delete the files**

  ```bash
  rm components/picker/OklchPickerWorkbench.tsx \
     components/picker/OklchPickerPanel.tsx \
     components/picker/OklchPickerMainBlocks.tsx \
     components/picker/OklchPickerEmbeddedTuneBlocks.tsx \
     components/picker/OklchPickerStandaloneSettings.tsx
  ```

- [ ] **Step 2: Full type-check and lint**

  Run: `pnpm type-check && pnpm lint`
  Expected: Zero errors, zero warnings. If a missing-import error appears, an external consumer was missed — grep for the old component name and update it.

  ```bash
  grep -rn "OklchPickerPanel\|OklchPickerMainBlocks\|OklchPickerWorkbench\|OklchPickerEmbeddedTune\|OklchPickerStandalone" \
    --include="*.tsx" --include="*.ts" .
  ```

  Expected: No output (all references gone).

- [ ] **Step 3: Smoke test in dev server**

  Run: `pnpm dev`
  Open: `http://localhost:3000/picker`

  Verify:
  - L/C/H sliders move and update the gamut slice and preview swatch
  - Gamut slice click updates L and C values
  - "Copy OKLCH" copies to clipboard
  - "Main workbench" link works
  - Architecture selector (Simple / Advanced) toggles
  - OKHSL overlay shows/hides with the button
  - Export section renders

  Open: `http://localhost:3000` (main workbench)
  Verify:
  - Embedded picker panel in inspector renders
  - L/C/H sliders in the embedded panel work

- [ ] **Step 4: Commit this phase**

  ```bash
  git add \
    app/globals.css \
    app/picker/page.tsx \
    components/picker/PickerAdapterContext.tsx \
    components/picker/PickerControls.tsx \
    components/picker/PickerSettingsPanel.tsx \
    components/picker/PickerPanel.tsx \
    components/workbench/BuilderControlsSections.tsx \
    components/control-center/panel/TunePanel.tsx \
    components/control-center/panel/OklchPanel.tsx
  git rm \
    components/picker/OklchPickerWorkbench.tsx \
    components/picker/OklchPickerPanel.tsx \
    components/picker/OklchPickerMainBlocks.tsx \
    components/picker/OklchPickerEmbeddedTuneBlocks.tsx \
    components/picker/OklchPickerStandaloneSettings.tsx
  git commit -m "refactor(picker): context boundary, merged settings panel, rename to PickerPanel/PickerControls"
  ```

---

## Task 8: Apply `picker-*` classes to leaf components

Replace repeated utility strings in the six unchanged leaf components. This is mechanical find-replace — no logic changes.

**Files:**
- Modify: `components/picker/OklchControls.tsx`
- Modify: `components/picker/OklchPreviewSwatch.tsx`
- Modify: `components/picker/PickerRampStrip.tsx`
- Modify: `components/picker/OklchGamutSlice.tsx`
- Modify: `components/picker/PickerActions.tsx`
- Modify: `components/picker/PickerSecondaryControls.tsx`

### 8a — `OklchControls.tsx`

- [ ] **Step 1: Apply substitutions**

  | Find | Replace with |
  |------|--------------|
  | `className="flex flex-wrap items-center gap-2"` | `className="picker-actions"` |
  | `className="text-[0.65rem] text-muted"` (axis label) | `className="picker-meta"` |

  The `space-y-6`, `space-y-2`, `min-w-12`, slider-specific classes stay as-is.

### 8b — `OklchPreviewSwatch.tsx`

- [ ] **Step 1: Apply substitutions**

  | Find | Replace with |
  |------|--------------|
  | `className="overflow-hidden rounded-xl border border-hairline bg-raised ..."` (outer card div) | `className="picker-swatch-card ..."` keeping any extra classes like `h-24 w-full sm:h-28` |
  | `className="rounded bg-amber-500/20 px-1.5 py-px text-[0.6rem] font-medium text-amber-900 dark:text-amber-200"` | `className="picker-gamut-warning"` |
  | `className="flex flex-wrap items-center gap-2"` (metadata row) | `className="picker-actions"` |
  | `className="font-mono text-[0.65rem] tabular-nums ..."` + `text-muted` (readout spans) | `className="picker-readout"` |

  The inner `border-t border-hairline p-3` metadata footer stays.

### 8c — `PickerRampStrip.tsx`

- [ ] **Step 1: Apply substitutions**

  | Find | Replace with |
  |------|--------------|
  | `className="text-[0.65rem] font-medium tracking-wide text-muted"` (caption) | `className="picker-meta font-medium tracking-wide"` |
  | `className="overflow-x-auto rounded-xl border border-hairline bg-raised flex min-h-16"` | `className="picker-swatch-card overflow-x-auto flex min-h-16"` |

  > `picker-swatch-card` includes `overflow-hidden` but `overflow-x-auto` on the same element overrides the x-axis — this is fine. Tailwind's merge handles it correctly.

### 8d — `OklchGamutSlice.tsx`

- [ ] **Step 1: Apply substitutions**

  | Find | Replace with |
  |------|--------------|
  | `className="text-[0.65rem] text-muted"` (axis label) | `className="picker-meta"` |

  The `rounded-md border border-hairline bg-raised` on the SVG wrapper uses `rounded-md` (not `rounded-xl`) — intentionally different from `picker-swatch-card`. Leave it.

### 8e — `PickerActions.tsx`

- [ ] **Step 1: Apply substitutions**

  | Find | Replace with |
  |------|--------------|
  | `className="flex flex-wrap items-center gap-2"` | `className="picker-actions"` |

### 8f — `PickerSecondaryControls.tsx`

- [ ] **Step 1: Apply substitutions**

  | Find | Replace with |
  |------|--------------|
  | `className="text-[0.65rem] text-muted"` (label helper text) | `className="picker-meta"` |
  | `className="font-mono tabular-nums text-muted"` (numeric readout) | `className="picker-readout"` |
  | `className="grid gap-3 sm:grid-cols-2"` | stays — has a responsive breakpoint, not a `picker-metadata-grid` match |

- [ ] **Step 2: Type-check and lint**

  Run: `pnpm type-check && pnpm lint`
  Expected: No errors.

- [ ] **Step 3: Commit**

  ```bash
  git add components/picker/OklchControls.tsx \
          components/picker/OklchPreviewSwatch.tsx \
          components/picker/PickerRampStrip.tsx \
          components/picker/OklchGamutSlice.tsx \
          components/picker/PickerActions.tsx \
          components/picker/PickerSecondaryControls.tsx
  git commit -m "refactor(picker): apply picker-* semantic classes to leaf components"
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
  `PickerRampStrip`) stay **prop-driven** — they are independently testable and portable
  outside the picker context tree.

  When rendering `PickerControls` or `PickerSettingsPanel` outside `PickerPanel`
  (e.g., in control-center panels), wrap them with `PickerAdapterProvider` directly:

  ```tsx
  <PickerAdapterProvider adapter={adapter}>
    <PickerControls layout="dock" />
  </PickerAdapterProvider>
  ```

  ## Styling contract

  **Use `picker-*` semantic classes** (defined in `app/globals.css`) for all shared
  structural and surface patterns:

  | Pattern | Class |
  |---------|-------|
  | Section divider (`border-t border-hairline pt-6`) | `picker-section` |
  | Section heading (`text-xs font-medium text-default`) | `picker-section-heading` |
  | Meta label (`text-[0.65rem] text-muted`) | `picker-meta` |
  | Numeric readout (`font-mono text-[0.65rem] tabular-nums text-muted`) | `picker-readout` |
  | Button/badge row (`flex flex-wrap items-center gap-2`) | `picker-actions` |
  | Two-column grid (`grid grid-cols-2 gap-3`) | `picker-metadata-grid` |
  | Raised card surface (`overflow-hidden rounded-xl border border-hairline bg-raised`) | `picker-swatch-card` |
  | Gamut out-of-sRGB warning badge | `picker-gamut-warning` |

  **Keep in component files:**
  - Dynamic dimensions on SVG elements (width/height driven by `layout` prop)
  - Responsive grid exceptions (`lg:grid-cols-[...]`)
  - State-driven classes (`data-[highlighted]:`, `focus-visible:ring-*`, `disabled:`)
  - `sm:` breakpoint overrides contextual to the component
  - Interaction cursors (`cursor-crosshair`, `touch-none`)

  **No new `--ns-*` tokens.** Use `--chrome-*` and `--color-*` aliases. See
  `components/ui/AGENTS.md` for the full list.
  ```

- [ ] **Step 2: Commit**

  ```bash
  git add components/picker/AGENTS.md
  git commit -m "docs(picker): add AGENTS.md with naming, context, and styling conventions"
  ```

---

## Task 10: Final verification

- [ ] **Step 1: Full type-check and lint pass**

  Run: `pnpm type-check && pnpm lint`
  Expected: Zero errors.

- [ ] **Step 2: Unit tests pass**

  Run: `pnpm test`
  Expected: All tests pass. (Engine unit tests in `lib/` — no picker component tests exist yet.)

- [ ] **Step 3: Manual golden-path verification**

  Run: `pnpm dev`

  **`/picker` page:**
  - [ ] L/C/H sliders update preview swatch and gamut slice
  - [ ] Gamut slice click updates L and C
  - [ ] "Copy OKLCH" copies the oklch() string to clipboard
  - [ ] Architecture selector (Simple → Advanced) shows edit-target chips
  - [ ] OKHSL "Show OKHSL" button reveals the section; "Hide OKHSL" collapses it
  - [ ] "Reset" button resets to defaults
  - [ ] Export section renders with download buttons
  - [ ] No `--ns-field` references in computed styles (open DevTools → Inspector on the number inputs, confirm `background` resolves to a color, not a broken variable)

  **Main workbench (`/`) — embedded picker:**
  - [ ] Open the inspector pane with the embedded picker
  - [ ] L/C/H sliders work in embedded mode
  - [ ] "Full-screen picker" link navigates to `/picker`

  **Control-center dock (if accessible):**
  - [ ] OKLCH panel renders `PickerControls` in dock layout
  - [ ] Tune panel renders `PickerSettingsPanel` in standalone layout

- [ ] **Step 4: Confirm no old names remain**

  ```bash
  grep -rn "OklchPickerPanel\|OklchPickerMainBlocks\|OklchPickerWorkbench\|OklchPickerEmbeddedTune\|OklchPickerStandalone\|--ns-field" \
    --include="*.tsx" --include="*.ts" --include="*.css" . | grep -v node_modules
  ```

  Expected: No output.
