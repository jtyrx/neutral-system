'use client'

import {useMemo} from 'react'

import type {NewBlockColors} from '@/components/preview/blockTypes'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

export function useResolvedBlockColors(
  global: GlobalSwatch[],
  tokenView: TokenView,
  brandPlaneOklch: string,
): NewBlockColors {
  return useMemo(() => {
    const interactive = tokensForSemanticLayerPublic(tokenView, 'interactive')
    const scrimToken = interactive.find((t) => t.role === 'overlay.scrim')
    const scrimBg =
      scrimToken?.alpha != null && scrimToken.alpha < 1
        ? `color-mix(in oklch, ${scrimToken.serialized.oklchCss} ${Math.round(scrimToken.alpha * 100)}%, transparent)`
        : scrimToken?.serialized.hex ?? 'rgba(0,0,0,0.45)'
    return {
      brand: trimCssColorValue(brandPlaneOklch) || 'transparent',
      scrimBg,
    }
  }, [global, tokenView, brandPlaneOklch])
}
