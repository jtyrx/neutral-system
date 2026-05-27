import type {PaletteName} from '@/lib/color-engine/types'

// Default OKLCH H values per palette name.
// These are reasonable starting hues — users can adjust per palette.
export const DEFAULT_HUES: Record<PaletteName, number> = {
  blue: 264,
  green: 145,
  orange: 55,
  yellow: 95,
  red: 25,
  purple: 305,
}

export const PALETTE_NAMES: PaletteName[] = [
  'blue',
  'green',
  'orange',
  'yellow',
  'red',
  'purple',
]
