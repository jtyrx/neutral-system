import Color from 'colorjs.io'

import {labelsForNamingStyle} from '@/lib/neutral-engine/naming'
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

/** Inclusive; global ladder step count allowed in the builder UI and engine. */
export const GLOBAL_SCALE_STEP_MIN = 8
export const GLOBAL_SCALE_STEP_MAX = 48

/**
 * Deterministic global ramp: index 0 = lightest (lHigh), last = darkest (lLow).
 * Linear lightness in OKLCH; chroma modes shape C across t ∈ [0,1].
 */
function finiteOr(n: number, fallback: number): number {
  return Number.isFinite(n) ? n : fallback
}

/** Floors to an integer and pins to [GLOBAL_SCALE_STEP_MIN, GLOBAL_SCALE_STEP_MAX]. NaN → max. */
export function clampGlobalScaleSteps(raw: number): number {
  const v = Number.isFinite(raw) ? raw : GLOBAL_SCALE_STEP_MAX
  const floored = Math.floor(v)
  return Math.max(GLOBAL_SCALE_STEP_MIN, Math.min(GLOBAL_SCALE_STEP_MAX, floored))
}

export function buildGlobalScale(config: GlobalScaleConfig): GlobalSwatch[] {
  const {chromaMode, baseChroma, hue, namingStyle} = config
  const steps = finiteOr(config.steps, GLOBAL_SCALE_STEP_MAX)
  const lHigh = Math.min(1, Math.max(0, finiteOr(config.lHigh, 0.985)))
  const lLow = Math.min(1, Math.max(0, finiteOr(config.lLow, 0.04)))
  const n = clampGlobalScaleSteps(steps)
  /** Hue applies only when chroma can be non-zero; achromatic uses `oklch(L 0 none)` via {@link buildOklchString}. */
  const useHue = chromaMode === 'achromatic' ? null : finiteOr(hue, 260)
  const out: GlobalSwatch[] = []
  const labels = labelsForNamingStyle(namingStyle, n)

  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    const L = lHigh + t * (lLow - lHigh)
    const C = chromaAtT(chromaMode, finiteOr(baseChroma, 0), t)
    const css = buildOklchString(L, C, useHue)
    const color = new Color(css).to('srgb')
    const label = labels[i] ?? String(i)
    out.push({
      index: i,
      label,
      color,
      serialized: serializeColor(color),
    })
  }

  return out
}
