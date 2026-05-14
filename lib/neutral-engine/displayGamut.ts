import type {MultiGamutSample} from '@/lib/neutral-engine/gamutProbing'

export type DisplayGamutTier = 'srgb' | 'p3' | 'rec2020'

export function multiGamutInDisplayTier(m: MultiGamutSample, tier: DisplayGamutTier): boolean {
  if (tier === 'srgb') return m.inSrgb
  if (tier === 'p3') return m.inP3
  return m.inRec2020
}

export function displayGamutLabel(tier: DisplayGamutTier): string {
  switch (tier) {
    case 'rec2020':
      return 'Rec. 2020'
    case 'p3':
      return 'Display P3'
    default:
      return 'sRGB'
  }
}

/** DOM snapshot for {@link useSyncExternalStore} — SSR / pre-hydration use `'srgb'`. */
export function getDisplayGamutSnapshot(): DisplayGamutTier {
  if (typeof window === 'undefined') return 'srgb'
  if (window.matchMedia('(color-gamut: rec2020)').matches) return 'rec2020'
  if (window.matchMedia('(color-gamut: p3)').matches) return 'p3'
  return 'srgb'
}

export function subscribeDisplayGamut(onChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const q = window.matchMedia('(color-gamut: rec2020)')
  const p = window.matchMedia('(color-gamut: p3)')
  const fn = () => onChange()
  q.addEventListener('change', fn)
  p.addEventListener('change', fn)
  return () => {
    q.removeEventListener('change', fn)
    p.removeEventListener('change', fn)
  }
}
