'use client'

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Minus,
  Moon,
  Plus,
  Settings2,
  Sun,
} from 'lucide-react'

import {INPUT_WORKBENCH_FIELD_CLASS} from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  ResponsiveSelect,
  type ResponsiveSelectOption,
} from '@/components/ui/responsive-select'
import {SelectPrimitives} from '@/components/ui/select'
import {Slider} from '@/components/ui/slider'
import {Toolbar} from '@/components/ui/toolbar'
import {ChromaModeComparisonRail} from '@/components/viz/ChromaModeComparisonRail'
import {LightnessLadder} from '@/components/viz/LightnessLadder'
import {LightnessSparkline} from '@/components/viz/LightnessSparkline'
import {logPresetGroup} from '@/lib/debug/presetDebug'
import {cn} from '@/lib/utils'
import {
  clampGlobalScaleSteps,
  GLOBAL_SCALE_STEP_MAX,
  GLOBAL_SCALE_STEP_MIN,
} from '@/lib/neutral-engine/globalScale'
import type {
  GlobalScaleConfig,
  GlobalSwatch,
  LCurve,
  NamingStyle,
} from '@/lib/neutral-engine/types'
import {Button} from '@/components/ui/button'

export type RampPatchFn = <K extends keyof GlobalScaleConfig>(
  key: K,
  value: GlobalScaleConfig[K],
  label?: string,
) => void

type Props = {
  architecture: 'simple' | 'advanced'
  comparisonConfig: GlobalScaleConfig
  curveModeNamingConfig: GlobalScaleConfig
  lightRampConfig: GlobalScaleConfig
  patchLightRamp: RampPatchFn
  darkRampConfig: GlobalScaleConfig
  patchDarkRamp: RampPatchFn
  global: GlobalSwatch[]
  selectedIndex: number | null
  onSelectSwatch: (index: number) => void
}

const namingOptions: {id: NamingStyle; label: string}[] = [
  {id: 'token_ladder', label: 'Token Ladder'},
  {id: 'semantic', label: '0 … n−1'},
  {id: 'numeric_desc', label: '100 → 4'},
]

const curveOptions: {id: LCurve; label: string}[] = [
  {id: 'linear', label: 'Linear'},
  {id: 'ease-in-dark', label: 'Ease into dark'},
  {id: 'ease-out-light', label: 'Ease out light'},
  {id: 's-curve', label: 'S-curve'},
]

const chromaOptions: {id: GlobalScaleConfig['chromaMode']; label: string}[] = [
  {id: 'achromatic', label: 'Achromatic'},
  {id: 'fixed', label: 'Fixed chroma'},
  {id: 'taper_mid', label: 'Taper (mid emphasis)'},
  {id: 'taper_ends', label: 'Taper (ends emphasis)'},
]

/** Stable toolbar identity (tests, selectors, instrumentation). Mirrors visible section titles below. */
const GLOBAL_SCALE_TOOLBAR = {
  steps: {
    slug: 'ramp-steps' as const,
    id: 'global-scale-toolbar-ramp-steps',
    headingId: 'global-scale-toolbar-ramp-steps-heading',
  },
  lightness: {
    slug: 'lightness-anchors' as const,
    id: 'global-scale-toolbar-lightness-anchors',
    headingId: 'global-scale-toolbar-lightness-anchors-heading',
  },
  hueChroma: {
    slug: 'hue-chroma' as const,
    id: 'global-scale-toolbar-hue-chroma',
    headingId: 'global-scale-toolbar-hue-chroma-heading',
  },
  systemShape: {
    slug: 'system-shape' as const,
    id: 'global-scale-toolbar-system-shape',
    headingId: 'global-scale-toolbar-system-shape-heading',
  },
} as const

const stepOptions: number[] = Array.from(
  {length: GLOBAL_SCALE_STEP_MAX - GLOBAL_SCALE_STEP_MIN + 1},
  (_, i) => GLOBAL_SCALE_STEP_MIN + i,
)

/** Cap visible options (`py-2` + `text-sm` / mono line box ≈ 2.375rem). */
const STEPS_SELECT_VISIBLE_ROW_COUNT = 9

function stepsSelectListMaxHeightStyle(): {maxHeight: string} {
  return {
    maxHeight: `calc(2.375rem * ${STEPS_SELECT_VISIBLE_ROW_COUNT})`,
  }
}

const HUE_OPTIONS: ResponsiveSelectOption[] = Array.from(
  {length: 361},
  (_, i) => ({
    value: String(i),
    label: `${i}°`,
  }),
)

const BASE_CHROMA_OPTIONS: ResponsiveSelectOption[] = Array.from(
  {length: 401},
  (_, i) => {
    const v = Number((i * 0.001).toFixed(3))
    const s = v.toFixed(3)
    return {value: s, label: s}
  },
)

type RampProps = {
  global: GlobalSwatch[]
  selectedIndex: number | null
  onSelectSwatch: (index: number) => void
}

/** Isolated from control form so typing does not re-paint the full strip on every keystroke. */
const GlobalScaleRampVisualization = memo(
  function GlobalScaleRampVisualization({
    global,
    selectedIndex,
    onSelectSwatch,
  }: RampProps) {
    const n = global.length
    const ringIndex =
      selectedIndex == null || n === 0 ? null : Math.min(selectedIndex, n - 1)

    return (
      <>
        <div className="overflow-x-auto rounded-2xl border border-hairline">
          <div
            className="flex min-h-18"
            style={{minWidth: `${Math.max(global.length * 8, 320)}px`}}
          >
            {global.map((s) => (
              <button
                key={s.index}
                type="button"
                title={s.serialized.oklchCss}
                onClick={() => onSelectSwatch(s.index)}
                className={cn(
                  'min-w-[8px] flex-1 border-l border-hairline first:border-l-0',
                  ringIndex === s.index && 'ring-2 ring-white/50 ring-inset',
                )}
                style={{backgroundColor: s.serialized.hex}}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 nsb-lg:grid-cols-[1fr_14rem]">
          <LightnessLadder
            swatches={global}
            onSelect={onSelectSwatch}
            selectedIndex={ringIndex}
            className={cn(
              'col-span-full h-28 w-full rounded-xl border border-hairline bg-raised',
            )}
          />
          {/* <LightnessSparkline swatches={global} /> */}
        </div>
      </>
    )
  },
)

function clampHueDeg(h: number): number {
  return Math.min(360, Math.max(0, Math.round(h)))
}

function clampUnitOkL(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, Number(n.toFixed(4))))
}

/** Display string when the field is blurred (controlled from engine state). */
function formatLightnessFieldDisplay(n: number): string {
  if (!Number.isFinite(n)) return '0'
  return String(Number(clampUnitOkL(n).toFixed(4)))
}

function closestListedString(
  raw: number,
  listing: ResponsiveSelectOption[],
): string {
  let best = listing[0]!.value
  let bd = Infinity
  for (const {value} of listing) {
    const n = Number(value)
    const d = Math.abs(n - raw)
    if (d < bd) {
      bd = d
      best = value
    }
  }
  return best
}

type SchedulePatchFn = ReturnType<typeof useCoalescedPatch>

function useCoalescedPatch(patchGlobal: RampPatchFn) {
  const pendingRef = useRef<
    Map<keyof GlobalScaleConfig, {value: unknown; label: string}>
  >(new Map())
  const rafRef = useRef<number | null>(null)

  const flush = useCallback(() => {
    rafRef.current = null
    const pending = pendingRef.current
    pendingRef.current = new Map()
    for (const [key, {value, label}] of pending.entries()) {
      patchGlobal(key as keyof GlobalScaleConfig, value as never, label)
    }
  }, [patchGlobal])

  const schedule = useCallback(
    <K extends keyof GlobalScaleConfig>(
      key: K,
      value: GlobalScaleConfig[K],
      label: string,
    ) => {
      pendingRef.current.set(key, {value, label})
      logPresetGroup('scale', `${label}=${String(value)}`, {[key]: value})
      if (rafRef.current == null) {
        rafRef.current =
          typeof requestAnimationFrame !== 'undefined'
            ? requestAnimationFrame(flush)
            : (setTimeout(flush, 0) as unknown as number)
      }
    },
    [flush],
  )

  useEffect(() => {
    return () => {
      if (rafRef.current != null) {
        if (typeof cancelAnimationFrame !== 'undefined')
          cancelAnimationFrame(rafRef.current)
        flush()
      }
    }
  }, [flush])

  return schedule
}

function buildDualRampSchedule(
  light: SchedulePatchFn,
  dark: SchedulePatchFn,
): SchedulePatchFn {
  return (key, value, label) => {
    light(key, value, label)
    dark(key, value, label)
  }
}

const lightnessToolbarInputClass = cn(
  INPUT_WORKBENCH_FIELD_CLASS,
  'mb-0 h-8 max-w-36 min-w-16 flex-1 shrink rounded-md px-2.5 py-1',
  'font-mono text-xs text-default tabular-nums',
)

function LightnessAnchorToolbarInput({
  id,
  ariaLabel,
  committed,
  patchKey,
  schedule,
  commitLabel,
}: {
  id: string
  ariaLabel: string
  committed: number
  patchKey: 'lHigh' | 'lLow'
  schedule: SchedulePatchFn
  commitLabel: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const value = draft !== null ? draft : formatLightnessFieldDisplay(committed)

  const commitFromString = useCallback(
    (raw: string) => {
      const v = parseFloat(raw)
      if (!Number.isFinite(v)) return
      schedule(patchKey, clampUnitOkL(v), commitLabel)
    },
    [patchKey, schedule, commitLabel],
  )

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value
      setDraft(next)
      commitFromString(next)
    },
    [commitFromString],
  )

  const onBlur = useCallback(() => {
    setDraft(null)
  }, [])

  return (
    <Toolbar.Input
      id={id}
      aria-label={ariaLabel}
      type="text"
      autoComplete="off"
      enterKeyHint="done"
      inputMode="decimal"
      value={value}
      data-slot="input"
      className={lightnessToolbarInputClass}
      onChange={onChange}
      onBlur={onBlur}
    />
  )
}

function StepsRampSegment({
  idPrefix,
  config,
  schedule,
}: {
  idPrefix: string
  config: GlobalScaleConfig
  schedule: SchedulePatchFn
}) {
  const clampedSteps = clampGlobalScaleSteps(config.steps)

  return (
    <>
      <Toolbar.Group
        className="flex items-center gap-0"
        aria-label="Nudge ladder steps"
      >
        {/* <Toolbar.Button
          type="button"
          disabled={clampedSteps <= GLOBAL_SCALE_STEP_MIN}
          aria-label={`Decrease steps (minimum ${GLOBAL_SCALE_STEP_MIN})`}
          onClick={() =>
            schedule(
              'steps',
              Math.max(GLOBAL_SCALE_STEP_MIN, clampedSteps - 1),
              'Steps',
            )
          }
        >
          <Minus aria-hidden />
        </Toolbar.Button> */}
        {/* <Toolbar.Button
          type="button"
          disabled={clampedSteps >= GLOBAL_SCALE_STEP_MAX}
          aria-label={`Increase steps (maximum ${GLOBAL_SCALE_STEP_MAX})`}
          onClick={() =>
            schedule(
              'steps',
              Math.min(GLOBAL_SCALE_STEP_MAX, clampedSteps + 1),
              'Steps',
            )
          }
        >
          <Plus aria-hidden />
        </Toolbar.Button> */}
      </Toolbar.Group>
      <Toolbar.Separator className="m-1 h-4 bg-border data-[orientation=vertical]:w-px" />
      <SelectPrimitives.Root
        id={`${idPrefix}-steps-select`}
        value={String(clampedSteps)}
        onValueChange={(v) => {
          if (typeof v !== 'string' || v === '') return
          schedule('steps', Number(v), 'Steps')
        }}
      >
        <Toolbar.Button
          render={<SelectPrimitives.Trigger />}
          type="button"
          aria-haspopup="listbox"
          className="h-8 min-w-16 flex-1 justify-between gap-2 px-3 text-left font-mono text-xs tabular-nums"
        >
          <SelectPrimitives.Value>
            {(v) => (v != null && String(v) !== '' ? `${v} steps` : '—')}
          </SelectPrimitives.Value>
          <SelectPrimitives.Icon className="pointer-events-none flex shrink-0">
            <ChevronsUpDown className="size-4 opacity-60" aria-hidden />
          </SelectPrimitives.Icon>
        </Toolbar.Button>
        <SelectPrimitives.Portal>
          <SelectPrimitives.Positioner
            align="center"
            alignItemWithTrigger={false}
            className="isolate z-50 outline-none select-none"
            side="bottom"
            sideOffset={8}
          >
            <SelectPrimitives.Popup
              className={cn(
                'relative isolate z-50 max-h-[var(--available-height)] w-[var(--anchor-width)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-x-hidden overflow-y-hidden rounded-lg border border-hairline bg-popover px-1 py-1 text-popover-foreground shadow-md ring-1 ring-ring/35 outline-none',
              )}
            >
              <SelectPrimitives.ScrollUpArrow
                className="top-0 left-0 z-10 flex w-full shrink-0 cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4"
                keepMounted={false}
              >
                <ChevronUp className="size-4 opacity-70" aria-hidden />
              </SelectPrimitives.ScrollUpArrow>
              <SelectPrimitives.List
                className="min-h-0 overflow-y-auto py-0"
                style={stepsSelectListMaxHeightStyle()}
              >
                {stepOptions.map((n) => (
                  <SelectPrimitives.Item
                    key={n}
                    value={String(n)}
                    className="relative flex cursor-default items-center gap-2 rounded-md py-2 pr-10 pl-2.5 text-sm outline-none select-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground"
                  >
                    <SelectPrimitives.ItemText className="font-mono">
                      {String(n)}
                    </SelectPrimitives.ItemText>
                    <SelectPrimitives.ItemIndicator
                      aria-hidden
                      className="pointer-events-none absolute inset-y-0 right-2 flex items-center"
                      render={<span />}
                    >
                      <Check className="size-3.5" />
                    </SelectPrimitives.ItemIndicator>
                  </SelectPrimitives.Item>
                ))}
              </SelectPrimitives.List>
              <SelectPrimitives.ScrollDownArrow
                className="bottom-0 left-0 z-10 flex w-full shrink-0 cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4"
                keepMounted={false}
              >
                <ChevronDown className="size-4 opacity-70" aria-hidden />
              </SelectPrimitives.ScrollDownArrow>
            </SelectPrimitives.Popup>
          </SelectPrimitives.Positioner>
        </SelectPrimitives.Portal>
      </SelectPrimitives.Root>
    </>
  )
}

function LightnessSegment({
  idPrefix,
  config,
  schedule,
}: {
  idPrefix: string
  config: GlobalScaleConfig
  schedule: SchedulePatchFn
}) {
  const lHighLabel = formatLightnessFieldDisplay(config.lHigh)
  const lLowLabel = formatLightnessFieldDisplay(config.lLow)

  return (
    <>
      <LightnessAnchorToolbarInput
        id={`${idPrefix}-l-high`}
        ariaLabel="Lightest OKLCH L (0–1)"
        committed={config.lHigh}
        patchKey="lHigh"
        schedule={schedule}
        commitLabel="Lightest L"
      />
      <Toolbar.Separator className="m-1 h-4 bg-border data-[orientation=vertical]:w-px" />
      <LightnessAnchorToolbarInput
        id={`${idPrefix}-l-low`}
        ariaLabel="Darkest OKLCH L (0–1)"
        committed={config.lLow}
        patchKey="lLow"
        schedule={schedule}
        commitLabel="Darkest L"
      />
      <Toolbar.Separator className="m-0.25 h-4 bg-transparent data-[orientation=vertical]:w-px" />
      <Popover>
        <PopoverTrigger
          render={
            <Toolbar.Button type="button" aria-label="Open lightness sliders" />
          }
        >
          <Settings2 aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          className="w-[22rem] gap-4"
          align="start"
          sideOffset={8}
        >
          <PopoverHeader>
            <PopoverTitle>Lightness</PopoverTitle>
          </PopoverHeader>
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted">
              Lightest L ({lHighLabel})
            </span>
            <Slider
              min={0}
              max={1}
              step={0.005}
              value={[config.lHigh]}
              onValueChange={([next]) =>
                typeof next === 'number' &&
                schedule('lHigh', Number(next.toFixed(4)), 'Lightest L slider')
              }
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted">
              Darkest L ({lLowLabel})
            </span>
            <Slider
              min={0}
              max={1}
              step={0.005}
              value={[config.lLow]}
              onValueChange={([next]) =>
                typeof next === 'number' &&
                schedule('lLow', Number(next.toFixed(4)), 'Darkest L slider')
              }
            />
          </div>
        </PopoverContent>
      </Popover>
    </>
  )
}

function HueChromaSegment({
  idPrefix,
  config,
  schedule,
}: {
  idPrefix: string
  config: GlobalScaleConfig
  schedule: SchedulePatchFn
}) {
  const achromatic = config.chromaMode === 'achromatic'
  const hueValue = clampHueDeg(config.hue)
  const baseChromaListed = closestListedString(
    config.baseChroma,
    BASE_CHROMA_OPTIONS,
  )
  const chromaLight = config.chromaLight ?? config.baseChroma
  const chromaDark = config.chromaDark ?? config.baseChroma
  const hueLight = config.hueLight ?? config.hue
  const hueDark = config.hueDark ?? config.hue

  return (
    <>
      <ResponsiveSelect
        id={`${idPrefix}-hue`}
        className="h-8 max-w-[7rem] min-w-[5.75rem] flex-1 shrink py-1 text-xs"
        disabled={achromatic}
        value={String(hueValue)}
        options={HUE_OPTIONS}
        onValueChange={(v) => schedule('hue', Number(v), 'Hue')}
      />
      <Toolbar.Separator className="m-1 h-4 bg-border data-[orientation=vertical]:w-px" />
      <ResponsiveSelect
        id={`${idPrefix}-base-chroma`}
        className="h-8 max-w-[8rem] min-w-[6rem] flex-1 shrink py-1 font-mono text-xs"
        disabled={achromatic}
        value={baseChromaListed}
        options={BASE_CHROMA_OPTIONS}
        onValueChange={(v) => schedule('baseChroma', Number(v), 'Base chroma')}
      />
      <Toolbar.Separator className="m-1 h-4 bg-border data-[orientation=vertical]:w-px" />
      <Popover>
        <PopoverTrigger
          render={
            <Toolbar.Button
              type="button"
              aria-label="Open hue / chroma sliders"
            />
          }
        >
          <Settings2 aria-hidden />
        </PopoverTrigger>
        <PopoverContent
          className="max-h-[70vh] w-[23rem] gap-4 overflow-y-auto"
          align="start"
          sideOffset={8}
        >
          <PopoverHeader>
            <PopoverTitle>Hue / chroma</PopoverTitle>
          </PopoverHeader>
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted">
              Hue ({hueValue}°)
            </span>
            <Slider
              min={0}
              max={360}
              step={1}
              value={[hueValue]}
              disabled={achromatic}
              onValueChange={([next]) =>
                typeof next === 'number' &&
                schedule('hue', Math.round(next), 'Hue slider')
              }
            />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-medium text-muted">
              Base chroma ({baseChromaListed})
            </span>
            <Slider
              min={0}
              max={0.4}
              step={0.001}
              value={[config.baseChroma]}
              disabled={achromatic}
              onValueChange={([next]) =>
                typeof next === 'number' &&
                schedule(
                  'baseChroma',
                  Number(next.toFixed(3)),
                  'Base chroma slider',
                )
              }
            />
          </div>
          {!achromatic ? (
            <>
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted">
                  Hue · light end
                </span>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[clampHueDeg(hueLight)]}
                  onValueChange={([next]) =>
                    typeof next === 'number' &&
                    schedule('hueLight', Math.round(next), 'Hue light slider')
                  }
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted">
                  Hue · dark end
                </span>
                <Slider
                  min={0}
                  max={360}
                  step={1}
                  value={[clampHueDeg(hueDark)]}
                  onValueChange={([next]) =>
                    typeof next === 'number' &&
                    schedule('hueDark', Math.round(next), 'Hue dark slider')
                  }
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted">
                  Chroma · light end
                </span>
                <Slider
                  min={0}
                  max={0.4}
                  step={0.001}
                  value={[chromaLight]}
                  onValueChange={([next]) =>
                    typeof next === 'number' &&
                    schedule(
                      'chromaLight',
                      Number(next.toFixed(3)),
                      'Chroma light slider',
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted">
                  Chroma · dark end
                </span>
                <Slider
                  min={0}
                  max={0.4}
                  step={0.001}
                  value={[chromaDark]}
                  onValueChange={([next]) =>
                    typeof next === 'number' &&
                    schedule(
                      'chromaDark',
                      Number(next.toFixed(3)),
                      'Chroma dark slider',
                    )
                  }
                />
              </div>
            </>
          ) : null}
        </PopoverContent>
      </Popover>
    </>
  )
}

function GlobalScaleSectionInner({
  architecture,
  comparisonConfig,
  curveModeNamingConfig,
  lightRampConfig,
  patchLightRamp,
  darkRampConfig,
  patchDarkRamp,
  global,
  selectedIndex,
  onSelectSwatch,
}: Props) {
  const scheduleLightRamp = useCoalescedPatch(patchLightRamp)
  const scheduleDarkRamp = useCoalescedPatch(patchDarkRamp)
  const [showComparison, setShowComparison] = useState(false)

  const dualModesSchedule = useMemo(
    () =>
      architecture === 'simple'
        ? scheduleLightRamp
        : buildDualRampSchedule(scheduleLightRamp, scheduleDarkRamp),
    [architecture, scheduleLightRamp, scheduleDarkRamp],
  )

  const advanced = architecture === 'advanced'

  return (
    <section id="global-scale-section" className="scroll-mt-4 space-y-4">
      <header>
        <h2 className="mt-1 text-sm font-semibold text-default">
          Neutral ladder
        </h2>
      </header>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">
          Compare chroma modes side-by-side for the current hue / base chroma.
        </p>
        <Button
          variant="outline"
          // type="button"
          nativeButton={true}
          onClick={() => setShowComparison((v) => !v)}
          aria-expanded={showComparison}
          aria-controls="chroma-mode-comparison-rail"
        >

            {showComparison ? 'Hide comparison' : 'Show comparison'}
    
        </Button>
      </div>

      {showComparison ? (
        <div id="chroma-mode-comparison-rail">
          <ChromaModeComparisonRail config={comparisonConfig} />
        </div>
      ) : null}

      <GlobalScaleRampVisualization
        global={global}
        selectedIndex={selectedIndex}
        onSelectSwatch={onSelectSwatch}
      />

      <div className="space-y-3">
        <div className="space-y-1">
          <p
            id={GLOBAL_SCALE_TOOLBAR.steps.headingId}
            className="ns-label text-trim-both"
          >
            {advanced ? 'Color Ramps · light & dark' : 'Color Ramps'}
          </p>
          <Toolbar.Root
            id={GLOBAL_SCALE_TOOLBAR.steps.id}
            data-ns-toolbar={GLOBAL_SCALE_TOOLBAR.steps.slug}
            className="w-full flex-wrap gap-px"
            aria-labelledby={GLOBAL_SCALE_TOOLBAR.steps.headingId}
          >
            {advanced ? (
              <>
                <span className="mx-0.5 self-center px-1 py-1 text-[0.625rem] font-semibold tracking-wide text-disabled uppercase dark:text-amber-300">
                  <Sun className="size-3.5" aria-hidden={true} />
                </span>
                <StepsRampSegment
                  idPrefix="global-scale-steps-light"
                  config={lightRampConfig}
                  schedule={scheduleLightRamp}
                />
                <Toolbar.Separator className="m-1 h-5 min-h-7 shrink-0 self-stretch bg-border data-[orientation=vertical]:w-px" />
                <span className="mx-0.5 self-center px-1 py-1 text-[0.625rem] font-semibold tracking-wide text-disabled uppercase dark:text-sky-300">
                  <Moon className="size-3.5" aria-hidden={true} />
                </span>
                <StepsRampSegment
                  idPrefix="global-scale-steps-dark"
                  config={darkRampConfig}
                  schedule={scheduleDarkRamp}
                />
              </>
            ) : (
              <StepsRampSegment
                idPrefix="global-scale-steps"
                config={lightRampConfig}
                schedule={scheduleLightRamp}
              />
            )}
          </Toolbar.Root>
        </div>

        <div className="space-y-1">
          <p
            id={GLOBAL_SCALE_TOOLBAR.lightness.headingId}
            className="ns-label text-trim-both"
          >
            {advanced
              ? 'Lightness anchors · light & dark'
              : 'Lightness anchors'}
          </p>
          <Toolbar.Root
            id={GLOBAL_SCALE_TOOLBAR.lightness.id}
            data-ns-toolbar={GLOBAL_SCALE_TOOLBAR.lightness.slug}
            className="w-full flex-wrap gap-px"
            aria-labelledby={GLOBAL_SCALE_TOOLBAR.lightness.headingId}
          >
            {advanced ? (
              <>
                <span
                  className={cn(
                    'mx-0.5 self-center px-1 font-semibold tracking-wide text-disabled uppercase',
                    advanced && 'text-muted',
                  )}
                >
                  <Sun className="size-3.5" aria-hidden={true} />
                </span>
                <LightnessSegment
                  idPrefix="global-scale-light-l"
                  config={lightRampConfig}
                  schedule={scheduleLightRamp}
                />
                <Toolbar.Separator className="m-1 h-5 min-h-[1.75rem] shrink-0 self-stretch bg-border data-[orientation=vertical]:w-px" />
                <span className="self-center px-1 text-[0.625rem] font-semibold tracking-wide text-sky-800 uppercase dark:text-sky-300">
                  <Moon className="size-3.5" aria-hidden={true} />
                </span>
                <LightnessSegment
                  idPrefix="global-scale-dark-l"
                  config={darkRampConfig}
                  schedule={scheduleDarkRamp}
                />
              </>
            ) : (
              <LightnessSegment
                idPrefix="global-scale-l"
                config={lightRampConfig}
                schedule={scheduleLightRamp}
              />
            )}
          </Toolbar.Root>
        </div>

        <div className="space-y-1">
          <p
            id={GLOBAL_SCALE_TOOLBAR.hueChroma.headingId}
            className="ns-label text-trim-both"
          >
            {advanced
              ? 'Hue & base chroma · light & dark'
              : 'Hue & base chroma'}
          </p>
          <Toolbar.Root
            id={GLOBAL_SCALE_TOOLBAR.hueChroma.id}
            data-ns-toolbar={GLOBAL_SCALE_TOOLBAR.hueChroma.slug}
            className="w-full flex-wrap gap-px"
            aria-labelledby={GLOBAL_SCALE_TOOLBAR.hueChroma.headingId}
          >
            {advanced ? (
              <>
                <span className="self-center px-1 text-[0.625rem] font-semibold tracking-wide text-amber-800 uppercase dark:text-amber-300">
                  <Sun className="size-3.5" aria-hidden={true} />
                </span>
                <HueChromaSegment
                  idPrefix="global-scale-light-hue"
                  config={lightRampConfig}
                  schedule={scheduleLightRamp}
                />
                <Toolbar.Separator className="m-1 h-5 min-h-[1.75rem] shrink-0 self-stretch bg-border data-[orientation=vertical]:w-px" />
                <span className="self-center px-1 text-[0.625rem] font-semibold tracking-wide text-sky-800 uppercase dark:text-sky-300">
                  <Moon className="size-3.5" aria-hidden={true} />
                </span>
                <HueChromaSegment
                  idPrefix="global-scale-dark-hue"
                  config={darkRampConfig}
                  schedule={scheduleDarkRamp}
                />
              </>
            ) : (
              <HueChromaSegment
                idPrefix="global-scale-hue"
                config={lightRampConfig}
                schedule={scheduleLightRamp}
              />
            )}
          </Toolbar.Root>
        </div>

        <div className="space-y-1">
          <p
            id={GLOBAL_SCALE_TOOLBAR.systemShape.headingId}
            className="ns-label text-trim-both"
          >
            System shape
          </p>
          <Toolbar.Root
            id={GLOBAL_SCALE_TOOLBAR.systemShape.id}
            data-ns-toolbar={GLOBAL_SCALE_TOOLBAR.systemShape.slug}
            className="w-full flex-wrap items-center gap-1 gap-y-px"
            aria-labelledby={GLOBAL_SCALE_TOOLBAR.systemShape.headingId}
          >
            <ResponsiveSelect
              id="global-scale-modes-naming"
              className="h-8 max-w-[13rem] min-w-[9rem] flex-1 shrink py-1 text-xs"
              value={curveModeNamingConfig.namingStyle}
              options={namingOptions.map((o) => ({
                value: o.id,
                label: o.label,
              }))}
              onValueChange={(v) =>
                dualModesSchedule('namingStyle', v as NamingStyle, 'Naming')
              }
            />
            <Toolbar.Separator className="m-1 h-4 bg-border data-[orientation=vertical]:w-px" />
            <ResponsiveSelect
              id="global-scale-modes-chroma"
              className="h-8 max-w-[13rem] min-w-[8.25rem] flex-1 shrink py-1 text-xs"
              value={curveModeNamingConfig.chromaMode}
              options={chromaOptions.map((o) => ({
                value: o.id,
                label: o.label,
              }))}
              onValueChange={(v) =>
                dualModesSchedule(
                  'chromaMode',
                  v as GlobalScaleConfig['chromaMode'],
                  'Chroma mode',
                )
              }
            />
            <Toolbar.Separator className="m-1 h-4 bg-border data-[orientation=vertical]:w-px" />
            <ResponsiveSelect
              id="global-scale-modes-l-curve"
              className="h-8 max-w-[13rem] min-w-[10rem] flex-1 shrink py-1 text-xs"
              value={curveModeNamingConfig.lCurve ?? 'linear'}
              options={curveOptions.map((o) => ({value: o.id, label: o.label}))}
              onValueChange={(v) =>
                dualModesSchedule('lCurve', v as LCurve, 'L curve')
              }
            />
            <Toolbar.Separator className="m-1 h-4 bg-border data-[orientation=vertical]:w-px" />
            <Popover>
              <PopoverTrigger
                render={
                  <Toolbar.Button
                    type="button"
                    aria-label="L curve strength sliders"
                    disabled={
                      (curveModeNamingConfig.lCurve ?? 'linear') === 'linear'
                    }
                  />
                }
              >
                <Settings2 aria-hidden />
              </PopoverTrigger>
              <PopoverContent
                className="w-80 gap-4"
                align="start"
                sideOffset={8}
              >
                <PopoverHeader>
                  <PopoverTitle>L curve strength</PopoverTitle>
                </PopoverHeader>
                <LightnessSparkline swatches={global} />
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted tabular-nums">
                    Strength{' '}
                    {Math.round(
                      (curveModeNamingConfig.lCurveStrength ?? 1) * 100,
                    )}
                    %
                  </span>
                  <Slider
                    disabled={
                      (curveModeNamingConfig.lCurve ?? 'linear') === 'linear'
                    }
                    min={0}
                    max={100}
                    step={1}
                    value={[
                      Math.round(
                        (curveModeNamingConfig.lCurveStrength ?? 1) * 100,
                      ),
                    ]}
                    onValueChange={([pct]) =>
                      typeof pct === 'number' &&
                      dualModesSchedule(
                        'lCurveStrength',
                        pct / 100,
                        'L curve strength',
                      )
                    }
                  />
                  <p className="text-[0.65rem] text-muted">
                    0% = linear spacing · 100% = full selected curve
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </Toolbar.Root>
        </div>
      </div>
    </section>
  )
}

export const GlobalScaleSection = memo(GlobalScaleSectionInner)
