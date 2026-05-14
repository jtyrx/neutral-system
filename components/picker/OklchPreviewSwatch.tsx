'use client'

import {memo} from 'react'

import {cn} from '@/lib/utils'
import type {SerializedColor} from '@/lib/neutral-engine/types'

type Props = {
  color: SerializedColor
  maxChromaInGamut: number
  className?: string
}

function OklchPreviewSwatchInner({
  color,
  maxChromaInGamut,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-hairline bg-raised',
        className,
      )}
    >
      <div
        className="h-24 w-full sm:h-28"
        style={{backgroundColor: color.hex}}
      />
      <div className="space-y-1 border-t border-hairline p-3 font-mono text-caption tabular-nums">
        <div className="picker-control-row">
          {!color.inSrgbGamut ? (
            <span className="rounded bg-amber-500/20 px-1.5 py-px text-[0.6rem] font-medium text-amber-900 dark:text-amber-200">
              Out of sRGB · preview clipped
            </span>
          ) : null}
          <span className="text-muted">
            C<sub>max</sub> @ L,H ≈ {maxChromaInGamut.toFixed(3)}
          </span>
        </div>
        <p className="break-all text-default">{color.oklchCss}</p>
        <p className="text-muted">{color.hex}</p>
        <p className="text-muted">{color.rgbCss}</p>
      </div>
    </div>
  )
}

export const OklchPreviewSwatch = memo(OklchPreviewSwatchInner)
