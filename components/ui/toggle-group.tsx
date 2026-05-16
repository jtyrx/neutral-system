'use client'

import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {ToggleGroup as ToggleGroupPrimitive} from '@base-ui/react/toggle-group'
import {Toggle as TogglePrimitive} from '@base-ui/react/toggle'

import {cn} from '@/lib/utils'

const toggleGroupVariants = cva('flex', {
  variants: {
    variant: {
      default: 'gap-1',
      outline: 'rounded-md border border-input p-0.5 gap-0.5',
    },
    size: {
      default: '',
      sm: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

const toggleGroupItemVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-control border border-transparent',
    'bg-transparent text-sm font-medium text-text-default transition-colors',
    'hover:bg-surface-raised hover:text-text-default',
    'data-pressed:bg-surface-raised data-pressed:text-text-default',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
  ),
  {
    variants: {
      variant: {
        default: '',
        outline: 'rounded-sm',
      },
      size: {
        default: 'h-8 px-2.5 py-1.5',
        sm: 'h-7 px-2 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ToggleGroupVariant = 'default' | 'outline'

const ToggleGroupVariantContext = React.createContext<ToggleGroupVariant>('default')

export function useToggleGroupVariant(): ToggleGroupVariant {
  return React.useContext(ToggleGroupVariantContext)
}

export type ToggleGroupProps<Value extends string = string> =
  ToggleGroupPrimitive.Props<Value> &
  VariantProps<typeof toggleGroupVariants>

export function ToggleGroup<Value extends string = string>({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ToggleGroupProps<Value>) {
  return (
    <ToggleGroupVariantContext.Provider value={variant ?? 'default'}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        {...props}
        className={
          typeof className === 'function'
            ? (state) => cn(toggleGroupVariants({variant, size}), className(state))
            : cn(toggleGroupVariants({variant, size}), className)
        }
      />
    </ToggleGroupVariantContext.Provider>
  )
}
ToggleGroup.displayName = 'ToggleGroup'

export type ToggleGroupItemProps = React.ComponentPropsWithoutRef<typeof TogglePrimitive> &
  VariantProps<typeof toggleGroupItemVariants> & {
    ref?: React.Ref<HTMLButtonElement>
  }

export function ToggleGroupItem({
  className,
  variant: variantProp,
  size: sizeProp,
  ref,
  ...props
}: ToggleGroupItemProps) {
  const contextVariant = useToggleGroupVariant()
  const variant = variantProp ?? contextVariant
  const size = sizeProp ?? 'default'

  return (
    <TogglePrimitive
      ref={ref}
      data-slot="toggle-group-item"
      data-variant={variant}
      data-size={size}
      {...props}
      className={(state) =>
        cn(
          toggleGroupItemVariants({variant, size}),
          typeof className === 'function' ? className(state) : className,
        )
      }
    />
  )
}
ToggleGroupItem.displayName = 'ToggleGroupItem'

export {toggleGroupVariants, toggleGroupItemVariants}
