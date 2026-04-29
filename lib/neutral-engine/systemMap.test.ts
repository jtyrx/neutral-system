import {expect, test} from 'vitest'

import {
  clampSystemMappingToLadderLength,
  DEFAULT_SYSTEM_MAPPING,
  pickDarkIndices,
  previewResolvedRoleIndices,
} from '@/lib/neutral-engine'

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
