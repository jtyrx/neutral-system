/**
 * Dot-path semantic roles (Material / Polaris–style): `surface.base`, `text.primary`, `border.subtle`, …
 * Tier-1 primitives remain `neutral-*`; these are tier-2 roles resolved per theme.
 */

import type {SystemRole} from '@/lib/neutral-engine/types'

/**
 * Standard surface ladder names (indices 0–7). `inverse` is **not** part of this list — it is a
 * separate contrast-flip token mirrored from the first standard pick.
 */
export const SURFACE_STANDARD_NAMES = [
  'base',
  'subtle',
  'container',
  'elevated',
  'rung-5',
  'rung-6',
  'rung-7',
  'rung-8',
] as const

/** How many named standard surface roles exist (fill count is clamped to min/max separately). */
export const SURFACE_STANDARD_SLOT_COUNT = SURFACE_STANDARD_NAMES.length

/** UI / migration bounds for “surface token count” (standard ladder only; excludes inverse). */
export const SURFACE_STANDARD_COUNT_MIN = 2
export const SURFACE_STANDARD_COUNT_MAX = SURFACE_STANDARD_SLOT_COUNT

/**
 * All app surface modifiers for contrast matrices: full standard ladder + inverse.
 * (Inverse is listed last; see {@link SURFACE_ROLE_SORT_ORDER}.)
 */
export const SURFACE_SLOTS = [...SURFACE_STANDARD_NAMES, 'inverse'] as const
export const BORDER_SLOTS = ['subtle', 'default', 'strong'] as const
/** Content tones: `inverse` mirrors `text.primary` for theme-flip. */
export const TEXT_SLOTS = ['primary', 'secondary', 'tertiary', 'disabled', 'inverse'] as const
/** Standard text ladder only (primary → disabled). Inverse is mapped separately, not part of text count. */
export const TEXT_STANDARD_SLOT_COUNT = 4

/** Index of `inverse` in the full **text** slot array (0-based). */
export const INVERSE_MODIFIER_INDEX = 4

/** Stable ordering for `surface.*` roles in tables and layer lists (inverse last). */
export const SURFACE_ROLE_SORT_ORDER: readonly string[] = [
  ...SURFACE_STANDARD_NAMES.map((n) => `surface.${n}`),
  'surface.inverse',
]

/** Contrast-flip pair roles (`surface.inverse`, `text.inverse`) — not normal hierarchy steps. */
export function isInversePairRole(role: string): boolean {
  return role === 'surface.inverse' || role === 'text.inverse'
}

/** Contrast emphasis: spacing between resolved ramp picks. */
export type ContrastEmphasis = 'subtle' | 'default' | 'strong' | 'inverse'

/** Role id for the k-th **standard** surface pick (0 … SURFACE_STANDARD_SLOT_COUNT−1). Never `inverse`. */
export function surfaceStandardRoleForIndex(k: number): SystemRole {
  if (k >= 0 && k < SURFACE_STANDARD_NAMES.length) {
    return `surface.${SURFACE_STANDARD_NAMES[k]}` as SystemRole
  }
  return `surface.layer-${k}` as SystemRole
}

/** @deprecated Prefer {@link surfaceStandardRoleForIndex} — alias for compatibility. */
export function surfaceRoleForIndex(k: number): SystemRole {
  return surfaceStandardRoleForIndex(k)
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
  if (ca === 'surface' && a.startsWith('surface.') && b.startsWith('surface.')) {
    const oa = SURFACE_ROLE_SORT_ORDER.indexOf(a)
    const ob = SURFACE_ROLE_SORT_ORDER.indexOf(b)
    if (oa !== -1 && ob !== -1) return oa - ob
    if (oa !== -1) return -1
    if (ob !== -1) return 1
  }
  return a.localeCompare(b)
}

/** Hide overflow ladder tokens from primary UI lists. */
export function isOverflowRole(role: string): boolean {
  return role.includes('.layer-')
}
