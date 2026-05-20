'use client'

import type {ReactNode} from 'react'

import {cn} from '@/lib/cn'

export type SegmentedOption<T extends string> = {
  value: T
  label: string
  /** Optional short label for narrow layouts */
  shortLabel?: string
}

type Props<T extends string> = {
  value: T
  options: readonly SegmentedOption<T>[]
  onChange: (value: T) => void
  /** Screen reader label for the group */
  'aria-label': string
  size?: 'sm' | 'md'
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  size = 'sm',
}: Props<T>) {
  const pad = size === 'sm' ? 'px-10 py-6 text-micro' : 'px-12 py-8 text-xs'

  return (
    <div
      className="ns-control-group bg-raised"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((o) => {
        const active = value === o.value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              'ns-control-item',
              pad,
              active
                ? 'bg-overlay-strong text-default shadow-sm'
                : 'text-muted hover:bg-chip hover:text-default',
            )}
          >
            <span className="sm:hidden">{o.shortLabel ?? o.label}</span>
            <span className="hidden sm:inline">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/** Left label + control — three-tier layout rows */
export function ControlTier({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-8 sm:gap-16">
      <p className="shrink-0 text-[0.6rem] font-medium uppercase tracking-wide text-disabled sm:min-w-[7.5rem]">
        {label}
      </p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
