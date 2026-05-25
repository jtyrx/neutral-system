'use client'

import {Moon, Sun} from 'lucide-react'
import {memo, type ChangeEvent} from 'react'

import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {Input} from '@/components/ui/input.tsx'
import {ResponsiveSelect} from '@/components/ui/responsive-select.tsx'
import {Slider} from '@/components/ui/slider.tsx'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import type {LCurve} from '@/lib/neutral-engine/types'

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
const themeHeadingClassName =
  'mb-10 flex items-center gap-6 text-xs leading-4 font-medium text-foreground'
const fieldRowClassName = 'flex flex-col gap-6'
const fieldLabelClassName = 'text-xs leading-4 text-muted'
const fieldValueClassName = 'tabular-nums font-medium text-foreground'
const pivotInputClassName =
  'h-32 min-h-32 w-56 min-w-56 shrink-0 [appearance:textfield] rounded-full border border-[color-mix(in_oklch,var(--chrome-hairline)_90%,transparent)] bg-[color-mix(in_oklch,var(--muted)_35%,transparent)] px-6 text-center font-mono text-xs leading-4 text-foreground tabular-nums shadow-none outline-none transition-[color,background-color,border-color,box-shadow] hover:bg-[color-mix(in_oklch,var(--muted)_50%,transparent)] focus-visible:border-ring focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--ring)_35%,transparent)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
const pivotRowClassName = 'flex items-center gap-12'
const pivotLabelClassName = 'flex-1 text-xs leading-4 text-muted'

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
