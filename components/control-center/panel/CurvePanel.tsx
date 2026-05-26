'use client'

import {memo} from 'react'

import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {Slider} from '@/components/ui/slider.tsx'
import type {LightnessModel} from '@/lib/neutral-engine/types'

const panelStackClassName = 'flex flex-col gap-8'
const panelSectionClassName = 'flex flex-col gap-4'
const sectionHeadingClassName = 'text-sm font-semibold'
const fieldRowClassName = 'flex flex-row justify-between items-baseline gap-2'
const fieldLabelClassName = 'text-xs uppercase tracking-wider opacity-75'

function RampCurveCard({theme}: {theme: 'light' | 'dark'}) {
  const wb = useNeutralWorkbenchContext()
  const config = theme === 'light' ? wb.lightScale : wb.darkScale
  const patch = theme === 'light' ? wb.patchLight : wb.patchDark

  const midpoint = config.lightnessModel?.midpoint ?? 0.5
  const midpointPct = Math.round(midpoint * 100)

  function handleMidpoint(val: number[] | number) {
    const pct = Array.isArray(val) ? val[0] : val
    if (typeof pct !== 'number') return
    const model: LightnessModel = {kind: 'linear-oklch', midpoint: pct / 100}
    patch('lightnessModel', model)
  }

  return (
    <div className={panelSectionClassName}>
      <div className={fieldRowClassName}>
        <label htmlFor={`midpoint-slider-${theme}`} className={fieldLabelClassName}>
          Midpoint {midpointPct}%
        </label>
        <Slider
          id={`midpoint-slider-${theme}`}
          min={0}
          max={100}
          value={[midpointPct]}
          onValueChange={handleMidpoint}
        />
      </div>
      <p className="text-xs opacity-50">
        {'<'} 50% more light steps · 50% linear · {'>'} 50% more dark steps
      </p>
    </div>
  )
}

RampCurveCard.displayName = 'RampCurveCard'

function CurvePanelInner() {
  return (
    <div className={panelStackClassName}>
      <section aria-labelledby="curve-panel-light-heading" className={panelSectionClassName}>
        <h3 id="curve-panel-light-heading" className={sectionHeadingClassName}>
          Light
        </h3>
        <RampCurveCard theme="light" />
      </section>

      <section aria-labelledby="curve-panel-dark-heading" className={panelSectionClassName}>
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
