import Color from 'colorjs.io'

import type {ChromaPolicy, OklchStop, PaletteGamut, PaletteName, PaletteTheme} from '@/lib/color-engine/types'
import {maxInGamutChroma} from '@/lib/neutral-engine/gamutProbing'
import type {OklchGamutTarget} from '@/lib/neutral-engine/gamutProbing'
import {PALETTE_DARK_L, PALETTE_LIGHT_L} from '@/lib/color-engine/presetLightness'

function gamutTarget(gamut: PaletteGamut): OklchGamutTarget {
  return gamut === 'display-p3' ? 'p3' : 'srgb'
}

function round(v: number, decimals: number): number {
  const f = Math.pow(10, decimals)
  return Math.round(v * f) / f
}

export type GeneratePaletteOpts = {
  name: PaletteName
  hue: number
  theme: PaletteTheme
  gamut: PaletteGamut
  chromaPolicy: ChromaPolicy
  // Override default lightness array (length 9). Omit to use preset.
  lightness?: readonly number[]
}

export function generatePalette(opts: GeneratePaletteOpts): OklchStop[] {
  const target = gamutTarget(opts.gamut)
  const lightnessArr =
    opts.lightness ??
    (opts.theme === 'light' ? PALETTE_LIGHT_L[opts.name] : PALETTE_DARK_L[opts.name])

  // 1. Resolve chroma per stop
  const maxChromaPerStop = lightnessArr.map((L) =>
    maxInGamutChroma(L, opts.hue, {targetSpace: target}),
  )

  let resolvedChroma: number[]
  if (opts.chromaPolicy === 'max') {
    resolvedChroma = maxChromaPerStop
  } else {
    // even: uniform C = min across all stops (bottleneck constrains palette)
    const cEven = Math.min(...maxChromaPerStop)
    resolvedChroma = lightnessArr.map(() => cEven)
  }

  // 2. Resolve surface anchor (stop index 1 = array index 0 = surface.default)
  const surfaceL = lightnessArr[0] ?? 0.97
  const surfaceC = resolvedChroma[0] ?? 0
  const surfaceColor = new Color('oklch', [surfaceL, surfaceC, opts.hue])

  const white = new Color('oklch', [1, 0, 0])
  const black = new Color('oklch', [0, 0, 0])

  // 3. Build stops
  return lightnessArr.map((L, i) => {
    const C = resolvedChroma[i] ?? 0
    const H = opts.hue
    const color = new Color('oklch', [L, C, H])

    const inSrgb = color.inGamut('srgb')
    const inP3 = color.inGamut('p3')

    // Clip to sRGB for serialization — matches globalScale.ts render-layer pattern
    const srgbClamped = color.toGamut({space: 'srgb', method: 'css'})
    const hex = srgbClamped.toString({format: 'hex'})
    const oklchCss = `oklch(${round(L, 4)} ${round(C, 4)} ${round(H, 2)})`

    return {
      index: i + 1,
      L,
      C,
      H,
      hex,
      oklchCss,
      inSrgb,
      inP3,
      contrastOnWhite: {
        wcag: Math.abs(color.contrastWCAG21(white)),
        apca: Math.abs(color.contrast(white, 'APCA')),
      },
      contrastOnBlack: {
        wcag: Math.abs(color.contrastWCAG21(black)),
        apca: Math.abs(color.contrast(black, 'APCA')),
      },
      contrastOnSurface: {
        wcag: Math.abs(color.contrastWCAG21(surfaceColor)),
        apca: Math.abs(color.contrast(surfaceColor, 'APCA')),
      },
    }
  })
}

// Convenience: generate both themes for a palette config
export function generateBothThemes(opts: {
  name: PaletteName
  hue: number
  gamut: PaletteGamut
  chromaPolicy: ChromaPolicy
}): {light: OklchStop[]; dark: OklchStop[]} {
  return {
    light: generatePalette({...opts, theme: 'light'}),
    dark: generatePalette({...opts, theme: 'dark'}),
  }
}
