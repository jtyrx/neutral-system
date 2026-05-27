'use client'

import {useState} from 'react'

import {useColorPalettesContext} from '@/components/providers/ColorPalettesProvider'
import {ColorExportSection} from '@/components/colors/ColorExportSection'
import {ColorPaletteControls} from '@/components/colors/ColorPaletteControls'
import {ColorPaletteGrid} from '@/components/colors/ColorPaletteGrid'
import type {PaletteTheme} from '@/lib/color-engine/types'
import {cn} from '@/lib/utils'

function ThemeTab({
  value,
  active,
  onClick,
}: {
  value: PaletteTheme
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-12 py-6 font-mono text-[0.7rem] capitalize border-b-2 transition-colors',
        active
          ? 'border-default text-default'
          : 'border-transparent text-subtle hover:text-default',
      )}
    >
      {value}
    </button>
  )
}

export function ColorWorkbench() {
  const wb = useColorPalettesContext()
  const [previewTheme, setPreviewTheme] = useState<PaletteTheme>('light')

  return (
    <div className="flex flex-col h-full min-h-0">
      <header className="flex items-center justify-between border-b border-hairline px-16 py-10">
        <div className="flex items-center gap-0">
          <ThemeTab value="light" active={previewTheme === 'light'} onClick={() => setPreviewTheme('light')} />
          <ThemeTab value="dark" active={previewTheme === 'dark'} onClick={() => setPreviewTheme('dark')} />
        </div>
        <p className="font-mono text-micro text-muted">
          {wb.gamut === 'srgb' ? 'sRGB' : wb.gamut === 'display-p3' ? 'Display P3' : 'Max chroma'}
        </p>
      </header>

      <ColorPaletteControls
        palettes={wb.palettes}
        gamut={wb.gamut}
        contrastModel={wb.contrastModel}
        previewTheme={previewTheme}
        lightStops={wb.lightStops}
        darkStops={wb.darkStops}
        onGamutChange={wb.setGamut}
        onContrastModelChange={wb.setContrastModel}
        onHueChange={wb.setHue}
        onResetHues={wb.resetHues}
        onStopChange={(theme, index, value) =>
          theme === 'light' ? wb.setLightStop(index, value) : wb.setDarkStop(index, value)
        }
        onResetStops={wb.resetStops}
      />

      <div className="flex-1 overflow-auto px-16 pb-16">
        <ColorPaletteGrid
          palettes={wb.generatedPalettes}
          theme={previewTheme}
          contrastModel={wb.contrastModel}
        />
      </div>

      <ColorExportSection palettes={wb.generatedPalettes} />
    </div>
  )
}
ColorWorkbench.displayName = 'ColorWorkbench'
