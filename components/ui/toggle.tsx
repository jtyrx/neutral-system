'use client'

import * as React from 'react'
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const toggleRecipe = cn(
  'inline-flex items-center justify-center rounded-control border border-transparent',
  'bg-transparent px-10 py-6 text-sm font-medium text-text-default transition-colors',
  'hover:bg-surface-raised hover:text-text-default',
  'data-pressed:bg-surface-raised data-pressed:text-text-default',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:pointer-events-none disabled:opacity-50',
)

const toggleVariants = cva(toggleRecipe, {
  variants: {
    variant: {
      default: '',
      outline: cn(
        'border-input',
        'hover:bg-accent hover:text-accent-foreground',
        'data-pressed:bg-accent data-pressed:text-accent-foreground',
      ),
    },
    size: {
      default: 'h-32',
      sm: 'h-28 px-8 py-4 text-xs',
      lg: 'h-36 px-12',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export type ToggleVariant = 'default' | 'outline'

export type ToggleProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive> &
  VariantProps<typeof toggleVariants> & {
    ref?: React.Ref<HTMLButtonElement>
  }

export function Toggle({
  className,
  variant = 'default',
  size = 'default',
  ref,
  ...props
}: ToggleProps) {
  return (
    <TogglePrimitive
      ref={ref}
      data-slot="toggle"
      data-variant={variant}
      data-size={size}
      {...props}
      className={(state) =>
        cn(
          toggleVariants({ variant, size }),
          typeof className === 'function' ? className(state) : className,
        )
      }
    />
  )
}
Toggle.displayName = 'Toggle'

export { toggleVariants }
