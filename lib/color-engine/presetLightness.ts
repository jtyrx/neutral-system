import type { PaletteName } from '@/lib/color-engine/types'

// OKLCH L in [0, 1]. 10 stops, 0-indexed (matches Primer's chromatic scale convention).
// Light: stop 0 (lightest tint) → stop 9 (darkest shade).
// Dark:  stop 0 (near-black surface) → stop 9 (near-white text).

export const LIGHT_L = [
  0.97, // stop 0 — near-white tint
  0.93, // stop 1
  0.87, // stop 2
  0.78, // stop 3
  0.66, // stop 4 — cusp region, max chroma
  0.54, // stop 5
  0.42, // stop 6
  0.30, // stop 7
  0.20, // stop 8
  0.13, // stop 9 — near-black shade
] as const satisfies readonly number[]

export const DARK_L = [
  0.10, // stop 0 — near-black surface in dark theme
  0.16, // stop 1
  0.24, // stop 2
  0.34, // stop 3
  0.46, // stop 4
  0.58, // stop 5
  0.70, // stop 6
  0.80, // stop 7
  0.88, // stop 8
  0.95, // stop 9 — near-white text in dark theme
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
