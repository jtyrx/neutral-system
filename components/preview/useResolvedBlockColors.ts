'use client'

import {useMemo} from 'react'

import type {ResolvedBlockColors} from '@/components/preview/blockTypes'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {tokensForSemanticLayerPublic} from '@/lib/neutral-engine/tokenViews'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

function hexByRole(tokens: {role: string; serialized: {hex: string}}[], role: string, fb: string) {
  return tokens.find((t) => t.role === role)?.serialized.hex ?? fb
}

export function useResolvedBlockColors(
  global: GlobalSwatch[],
  tokenView: TokenView,
  brandPlaneOklch: string,
): ResolvedBlockColors {
  return useMemo(() => {
    const surface = tokensForSemanticLayerPublic(tokenView, 'surface')
    const text = tokensForSemanticLayerPublic(tokenView, 'text')
    const border = tokensForSemanticLayerPublic(tokenView, 'border')
    const interactive = tokensForSemanticLayerPublic(tokenView, 'interactive')

    const page = hexByRole(surface, 'surface.default', global[0]?.serialized.hex ?? '#fafafa')
    const inverse = hexByRole(surface, 'surface.inverse', global[global.length - 1]?.serialized.hex ?? '#18181b')
    const scrimToken = interactive.find((t) => t.role === 'overlay.scrim')
    const scrimBg =
      scrimToken?.alpha != null && scrimToken.alpha < 1
        ? `color-mix(in oklch, ${scrimToken.serialized.oklchCss} ${Math.round(scrimToken.alpha * 100)}%, transparent)`
        : scrimToken?.serialized.hex ?? 'rgba(0,0,0,0.45)'

    return {
      page,
      sunken: hexByRole(surface, 'surface.sunken', page),
      subtle: hexByRole(surface, 'surface.subtle', page),
      raised: hexByRole(surface, 'surface.raised', page),
      overlay: hexByRole(surface, 'surface.overlay', hexByRole(surface, 'surface.raised', page)),
      inverse,
      brand: trimCssColorValue(brandPlaneOklch) || 'transparent',
      td: hexByRole(text, 'text.default', '#18181b'),
      ts: hexByRole(text, 'text.subtle', hexByRole(text, 'text.default', '#18181b')),
      tm: hexByRole(text, 'text.muted', hexByRole(text, 'text.subtle', '#18181b')),
      tdis: hexByRole(text, 'text.disabled', hexByRole(text, 'text.muted', '#18181b')),
      ton: hexByRole(text, 'text.on', '#fafafa'),
      bs: hexByRole(border, 'border.subtle', '#e4e4e7'),
      bd: hexByRole(border, 'border.default', hexByRole(border, 'border.subtle', '#e4e4e7')),
      bStr: hexByRole(border, 'border.strong', hexByRole(border, 'border.default', '#e4e4e7')),
      bFocus: hexByRole(border, 'border.focus', hexByRole(border, 'border.strong', '#e4e4e7')),
      scrimBg,
    }
  }, [global, tokenView, brandPlaneOklch])
}
