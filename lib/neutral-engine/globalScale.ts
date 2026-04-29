import Color from 'colorjs.io'

import {bumpBuildGlobalScaleCalls, getLastPreset, presetDebugEnabled} from '@/lib/debug/presetDebug'
import {labelsForNamingStyle} from '@/lib/neutral-engine/naming'
import type {ChromaMode, GlobalScaleConfig, GlobalSwatch, LCurve} from '@/lib/neutral-engine/types'

/**
 * Maps `t ∈ [0,1]` through the lightness curve shape only (does not interpolate to L).
 *
 * - `linear` (default): `t`.
 * - `ease-in-dark`: quadratic t² — more L spread in dark region.
 * - `ease-out-light`: quadratic ease-out — more L spread in light region.
 * - `s-curve`: smooth-step S — more spread at both extremes, compressed in the mid-range.
 */
export function mapLightnessT(t: number, curve?: LCurve): number {
  switch (curve ?? 'linear') {
    case 'ease-in-dark':
      return t * t
    case 'ease-out-light':
      return 1 - (1 - t) * (1 - t)
    case 's-curve':
      return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)
    default:
      return t
  }
}

function clampLCurveStrength(raw: number | undefined): number {
  const v = raw === undefined ? 1 : raw
  const n = Number.isFinite(v) ? v : 1
  return Math.min(1, Math.max(0, n))
}

/**
 * Maps `t` through the curve, blends toward linear by `strength`, then interpolates OKLCH L.
 * `strength` 0 → linear spacing; `1` (default) → full preset curve behaviour.
 */
export function easeL(
  lHigh: number,
  lLow: number,
  t: number,
  curve?: LCurve,
  strength?: number,
): number {
  const s = clampLCurveStrength(strength)
  const curvedT = mapLightnessT(t, curve)
  const mapped = t + (curvedT - t) * s
  return lHigh + mapped * (lLow - lHigh)
}

/**
 * Chroma at parameter t. `chromaAtLight` and `chromaAtDark` are interpolated linearly
 * before the chroma mode shapes the envelope — pass the same value for both to get the
 * original single-knob behaviour.
 */
function chromaAtT(mode: ChromaMode, t: number, chromaAtLight: number, chromaAtDark: number): number {
  const base = chromaAtLight + t * (chromaAtDark - chromaAtLight)
  switch (mode) {
    case 'achromatic':
      return 0
    case 'fixed':
      return base
    case 'taper_mid':
      return base * Math.sin(Math.PI * t)
    case 'taper_ends':
      return base * (1 - Math.sin(Math.PI * t))
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
const GLOBAL_SCALE_CACHE_MAX = 48
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
    config.lCurve ?? 'linear',
    clampLCurveStrength(config.lCurveStrength),
    config.chromaLight ?? '',
    config.chromaDark ?? '',
    config.hueLight ?? '',
    config.hueDark ?? '',
  ].join('|')
}

/** @param cacheQualifier When set, separates cache entries (e.g. Advanced sibling ramps may share numeric config). */
export function buildGlobalScale(config: GlobalScaleConfig, cacheQualifier?: string): GlobalSwatch[] {
  const key = cacheKeyForGlobalScale(config) + (cacheQualifier != null ? `|${cacheQualifier}` : '')
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
  const safeBase = finiteOr(baseChroma, 0)
  /** Chroma ceiling at each end; falls back to `baseChroma` when per-end overrides are absent. */
  const chromaAtLight = finiteOr(config.chromaLight ?? safeBase, safeBase)
  const chromaAtDark = finiteOr(config.chromaDark ?? safeBase, safeBase)
  /** Hue applies only when chroma can be non-zero; achromatic uses `oklch(L 0 none)` via {@link buildOklchString}. */
  const useHue = chromaMode === 'achromatic' ? null : finiteOr(hue, 260)

  /**
   * Oklab hue-drift range. Active when `hueLight` ≠ `hueDark` and the ramp is chromatic.
   * Anchors are built at the lightness endpoints; hue is extracted per-step from the range.
   * L and C are still governed by `easeL` / `chromaAtT` — only H comes from the Oklab path.
   */
  const hueLight = config.hueLight ?? null
  const hueDark = config.hueDark ?? null
  const isHueDrift =
    useHue !== null && hueLight !== null && hueDark !== null && hueLight !== hueDark
  const hueDriftRange = isHueDrift
    ? new Color('oklch', [lHigh, chromaAtLight, hueLight!]).range(
        new Color('oklch', [lLow, chromaAtDark, hueDark!]),
        {space: 'oklab'},
      )
    : null

  const out: GlobalSwatch[] = []
  const labels = labelsForNamingStyle(namingStyle, n)

  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1)
    const L = easeL(lHigh, lLow, t, config.lCurve, config.lCurveStrength)
    const C = chromaAtT(chromaMode, t, chromaAtLight, chromaAtDark)
    // When hue drift is active, extract H from the Oklab range at linear t.
    // The range is sampled at linear t (not eased) so the hue shift is time-uniform.
    const stepHue = hueDriftRange ? (hueDriftRange(t).to('oklch').coords[2] ?? useHue) : useHue
    // Avoid parsing CSS strings on the hot path. Color.js accepts numeric coords:
    // `new Color('oklch', [L, C, h])`. This is dramatically faster than `new Color("oklch(...)")`
    // when recomputing ramps (e.g. preset selection + comparison rails).
    const h = stepHue ?? 0
    const color = new Color('oklch', [L, C, h]).to('srgb')
    const label = labels[i] ?? String(i)
    const css = buildOklchString(L, C, stepHue)
    // Hot path: avoid `serializeColor()` (multiple conversions + stringification per swatch).
    // We already have sRGB; compute a clipped variant once and format strings once.
    const inSrgbGamut = color.inGamut('srgb')
    const clipped = inSrgbGamut ? color : color.toGamut('srgb')
    const rgbCss = clipped.toString({format: 'css'})
    const hex = clipped.toString({format: 'hex'})
    out.push({
      index: i,
      label,
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
