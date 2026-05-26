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
  | 'border.onOverlay'
  | 'border.onScrim'
  | 'text.onBrand'
  | 'text.onOverlayScrim'
  | 'text.onScrim'

/**
 * Resolves a named intent to the engine role used for tier-2 `--color-*` vars.
 *
 * Brand pair (`surface.brand`, `text.brand`, `border.brand`) and inverse pair
 * (`surface.inverse`, `text.inverse`, `border.inverse`) are first-class roles — each
 * emits its own CSS variable. Brand tokens use `brandOklch` (customColor) rather than
 * neutral ramp picks; border.inverse shares the surface.inverse ramp index.
 * `text.onBrand` remains as a product-language alias for `text.brand`.
 */
export const SEMANTIC_INTENT_TO_ROLE: Record<SemanticIntent, SystemRole> = {
  'surface.sunken': 'surface.sunken',
  'surface.default': 'surface.default',
  'surface.subtle': 'surface.subtle',
  'surface.raised': 'surface.raised',
  'surface.overlay': 'surface.overlay',
  'surface.brand': 'surface.brand',
  'surface.inverse': 'surface.inverse',
  'border.subtle': 'border.subtle',
  'border.default': 'border.default',
  'border.strong': 'border.strong',
  'border.focus': 'border.focus',
  'border.brand': 'border.brand',
  'border.inverse': 'border.inverse',
  'border.onScrim': 'border.subtle',
  'border.onOverlay': 'border.default',
  'text.default': 'text.default',
  'text.subtle': 'text.subtle',
  'text.muted': 'text.muted',
  'text.disabled': 'text.disabled',
  'text.inverse': 'text.inverse',
  'text.brand': 'text.brand',
  'text.onBrand': 'text.brand',
  'text.onScrim': 'text.default',
  'text.onOverlayScrim': 'text.default',
  'overlay.scrim': 'overlay.scrim',
  'state.hover': 'state.hover',
}
