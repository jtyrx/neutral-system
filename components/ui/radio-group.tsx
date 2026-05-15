'use client'

import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {RadioGroup as RadioGroupPrimitive} from '@base-ui/react/radio-group'
import {Radio as RadioPrimitive} from '@base-ui/react/radio'

import {cn} from '@/lib/utils'

const radioGroupVariants = cva('ns-control-group ', {
  variants: {
    variant: {
      default: 'bg-overlay',
      scrim: cn(
        'inline-flex items-center gap-0.25 rounded-full',
        'h-8.25 bg-toolbar-control-surface-sunken py-1 px-0.5',
        '**:data-[slot=radio-group-indicator]:hidden',
        ' text-micro text-trim-both',
      ),
      icon: cn(
        'inline-flex items-center gap-x-0.5 rounded-full',
        'h-8.25 bg-toolbar-control-surface-sunken py-1 px-0.5',
        '**:data-[slot=radio-group-indicator]:hidden',
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const radioGroupItemVariants = cva(
  ' h-6.75 shrink-0 rounded-full border text-primary shadow-xs transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-input shadow-none focus-visible:border-ring focus-visible:ring-ring/50 data-checked:border-transparent',
        scrim: cn(
          'inline-flex h-6.75 cursor-pointer items-center justify-center',
          'border border-transparent text-disabled shadow-none',
          'hover:bg-chip hover:text-default',
          'focus-visible:border-(--color-border-focus) focus-visible:ring-2 focus-visible:ring-(--color-border-focus)/30',
          'data-checked:bg-raised data-checked:text-default',
          'ns-control-item',
          'bg-surface-subtle border border-hairline text-(--color-text-on) shadow-none focus-visible:border-(--color-border-focus) focus-visible:ring-(--color-border-focus)/50 data-checked:border-(--color-text-on)',
        ),
          
        icon: cn(
          'inline-flex aspect-square size-6.75 cursor-pointer items-center justify-center',
          'border border-transparent text-disabled shadow-none',
          'hover:bg-chip hover:text-default',
          'focus-visible:border-(--color-border-focus) focus-visible:ring-2 focus-visible:ring-(--color-border-focus)/30',
          'data-checked:bg-raised data-checked:text-default',
          'ns-control-item',
        ),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const radioGroupIndicatorVariants = cva('size-2 rounded-full', {
  variants: {
    variant: {
      default: 'bg-primary',
      scrim: 'bg-surface-subtle',
      icon: 'bg-surface-subtle',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

type RadioGroupVariant = NonNullable<
  VariantProps<typeof radioGroupVariants>['variant']
>

const RadioGroupVariantContext = React.createContext<RadioGroupVariant | null>(
  null,
)

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
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <div className={radioGroupIndicatorVariants({variant})} />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export {
  RadioGroup,
  RadioGroupItem,
  radioGroupIndicatorVariants,
  radioGroupItemVariants,
  radioGroupVariants,
}
