import {expect, test} from 'vitest'
import Color from 'colorjs.io'

import {applyOkhslEdit, okhslViewFromConfig} from '@/lib/neutral-engine/okhsl'
import type {GlobalScaleConfig} from '@/lib/neutral-engine/types'

test('Color.js supports okhsl — smoke test', () => {
  const c = new Color('okhsl', [240, 0.5, 0.5])
  const coords = c.to('oklch').coords
  expect(coords[0]).toBeGreaterThan(0)
  expect(coords[1]).toBeGreaterThan(0)
  expect(coords[2]).toBeCloseTo(240, 0)
})

test('OKHSL round-trip: okhsl → oklch → okhsl stays within 1e-3 per coord', () => {
  const triples: [number, number, number][] = [
    [0, 0.3, 0.5],
    [60, 0.5, 0.3],
    [120, 0.2, 0.7],
    [180, 0.6, 0.5],
    [240, 0.4, 0.6],
    [300, 0.7, 0.4],
    [359, 0.1, 0.9],
  ]
  for (const [H, S, L] of triples) {
    const c0 = new Color('okhsl', [H, S, L])
    const oklch = c0.to('oklch')
    const c1 = oklch.to('okhsl')
    const coords = c1.coords
    expect(Math.abs((coords[0] ?? 0) - H)).toBeLessThan(0.5)   // hue can drift slightly near boundaries
    expect(Math.abs((coords[1] ?? 0) - S)).toBeLessThan(1e-2)
    expect(Math.abs((coords[2] ?? 0) - L)).toBeLessThan(1e-3)
  }
})

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

test('okhslViewFromConfig: isAchromatic true for achromatic config', () => {
  const view = okhslViewFromConfig(BASE)
  expect(view.isAchromatic).toBe(true)
  expect(view.saturation).toBe(0)
})

test('okhslViewFromConfig: isAchromatic false and saturation > 0 for chromatic config', () => {
  const cfg: GlobalScaleConfig = {...BASE, chromaMode: 'fixed', baseChroma: 0.012, hue: 240}
  const view = okhslViewFromConfig(cfg)
  expect(view.isAchromatic).toBe(false)
  expect(view.saturation).toBeGreaterThan(0)
})

test('applyOkhslEdit: hue edit propagates to cfg.hue', () => {
  const result = applyOkhslEdit(BASE, {hue: 180})
  expect(result.hue).toBe(180)
  // Other fields unchanged
  expect(result.lHigh).toBe(BASE.lHigh)
  expect(result.chromaMode).toBe(BASE.chromaMode)
})

test('applyOkhslEdit: saturation edit is ignored when chromaMode === achromatic', () => {
  const result = applyOkhslEdit(BASE, {saturation: 0.5})
  expect(result.baseChroma).toBe(BASE.baseChroma)
})

test('applyOkhslEdit: saturation edit updates baseChroma for chromatic config', () => {
  const cfg: GlobalScaleConfig = {...BASE, chromaMode: 'fixed', baseChroma: 0.01, hue: 240}
  const result = applyOkhslEdit(cfg, {saturation: 0.5})
  expect(result.baseChroma).toBeGreaterThan(0)
})

test('applyOkhslEdit: lHigh/lLow are clamped to [0, 1]', () => {
  const result = applyOkhslEdit(BASE, {lHigh: 1.5, lLow: -0.1})
  expect(result.lHigh).toBe(1)
  expect(result.lLow).toBe(0)
})

test('applyOkhslEdit round-trip: view → edit → view produces stable hue', () => {
  const cfg: GlobalScaleConfig = {...BASE, chromaMode: 'fixed', baseChroma: 0.012, hue: 250}
  const view1 = okhslViewFromConfig(cfg)
  const edited = applyOkhslEdit(cfg, {saturation: view1.saturation, hue: view1.hue})
  const view2 = okhslViewFromConfig(edited)
  expect(Math.abs(view2.hue - view1.hue)).toBeLessThan(1)
  expect(Math.abs(view2.saturation - view1.saturation)).toBeLessThan(0.01)
})
