import {describe, expect, it} from 'vitest'

import {DEFAULT_ADVANCED_DARK_SCALE, DEFAULT_ADVANCED_LIGHT_SCALE, DEFAULT_GLOBAL_SCALE_CONFIG} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import {DEFAULT_SYSTEM_MAPPING} from '@/lib/neutral-engine/defaultSystemMapping'
import {buildArchitectureRamps} from '@/lib/neutral-engine/architectureRamps'
import {
  buildDtcgTokenTree,
  parseDtcgTokenJson,
  renderDtcgTokenJson,
  validateDtcgTokenTree,
  type DtcgColorToken,
  type DtcgGroup,
} from '@/lib/neutral-engine/dtcgTokens'
import {
  exportCssVariables,
  exportJson,
  exportTailwindV4ThemeInline,
} from '@/lib/neutral-engine/exportFormats'
import {clampSystemMappingToLadderLength, deriveAllThemeTokens} from '@/lib/neutral-engine/systemMap'
import type {ArchitectureRamps, GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

function buildDefaultExportSource(): {
  ramps: ArchitectureRamps
  global: GlobalSwatch[]
  light: SystemToken[]
  dark: SystemToken[]
} {
  const ramps = buildArchitectureRamps({
    architecture: 'simple',
    globalScale: DEFAULT_GLOBAL_SCALE_CONFIG,
    lightScale: DEFAULT_GLOBAL_SCALE_CONFIG,
    darkScale: DEFAULT_GLOBAL_SCALE_CONFIG,
  })
  if (ramps.architecture !== 'simple') {
    throw new Error('test helper expects simple architecture')
  }
  const global = ramps.global
  const base = clampSystemMappingToLadderLength(global.length, DEFAULT_SYSTEM_MAPPING)
  const {light, dark} = deriveAllThemeTokens(ramps, base)
  return {ramps, global, light, dark}
}

function groupChild(group: DtcgGroup, key: string): DtcgGroup {
  return group[key] as DtcgGroup
}

function tokenChild(group: DtcgGroup, key: string): DtcgColorToken {
  return group[key] as DtcgColorToken
}

function tokenAtRole(
  tree: DtcgGroup,
  theme: 'light' | 'dark',
  role: string,
): DtcgColorToken {
  let cursor = groupChild(groupChild(groupChild(tree, 'color'), 'semantic'), theme)
  const parts = role.split('.')
  parts.slice(0, -1).forEach((part) => {
    cursor = groupChild(cursor, part)
  })
  return tokenChild(cursor, parts[parts.length - 1]!)
}

describe('exportCssVariables', () => {
  it('emits tier-1 `--color-neutral-*` primitives (literal OKLCH), `--chrome-*` mixers, and var() refs', () => {
    const {ramps, light, dark} = buildDefaultExportSource()
    const css = exportCssVariables({architecture: 'simple', ramps, light, dark})
    expect(css).toMatch(/\s--color-neutral-[a-zA-Z0-9]+:\s*oklch\(/)
    expect(css).not.toMatch(/\s--neutral-[a-zA-Z0-9]+:/)
    expect(css).toMatch(/var\(--color-neutral-/)
    expect(css).toContain('--chrome-hairline:')
    expect(css).toContain('--chrome-toaster-bg:')
    expect(css).toContain('[data-theme="light"]')
    expect(css).toContain('[data-theme="dark"]')
    // Dark tier-2 on :root for pre–data-theme resolution
    expect(css.match(/:root\s*\{/g)?.length).toBeGreaterThanOrEqual(2)
  })
})

describe('exportCssVariables (advanced sibling ramps)', () => {
  it('emits separate light/dark tier-1 `--color-neutral-light-*` / `--color-neutral-dark-*` primitives', () => {
    const ramps = buildArchitectureRamps({
      architecture: 'advanced',
      globalScale: DEFAULT_GLOBAL_SCALE_CONFIG,
      lightScale: DEFAULT_ADVANCED_LIGHT_SCALE,
      darkScale: DEFAULT_ADVANCED_DARK_SCALE,
    })
    if (ramps.architecture !== 'advanced') throw new Error('expected advanced ramps')
    const n = Math.max(ramps.light.length, ramps.dark.length)
    const base = clampSystemMappingToLadderLength(n, DEFAULT_SYSTEM_MAPPING)
    const {light, dark} = deriveAllThemeTokens(ramps, base)
    const css = exportCssVariables({architecture: 'advanced', ramps, light, dark})
    expect(css).toMatch(/\s--color-neutral-light-[a-zA-Z0-9]+:/)
    expect(css).toMatch(/\s--color-neutral-dark-[a-zA-Z0-9]+:/)
  })
})

describe('exportTailwindV4ThemeInline', () => {
  it('keeps primitive OKLCH values in :root and omits primitive self-references from @theme inline', () => {
    const {ramps, light} = buildDefaultExportSource()
    const css = exportTailwindV4ThemeInline({architecture: 'simple', ramps, light})

    expect(css).toContain('  --color-neutral-0: oklch(')
    expect(css).not.toMatch(/--color-neutral-[\w-]+:\s*var\(--color-neutral-[\w-]+\)/)
    expect(css).toContain('--color-surface-default: var(--color-neutral-')
  })
})

describe('DTCG JSON export', () => {
  it('emits validated DTCG color tokens with `$type` and `$value`', () => {
    const {global, light, dark} = buildDefaultExportSource()
    const json = exportJson({architecture: 'simple', global, light, dark})
    const parsed = parseDtcgTokenJson(json)
    const neutral = groupChild(groupChild(parsed, 'color'), 'neutral')
    const firstNeutral = tokenChild(neutral, global[0]!.label)

    expect(json).toContain('"$type": "color"')
    expect(json).toContain('"$value"')
    expect(firstNeutral.$type).toBe('color')
    expect(firstNeutral.$value).toMatchObject({
      colorSpace: 'oklch',
      alpha: 1,
      hex: global[0]!.serialized.hex.toLowerCase(),
    })
  })

  it('aliases ramp-derived semantic tokens to primitive neutral tokens', () => {
    const {global, light, dark} = buildDefaultExportSource()
    const tree = buildDtcgTokenTree({architecture: 'simple', global, light, dark})
    const source = light.find((token) => token.role === 'surface.default')
    const surfaceDefault = tokenAtRole(tree, 'light', 'surface.default')

    expect(source).toBeDefined()
    expect(surfaceDefault.$value).toBe(`{color.neutral.${global[source!.sourceGlobalIndex]!.label}}`)
    expect(surfaceDefault.$extensions?.['neutral-system']?.role).toBe('surface.default')
    expect(surfaceDefault.$extensions?.['neutral-system']?.theme).toBe('light')
  })

  it('uses literal DTCG color values for alpha and custom semantic tokens', () => {
    const {global, light, dark} = buildDefaultExportSource()
    const tree = buildDtcgTokenTree({architecture: 'simple', global, light, dark})
    const alphaSource = light.find((token) => token.alpha != null && token.alpha < 1)
    const brandSource = light.find((token) => token.role === 'surface.brand')

    expect(alphaSource).toBeDefined()
    expect(brandSource).toBeDefined()

    const alphaToken = tokenAtRole(tree, 'light', alphaSource!.role)
    const brandToken = tokenAtRole(tree, 'light', 'surface.brand')

    expect(alphaToken.$value).toMatchObject({
      colorSpace: 'oklch',
      alpha: alphaSource!.alpha,
    })
    expect(brandToken.$value).toMatchObject({
      colorSpace: 'oklch',
      alpha: 1,
    })
    expect(brandToken.$extensions?.['neutral-system']?.customColor).toBe(true)
  })

  it('round-trips through render and parse helpers', () => {
    const {global, light, dark} = buildDefaultExportSource()
    const tree = buildDtcgTokenTree({architecture: 'simple', global, light, dark})

    expect(parseDtcgTokenJson(renderDtcgTokenJson(tree))).toEqual(tree)
  })

  it('throws a useful error for invalid DTCG token JSON', () => {
    expect(() =>
      validateDtcgTokenTree({
        color: {
          bad: {
            $type: 'color',
            $value: {
              colorSpace: 'oklch',
              components: [1, 0, 360],
            },
          },
        },
      }),
    ).toThrow(/Invalid DTCG design token JSON/)
  })
})
