import {expect, test} from 'vitest'

import {buildGlobalScale, easeL} from '@/lib/neutral-engine/globalScale'
import type {GlobalScaleConfig, LCurve} from '@/lib/neutral-engine/types'

const BASE: GlobalScaleConfig = {
  steps: 41,
  lHigh: 0.985,
  lLow: 0.1615,
  progression: 'linear',
  chromaMode: 'achromatic',
  baseChroma: 0,
  hue: 260,
  namingStyle: 'token_ladder',
  variantId: 'pure',
}

const VARIANTS: Array<Partial<GlobalScaleConfig>> = [
  {},
  {hue: 55, baseChroma: 0.012, chromaMode: 'fixed', variantId: 'warm'},
  {hue: 250, baseChroma: 0.012, chromaMode: 'fixed', variantId: 'cool'},
  {hue: 240, baseChroma: 0.014, chromaMode: 'taper_mid', variantId: 'bluish'},
]

const CURVES: Array<LCurve | undefined> = [undefined, 'linear', 'ease-in-dark', 'ease-out-light', 's-curve']

test('lCurve undefined and linear produce byte-identical ramps for all 4 variants', () => {
  for (const patch of VARIANTS) {
    const cfg = {...BASE, ...patch}
    const withUndefined = buildGlobalScale({...cfg, lCurve: undefined})
    const withLinear = buildGlobalScale({...cfg, lCurve: 'linear'})
    expect(withUndefined.map((s) => s.serialized.oklchCss)).toEqual(
      withLinear.map((s) => s.serialized.oklchCss),
    )
    expect(withUndefined.map((s) => s.serialized.hex)).toEqual(
      withLinear.map((s) => s.serialized.hex),
    )
  }
})

test('L values are monotonically decreasing for all curves × all 4 variants', () => {
  for (const curve of CURVES) {
    for (const patch of VARIANTS) {
      const cfg = {...BASE, ...patch, lCurve: curve}
      const swatches = buildGlobalScale(cfg)
      const ls = swatches.map((s) => {
        const m = s.serialized.oklchCss.match(/oklch\(([\d.]+)%/)
        return m ? parseFloat(m[1]!) / 100 : NaN
      })
      for (let i = 1; i < ls.length; i++) {
        expect(ls[i]!).toBeLessThanOrEqual(ls[i - 1]!)
      }
    }
  }
})

test('easeL linear matches raw formula for arbitrary t values', () => {
  const lHigh = 0.985
  const lLow = 0.1615
  for (const t of [0, 0.25, 0.5, 0.75, 1]) {
    const expected = lHigh + t * (lLow - lHigh)
    expect(easeL(lHigh, lLow, t, 'linear')).toBeCloseTo(expected, 10)
    expect(easeL(lHigh, lLow, t, undefined)).toBeCloseTo(expected, 10)
  }
})

test('easeL boundary values are identical across all curves (t=0 → lHigh, t=1 → lLow)', () => {
  const lHigh = 0.985
  const lLow = 0.1615
  for (const curve of CURVES) {
    expect(easeL(lHigh, lLow, 0, curve)).toBeCloseTo(lHigh, 10)
    expect(easeL(lHigh, lLow, 1, curve)).toBeCloseTo(lLow, 10)
  }
})

test('ease-in-dark shifts more L spread to the dark end vs linear', () => {
  const lHigh = 0.985
  const lLow = 0.1615
  const t = 0.25
  const linear = easeL(lHigh, lLow, t, 'linear')
  const easeIn = easeL(lHigh, lLow, t, 'ease-in-dark')
  // ease-in-dark at t=0.25 should be closer to lHigh (less descent) than linear,
  // meaning the dark end has more room for spread
  expect(easeIn).toBeGreaterThan(linear)
})

test('ease-out-light shifts more L spread to the light end vs linear', () => {
  const lHigh = 0.985
  const lLow = 0.1615
  const t = 0.25
  const linear = easeL(lHigh, lLow, t, 'linear')
  const easeOut = easeL(lHigh, lLow, t, 'ease-out-light')
  // ease-out at t=0.25 descends faster than linear — more light-end spread
  expect(easeOut).toBeLessThan(linear)
})
