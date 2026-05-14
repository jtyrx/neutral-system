import {DEFAULT_GLOBAL_SCALE_CONFIG} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import type {
  ChromaMode,
  GlobalScaleConfig,
  LCurve,
  NamingStyle,
} from '@/lib/neutral-engine/types'

export type OklchPickerTriple = {
  L: number
  C: number
  H: number
}

export type OklchPickerSecondary = {
  lHigh: number
  lLow: number
  chromaMode: ChromaMode
  lCurve: LCurve
  lCurveStrength: number
  steps: number
  namingStyle: NamingStyle
}

/**
 * Centers the lightness span `[lLow, lHigh]` around picker L while preserving range (clamped to [0,1]).
 */
export function lightnessAnchorsAroundPickerL(
  L: number,
  lHigh: number,
  lLow: number,
): {lHigh: number; lLow: number} {
  const Lc = Math.min(1, Math.max(0, L))
  let span = lHigh - lLow
  if (!Number.isFinite(span) || span <= 0) span = 0.001
  let hi = Lc + span / 2
  let lo = Lc - span / 2
  if (hi > 1) {
    const over = hi - 1
    hi = 1
    lo = Math.max(0, lo - over)
  }
  if (lo < 0) {
    const under = -lo
    lo = 0
    hi = Math.min(1, hi + under)
  }
  if (hi <= lo) {
    hi = Math.min(1, Lc + 0.0005)
    lo = Math.max(0, Lc - 0.0005)
  }
  return {
    lHigh: Math.min(1, Math.max(0, hi)),
    lLow: Math.min(1, Math.max(0, lo)),
  }
}

/**
 * Merge picker OKLCH triple + secondary ramp knobs into a {@link GlobalScaleConfig} for `buildGlobalScale`.
 * Lightness endpoints are re-centered on picker L; hue/base chroma follow H/C.
 */
export function pickerToGlobalScale(
  picker: OklchPickerTriple,
  secondary: OklchPickerSecondary,
  base: GlobalScaleConfig = DEFAULT_GLOBAL_SCALE_CONFIG,
): GlobalScaleConfig {
  const {lHigh, lLow} = lightnessAnchorsAroundPickerL(
    picker.L,
    secondary.lHigh,
    secondary.lLow,
  )
  const H = ((picker.H % 360) + 360) % 360
  const C = Math.max(0, picker.C)

  return {
    ...base,
    steps: secondary.steps,
    lHigh,
    lLow,
    chromaMode: secondary.chromaMode,
    baseChroma: C,
    hue: H,
    namingStyle: secondary.namingStyle,
    lCurve: secondary.lCurve,
    lCurveStrength: secondary.lCurveStrength,
    variantId: C <= 0 && secondary.chromaMode === 'achromatic' ? 'pure' : 'custom',
  }
}

/** Inverse of {@link pickerToGlobalScale} pin — chroma, hue, and lightness anchor center (no string math). */
export function globalScaleToPickerTriple(cfg: GlobalScaleConfig): OklchPickerTriple {
  const lHigh = Math.min(1, Math.max(0, cfg.lHigh))
  const lLow = Math.min(1, Math.max(0, cfg.lLow))
  return {
    L: Math.min(1, Math.max(0, (lHigh + lLow) / 2)),
    C: Math.max(0, cfg.baseChroma),
    H: ((cfg.hue % 360) + 360) % 360,
  }
}

export function globalScaleToPickerSecondary(cfg: GlobalScaleConfig): OklchPickerSecondary {
  return {
    lHigh: cfg.lHigh,
    lLow: cfg.lLow,
    chromaMode: cfg.chromaMode,
    lCurve: cfg.lCurve ?? 'linear',
    lCurveStrength: cfg.lCurveStrength ?? 1,
    steps: cfg.steps,
    namingStyle: cfg.namingStyle,
  }
}
