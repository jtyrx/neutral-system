import type {GlobalScaleConfig, SystemMappingConfig} from '@/lib/neutral-engine/types'

export function globalConfigsEqual(a: GlobalScaleConfig, b: GlobalScaleConfig): boolean {
  return (
    a.steps === b.steps &&
    a.lHigh === b.lHigh &&
    a.lLow === b.lLow &&
    a.progression === b.progression &&
    a.chromaMode === b.chromaMode &&
    a.baseChroma === b.baseChroma &&
    a.hue === b.hue &&
    a.namingStyle === b.namingStyle &&
    a.variantId === b.variantId
  )
}

export function systemConfigsEqual(a: SystemMappingConfig, b: SystemMappingConfig): boolean {
  return (
    a.fillStart === b.fillStart &&
    a.strokeStart === b.strokeStart &&
    a.textStart === b.textStart &&
    a.fillCount === b.fillCount &&
    a.strokeCount === b.strokeCount &&
    a.textCount === b.textCount &&
    a.altCount === b.altCount &&
    a.stepInterval === b.stepInterval &&
    a.contrastDistance === b.contrastDistance &&
    a.themeMode === b.themeMode &&
    a.darkSegmentLength === b.darkSegmentLength &&
    a.altAlpha === b.altAlpha &&
    a.includeContrastGroups === b.includeContrastGroups
  )
}
