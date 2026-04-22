'use client'

import {memo, type HTMLAttributes} from 'react'

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
} & Pick<HTMLAttributes<HTMLDivElement>, 'id' | 'role' | 'aria-label'>

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
  id,
  role,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <div className="space-y-2" id={id} role={role} aria-label={ariaLabel}>
      <GlobalScaleStrip
        global={global}
        tokenView={tokenView}
        caption={caption}
        accentClassName={accentClassName}
        invertDisplay={invertDisplay}
      />
      <p className="text-[0.6rem] leading-snug text-[var(--ns-text-faint)]">{directionHint}</p>
    </div>
  )
}

export const GlobalRampCard = memo(GlobalRampCardInner)
