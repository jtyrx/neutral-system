'use client'

import {memo} from 'react'

import {GlobalScaleStrip} from '@/components/preview/GlobalScaleStrip'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

type Props = {
  global: GlobalSwatch[]
  tokenView: TokenView
  caption: string
  accentClassName?: string
  invertDisplay?: boolean
  /** Short directional hint — not mapping logic. */
  directionHint: string
}

/**
 * Global ramp strip with a concise caption about index direction / tail behavior.
 */
function GlobalRampCardInner({
  global,
  tokenView,
  caption,
  accentClassName,
  invertDisplay,
  directionHint,
}: Props) {
  return (
    <div className="space-y-2">
      <GlobalScaleStrip
        global={global}
        tokenView={tokenView}
        caption={caption}
        accentClassName={accentClassName}
        invertDisplay={invertDisplay}
      />
      <p className="text-[0.6rem] leading-snug text-white/40">{directionHint}</p>
    </div>
  )
}

export const GlobalRampCard = memo(GlobalRampCardInner)
