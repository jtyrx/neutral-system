'use client'

import type {
  PaletteConfig,
  PaletteGamut,
  PaletteTheme,
} from '@/lib/color-engine/types'
import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'
import {cn} from '@/lib/utils'

type Props = {
  palettes: PaletteConfig[]
  gamut: PaletteGamut
  contrastModel: ContrastModel
  previewTheme: PaletteTheme
  lightStops: number[]
  darkStops: number[]
  onGamutChange: (g: PaletteGamut) => void
  onContrastModelChange: (m: ContrastModel) => void
  onHueChange: (name: string, hue: number) => void
  onResetHues: () => void
  onStopChange: (theme: PaletteTheme, index: number, value: number) => void
  onResetStops: () => void
}

function TogglePair<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: {label: string; value: T}[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-hairline bg-sunken">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-10 py-5 font-mono text-[0.7rem] transition-colors',
            value === opt.value
              ? 'bg-default text-default'
              : 'text-subtle hover:text-default',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function ColorPaletteControls({
  palettes,
  gamut,
  contrastModel,
  previewTheme,
  lightStops,
  darkStops,
  onGamutChange,
  onContrastModelChange,
  onHueChange,
  onResetHues,
  onStopChange,
  onResetStops,
}: Props) {
  const activeStops = previewTheme === 'light' ? lightStops : darkStops

  return (
    <div className="flex flex-col gap-16 p-16">
      {/* Global toggles */}
      <div className="flex flex-wrap items-center gap-12">
        <div className="flex items-center gap-8">
          <span className="text-[0.7rem] text-subtle">Gamut</span>
          <TogglePair
            value={gamut}
            options={[
              {label: 'sRGB', value: 'srgb'},
              {label: 'Display P3', value: 'display-p3'},
              {label: 'Max chroma', value: 'rec2020'},
            ]}
            onChange={onGamutChange}
          />
        </div>
        <div className="flex items-center gap-8">
          <span className="text-[0.7rem] text-subtle">Contrast</span>
          <TogglePair
            value={contrastModel}
            options={[
              {label: 'APCA', value: 'apca'},
              {label: 'WCAG', value: 'wcag-2.1'},
            ]}
            onChange={onContrastModelChange}
          />
        </div>
      </div>

      {/* Hue sliders */}
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] text-subtle">Hues</span>
        <button
          type="button"
          onClick={onResetHues}
          className="rounded-md border border-hairline bg-raised px-10 py-5 font-mono text-[0.7rem] text-subtle transition-colors hover:text-default"
        >
          Reset all
        </button>
      </div>

      <div
        className="grid gap-8"
        style={{gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))'}}
      >
        {palettes.map((p) => (
          <label key={p.name} className="flex flex-col gap-4">
            <span className="font-mono text-micro text-subtle capitalize">
              {p.name} hue
            </span>
            <div className="flex items-center gap-8">
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={p.hue}
                onChange={(e) => onHueChange(p.name, Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-24 text-right font-mono text-micro text-muted">
                {Math.round(p.hue)}°
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Lightness curve — scoped to the active preview theme */}
      <div className="flex items-center justify-between">
        <span className="text-[0.7rem] text-subtle capitalize">
          {previewTheme} lightness curve
        </span>
        <button
          type="button"
          onClick={onResetStops}
          className="rounded-md border border-hairline bg-raised px-10 py-5 font-mono text-[0.7rem] text-subtle transition-colors hover:text-default"
        >
          Reset curve
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {activeStops.map((L, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="w-10 text-right font-mono text-micro text-muted">
              {i}
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={L}
              onChange={(e) =>
                onStopChange(previewTheme, i, Number(e.target.value))
              }
              className="flex-1"
            />
            <span className="w-28 text-right font-mono text-micro text-muted">
              {Math.round(L * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
ColorPaletteControls.displayName = 'ColorPaletteControls'
