import type Color from 'colorjs.io'

import {contrastTextOnBg, wcagLargeText} from '@/lib/neutral-engine/contrast'
import {parseColorFromSerialized} from '@/lib/neutral-engine/serialize'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'

export type SwatchAdvice = {
  tooCloseToNext: boolean
  deltaEOK: number | null
  wcagOnWhite: ReturnType<typeof wcagLargeText>
  wcagOnBlack: ReturnType<typeof wcagLargeText>
  hint: string | null
}

export function analyzeSwatch(
  s: GlobalSwatch,
  next: GlobalSwatch | undefined,
  bgLight: Color,
  bgDark: Color,
): SwatchAdvice {
  const sColor = parseColorFromSerialized(s.serialized)
  const deltaEOK =
    next != null ? sColor.deltaEOK(parseColorFromSerialized(next.serialized)) : null
  const tooClose = deltaEOK != null && deltaEOK < 0.015

  const cw = contrastTextOnBg(sColor, bgLight)
  const ck = contrastTextOnBg(sColor, bgDark)

  let hint: string | null = null
  if (tooClose) hint = 'Very close to next step (ΔE_OK)'
  else if (cw >= 4.5) hint = 'Strong contrast vs light bg — usable for text on light surfaces'
  else if (ck >= 4.5) hint = 'Strong contrast vs dark bg — usable for text on dark surfaces'

  return {
    tooCloseToNext: tooClose,
    deltaEOK,
    wcagOnWhite: wcagLargeText(cw),
    wcagOnBlack: wcagLargeText(ck),
    hint,
  }
}
