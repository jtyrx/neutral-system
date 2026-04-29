/**
 * Dot-path semantic roles (tier-2): `surface.default`, `text.muted`, `border.focus`, …
 * Tier-1 primitives remain `--color-neutral-*`; roles resolve per theme via {@link deriveSystemTokens}.
 *
 * **Lexicon (intent):**
 * - **Surface** `surface.*` — elevation: `sunken` (well) → `default` (page) → `subtle` → `raised` → `overlay`;
 *   `brand` (accent plane); `inverse` (high-contrast ramp flip vs `sunken`).
 * - **Text** `text.*` — hierarchy: `default` → `subtle` → `muted` → `disabled`; `on` for copy on inverse/brand.
 * - **Border** `border.*` — stroke ladder `default` / `subtle` / `strong` (mapping order is engine-defined);
 *   `focus` is max-contrast vs page base, not a stroke rung.
 * - **Interactive** — `overlay.scrim`, `state.hover` (alt pool); `emphasis.*` optional widen contrast (see exports).
 *
 * **Config names:** `SystemMappingConfig` still uses legacy `fill*` / `stroke*` for surface / border ladder
 * field names; UI labels map these in `workbenchInputLabels`.
 */

import type {SystemRole} from '@/lib/neutral-engine/types'

/**
 * Standard surface elevation ladder (indices 0–4). `inverse` is **not** part of this list — it is a
 * dedicated high-contrast flip mirrored from the first standard pick (see {@link resolveSurfaceInverseIndex}).
 *
 * Order: deepest well → page base → secondary → cards → overlay (light: low→high index; dark elevated: reversed visually).
 */
export const SURFACE_STANDARD_NAMES = [
  'sunken',
  'default',
  'subtle',
  'raised',
  'overlay',
] as const

/** How many named standard surface roles exist (fill count is clamped to min/max separately). */
export const SURFACE_STANDARD_SLOT_COUNT = SURFACE_STANDARD_NAMES.length

/** UI / migration bounds for “surface token count” (standard ladder only; excludes inverse). */
export const SURFACE_STANDARD_COUNT_MIN = 2
export const SURFACE_STANDARD_COUNT_MAX = SURFACE_STANDARD_SLOT_COUNT

/**
 * All app surface modifiers for contrast matrices: standard ladder + on-brand plane + inverse.
 * (See {@link SURFACE_ROLE_SORT_ORDER}.)
 */
export const SURFACE_SLOTS = [...SURFACE_STANDARD_NAMES, 'brand', 'inverse'] as const

/** Border ramp picks only (strokeCount); `focus` is derived separately — see {@link resolveBorderFocusIndex}. */
export const BORDER_LADDER_NAMES = ['default', 'subtle', 'strong'] as const
export const BORDER_STANDARD_SLOT_COUNT = BORDER_LADDER_NAMES.length

/** Full border role set for badges, exports, and docs (ladder + focus). */
export const BORDER_SLOTS = [...BORDER_LADDER_NAMES, 'focus'] as const

/** Content hierarchy: standard ladder + `on` (contrast flip of `default`, not part of textCount). */
export const TEXT_SLOTS = ['default', 'subtle', 'muted', 'disabled', 'on'] as const
/** Standard text ladder only (default → disabled). `on` is mapped separately, not part of text count. */
export const TEXT_STANDARD_SLOT_COUNT = 4

/** Index of `on` in the full **text** slot array (0-based). */
export const INVERSE_MODIFIER_INDEX = 4

/** Stable ordering for `surface.*` roles in tables and layer lists (brand before inverse flip). */
export const SURFACE_ROLE_SORT_ORDER: readonly string[] = [
  ...SURFACE_STANDARD_NAMES.map((n) => `surface.${n}`),
  'surface.brand',
  'surface.inverse',
]

/** Stable ordering for `border.*` (ladder then focus). */
export const BORDER_ROLE_SORT_ORDER: readonly string[] = BORDER_SLOTS.map((n) => `border.${n}`)

/** Stable ordering for `text.*` (ladder then on). */
export const TEXT_ROLE_SORT_ORDER: readonly string[] = TEXT_SLOTS.map((n) => `text.${n}`)

/** Contrast-flip pair roles (`surface.inverse`, `text.on`) — not normal hierarchy steps. */
export function isInversePairRole(role: string): boolean {
  return role === 'surface.inverse' || role === 'text.on'
}

/** Dedicated focus-ring token (max-contrast neutral), not a stroke ladder rung. */
export function isBorderFocusRole(role: string): boolean {
  return role === 'border.focus'
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
  if (k >= 0 && k < BORDER_LADDER_NAMES.length) {
    return `border.${BORDER_LADDER_NAMES[k]}` as SystemRole
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
  if (ca === 'border' && a.startsWith('border.') && b.startsWith('border.')) {
    const oa = BORDER_ROLE_SORT_ORDER.indexOf(a)
    const ob = BORDER_ROLE_SORT_ORDER.indexOf(b)
    if (oa !== -1 && ob !== -1) return oa - ob
    if (oa !== -1) return -1
    if (ob !== -1) return 1
  }
  if (ca === 'text' && a.startsWith('text.') && b.startsWith('text.')) {
    const oa = TEXT_ROLE_SORT_ORDER.indexOf(a)
    const ob = TEXT_ROLE_SORT_ORDER.indexOf(b)
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
