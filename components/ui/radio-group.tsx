'use client'

import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'
import {RadioGroup as RadioGroupPrimitive} from '@base-ui/react/radio-group'
import {Radio as RadioPrimitive} from '@base-ui/react/radio'

import {cn} from '@/lib/utils'

const radioGroupVariants = cva('grid gap-2', {
  variants: {
    variant: {
      default: 'bg-overlay',
      scrim: cn(
        'bg-overlay-scrim h-8 p-1',
        '**:data-[slot=radio-group-indicator]:hidden',
      ),
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const radioGroupItemVariants = cva(
  'aspect-square size-4 shrink-0 rounded-full border text-primary shadow-xs transition-colors outline-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:ring-3',
  {
    variants: {
      variant: {
        default:
          'border-input focus-visible:border-ring focus-visible:ring-ring/50 data-checked:border-primary shadow-none',
        scrim:
          'border-(--ns-hairline) bg-transparent text-(--ns-text-on) shadow-none focus-visible:border-(--ns-border-focus) focus-visible:ring-(--ns-border-focus)/50 data-checked:border-(--ns-text-on)',
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
      scrim: 'bg-(--ns-text-on)',
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

function RadioGroup({className, variant = 'default', ...props}: RadioGroupProps) {
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
