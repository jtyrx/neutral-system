'use client'

import {cn} from '@/lib/cn'
import {Button} from '@/components/ui/button.tsx'

type Props = {
  active: boolean
  onToggle: () => void
}

export function InspectionToggle({active, onToggle}: Props) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        'ns-control-item ns-pill',
        active
          ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100'
          : 'border-hairline bg-overlay-soft text-subtle hover:text-default',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          active ? 'bg-emerald-300' : 'bg-overlay-strong',
        )}
      />
      <span className="">Inspection {active ? 'on' : 'off'}</span>
    </Button>
  )
}
