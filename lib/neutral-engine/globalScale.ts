import Color from 'colorjs.io'

import {labelForIndex} from '@/lib/neutral-engine/naming'
import {serializeColor} from '@/lib/neutral-engine/serialize'
import type {ChromaMode, GlobalScaleConfig, GlobalSwatch} from '@/lib/neutral-engine/types'

function chromaAtT(mode: ChromaMode, baseChroma: number, t: number): number {
  switch (mode) {
    case 'achromatic':
      return 0
    case 'fixed':
      return baseChroma
    case 'taper_mid':
      return baseChroma * Math.sin(Math.PI * t)
    case 'taper_ends':
      return baseChroma * (1 - Math.sin(Math.PI * t))
    default:
      return 0
  }
}

function buildOklchString(L: number, C: number, hueDeg: number | null): string {
  const Lpct = L <= 1 ? `${(L * 100).toFixed(3)}%` : `${L}%`
  if (C === 0 || hueDeg === null) {
    return `oklch(${Lpct} 0 none)`
  }
  return `oklch(${Lpct} ${C.toFixed(5)} ${hueDeg})`
}

/**
 * Deterministic global ramp: index 0 = lightest (lHigh), last = darkest (lLow).
 * Linear lightness in OKLCH; chroma modes shape C across t ∈ [0,1].
 */
function finiteOr(n: number, fallback: number): number {
  return Number.isFinite(n) ? n : fallback
}

export function buildGlobalScale(config: GlobalScaleConfig): GlobalSwatch[] {
  const {chromaMode, baseChroma, hue, namingStyle, variantId} = config
  const steps = finiteOr(config.steps, 48)
  const lHigh = Math.min(1, Math.max(0, finiteOr(config.lHigh, 0.985)))
  const lLow = Math.min(1, Math.max(0, finiteOr(config.lLow, 0.04)))
  const n = Math.max(2, Math.min(256, Math.floor(steps)))
  const useHue = variantId === 'pure' || chromaMode === 'achromatic' ? null : finiteOr(hue, 260)
  const out: GlobalSwatch[] = []

  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    const L = lHigh + t * (lLow - lHigh)
    let C = chromaAtT(chromaMode, finiteOr(baseChroma, 0), t)
    if (variantId === 'pure' || chromaMode === 'achromatic') {
      C = 0
    }
    const css = buildOklchString(L, C, useHue)
    const color = new Color(css).to('srgb')
    const label = labelForIndex(namingStyle, i, n)
    out.push({
      index: i,
      label,
      color,
      serialized: serializeColor(color),
    })
  }

  return out
}
