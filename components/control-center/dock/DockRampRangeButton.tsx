'use client'

import {memo} from 'react'
import {useNeutralWorkbenchOptional} from '@/components/providers/NeutralWorkbenchProvider'
import {Button} from '@/components/ui/button'
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip'
import {cn} from '@/lib/utils'
import {dockActionClassName} from '@/components/control-center/dock/dockStyles'
import type {ComponentPropsWithoutRef} from 'react'

export type RampRangeButtonProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'onClick' | 'type'
> & {
  onOpen: () => void
}

const EMPTY_RAMP: never[] = []

export const RampRangeButton = memo(function RampRangeButton({
  onOpen,
  className,
  ...rest
}: RampRangeButtonProps) {
  const wb = useNeutralWorkbenchOptional()
  const previewTheme = wb?.previewTheme ?? 'light'
  const ramp =
    previewTheme === 'light'
      ? (wb?.lightRamp ?? EMPTY_RAMP)
      : (wb?.darkRamp ?? EMPTY_RAMP)

  const lowSwatch = ramp[0]
  const highSwatch = ramp[ramp.length - 1]
  const lowHex = lowSwatch?.serialized.hex
  const highHex = highSwatch?.serialized.hex

  const lowColor = lowHex ?? 'var(--color-surface-raised)'
  const highColor = highHex ?? 'var(--color-surface-subtle)'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn(dockActionClassName, className)}
          aria-label="Ramp range"
          data-slot="dock-ramp-range"
          id="dock-ramp-range"
          onClick={onOpen}
          {...rest}
        >
          <span
            className="relative block size-5 overflow-hidden rounded-dock-item-small"
            aria-hidden
          >
            <span
              className="absolute inset-0"
              style={{
                backgroundColor: lowColor,
                clipPath: 'polygon(0 0, 100% 0, 0 100%)',
              }}
            />
            <span
              className="absolute inset-0"
              style={{
                backgroundColor: highColor,
                clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
              }}
            />
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        <span className="text-label">Ramp range</span>
        {lowHex && highHex ? (
          <span className="text-label opacity-60">
            {' '}
            {lowHex} → {highHex}
          </span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  )
})
