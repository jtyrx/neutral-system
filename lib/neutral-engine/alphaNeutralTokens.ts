import type {AlphaNeutralConfig, ArchitectureRamps, GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'
import {
  tier1ExportModeFromTheme,
  type Tier1NeutralExportMode,
  tier1NeutralCssVarName,
} from '@/lib/neutral-engine/chromeAliases'

export const DEFAULT_ALPHA_NEUTRAL_CONFIG: AlphaNeutralConfig = {
  lightIndexOffset: 0,
  darkIndexOffset: 0,
  alphaStops: [0.08, 0.16, 0.32, 0.48],
}

/**
 * Resolves the ramp index to use as the alpha-token base for a given theme.
 */
export function deriveAlphaBaseIndex(
  tokens: SystemToken[],
  offset: number,
  rampLength: number,
): number {
  const textDefault = tokens.find((t) => t.role === 'text.default')
  const baseIndex = textDefault?.sourceGlobalIndex ?? rampLength - 1
  return Math.max(0, Math.min(rampLength - 1, baseIndex + offset))
}

function alphaLines(
  prefix: string,
  baseIndex: number,
  swatches: GlobalSwatch[],
  stops: readonly [number, number, number, number],
  /** When set (Advanced Mode sibling ramps), emits `--color-neutral-*` / `--color-neutral-dark-*` refs via {@link tier1NeutralCssVarName}. */
  tier1Advanced?: Exclude<Tier1NeutralExportMode, {architecture: 'simple'}>,
): string[] {
  const swatch = swatches[baseIndex]
  if (!swatch) return []
  const varCssName =
    tier1Advanced != null ? tier1NeutralCssVarName(swatch.label, tier1Advanced) : tier1NeutralCssVarName(swatch.label)
  const varRef = `var(--${varCssName})`
  return stops.map((alpha, i) => {
    const pct = Math.round(alpha * 100)
    return `  --color-${prefix}-alpha-${(i + 1) * 100}: color-mix(in oklch, ${varRef} ${pct}%, transparent);`
  })
}

export function deriveAlphaNeutralCssLines(
  ramps: ArchitectureRamps,
  lightTokens: SystemToken[],
  darkTokens: SystemToken[],
  config: AlphaNeutralConfig,
): string[] {
  if (ramps.architecture === 'simple') {
    const g = ramps.global
    const lightBase = deriveAlphaBaseIndex(lightTokens, config.lightIndexOffset, g.length)
    const darkBase = deriveAlphaBaseIndex(darkTokens, config.darkIndexOffset, g.length)
    return [
      ...alphaLines('neutral', lightBase, g, config.alphaStops),
      ...alphaLines('dark-neutral', darkBase, g, config.alphaStops),
    ]
  }

  const {light: lightRamp, dark: darkRamp} = ramps
  const lightBase = deriveAlphaBaseIndex(lightTokens, config.lightIndexOffset, lightRamp.length)
  const darkBase = deriveAlphaBaseIndex(darkTokens, config.darkIndexOffset, darkRamp.length)

  return [
    ...alphaLines('neutral', lightBase, lightRamp, config.alphaStops, tier1ExportModeFromTheme('light')),
    ...alphaLines('dark-neutral', darkBase, darkRamp, config.alphaStops, tier1ExportModeFromTheme('darkElevated')),
  ]
}

export function deriveAlphaBaseIndices(
  ramps: ArchitectureRamps,
  lightTokens: SystemToken[],
  darkTokens: SystemToken[],
  config: AlphaNeutralConfig,
): {lightBase: number; darkBase: number} {
  if (ramps.architecture === 'simple') {
    const g = ramps.global
    return {
      lightBase: deriveAlphaBaseIndex(lightTokens, config.lightIndexOffset, g.length),
      darkBase: deriveAlphaBaseIndex(darkTokens, config.darkIndexOffset, g.length),
    }
  }
  const {light: lightRamp, dark: darkRamp} = ramps
  return {
    lightBase: deriveAlphaBaseIndex(lightTokens, config.lightIndexOffset, lightRamp.length),
    darkBase: deriveAlphaBaseIndex(darkTokens, config.darkIndexOffset, darkRamp.length),
  }
}
