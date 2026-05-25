'use client'

import type {SegmentedOption} from '@/components/preview/SegmentedControl'
import {Toolbar} from '@/components/ui/toolbar'
import {cn} from '@/lib/cn'

type Props<T extends string> = {
  'aria-label': string
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (v: T) => void
}

export function SegmentedToolbar<T extends string>({
  'aria-label': ariaLabel,
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <Toolbar.Root aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <Toolbar.Button
            key={opt.value}
            size="sm"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'size-auto px-10 py-6 text-micro font-medium',
              active ? 'bg-overlay-strong text-default shadow-sm' : 'text-muted',
            )}
          >
            <span className="sm:hidden">{opt.shortLabel ?? opt.label}</span>
            <span className="hidden sm:inline">{opt.label}</span>
          </Toolbar.Button>
        )
      })}
    </Toolbar.Root>
  )
}
SegmentedToolbar.displayName = 'SegmentedToolbar'
