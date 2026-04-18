import {contrastTextOnBg, wcagLargeText, wcagUi, type WcagLevel} from '@/lib/neutral-engine/contrast'
import {SURFACE_SLOTS, TEXT_SLOTS} from '@/lib/neutral-engine/semanticNaming'
import type {SystemToken} from '@/lib/neutral-engine/types'

export type ContrastPairResult = {
  id: string
  surfaceRole: string
  textRole: string
  label: string
  ratio: number
  /** WCAG for normal body text (4.5:1 AA). */
  bodyLevel: WcagLevel
  /** WCAG for UI / large text (3:1 AA). */
  uiLevel: WcagLevel
  passAaBody: boolean
  passAaUi: boolean
}

/**
 * Recommended text roles per surface for product validation (not exhaustive).
 * `surface.inverse` prefers `text.inverse` and high-contrast neutrals.
 */
export const SURFACE_TEXT_CONTRACTS: Record<string, readonly string[]> = {
  'surface.base': ['text.primary', 'text.secondary', 'text.tertiary', 'text.disabled'],
  'surface.subtle': ['text.primary', 'text.secondary', 'text.tertiary'],
  'surface.container': ['text.primary', 'text.secondary', 'text.tertiary'],
  'surface.elevated': ['text.primary', 'text.secondary', 'text.tertiary'],
  'surface.inverse': ['text.inverse', 'text.primary', 'text.secondary'],
}

function tokenByRole(tokens: SystemToken[], role: string): SystemToken | undefined {
  return tokens.find((t) => t.role === role)
}

/**
 * Build contrast matrix for a theme’s tokens (light or dark resolved set).
 */
export function buildContrastPairResults(tokens: SystemToken[]): ContrastPairResult[] {
  const out: ContrastPairResult[] = []
  for (const surface of SURFACE_SLOTS) {
    const sRole = `surface.${surface}`
    const bg = tokenByRole(tokens, sRole)
    if (!bg) continue
    const allowed = SURFACE_TEXT_CONTRACTS[sRole] ?? TEXT_SLOTS.map((x) => `text.${x}`)
    for (const tr of allowed) {
      const te = tokenByRole(tokens, tr)
      if (!te) continue
      const ratio = contrastTextOnBg(te.color, bg.color)
      const bodyLevel = wcagLargeText(ratio)
      const uiLevel = wcagUi(ratio)
      out.push({
        id: `${sRole}::${tr}`,
        surfaceRole: sRole,
        textRole: tr,
        label: `${surface} × ${tr.replace('text.', '')}`,
        ratio,
        bodyLevel,
        uiLevel,
        passAaBody: ratio >= 4.5,
        passAaUi: ratio >= 3,
      })
    }
  }
  return out
}
