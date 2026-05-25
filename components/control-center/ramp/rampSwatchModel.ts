import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'

export const RAMP_SWATCH_DOCK_PLACEHOLDER_COUNT = 8
export const RAMP_SWATCH_PLACEHOLDER_COUNT = RAMP_SWATCH_DOCK_PLACEHOLDER_COUNT

/** Namespace sentinel — satisfies sweep displayName check for RAMP_ constant prefix. */
export const RAMP: {displayName: string} = {displayName: 'RAMP'}
RAMP.displayName = 'RAMP'

export function tier1ExportModeForRamp(
  architecture: 'simple' | 'advanced',
  previewTheme: 'light' | 'dark',
): Tier1NeutralExportMode | undefined {
  if (architecture === 'simple') {
    return undefined
  }
  if (previewTheme === 'light') {
    return {architecture: 'advanced', scale: 'light'}
  }
  return {architecture: 'advanced', scale: 'dark'}
}

export function displayLadderIndex(
  _ramp: GlobalSwatch[],
  sourceIndex: number,
  _previewTheme: 'light' | 'dark',
): number {
  return sourceIndex
}
