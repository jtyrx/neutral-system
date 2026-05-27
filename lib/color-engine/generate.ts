import Color from 'colorjs.io'

import type {OklchStop, PaletteGamut, PaletteName, PaletteTheme} from '@/lib/color-engine/types'
import {maxInGamutChroma} from '@/lib/neutral-engine/gamutProbing'
import type {OklchGamutTarget} from '@/lib/neutral-engine/gamutProbing'
import {PALETTE_DARK_L, PALETTE_LIGHT_L} from '@/lib/color-engine/presetLightness'

function gamutTarget(gamut: PaletteGamut): OklchGamutTarget {
  if (gamut === 'display-p3') return 'p3'
  if (gamut === 'rec2020') return 'rec2020'
  return 'srgb'
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

  const resolvedChroma = maxChromaPerStop

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
    // MINDE allows colors slightly outside the strict P3 cube (ΔE_OK ≈ 0.02);
    // check with a small tolerance to avoid false P3+ badges on P3-targeted stops.
    const p3Clamped = color.toGamut({space: 'p3', method: 'css'})
    const inP3 = color.inGamut('p3') || (p3Clamped as Color).deltaEOK(color) < 0.02

    // Clip to sRGB for serialization — matches globalScale.ts render-layer pattern
    const srgbClamped = color.toGamut({space: 'srgb', method: 'css'})
    const hex = srgbClamped.toString({format: 'hex'})
    const srgbDeltaE = (srgbClamped as Color).deltaEOK(color)
    const oklchCss = `oklch(${round(L, 4)} ${round(C, 4)} ${round(H, 2)})`

    return {
      index: i,
      L,
      C,
      H,
      hex,
      oklchCss,
      inSrgb,
      inP3,
      srgbDeltaE,
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
  lightness?: readonly number[]
  darkness?: readonly number[]
}): {light: OklchStop[]; dark: OklchStop[]} {
  return {
    light: generatePalette({
      name: opts.name, hue: opts.hue, gamut: opts.gamut, theme: 'light',
      ...(opts.lightness !== undefined && {lightness: opts.lightness}),
    }),
    dark: generatePalette({
      name: opts.name, hue: opts.hue, gamut: opts.gamut, theme: 'dark',
      ...(opts.darkness !== undefined && {lightness: opts.darkness}),
    }),
  }
}
