import Color from 'colorjs.io'
import {APCAcontrast, sRGBtoY} from 'apca-w3'

export type ContrastModel = 'wcag-2.1' | 'apca'

export const WCAG_TEXT_TARGETS = [4.5, 3.0, 2.0, 1.5] as const
export const APCA_TEXT_TARGETS = [75, 60, 45, 30] as const

export function textTargetsForModel(model: ContrastModel): readonly number[] {
  return model === 'apca' ? APCA_TEXT_TARGETS : WCAG_TEXT_TARGETS
}

function toSrgb255(c: Color): [number, number, number] {
  const s = c.to('srgb').toGamut({space: 'srgb', method: 'css'})
  return s.coords.map((v) => Math.round(Math.max(0, Math.min(1, v ?? 0)) * 255)) as [
    number,
    number,
    number,
  ]
}

/** Returns signed Lc (APCA) or ratio (WCAG 2.1). */
export function computeContrast(text: Color, bg: Color, model: ContrastModel): number {
  if (model === 'apca') {
    return APCAcontrast(sRGBtoY(toSrgb255(text)), sRGBtoY(toSrgb255(bg)))
  }
  return text.contrastWCAG21(bg)
}
