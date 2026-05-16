import Color from 'colorjs.io'

import {serializeColor} from '@/lib/neutral-engine/serialize'
import type {SerializedColor} from '@/lib/neutral-engine/types'

/** Default upper chroma bound for gamut probing and sweep functions. */
export const DEFAULT_C_CEILING = 0.4

export type OklchGamutTarget = 'srgb' | 'p3' | 'rec2020'

function oklchInGamut(L: number, C: number, H: number, target: OklchGamutTarget): boolean {
  return new Color('oklch', [L, C, H]).inGamut(target)
}

export type MaxInGamutChromaOpts = {
  cMax?: number
  iterations?: number
  /** @default 'srgb' */
  targetSpace?: OklchGamutTarget
}

/**
 * Maximum OKLCH chroma at fixed L and H inside `targetSpace` (binary search).
 */
export function maxInGamutChroma(
  L: number,
  H: number,
  opts?: MaxInGamutChromaOpts,
): number {
  const target = opts?.targetSpace ?? 'srgb'
  const cMax = opts?.cMax ?? DEFAULT_C_CEILING
  const iterations = opts?.iterations ?? 24
  const Lc = Math.min(1, Math.max(0, L))
  if (cMax <= 0 || !Number.isFinite(H)) return 0

  if (oklchInGamut(Lc, cMax, H, target)) return cMax

  let lo = 0
  let hi = cMax
  for (let i = 0; i < iterations; i++) {
    const mid = (lo + hi) / 2
    if (oklchInGamut(Lc, mid, H, target)) lo = mid
    else hi = mid
  }
  return lo
}

export type MultiGamutSample = {
  display: SerializedColor
  inSrgb: boolean
  inP3: boolean
  inRec2020: boolean
}

function multiGamutFromOklch(L: number, C: number, H: number): MultiGamutSample {
  const raw = new Color('oklch', [L, C, H])
  const inSrgb = raw.inGamut('srgb')
  const inP3 = raw.inGamut('p3')
  const inRec2020 = raw.inGamut('rec2020')
  return {
    display: serializeColor(raw),
    inSrgb,
    inP3,
    inRec2020,
  }
}

/**
 * Sample L in [0,1] at fixed C, H.
 */
export function sweepLAtFixedCH(
  C: number,
  H: number,
  samples: number,
): SerializedColor[] {
  const n = Math.max(2, Math.floor(samples))
  const out: SerializedColor[] = []
  const Cc = Math.max(0, C)
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const L = t
    const c = new Color('oklch', [L, Cc, H])
    out.push(serializeColor(c))
  }
  return out
}

export function sweepLAtFixedCHMulti(
  C: number,
  H: number,
  samples: number,
): MultiGamutSample[] {
  const n = Math.max(2, Math.floor(samples))
  const out: MultiGamutSample[] = []
  const Cc = Math.max(0, C)
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const L = t
    out.push(multiGamutFromOklch(L, Cc, H))
  }
  return out
}

/**
 * Sample C in [0, cMax] at fixed L, H.
 */
export function sweepCAtFixedLH(
  L: number,
  H: number,
  samples: number,
  cMax?: number,
): SerializedColor[] {
  const ceiling = cMax ?? DEFAULT_C_CEILING
  const n = Math.max(2, Math.floor(samples))
  const out: SerializedColor[] = []
  const Lc = Math.min(1, Math.max(0, L))
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const C = t * ceiling
    const c = new Color('oklch', [Lc, C, H])
    out.push(serializeColor(c))
  }
  return out
}

export function sweepCAtFixedLHMulti(
  L: number,
  H: number,
  samples: number,
  cMax?: number,
): MultiGamutSample[] {
  const ceiling = cMax ?? DEFAULT_C_CEILING
  const n = Math.max(2, Math.floor(samples))
  const out: MultiGamutSample[] = []
  const Lc = Math.min(1, Math.max(0, L))
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1)
    const C = t * ceiling
    out.push(multiGamutFromOklch(Lc, C, H))
  }
  return out
}

/**
 * Sample hue [0, 360) at fixed L, C (wrap excludes duplicate at 360).
 */
export function sweepHAtFixedLC(
  L: number,
  C: number,
  samples: number,
): SerializedColor[] {
  const n = Math.max(2, Math.floor(samples))
  const out: SerializedColor[] = []
  const Lc = Math.min(1, Math.max(0, L))
  const Cc = Math.max(0, C)
  for (let i = 0; i < n; i++) {
    const t = i / n
    const H = t * 360
    const c = new Color('oklch', [Lc, Cc, H])
    out.push(serializeColor(c))
  }
  return out
}

export function sweepHAtFixedLCMulti(
  L: number,
  C: number,
  samples: number,
): MultiGamutSample[] {
  const n = Math.max(2, Math.floor(samples))
  const out: MultiGamutSample[] = []
  const Lc = Math.min(1, Math.max(0, L))
  const Cc = Math.max(0, C)
  for (let i = 0; i < n; i++) {
    const t = i / n
    const H = t * 360
    out.push(multiGamutFromOklch(Lc, Cc, H))
  }
  return out
}

export type GamutSliceCell = {
  L: number
  C: number
  inGamut: boolean
  display: SerializedColor
}

/**
 * L×C grid at fixed hue for oklch.com-style slice. Each cell uses clipped sRGB in `display.hex` for painting.
 */
export function gamutSliceForHue(
  H: number,
  lSamples: number,
  cSamples: number,
  cMax?: number,
): GamutSliceCell[][] {
  const rows = Math.max(2, Math.floor(lSamples))
  const cols = Math.max(2, Math.floor(cSamples))
  const ceiling = cMax ?? DEFAULT_C_CEILING
  const grid: GamutSliceCell[][] = []

  for (let ri = 0; ri < rows; ri++) {
    const tL = ri / (rows - 1)
    const L = 1 - tL
    const row: GamutSliceCell[] = []
    for (let ci = 0; ci < cols; ci++) {
      const tC = ci / (cols - 1)
      const C = tC * ceiling
      const raw = new Color('oklch', [L, C, H])
      const inGamut = raw.inGamut('srgb')
      row.push({
        L,
        C,
        inGamut,
        display: serializeColor(raw),
      })
    }
    grid.push(row)
  }
  return grid
}

export type GamutSliceCellMulti = {
  L: number
  C: number
  display: SerializedColor
  inSrgb: boolean
  inP3: boolean
  inRec2020: boolean
}

export function gamutSliceForHueMulti(
  H: number,
  lSamples: number,
  cSamples: number,
  cMax?: number,
): GamutSliceCellMulti[][] {
  const rows = Math.max(2, Math.floor(lSamples))
  const cols = Math.max(2, Math.floor(cSamples))
  const ceiling = cMax ?? DEFAULT_C_CEILING
  const grid: GamutSliceCellMulti[][] = []
  for (let ri = 0; ri < rows; ri++) {
    const tL = ri / (rows - 1)
    const L = 1 - tL
    const row: GamutSliceCellMulti[] = []
    for (let ci = 0; ci < cols; ci++) {
      const tC = ci / (cols - 1)
      const C = tC * ceiling
      const m = multiGamutFromOklch(L, C, H)
      row.push({
        L,
        C,
        display: m.display,
        inSrgb: m.inSrgb,
        inP3: m.inP3,
        inRec2020: m.inRec2020,
      })
    }
    grid.push(row)
  }
  return grid
}

/** Polyline in normalized slice coords: x = C/cMax ∈ [0,1], y = L ∈ [0,1] (top = L=1). */
export function gamutBoundaryPolylineAtHue(
  H: number,
  target: OklchGamutTarget,
  lSamples: number,
  cMax?: number,
): {x: number; y: number}[] {
  const ceiling = cMax ?? DEFAULT_C_CEILING
  const n = Math.max(8, Math.floor(lSamples))
  const pts: {x: number; y: number}[] = []
  for (let i = 0; i < n; i++) {
    const L = i / (n - 1)
    const cHi = maxInGamutChroma(L, H, {cMax: ceiling, targetSpace: target})
    const x = ceiling > 0 ? Math.min(1, cHi / ceiling) : 0
    pts.push({x, y: L})
  }
  return pts
}
