import Color from 'colorjs.io'

import type {SerializedColor} from '@/lib/neutral-engine/types'

export function serializeColor(c: Color): SerializedColor {
  const srgb = c.to('srgb')
  const inSrgbGamut = c.inGamut('srgb')
  const clipped = inSrgbGamut ? srgb : c.toGamut('srgb')
  return {
    oklchCss: c.to('oklch').toString({format: 'css'}),
    hex: clipped.to('srgb').toString({format: 'hex'}),
    rgbCss: clipped.to('srgb').toString({format: 'css'}),
    srgbCss: clipped.to('srgb').toString({format: 'css'}),
    inSrgbGamut,
  }
}
