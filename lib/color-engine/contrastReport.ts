import Color from 'colorjs.io'

import type {ContrastReport} from '@/lib/color-engine/types'
import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'

type ColorLike = {L: number; C: number; H: number}

function toColor(v: ColorLike): Color {
  return new Color('oklch', [v.L, v.C, v.H])
}

// For badge display, colorjs.io APCA is acceptable (mean ΔLc 1.12 vs apca-w3).
// For ramp-pick math, use apca-w3 directly (ΔLc up to 11 straddles ARC buckets).
export function contrastReport(
  fg: ColorLike,
  bg: ColorLike,
  model: ContrastModel,
): ContrastReport {
  const fgColor = toColor(fg)
  const bgColor = toColor(bg)
  return {
    wcag: Math.abs(fgColor.contrastWCAG21(bgColor)),
    apca: Math.abs(fgColor.contrast(bgColor, 'APCA')),
  }
}
