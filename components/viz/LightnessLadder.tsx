'use client'

import {memo} from 'react'

import type {GlobalSwatch} from '@/lib/neutral-engine/types'

type Props = {
  swatches: GlobalSwatch[]
  onSelect?: (index: number) => void
  selectedIndex?: number | null
}

function LightnessLadderInner({swatches, onSelect, selectedIndex}: Props) {
  if (swatches.length === 0) return null
  return (
    <div className="space-y-2">
      <p className="eyebrow">Lightness ladder</p>
      <div className="flex h-28 w-full gap-px overflow-hidden rounded-xl border border-white/10 bg-black/30">
        {swatches.map((s) => (
          <button
            key={s.index}
            type="button"
            title={`${s.label} · L from OKLCH`}
            onClick={() => onSelect?.(s.index)}
            className={`relative min-w-0 flex-1 transition ring-offset-2 ring-offset-black ${
              selectedIndex === s.index ? 'ring-2 ring-white/60' : 'hover:brightness-110'
            }`}
            style={{backgroundColor: s.serialized.hex}}
          >
            <span className="sr-only">{s.label}</span>
          </button>
        ))}
      </div>
      <p className="text-[0.65rem] text-white/45">
        Lightest → darkest (left → right). OKLCH lightness interpolated linearly.
      </p>
    </div>
  )
}

export const LightnessLadder = memo(LightnessLadderInner)
