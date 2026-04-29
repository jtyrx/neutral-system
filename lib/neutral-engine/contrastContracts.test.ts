import {expect, test} from 'vitest'

import {buildContrastPairResults} from '@/lib/neutral-engine/contrastContracts'
import {DEFAULT_SYSTEM_MAPPING} from '@/lib/neutral-engine/defaultSystemMapping'
import {buildGlobalScale} from '@/lib/neutral-engine/globalScale'
import {deriveSystemTokens} from '@/lib/neutral-engine/systemMap'
import type {GlobalScaleConfig, SystemMappingConfig, SystemRole} from '@/lib/neutral-engine/types'

const DEFAULT_GLOBAL: GlobalScaleConfig = {
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

function tokensByRole(tokens: ReturnType<typeof deriveSystemTokens>) {
  return new Map(tokens.map((t) => [t.role, t]))
}

function contrastBetween(
  tokens: ReturnType<typeof deriveSystemTokens>,
  surfaceRole: SystemRole,
  textRole: SystemRole,
): number | null {
  const pairs = buildContrastPairResults(tokens)
  const pair = pairs.find((p) => p.surfaceRole === surfaceRole && p.textRole === textRole)
  return pair?.ratio ?? null
}

test('arithmetic mode: surface.default × text.default ≥ 4.5 in light theme', () => {
  const global = buildGlobalScale(DEFAULT_GLOBAL)
  const tokens = deriveSystemTokens(global, {...DEFAULT_SYSTEM_MAPPING, themeMode: 'light'})
  const ratio = contrastBetween(tokens, 'surface.default', 'text.default')
  expect(ratio).not.toBeNull()
  expect(ratio!).toBeGreaterThanOrEqual(4.5)
})

test('arithmetic mode: surface.default × text.subtle ≥ 3.0 in light theme', () => {
  const global = buildGlobalScale(DEFAULT_GLOBAL)
  const tokens = deriveSystemTokens(global, {...DEFAULT_SYSTEM_MAPPING, themeMode: 'light'})
  const ratio = contrastBetween(tokens, 'surface.default', 'text.subtle')
  expect(ratio).not.toBeNull()
  expect(ratio!).toBeGreaterThanOrEqual(3.0)
})

test('arithmetic mode: surface.default × text.default ≥ 4.5 in dark elevated theme', () => {
  const global = buildGlobalScale(DEFAULT_GLOBAL)
  const tokens = deriveSystemTokens(global, {...DEFAULT_SYSTEM_MAPPING, themeMode: 'darkElevated'})
  const ratio = contrastBetween(tokens, 'surface.default', 'text.default')
  expect(ratio).not.toBeNull()
  expect(ratio!).toBeGreaterThanOrEqual(4.5)
})

test('contrast mode: surface.default × text.default ≥ 4.5 in light theme', () => {
  const global = buildGlobalScale(DEFAULT_GLOBAL)
  const cfg: SystemMappingConfig = {
    ...DEFAULT_SYSTEM_MAPPING,
    themeMode: 'light',
    roleMappingMode: 'contrast',
  }
  const tokens = deriveSystemTokens(global, cfg)
  const ratio = contrastBetween(tokens, 'surface.default', 'text.default')
  expect(ratio).not.toBeNull()
  expect(ratio!).toBeGreaterThanOrEqual(4.5)
})

test('contrast mode: surface.default × text.subtle ≥ 3.0 in light theme', () => {
  const global = buildGlobalScale(DEFAULT_GLOBAL)
  const cfg: SystemMappingConfig = {
    ...DEFAULT_SYSTEM_MAPPING,
    themeMode: 'light',
    roleMappingMode: 'contrast',
  }
  const tokens = deriveSystemTokens(global, cfg)
  const ratio = contrastBetween(tokens, 'surface.default', 'text.subtle')
  expect(ratio).not.toBeNull()
  expect(ratio!).toBeGreaterThanOrEqual(3.0)
})

test('contrast mode: surface.default × text.default ≥ 4.5 in dark elevated theme', () => {
  const global = buildGlobalScale(DEFAULT_GLOBAL)
  const cfg: SystemMappingConfig = {
    ...DEFAULT_SYSTEM_MAPPING,
    themeMode: 'darkElevated',
    roleMappingMode: 'contrast',
  }
  const tokens = deriveSystemTokens(global, cfg)
  const ratio = contrastBetween(tokens, 'surface.default', 'text.default')
  expect(ratio).not.toBeNull()
  expect(ratio!).toBeGreaterThanOrEqual(4.5)
})

test('both modes produce the same surface tokens (contrast mode only affects text)', () => {
  const global = buildGlobalScale(DEFAULT_GLOBAL)
  const base: SystemMappingConfig = {...DEFAULT_SYSTEM_MAPPING, themeMode: 'light'}
  const arithmetic = deriveSystemTokens(global, base)
  const contrast = deriveSystemTokens(global, {...base, roleMappingMode: 'contrast'})

  const surfaceRoles = [
    'surface.sunken',
    'surface.default',
    'surface.subtle',
    'surface.raised',
    'surface.overlay',
  ] as const satisfies readonly SystemRole[]
  const aMap = tokensByRole(arithmetic)
  const cMap = tokensByRole(contrast)

  for (const role of surfaceRoles) {
    expect(cMap.get(role)?.sourceGlobalIndex).toBe(aMap.get(role)?.sourceGlobalIndex)
  }
})
