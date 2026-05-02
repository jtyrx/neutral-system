'use client'

import {memo} from 'react'

import {Input} from '@/components/ui/input'
import {Slider} from '@/components/ui/slider'
import type {OkhslEdit, OkhslView} from '@/lib/neutral-engine/okhsl'

type Props = {
  view: OkhslView
  onEdit: (edit: OkhslEdit, label: string) => void
  /**
   * Resolved canonical OKLCH config values — shown as a compact readout so the designer can see
   * exactly what OKLCH values their OKHSL edits produce (translation-visible requirement).
   */
  resolvedConfig: {
    hue: number
    baseChroma: number
    lHigh: number
    lLow: number
  }
}

function numOr(prev: number, raw: string): number {
  const v = Number(raw)
  return Number.isFinite(v) ? v : prev
}

type FieldProps = {
  label: React.ReactNode
  value: number
  displayValue: string | number
  min: number
  max: number
  step: number
  disabled?: boolean
  hint?: string
  onSliderChange: (v: number) => void
  onInputChange: (raw: string) => void
}

function SliderField({
  label,
  value,
  displayValue,
  min,
  max,
  step,
  disabled,
  hint,
  onSliderChange,
  onInputChange,
}: FieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="ns-label">{label}</span>
        <Input
          type="number"
          variant="ghost"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          disabled={disabled}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-16 shrink-0"
        />
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        disabled={disabled}
        onValueChange={(values) => {
          const v = values[0]
          if (v !== undefined) onSliderChange(v)
        }}
      />
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  )
}

function OkhslSectionInner({view, onEdit, resolvedConfig}: Props) {
  return (
    <section className="space-y-5">
      <header>
        <p className="eyebrow">OKHSL authoring</p>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Edit the ramp via gamut-relative coordinates. Changes commit back to the canonical OKLCH
          config — OKHSL is a view, not separate state.
        </p>
      </header>

      <div className="space-y-5">
        <SliderField
          label="Hue (°)"
          value={Math.round(view.hue * 10) / 10}
          displayValue={Math.round(view.hue * 10) / 10}
          min={0}
          max={360}
          step={0.5}
          onSliderChange={(v) => onEdit({hue: v}, 'OKHSL · Hue')}
          onInputChange={(raw) => onEdit({hue: numOr(view.hue, raw)}, 'OKHSL · Hue')}
        />

        <SliderField
          label={
            <span className="flex items-center gap-1">
              Saturation (0–1)
              <span
                title="Saturation is gamut-relative — S=0.2 at L=0.5 differs from S=0.2 at L=0.95."
                className="cursor-help text-muted"
                aria-label="Saturation is gamut-relative"
              >
                ⓘ
              </span>
            </span>
          }
          value={Math.round(view.saturation * 1000) / 1000}
          displayValue={(Math.round(view.saturation * 1000) / 1000).toFixed(3)}
          min={0}
          max={1}
          step={0.01}
          disabled={view.isAchromatic}
          hint={view.isAchromatic ? 'Achromatic — switch chroma mode to enable saturation.' : undefined}
          onSliderChange={(v) => onEdit({saturation: v}, 'OKHSL · Saturation')}
          onInputChange={(raw) =>
            onEdit({saturation: numOr(view.saturation, raw)}, 'OKHSL · Saturation')
          }
        />

        <SliderField
          label="Light-end L (0–1)"
          value={Math.round(view.lHigh * 10000) / 10000}
          displayValue={(Math.round(view.lHigh * 10000) / 10000).toFixed(4)}
          min={0}
          max={1}
          step={0.005}
          onSliderChange={(v) => onEdit({lHigh: v}, 'OKHSL · Light L')}
          onInputChange={(raw) => onEdit({lHigh: numOr(view.lHigh, raw)}, 'OKHSL · Light L')}
        />

        <SliderField
          label="Dark-end L (0–1)"
          value={Math.round(view.lLow * 10000) / 10000}
          displayValue={(Math.round(view.lLow * 10000) / 10000).toFixed(4)}
          min={0}
          max={1}
          step={0.005}
          onSliderChange={(v) => onEdit({lLow: v}, 'OKHSL · Dark L')}
          onInputChange={(raw) => onEdit({lLow: numOr(view.lLow, raw)}, 'OKHSL · Dark L')}
        />
      </div>

      <div className="border-t border-hairline pt-4">
        <p className="ns-label mb-2">Resolved OKLCH</p>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[0.65rem] text-muted">
          <div>
            <dt className="text-muted/60">Hue (°)</dt>
            <dd className="tabular-nums text-default">{resolvedConfig.hue}</dd>
          </div>
          <div>
            <dt className="text-muted/60">Base chroma (C)</dt>
            <dd className="tabular-nums text-default">{resolvedConfig.baseChroma.toFixed(5)}</dd>
          </div>
          <div>
            <dt className="text-muted/60">Light-end L</dt>
            <dd className="tabular-nums text-default">{resolvedConfig.lHigh.toFixed(4)}</dd>
          </div>
          <div>
            <dt className="text-muted/60">Dark-end L</dt>
            <dd className="tabular-nums text-default">{resolvedConfig.lLow.toFixed(4)}</dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

export const OkhslSection = memo(OkhslSectionInner)
