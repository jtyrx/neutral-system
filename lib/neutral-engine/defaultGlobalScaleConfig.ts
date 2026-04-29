import type { GlobalScaleConfig } from '@/lib/neutral-engine/types'

/**
 * Light ramp defaults — full literal (pair with {@link DEFAULT_DARK_SCALE_VALUES} in the editor for a clear diff).
 * Used for Simple Mode (`DEFAULT_GLOBAL_SCALE_CONFIG`) and Advanced light sibling ramp.
 */
const DEFAULT_LIGHT_SCALE_VALUES = {
  steps: 16,
  lHigh: 0.985,
  lLow: 0.215,
  progression: 'linear',
  lCurve: 'ease-in-dark',
  lCurveStrength: 0.7,
  chromaMode: 'achromatic',
  baseChroma: 0.012,
  hue: 260,
  namingStyle: 'semantic',
  variantId: 'pure',
} satisfies GlobalScaleConfig

/**
 * Dark sibling ramp defaults (Advanced Mode) — same structure as light; differs in tail anchoring & lightness curve.
 */
const DEFAULT_DARK_SCALE_VALUES = {
  steps: 16,
  lHigh: 0.985,
  lLow: 0.185,
  progression: 'linear',
  lCurve: 'ease-out-light',
  lCurveStrength: 0.92,
  chromaMode: 'achromatic',
  baseChroma: 0.012,
  hue: 260,
  namingStyle: 'semantic',
  variantId: 'pure',
} satisfies GlobalScaleConfig

/** Default global ramp preset — Simple Mode shared ladder (aligned with light defaults). */
export const DEFAULT_GLOBAL_SCALE_CONFIG: GlobalScaleConfig = { ...DEFAULT_LIGHT_SCALE_VALUES }

/** Advanced Mode — light sibling ramp (same values as the global/simple default above). */
export const DEFAULT_ADVANCED_LIGHT_SCALE: GlobalScaleConfig = { ...DEFAULT_LIGHT_SCALE_VALUES }

/** Advanced Mode — dark sibling ramp (independent optics vs light ladder). */
export const DEFAULT_ADVANCED_DARK_SCALE: GlobalScaleConfig = { ...DEFAULT_DARK_SCALE_VALUES }
