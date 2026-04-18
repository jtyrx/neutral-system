/**
 * Dot-path semantic roles (Material / Polaris–style): `surface.base`, `text.primary`, `border.subtle`, …
 * Tier-1 primitives remain `neutral-*`; these are tier-2 roles resolved per theme.
 */

import type {SystemRole} from '@/lib/neutral-engine/types'

/** App surfaces: base canvas through inverse (inverse mirrors `surface.base` on the ramp). */
export const SURFACE_SLOTS = ['base', 'subtle', 'container', 'elevated', 'inverse'] as const
export const BORDER_SLOTS = ['subtle', 'default', 'strong'] as const
/** Content tones: `inverse` mirrors `text.primary` for theme-flip. */
export const TEXT_SLOTS = ['primary', 'secondary', 'tertiary', 'disabled', 'inverse'] as const

/** Index of `inverse` in surface and text slot arrays (0-based). */
export const INVERSE_MODIFIER_INDEX = 4

/** Contrast-flip pair roles (`surface.inverse`, `text.inverse`) — not normal hierarchy steps. */
export function isInversePairRole(role: string): boolean {
  return role === 'surface.inverse' || role === 'text.inverse'
}

/** Contrast emphasis: spacing between resolved ramp picks. */
export type ContrastEmphasis = 'subtle' | 'default' | 'strong' | 'inverse'

export function surfaceRoleForIndex(k: number): SystemRole {
  if (k >= 0 && k < SURFACE_SLOTS.length) {
    return `surface.${SURFACE_SLOTS[k]}` as SystemRole
  }
  return `surface.layer-${k}` as SystemRole
}

export function borderRoleForIndex(k: number): SystemRole {
  if (k >= 0 && k < BORDER_SLOTS.length) {
    return `border.${BORDER_SLOTS[k]}` as SystemRole
  }
  return `border.layer-${k}` as SystemRole
}

export function textRoleForIndex(k: number): SystemRole {
  if (k >= 0 && k < TEXT_SLOTS.length) {
    return `text.${TEXT_SLOTS[k]}` as SystemRole
  }
  return `text.layer-${k}` as SystemRole
}

/** Interactive pool: scrim first, hover; overflow uses internal-only names. */
export function altRoleForIndex(k: number): SystemRole {
  if (k === 0) return 'overlay.scrim'
  if (k === 1) return 'state.hover'
  return `state.layer-${k}` as SystemRole
}

export function emphasisSurfaceRole(k: number): SystemRole {
  return `emphasis.surface.${k}` as SystemRole
}

export function emphasisBorderRole(k: number): SystemRole {
  return `emphasis.border.${k}` as SystemRole
}

export function emphasisTextRole(k: number): SystemRole {
  return `emphasis.text.${k}` as SystemRole
}

/** Top-level semantic category for grouping UIs. */
export type SemanticCategory = 'surface' | 'border' | 'text' | 'interactive' | 'emphasis'

export function semanticCategory(role: string): SemanticCategory {
  if (role.startsWith('emphasis.')) return 'emphasis'
  if (role.startsWith('surface.')) return 'surface'
  if (role.startsWith('border.')) return 'border'
  if (role.startsWith('text.')) return 'text'
  if (role.startsWith('state.') || role.startsWith('overlay.')) return 'interactive'
  return 'surface'
}

/** Sort key for table / pair ordering within mixed lists. */
const CATEGORY_ORDER: SemanticCategory[] = ['surface', 'border', 'text', 'interactive', 'emphasis']

export function compareSemanticRoles(a: string, b: string): number {
  const ca = semanticCategory(a)
  const cb = semanticCategory(b)
  const ia = CATEGORY_ORDER.indexOf(ca)
  const ib = CATEGORY_ORDER.indexOf(cb)
  if (ia !== ib) return ia - ib
  return a.localeCompare(b)
}

/** Hide overflow ladder tokens from primary UI lists. */
export function isOverflowRole(role: string): boolean {
  return role.includes('.layer-')
}
