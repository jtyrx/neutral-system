'use client'

import {useState} from 'react'

import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'
import type {OklchStop} from '@/lib/color-engine/types'
import {cn} from '@/lib/utils'

type Props = {
  stop: OklchStop
  contrastModel: ContrastModel
}

function GamutBadge({stop}: {stop: OklchStop}) {
  if (stop.inSrgb) return null
  const label = stop.inP3 ? 'P3' : 'P3+'
  return (
    <span className="absolute right-4 top-4 rounded-sm bg-black/30 px-4 py-1 font-mono text-[0.55rem] leading-none text-white/90 backdrop-blur-sm">
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
        <p className="font-mono text-[0.6rem] leading-none text-muted">{stop.index}</p>
        <p className="font-mono text-[0.6rem] leading-none text-subtle">{stop.hex}</p>
      </div>

      {expanded && (
        <div className="mt-6 flex flex-col gap-3 rounded-md border border-hairline bg-raised p-8 text-[0.65rem]">
          <p className="font-mono text-muted uppercase tracking-wide">Contrast</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <span className="text-subtle">vs white</span>
            <span className="font-mono text-default">{contrastLabel(stop.contrastOnWhite[contrastModel === 'apca' ? 'apca' : 'wcag'], contrastModel)}</span>
            <span className="text-subtle">vs black</span>
            <span className="font-mono text-default">{contrastLabel(stop.contrastOnBlack[contrastModel === 'apca' ? 'apca' : 'wcag'], contrastModel)}</span>
            <span className="text-subtle">vs surface</span>
            <span className="font-mono text-default">{contrastLabel(stop.contrastOnSurface[contrastModel === 'apca' ? 'apca' : 'wcag'], contrastModel)}</span>
          </div>
          <p className="font-mono text-[0.55rem] text-muted">{stop.oklchCss}</p>
        </div>
      )}
    </div>
  )
}
ColorSwatchCell.displayName = 'ColorSwatchCell'
