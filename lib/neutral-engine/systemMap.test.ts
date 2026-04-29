import {expect, test} from 'vitest'

import {
  clampSystemMappingToLadderLength,
  DEFAULT_SYSTEM_MAPPING,
  migrateSystemMappingConfig,
  pickDarkIndices,
  previewResolvedRoleIndices,
  resolveDarkTextStartOffset,
  resolveLightTextStartIndex,
} from '@/lib/neutral-engine'

test('dynamic text fitting preserves legacy 41-step light/dark text seeds', () => {
  const cfg = migrateSystemMappingConfig({})
  expect(resolveLightTextStartIndex(41, 4, 2)).toBe(34)
  expect(resolveDarkTextStartOffset(41, 4, 2)).toBe(16)

  const clamped = clampSystemMappingToLadderLength(41, cfg)
  expect(clamped.textStart).toBe(34)
  expect(clamped.darkTextStart).toBe(15)
  expect(clamped.textCount).toBe(4)
  expect(clamped.darkTextCount).toBe(4)

  const lightText = previewResolvedRoleIndices(clamped, 41, 'light').text.slice(0, 4)
  const darkText = previewResolvedRoleIndices(clamped, 41, 'darkElevated').text.slice(0, 4)
  expect(lightText).toEqual([40, 38, 36, 34])
  expect(darkText).toEqual([1, 3, 5, 7])
})

test('16-step ladder edge-fits text without duplicate clamped picks', () => {
  const cfg = migrateSystemMappingConfig({})
  const clamped = clampSystemMappingToLadderLength(16, cfg)
  expect(clamped.textStart).toBe(9)
  expect(clamped.darkTextStart).toBe(resolveDarkTextStartOffset(16, clamped.darkTextCount, 2))

  const lightPickRaw = previewResolvedRoleIndices(clamped, 16, 'light').text.slice(0, 4)
  expect(lightPickRaw).toEqual([15, 13, 11, 9])
  expect(new Set(lightPickRaw).size).toBe(lightPickRaw.length)

  const darkPickRaw = previewResolvedRoleIndices(clamped, 16, 'darkElevated').text.slice(0, 4)
  expect(new Set(darkPickRaw).size).toBe(darkPickRaw.length)
})

test('pickDarkIndices starts dark surfaces at the dark edge when start offset is 0', () => {
  expect(pickDarkIndices(0, 5, 1, 41)).toEqual([40, 39, 38, 37, 36])
})

test('pickDarkIndices keeps spacing stable for larger offsets and steps', () => {
  expect(pickDarkIndices(1, 4, 2, 41)).toEqual([39, 37, 35, 33])
  expect(pickDarkIndices(2, 4, 2, 41)).toEqual([38, 36, 34, 32])
})

test('legacy darkFillStart = -1 is normalized to the same result as 0', () => {
  const normalized = clampSystemMappingToLadderLength(41, {
    ...DEFAULT_SYSTEM_MAPPING,
    darkFillStart: -1,
  })

  expect(normalized.darkFillStart).toBe(0)
  expect(pickDarkIndices(normalized.darkFillStart, 5, 1, 41)).toEqual(
    pickDarkIndices(0, 5, 1, 41),
  )
})

test('dark preview surface indices now anchor to the dark edge while light remains unchanged', () => {
  const cfg = clampSystemMappingToLadderLength(41, {
    ...DEFAULT_SYSTEM_MAPPING,
    darkFillStart: 2,
    darkFillStepInterval: 2,
  })

  expect(previewResolvedRoleIndices(cfg, 41, 'light').surface.slice(0, 5)).toEqual([
    0, 1, 2, 3, 4,
  ])
  expect(previewResolvedRoleIndices(cfg, 41, 'darkElevated').surface.slice(0, 5)).toEqual([
    38, 36, 34, 32, 30,
  ])
})
