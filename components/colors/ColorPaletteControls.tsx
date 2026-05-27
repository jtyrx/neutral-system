'use client'

import type {ChromaPolicy, PaletteConfig, PaletteGamut} from '@/lib/color-engine/types'
import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'
import {cn} from '@/lib/utils'

type Props = {
  palettes: PaletteConfig[]
  chromaPolicy: ChromaPolicy
  contrastModel: ContrastModel
  onChromaPolicyChange: (p: ChromaPolicy) => void
  onContrastModelChange: (m: ContrastModel) => void
  onHueChange: (name: string, hue: number) => void
  onResetHues: () => void
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
    <div className="flex rounded-md border border-hairline bg-sunken overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-10 py-5 text-[0.7rem] font-mono transition-colors',
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
  chromaPolicy,
  contrastModel,
  onChromaPolicyChange,
  onContrastModelChange,
  onHueChange,
  onResetHues,
}: Props) {
  return (
    <div className="flex flex-col gap-16 p-16">
      <div className="flex flex-wrap items-center gap-12">
        <div className="flex items-center gap-8">
          <span className="text-[0.7rem] text-subtle">Chroma</span>
          <TogglePair
            value={chromaPolicy}
            options={[
              {label: 'Max chroma', value: 'max'},
              {label: 'Even chroma', value: 'even'},
            ]}
            onChange={onChromaPolicyChange}
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

      <div className="grid gap-8" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))'}}>
        {palettes.map((p) => (
          <label key={p.name} className="flex flex-col gap-4">
            <span className="font-mono text-micro capitalize text-subtle">{p.name} hue</span>
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
    </div>
  )
}
ColorPaletteControls.displayName = 'ColorPaletteControls'
