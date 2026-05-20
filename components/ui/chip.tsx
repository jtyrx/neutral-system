'use client'

import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

export type PillChipTone = 'amber' | 'sky'

export type PillChipActiveStyle = 'pill' | 'surface-soft'

const pillChipBase = cn(
  'rounded-full border px-12 py-6',
  'text-xs font-medium transition',
  'disabled:pointer-events-none disabled:opacity-50',
)

const pillChipInactive = 'border-hairline bg-(--chrome-chip)'

const pillChipVariants = cva(pillChipBase, {
  variants: {
    tone: {
      amber: '',
      sky: '',
    },
    activeStyle: {
      pill: '',
      'surface-soft': '',
    },
  },
  compoundVariants: [
    {tone: 'amber', activeStyle: 'pill', className: 'border-(--chrome-amber-border) bg-(--chrome-amber-pill)'},
    {tone: 'amber', activeStyle: 'surface-soft', className: 'border-(--chrome-amber-border) bg-(--chrome-amber-surface-soft)'},
    {tone: 'sky', activeStyle: 'pill', className: 'border-(--chrome-sky-border) bg-(--chrome-sky-pill)'},
    {tone: 'sky', activeStyle: 'surface-soft', className: 'border-(--chrome-sky-border) bg-(--chrome-sky-surface-soft)'},
  ],
  defaultVariants: {tone: 'amber', activeStyle: 'pill'},
})

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
      data-slot="pill-chip"
      data-variant={tone}
      data-pressed={selected ? 'true' : undefined}
      className={cn(
        selected ? pillChipVariants({tone, activeStyle}) : cn(pillChipBase, pillChipInactive),
        className,
      )}
      {...props}
    />
  )
}

PillChip.displayName = 'PillChip'

const pillButtonBase = cn(
  'rounded-full border border-hairline bg-chip px-12 py-6',
  'text-xs font-medium text-subtle transition hover:bg-muted',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring',
  'disabled:pointer-events-none disabled:opacity-50',
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
      data-slot="pill-button"
      className={cn(pillButtonBase, className)}
      {...props}
    />
  )
}

PillButton.displayName = 'PillButton'

export {pillChipVariants}
