'use client'

import {useSyncExternalStore, useState} from 'react'

import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'
import {getDisplayGamutSnapshot, subscribeDisplayGamut} from '@/lib/neutral-engine/displayGamut'
import type {OklchStop} from '@/lib/color-engine/types'

type Props = {
  stop: OklchStop
  contrastModel: ContrastModel
}

function GamutBadge({stop}: {stop: OklchStop}) {
  const displayTier = useSyncExternalStore(subscribeDisplayGamut, getDisplayGamutSnapshot, () => 'srgb')

  // No badge if in sRGB, or if the color is only marginally outside sRGB
  // (ΔE_OK < 0.02 ≈ 1× JND — MINDE gamut mapping minimises ΔE, so even P3
  // boundary colours land just under 0.04; 0.02 catches real P3 midtones
  // while keeping light tints (ΔE < 0.005) badge-free)
  if (stop.inSrgb || stop.srgbDeltaE < 0.02) return null

  let label: string
  if (!stop.inP3) {
    // Beyond P3 — rec2020 territory
    label = 'P3+'
  } else if (displayTier === 'srgb') {
    // P3 color on an sRGB monitor — showing sRGB fallback
    label = 'sRGB'
  } else {
    label = 'P3'
  }

  return (
    <span
      className="absolute right-4 top-4 rounded-sm bg-black/30 px-4 py-1 font-mono text-[0.55rem] leading-none text-white/90 backdrop-blur-sm"
      title={displayTier === 'srgb' && stop.inP3 ? `sRGB fallback: ${stop.hex}` : undefined}
    >
      {label}
    </span>
  )
}

function contrastLabel(value: number, model: ContrastModel): string {
  if (model === 'apca') return `Lc ${Math.round(Math.abs(value))}`
  return `${value.toFixed(1)}:1`
}

export function ColorSwatchCell({stop, contrastModel}: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="group flex flex-col gap-0">
      <button
        type="button"
        className="relative aspect-square w-full cursor-pointer rounded-sm transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{background: stop.oklchCss}}
        onClick={() => setExpanded((v) => !v)}
        aria-label={`Stop ${stop.index}: ${stop.hex}`}
      >
        <GamutBadge stop={stop} />
      </button>

      <div className="flex flex-col gap-1 pt-4">
        <p className="font-mono text-nano leading-none text-muted">{stop.index}</p>
        <p className="font-mono text-nano leading-none text-subtle">{stop.hex}</p>
        <p className="font-mono text-nano leading-none text-muted">{stop.oklchCss}</p>
      </div>

      {expanded && (
        <div className="mt-6 flex flex-col gap-3 rounded-md border border-hairline bg-raised p-8 text-micro">
          <p className="font-mono text-muted uppercase tracking-wide">Contrast</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <span className="text-subtle">vs white</span>
            <span className="font-mono text-default">{contrastLabel(stop.contrastOnWhite[contrastModel === 'apca' ? 'apca' : 'wcag'], contrastModel)}</span>
            <span className="text-subtle">vs black</span>
            <span className="font-mono text-default">{contrastLabel(stop.contrastOnBlack[contrastModel === 'apca' ? 'apca' : 'wcag'], contrastModel)}</span>
            <span className="text-subtle">vs surface</span>
            <span className="font-mono text-default">{contrastLabel(stop.contrastOnSurface[contrastModel === 'apca' ? 'apca' : 'wcag'], contrastModel)}</span>
          </div>
          <p className="font-mono text-nano text-muted">{stop.oklchCss}</p>
        </div>
      )}
    </div>
  )
}
ColorSwatchCell.displayName = 'ColorSwatchCell'
