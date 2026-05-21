'use client'

import * as React from 'react'
import {Slider as SliderPrimitive} from '@base-ui/react/slider'
import type {SliderRoot as SliderPrimitiveRoot} from '@base-ui/react/slider'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

type SliderValue = number | readonly number[]
type SliderChangeDetails = SliderPrimitiveRoot.ChangeEventDetails
type SliderCommitDetails = SliderPrimitiveRoot.CommitEventDetails

const sliderRootBase = cn(
  'relative flex w-full touch-none items-center select-none',
  'data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-160',
  'data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
  'data-disabled:opacity-50',
)

const sliderControlBase = cn(
  'relative flex w-full flex-1 items-center',
  'data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto',
  'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
)

const sliderTrackBase = cn(
  'relative grow overflow-hidden rounded-full',
  'data-[orientation=horizontal]:w-full',
  'data-[orientation=vertical]:h-full',
)

const sliderRangeBase = cn(
  'absolute select-none',
  'data-[orientation=horizontal]:h-full',
  'data-[orientation=vertical]:w-full',
)

const sliderThumbBase = cn(
  'relative block shrink-0 rounded-full border bg-background',
  'ring-ring/50 transition-[color,box-shadow] select-none',
  'after:absolute hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden',
  'active:ring-3 disabled:pointer-events-none disabled:opacity-50',
)

const sliderRootVariants = cva(
  sliderRootBase,
  {
    variants: {
      size: {
        sm: 'min-h-20',
        default: 'min-h-24',
        lg: 'min-h-28',
      },
      density: {
        compact: '',
        default: '',
        relaxed: '',
      },
      tone: {
        default: '',
        muted: '',
        destructive: '',
      },
    },
    defaultVariants: {
      size: 'default',
      density: 'default',
      tone: 'default',
    },
  },
)

const sliderFieldVariants = cva('grid w-full', {
  variants: {
    density: {
      compact: 'gap-6',
      default: 'gap-8',
      relaxed: 'gap-12',
    },
    layout: {
      stacked: '',
      inline: cn(
        'grid-cols-[minmax(0,1fr)_minmax(8rem,2fr)]',
        'items-center gap-x-3',
      ),
    },
  },
  defaultVariants: {
    density: 'default',
    layout: 'stacked',
  },
})

const sliderHeaderVariants = cva('flex items-center justify-between gap-8', {
  variants: {
    layout: {
      stacked: '',
      inline: 'contents',
    },
  },
  defaultVariants: {
    layout: 'stacked',
  },
})

const sliderLabelVariants = cva('text-subtle', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-label',
      lg: 'text-sm',
    },
    tone: {
      default: '',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    size: 'default',
    tone: 'default',
  },
})

const sliderValueVariants = cva(
  cn('shrink-0 text-right font-mono tabular-nums text-muted-foreground'),
  {
    variants: {
      size: {
        sm: 'text-[0.6875rem]',
        default: 'text-xs',
        lg: 'text-sm',
      },
      tone: {
        default: '',
        muted: 'text-muted-foreground',
        destructive: 'text-destructive',
      },
      valueDisplay: {
        auto: '',
        hidden: 'sr-only',
        inline: '',
        output: '',
      },
    },
    defaultVariants: {
      size: 'default',
      tone: 'default',
      valueDisplay: 'auto',
    },
  },
)

const sliderControlVariants = cva(
  sliderControlBase,
  {
    variants: {
      density: {
        compact: '',
        default: '',
        relaxed: '',
      },
    },
    defaultVariants: {
      density: 'default',
    },
  },
)

const sliderTrackVariants = cva(
  sliderTrackBase,
  {
    variants: {
      size: {
        sm: cn(
          'data-[orientation=horizontal]:h-2',
          'data-[orientation=vertical]:w-2',
        ),
        default: cn(
          'data-[orientation=horizontal]:h-4',
          'data-[orientation=vertical]:w-4',
        ),
        lg: cn(
          'data-[orientation=horizontal]:h-6',
          'data-[orientation=vertical]:w-6',
        ),
      },
      tone: {
        default: 'bg-muted',
        muted: 'bg-muted/70',
        destructive: 'bg-destructive/15',
      },
    },
    defaultVariants: {
      size: 'default',
      tone: 'default',
    },
  },
)

const sliderRangeVariants = cva(
  sliderRangeBase,
  {
    variants: {
      tone: {
        default: 'bg-inverse',
        muted: 'bg-muted-foreground',
        destructive: 'bg-destructive',
      },
    },
    defaultVariants: {
      tone: 'default',
    },
  },
)

const sliderThumbVariants = cva(
  sliderThumbBase,
  {
    variants: {
      size: {
        sm: 'size-10 after:-inset-8',
        default: 'size-12 after:-inset-8',
        lg: 'size-16 after:-inset-10',
      },
      tone: {
        default: 'border-ring',
        muted: 'border-muted-foreground',
        destructive: 'border-destructive ring-destructive/30',
      },
    },
    defaultVariants: {
      size: 'default',
      tone: 'default',
    },
  },
)

export type SliderVariantProps = VariantProps<typeof sliderRootVariants>
export type SliderFieldVariantProps = VariantProps<typeof sliderFieldVariants> &
  Pick<VariantProps<typeof sliderValueVariants>, 'valueDisplay'>

type SliderContextValue = Required<
  Pick<SliderVariantProps, 'size' | 'density' | 'tone'>
>

const SliderVariantContext = React.createContext<SliderContextValue>({
  size: 'default',
  density: 'default',
  tone: 'default',
})

function useSliderVariants({
  size,
  density,
  tone,
}: SliderVariantProps): SliderContextValue {
  const context = React.useContext(SliderVariantContext)

  return {
    size: size ?? context.size,
    density: density ?? context.density,
    tone: tone ?? context.tone,
  }
}

function getSliderValues(value: SliderValue | undefined, min: number) {
  if (Array.isArray(value)) return value
  if (typeof value === 'number') return [value]

  return [min]
}

function normalizeSliderValue(value: number | readonly number[]) {
  return typeof value === 'number' ? [value] : [...value]
}

function formatSliderValues(
  formattedValues: readonly string[],
  separator: string,
) {
  return formattedValues.join(separator)
}

type BaseSliderRootProps = Omit<
  React.ComponentProps<typeof SliderPrimitive.Root>,
  'onValueChange' | 'onValueCommitted'
>

export type SliderRootProps = BaseSliderRootProps &
  SliderVariantProps & {
    onValueChange?: (value: number[], details: SliderChangeDetails) => void
    onValueCommitted?: (value: number[], details: SliderCommitDetails) => void
  }

function SliderRoot({
  className,
  children,
  defaultValue,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommitted,
  size = 'default',
  density = 'default',
  tone = 'default',
  ...props
}: SliderRootProps) {
  const values = React.useMemo(
    () => getSliderValues(value ?? defaultValue, min),
    [defaultValue, min, value],
  )

  const handleValueChange = React.useCallback(
    (nextValue: number | readonly number[], details: SliderChangeDetails) => {
      onValueChange?.(normalizeSliderValue(nextValue), details)
    },
    [onValueChange],
  )

  const handleValueCommitted = React.useCallback(
    (nextValue: number | readonly number[], details: SliderCommitDetails) => {
      onValueCommitted?.(normalizeSliderValue(nextValue), details)
    },
    [onValueCommitted],
  )

  const contextValue = React.useMemo(
    () => ({size, density, tone}) satisfies SliderContextValue,
    [density, size, tone],
  )

  return (
    <SliderVariantContext.Provider value={contextValue}>
      <SliderPrimitive.Root
        data-slot="slider"
        data-size={size}
        data-density={density}
        data-tone={tone}
        defaultValue={defaultValue}
        value={value}
        min={min}
        max={max}
        onValueChange={onValueChange ? handleValueChange : undefined}
        onValueCommitted={
          onValueCommitted ? handleValueCommitted : undefined
        }
        className={cn(
          sliderRootVariants({size, density, tone}),
          className,
        )}
        {...props}
      >
        {children ?? <SliderDefaultControl values={values} />}
      </SliderPrimitive.Root>
    </SliderVariantContext.Provider>
  )
}

export type SliderControlProps = React.ComponentProps<
  typeof SliderPrimitive.Control
> &
  Pick<SliderVariantProps, 'density'>

function SliderControl({
  className,
  density: densityProp,
  ...props
}: SliderControlProps) {
  const {density} = useSliderVariants({density: densityProp})

  return (
    <SliderPrimitive.Control
      data-slot="slider-control"
      data-density={density}
      className={cn(sliderControlVariants({density}), className)}
      {...props}
    />
  )
}

export type SliderLabelProps = React.ComponentProps<
  typeof SliderPrimitive.Label
> &
  Pick<SliderVariantProps, 'size' | 'tone'>

function SliderLabel({
  className,
  size: sizeProp,
  tone: toneProp,
  ...props
}: SliderLabelProps) {
  const {size, tone} = useSliderVariants({size: sizeProp, tone: toneProp})

  return (
    <SliderPrimitive.Label
      data-slot="slider-label"
      data-size={size}
      data-tone={tone}
      className={cn(sliderLabelVariants({size, tone}), className)}
      {...props}
    />
  )
}

export type SliderValueProps = React.ComponentProps<
  typeof SliderPrimitive.Value
> &
  Pick<SliderVariantProps, 'size' | 'tone'> &
  Pick<SliderFieldVariantProps, 'valueDisplay'> & {
    separator?: string | undefined
  }

function SliderValue({
  className,
  children,
  separator = ', ',
  size: sizeProp,
  tone: toneProp,
  valueDisplay = 'auto',
  ...props
}: SliderValueProps) {
  const {size, tone} = useSliderVariants({size: sizeProp, tone: toneProp})

  return (
    <SliderPrimitive.Value
      data-slot="slider-value"
      data-size={size}
      data-tone={tone}
      data-value-display={valueDisplay}
      className={cn(
        sliderValueVariants({size, tone, valueDisplay}),
        className,
      )}
      {...props}
    >
      {children ??
        ((formattedValues) => formatSliderValues(formattedValues, separator))}
    </SliderPrimitive.Value>
  )
}

export type SliderTrackProps = React.ComponentProps<
  typeof SliderPrimitive.Track
> &
  Pick<SliderVariantProps, 'size' | 'tone'>

function SliderTrack({
  className,
  size: sizeProp,
  tone: toneProp,
  ...props
}: SliderTrackProps) {
  const {size, tone} = useSliderVariants({size: sizeProp, tone: toneProp})

  return (
    <SliderPrimitive.Track
      data-slot="slider-track"
      data-size={size}
      data-tone={tone}
      className={cn(sliderTrackVariants({size, tone}), className)}
      {...props}
    />
  )
}

export type SliderRangeProps = React.ComponentProps<
  typeof SliderPrimitive.Indicator
> &
  Pick<SliderVariantProps, 'tone'>

function SliderRange({
  className,
  tone: toneProp,
  ...props
}: SliderRangeProps) {
  const {tone} = useSliderVariants({tone: toneProp})

  return (
    <SliderPrimitive.Indicator
      data-slot="slider-range"
      data-tone={tone}
      className={cn(sliderRangeVariants({tone}), className)}
      {...props}
    />
  )
}

export type SliderThumbProps = React.ComponentProps<
  typeof SliderPrimitive.Thumb
> &
  Pick<SliderVariantProps, 'size' | 'tone'>

function SliderThumb({
  className,
  size: sizeProp,
  tone: toneProp,
  ...props
}: SliderThumbProps) {
  const {size, tone} = useSliderVariants({size: sizeProp, tone: toneProp})

  return (
    <SliderPrimitive.Thumb
      data-slot="slider-thumb"
      data-size={size}
      data-tone={tone}
      className={cn(sliderThumbVariants({size, tone}), className)}
      {...props}
    />
  )
}

function SliderDefaultControl({values}: {values: readonly number[]}) {
  return (
    <SliderControl>
      <SliderDefaultControlContent values={values} />
    </SliderControl>
  )
}

function SliderDefaultControlContent({values}: {values: readonly number[]}) {
  return (
    <>
      <SliderTrack>
        <SliderRange />
      </SliderTrack>
      {values.map((_, index) => (
        <SliderThumb key={index} index={index} />
      ))}
    </>
  )
}

export type SliderFieldProps = SliderRootProps &
  SliderFieldVariantProps & {
    label: React.ReactNode
    description?: React.ReactNode
    labelClassName?: string | undefined
    valueClassName?: string | undefined
    headerClassName?: string | undefined
    controlClassName?: string | undefined
    descriptionClassName?: string | undefined
    separator?: string | undefined
  }

function SliderField({
  className,
  label,
  description,
  labelClassName,
  valueClassName,
  headerClassName,
  controlClassName,
  descriptionClassName,
  separator,
  size = 'default',
  density = 'default',
  tone = 'default',
  layout = 'stacked',
  valueDisplay = 'auto',
  children,
  defaultValue,
  value,
  min = 0,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SliderFieldProps) {
  const generatedDescriptionId = React.useId()
  const descriptionId = description
    ? `${generatedDescriptionId}-description`
    : undefined
  const describedBy = [ariaDescribedBy, descriptionId]
    .filter(Boolean)
    .join(' ') || undefined
  const values = React.useMemo(
    () => getSliderValues(value ?? defaultValue, min),
    [defaultValue, min, value],
  )

  return (
    <SliderRoot
      data-slot="slider-field"
      size={size}
      density={density}
      tone={tone}
      defaultValue={defaultValue}
      value={value}
      min={min}
      aria-describedby={describedBy}
      className={cn(sliderFieldVariants({density, layout}), className)}
      {...props}
    >
      <div
        data-slot="slider-field-header"
        data-layout={layout}
        className={cn(sliderHeaderVariants({layout}), headerClassName)}
      >
        <SliderLabel className={labelClassName}>{label}</SliderLabel>
        <SliderValue
          valueDisplay={valueDisplay}
          separator={separator}
          className={valueClassName}
        />
      </div>
      {description ? (
        <p
          id={descriptionId}
          data-slot="slider-description"
          className={cn(
            'text-xs text-muted-foreground',
            layout === 'inline' && 'col-span-full',
            descriptionClassName,
          )}
        >
          {description}
        </p>
      ) : null}
      <SliderControl
        className={cn(layout === 'inline' && 'min-w-0', controlClassName)}
      >
        {children ?? (
          <SliderDefaultControlContent values={values} />
        )}
      </SliderControl>
    </SliderRoot>
  )
}

export type SliderControlledProps = SliderFieldProps

const SliderControlled = SliderField

type SliderComponent = typeof SliderRoot & {
  Root: typeof SliderRoot
  Field: typeof SliderField
  Controlled: typeof SliderControlled
  Label: typeof SliderLabel
  Value: typeof SliderValue
  Control: typeof SliderControl
  Track: typeof SliderTrack
  Range: typeof SliderRange
  Thumb: typeof SliderThumb
}

const Slider = Object.assign(SliderRoot, {
  Root: SliderRoot,
  Field: SliderField,
  Controlled: SliderControlled,
  Label: SliderLabel,
  Value: SliderValue,
  Control: SliderControl,
  Track: SliderTrack,
  Range: SliderRange,
  Thumb: SliderThumb,
}) satisfies SliderComponent

export {
  Slider,
  SliderRoot,
  SliderField,
  SliderControlled,
  SliderLabel,
  SliderValue,
  SliderControl,
  SliderTrack,
  SliderRange,
  SliderThumb,
  sliderRootVariants,
  sliderFieldVariants,
  sliderLabelVariants,
  sliderValueVariants,
  sliderControlVariants,
  sliderTrackVariants,
  sliderRangeVariants,
  sliderThumbVariants,
}
