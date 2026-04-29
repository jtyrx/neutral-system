import {describe, expect, it} from 'vitest'

import {
  DEFAULT_ADVANCED_DARK_SCALE,
  DEFAULT_ADVANCED_LIGHT_SCALE,
  DEFAULT_GLOBAL_SCALE_CONFIG,
} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import {buildArchitectureRamps, rampForTheme, rampsEqual} from '@/lib/neutral-engine/architectureRamps'

describe('architectureRamps', () => {
  it('simple mode emits a shared global ladder', () => {
    const ramps = buildArchitectureRamps({
      architecture: 'simple',
      globalScale: DEFAULT_GLOBAL_SCALE_CONFIG,
      lightScale: DEFAULT_GLOBAL_SCALE_CONFIG,
      darkScale: DEFAULT_GLOBAL_SCALE_CONFIG,
    })
    expect(ramps.architecture).toBe('simple')
    if (ramps.architecture !== 'simple') throw new Error('expected simple')
    expect(rampForTheme(ramps, 'light')).toEqual(ramps.global)
    expect(rampForTheme(ramps, 'darkElevated')).toEqual(ramps.global)
  })

  it('advanced mode emits independent sibling ladders', () => {
    const ramps = buildArchitectureRamps({
      architecture: 'advanced',
      globalScale: DEFAULT_GLOBAL_SCALE_CONFIG,
      lightScale: DEFAULT_ADVANCED_LIGHT_SCALE,
      darkScale: DEFAULT_ADVANCED_DARK_SCALE,
    })
    expect(ramps.architecture).toBe('advanced')
    if (ramps.architecture !== 'advanced') throw new Error('expected advanced')
    expect(rampForTheme(ramps, 'light')).toEqual(ramps.light)
    expect(rampForTheme(ramps, 'darkElevated')).toEqual(ramps.dark)
    expect(ramps.light).not.toBe(ramps.dark)
  })

  it('rampsEqual is stable for referential twins', () => {
    const a = buildArchitectureRamps({
      architecture: 'simple',
      globalScale: DEFAULT_GLOBAL_SCALE_CONFIG,
      lightScale: DEFAULT_GLOBAL_SCALE_CONFIG,
      darkScale: DEFAULT_GLOBAL_SCALE_CONFIG,
    })
    expect(rampsEqual(a, a)).toBe(true)
  })
})
