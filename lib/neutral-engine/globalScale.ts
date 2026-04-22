import Color from 'colorjs.io'

import {bumpBuildGlobalScaleCalls, getLastPreset, presetDebugEnabled} from '@/lib/debug/presetDebug'
import {labelsForNamingStyle} from '@/lib/neutral-engine/naming'
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

// Small in-memory cache: global scale is pure/deterministic and frequently recomputed
// (main ramp + comparison rails + previews). Keep it tiny to avoid unbounded memory.
const GLOBAL_SCALE_CACHE_MAX = 24
const globalScaleCache = new Map<string, GlobalSwatch[]>()

function cacheKeyForGlobalScale(config: GlobalScaleConfig): string {
  // Only include fields that affect output. Keep stable, small, and deterministic.
  return [
    clampGlobalScaleSteps(config.steps),
    config.lHigh,
    config.lLow,
    config.chromaMode,
    config.baseChroma,
    config.hue,
    config.namingStyle,
  ].join('|')
}

export function buildGlobalScale(config: GlobalScaleConfig): GlobalSwatch[] {
  const key = cacheKeyForGlobalScale(config)
  const cached = globalScaleCache.get(key)
  if (cached) {
    globalScaleCache.delete(key)
    globalScaleCache.set(key, cached)
    return cached
  }

  if (presetDebugEnabled()) {
    const last = getLastPreset()
    if (last) bumpBuildGlobalScaleCalls(last.at)
  }
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
    // Avoid parsing CSS strings on the hot path. Color.js accepts numeric coords:
    // `new Color('oklch', [L, C, h])`. This is dramatically faster than `new Color("oklch(...)")`
    // when recomputing ramps (e.g. preset selection + comparison rails).
    const h = useHue ?? 0
    const color = new Color('oklch', [L, C, h]).to('srgb')
    const label = labels[i] ?? String(i)
    const css = buildOklchString(L, C, useHue)
    // Hot path: avoid `serializeColor()` (multiple conversions + stringification per swatch).
    // We already have sRGB; compute a clipped variant once and format strings once.
    const inSrgbGamut = color.inGamut('srgb')
    const clipped = inSrgbGamut ? color : color.toGamut('srgb')
    const rgbCss = clipped.toString({format: 'css'})
    const hex = clipped.toString({format: 'hex'})
    out.push({
      index: i,
      label,
      color,
      // Preserve canonical OKLCH strings (with `none` hue when achromatic).
      serialized: {
        oklchCss: css,
        hex,
        rgbCss,
        srgbCss: rgbCss,
        inSrgbGamut,
      },
    })
  }

  globalScaleCache.set(key, out)
  if (globalScaleCache.size > GLOBAL_SCALE_CACHE_MAX) {
    const oldest = globalScaleCache.keys().next().value
    if (oldest) globalScaleCache.delete(oldest)
  }
  return out
}
