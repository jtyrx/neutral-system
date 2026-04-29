import type {AlphaNeutralConfig, GlobalSwatch, SystemToken} from './types'
import {neutralPrimitiveCssVarName} from './chromeAliases'

export const DEFAULT_ALPHA_NEUTRAL_CONFIG: AlphaNeutralConfig = {
  lightIndexOffset: 0,
  darkIndexOffset: 0,
  alphaStops: [0.08, 0.16, 0.32, 0.48],
}

/**
 * Resolves the ramp index to use as the alpha-token base for a given theme.
 * Primary anchor: `text.default`'s sourceGlobalIndex (highest contrast neutral per theme).
 * Falls back to the last ramp index if text.default is absent.
 */
export function deriveAlphaBaseIndex(
  tokens: SystemToken[],
  offset: number,
  rampLength = 41,
): number {
  const textDefault = tokens.find((t) => t.role === 'text.default')
  const baseIndex = textDefault?.sourceGlobalIndex ?? rampLength - 1
  return Math.max(0, Math.min(rampLength - 1, baseIndex + offset))
}

function alphaLines(
  prefix: string,
  baseIndex: number,
  global: GlobalSwatch[],
  stops: readonly [number, number, number, number],
): string[] {
  const swatch = global[baseIndex]
  if (!swatch) return []
  const varRef = `var(--${neutralPrimitiveCssVarName(swatch.label)})`
  return stops.map((alpha, i) => {
    const pct = Math.round(alpha * 100)
    return `  --color-${prefix}-alpha-${(i + 1) * 100}: color-mix(in oklch, ${varRef} ${pct}%, transparent);`
  })
}

/**
 * Derives 8 CSS custom-property lines: 4 light (`--color-neutral-alpha-*`)
 * and 4 dark (`--color-dark-neutral-alpha-*`).
 * Intended to be injected into `[data-theme]` blocks by exportCssVariables().
 */
export function deriveAlphaNeutralCssLines(
  global: GlobalSwatch[],
  lightTokens: SystemToken[],
  darkTokens: SystemToken[],
  config: AlphaNeutralConfig,
): string[] {
  const lightBase = deriveAlphaBaseIndex(lightTokens, config.lightIndexOffset, global.length)
  const darkBase = deriveAlphaBaseIndex(darkTokens, config.darkIndexOffset, global.length)
  return [
    ...alphaLines('neutral', lightBase, global, config.alphaStops),
    ...alphaLines('dark-neutral', darkBase, global, config.alphaStops),
  ]
}

/**
 * Returns the resolved base indices for visualization (offset map + ramp badges).
 */
export function deriveAlphaBaseIndices(
  global: GlobalSwatch[],
  lightTokens: SystemToken[],
  darkTokens: SystemToken[],
  config: AlphaNeutralConfig,
): {lightBase: number; darkBase: number} {
  return {
    lightBase: deriveAlphaBaseIndex(lightTokens, config.lightIndexOffset, global.length),
    darkBase: deriveAlphaBaseIndex(darkTokens, config.darkIndexOffset, global.length),
  }
}
