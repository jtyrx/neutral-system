'use client'

import type {ReactNode} from 'react'

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
  const pad = size === 'sm' ? 'px-2.5 py-1.5 text-[0.65rem]' : 'px-3 py-2 text-xs'

  return (
    <div
      className="inline-flex max-w-full flex-wrap rounded-full border border-white/12 bg-black/20 p-0.5"
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
            className={`rounded-full font-medium transition-colors ${pad} ${
              active
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-white/50 hover:bg-white/[0.06] hover:text-white/85'
            }`}
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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p className="shrink-0 text-[0.6rem] font-medium uppercase tracking-wide text-white/35 sm:min-w-[7.5rem]">
        {label}
      </p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
