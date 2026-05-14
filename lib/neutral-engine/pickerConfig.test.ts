import {expect, test} from 'vitest'

import {DEFAULT_GLOBAL_SCALE_CONFIG} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import type {GlobalScaleConfig} from '@/lib/neutral-engine/types'

import {
  globalScaleToPickerSecondary,
  globalScaleToPickerTriple,
  lightnessAnchorsAroundPickerL,
  pickerToGlobalScale,
  type OklchPickerSecondary,
  type OklchPickerTriple,
} from '@/lib/neutral-engine/pickerConfig'

const secondary: OklchPickerSecondary = {
  lHigh: 0.985,
  lLow: 0.2,
  chromaMode: 'fixed',
  lCurve: 'linear',
  lCurveStrength: 1,
  steps: 16,
  namingStyle: 'semantic',
}

const picker: OklchPickerTriple = {L: 0.5, C: 0.05, H: 200}

test('lightnessAnchorsAroundPickerL preserves span order and clamps to [0,1]', () => {
  const {lHigh, lLow} = lightnessAnchorsAroundPickerL(0.5, 0.9, 0.1)
  expect(lHigh).toBeGreaterThan(lLow)
  expect(lHigh).toBeLessThanOrEqual(1)
  expect(lLow).toBeGreaterThanOrEqual(0)
})

test('pickerToGlobalScale merges triple + secondary with engine defaults', () => {
  const base: GlobalScaleConfig = {
    ...DEFAULT_GLOBAL_SCALE_CONFIG,
    progression: 'linear',
    variantId: 'pure',
  }
  const out = pickerToGlobalScale(picker, secondary, base)

  expect(out.baseChroma).toBe(0.05)
  expect(out.hue).toBe(200)
  expect(out.chromaMode).toBe('fixed')
  expect(out.lCurve).toBe('linear')
  expect(out.lCurveStrength).toBe(1)
  expect(out.steps).toBe(16)
  expect(out.namingStyle).toBe('semantic')
  expect(out.progression).toBe(base.progression)
  expect(out.lHigh).toBeGreaterThan(out.lLow)
  const mid = (out.lHigh + out.lLow) / 2
  expect(Math.abs(mid - 0.5)).toBeLessThan(0.02)
  expect(out.variantId).toBe('custom')
})

test('globalScaleToPickerTriple round-trips with pickerToGlobalScale (approx. L center)', () => {
  const base: GlobalScaleConfig = {
    ...DEFAULT_GLOBAL_SCALE_CONFIG,
    progression: 'linear',
    variantId: 'pure',
  }
  const out = pickerToGlobalScale(picker, secondary, base)
  const triple = globalScaleToPickerTriple(out)
  const sec = globalScaleToPickerSecondary(out)
  expect(triple.C).toBeCloseTo(picker.C, 6)
  expect(triple.H).toBeCloseTo(picker.H, 6)
  expect(Math.abs(triple.L - picker.L)).toBeLessThan(0.03)
  expect(sec.steps).toBe(secondary.steps)
  expect(sec.chromaMode).toBe(secondary.chromaMode)
})
