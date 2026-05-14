/** Shared stacked progressive blur math (no React). */

export type BlurCurve = 'exponential' | 'linear'

/**
 * Blur radius per layer. Exponential curve matches the common 0.5→1→2→… pattern,
 * scaled so the last layer reaches `maxBlurPx`.
 */
export function layerBlurRadiiPx(
  layerCount: number,
  maxBlurPx: number,
  curve: BlurCurve = 'exponential',
): number[] {
  const n = Math.min(8, Math.max(4, Math.round(layerCount)))
  if (curve === 'linear') {
    return Array.from({length: n}, (_, i) => {
      const t = n === 1 ? 1 : i / (n - 1)
      return Math.max(0.5, maxBlurPx * t)
    })
  }
  const raw = Array.from({length: n}, (_, i) => 0.5 * 2 ** i)
  const peak = raw[n - 1]!
  const scale = maxBlurPx / peak
  return raw.map((r) => Math.min(maxBlurPx, r * scale))
}

/**
 * Four-stop linear mask for layer `layerIndex` (0-based) of `layerCount` layers.
 * @param tension >1 widens plateaus slightly (reduces band risk at seams).
 */
export function linearGradientMaskStops(
  layerIndex: number,
  layerCount: number,
  tension = 1,
): string {
  const n = layerCount
  const segment = (1 / (n + 1)) * tension
  const a = Math.max(0, layerIndex * segment)
  const b = (layerIndex + 1) * segment
  const c = (layerIndex + 2) * segment
  const d = (layerIndex + 3) * segment
  const pct = (x: number) =>
    `${Math.min(100, Math.max(0, x * 100)).toFixed(2)}%`
  return `transparent ${pct(a)}, #000 ${pct(b)}, #000 ${pct(c)}, transparent ${pct(d)}`
}

/**
 * CSS `linear-gradient` first argument for mask direction.
 * `bottom` = stronger toward the physical bottom edge of the host → `to top`.
 */
export function linearGradientAxisForDirection(
  direction: 'top' | 'bottom' | 'left' | 'right',
): string {
  const map = {
    bottom: 'to top',
    top: 'to bottom',
    left: 'to right',
    right: 'to left',
  } as const
  return map[direction]
}
