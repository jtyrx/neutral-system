import {describe, expect, it} from 'vitest'
import type {GlobalSwatch, SystemRole, SystemToken} from './types'
import {
  DEFAULT_ALPHA_NEUTRAL_CONFIG,
  deriveAlphaBaseIndex,
  deriveAlphaNeutralCssLines,
} from './alphaNeutralTokens'

function makeSwatch(index: number, label: string): GlobalSwatch {
  return {
    index,
    label,
    serialized: {
      oklchCss: `oklch(${50 + index}% 0 none)`,
      hex: '#000000',
      rgbCss: 'rgb(0, 0, 0)',
      srgbCss: 'color(srgb 0 0 0)',
      inSrgbGamut: true,
    },
  }
}

function makeToken(role: string, sourceIndex: number): SystemToken {
  return {
    id: role,
    name: role,
    role: role as SystemRole,
    theme: 'light',
    sourceGlobalIndex: sourceIndex,
    serialized: {
      oklchCss: `oklch(${50 + sourceIndex}% 0 none)`,
      hex: '#000000',
      rgbCss: 'rgb(0, 0, 0)',
      srgbCss: 'color(srgb 0 0 0)',
      inSrgbGamut: true,
    },
    customColor: false,
  }
}

describe('deriveAlphaBaseIndex', () => {
  it('returns sourceGlobalIndex of text.default when offset is 0', () => {
    const tokens = [makeToken('text.default', 35), makeToken('surface.default', 5)]
    expect(deriveAlphaBaseIndex(tokens, 0)).toBe(35)
  })

  it('applies positive offset, clamped to ramp length', () => {
    const tokens = [makeToken('text.default', 35)]
    expect(deriveAlphaBaseIndex(tokens, 3, 41)).toBe(38)
  })

  it('applies negative offset, clamped to 0', () => {
    const tokens = [makeToken('text.default', 2)]
    expect(deriveAlphaBaseIndex(tokens, -5, 41)).toBe(0)
  })

  it('returns last index when text.default is not found', () => {
    const tokens = [makeToken('surface.default', 5)]
    expect(deriveAlphaBaseIndex(tokens, 0, 41)).toBe(40)
  })
})

describe('deriveAlphaNeutralCssLines', () => {
  const global = Array.from({length: 41}, (_, i) => makeSwatch(i, String(i * 25)))
  const lightTokens = [makeToken('text.default', 38)]
  const darkTokens = [makeToken('text.default', 3)]
  const config = DEFAULT_ALPHA_NEUTRAL_CONFIG

  it('emits 8 CSS lines total (4 light + 4 dark)', () => {
    const lines = deriveAlphaNeutralCssLines(global, lightTokens, darkTokens, config)
    expect(lines).toHaveLength(8)
  })

  it('light alpha lines reference the light base primitive', () => {
    const lines = deriveAlphaNeutralCssLines(global, lightTokens, darkTokens, config)
    const lightLines = lines.filter(l => l.includes('--color-neutral-alpha'))
    expect(lightLines).toHaveLength(4)
    // index 38 * 25 = 950, so label is "950" → --neutral-950
    lightLines.forEach(l => expect(l).toContain('--neutral-950'))
  })

  it('dark alpha lines reference the dark base primitive', () => {
    const lines = deriveAlphaNeutralCssLines(global, lightTokens, darkTokens, config)
    const darkLines = lines.filter(l => l.includes('--color-dark-neutral-alpha'))
    expect(darkLines).toHaveLength(4)
    // index 3 * 25 = 75, so label is "75" → --neutral-75
    darkLines.forEach(l => expect(l).toContain('--neutral-75'))
  })

  it('uses color-mix for alpha blending', () => {
    const lines = deriveAlphaNeutralCssLines(global, lightTokens, darkTokens, config)
    lines.forEach(l => expect(l).toContain('color-mix(in oklch'))
  })
})
