'use client'

import {ColorSwatchCell} from '@/components/colors/ColorSwatchCell'
import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'
import type {GeneratedPalette, PaletteTheme} from '@/lib/color-engine/types'

type Props = {
  palettes: GeneratedPalette[]
  theme: PaletteTheme
  contrastModel: ContrastModel
}

const STOP_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

export function ColorPaletteGrid({palettes, theme, contrastModel}: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse" role="grid">
        <thead>
          <tr>
            <th className="w-20 py-8 pr-12 text-left font-mono text-[0.65rem] uppercase tracking-wide text-muted">
              Palette
            </th>
            {STOP_LABELS.map((label) => (
              <th
                key={label}
                className="px-4 py-8 text-center font-mono text-[0.65rem] uppercase tracking-wide text-muted"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {palettes.map(({config, light, dark}) => {
            const stops = theme === 'light' ? light : dark
            return (
              <tr key={config.name}>
                <td className="pr-12 py-4 align-top">
                  <span className="font-mono text-[0.7rem] capitalize text-subtle">
                    {config.name}
                  </span>
                </td>
                {stops.map((stop) => (
                  <td key={stop.index} className="px-4 py-4 align-top">
                    <ColorSwatchCell stop={stop} contrastModel={contrastModel} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
ColorPaletteGrid.displayName = 'ColorPaletteGrid'
