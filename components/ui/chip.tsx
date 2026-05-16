'use client'

import * as React from 'react'

import {cn} from '@/lib/utils'

export type PillChipTone = 'amber' | 'sky'

export type PillChipActiveStyle = 'pill' | 'surface-soft'

const pillChipBase = cn(
  'rounded-full border px-3 py-1.5',
  'text-xs font-medium transition',
)

const pillChipInactive = 'border-hairline bg-(--chrome-chip)'

const pillChipActiveVariants: Record<
  PillChipTone,
  Record<PillChipActiveStyle, string>
> = {
  amber: {
    pill: 'border-(--chrome-amber-border) bg-(--chrome-amber-pill)',
    'surface-soft': cn(
      'border-(--chrome-amber-border)',
      'bg-(--chrome-amber-surface-soft)',
    ),
  },
  sky: {
    pill: 'border-(--chrome-sky-border) bg-(--chrome-sky-pill)',
    'surface-soft': cn(
      'border-(--chrome-sky-border)',
      'bg-(--chrome-sky-surface-soft)',
    ),
  },
}

export type PillChipProps = React.ComponentProps<'button'> & {
  /** When true, shows the tone's selected chrome. */
  selected: boolean
  tone: PillChipTone
  /** `pill` — filled pill (architecture choices). `surface-soft` — softer fill (ramp target). */
  activeStyle?: PillChipActiveStyle
}

/**
 * Segmented pill used in workbench controls (architecture / edit-target choices).
 * Inactive state uses chrome chip + hairline border; selected uses amber or sky chrome.
 */
export function PillChip({
  selected,
  tone,
  activeStyle = 'pill',
  className,
  type = 'button',
  ref,
  ...props
}: PillChipProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected}
      className={cn(
        pillChipBase,
        selected ? pillChipActiveVariants[tone][activeStyle] : pillChipInactive,
        className,
      )}
      {...props}
    />
  )
}

PillChip.displayName = 'PillChip'

const pillButtonBase = cn(
  'rounded-full border border-hairline bg-(--chrome-chip) px-3 py-1.5',
  'text-xs font-medium text-subtle transition hover:bg-sidebar-border',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring',
)

export type PillButtonProps = React.ComponentProps<'button'>

/** Neutral outline pill for secondary actions (e.g. OKHSL toolbar). */
export function PillButton({
  className,
  type = 'button',
  ref,
  ...props
}: PillButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(pillButtonBase, className)}
      {...props}
    />
  )
}

PillButton.displayName = 'PillButton'
