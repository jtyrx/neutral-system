'use client'

import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {RadioGroup as RadioGroupPrimitive} from '@base-ui/react/radio-group'
import {Radio as RadioPrimitive} from '@base-ui/react/radio'

import {cn} from '@/lib/utils'

const radioGroupBase = 'ns-control-group'

const radioGroupSegmentedBase = cn(
  'inline-flex items-center rounded-full',
  'h-33 bg-toolbar-control-surface-sunken py-4 px-2',
)

const radioGroupItemBase = cn(
  'h-27 shrink-0 rounded-full border text-primary shadow-xs',
  'transition-colors outline-none focus-visible:ring-3',
  'disabled:cursor-not-allowed disabled:opacity-50',
)

const radioGroupControlItemBase = cn(
  'border border-transparent text-disabled shadow-none',
  'hover:bg-chip hover:text-default',
  'focus-visible:border-(--color-border-focus)',
  'focus-visible:ring-2 focus-visible:ring-(--color-border-focus)/30',
  'data-checked:bg-raised data-checked:text-default',
  'ns-control-item',
)

const radioGroupVariants = cva(radioGroupBase, {
  variants: {
    variant: {
      default: 'bg-overlay',
      scrim: cn(
        radioGroupSegmentedBase,
        'gap-x-0.5',
        'text-micro text-trim-both',
      ),
      icon: cn(radioGroupSegmentedBase, 'gap-x-0.5'),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const radioGroupItemVariants = cva(
  radioGroupItemBase,
  {
    variants: {
      variant: {
        default: cn(
          'border-input shadow-none',
          'focus-visible:border-ring focus-visible:ring-ring/50',
          'data-checked:border-transparent',
        ),
        scrim: cn(
          'inline-flex h-27 cursor-pointer items-center justify-center',
          radioGroupControlItemBase,
          'text-muted',
          'hover:text-default',
          'focus-visible:ring-(--color-border-focus)/50',
          'data-checked:bg-raised data-checked:text-default data-checked:border-transparent',
        ),
        icon: cn(
          'inline-flex aspect-square size-27 cursor-pointer',
          'items-center justify-center',
          radioGroupControlItemBase,
        ),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const radioGroupIndicatorClass = 'size-8 rounded-full bg-primary'

type RadioGroupVariant = NonNullable<
  VariantProps<typeof radioGroupVariants>['variant']
>

// Variants where the dot indicator must not render — render decision in JSX, not CSS.
const INDICATOR_LESS_VARIANTS = new Set<RadioGroupVariant>(['scrim', 'icon'])

function showsIndicator(variant: RadioGroupVariant): boolean {
  return !INDICATOR_LESS_VARIANTS.has(variant)
}

const RadioGroupVariantContext = React.createContext<RadioGroupVariant | null>(
  null,
)

export function useRadioGroupVariant(): RadioGroupVariant {
  return React.useContext(RadioGroupVariantContext) ?? 'default'
}

type RadioGroupProps = React.ComponentProps<typeof RadioGroupPrimitive> & {
  variant?: RadioGroupVariant
}

function RadioGroup({
  className,
  variant = 'default',
  ...props
}: RadioGroupProps) {
  return (
    <RadioGroupVariantContext.Provider value={variant}>
      <RadioGroupPrimitive
        data-slot="radio-group"
        data-variant={variant}
        className={cn(radioGroupVariants({variant}), className)}
        {...props}
      />
    </RadioGroupVariantContext.Provider>
  )
}

type RadioGroupItemProps = React.ComponentProps<typeof RadioPrimitive.Root> & {
  variant?: RadioGroupVariant
}

function RadioGroupItem({
  className,
  variant: variantProp,
  children,
  ...props
}: RadioGroupItemProps) {
  const fromContext = React.useContext(RadioGroupVariantContext)
  const variant = variantProp ?? fromContext ?? 'default'

  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      data-variant={variant}
      className={cn(radioGroupItemVariants({variant}), className)}
      {...props}
    >
      {children}
      {showsIndicator(variant) && (
        <RadioPrimitive.Indicator
          data-slot="radio-group-indicator"
          className="flex items-center justify-center"
        >
          <div className={radioGroupIndicatorClass} />
        </RadioPrimitive.Indicator>
      )}
    </RadioPrimitive.Root>
  )
}

RadioGroup.displayName = 'RadioGroup'
RadioGroupItem.displayName = 'RadioGroupItem'

export {
  RadioGroup,
  RadioGroupItem,
  radioGroupItemVariants,
  radioGroupVariants,
  showsIndicator,
}
export type {RadioGroupProps, RadioGroupItemProps, RadioGroupVariant}
