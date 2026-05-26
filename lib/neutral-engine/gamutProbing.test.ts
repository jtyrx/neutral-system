import Color from 'colorjs.io'
import {expect, test} from 'vitest'

import {
  gamutSliceForHue,
  gamutSliceForHueMulti,
  maxInGamutChroma,
  sweepLAtFixedCH,
  sweepLAtFixedCHMulti,
} from '@/lib/neutral-engine/gamutProbing'

test('maxInGamutChroma at L=0.5, H=30 returns a valid chroma ceiling', () => {
  const L = 0.5
  const H = 30
  const c = maxInGamutChroma(L, H)
  // MINDE returns chroma of the nearest in-gamut color; the original over-saturated color is out
  expect(c).toBeGreaterThan(0)
  expect(c).toBeLessThanOrEqual(0.4)
  expect(new Color('oklch', [L, 0.4, H]).inGamut('srgb')).toBe(false)
})

test('maxInGamutChroma: P3 ceiling is >= sRGB ceiling (same L,H)', () => {
  const L = 0.45
  const H = 140
  const s = maxInGamutChroma(L, H, {targetSpace: 'srgb'})
  const p = maxInGamutChroma(L, H, {targetSpace: 'p3'})
  expect(p).toBeGreaterThanOrEqual(s - 1e-6)
})

test('sweepLAtFixedCH: inSrgbGamut flags transition monotonically (mostly non-increasing in L for fixed C,H)', () => {
  const samples = sweepLAtFixedCH(0.05, 270, 32)
  expect(samples.length).toBe(32)
  const flags = samples.map((s) => s.inSrgbGamut)
  let flips = 0
  for (let i = 1; i < flags.length; i++) {
    if (flags[i] !== flags[i - 1]) flips++
  }
  expect(flips).toBeLessThanOrEqual(2)
})

test('gamutSliceForHue returns a rectangular grid with inGamut / display', () => {
  const grid = gamutSliceForHue(200, 8, 10)
  expect(grid.length).toBe(8)
  expect(grid[0]?.length).toBe(10)
  expect(grid[0]![0]).toMatchObject({
    L: expect.any(Number),
    C: expect.any(Number),
    inGamut: expect.any(Boolean),
    display: expect.objectContaining({hex: expect.any(String)}),
  })
})

test('gamutSliceForHueMulti: inSrgb implies inP3 for each cell', () => {
  const grid = gamutSliceForHueMulti(210, 12, 14, 0.35)
  for (const row of grid) {
    for (const cell of row) {
      if (cell.inSrgb) {
        expect(cell.inP3).toBe(true)
      }
    }
  }
})

test('sweepLAtFixedCHMulti flags nest: sRGB ⊆ P3 ⊆ Rec2020 (pointwise)', () => {
  const samples = sweepLAtFixedCHMulti(0.08, 50, 40)
  for (const s of samples) {
    if (s.inSrgb) {
      expect(s.inP3).toBe(true)
      expect(s.inRec2020).toBe(true)
    } else if (s.inP3) {
      expect(s.inRec2020).toBe(true)
    }
  }
})
