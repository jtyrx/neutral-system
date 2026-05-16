'use client'

import * as React from 'react'
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleRecipe = cn(
  'inline-flex items-center justify-center rounded-control border border-transparent',
  'bg-transparent px-2.5 py-1.5 text-sm font-medium text-text-default transition-colors',
  'hover:bg-surface-raised hover:text-text-default',
  'data-pressed:bg-surface-raised data-pressed:text-text-default',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:pointer-events-none disabled:opacity-50',
)

const toggleVariants = cva(toggleRecipe, {
  variants: {
    size: {
      default: 'h-8',
      sm: 'h-7 px-2 py-1 text-xs',
      lg: 'h-9 px-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive> &
  VariantProps<typeof toggleVariants> & {
    ref?: React.Ref<HTMLButtonElement>
  }

export function Toggle({
  className,
  size = 'default',
  ref,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive
      ref={ref}
      data-slot="toggle"
      data-size={size}
      {...props}
      className={(state) =>
        cn(
          toggleVariants({ size }),
          typeof className === 'function' ? className(state) : className,
        )
      }
    />
  )
}
Toggle.displayName = 'Toggle'

export { toggleVariants }
