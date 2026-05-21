'use client'

import {memo} from 'react'

import {cn} from '@/lib/utils'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'

type Props = {
  ramp: GlobalSwatch[]
  caption?: string
  className?: string
}

function PickerRampStripInner({ramp, caption, className}: Props) {
  if (ramp.length === 0) {
    return (
      <p className="text-xs text-muted">No swatches — adjust configuration.</p>
    )
  }

  return (
    <div className={cn('space-y-8', className)}>
      {caption ? (
        <p className="text-caption font-medium tracking-wide text-muted">
          {caption}
        </p>
      ) : null}
      <div className="overflow-x-auto rounded-sm border border-hairline bg-raised">
        <div
          className="flex min-h-64"
          style={{minWidth: `${Math.max(ramp.length * 8, 280)}px`}}
          role="img"
          aria-label={`Neutral ramp, ${ramp.length} steps`}
        >
          {ramp.map((s) => (
            <div
              key={s.index}
              title={`${s.label} · ${s.serialized.oklchCss}`}
              className="min-w-[8px] flex-1 border-l border-hairline first:border-l-0"
              style={{backgroundColor: s.serialized.hex}}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const PickerRampStrip = memo(PickerRampStripInner)
