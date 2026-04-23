import Color from 'colorjs.io'

import type {SerializedColor} from '@/lib/neutral-engine/types'

/**
 * Strips trailing `;` and whitespace from CSS color strings so they parse in Color.js and are
 * valid for React `style` / `backgroundColor` (a trailing semicolon is a CSS declaration
 * terminator, not part of the color value string).
 */
export function trimCssColorValue(s: string): string {
  return s.trim().replace(/;+\s*$/g, '')
}

export function serializeColor(c: Color): SerializedColor {
  const srgb = c.to('srgb')
  const inSrgbGamut = c.inGamut('srgb')
  const clipped = inSrgbGamut ? srgb : c.toGamut('srgb')
  const clippedSrgb = clipped.to('srgb')
  const rgbCss = clippedSrgb.toString({format: 'css'})
  return {
    oklchCss: trimCssColorValue(c.to('oklch').toString({format: 'css'})),
    hex: clippedSrgb.toString({format: 'hex'}),
    rgbCss,
    srgbCss: rgbCss,
    inSrgbGamut,
  }
}

/**
 * Rebuild a {@link Color} instance from a {@link SerializedColor}. Used at call sites that
 * genuinely need Color.js math (WCAG contrast, ΔE) but where the swatch/token surface only
 * carries serialized strings — keeps `Color` instances out of React props/state so DevTools
 * snapshots stay cheap even with large token trees.
 */
export function parseColorFromSerialized(s: SerializedColor): Color {
  return new Color(s.oklchCss)
}

/** Extract OKLCH [L, C, H] from a serialized color without reinstantiating `Color` on the read path. */
export function oklchCoordsFromSerialized(s: SerializedColor): [number, number, number] {
  return new Color(s.oklchCss).to('oklch').coords as [number, number, number]
}
