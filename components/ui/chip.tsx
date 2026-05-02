'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

export type PillChipTone = 'amber' | 'sky'

export type PillChipActiveStyle = 'pill' | 'surface-soft'

const baseChip =
  'rounded-full border px-3 py-1.5 text-xs font-medium transition'

const inactiveChip = 'border-hairline bg-(--chrome-chip)'

const activeClasses: Record<PillChipTone, Record<PillChipActiveStyle, string>> = {
  amber: {
    pill: 'border-(--chrome-amber-border) bg-(--chrome-amber-pill)',
    'surface-soft': 'border-(--chrome-amber-border) bg-(--chrome-amber-surface-soft)',
  },
  sky: {
    pill: 'border-(--chrome-sky-border) bg-(--chrome-sky-pill)',
    'surface-soft': 'border-(--chrome-sky-border) bg-(--chrome-sky-surface-soft)',
  },
}

export type PillChipProps = React.ComponentProps<'button'> & {
  /** When true, shows the tone’s selected chrome. */
  selected: boolean
  tone: PillChipTone
  /** `pill` — filled pill (architecture choices). `surface-soft` — softer fill (ramp target). */
  activeStyle?: PillChipActiveStyle
}

/**
 * Segmented pill used in workbench controls (architecture / edit-target choices).
 * Inactive state uses chrome chip + hairline border; selected uses amber or sky chrome.
 */
export const PillChip = React.forwardRef<HTMLButtonElement, PillChipProps>(
  function PillChip(
    { selected, tone, activeStyle = 'pill', className, type = 'button', ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          baseChip,
          selected ? activeClasses[tone][activeStyle] : inactiveChip,
          className,
        )}
        {...props}
      />
    )
  },
)

PillChip.displayName = 'PillChip'

const secondaryPill =
  'rounded-full border border-hairline bg-(--chrome-chip) px-3 py-1.5 text-xs font-medium ' +
  'text-subtle transition hover:bg-sidebar-border'

export type PillButtonProps = React.ComponentProps<'button'>

/** Neutral outline pill for secondary actions (e.g. OKHSL toolbar). */
export const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  function PillButton({ className, type = 'button', ...props }, ref) {
    return (
      <button ref={ref} type={type} className={cn(secondaryPill, className)} {...props} />
    )
  },
)

PillButton.displayName = 'PillButton'
