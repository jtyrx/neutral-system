'use client'

import {memo, useCallback} from 'react'

import {OklchAxisGraph} from '@/components/picker/OklchAxisGraph'
import type {OklchAxisId} from '@/components/picker/OklchAxisGraph'
import {INPUT_WORKBENCH_FIELD_CLASS} from '@/components/ui/input.tsx'
import {Slider} from '@/components/ui/slider.tsx'
import type {DisplayGamutTier} from '@/lib/neutral-engine/displayGamut'
import type {OklchPickerTriple} from '@/lib/neutral-engine/pickerConfig'
import {cn} from '@/lib/utils'

type Props = {
  picker: OklchPickerTriple
  patchPicker: (p: Partial<OklchPickerTriple>) => void
  displayTier: DisplayGamutTier
}

const fieldClass = cn(
  INPUT_WORKBENCH_FIELD_CLASS,
  'h-8 w-full max-w-28 shrink rounded-md px-2.5 py-1 font-mono text-xs tabular-nums',
)

type AxisSliderFieldProps = {
  axis: OklchAxisId
  value: number
  min: number
  max: number
  step: number
  picker: OklchPickerTriple
  displayTier: DisplayGamutTier
  onChange: (v: number) => void
}

function AxisSliderField({axis, value, min, max, step, picker, displayTier, onChange}: AxisSliderFieldProps) {
  const id = `oklch-${axis.toLowerCase()}`
  const displayValue = step < 1 ? String(Number(value.toFixed(4))) : String(Math.round(value))
  const inputMode = step < 1 ? 'decimal' : 'numeric'

  return (
    <div className="space-y-2">
      <div className="picker-control-row">
        <label htmlFor={id} className="ns-label min-w-12 shrink-0">
          {axis}
        </label>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[value]}
          onValueChange={([v]) => typeof v === 'number' && onChange(v)}
          className="min-w-0 flex-1"
        />
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          className={fieldClass}
          value={displayValue}
          onChange={(e) => {
            const n = parseFloat(e.target.value)
            if (Number.isFinite(n)) onChange(n)
          }}
        />
      </div>
      <OklchAxisGraph axis={axis} picker={picker} displayTier={displayTier} />
    </div>
  )
}

function OklchControlsInner({picker, patchPicker, displayTier}: Props) {
  const setL = useCallback(
    (v: number) => patchPicker({L: Math.min(1, Math.max(0, Number(v.toFixed(4))))}),
    [patchPicker],
  )
  const setC = useCallback(
    (v: number) => patchPicker({C: Math.min(0.4, Math.max(0, Number(v.toFixed(4))))}),
    [patchPicker],
  )
  const setH = useCallback(
    (v: number) => patchPicker({H: ((Math.round(v) % 360) + 360) % 360}),
    [patchPicker],
  )

  return (
    <div className="space-y-6">
      <AxisSliderField axis="L" value={picker.L} min={0} max={1} step={0.001} picker={picker} displayTier={displayTier} onChange={setL} />
      <AxisSliderField axis="C" value={picker.C} min={0} max={0.4} step={0.001} picker={picker} displayTier={displayTier} onChange={setC} />
      <AxisSliderField axis="H" value={picker.H} min={0} max={360} step={1} picker={picker} displayTier={displayTier} onChange={setH} />
    </div>
  )
}

export const OklchControls = memo(OklchControlsInner)
