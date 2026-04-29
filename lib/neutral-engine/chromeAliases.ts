/**
 * Chrome **mixers** (utility tokens): `color-mix` ladders and toaster backdrop.
 * Injected inside each `[data-theme]` block by `exportCssVariables` so they track
 * live tier-2 `--color-*` semantics.
 *
 * Role peers (`--ns-app-bg` → `surface.sunken`, etc.) live only in `app/globals.css`
 * as thin `var(--color-*)` aliases — they are not re-declared in the live stylesheet.
 * See `semanticPolicy.ts` for the typed intent → role registry.
 */

import type {ThemeMode} from '@/lib/neutral-engine/types'

/**
 * Tier-1 primitive naming — Simple Mode uses `--color-neutral-{label}`.
 * Advanced Mode uses sibling namespaces `--color-neutral-light-{label}` / `--color-neutral-dark-{label}`.
 */
export type Tier1NeutralExportMode =
  | {architecture: 'simple'}
  | {architecture: 'advanced'; scale: 'light' | 'dark'}

export function tier1NeutralCssVarName(label: string): string
export function tier1NeutralCssVarName(label: string, exportMode: Tier1NeutralExportMode): string
export function tier1NeutralCssVarName(label: string, exportMode?: Tier1NeutralExportMode): string {
  if (exportMode == null || exportMode.architecture === 'simple') {
    return `color-neutral-${label}`
  }
  return exportMode.scale === 'light'
    ? `color-neutral-light-${label}`
    : `color-neutral-dark-${label}`
}

/** Advanced tier-1 mode from semantic token theme (light sibling vs dark sibling ramp). */
export function tier1ExportModeFromTheme(theme: ThemeMode): Exclude<Tier1NeutralExportMode, {architecture: 'simple'}> {
  return {
    architecture: 'advanced',
    scale: theme === 'light' ? 'light' : 'dark',
  }
}

/** Dots → hyphens for `--color-*` semantic vars (matches `tokenCssVarName` in `exportFormats.ts`). */
export function tier2SemanticCssVarFromRole(role: string): string {
  return `color-${role.replace(/\./g, '-')}`
}

/**
 * Utility / mixer tokens (not engine roles). Appended after tier-2 `--color-*` lines
 * in each `[data-theme]` block.
 */
export const CHROME_MIXER_LINES: readonly string[] = [
  '  --chrome-hairline: color-mix(in oklch, var(--color-text-default) 10%, transparent);',
  '  --chrome-hairline-strong: color-mix(in oklch, var(--color-text-default) 18%, transparent);',
  '  --chrome-chip: color-mix(in oklch, var(--color-text-default) 6%, transparent);',
  '  --chrome-field: color-mix(in oklch, var(--color-text-default) 4%, transparent);',
  '  --chrome-overlay-soft: color-mix(in oklch, var(--color-text-default) 3%, transparent);',
  '  --chrome-overlay-strong: color-mix(in oklch, var(--color-text-default) 15%, transparent);',
  '  --chrome-toaster-bg: color-mix(in oklch, var(--color-surface-overlay) 95%, transparent);',
]

export function linesLiveThemeChromeBlock(): string[] {
  return [...CHROME_MIXER_LINES]
}

/** @deprecated Use {@link linesLiveThemeChromeBlock}. Kept for grep / external docs during migration. */
export function linesLiveThemeNsChromeBlock(): string[] {
  return linesLiveThemeChromeBlock()
}
