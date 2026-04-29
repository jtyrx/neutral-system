/**
 * Typed mapping from **semantic intents** (including UI chrome policy aliases)
 * to engine {@link SystemRole} ids. Use this as the single registry for
 * “this `--ns-*` / design token *means* this ladder role” decisions.
 *
 * Engine roles stay dot-paths; CSS emits `--color-*` with hyphenation.
 */

import type {KnownSystemRole, SystemRole} from '@/lib/neutral-engine/types'

/** Intents that can diverge from raw `KnownSystemRole` names (policy aliases). */
export type SemanticIntent =
  | KnownSystemRole
  | 'border.brand'
  | 'border.inverse'
  | 'border.onOverlay'
  | 'border.onScrim'
  | 'text.onBrand'
  | 'text.onOverlayScrim'
  | 'text.onScrim'

/**
 * Resolves a named intent to the engine role used for tier-2 `--color-*` vars.
 * `border.brand` / `text.onBrand` intentionally map to strong / on — document
 * in product language, not as separate ramp slots.
 */
export const SEMANTIC_INTENT_TO_ROLE: Record<SemanticIntent, SystemRole> = {
  'surface.sunken': 'surface.sunken',
  'surface.default': 'surface.default',
  'surface.subtle': 'surface.subtle',
  'surface.raised': 'surface.raised',
  'surface.overlay': 'surface.overlay',
  'surface.brand': 'surface.brand',
  'surface.inverse': 'surface.inverse',
  'border.default': 'border.default',
  'border.subtle': 'border.subtle',
  'border.strong': 'border.strong',
  'border.focus': 'border.focus',
  'border.brand': 'border.strong',
  'border.inverse': 'border.focus',
  'border.onScrim': 'border.subtle',
  'border.onOverlay': 'border.default',
  'text.default': 'text.default',
  'text.subtle': 'text.subtle',
  'text.muted': 'text.muted',
  'text.disabled': 'text.disabled',
  'text.on': 'text.on',
  'text.onBrand': 'text.on',
  'text.onScrim': 'text.default',
  'text.onOverlayScrim': 'text.default',
  'overlay.scrim': 'overlay.scrim',
  'state.hover': 'state.hover',
}
