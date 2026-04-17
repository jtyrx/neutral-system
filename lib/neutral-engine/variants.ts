import type {GlobalScaleConfig, NeutralVariantId} from '@/lib/neutral-engine/types'

export type VariantPreset = {
  id: NeutralVariantId
  label: string
  hue: number
  baseChroma: number
  chromaMode: GlobalScaleConfig['chromaMode']
}

export const VARIANT_PRESETS: VariantPreset[] = [
  {id: 'pure', label: 'Pure Neutral', hue: 260, baseChroma: 0, chromaMode: 'achromatic'},
  {id: 'warm', label: 'Warm Neutral', hue: 55, baseChroma: 0.012, chromaMode: 'fixed'},
  {id: 'cool', label: 'Cool Neutral', hue: 250, baseChroma: 0.012, chromaMode: 'fixed'},
  {id: 'bluish', label: 'Bluish Neutral', hue: 240, baseChroma: 0.014, chromaMode: 'taper_mid'},
  {id: 'custom', label: 'Custom', hue: 260, baseChroma: 0.01, chromaMode: 'fixed'},
]

export function applyVariantToConfig(
  cfg: GlobalScaleConfig,
  variantId: NeutralVariantId,
): GlobalScaleConfig {
  const p = VARIANT_PRESETS.find((v) => v.id === variantId) ?? VARIANT_PRESETS[0]!
  if (variantId === 'pure') {
    return {
      ...cfg,
      variantId: 'pure',
      chromaMode: 'achromatic',
      baseChroma: 0,
      hue: p.hue,
    }
  }
  if (variantId === 'custom') {
    return {...cfg, variantId: 'custom'}
  }
  return {
    ...cfg,
    variantId,
    hue: p.hue,
    baseChroma: p.baseChroma,
    chromaMode: p.chromaMode,
  }
}
