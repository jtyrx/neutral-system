import type {NamingStyle} from '@/lib/neutral-engine/types'

const LADDER_ANCHORS = [
  0, 25, 50, 75, 100, 150, 200, 300, 400, 500, 600, 700, 800, 850, 900, 925, 950, 975, 1000,
]

/** Map index to token-style labels (0 … 1000 ladder). */
export function labelForIndex(style: NamingStyle, index: number, steps: number): string {
  if (steps < 2) return '0'
  const t = index / (steps - 1)

  switch (style) {
    case 'numeric_desc': {
      const hi = 100
      const lo = 4
      const v = Math.round(hi - t * (hi - lo))
      return String(v)
    }
    case 'semantic':
      return String(index)
    case 'token_ladder': {
      const max = LADDER_ANCHORS.length - 1
      const j = Math.round(t * max)
      return String(LADDER_ANCHORS[j])
    }
    default:
      return String(index)
  }
}
