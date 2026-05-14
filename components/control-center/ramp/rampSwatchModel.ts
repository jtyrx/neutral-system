import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'

export const RAMP_SWATCH_DOCK_PLACEHOLDER_COUNT = 8
export const RAMP_SWATCH_PLACEHOLDER_COUNT = RAMP_SWATCH_DOCK_PLACEHOLDER_COUNT

export function tier1ExportModeForRamp(
  architecture: 'simple' | 'advanced',
  previewTheme: 'light' | 'dark',
): Tier1NeutralExportMode | undefined {
  if (previewTheme === 'light') {
    return architecture === 'simple'
      ? undefined
      : {architecture: 'advanced', scale: 'light'}
  }
  return {architecture: 'advanced', scale: 'dark'}
}

export function displayLadderIndex(
  ramp: GlobalSwatch[],
  sourceIndex: number,
  previewTheme: 'light' | 'dark',
): number {
  if (previewTheme === 'dark') {
    return ramp.length - 1 - sourceIndex
  }
  return sourceIndex
}
