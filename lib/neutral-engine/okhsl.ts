/**
 * OKHSL authoring overlay — pure functions, no React, no state.
 *
 * OKHSL is a read-derived *view* on top of the canonical OKLCH config. The two entry points are:
 *   - `okhslViewFromConfig(cfg)` — project the current OKLCH config into OKHSL coordinates.
 *   - `applyOkhslEdit(cfg, edit)` — commit an OKHSL slider edit back to the OKLCH config.
 *
 * There is no OKHSL state; all edits flow through `GlobalScaleConfig` unchanged.
 */

import Color from 'colorjs.io'

import type {GlobalScaleConfig} from '@/lib/neutral-engine/types'

export type OkhslView = {
  /** Hue in degrees [0, 360). */
  hue: number
  /**
   * OKHSL saturation [0, 1]. Derived from `baseChroma` at the mid-lightness point (L=0.5).
   * Note: S is gamut-relative — the same S at different L values encodes different absolute chroma.
   */
  saturation: number
  /** OKHSL L equivalent of `lHigh` (light-end lightness, 0–1). */
  lHigh: number
  /** OKHSL L equivalent of `lLow` (dark-end lightness, 0–1). */
  lLow: number
  /** True when `chromaMode === 'achromatic'`; S is meaningless in that state. */
  isAchromatic: boolean
}

export type OkhslEdit = Partial<{
  hue: number
  saturation: number
  lHigh: number
  lLow: number
}>

function oklchToOkhsl(L: number, C: number, H: number): [number, number, number] {
  const c = new Color('oklch', [L, C, H])
  const coords = c.to('okhsl').coords
  return [coords[0] ?? 0, coords[1] ?? 0, coords[2] ?? 0]
}

function okhslToOklch(H: number, S: number, L: number): [number, number, number] {
  const c = new Color('okhsl', [H, S, L])
  const coords = c.to('oklch').coords
  return [coords[0] ?? 0, coords[1] ?? 0, coords[2] ?? 0]
}

/**
 * Project the current OKLCH config into OKHSL authoring coordinates.
 *
 * - Hue is taken directly from `cfg.hue` (OKLCH hue ≈ OKHSL hue for neutrals).
 * - Saturation is derived by converting a mid-lightness reference color with the current
 *   `baseChroma` into OKHSL at L=0.5. This gives a gamut-normalised S the designer can scrub.
 * - lHigh / lLow are converted from OKLCH L through OKHSL at C=0 (achromatic); OKHSL L and
 *   OKLCH L are numerically identical on the achromatic axis, so this is a no-op in practice
 *   but keeps the view contract correct.
 */
export function okhslViewFromConfig(cfg: GlobalScaleConfig): OkhslView {
  const isAchromatic = cfg.chromaMode === 'achromatic'
  const hue = cfg.hue
  const baseChroma = cfg.baseChroma

  // Derive saturation at a mid-lightness reference so it's stable across the ramp
  let saturation = 0
  if (!isAchromatic && baseChroma > 0) {
    const [, S] = oklchToOkhsl(0.5, baseChroma, hue)
    saturation = S ?? 0
  }

  // lHigh / lLow: on the achromatic axis, OKHSL L ≡ OKLCH L
  const [, , lHighOkhsl] = okhslToOklch(hue, 0, cfg.lHigh)
  const [, , lLowOkhsl] = okhslToOklch(hue, 0, cfg.lLow)

  return {
    hue,
    saturation,
    lHigh: lHighOkhsl !== 0 ? cfg.lHigh : cfg.lHigh, // achromatic axis: OKLCH L == OKHSL L
    lLow: lLowOkhsl !== 0 ? cfg.lLow : cfg.lLow,
    isAchromatic,
  }
}

/**
 * Apply an OKHSL slider edit back to the canonical `GlobalScaleConfig`.
 *
 * - `hue` → `cfg.hue` (direct mapping; unchanged if absent).
 * - `saturation` → `cfg.baseChroma` via an OKHSL→OKLCH round-trip at L=0.5.
 *   Only applies when `cfg.chromaMode !== 'achromatic'`.
 * - `lHigh` / `lLow` → `cfg.lHigh` / `cfg.lLow` (OKHSL L ≡ OKLCH L on achromatic axis).
 */
export function applyOkhslEdit(cfg: GlobalScaleConfig, edit: OkhslEdit): GlobalScaleConfig {
  let next = {...cfg}

  if (edit.hue !== undefined) {
    next = {...next, hue: edit.hue}
  }

  if (edit.saturation !== undefined && cfg.chromaMode !== 'achromatic') {
    const hue = edit.hue ?? cfg.hue
    const [, C] = okhslToOklch(hue, Math.max(0, Math.min(1, edit.saturation)), 0.5)
    next = {...next, baseChroma: Math.max(0, C ?? 0)}
  }

  if (edit.lHigh !== undefined) {
    // OKHSL L ≡ OKLCH L on the neutral (achromatic) axis
    next = {...next, lHigh: Math.max(0, Math.min(1, edit.lHigh))}
  }

  if (edit.lLow !== undefined) {
    next = {...next, lLow: Math.max(0, Math.min(1, edit.lLow))}
  }

  return next
}
