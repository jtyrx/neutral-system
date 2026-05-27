import type {PaletteName} from '@/lib/color-engine/types'

// OKLCH L in [0, 1]. Index 0 = stop 1.
// Light: stop 1 (lightest) → stop 9 (darkest).
// Dark:  stop 1 (near-black surface) → stop 9 (near-white text).
// Informed by Primer's scale shape and Harmonizer's expected Lc output.
// Validate: stop 5 should hit Lc ≈ 51 vs white/black; stops 1/9 should hit Lc ≈ 100.

export const LIGHT_L = [
  0.97, // stop 1 — near-white surface
  0.93, // stop 2
  0.87, // stop 3
  0.78, // stop 4
  0.66, // stop 5 — cusp region, max chroma available
  0.54, // stop 6
  0.42, // stop 7
  0.30, // stop 8
  0.18, // stop 9 — near-black text
] as const satisfies readonly number[]

export const DARK_L = [
  0.12, // stop 1 — near-black surface in dark theme
  0.18, // stop 2
  0.26, // stop 3
  0.36, // stop 4
  0.48, // stop 5
  0.60, // stop 6
  0.72, // stop 7
  0.84, // stop 8
  0.94, // stop 9 — near-white text in dark theme
] as const satisfies readonly number[]

// All palettes share the same L arrays as a starting point.
// Per-hue tuning can be added after APCA validation.
export const PALETTE_LIGHT_L: Record<PaletteName, readonly number[]> = {
  blue: LIGHT_L,
  green: LIGHT_L,
  orange: LIGHT_L,
  yellow: LIGHT_L,
  red: LIGHT_L,
  purple: LIGHT_L,
}

export const PALETTE_DARK_L: Record<PaletteName, readonly number[]> = {
  blue: DARK_L,
  green: DARK_L,
  orange: DARK_L,
  yellow: DARK_L,
  red: DARK_L,
  purple: DARK_L,
}
