import type {HTMLAttributes} from 'react'

import {GlobalScaleStrip} from '@/components/preview/GlobalScaleStrip'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

type Props = {
  global: GlobalSwatch[]
  tokenView: TokenView
  caption: string
  accentClassName?: string | undefined
  invertDisplay?: boolean | undefined
  /** Short directional hint — not mapping logic. */
  directionHint: string
  /** Global index of the alpha base swatch — passed through to GlobalScaleStrip. */
  alphaBaseIndex?: number | undefined
} & Pick<HTMLAttributes<HTMLDivElement>, 'id' | 'role' | 'aria-label'>

/**
 * Global ramp strip with a concise caption about index direction / tail behavior.
 */
export function GlobalRampCard({
  global,
  tokenView,
  caption,
  accentClassName,
  invertDisplay,
  directionHint,
  alphaBaseIndex,
  id,
  role,
  'aria-label': ariaLabel,
}: Props) {
  return (
    <div className="space-y-8" id={id} role={role} aria-label={ariaLabel}>
      <GlobalScaleStrip
        global={global}
        tokenView={tokenView}
        caption={caption}
        accentClassName={accentClassName}
        invertDisplay={invertDisplay}
        alphaBaseIndex={alphaBaseIndex}
      />
      <p className="text-nano leading-snug text-disabled">{directionHint}</p>
    </div>
  )
}
GlobalRampCard.displayName = 'GlobalRampCard'
