import {linesLiveThemeNsChromeBlock} from '@/lib/neutral-engine/chromeAliases'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'
import type {SystemToken} from '@/lib/neutral-engine/types'

/** Safe fragment for CSS fragments (dots → hyphens): `surface.default` → `surface-default`. */
export function tokenCssVarName(name: string): string {
  return name.replace(/\./g, '-')
}

/**
 * Custom brand is a preview-only semantic: it drives live chrome (`--color-surface-brand`) but is
 * intentionally omitted from downloadable export payloads so the distributed system remains
 * ramp-derived. Use this predicate to filter tokens before serializing to JSON/CSS/Tailwind.
 */
export function isPreviewOnlyBrandToken(t: SystemToken): boolean {
  return t.role === 'surface.brand' && t.customColor === true
}

/** Optional `emphasis.*` ladder — omitted from downloadable token JSON only (see ExportSection). */
export function isEmphasisToken(t: SystemToken): boolean {
  return t.role.startsWith('emphasis.')
}

/**
 * Theme variable for Tailwind v4 `bg-*` / `text-*` utilities: `--color-surface-default`, `--color-text-muted`, …
 */
export function semanticColorVarName(name: string): string {
  return `color-${tokenCssVarName(name)}`
}

function semanticCssValue(t: SystemToken, global: GlobalSwatch[]): string {
  if (t.alpha != null && t.alpha < 1) {
    return `color-mix(in oklch, ${t.serialized.oklchCss} ${Math.round(t.alpha * 100)}%, transparent)`
  }
  if (t.customColor) {
    return t.serialized.oklchCss
  }
  const sw = global[t.sourceGlobalIndex]
  return sw ? `var(--color-neutral-${sw.label})` : t.serialized.oklchCss
}

/**
 * Re-declares `globals.css` `--ns-*` → tier-2 `--color-*` inside each `[data-theme]` block from
 * the live stylesheet. Without this, injected `--color-*` updates while `--ns-*` stay static until
 * refresh. See `linesLiveThemeNsChromeBlock` in `chromeAliases.ts`.
 */
export function exportJson(params: {
  global: GlobalSwatch[]
  light: SystemToken[]
  dark: SystemToken[]
}): string {
  const {global, light, dark} = params
  const glob: Record<string, {oklch: string; hex: string}> = {}
  global.forEach((s) => {
    glob[`neutral-${s.label}`] = {oklch: s.serialized.oklchCss, hex: s.serialized.hex}
  })
  const pack = (tokens: SystemToken[], prefix: string) => {
    const o: Record<string, {oklch: string; hex: string; sourceIndex?: number; alpha?: number}> =
      {}
    tokens.forEach((t) => {
      o[`${prefix}-${tokenCssVarName(t.name)}`] = {
        oklch: t.serialized.oklchCss,
        hex: t.serialized.hex,
        sourceIndex: t.sourceGlobalIndex,
        ...(t.alpha != null ? {alpha: t.alpha} : {}),
      }
    })
    return o
  }
  return JSON.stringify(
    {
      global: glob,
      system: {
        light: pack(light, 'light'),
        dark: pack(dark, 'dark'),
      },
    },
    null,
    2,
  )
}

export function exportCssVariables(params: {
  global: GlobalSwatch[]
  light: SystemToken[]
  dark: SystemToken[]
}): string {
  const lines: string[] = [':root {']
  params.global.forEach((s) => {
    lines.push(`  --color-neutral-${s.label}: ${s.serialized.oklchCss};`)
  })
  lines.push('}')
  lines.push('')
  lines.push('[data-theme="light"] {')
  params.light.forEach((t) => {
    lines.push(`  --${semanticColorVarName(t.name)}: ${semanticCssValue(t, params.global)};`)
  })
  lines.push(...linesLiveThemeNsChromeBlock())
  lines.push('}')
  lines.push('')
  lines.push('[data-theme="dark"] {')
  params.dark.forEach((t) => {
    lines.push(`  --${semanticColorVarName(t.name)}: ${semanticCssValue(t, params.global)};`)
  })
  lines.push(...linesLiveThemeNsChromeBlock())
  lines.push('}')
  return lines.join('\n')
}

export function exportCsv(global: GlobalSwatch[]): string {
  const header = ['index', 'label', 'oklch', 'hex', 'rgb']
  const rows = global.map((s) =>
    [String(s.index), s.label, s.serialized.oklchCss, s.serialized.hex, s.serialized.rgbCss].join(
      ',',
    ),
  )
  return [header.join(','), ...rows].join('\n')
}

/**
 * Tailwind CSS v4: primitives + light semantic aliases in `@theme inline` (references tier-1 vars).
 * Pair with `[data-theme="dark"]` from {@link exportCssVariables} for full theming.
 */
export function exportTailwindV4ThemeInline(params: {
  global: GlobalSwatch[]
  light: SystemToken[]
}): string {
  const lines: string[] = [
    '/* Neutral primitives — tier 1 (paste after @import "tailwindcss";) */',
    ':root {',
  ]
  params.global.forEach((s) => {
    lines.push(`  --color-neutral-${s.label}: ${s.serialized.oklchCss};`)
  })
  lines.push('}')
  lines.push('')
  lines.push('@theme inline {')
  params.global.forEach((s) => {
    lines.push(`  --color-neutral-${s.label}: var(--color-neutral-${s.label});`)
  })
  lines.push(
    '  /* Tier 2 semantics (light): --color-* maps to bg-surface-default, text-default, border-focus, etc. */',
  )
  params.light.forEach((t) => {
    const name = semanticColorVarName(t.name)
    lines.push(`  --${name}: ${semanticCssValue(t, params.global)};`)
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
    lines.push(`  --color-neutral-${s.label}: ${s.serialized.oklchCss};`)
  })
  lines.push('}')
  return lines.join('\n')
}
