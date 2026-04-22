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
  return {
    oklchCss: trimCssColorValue(c.to('oklch').toString({format: 'css'})),
    hex: clipped.to('srgb').toString({format: 'hex'}),
    rgbCss: clipped.to('srgb').toString({format: 'css'}),
    srgbCss: clipped.to('srgb').toString({format: 'css'}),
    inSrgbGamut,
  }
}
