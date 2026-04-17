'use client'

import {memo, useMemo} from 'react'

import type {GlobalSwatch} from '@/lib/neutral-engine/types'

type Props = {
  swatches: GlobalSwatch[]
}

function LightnessSparklineInner({swatches}: Props) {
  const ls = useMemo(
    () =>
      swatches.map((s) => {
        const L = s.color.to('oklch').coords[0] ?? 0
        return L <= 1 ? L * 100 : L
      }),
    [swatches],
  )
  if (swatches.length < 2) return null
  const min = Math.min(...ls)
  const max = Math.max(...ls)
  const h = 48
  const w = 200
  const pad = 4
  const pts = ls
    .map((L, i) => {
      const x = pad + (i / (ls.length - 1)) * (w - pad * 2)
      const y = pad + (1 - (L - min) / (max - min || 1)) * (h - pad * 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="eyebrow">Lightness curve</p>
      <svg width={w} height={h} className="mt-2 text-white/60" aria-hidden>
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          points={pts}
        />
      </svg>
      <p className="mt-1 text-[0.65rem] text-white/40">
        OKLCH L% across the global scale (linear ramp = near-straight line).
      </p>
    </div>
  )
}

export const LightnessSparkline = memo(LightnessSparklineInner)
