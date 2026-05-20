'use client'

import {memo} from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'
import {
  displayGamutLabel,
  type DisplayGamutTier,
} from '@/lib/neutral-engine/displayGamut'
import {cn} from '@/lib/utils'

type Props = {
  tier: DisplayGamutTier
  className?: string
}

function GamutBadgeInner({tier, className}: Props) {
  const label = displayGamutLabel(tier)
  const body =
    tier === 'srgb'
      ? 'This display is approximating sRGB. Colors outside sRGB are clipped in most UI.'
      : tier === 'p3'
        ? 'Display P3 — you can distinguish more saturated colors than sRGB, but not all of Rec. 2020.'
        : 'Wide-gamut display (Rec. 2020 probe). Most UI still targets sRGB; P3 sits between sRGB and this envelope.'

  return (
    <Tooltip>
      <TooltipTrigger
        type="button"
        className={cn(
          'inline-flex items-center rounded-full border border-hairline bg-raised px-10 py-2 text-caption font-medium text-default tabular-nums',
          className,
        )}
      >
        Gamut: {label}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs text-xs">
        {body}
      </TooltipContent>
    </Tooltip>
  )
}

export const GamutBadge = memo(GamutBadgeInner)
