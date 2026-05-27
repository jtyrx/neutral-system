import type {GeneratedPalette} from '@/lib/color-engine/types'

// Light:  --color-<name>-1 … --color-<name>-9
// Dark:   --color-<name>-dark-1 … --color-<name>-dark-9
// Mirrors the neutral convention (--color-neutral-<label>).

export function exportPalettesCss(palettes: GeneratedPalette[]): string {
  const rootLines: string[] = [':root {']
  const darkLines: string[] = ['[data-theme="dark"] {']

  for (const {config, light, dark} of palettes) {
    rootLines.push(`  /* ${config.name} */`)
    for (const stop of light) {
      rootLines.push(`  --color-${config.name}-${stop.index}: ${stop.oklchCss};`)
    }

    darkLines.push(`  /* ${config.name} */`)
    for (const stop of dark) {
      darkLines.push(`  --color-${config.name}-dark-${stop.index}: ${stop.oklchCss};`)
    }
  }

  rootLines.push('}')
  darkLines.push('}')

  return [...rootLines, '', ...darkLines].join('\n')
}
