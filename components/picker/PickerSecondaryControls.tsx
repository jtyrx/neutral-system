'use client'

import {
  Check,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Settings2,
} from 'lucide-react'
import {memo} from 'react'

import {CollapsibleControlGroup} from '@/components/workbench/CollapsibleControlGroup'
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {INPUT_WORKBENCH_FIELD_CLASS} from '@/components/ui/input'
import {ResponsiveSelect} from '@/components/ui/responsive-select'
import {SelectPrimitives} from '@/components/ui/select'
import {Slider} from '@/components/ui/slider'
import {cn} from '@/lib/utils'
import {
  clampGlobalScaleSteps,
  GLOBAL_SCALE_STEP_MAX,
  GLOBAL_SCALE_STEP_MIN,
} from '@/lib/neutral-engine/globalScale'
import type {
  ChromaMode,
  LCurve,
  NamingStyle,
} from '@/lib/neutral-engine/types'
import type {OklchPickerSecondary} from '@/lib/neutral-engine/pickerConfig'

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

const chromaOptions: {id: ChromaMode; label: string}[] = [
  {id: 'achromatic', label: 'Achromatic'},
  {id: 'fixed', label: 'Fixed chroma'},
  {id: 'taper_mid', label: 'Taper (mid emphasis)'},
  {id: 'taper_ends', label: 'Taper (ends emphasis)'},
]

const stepOptions: number[] = Array.from(
  {length: GLOBAL_SCALE_STEP_MAX - GLOBAL_SCALE_STEP_MIN + 1},
  (_, i) => GLOBAL_SCALE_STEP_MIN + i,
)

const STEPS_SELECT_VISIBLE_ROW_COUNT = 9
const STEPS_SELECT_LIST_STYLE = {
  maxHeight: `calc(2.375rem * ${STEPS_SELECT_VISIBLE_ROW_COUNT})`,
} as const

type Props = {
  secondary: OklchPickerSecondary
  patchSecondary: (p: Partial<OklchPickerSecondary>) => void
}

function PickerSecondaryControlsInner({secondary, patchSecondary}: Props) {
  const clampedSteps = clampGlobalScaleSteps(secondary.steps)
  const curve = secondary.lCurve ?? 'linear'
  const isLinear = curve === 'linear'

  const strengthPct = Math.round((secondary.lCurveStrength ?? 1) * 100)

  return (
    <CollapsibleControlGroup
      id="picker-secondary-controls"
      title="Ramp geometry & chroma shaping"
      icon={Settings2}
      defaultOpen={false}
    >
      <div className="space-y-4 text-xs">
        <div className="space-y-2">
          <p className="ns-label">Lightness range (lLow … lHigh)</p>
          <p className="picker-caption">
            The ramp is re-centered on picker L; this span sets how wide the ladder is
            before centering.
          </p>
          <Slider
            min={0}
            max={1}
            step={0.005}
            value={[secondary.lLow, secondary.lHigh]}
            onValueChange={([a, b]) => {
              if (typeof a !== 'number' || typeof b !== 'number') return
              const lo = Math.min(a, b)
              const hi = Math.max(a, b)
              patchSecondary({
                lLow: Number(lo.toFixed(4)),
                lHigh: Number(hi.toFixed(4)),
              })
            }}
          />
          <p className="font-mono tabular-nums text-muted">
            lLow {secondary.lLow.toFixed(4)} · lHigh {secondary.lHigh.toFixed(4)}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="ns-label">Steps</span>
            <SelectPrimitives.Root
              id="picker-steps-select"
              value={String(clampedSteps)}
              onValueChange={(v) => {
                if (typeof v !== 'string' || v === '') return
                patchSecondary({steps: Number(v)})
              }}
            >
              <SelectPrimitives.Trigger
                type="button"
                className={cn(
                  INPUT_WORKBENCH_FIELD_CLASS,
                  'flex h-8 min-h-8 w-full min-w-0 items-center justify-between gap-2 px-3 py-0 text-left font-mono text-xs outline-none select-none',
                  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
                  'data-placeholder:text-muted-foreground',
                )}
              >
                <SelectPrimitives.Value>
                  {(val) =>
                    val != null && String(val) !== '' ? `${val} steps` : '—'
                  }
                </SelectPrimitives.Value>
                <SelectPrimitives.Icon className="pointer-events-none flex shrink-0">
                  <ChevronsUpDown className="size-4 opacity-60" aria-hidden />
                </SelectPrimitives.Icon>
              </SelectPrimitives.Trigger>
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
                      style={STEPS_SELECT_LIST_STYLE}
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
                          <SelectPrimitives.ItemIndicator className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
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
          </label>

          <label className="space-y-1">
            <span className="ns-label">Naming</span>
            <ResponsiveSelect
              id="picker-naming"
              className="h-8 w-full py-1 text-xs"
              value={secondary.namingStyle}
              options={namingOptions.map((o) => ({value: o.id, label: o.label}))}
              onValueChange={(v) =>
                patchSecondary({namingStyle: v as NamingStyle})
              }
            />
          </label>

          <label className="space-y-1">
            <span className="ns-label">Chroma mode</span>
            <ResponsiveSelect
              id="picker-chroma-mode"
              className="h-8 w-full py-1 text-xs"
              value={secondary.chromaMode}
              options={chromaOptions.map((o) => ({
                value: o.id,
                label: o.label,
              }))}
              onValueChange={(v) =>
                patchSecondary({chromaMode: v as ChromaMode})
              }
            />
          </label>

          <label className="space-y-1">
            <span className="ns-label">L curve</span>
            <ResponsiveSelect
              id="picker-l-curve"
              className="h-8 w-full py-1 text-xs"
              value={curve}
              options={curveOptions.map((o) => ({value: o.id, label: o.label}))}
              onValueChange={(v) => patchSecondary({lCurve: v as LCurve})}
            />
          </label>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger
              type="button"
              disabled={isLinear}
              aria-label="L curve strength"
              className={cn(
                'inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-hairline bg-raised text-subtle outline-none transition',
                'hover:bg-sidebar-border hover:text-default',
                'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35',
                'disabled:pointer-events-none disabled:opacity-45',
                '[&_svg]:pointer-events-none [&_svg]:size-4',
              )}
            >
              <Settings2 className="size-3.5" aria-hidden />
            </PopoverTrigger>
            <PopoverContent className="w-80 gap-4" align="start" sideOffset={8}>
              <PopoverHeader>
                <PopoverTitle>L curve strength</PopoverTitle>
              </PopoverHeader>
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted tabular-nums">
                  Strength {strengthPct}%
                </span>
                <Slider
                  disabled={isLinear}
                  min={0}
                  max={100}
                  step={1}
                  value={[strengthPct]}
                  onValueChange={([pct]) =>
                    typeof pct === 'number' &&
                    patchSecondary({lCurveStrength: pct / 100})
                  }
                />
                <p className="picker-caption">
                  0% = linear spacing · 100% = full curve
                </p>
              </div>
            </PopoverContent>
          </Popover>
          <span className="picker-caption">
            {isLinear
              ? 'Linear curve — open popover disabled'
              : `Strength ${strengthPct}%`}
          </span>
        </div>
      </div>
    </CollapsibleControlGroup>
  )
}

export const PickerSecondaryControls = memo(PickerSecondaryControlsInner)
