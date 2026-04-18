import type {NamingStyle} from '@/lib/neutral-engine/types'

/**
 * One unique numeric label per step on the 0–1000 token scale (canonical neutral-* export keys).
 *
 * Previously, `token_ladder` picked an anchor index with `round(t * 18)`, so when
 * `steps` exceeded the anchor count, many indices collapsed to the same anchor (duplicate
 * `neutral-0`, `neutral-25`, … in JSON/CSS). Spacing labels evenly across 0–1000 keeps a single
 * canonical ladder and injective export names.
 */
export function uniqueTokenLadderLabels(steps: number): string[] {
  if (steps < 2) return ['0']
  const denom = steps - 1
  return Array.from({length: steps}, (_, i) => String(Math.round((i * 1000) / denom)))
}

/**
 * Full label column for the global ramp (single source of truth for swatches + export).
 */
export function labelsForNamingStyle(style: NamingStyle, steps: number): string[] {
  if (steps < 1) return []
  if (steps === 1) return ['0']

  switch (style) {
    case 'token_ladder':
      return uniqueTokenLadderLabels(steps)
    case 'semantic':
      return Array.from({length: steps}, (_, i) => String(i))
    case 'numeric_desc': {
      const hi = 100
      const lo = 4
      return Array.from({length: steps}, (_, i) => {
        const t = i / (steps - 1)
        return String(Math.round(hi - t * (hi - lo)))
      })
    }
    default:
      return Array.from({length: steps}, (_, i) => String(i))
  }
}

/** Map index to token-style labels (0 … 1000 ladder for `token_ladder`). Prefer {@link labelsForNamingStyle} when building a full ramp. */
export function labelForIndex(style: NamingStyle, index: number, steps: number): string {
  if (steps < 2) return '0'
  return labelsForNamingStyle(style, steps)[index] ?? '0'
}
