import type {GeneratedPalette} from '@/lib/color-engine/types'

// Light:  --color-<name>-0 … --color-<name>-9  (0 = lightest tint)
// Dark:   --color-<name>-dark-0 … --color-<name>-dark-9  (0 = darkest surface)
// 10-stop, 0-indexed — matches Primer's chromatic scale convention.

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
