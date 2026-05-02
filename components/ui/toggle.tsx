'use client'

import * as React from 'react'
import { Toggle as TogglePrimitive } from '@base-ui/react/toggle'

import { cn } from '@/lib/utils'

const toggleRecipe =
  'inline-flex items-center justify-center rounded-control border border-transparent ' +
  'bg-transparent px-2.5 py-1.5 text-sm font-medium text-text-default transition-colors ' +
  'hover:bg-surface-raised hover:text-text-default ' +
  'data-pressed:bg-surface-raised data-pressed:text-text-default ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ' +
  'disabled:pointer-events-none disabled:opacity-50'

export const Toggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive>
>(function Toggle({ className, ...props }, ref) {
  return (
    <TogglePrimitive
      ref={ref}
      data-slot="toggle"
      {...props}
      className={(state) =>
        cn(toggleRecipe, typeof className === 'function' ? className(state) : className)
      }
    />
  )
})

Toggle.displayName = 'Toggle'
