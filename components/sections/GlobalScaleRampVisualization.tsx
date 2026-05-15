'use client'

import {memo} from 'react'

import {LightnessLadder} from '@/components/viz/LightnessLadder'
import {cn} from '@/lib/utils'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'

type Props = {
  global: GlobalSwatch[]
  selectedIndex: number | null
  onSelectSwatch: (index: number) => void
}

/** Ramp color strip + lightness ladder. Isolated from the control form so typing does not repaint the full strip. */
export const GlobalScaleRampVisualization = memo(function GlobalScaleRampVisualization({
  global,
  selectedIndex,
  onSelectSwatch,
}: Props) {
  const n = global.length
  const ringIndex = selectedIndex == null || n === 0 ? null : Math.min(selectedIndex, n - 1)

  return (
    <>
      <div className="overflow-x-auto rounded-select border border-hairline">
        <div
          className="flex min-h-18"
          style={{minWidth: `${Math.max(global.length * 8, 320)}px`}}
        >
          {global.map((s) => (
            <button
              key={s.index}
              type="button"
              title={s.serialized.oklchCss}
              onClick={() => onSelectSwatch(s.index)}
              className={cn(
                'min-w-[8px] flex-1 border-l border-hairline first:border-l-0',
                ringIndex === s.index && 'ring-2 ring-white/50 ring-inset',
              )}
              style={{backgroundColor: s.serialized.hex}}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 nsb-lg:grid-cols-[1fr_14rem]">
        <LightnessLadder
          swatches={global}
          onSelect={onSelectSwatch}
          selectedIndex={ringIndex}
          className={cn(
            'col-span-full h-28 w-full rounded-xl border border-hairline bg-raised',
          )}
        />
      </div>
    </>
  )
})
