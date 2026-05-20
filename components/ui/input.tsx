import * as React from 'react'

import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

const inputDefaultClassName = cn(
  // base
  'h-32 w-full min-w-0 rounded-lg border border-input bg-transparent px-10 py-4 text-base outline-none transition-colors',
  // typography
  'md:text-sm',
  // placeholder + file
  'placeholder:text-muted-foreground',
  'file:inline-flex file:h-24 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
  // focus
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  // disabled
  'disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50',
  // invalid
  'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
  // dark mode
  'dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
)

/** Matches `@utility ns-input` in app/globals.css — workbench field chrome. */
export const INPUT_WORKBENCH_FIELD_CLASS = 'ns-input'

/**
 * Ghost number display: no background, border reveals on hover/focus.
 * Used for inline value readouts beside sliders.
 */
const inputGhostClassName = cn(
  'rounded-md border border-transparent bg-transparent px-6 py-2',
  'text-right font-mono text-xs text-muted tabular-nums',
  'transition hover:border-hairline focus:border-hairline focus:text-default focus:outline-none',
  'disabled:opacity-40',
)

const inputVariants = cva('', {
  variants: {
    variant: {
      default: inputDefaultClassName,
      workbench: INPUT_WORKBENCH_FIELD_CLASS,
      ghost: inputGhostClassName,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export type InputProps = React.ComponentProps<'input'> & {
  variant?: NonNullable<VariantProps<typeof inputVariants>['variant']>
}

function Input({
  className,
  type,
  variant = 'default',
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      data-slot='input'
      data-variant={variant}
      className={cn(inputVariants({variant}), className)}
      {...props}
    />
  )
}

Input.displayName = 'Input'

export {Input}
