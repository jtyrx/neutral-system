'use client'

import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {ToggleGroup as ToggleGroupPrimitive} from '@base-ui/react/toggle-group'
import {Toggle as TogglePrimitive} from '@base-ui/react/toggle'

import {cn} from '@/lib/utils'

const toggleGroupVariants = cva('flex', {
  variants: {
    variant: {
      default: 'gap-4',
      outline: 'rounded-md border border-input p-2 gap-2',
    },
  },
  defaultVariants: {variant: 'default'},
})

const toggleGroupItemVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-control border border-transparent',
    'bg-transparent text-sm font-medium text-text-default transition-colors',
    'hover:bg-surface-raised hover:text-text-default',
    'data-pressed:bg-surface-raised data-pressed:text-text-default',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
  ),
  {
    variants: {
      variant: {
        default: '',
        outline: 'rounded-sm',
      },
      size: {
        default: 'h-32 px-10 py-6',
        sm: 'h-28 px-8 py-4 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ToggleGroupVariant = 'default' | 'outline'

type ToggleGroupContextValue = {
  variant: ToggleGroupVariant
  size: 'default' | 'sm'
}

const ToggleGroupVariantContext = React.createContext<ToggleGroupContextValue>({
  variant: 'default',
  size: 'default',
})

export function useToggleGroupVariant(): ToggleGroupContextValue {
  return React.useContext(ToggleGroupVariantContext)
}

export type ToggleGroupProps<Value extends string = string> =
  ToggleGroupPrimitive.Props<Value> & {
    variant?: ToggleGroupVariant
    size?: 'default' | 'sm'
    orientation?: 'horizontal' | 'vertical'
  }

export function ToggleGroup<Value extends string = string>({
  className,
  variant = 'default',
  size = 'default',
  orientation = 'horizontal',
  ...props
}: ToggleGroupProps<Value>) {
  return (
    <ToggleGroupVariantContext.Provider value={{variant: variant ?? 'default', size: size ?? 'default'}}>
      <ToggleGroupPrimitive
        data-slot="toggle-group"
        data-variant={variant}
        data-size={size}
        data-orientation={orientation}
        {...props}
        className={
          typeof className === 'function'
            ? (state) => cn(
                toggleGroupVariants({variant}),
                orientation === 'vertical' && 'flex-col',
                className(state),
              )
            : cn(
                toggleGroupVariants({variant}),
                orientation === 'vertical' && 'flex-col',
                className,
              )
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
  const {variant: contextVariant, size: contextSize} = useToggleGroupVariant()
  const variant = variantProp ?? contextVariant
  const size = sizeProp ?? contextSize

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
