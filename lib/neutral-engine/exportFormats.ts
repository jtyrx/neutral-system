import {
  linesLiveThemeChromeBlock,
  tier1ExportModeFromTheme,
  tier1NeutralCssVarName,
} from '@/lib/neutral-engine/chromeAliases'
import {
  DEFAULT_ALPHA_NEUTRAL_CONFIG,
  deriveAlphaNeutralCssLines,
} from '@/lib/neutral-engine/alphaNeutralTokens'
import {rampForTheme} from '@/lib/neutral-engine/architectureRamps'
import {buildDtcgTokenTree, renderDtcgTokenJson} from '@/lib/neutral-engine/dtcgTokens'
import type {AlphaNeutralConfig, ArchitectureRamps, GlobalSwatch} from '@/lib/neutral-engine/types'
import type {NeutralArchitectureMode} from '@/lib/neutral-engine/types'
import type {SystemToken} from '@/lib/neutral-engine/types'

/** Safe fragment for CSS fragments (dots → hyphens): `surface.default` → `surface-default`. */
export function tokenCssVarName(name: string): string {
  return name.replace(/\./g, '-')
}

/**
 * Custom brand tokens are preview-only semantics: they drive live chrome (`--color-surface-brand`,
 * `--color-text-brand`, `--color-border-brand`) but are intentionally omitted from downloadable
 * export payloads so the distributed system remains ramp-derived. All three brand-pair roles
 * (`surface.brand`, `text.brand`, `border.brand`) carry `customColor: true` when `brandOklch` parses.
 * Use this predicate to filter tokens before serializing to JSON/CSS/Tailwind.
 */
export function isPreviewOnlyBrandToken(t: SystemToken): boolean {
  return (t.role === 'surface.brand' || t.role === 'text.brand' || t.role === 'border.brand') && t.customColor === true
}

/** Optional `emphasis.*` ladder — omitted from downloadable token JSON only (see ExportSection). */
export function isEmphasisToken(t: SystemToken): boolean {
  return t.role.startsWith('emphasis.')
}

/**
 * Theme variable for Tailwind v4 `bg-*` / `text-*` utilities: `--color-surface-default`, …
 */
export function semanticColorVarName(name: string): string {
  return `color-${tokenCssVarName(name)}`
}

/**
 * Converts a flat token array to an inline-style-compatible CSS vars object.
 * Values are resolved OKLCH (not primitive var references), making the result
 * self-contained — suitable for React's `style` prop on a preview container.
 */
export function semanticTokensToStyleVars(tokens: SystemToken[]): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const t of tokens) {
    vars[`--${semanticColorVarName(t.name)}`] = t.serialized.oklchCss
  }
  return vars
}

function semanticCssValue(
  t: SystemToken,
  architecture: NeutralArchitectureMode,
  ramps: ArchitectureRamps,
): string {
  if (t.alpha != null && t.alpha < 1) {
    return `color-mix(in oklch, ${t.serialized.oklchCss} ${Math.round(t.alpha * 100)}%, transparent)`
  }
  if (t.customColor) {
    return t.serialized.oklchCss
  }
  const ramp = rampForTheme(ramps, t.theme)
  const sw = ramp[t.sourceGlobalIndex]
  if (!sw) return t.serialized.oklchCss
  const label = sw.label
  const name =
    architecture === 'simple'
      ? tier1NeutralCssVarName(label)
      : tier1NeutralCssVarName(label, tier1ExportModeFromTheme(t.theme))
  return `var(--${name})`
}

function cssVarTier1Fragment(
  s: GlobalSwatch,
  architecture: NeutralArchitectureMode,
  sibling?: 'light' | 'dark',
): string {
  if (architecture === 'simple') {
    return tier1NeutralCssVarName(s.label)
  }
  const scale = sibling === 'light' ? 'light' : 'dark'
  return tier1NeutralCssVarName(s.label, {architecture: 'advanced', scale})
}

function emitTier1Block(
  lines: string[],
  swatches: GlobalSwatch[],
  architecture: NeutralArchitectureMode,
  sibling?: 'light' | 'dark',
): void {
  swatches.forEach((s) => {
    lines.push(`  --${cssVarTier1Fragment(s, architecture, sibling)}: ${s.serialized.oklchCss};`)
  })
}

/**
 * Injects tier-1 neutral primitives, per-theme `--color-*` semantics, and `--chrome-*` mixers.
 */
export function exportJson(params: {
  architecture: NeutralArchitectureMode
  global?: GlobalSwatch[] | undefined
  lightRamp?: GlobalSwatch[] | undefined
  darkRamp?: GlobalSwatch[] | undefined
  light: SystemToken[]
  dark: SystemToken[]
}): string {
  return renderDtcgTokenJson(buildDtcgTokenTree(params))
}

export function exportCssVariables(params: {
  architecture: NeutralArchitectureMode
  ramps: ArchitectureRamps
  light: SystemToken[]
  dark: SystemToken[]
  alphaConfig?: AlphaNeutralConfig | undefined
}): string {
  const lines: string[] = [':root {']
  const alphaConfig = params.alphaConfig ?? DEFAULT_ALPHA_NEUTRAL_CONFIG
  const alphaBlock = deriveAlphaNeutralCssLines(params.ramps, params.light, params.dark, alphaConfig)
  const {architecture, ramps} = params

  if (ramps.architecture === 'simple') {
    emitTier1Block(lines, ramps.global, architecture)
  } else {
    emitTier1Block(lines, ramps.light, architecture, 'light')
    emitTier1Block(lines, ramps.dark, architecture, 'dark')
  }

  lines.push('}')
  lines.push('')
  const lightSemanticLines: string[] = []
  params.light.forEach((t) => {
    lightSemanticLines.push(
      `  --${semanticColorVarName(t.name)}: ${semanticCssValue(t, architecture, ramps)};`,
    )
  })
  const darkSemanticLines: string[] = []
  params.dark.forEach((t) => {
    darkSemanticLines.push(
      `  --${semanticColorVarName(t.name)}: ${semanticCssValue(t, architecture, ramps)};`,
    )
  })
  lines.push(':root {')
  lines.push(...darkSemanticLines)
  lines.push(...alphaBlock)
  lines.push(...linesLiveThemeChromeBlock())
  lines.push('}')
  lines.push('')

  lines.push('[data-theme="light"] {')
  lines.push(...lightSemanticLines)
  lines.push(...alphaBlock)
  lines.push(...linesLiveThemeChromeBlock())
  lines.push('}')
  lines.push('')
  lines.push('[data-theme="dark"] {')
  lines.push(...darkSemanticLines)
  lines.push(...alphaBlock)
  lines.push(...linesLiveThemeChromeBlock())
  lines.push('}')
  lines.push('')
  lines.push('[data-preview-theme="light"] {')
  lines.push(...lightSemanticLines)
  lines.push('}')
  lines.push('')
  lines.push('[data-preview-theme="dark"] {')
  lines.push(...darkSemanticLines)
  lines.push('}')
  return lines.join('\n')
}

export function exportCsv(ramps: ArchitectureRamps): string {
  if (ramps.architecture === 'simple') {
    const header = ['index', 'label', 'oklch', 'hex', 'rgb']
    const rows = ramps.global.map((s) =>
      [String(s.index), s.label, s.serialized.oklchCss, s.serialized.hex, s.serialized.rgbCss].join(
        ',',
      ),
    )
    return [header.join(','), ...rows].join('\n')
  }

  const header = ['scale', 'index', 'label', 'oklch', 'hex', 'rgb']
  const lightRows = ramps.light.map((s) =>
    ['light', String(s.index), s.label, s.serialized.oklchCss, s.serialized.hex, s.serialized.rgbCss].join(','),
  )
  const darkRows = ramps.dark.map((s) =>
    ['dark', String(s.index), s.label, s.serialized.oklchCss, s.serialized.hex, s.serialized.rgbCss].join(','),
  )
  return [header.join(','), ...lightRows, ...darkRows].join('\n')
}

/**
 * Tailwind CSS v4: tier-1 primitives in `:root`; light semantic aliases in `@theme inline`.
 */
export function exportTailwindV4ThemeInline(params: {
  architecture: NeutralArchitectureMode
  ramps: ArchitectureRamps
  light: SystemToken[]
}): string {
  const lines: string[] = [
    '/* Neutral primitives — tier 1 (paste after @import "tailwindcss";) */',
    ':root {',
  ]
  const {architecture, ramps} = params

  if (ramps.architecture === 'simple') {
    emitTier1Block(lines, ramps.global, architecture)
  } else {
    emitTier1Block(lines, ramps.light, architecture, 'light')
    emitTier1Block(lines, ramps.dark, architecture, 'dark')
  }

  lines.push('}')
  lines.push('')
  lines.push('@theme inline {')
  lines.push(
    '  /* Tier 2 semantics (light): --color-* maps to bg-surface-default, text-default, border-focus, etc. */',
  )
  params.light.forEach((t) => {
    const name = semanticColorVarName(t.name)
    lines.push(`  --${name}: ${semanticCssValue(t, architecture, ramps)};`)
  })
  lines.push('}')
  lines.push('')
  lines.push(
    '/* Dark: duplicate variable names under [data-theme="dark"] from the CSS export, or use class-based dark variant. */',
  )
  return lines.join('\n')
}

/** @deprecated Prefer {@link exportTailwindV4ThemeInline} for primitives + semantic bridge. */
export function exportTailwindThemeSnippet(params: {
  global: GlobalSwatch[]
}): string {
  const lines: string[] = ['// tailwind @theme extension (primitives only)', '@theme inline {']
  params.global.forEach((s) => {
    const t1 = tier1NeutralCssVarName(s.label)
    lines.push(`  --${t1}: ${s.serialized.oklchCss};`)
  })
  lines.push('}')
  return lines.join('\n')
}
