import {buildGlobalScale} from '@/lib/neutral-engine/globalScale'
import type {
  ArchitectureRamps,
  GlobalScaleConfig,
  GlobalSwatch,
  NeutralArchitectureMode,
  ThemeMode,
} from '@/lib/neutral-engine/types'

/**
 * Resolved {@link ArchitectureRamps} from workbench configs (one `buildGlobalScale` per sibling ramp).
 */
export function buildArchitectureRamps(params: {
  architecture: NeutralArchitectureMode
  globalScale: GlobalScaleConfig
  lightScale: GlobalScaleConfig
  darkScale: GlobalScaleConfig
}): ArchitectureRamps {
  if (params.architecture === 'simple') {
    return {architecture: 'simple', global: buildGlobalScale(params.globalScale)}
  }
  return {
    architecture: 'advanced',
    light: buildGlobalScale(params.lightScale, 'advanced-light'),
    dark: buildGlobalScale(params.darkScale, 'advanced-dark'),
  }
}

/** Theme’s logical ramp (`light` / `darkElevated`) — sibling ramps in Advanced, shared ramp in Simple. */
export function rampForTheme(ramps: ArchitectureRamps, theme: ThemeMode): GlobalSwatch[] {
  if (ramps.architecture === 'simple') {
    return ramps.global
  }
  return theme === 'light' ? ramps.light : ramps.dark
}

export function rampsEqual(a: ArchitectureRamps, b: ArchitectureRamps): boolean {
  if (a.architecture !== b.architecture) return false
  if (a.architecture === 'simple' && b.architecture === 'simple') {
    return a.global === b.global
  }
  if (a.architecture === 'advanced' && b.architecture === 'advanced') {
    return a.light === b.light && a.dark === b.dark
  }
  return false
}
